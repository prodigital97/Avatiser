/* yvan_gen-style product-only ad: ~1 s cuts from short AI clips, directional motion-blur whips,
   speed ramps, the clips' own sound effects. A cut is a window of a (graded) clip. */

export type Whip = 'up' | 'down' | 'left' | 'right';

export type Cut = {
  clip: string;        // path under public/
  from: number;        // source in-point, seconds
  to: number;          // source out-point, seconds
  speed?: number;      // playback rate, default 1 (0.5 = half-speed slow motion)
  whipOut?: Whip;      // motion-blur whip into the next cut (otherwise a hard cut)
  volume?: number;     // clip audio level, default 0.9 (0 mutes)
  push?: [number, number]; // virtual zoom over the cut, e.g. [1, 1.06]
};

export type FastCutProps = { cuts: Cut[]; tailFrames: number };

export const FC_FPS = 30;
export const WHIP = 5; // frames each side of a whip

export const cutFrames = (c: Cut) => Math.max(1, Math.round(((c.to - c.from) / (c.speed ?? 1)) * FC_FPS));
/* a whip overlaps the two cuts by WHIP frames: the next shot slides in while this one slides out */
export const cutStarts = (p: FastCutProps) => {
  let at = 0;
  return p.cuts.map((c) => { const s = at; at += cutFrames(c) - (c.whipOut ? WHIP : 0); return s; });
};
export const fastCutDuration = (p: FastCutProps) => {
  const last = p.cuts.length - 1;
  return cutStarts(p)[last] + cutFrames(p.cuts[last]) + p.tailFrames;
};

const C = (n: string) => `skinbell-ys/${n}.mp4`;

/* "Liquid Sun": SkinBell UltraSmart SPF 50+ PA+++. MAGI-2 clips (4 s, 25 fps), labels restored from
   the stills with studio/tools/label_restore.py, graded, then cut here. Story: light reveals the
   pack -> lotion -> vitamin-C orange splash -> heat -> the lotion goes sheer (no white cast) -> hero. */
export const skinbellLiquidSun: FastCutProps = {
  tailFrames: 18,
  cuts: [
    { clip: C('S1-blade'), from: 0.3, to: 1.9, push: [1.0, 1.04], volume: 0.9, whipOut: 'left' },   // light blade reveals the label
    { clip: C('S2-pump'), from: 0.4, to: 1.5, volume: 1.0, whipOut: 'down' },                        // press, ribbon starts
    { clip: C('S3-splash'), from: 0.0, to: 1.0, speed: 0.6, volume: 0.8 },                            // juice crown rises
    { clip: C('S4-glass'), from: 0.5, to: 1.6, push: [1.0, 1.05], volume: 0.7, whipOut: 'up' },      // hot frosted glass
    { clip: C('S2-pump'), from: 2.2, to: 3.2, volume: 1.0 },                                          // coil builds
    { clip: C('S5-swatch'), from: 1.2, to: 3.4, speed: 1.5, volume: 0.9, whipOut: 'right' },          // thick swipe -> sheer film
    { clip: C('S3-splash'), from: 1.6, to: 2.4, speed: 0.6, volume: 0.7, whipOut: 'down' },          // droplets fall
    { clip: C('S1-blade'), from: 2.6, to: 3.6, push: [1.03, 1.08], volume: 0.6 },                    // fully lit label
    { clip: C('S6-hero'), from: 0.6, to: 3.6, push: [1.0, 1.05], volume: 0.7 },                      // flare blooms on the hero
  ],
};
