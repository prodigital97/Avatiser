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
export const fastCutDuration = (p: FastCutProps) => p.cuts.reduce((n, c) => n + cutFrames(c), 0) + p.tailFrames;

const C = (n: string) => `skinbell-ys/${n}.mp4`;

/* "Liquid Sun": SkinBell UltraSmart SPF 50+ PA+++. Times are filled in after QA of each MAGI clip. */
export const skinbellLiquidSun: FastCutProps = {
  tailFrames: 18,
  cuts: [
    { clip: C('S1-blade'), from: 0.3, to: 1.9, push: [1.0, 1.04], whipOut: 'left' },
    { clip: C('S2-pump'), from: 0.4, to: 1.5, whipOut: 'down' },
    { clip: C('S3-splash'), from: 0.2, to: 1.2, speed: 0.6 },
    { clip: C('S4-glass'), from: 0.5, to: 1.6, push: [1.0, 1.05], whipOut: 'up' },
    { clip: C('S2-pump'), from: 2.2, to: 3.2 },
    { clip: C('S5-swatch'), from: 0.6, to: 3.4, speed: 1.3, whipOut: 'right' },
    { clip: C('S3-splash'), from: 2.0, to: 2.9, speed: 0.6, whipOut: 'down' },
    { clip: C('S1-blade'), from: 2.6, to: 3.6, push: [1.03, 1.08] },
    { clip: C('S6-hero'), from: 0.2, to: 3.9, push: [1.0, 1.05] },
  ],
};
