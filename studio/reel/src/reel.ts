/* A shoot reel is data: an ordered list of approved clips, the copy that rides on each,
   and an end card. Swap this file (or pass props) to cut another campaign. Clips and
   stills live in public/ (git-ignored) and are referenced by path relative to it. */

export type Line = { text: string; italic?: boolean };

export type Scene = {
  clip: string;          // path under public/, a 9:16 1080x1920 clip
  kicker?: string;       // small caps line above the headline
  lines: Line[];         // headline, one entry per line
  note?: string;         // small line under the headline
  place?: 'top' | 'top-right' | 'bottom' | 'bottom-right'; // keep type off the product and face
};

export type EndCard = {
  still: string;         // label-locked product still under public/
  title: string;
  subtitle: string;
  claims: string[];
  url: string;
};

export type ReelProps = {
  brand: string;
  timerFromSeconds?: number; // optional countdown pill, e.g. 7200 for "every two hours"
  palette: { accent: string; ink: string; paper: string; sky: string };
  scenes: Scene[];
  end: EndCard;
};

export const FPS = 30;
export const SCENE_FRAMES = 90;   // 3 s clips
export const XFADE = 10;          // frames of cross-dissolve between scenes
export const END_FRAMES = 84;

export const reelDuration = (p: ReelProps) =>
  p.scenes.length * (SCENE_FRAMES - XFADE) + XFADE + END_FRAMES - XFADE;

export const skinbellEveryTwoHours: ReelProps = {
  brand: 'SKINBELL',
  timerFromSeconds: 2 * 60 * 60,
  palette: { accent: '#F28C1B', ink: '#2B1D10', paper: '#F5F1EA', sky: '#1F4E8C' },
  scenes: [
    { clip: 'skinbell/01-hero.mp4', place: 'bottom-right', kicker: 'UltraSmart SPF 50+ PA+++', lines: [{ text: 'Every' }, { text: 'two hours.', italic: true }] },
    { clip: 'skinbell/02-reapply.mp4', lines: [{ text: 'Blends in.' }, { text: 'No white cast.', italic: true }] },
    { clip: 'skinbell/03-dispense.mp4', place: 'bottom-right', lines: [{ text: 'Lightweight.' }, { text: 'Never greasy.', italic: true }], note: 'Niacinamide · Hyaluronic Acid' },
    { clip: 'skinbell/04-parapet.mp4', place: 'top-right', kicker: 'Boots ★★★★ UVA', lines: [{ text: 'SPF 50+' }, { text: 'PA+++', italic: true }], note: 'Broad-spectrum UVA/UVB' },
    { clip: 'skinbell/05-walk.mp4', lines: [{ text: 'Reapply.' }, { text: 'Repeat.', italic: true }] },
  ],
  end: {
    still: 'skinbell/endcard.png',
    title: 'UltraSmart',
    subtitle: 'SPF 50+ PA+++',
    claims: ['Broad-spectrum UVA/UVB', 'No white cast', 'All skin types'],
    url: 'skinbell.in',
  },
};
