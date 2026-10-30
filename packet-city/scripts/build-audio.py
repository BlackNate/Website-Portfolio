"""Line a lesson's narration clips up with its scenes.

Usage:  python3 scripts/build-audio.py m1_l1

Needs ffmpeg, ffprobe and the pocketsphinx Python package
(`pip install pocketsphinx`; its English model is included).

Inputs
  audio/<lesson>_<beat>.mp3        one clip per scene, from ElevenLabs
  notes/<lesson>_elevenlabs.txt    the text that was spoken, one paragraph per line
  notes/<lesson>.md                the script, whose [cue: name] markers give the cue order

What it does
1. Force-aligns each clip against its text to find when every line starts
   and ends.
2. Where the text asked for a long pause (<break> tags adding up to 1.5 s or
   more) and the clip is shorter than that, inserts the missing silence.
3. Writes the cue times into src/scenes/<lesson>_<beat>.meta. A line's cue
   waits until the next line starts; the last cue holds until the clip ends.
   If a scene waits on '<cue>-said', that event is set to the moment the
   line marked <cue> finishes.
4. Joins the clips into audio/<lesson>.mp3, each one starting with its scene.

Check the printed table, then open the editor. A cue the animation reaches
late shows up as a warning in the editor's console.
"""
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from pocketsphinx import Decoder

ROOT = Path(__file__).resolve().parent.parent
TAIL = 0.6        # seconds after each clip before the next scene starts
LEAD = 0.12       # start a line's animation this much before its first word
LONG_PAUSE = 1.5  # requested pauses at least this long are enforced
FPS = 60          # scene lengths are rounded to whole frames at this rate
RATE = 16000


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def scene_cues(lesson):
    """Cue names per scene, in order, from the [cue: ...] markers in the script."""
    text = (ROOT / 'notes' / f'{lesson}.md').read_text()
    cues = {}
    for match in re.finditer(r'^## Beat .*?`(\S+?)`\n(.*?)(?=^## |\Z)', text, re.S | re.M):
        names = re.findall(r'\[cue: ([^\]]+)\]', match.group(2))
        if names:
            cues[match.group(1)] = names
    return cues


def spoken_lines(lesson):
    """Spoken paragraphs per scene, each with the pause requested after it."""
    text = (ROOT / 'notes' / f'{lesson}_elevenlabs.txt').read_text()
    beats = {}
    for match in re.finditer(r'=== \d+\. .*?\(save as (\S+)\) ===\n(.*?)(?====|\Z)', text, re.S):
        lines = []
        for paragraph in match.group(2).split('\n\n'):
            pause = sum(float(t) for t in re.findall(r'<break time="([\d.]+)s"', paragraph))
            words = re.sub(r'<break[^>]*/>', '', paragraph).strip()
            if words:
                lines.append({'text': words, 'pause': pause})
        beats[match.group(1)] = lines
    return beats


def words_of(text):
    text = text.lower().replace('-', ' ').replace('…', ' ')
    return re.findall(r"[a-z']+", text)


def align(decoder, wav, lines):
    """Start and end time of each line, from word-level forced alignment."""
    with wave.open(str(wav), 'rb') as w:
        audio = w.readframes(w.getnframes())
    vocab, owner = [], []
    for i, line in enumerate(lines):
        for word in words_of(line['text']):
            if decoder.lookup_word(word):
                vocab.append(word)
                owner.append(i)
    decoder.set_align_text(' '.join(vocab))
    decoder.start_utt(); decoder.process_raw(audio, full_utt=True); decoder.end_utt()
    decoder.set_alignment()
    decoder.start_utt(); decoder.process_raw(audio, full_utt=True); decoder.end_utt()
    found = [w for w in decoder.get_alignment() if not w.name.startswith('<') and w.name != 'sil']
    if len(found) != len(vocab):
        sys.exit(f'Alignment failed for {wav.name}: {len(found)} words found, {len(vocab)} expected')
    spans = []
    for i in range(len(lines)):
        mine = [w for w, o in zip(found, owner) if o == i]
        spans.append((mine[0].start / 100, (mine[-1].start + mine[-1].duration) / 100))
    return spans


def main(lesson):
    cues = scene_cues(lesson)
    beats = spoken_lines(lesson)
    decoder = Decoder(samprate=RATE, bestpath=False)
    tmp = Path(tempfile.mkdtemp())
    offset, clips, delays = 0.0, [], []

    for scene, lines in beats.items():
        names = cues[scene]
        if len(names) != len(lines):
            sys.exit(f'{scene}: {len(names)} cues in the script but {len(lines)} spoken lines')
        wav = tmp / f'{scene}.wav'
        run('ffmpeg', '-y', '-i', str(ROOT / 'audio' / f'{scene}.mp3'), '-ar', str(RATE), '-ac', '1', str(wav))
        with wave.open(str(wav), 'rb') as w:
            total = w.getnframes() / RATE
        spans = align(decoder, wav, lines)

        # Enforce long pauses the text asked for but the clip left out.
        pieces, shift, cursor, timed = [], 0.0, 0.0, []
        for i, ((start, end), line) in enumerate(zip(spans, lines)):
            timed.append((start + shift, end + shift))
            next_start = spans[i + 1][0] if i + 1 < len(spans) else total
            missing = line['pause'] - (next_start - end)
            if line['pause'] >= LONG_PAUSE and missing > 0.25:
                cut = end + 0.1
                pieces.append((cursor, cut, missing))
                cursor, shift = cut, shift + missing
        pieces.append((cursor, total, 0.0))
        clip = tmp / f'{scene}_timed.wav'
        parts = [f'[0]atrim={a}:{b},asetpts=PTS-STARTPTS,apad=pad_dur={pad}[p{i}];'
                 for i, (a, b, pad) in enumerate(pieces)]
        joined = ''.join(f'[p{i}]' for i in range(len(pieces)))
        run('ffmpeg', '-y', '-i', str(ROOT / 'audio' / f'{scene}.mp3'), '-filter_complex',
            ''.join(parts) + f'{joined}concat=n={len(pieces)}:v=0:a=1[out]', '-map', '[out]', str(clip))
        length = total + shift

        events = {}
        for i, name in enumerate(names):
            events[name] = timed[i + 1][0] - LEAD if i + 1 < len(names) else length + TAIL
        source = (ROOT / 'src' / 'scenes' / f'{scene}.tsx').read_text()
        for name, (start, end) in zip(names, timed):
            if f"'{name}-said'" in source:
                events[f'{name}-said'] = end + 0.2

        print(f'\n{scene}  ({length:.1f}s, starts at {offset:.2f}s in the lesson)')
        for i, name in enumerate(names):
            print(f'  {name:<14} line {timed[i][0]:6.2f}-{timed[i][1]:6.2f}s  "{lines[i]["text"][:48]}"')
        for name, t in events.items():
            if name.endswith('-said'):
                print(f'  {name:<14} {t:6.2f}s')
        if shift:
            print(f'  inserted {shift:.1f}s of silence for requested pauses')

        meta_path = ROOT / 'src' / 'scenes' / f'{scene}.meta'
        meta = json.loads(meta_path.read_text()) if meta_path.exists() else {'version': 0}
        meta['timeEvents'] = [{'name': n, 'targetTime': round(t, 3)}
                              for n, t in sorted(events.items(), key=lambda e: e[1])]
        meta_path.write_text(json.dumps(meta, indent=2) + '\n')

        clips.append(clip)
        delays.append(int(round(offset * 1000)))
        offset += round((length + TAIL) * FPS) / FPS

    inputs = [arg for clip in clips for arg in ('-i', str(clip))]
    filters = ''.join(f'[{i}]adelay={d}|{d}[a{i}];' for i, d in enumerate(delays))
    filters += ''.join(f'[a{i}]' for i in range(len(clips)))
    filters += f'amix=inputs={len(clips)}:normalize=0[out]'
    out = ROOT / 'audio' / f'{lesson}.mp3'
    run('ffmpeg', '-y', *inputs, '-filter_complex', filters, '-map', '[out]', '-b:a', '160k', str(out))
    print(f'\nWrote {out.relative_to(ROOT)} ({offset:.1f}s)')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'm1_l1')
