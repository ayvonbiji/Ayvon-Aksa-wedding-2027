-- ════════════════════════════════════════════════════════════════════════════
--  Ayvon & Aksa — "Our Wedding Memories" guest photo uploads
--  Run once in Supabase → SQL Editor (safe to re-run).
--
--  Security model
--  • Guests (anon role) can NOT read or write tables directly. They only call
--    the SECURITY DEFINER functions below, which validate input, enforce rate
--    limits and reserve one storage path per photo.
--  • Storage bucket is PRIVATE. A guest may upload only into a path that was
--    reserved for them in the last 30 minutes. Visitors can only obtain
--    (signed) links for APPROVED photos.
--  • Owners are Supabase Auth users whose e-mail is listed in memory_admins.
--    Only they can see pending photos, approve, reject or delete.
--  • No service-role key is ever needed in the website.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Settings (one row; edit in Table Editor to change limits) ──────────────
create table if not exists public.memory_settings (
  id                integer primary key default 1 check (id = 1),
  uploads_open      boolean not null default true,
  max_bytes         integer not null default 10485760,  -- 10 MB per stored photo
  max_per_ip_hour   integer not null default 40,
  max_per_ip_day    integer not null default 200,
  max_total_day     integer not null default 4000,
  ip_salt           text    not null default gen_random_uuid()::text
);
insert into public.memory_settings (id) values (1) on conflict (id) do nothing;

-- ── Owners allowed to moderate (lower-case e-mails) ────────────────────────
create table if not exists public.memory_admins (
  email text primary key check (email = lower(email) and position('@' in email) > 1)
);

-- ── Photos ─────────────────────────────────────────────────────────────────
do $$ begin
  create type public.memory_status as enum ('uploading', 'pending', 'approved', 'rejected', 'removed');
exception when duplicate_object then null; end $$;

create table if not exists public.memories (
  id                uuid primary key default gen_random_uuid(),
  storage_path      text not null unique,
  status            public.memory_status not null default 'uploading',
  guest_name        text check (char_length(guest_name) <= 60),
  caption           text check (char_length(caption) <= 200),
  show_name         boolean not null default false,      -- guest agreed to show their name
  mime_type         text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  byte_size         integer not null check (byte_size > 0),
  width             integer check (width between 1 and 12000),
  height            integer check (height between 1 and 12000),
  content_hash      text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  ip_hash           text,                                -- salted hash, used only for rate limits
  delete_token_hash text not null,
  created_at        timestamptz not null default now(),
  uploaded_at       timestamptz,
  reviewed_at       timestamptz,
  reviewed_by       text
);
create unique index if not exists memories_no_duplicates
  on public.memories (content_hash) where status in ('uploading', 'pending', 'approved');
create index if not exists memories_status_created on public.memories (status, created_at desc);
create index if not exists memories_ip_created on public.memories (ip_hash, created_at desc);

alter table public.memories        enable row level security;
alter table public.memory_admins   enable row level security;
alter table public.memory_settings enable row level security;

revoke all on public.memories, public.memory_admins, public.memory_settings from anon, authenticated;

-- ── Helpers ────────────────────────────────────────────────────────────────
create or replace function public.is_memory_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(auth.role(), '') = 'authenticated'
     and exists (select 1 from public.memory_admins a
                 where a.email = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

create or replace function public.memory_client_ip_hash()
returns text language plpgsql stable security definer set search_path = public as $$
declare
  hdr json;
  ip  text;
  salt text;
begin
  begin
    hdr := nullif(current_setting('request.headers', true), '')::json;
  exception when others then hdr := null;
  end;
  ip := split_part(coalesce(hdr ->> 'cf-connecting-ip', hdr ->> 'x-forwarded-for', hdr ->> 'x-real-ip', 'unknown'), ',', 1);
  select ip_salt into salt from public.memory_settings where id = 1;
  return encode(sha256(convert_to(salt || '|' || trim(ip), 'UTF8')), 'hex');
end $$;

create or replace function public.memory_clean_text(t text, max_len int)
returns text language sql immutable as $$
  select nullif(left(trim(regexp_replace(coalesce(t, ''), '[[:cntrl:]<>]', '', 'g')), max_len), '');
$$;

-- Storage-policy helpers (SECURITY DEFINER so policies can see the table)
create or replace function public.memory_slot_open(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memories m
                 where m.storage_path = p_path and m.status = 'uploading'
                   and m.created_at > now() - interval '30 minutes');
$$;
create or replace function public.memory_is_public(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memories m where m.storage_path = p_path and m.status = 'approved');
$$;
create or replace function public.memory_is_removable(p_path text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memories m where m.storage_path = p_path and m.status = 'removed');
$$;

-- ── Guest: reserve an upload slot ──────────────────────────────────────────
create or replace function public.begin_memory_upload(
  p_mime text, p_bytes integer, p_width integer, p_height integer, p_hash text,
  p_guest_name text default null, p_caption text default null, p_show_name boolean default false
) returns table (id uuid, path text, delete_token text)
language plpgsql volatile security definer set search_path = public as $$
declare
  s     public.memory_settings;
  iph   text := public.memory_client_ip_hash();
  newid uuid := gen_random_uuid();
  tok   text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  ext   text;
  pth   text;
begin
  select * into s from public.memory_settings where memory_settings.id = 1;
  if not s.uploads_open then raise exception 'uploads_closed' using errcode = 'P0001'; end if;

  ext := case p_mime when 'image/jpeg' then 'jpg' when 'image/png' then 'png' when 'image/webp' then 'webp' end;
  if ext is null then raise exception 'unsupported_type' using errcode = 'P0001'; end if;
  if p_bytes is null or p_bytes <= 0 or p_bytes > s.max_bytes then raise exception 'too_large' using errcode = 'P0001'; end if;
  if p_width is null or p_height is null or p_width < 1 or p_height < 1 or p_width > 12000 or p_height > 12000 then
    raise exception 'bad_dimensions' using errcode = 'P0001';
  end if;
  if p_hash is null or p_hash !~ '^[0-9a-f]{64}$' then raise exception 'bad_hash' using errcode = 'P0001'; end if;

  if (select count(*) from public.memories m where m.ip_hash = iph and m.created_at > now() - interval '1 hour') >= s.max_per_ip_hour
     or (select count(*) from public.memories m where m.ip_hash = iph and m.created_at > now() - interval '1 day') >= s.max_per_ip_day
     or (select count(*) from public.memories m where m.created_at > now() - interval '1 day') >= s.max_total_day then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.memories m where m.content_hash = p_hash and m.status in ('uploading', 'pending', 'approved')) then
    raise exception 'duplicate' using errcode = 'P0001';
  end if;

  pth := 'guests/' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY-MM-DD') || '/' || newid::text || '.' || ext;

  insert into public.memories (id, storage_path, status, guest_name, caption, show_name, mime_type, byte_size,
                               width, height, content_hash, ip_hash, delete_token_hash)
  values (newid, pth, 'uploading',
          public.memory_clean_text(p_guest_name, 60), public.memory_clean_text(p_caption, 200),
          coalesce(p_show_name, false), p_mime, p_bytes, p_width, p_height, p_hash, iph,
          encode(sha256(convert_to(tok, 'UTF8')), 'hex'));

  return query select newid, pth, tok;
end $$;

-- ── Guest: confirm the file arrived → pending review ───────────────────────
create or replace function public.finish_memory_upload(p_id uuid, p_token text)
returns text language plpgsql volatile security definer set search_path = public, storage as $$
declare
  m   public.memories;
  obj record;
  maxb integer;
begin
  select * into m from public.memories where memories.id = p_id;
  if m.id is null or m.delete_token_hash <> encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex') then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if m.status <> 'uploading' then return m.status::text; end if;

  select o.name, o.metadata into obj from storage.objects o
   where o.bucket_id = 'wedding-memories' and o.name = m.storage_path;
  if obj.name is null then raise exception 'file_missing' using errcode = 'P0001'; end if;

  select max_bytes into maxb from public.memory_settings where id = 1;
  if coalesce((obj.metadata ->> 'size')::bigint, 0) > maxb
     or coalesce(obj.metadata ->> 'mimetype', m.mime_type) <> m.mime_type then
    update public.memories set status = 'removed' where id = m.id;
    raise exception 'file_rejected' using errcode = 'P0001';
  end if;

  update public.memories set status = 'pending', uploaded_at = now() where id = m.id;
  return 'pending';
end $$;

-- ── Guest: remove their own photo (token from upload) ──────────────────────
create or replace function public.remove_my_memory(p_id uuid, p_token text)
returns text language plpgsql volatile security definer set search_path = public as $$
declare pth text;
begin
  update public.memories set status = 'removed', reviewed_at = now(), reviewed_by = 'guest'
   where id = p_id and delete_token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
   returning storage_path into pth;
  if pth is null then raise exception 'not_found' using errcode = 'P0001'; end if;
  return pth;  -- the caller then deletes the file (allowed for 'removed' rows)
end $$;

-- ── Public: approved photos, newest first, paginated ───────────────────────
create or replace function public.list_approved_memories(p_limit integer default 24, p_before timestamptz default null)
returns table (id uuid, path text, caption text, guest_name text, created_at timestamptz, width integer, height integer)
language sql stable security definer set search_path = public as $$
  select m.id, m.storage_path, m.caption,
         case when m.show_name then m.guest_name end,
         m.created_at, m.width, m.height
    from public.memories m
   where m.status = 'approved' and (p_before is null or m.created_at < p_before)
   order by m.created_at desc
   limit least(greatest(coalesce(p_limit, 24), 1), 60);
$$;

-- Is upload open? (lets the page show a friendly message)
create or replace function public.memory_uploads_open()
returns boolean language sql stable security definer set search_path = public as $$
  select uploads_open from public.memory_settings where id = 1;
$$;

revoke all on function public.begin_memory_upload(text, integer, integer, integer, text, text, text, boolean),
                       public.finish_memory_upload(uuid, text), public.remove_my_memory(uuid, text),
                       public.list_approved_memories(integer, timestamptz), public.memory_uploads_open(),
                       public.is_memory_admin(), public.memory_client_ip_hash(),
                       public.memory_slot_open(text), public.memory_is_public(text), public.memory_is_removable(text)
  from public;
grant execute on function public.begin_memory_upload(text, integer, integer, integer, text, text, text, boolean),
                          public.finish_memory_upload(uuid, text), public.remove_my_memory(uuid, text),
                          public.list_approved_memories(integer, timestamptz), public.memory_uploads_open(),
                          public.is_memory_admin(),
                          public.memory_slot_open(text), public.memory_is_public(text), public.memory_is_removable(text)
  to anon, authenticated;

-- ── Owner access (RLS) ─────────────────────────────────────────────────────
grant select, delete on public.memories to authenticated;
grant update (status, reviewed_at, reviewed_by, caption, guest_name, show_name) on public.memories to authenticated;
grant select on public.memory_settings to authenticated;
grant update (uploads_open, max_bytes, max_per_ip_hour, max_per_ip_day, max_total_day) on public.memory_settings to authenticated;

drop policy if exists "owners read memories"   on public.memories;
drop policy if exists "owners update memories" on public.memories;
drop policy if exists "owners delete memories" on public.memories;
drop policy if exists "owners read settings"   on public.memory_settings;
drop policy if exists "owners update settings" on public.memory_settings;
create policy "owners read memories"   on public.memories for select to authenticated using (public.is_memory_admin());
create policy "owners update memories" on public.memories for update to authenticated using (public.is_memory_admin()) with check (public.is_memory_admin());
create policy "owners delete memories" on public.memories for delete to authenticated using (public.is_memory_admin());
create policy "owners read settings"   on public.memory_settings for select to authenticated using (public.is_memory_admin());
create policy "owners update settings" on public.memory_settings for update to authenticated using (public.is_memory_admin()) with check (public.is_memory_admin());

-- ── Storage bucket (private) & policies ────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wedding-memories', 'wedding-memories', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "memories: guests upload to reserved slot" on storage.objects;
drop policy if exists "memories: view approved"                 on storage.objects;
drop policy if exists "memories: delete removed"                on storage.objects;
drop policy if exists "memories: owners read"                   on storage.objects;
drop policy if exists "memories: owners delete"                 on storage.objects;

create policy "memories: guests upload to reserved slot" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'wedding-memories' and public.memory_slot_open(name));

-- (removed photos stay readable only until their file is deleted — Postgres
--  needs read access for the guest's delete to succeed)
create policy "memories: view approved" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'wedding-memories' and (public.memory_is_public(name) or public.memory_is_removable(name)));

create policy "memories: delete removed" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'wedding-memories' and public.memory_is_removable(name));

create policy "memories: owners read" on storage.objects
  for select to authenticated
  using (bucket_id = 'wedding-memories' and public.is_memory_admin());

create policy "memories: owners delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wedding-memories' and public.is_memory_admin());

-- ════════════════════════════════════════════════════════════════════════════
--  LAST STEP — add yourself as an owner (use the e-mail of the Supabase Auth
--  user you created under Authentication → Users):
--
--    insert into public.memory_admins (email) values ('you@example.com');
-- ════════════════════════════════════════════════════════════════════════════
