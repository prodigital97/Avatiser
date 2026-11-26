#!/usr/bin/env python3
"""Restore a pack label in an AI video from the clip's (label-correct) start still.

Video models often keep the pack still but scramble its fine print. When the clip was generated
from a still whose label is right, this tracks the camera move frame to frame (ECC, affine), warps
the still onto each frame, and replaces only the label's *detail* (text, edges) inside the label
area while keeping the video's own *lighting* (light sweeps, flares, shadows) from the clip:

    out = frame_lowpass + (still_warped - still_lowpass)      inside a feathered label mask

usage: label_restore.py STILL.png CLIP.mp4 OUT.mp4 [--sigma 7] [--box x0,y0,x1,y1] [--strength 1.0] [--protect]
  --box  label rectangle in still pixels (default: auto-detect the yellow label stock)
Audio is copied from CLIP. Requires opencv-python-headless, numpy, ffmpeg.
"""
import argparse, os, subprocess, tempfile
import cv2
import numpy as np


def label_box(img):
    b, g, r = [img[..., i].astype(int) for i in range(3)]
    m = (r > 200) & (g > 175) & (g < 240) & (b < 130) & (r - b > 100)   # pale label stock, not orange flesh
    rows, cols = m.sum(1), m.sum(0)
    ys, xs = np.where(rows > rows.max() * 0.35)[0], np.where(cols > cols.max() * 0.35)[0]
    return xs.min(), ys.min(), xs.max(), ys.max()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("still"); ap.add_argument("clip"); ap.add_argument("out")
    ap.add_argument("--sigma", type=float, default=7.0)
    ap.add_argument("--box"); ap.add_argument("--strength", type=float, default=1.0)
    ap.add_argument("--static", action="store_true", help="locked-off camera: skip per-frame tracking")
    ap.add_argument("--sift", metavar="X0,Y0,X1,Y1",
                    help="track with SIFT features from this still region (e.g. the cap) instead of ECC; for clips "
                         "where the model shifts the pack or liquids cross it")
    ap.add_argument("--protect", action="store_true",
                    help="per frame, keep the clip's own pixels where white lotion/foam or skin passes over the label")
    a = ap.parse_args()

    cap = cv2.VideoCapture(a.clip)
    fps = cap.get(cv2.CAP_PROP_FPS)
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    still = cv2.resize(cv2.imread(a.still), (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)

    x0, y0, x1, y1 = [int(v) for v in a.box.split(",")] if a.box else label_box(still.astype(np.uint8))
    pad = 6
    mask = np.zeros((H, W), np.float32)
    mask[y0 + pad:y1 - pad, x0 + pad:x1 - pad] = 1.0
    mask = cv2.GaussianBlur(mask, (0, 0), 6)

    # track against the first frame on a downscaled grey image; the bottle region dominates
    s = 0.35
    def small(im):
        # track on edge strength, not brightness, so light sweeps and flares don't pull the estimate
        g = cv2.cvtColor(cv2.resize(im, None, fx=s, fy=s, interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
        g = cv2.GaussianBlur(g, (0, 0), 1.2)
        return cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))
    # only the pack (label box grown by ~90 px) drives the estimate
    track = np.zeros((int(H * s + 0.5), int(W * s + 0.5)), np.uint8)
    g0 = 90
    track[max(0, int((y0 - g0) * s)):int((y1 + g0) * s), max(0, int((x0 - g0) * s)):int((x1 + g0) * s)] = 255
    ok, f0 = cap.read()
    ref = small(f0)
    # align the still to frame 0 first (the clip's first frame should be the still, but encoders shift slightly)
    warp0 = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp0 = cv2.findTransformECC(ref, small(still.astype(np.uint8)), warp0, cv2.MOTION_AFFINE,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 100, 1e-5), track, 5)
    except cv2.error:
        pass
    sift_M = None
    if a.sift:
        sx0, sy0, sx1, sy1 = [int(v) for v in a.sift.split(",")]
        det = cv2.SIFT_create(4000); bf = cv2.BFMatcher()
        am = np.zeros((H, W), np.uint8); am[sy0:sy1, sx0:sx1] = 255
        ks, ds = det.detectAndCompute(cv2.cvtColor(still.astype(np.uint8), cv2.COLOR_BGR2GRAY), am)
        grow = 250
        fm = np.zeros((H, W), np.uint8); fm[max(0, sy0 - grow):sy1 + grow, max(0, sx0 - grow):sx1 + grow] = 255
        cap2 = cv2.VideoCapture(a.clip); params, last = [], np.array([1.0, 0.0, 0.0, 0.0])
        ok2, fr2 = cap2.read()
        while ok2:
            kf, df = det.detectAndCompute(cv2.cvtColor(fr2, cv2.COLOR_BGR2GRAY), fm)
            p_ = last
            if df is not None and len(kf) > 6:
                good = [m for m, n in bf.knnMatch(ds, df, k=2) if m.distance < 0.75 * n.distance]
                if len(good) >= 6:
                    M2, inl = cv2.estimateAffinePartial2D(np.float32([ks[g.queryIdx].pt for g in good]),
                                                          np.float32([kf[g.trainIdx].pt for g in good]), ransacReprojThreshold=3)
                    if M2 is not None and inl.sum() >= 4:
                        p_ = np.array([np.hypot(M2[0, 0], M2[1, 0]), np.arctan2(M2[1, 0], M2[0, 0]), M2[0, 2], M2[1, 2]])
            params.append(p_); last = p_
            ok2, fr2 = cap2.read()
        P = np.array(params)
        k = 5  # temporal smoothing (moving median) removes jitter from sparse matches
        P = np.array([np.median(P[max(0, j - k // 2):j + k // 2 + 1], axis=0) for j in range(len(P))])
        sift_M = [np.array([[sc * np.cos(r), -sc * np.sin(r), tx], [sc * np.sin(r), sc * np.cos(r), ty]], np.float32) for sc, r, tx, ty in P]
    tmp = tempfile.mkdtemp()
    writer = cv2.VideoWriter(os.path.join(tmp, "v.mp4"), cv2.VideoWriter_fourcc(*"mp4v"), fps, (W, H))
    warp = np.eye(2, 3, dtype=np.float32)
    frame, i = f0, 0
    while ok:
        if i > 0 and not a.static and sift_M is None:
            try:
                _, warp = cv2.findTransformECC(ref, small(frame), warp, cv2.MOTION_AFFINE,
                                               (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5), track, 5)
            except cv2.error:
                pass  # keep the last good estimate
        # compose: still -> frame0 (warp0) -> frame_i (warp), then lift to full resolution
        # ECC(template, input) finds W with input(W x) ~ template(x): W maps template -> input coords.
        # warp0: frame0 -> still coords; warp: frame0 -> frame_i coords. Output pixel x_i samples the
        # still at warp0(warp^-1(x_i)); used as an inverse map, lifted from the downscaled grid.
        A0 = np.vstack([warp0, [0, 0, 1]]); A = np.vstack([warp, [0, 0, 1]])
        M = (A0 @ np.linalg.inv(A))[:2].copy()
        M[:, 2] /= s
        if sift_M is not None:   # forward map still -> frame
            Mi = sift_M[min(i, len(sift_M) - 1)]
            st = cv2.warpAffine(still, Mi, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            mk = cv2.warpAffine(mask, Mi, (W, H), flags=cv2.INTER_LINEAR)[..., None] * a.strength
        else:
            st = cv2.warpAffine(still, M, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
            mk = cv2.warpAffine(mask, M, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)[..., None] * a.strength
        fr = frame.astype(np.float32)
        if a.protect:
            bch, gch, rch = fr[..., 0], fr[..., 1], fr[..., 2]
            white = (bch > 170) & (gch > 170) & (rch > 170) & ((rch - bch) < 70)   # lotion, foam, highlights
            skin = (bch > 120) & (rch > bch + 30) & (gch > bch)                      # a fingertip
            keep = cv2.GaussianBlur(cv2.dilate((white | skin).astype(np.uint8), np.ones((15, 15), np.uint8)).astype(np.float32), (0, 0), 5)
            mk = mk * (1 - keep[..., None])
        detail = st - cv2.GaussianBlur(st, (0, 0), a.sigma)
        restored = cv2.GaussianBlur(fr, (0, 0), a.sigma) + detail
        out = fr * (1 - mk) + restored * mk
        writer.write(np.clip(out, 0, 255).astype(np.uint8))
        ok, frame = cap.read(); i += 1
    writer.release()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join(tmp, "v.mp4"), "-i", a.clip, "-map", "0:v", "-map", "1:a?",
                    "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", "-c:a", "copy", a.out], check=True)
    print(f"restored {i} frames, label box {x0},{y0},{x1},{y1} -> {a.out}")


if __name__ == "__main__":
    main()
