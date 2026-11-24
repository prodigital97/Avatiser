/* A text-free cinematic cut: each shot is a window of a graded, 60 fps (motion-interpolated)
   clip played in slow motion, with a slow virtual camera move on top. Clips are prepared by
   ffmpeg (minterpolate to 60 fps + the beauty grade) into public/<campaign>-cine/. */

export type Move = {
  scale: [number, number];      // start, end zoom
  x?: [number, number];         // start, end pan in px (output space)
  y?: [number, number];
  origin?: string;              // CSS transform-origin, aim the push at the subject
};

export type Shot = {
  clip: string;                 // path under public/
  from: number;                 // source in-point, seconds
  to: number;                   // source out-point, seconds
  speed: number;                // playback rate (0.5 = half speed)
  move: Move;
};

export type CineProps = {
  shots: Shot[];
  endStill: string;             // graded, label-locked product still under public/
  endFrames: number;
};

export const CINE_FPS = 30;
export const DISSOLVE = 14;

export const shotFrames = (s: Shot) => Math.round(((s.to - s.from) / s.speed) * CINE_FPS);

export const cineDuration = (p: CineProps) =>
  p.shots.reduce((n, s) => n + shotFrames(s) - DISSOLVE, 0) + p.endFrames;

export const skinbellCinematic: CineProps = {
  shots: [
    // the product alone in its world: pull back from the bottle as the sun glows through it
    { clip: 'skinbell-cine/04-parapet.mp4', from: 0.0, to: 2.1, speed: 0.6, move: { scale: [1.1, 1.0], y: [-30, 0], origin: '42% 45%' } },
    // she walks into the light
    { clip: 'skinbell-cine/05-walk.mp4', from: 0.2, to: 2.4, speed: 0.55, move: { scale: [1.0, 1.07], y: [10, -20], origin: '50% 40%' } },
    // the turn to camera, slow push toward her face
    { clip: 'skinbell-cine/01-hero.mp4', from: 0.25, to: 2.85, speed: 0.6, move: { scale: [1.02, 1.12], origin: '52% 30%' } },
    // the blend: cream sinks in, no white cast
    { clip: 'skinbell-cine/02-reapply.mp4', from: 0.0, to: 2.95, speed: 0.8, move: { scale: [1.0, 1.06], x: [0, -12], origin: '38% 24%' } },
    // texture macro on the fingertip
    { clip: 'skinbell-cine/03-dispense.mp4', from: 0.2, to: 2.45, speed: 0.55, move: { scale: [1.0, 1.08], origin: '55% 22%' } },
  ],
  endStill: 'skinbell-cine/endframe.png',
  endFrames: 96,
};
