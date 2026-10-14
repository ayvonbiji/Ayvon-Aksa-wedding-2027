import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/fonts';
import '../styles/global.css';
import '../styles/memories.css';
import { SvgDefs } from '../components/Art';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import {
  adminDelete, adminIsOwner, adminList, adminSetStatus, adminSetUploadsOpen, adminSettings,
  memoriesConfigured, refresh, signIn, checkSetup, MemoryError, type AdminMemory, type Session, type SetupStep,
} from '../lib/memories';

/**
 * Private owner page. Access is decided by the DATABASE (Supabase Auth user
 * whose e-mail is in memory_admins). Nothing here is secret: a visitor who
 * opens this page without valid owner credentials can see and do nothing.
 */
const KEY = 'aa-memories-session';
const TABS = ['pending', 'approved', 'rejected', 'removed'] as const;
type Tab = (typeof TABS)[number];

const loadSession = (): Session | null => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
};

function Manage() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [owner, setOwner] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('pending');
  const [rows, setRows] = useState<AdminMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<AdminMemory | null>(null);

  const keep = (s: Session | null) => {
    setSession(s);
    try {
      if (s) sessionStorage.setItem(KEY, JSON.stringify(s));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  /** Valid access token (refreshes when close to expiry). */
  const token = useCallback(async () => {
    if (!session) throw new MemoryError('auth', 'Please sign in.');
    if (session.expires_at - Date.now() > 60_000) return session.access_token;
    const s = await refresh(session);
    keep({ ...s, email: s.email || session.email });
    return s.access_token;
  }, [session]);

  const reload = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const t = await token();
      setRows(await adminList(t, tab));
      setSelected(new Set());
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not load photos.');
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const t = await token();
        const ok = await adminIsOwner(t);
        setOwner(ok);
        if (ok) setOpen((await adminSettings(t)).uploads_open);
      } catch {
        keep(null);
      }
    })();
  }, [session?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (owner) reload();
  }, [owner, tab, reload]);

  const act = async (ids: string[], status: 'approved' | 'rejected' | 'pending') => {
    if (!ids.length) return;
    try {
      await adminSetStatus(await token(), ids, status, session!.email);
      setMsg(`${ids.length} photo${ids.length > 1 ? 's' : ''} ${status === 'pending' ? 'moved back to review' : status}.`);
      await reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Action failed.');
    }
  };

  const remove = async (list: AdminMemory[]) => {
    if (!list.length || !confirm(`Permanently delete ${list.length} photo${list.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
    try {
      await adminDelete(await token(), list);
      setMsg(`${list.length} photo${list.length > 1 ? 's' : ''} deleted permanently.`);
      setPreview(null);
      await reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  if (!memoriesConfigured()) {
    return (
      <Shell>
        <div className="manage-card manage-card--wide">
          <h1 className="manage-title">Connect photo uploads</h1>
          <p>Guest uploads are built in, but this website is not connected to its photo storage yet.</p>
          <SetupPanel autoRun />
        </div>
      </Shell>
    );
  }

  if (!session || owner === false) {
    return (
      <Shell>
        <SignIn
          token={session?.access_token}
          denied={owner === false ? session?.email : undefined}
          onSignedIn={(s) => {
            setOwner(null);
            keep(s);
          }}
          onSignOut={() => {
            setOwner(null);
            keep(null);
          }}
        />
      </Shell>
    );
  }

  if (owner === null) return <Shell><p className="manage-status">Checking access…</p></Shell>;

  const sel = rows.filter((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  return (
    <Shell>
      <div className="manage-bar">
        <div>
          <h1 className="manage-title">Manage memories</h1>
          <p className="manage-who">Signed in as {session.email}</p>
        </div>
        <div className="manage-bar__right">
          <label className="check">
            <input
              type="checkbox"
              checked={Boolean(open)}
              onChange={async (e) => {
                const v = e.target.checked;
                setOpen(v); // optimistic; reverted below if the server refuses
                try {
                  await adminSetUploadsOpen(await token(), v);
                  setMsg(v ? 'Guest uploads are open.' : 'Guest uploads are closed.');
                } catch (err) {
                  setOpen(!v);
                  setMsg(err instanceof Error ? err.message : 'Could not change setting.');
                }
              }}
            />
            <span>Guest uploads open</span>
          </label>
          <button type="button" className="btn btn--ghost" onClick={() => keep(null)}>Sign out</button>
        </div>
      </div>
      <SetupPanel token={session.access_token} compact />

      <div className="manage-tabs" role="tablist" aria-label="Photo status">
        {TABS.map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button type="button" className="btn btn--ghost manage-refresh" onClick={reload} disabled={loading}>
          <Icon name="refresh" /> Refresh
        </button>
      </div>

      <p className="manage-status" role="status">{loading ? 'Loading…' : msg}</p>

      {rows.length > 0 && (
        <div className="manage-bulk">
          <label className="check">
            <input type="checkbox" checked={sel.length === rows.length} onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())} />
            <span>Select all ({rows.length})</span>
          </label>
          {tab !== 'approved' && tab !== 'removed' && <button type="button" className="btn btn--solid" disabled={!sel.length} onClick={() => act(sel.map((r) => r.id), 'approved')}>Approve selected</button>}
          {tab !== 'rejected' && tab !== 'removed' && <button type="button" className="btn btn--pill" disabled={!sel.length} onClick={() => act(sel.map((r) => r.id), 'rejected')}>Reject selected</button>}
          <button type="button" className="btn btn--ghost manage-danger" disabled={!sel.length} onClick={() => remove(sel)}>Delete selected</button>
        </div>
      )}

      {!loading && rows.length === 0 && <p className="manage-empty">No {tab} photos.</p>}

      <ul className="manage-grid">
        {rows.map((r) => (
          <li key={r.id} className={`manage-item ${selected.has(r.id) ? 'is-selected' : ''}`}>
            <label className="manage-item__select">
              <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} aria-label="Select photo" />
            </label>
            <button type="button" className="manage-item__img" onClick={() => setPreview(r)} aria-label="View larger">
              {r.url ? <img src={r.url} alt={r.caption || 'Guest photo'} loading="lazy" /> : <span className="placeholder">No preview</span>}
            </button>
            <div className="manage-item__meta">
              {r.caption && <p className="manage-item__caption">“{r.caption}”</p>}
              <p>
                {r.guest_name ? <>{r.guest_name} {r.show_name ? <em>(name public)</em> : <em>(name private)</em>}</> : <em>No name</em>}
              </p>
              <p className="manage-item__date">{new Date(r.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · {(r.byte_size / 1048576).toFixed(1)} MB</p>
            </div>
            <div className="manage-item__actions">
              {r.status !== 'approved' && r.status !== 'removed' && <button type="button" className="btn btn--solid" onClick={() => act([r.id], 'approved')}>Approve</button>}
              {r.status !== 'rejected' && r.status !== 'removed' && <button type="button" className="btn btn--pill" onClick={() => act([r.id], 'rejected')}>Reject</button>}
              <button type="button" className="btn btn--ghost manage-danger" onClick={() => remove([r])}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {preview && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setPreview(null)} onKeyDown={(e) => e.key === 'Escape' && setPreview(null)}>
          <button type="button" className="lightbox__close" onClick={() => setPreview(null)} aria-label="Close" autoFocus><Icon name="close" /></button>
          <figure className="lightbox__figure">
            {preview.url && <img src={preview.url} alt={preview.caption || 'Guest photo'} />}
            <figcaption><span className="lightbox__caption">{preview.caption}</span></figcaption>
          </figure>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mem-page manage">
      <SvgDefs />
      <header className="mem-top">
        <a href={import.meta.env.BASE_URL} className="mem-top__back"><Icon name="left" /> Wedding website</a>
        <Logo variant="compact" className="mem-top__logo" decorative />
      </header>
      <main className="manage-main">{children}</main>
    </div>
  );
}

function SignIn({ onSignedIn, denied, onSignOut, token }: { onSignedIn: (s: Session) => void; denied?: string; onSignOut: () => void; token?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (denied) {
    return (
      <div className="manage-card">
        <Icon name="lock" className="manage-card__icon" />
        <h1 className="manage-title">No access</h1>
        <p><strong>{denied}</strong> is not an owner of this album. Ask the site owner to add this e-mail to <code>memory_admins</code>.</p>
        <button type="button" className="btn btn--pill" onClick={onSignOut}>Sign in with another account</button>
        <SetupPanel token={token} />
      </div>
    );
  }
  return (
    <form
      className="manage-card"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr('');
        try {
          onSignedIn(await signIn(email.trim(), password));
        } catch (e2) {
          setErr(e2 instanceof Error ? e2.message : 'Sign-in failed.');
        } finally {
          setBusy(false);
        }
      }}
    >
      <Icon name="lock" className="manage-card__icon" />
      <h1 className="manage-title">Owner sign-in</h1>
      <p>Only Ayvon &amp; Aksa can review guest photos.</p>
      <label className="field">
        <span className="label">E-mail</span>
        <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="field">
        <span className="label">Password</span>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {err && <p className="upload-notice upload-notice--error" role="alert">{err}</p>}
      <button type="submit" className="btn btn--solid" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <SetupPanel />
    </form>
  );
}

/** Lists each requirement for uploads with a ✓ / ✗ and how to fix it. */
function SetupPanel({ token, autoRun = false, compact = false }: { token?: string; autoRun?: boolean; compact?: boolean }) {
  const [steps, setSteps] = useState<SetupStep[] | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      setSteps(await checkSetup(token));
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (autoRun) run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`setup ${compact ? 'setup--compact' : ''}`}>
      {!steps ? (
        <button type="button" className="btn btn--ghost" onClick={(e) => (e.preventDefault(), run())} disabled={busy}>
          <Icon name="check" /> {busy ? 'Checking…' : 'Check setup'}
        </button>
      ) : (
        <ol className="setup__list" aria-label="Upload setup checklist">
          {steps.map((st) => (
            <li key={st.label} className={st.ok === true ? 'is-ok' : st.ok === false ? 'is-bad' : 'is-wait'}>
              <span className="setup__mark" aria-hidden="true">{st.ok === true ? '✓' : st.ok === false ? '✗' : '…'}</span>
              <span>
                <strong>{st.label}</strong>
                <span className="sr-only">{st.ok === true ? ' — done' : st.ok === false ? ' — needs attention' : ' — not checked yet'}</span>
                {st.ok !== true && <span className="setup__help">{st.help}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Manage />
  </StrictMode>,
);
