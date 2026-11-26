#!/usr/bin/env python3
"""studio/qa: cost and quality gates for Kie.ai generation jobs.

  preflight JOBS.json [--brand B] [--cap CREDITS]  lint prompts + estimate cost before anything is spent
  balance                                           current Kie credit balance
  ledger PROJECT LABEL TASK_ID [...]                append real credits (Kie's creditsConsumed) to the project ledger
  scan VIDEO --brand B                              find moments where a clip scrambles the label (trim, don't regenerate)
  sheet OUT.jpg FILE [...]                          label-crop review sheet for the human gate

JOBS.json is a list of {"label", "stage": "draft"|"final"|"lock", "body": <Kie createTask body>}.
Kie calls go through the session proxy, which adds the API key; no key is read here.
"""
import argparse, csv, json, os, re, subprocess, sys, tempfile, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PRICING = json.load(open(os.path.join(HERE, "pricing.json")))
KIE = "https://api.kie.ai/api/v1"
AUTH = {"Authorization": "Bearer " + os.environ.get("KIE_API_KEY", "proxy-injected")}

STATE_CHANGE = re.compile(r"\b(blend\w*|absorb\w*|melt\w*|sinks? in(to)?|sinking in(to)?|disappear\w*|rub\w* in|spread\w*|turns? sheer|dissolv\w*|dry down|dries)\b", re.I)
ROTATE = re.compile(r"\b(turn(s|ing)?|rotat\w*|tilt\w*|spin\w*|twist\w*)\b[^.]{0,40}\b(bottle|pack|tube|jar)\b", re.I)
FORBIDDEN = re.compile(r"(?<!no )\b(fair(ness|er)?|whiten\w*|lighten(ing|s)?|skin[- ]lighten\w*)\b", re.I)


def brand(name):
    return json.load(open(os.path.join(HERE, "brands", name + ".json"))) if name else None


# ---------- cost ----------
def estimate(body):
    m, i = body["model"], body.get("input", {})
    if m in PRICING["image"]:
        p = PRICING["image"][m]
        size = i.get(p["size_field"], next(iter(p["per_image"])))
        refs = len(i.get("image_urls") or i.get("image_input") or [])
        return p["per_image"].get(size, max(p["per_image"].values())) + refs * p["per_ref"]
    if m in PRICING["video"]:
        p = PRICING["video"][m]
        res = i.get(p["res_field"], next(iter(p["per_second"])))
        return p["per_second"].get(res, max(p["per_second"].values())) * max(i.get("duration", 5), p["min_s"])
    return None


# ---------- preflight ----------
def preflight(jobs, b, cap):
    errors, warns, total = [], [], 0.0
    models_by_shot = {}
    for j in jobs:
        lab, stage, body = j["label"], j.get("stage", "final"), j["body"]
        m, i = body["model"], body.get("input", {})
        prompt = i.get("prompt", "")
        cost = estimate(body)
        if cost is None:
            warns.append(f"{lab}: no price for model {m}; add it to pricing.json")
        else:
            total += cost
        is_video = m in PRICING["video"]
        shot = lab.split()[0]
        models_by_shot.setdefault(shot, set()).add(m)

        if FORBIDDEN.search(prompt):
            errors.append(f"{lab}: fairness/lightening language in prompt ({FORBIDDEN.search(prompt).group(0)!r})")
        if b and stage != "lock":
            typed = [t for t in b["label_fine_print"] if t.lower() in prompt.lower()]
            if typed:
                errors.append(f"{lab}: label text typed into a generation prompt {typed}; reference the product photo instead "
                              "(typed copy is only for the label-lock pass)")
        if not is_video and stage != "lock":
            if "scale lock" not in prompt.lower():
                errors.append(f"{lab}: no STRICT PRODUCT SCALE LOCK sentence")
            if "exactly from" not in prompt.lower():
                warns.append(f"{lab}: prompt does not tie the label to the product reference ('copy ... exactly from ...')")
        if is_video:
            p = PRICING["video"].get(m, {})
            if i.get("duration", 5) < p.get("min_s", 0):
                errors.append(f"{lab}: duration {i.get('duration')}s is below {m}'s minimum {p['min_s']}s")
            if STATE_CHANGE.search(prompt) and not i.get("last_frame_url"):
                warns.append(f"{lab}: product changes state ({STATE_CHANGE.search(prompt).group(0)!r}) with no last_frame_url. "
                              "High retry risk: make the 'after' still and pass it as the last frame")
            if ROTATE.search(prompt):
                warns.append(f"{lab}: the pack turns/tilts ({ROTATE.search(prompt).group(0)!r}); video models scramble labels "
                             "while a pack rotates. Keep it still or plan to trim")
            res = str(i.get(p.get("res_field", "resolution"), "")).lower()
            if stage == "final" and "1080" in res and not j.get("approved_draft") and m == "wan/3-0-video":
                d = PRICING["video"][m]["per_second"]["480P"] * max(i.get("duration", 5), 2)
                warns.append(f"{lab}: 1080p final without an approved 480P draft; a draft costs {d:g} credits vs "
                             f"{cost:g} for the final")
    for shot, ms in models_by_shot.items():
        if len(ms) > 1:
            warns.append(f"{shot}: same shot on {len(ms)} models ({', '.join(sorted(ms))}); comparisons multiply cost, "
                         "route by shot type once the model is chosen")
    if cap is not None and total > cap:
        errors.append(f"estimated {total:.1f} credits exceeds the cap of {cap:g}")
    return errors, warns, total


# ---------- Kie ----------
def kie(path):
    return json.load(urllib.request.urlopen(urllib.request.Request(KIE + path, headers=AUTH), timeout=60))


def ledger(project, label, task_ids):
    path = os.path.join(HERE, "..", "projects", project, "ledger.csv")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    new = not os.path.exists(path)
    with open(path, "a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["label", "task", "model", "state", "credits", "usd", "seconds"])
        for t in task_ids:
            d = kie(f"/jobs/recordInfo?taskId={t}")["data"]
            c = d.get("creditsConsumed") or 0
            w.writerow([label, t, d["model"], d["state"], c, round(c * PRICING["usd_per_credit"], 4), d.get("costTime")])
            print(f"{c:>7} credits  {d['model']:30} {d['state']:8} {label}")
    print("ledger:", os.path.normpath(path))


# ---------- label scan (relative OCR) ----------
def _label_crop(im):
    import numpy as np
    a = np.asarray(im.convert("RGB")).astype(int)
    r, g, bl = a[..., 0], a[..., 1], a[..., 2]
    m = (r > 190) & (g > 150) & (g < 240) & (bl < 130) & (r - bl > 100)
    rows, cols = m.sum(1), m.sum(0)
    if rows.max() < 10:
        return None
    ys, xs = np.where(rows > rows.max() * 0.35)[0], np.where(cols > cols.max() * 0.35)[0]
    if len(ys) < 20 or len(xs) < 10:
        return None
    return im.crop((xs.min(), ys.min(), xs.max(), ys.max()))


def label_score(im, lines):
    """0-100 fuzzy match of OCR'd label text to the real label lines. Noisy in absolute terms;
    reliable as a relative signal between frames of one clip."""
    import pytesseract
    from PIL import Image, ImageOps, ImageFilter
    from rapidfuzz import fuzz
    c = _label_crop(im)
    if c is None:
        return None
    s = 1600 / max(1, c.height)
    c = c.resize((max(1, int(c.width * s)), 1600), Image.LANCZOS)
    g = ImageOps.autocontrast(ImageOps.grayscale(c)).filter(ImageFilter.UnsharpMask(2, 150, 3))
    best = 0
    for psm in (6, 4):
        txt = pytesseract.image_to_string(g, config=f"--psm {psm}")
        got = [l.strip().lower() for l in txt.splitlines() if l.strip()]
        sc = sum(max([fuzz.ratio(e.lower(), l) for l in got] + [0]) for e in lines) / len(lines)
        best = max(best, sc)
    return best


def scan(video, b, step=0.2, drop=0.25):
    from PIL import Image
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))
    tmp = tempfile.mkdtemp()
    pts, t = [], 0.0
    while t < dur - 0.05:
        f = os.path.join(tmp, f"{t:.2f}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1", f], check=True)
        pts.append((t, label_score(Image.open(f), b["label_lines"])))
        t += step
    vals = sorted(v for _, v in pts if v is not None)
    if not vals:
        print("no label found in this clip")
        return
    med = vals[len(vals) // 2]
    bad = [t for t, v in pts if v is not None and v < med * (1 - drop)]
    print(f"clip {os.path.basename(video)}: {dur:.2f}s, median label score {med:.0f}")
    for t, v in pts:
        flag = "  <-- label degrades" if t in bad else ""
        print(f"  {t:5.2f}s  {'-' if v is None else f'{v:5.1f}'}{flag}")
    if bad:
        # merge into windows and propose the longest clean range
        wins, start = [], bad[0]
        for a, c in zip(bad, bad[1:] + [None]):
            if c is None or c - a > step * 1.5:
                wins.append((start, a + step)); start = c
        print("glitch windows:", ", ".join(f"{a:.1f}-{min(c, dur):.1f}s" for a, c in wins))
        edges = [0.0] + [x for w in wins for x in w] + [dur]
        clean = max(((edges[k], edges[k + 1]) for k in range(0, len(edges), 2)), key=lambda w: w[1] - w[0])
        print(f"longest clean range: {clean[0]:.1f}-{clean[1]:.1f}s (trim to this instead of regenerating)")
    else:
        print("no glitch windows found")


def run(jobs, b, cap, project, outdir):
    """Preflight, refuse on errors or when the estimate exceeds the balance, then submit, poll,
    download every result to OUTDIR/<label>.<ext>, write OUTDIR/results.json and record the ledger."""
    import time
    errors, warns, total = preflight(jobs, b, cap)
    for e in errors: print("ERROR ", e)
    for w in warns: print("WARN  ", w)
    bal = kie("/chat/credit")["data"]
    print(f"estimate {total:.1f} credits, balance {bal}")
    if errors or total > bal:
        sys.exit("refused: fix the errors above" if errors else "refused: estimate exceeds the balance")
    os.makedirs(outdir, exist_ok=True)
    tasks = {}
    for j in jobs:
        req = urllib.request.Request(KIE + "/jobs/createTask", data=json.dumps(j["body"]).encode(),
                                     headers={**AUTH, "Content-Type": "application/json"})
        r = json.load(urllib.request.urlopen(req, timeout=60))
        if r.get("code") != 200:
            print("SUBMIT FAILED", j["label"], r); continue
        tasks[j["label"]] = r["data"]["taskId"]
    results = {}
    while len(results) < len(tasks):
        time.sleep(8)
        for lab, t in tasks.items():
            if lab in results: continue
            d = kie(f"/jobs/recordInfo?taskId={t}")["data"]
            if d["state"] not in ("success", "fail"): continue
            entry = {"task": t, "state": d["state"], "credits": d.get("creditsConsumed"), "error": d.get("failMsg")}
            if d["state"] == "success":
                url = json.loads(d["resultJson"])["resultUrls"][0]
                path = os.path.join(outdir, re.sub(r"[^\w.-]+", "_", lab) + os.path.splitext(url.split("?")[0])[1])
                urllib.request.urlretrieve(url, path)
                entry.update(url=url, file=path)
            results[lab] = entry
            print(f"{d['state']:8} {entry['credits']} credits  {lab}")
    json.dump(results, open(os.path.join(outdir, "results.json"), "w"), indent=1)
    if project:
        for lab, e in results.items():
            ledger(project, lab, [e["task"]])
    spent = sum(e["credits"] or 0 for e in results.values())
    print(f"spent {spent:.2f} credits; balance {kie('/chat/credit')['data']}")


def sheet(out, files):
    from PIL import Image, ImageDraw
    tiles = []
    for f in files:
        im = Image.open(f).convert("RGB")
        c = _label_crop(im)
        c = im.copy() if c is None else c
        c.thumbnail((360, 640))
        th = im.copy(); th.thumbnail((360, 640))
        tiles.append((os.path.basename(f), th, c))
    W = 740
    s = Image.new("RGB", (W * len(tiles), 680), "white")
    d = ImageDraw.Draw(s)
    for k, (n, th, c) in enumerate(tiles):
        s.paste(th, (k * W, 30)); s.paste(c, (k * W + 370, 30)); d.text((k * W + 4, 8), n, fill="black")
    s.save(out, quality=90)
    print("review sheet:", out, "(check: identity, hands, scale, label lines vs pack, claims)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("preflight"); p.add_argument("jobs"); p.add_argument("--brand"); p.add_argument("--cap", type=float)
    sp.add_parser("balance")
    p = sp.add_parser("ledger"); p.add_argument("project"); p.add_argument("label"); p.add_argument("tasks", nargs="+")
    p = sp.add_parser("scan"); p.add_argument("video"); p.add_argument("--brand", required=True)
    p = sp.add_parser("sheet"); p.add_argument("out"); p.add_argument("files", nargs="+")
    p = sp.add_parser("run"); p.add_argument("jobs"); p.add_argument("--brand"); p.add_argument("--cap", type=float)
    p.add_argument("--project"); p.add_argument("--out", required=True)
    a = ap.parse_args()

    if a.cmd == "preflight":
        jobs = json.load(open(a.jobs))
        errors, warns, total = preflight(jobs, brand(a.brand), a.cap)
        for e in errors: print("ERROR ", e)
        for w in warns: print("WARN  ", w)
        print(f"estimate: {total:.1f} credits (${total * PRICING['usd_per_credit']:.2f}) for {len(jobs)} job(s)")
        sys.exit(1 if errors else 0)
    if a.cmd == "balance":
        c = kie("/chat/credit")["data"]
        print(f"{c} credits (${c * PRICING['usd_per_credit']:.2f})")
    if a.cmd == "ledger":
        ledger(a.project, a.label, a.tasks)
    if a.cmd == "scan":
        scan(a.video, brand(a.brand))
    if a.cmd == "sheet":
        sheet(a.out, a.files)
    if a.cmd == "run":
        run(json.load(open(a.jobs)), brand(a.brand), a.cap, a.project, a.out)


if __name__ == "__main__":
    main()
