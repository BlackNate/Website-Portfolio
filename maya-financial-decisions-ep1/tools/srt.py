"""Write out/captions.srt from out/timeline.json (for YouTube closed captions or a VO session)."""
import json, os, sys
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'out')
tl = json.load(open(os.path.join(OUT, 'timeline.json')))
def ts(s): h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60; return f"{h:02d}:{m:02d}:{int(sec):02d},{int(round((sec % 1) * 1000)) % 1000:03d}"
with open(os.path.join(OUT, 'captions.srt'), 'w') as f:
    for i, l in enumerate(tl['lines'], 1): f.write(f"{i}\n{ts(l['start'])} --> {ts(l['end'] + .2)}\n{l['text']}\n\n")
print(len(tl['lines']), 'captions')
