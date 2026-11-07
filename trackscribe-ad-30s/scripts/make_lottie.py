"""Hand-built Lottie (bodymovin 5.x) animations for the Trackscribe ad.

Every icon is authored here as vector shape layers with keyframed motion, so the
ad has a single, consistent illustration style instead of mismatched stock files.
    python3 scripts/make_lottie.py   ->  src/lottie/*.json
"""
import json
import math
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "src", "lottie")
FR = 30

# ---- brand palette (0..1 rgb) ----
def hexc(h, a=1):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [a]

VIOLET = hexc("8B5CF6")
VIOLET_D = hexc("6D28D9")
LILAC = hexc("C4B5FD")
WHITE = hexc("FFFFFF")
YELLOW = hexc("FFD23F")
YELLOW_D = hexc("E8A90C")
RED = hexc("FF4D5E")
MINT = hexc("2EE6A6")
INK = hexc("1A0B2E")

# ---- keyframe helpers ----
EASE_OUT = ({"x": [0.2], "y": [1]}, {"x": [0.3], "y": [0]})  # (in, out) handles
EASE_IO = ({"x": [0.6], "y": [1]}, {"x": [0.4], "y": [0]})


def static(v):
    return {"a": 0, "k": v}


def anim(keys, ease=EASE_IO):
    """keys: list of (frame, value). value may be scalar or list."""
    ks = []
    for i, (t, v) in enumerate(keys):
        v = v if isinstance(v, list) else [v]
        k = {"t": t, "s": v}
        if i < len(keys) - 1:
            k["i"] = ease[0] if len(v) == 1 else {"x": ease[0]["x"] * len(v), "y": ease[0]["y"] * len(v)}
            k["o"] = ease[1] if len(v) == 1 else {"x": ease[1]["x"] * len(v), "y": ease[1]["y"] * len(v)}
        ks.append(k)
    return {"a": 1, "k": ks}


def overshoot(t0, frm, to, dur=14):
    """Scale pop with a little overshoot — the house 'pop' motion."""
    over = [to[i] + (to[i] - frm[i]) * 0.14 for i in range(len(to))]
    under = [to[i] - (to[i] - frm[i]) * 0.04 for i in range(len(to))]
    return anim([(t0, frm), (t0 + dur * 0.55, over), (t0 + dur * 0.8, under), (t0 + dur, to)], EASE_OUT)


# ---- shape helpers ----
def tr(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    def wrap(v):
        return v if isinstance(v, dict) else static(list(v) if isinstance(v, (list, tuple)) else v)
    return {"ty": "tr", "p": wrap(p), "a": wrap(a), "s": wrap(s), "r": wrap(r), "o": wrap(o),
            "sk": static(0), "sa": static(0)}


def rect(w, h, r=0, p=(0, 0)):
    return {"ty": "rc", "d": 1, "s": static([w, h]), "p": static(list(p)), "r": static(r)}


def ellipse(w, h=None, p=(0, 0)):
    return {"ty": "el", "d": 1, "s": static([w, h or w]), "p": static(list(p))}


def path(vs, closed=False, ins=None, outs=None):
    n = len(vs)
    return {"ty": "sh", "d": 1, "ks": static({
        "v": [list(v) for v in vs],
        "i": [list(x) for x in (ins or [[0, 0]] * n)],
        "o": [list(x) for x in (outs or [[0, 0]] * n)],
        "c": closed,
    })}


def fill(c, o=100):
    return {"ty": "fl", "c": static(c), "o": static(o) if not isinstance(o, dict) else o, "r": 1}


def stroke(c, w, o=100):
    return {"ty": "st", "c": static(c), "o": static(o) if not isinstance(o, dict) else o,
            "w": static(w), "lc": 2, "lj": 2, "ml": 4}


def trim(e, s=None):
    return {"ty": "tm", "s": s or static(0), "e": e, "o": static(0), "m": 1}


def group(items, transform=None, nm="g"):
    return {"ty": "gr", "nm": nm, "it": items + [transform or tr()]}


def layer(shapes, ind, nm="layer", ks=None, ip=0, op=600, parent=None):
    L = {"ddd": 0, "ind": ind, "ty": 4, "nm": nm, "sr": 1,
         "ks": ks or {"o": static(100), "r": static(0), "p": static([0, 0, 0]),
                      "a": static([0, 0, 0]), "s": static([100, 100, 100])},
         "ao": 0, "shapes": shapes, "ip": ip, "op": op, "st": 0, "bm": 0}
    if parent:
        L["parent"] = parent
    return L


def ks(p=(0, 0), a=(0, 0), s=(100, 100), r=0, o=100):
    def wrap(v, three=False):
        if isinstance(v, dict):
            return v
        if isinstance(v, (list, tuple)):
            v = list(v) + ([0] if three and len(v) == 2 else [])
            return static(v)
        return static(v)
    return {"p": wrap(p, True), "a": wrap(a, True), "s": wrap(s, True), "r": wrap(r), "o": wrap(o)}


def comp(name, w, h, op, layers):
    # Lottie draws layer 0 on top: callers pass back-to-front, we reverse.
    layers = list(reversed(layers))
    for i, L in enumerate(layers):
        L["ind"] = i + 1
        L["op"] = op
    return {"v": "5.7.4", "fr": FR, "ip": 0, "op": op, "w": w, "h": h, "nm": name, "ddd": 0,
            "assets": [], "layers": layers}


def save(name, data):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print("wrote", name)


# ============================================================
# 1. Bell — ringing reminder bell with sound waves (loop 48f)
# ============================================================
def bell():
    op = 48
    body_pts = [(0, -95), (62, -30), (70, 40), (96, 66), (-96, 66), (-70, 40), (-62, -30)]
    ins = [(-38, 0), (0, -32), (0, -12), (-12, -8), (0, 0), (-4, 14), (0, 26)]
    outs = [(38, 0), (0, 26), (4, 14), (0, 0), (12, -8), (0, -12), (0, -32)]
    swing = anim([(0, 0), (6, 16), (14, -14), (21, 10), (27, -6), (32, 0), (op, 0)])
    clapper_swing = anim([(0, 0), (8, -22), (16, 18), (23, -12), (29, 6), (34, 0), (op, 0)])
    body = group([
        path(body_pts, True, ins, outs), fill(YELLOW),
    ], nm="body")
    shine = group([path([(-34, -40), (-40, 30)], False, [(0, 0), (6, -20)], [(-6, 20), (0, 0)]),
                   stroke(hexc("FFF3B0"), 12)], nm="shine")
    rim = group([rect(210, 26, 13, (0, 70)), fill(YELLOW_D)], nm="rim")
    knob = group([ellipse(30, 30, (0, -104)), fill(YELLOW_D)], nm="knob")
    bell_layer = layer([shine, rim, body, knob], 0, "bell",
                       ks(p=(256, 236), a=(0, -100), r=swing, s=(100, 100)))
    clapper = layer([group([ellipse(46, 46, (0, 0)), fill(YELLOW_D)])], 0, "clapper",
                    ks(p=(256, 330), a=(0, -30), r=clapper_swing))
    waves = []
    for side in (-1, 1):
        for k, (rad, delay) in enumerate(((150, 4), (190, 10))):
            o = anim([(0, 0), (delay, 0), (delay + 5, 100), (delay + 18, 0), (op, 0)])
            sc = anim([(delay, [85, 85]), (delay + 18, [112, 112])], EASE_OUT)
            arc = []
            for j in range(9):
                ang = math.radians(-35 + j * 70 / 8)
                arc.append((side * rad * math.cos(ang), rad * math.sin(ang)))
            waves.append(layer([group([path(arc), stroke(LILAC, 14)], tr(s=sc, o=o))], 0,
                               f"wave{side}{k}", ks(p=(256, 236))))
    return comp("bell", 512, 512, op, waves + [clapper, bell_layer])


# ============================================================
# 2. Checklist — rows slide in, checks draw (plays once, 70f)
# ============================================================
def checklist():
    op = 70
    layers = [layer([group([rect(400, 420, 44), fill(WHITE)])], 0, "card",
                    ks(p=(256, 256), s=overshoot(0, [70, 70], [100, 100], 14), o=anim([(0, 0), (5, 100)])))]
    colors = [RED, MINT, VIOLET]
    for i in range(3):
        y = -120 + i * 120
        t0 = 10 + i * 12
        slide = anim([(t0, [60, 0]), (t0 + 12, [0, 0])], EASE_OUT)
        op_k = anim([(t0, 0), (t0 + 6, 100)])
        dot = group([ellipse(64, 64, (-130, y)), fill(colors[i])])
        bar = group([rect(170, 22, 11, (10, y - 12)), fill(hexc("E9E3F7"))])
        bar2 = group([rect(110, 16, 8, (-20, y + 20)), fill(hexc("F2EEFA"))])
        circle = group([ellipse(56, 56, (140, y)), stroke(hexc("D8CFF0"), 7)])
        chk = group([path([(118, y), (134, y + 16), (164, y - 16)]), stroke(MINT, 10),
                     trim(anim([(t0 + 12, 0), (t0 + 24, 100)], EASE_OUT))])
        chk_bg = group([ellipse(56, 56, (140, y)), fill(hexc("E6FBF3"),
                                                       anim([(t0 + 10, 0), (t0 + 14, 100)]))])
        layers.append(layer([chk, chk_bg, circle, bar, bar2, dot], 0, f"row{i}",
                            ks(p=slide, o=op_k)))
        # rows positioned relative to card centre
        layers[-1]["ks"]["p"] = anim([(t0, [316, 256, 0]), (t0 + 12, [256, 256, 0])], EASE_OUT)
    return comp("checklist", 512, 512, op, layers)


# ============================================================
# 3. Chart — bars grow, trend line draws (plays once, 75f)
# ============================================================
def chart():
    op = 75
    layers = []
    heights = [110, 170, 140, 230, 300]
    xs = [-160, -80, 0, 80, 160]
    base = 150
    axis = layer([group([path([(-210, base), (210, base)]), stroke(hexc("FFFFFF", 0.35), 6)])], 0, "axis",
                 ks(p=(256, 256)))
    layers.append(axis)
    for i, (x, h) in enumerate(zip(xs, heights)):
        t0 = 4 + i * 6
        col = VIOLET if i < 4 else MINT
        sc = anim([(t0, [100, 0]), (t0 + 16, [100, 108]), (t0 + 22, [100, 100])], EASE_OUT)
        bar = group([rect(54, h, 14, (0, -h / 2)), fill(col)], tr(s=sc))
        layers.append(layer([bar], 0, f"bar{i}", ks(p=(256 + x, 256 + base))))
    pts = [(x, base - h - 34) for x, h in zip(xs, heights)]
    line = group([path(pts), stroke(YELLOW, 10), trim(anim([(30, 0), (58, 100)], EASE_OUT))])
    layers.append(layer([line], 0, "trend", ks(p=(256, 256))))
    for i, (x, y) in enumerate(pts):
        t0 = 30 + i * 6
        dot = group([ellipse(26, 26, (0, 0)), fill(YELLOW)], tr(s=overshoot(t0, [0, 0], [100, 100], 10)))
        layers.append(layer([dot], 0, f"dot{i}", ks(p=(256 + x, 256 + y))))
    return comp("chart", 512, 512, op, layers)


# ============================================================
# 4. Coins — draining coins (loop 45f)
# ============================================================
def coins():
    op = 45
    layers = []
    for i, (x, d) in enumerate(((-70, 0), (60, 15), (-5, 30))):
        def coin_group():
            return [group([ellipse(30, 30), fill(hexc("FFF3B0"))], tr(p=(-18, -18))),
                    group([ellipse(84, 84), stroke(YELLOW_D, 8)]),
                    group([ellipse(110, 110), fill(YELLOW)])]
        # each coin falls 0→op with phase offset d
        y0, y1 = -160, 220
        p = anim([(0, [256 + x, 256 + y0 + (y1 - y0) * (d / op), 0]),
                  (op - d, [256 + x, 256 + y1, 0]),
                  (op - d + 0.01, [256 + x, 256 + y0, 0]),
                  (op, [256 + x, 256 + y0 + (y1 - y0) * (d / op), 0])], ({"x": [1], "y": [1]}, {"x": [0], "y": [0]}))
        o = anim([(0, 100), (max(1, op - d - 8), 100), (op - d, 0), (op - d + 0.01, 0),
                  (min(op, op - d + 6), 100), (op, 100)], ({"x": [1], "y": [1]}, {"x": [0], "y": [0]}))
        L = layer(coin_group(), 0, f"coin{i}", ks(p=p, o=o, s=(100, 100), r=anim([(0, -20 + i * 15), (op, 25 + i * 15)])))
        layers.append(L)
    return comp("coins", 512, 512, op, layers)


# ============================================================
# 5. Calendar miss — calendar pops, date circled, red X draws (70f)
# ============================================================
def calendar_miss():
    op = 70
    cal = [
        group([rect(300, 290, 40, (0, 20)), fill(WHITE)]),
        group([rect(300, 80, 40, (0, -105)), fill(VIOLET)]),
        group([rect(300, 40, 0, (0, -85)), fill(VIOLET)]),
        group([rect(22, 60, 11, (-80, -150)), fill(INK)]),
        group([rect(22, 60, 11, (80, -150)), fill(INK)]),
    ]
    for r in range(3):
        for c in range(4):
            cal.append(group([rect(44, 38, 9, (-96 + c * 64, -20 + r * 56)), fill(hexc("E9E3F7"))]))
    cal = list(reversed(cal))
    base = layer(cal, 0, "calendar", ks(p=(256, 266), s=overshoot(0, [40, 40], [100, 100], 16),
                                         o=anim([(0, 0), (6, 100)])))
    ring = layer([group([ellipse(84, 84, (0, 0)), stroke(RED, 9),
                         trim(anim([(16, 0), (32, 100)], EASE_OUT))])], 0, "ring",
                 ks(p=(256 + 32, 266 + 36), r=-90))
    x1 = group([path([(-26, -26), (26, 26)]), stroke(RED, 12), trim(anim([(30, 0), (38, 100)], EASE_OUT))])
    x2 = group([path([(26, -26), (-26, 26)]), stroke(RED, 12), trim(anim([(36, 0), (44, 100)], EASE_OUT))])
    xl = layer([x1, x2], 0, "x", ks(p=(256 + 32, 266 + 36)))
    shake = anim([(44, 0), (47, -6), (50, 5), (53, -3), (56, 0)])
    base["ks"]["r"] = shake
    return comp("calendar_miss", 512, 512, op, [base, ring, xl])


# ============================================================
# 6. Burst — radial reveal burst (40f, once)
# ============================================================
def burst():
    op = 40
    layers = []
    ring = layer([group([ellipse(200, 200), stroke(LILAC, 10, anim([(0, 100), (26, 0)]))],
                        tr(s=anim([(0, [20, 20]), (26, [230, 230])], EASE_OUT)))], 0, "ring", ks(p=(256, 256)))
    layers.append(ring)
    n = 12
    for i in range(n):
        a = 2 * math.pi * i / n
        p0 = (math.cos(a) * 90, math.sin(a) * 90)
        p1 = (math.cos(a) * 230, math.sin(a) * 230)
        col = YELLOW if i % 2 else LILAC
        g = group([path([p0, p1]), stroke(col, 12),
                   trim(anim([(2, 0), (16, 100)], EASE_OUT), anim([(8, 0), (24, 100)], EASE_OUT))])
        layers.append(layer([g], 0, f"ray{i}", ks(p=(256, 256))))
    for i in range(8):
        a = 2 * math.pi * (i + 0.5) / 8
        p = anim([(4, [256 + math.cos(a) * 60, 256 + math.sin(a) * 60, 0]),
                  (28, [256 + math.cos(a) * 200, 256 + math.sin(a) * 200, 0])], EASE_OUT)
        dot = group([ellipse(18, 18), fill(MINT if i % 2 else WHITE)])
        layers.append(layer([dot], 0, f"spark{i}", ks(p=p, o=anim([(4, 100), (22, 100), (30, 0)]))))
    return comp("burst", 512, 512, op, layers)


# ============================================================
# 7. Logo — Trackscribe calendar mark builds itself (50f, once)
# ============================================================
def logo():
    op = 50
    body = layer([
        group([rect(330, 300, 70, (0, 30)), fill(VIOLET)]),
    ], 0, "body", ks(p=(256, 256), s=overshoot(0, [0, 0], [100, 100], 16)))
    head = layer([group([rect(330, 90, 46, (0, -95)), fill(VIOLET_D)]),
                  group([rect(330, 40, 0, (0, -70)), fill(VIOLET_D)])], 0, "head",
                 ks(p=(256, 256), s=overshoot(4, [0, 0], [100, 100], 14)))
    rings = []
    for x in (-85, 85):
        rings.append(layer([group([rect(34, 80, 17, (0, 0)), fill(WHITE)])], 0, f"ring{x}",
                           ks(p=anim([(8, [256 + x, 150, 0]), (20, [256 + x, 116, 0])], EASE_OUT),
                              o=anim([(8, 0), (12, 100)]))))
    cells = []
    k = 0
    for r in range(3):
        for c in range(4):
            t0 = 12 + k * 2
            k += 1
            g = group([rect(46, 40, 10), fill(WHITE)], tr(s=overshoot(t0, [0, 0], [100, 100], 10)))
            cells.append(layer([g], 0, f"cell{r}{c}", ks(p=(256 - 105 + c * 70, 256 - 10 + r * 60))))
    badge = layer([
        group([path([(-22, 2), (-6, 18), (24, -16)]), stroke(WHITE, 12), trim(anim([(38, 0), (48, 100)], EASE_OUT))]),
        group([ellipse(100, 100), fill(MINT)]),
    ], 0, "badge", ks(p=(256 + 140, 256 + 150), s=overshoot(34, [0, 0], [100, 100], 12)))
    return comp("logo", 512, 512, op, [body, head] + rings + cells + [badge])


# ============================================================
# 8. Ping — notification pulse rings (loop 40f)
# ============================================================
def ping():
    op = 40
    layers = []
    for i, d in enumerate((0, 13, 26)):
        sc = anim([(0, [30 + (d / op) * 100, 30 + (d / op) * 100]), (op - d, [130, 130]),
                   (op - d + 0.01, [30, 30]), (op, [30 + (d / op) * 100, 30 + (d / op) * 100])],
                  ({"x": [1], "y": [1]}, {"x": [0], "y": [0]}))
        o = anim([(0, 100 - d / op * 100), (op - d, 0), (op - d + 0.01, 100), (op, 100 - d / op * 100)],
                 ({"x": [1], "y": [1]}, {"x": [0], "y": [0]}))
        layers.append(layer([group([ellipse(360, 360), stroke(RED, 8)], tr(s=sc, o=o))], 0, f"pulse{i}",
                            ks(p=(256, 256))))
    return comp("ping", 512, 512, op, layers)


if __name__ == "__main__":
    save("bell", bell())
    save("checklist", checklist())
    save("chart", chart())
    save("coins", coins())
    save("calendar_miss", calendar_miss())
    save("burst", burst())
    save("logo", logo())
    save("ping", ping())
