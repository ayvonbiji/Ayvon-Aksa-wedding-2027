"""
Synthesise an original music-box arrangement of Pachelbel's Canon in D
(the composition is in the public domain). Output: public/audio/canon-in-d-music-box.mp3
Run:  python3 scripts/make-music.py   (needs numpy + ffmpeg)
"""
import numpy as np, subprocess, wave, os, tempfile

SR = 44100
BPM = 64
beat = 60 / BPM

def hz(n):  # note name -> frequency
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    pitch, octave = n[:-1], int(n[-1])
    midi = 12 * (octave + 1) + names[pitch]
    return 440 * 2 ** ((midi - 69) / 12)

def tone(freq, dur, amp):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 3.2) * (1 - np.exp(-t * 400))
    s = (np.sin(2*np.pi*freq*t) + 0.35*np.sin(2*np.pi*freq*2.0*t)*np.exp(-t*6)
         + 0.12*np.sin(2*np.pi*freq*3.01*t)*np.exp(-t*9) + 0.05*np.sin(2*np.pi*freq*4.2*t)*np.exp(-t*14))
    return amp * env * s

chords = [['D3','F#3','A3','D4'], ['A2','E3','A3','C#4'], ['B2','F#3','B3','D4'], ['F#2','C#3','F#3','A3'],
          ['G2','D3','G3','B3'], ['D3','F#3','A3','D4'], ['G2','D3','G3','B3'], ['A2','E3','A3','C#4']]
melodies = [
    ['F#5','E5','D5','C#5','B4','A4','B4','C#5'],
    ['D5','C#5','B4','A4','G4','F#4','G4','E4'],
    ['D4','F#4','A4','G4','F#4','D4','F#4','E4', 'D4','B3','D4','A4','G4','B4','A4','G4'],
    ['F#4','D4','E4','C#5','D5','F#5','A5','A4', 'B4','G4','A4','F#4','D4','D5','D5','C#5'],
]
cycles = len(melodies) + 2
total = cycles * 8 * 2 * beat + 6
out = np.zeros(int(SR * total))

def add(start, sig):
    i = int(start * SR); out[i:i+len(sig)] += sig[:len(out)-i]

t0 = 1.0
for c in range(cycles):
    mel = melodies[c % len(melodies)] if c < len(melodies) else melodies[c - len(melodies)]
    for k, ch in enumerate(chords):
        base = t0 + (c*8 + k) * 2 * beat
        # gentle arpeggio (4 eighth notes per beat pair)
        for j, n in enumerate(ch):
            add(base + j * beat / 2, tone(hz(n), 3.0, 0.16))
        # melody
        per = len(mel) // 8
        for j in range(per):
            n = mel[k*per + j]
            add(base + j * (2*beat/per), tone(hz(n), 2.6, 0.26 if c else 0.0))
# simple reverb
ir_len = int(SR * 2.2)
rng = np.random.default_rng(7)
ir = rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len)/SR * 3.0) * 0.012
ir[0] = 1.0
wet = np.convolve(out, ir)[:len(out)] if False else np.fft.irfft(np.fft.rfft(out, n=len(out)+ir_len) * np.fft.rfft(ir, n=len(out)+ir_len))[:len(out)]
mix = 0.75*out + 0.5*wet
fade = int(SR*4); mix[-fade:] *= np.linspace(1, 0, fade)
mix /= np.max(np.abs(mix)) * 1.15
pcm = (mix * 32767).astype(np.int16)
tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
dst = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'canon-in-d-music-box.mp3')
subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-codec:a','libmp3lame','-b:a','96k',dst], check=True)
os.remove(tmp)
print('wrote', os.path.normpath(dst), f'{total:.0f}s')
