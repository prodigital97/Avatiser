import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Cut, FC_FPS, FastCutProps, WHIP, Whip, cutFrames, cutStarts } from './fastcut';
import { Grain } from './components/Grain';

/* Directional motion blur: an SVG blur along one axis plus a fast slide, so a whip reads like a
   real camera whip-pan rather than a soft dissolve. */
const MotionBlur: React.FC<{ id: string; axis: 'x' | 'y'; amount: number }> = ({ id, axis, amount }) => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation={axis === 'x' ? `${amount} 0` : `0 ${amount}`} />
    </filter>
  </svg>
);

const dir = (w: Whip) => ({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const)[w];

const CutLayer: React.FC<{ cut: Cut; index: number; whipIn?: Whip }> = ({ cut, index, whipIn }) => {
  const f = useCurrentFrame();
  const n = cutFrames(cut);
  const { width, height } = useVideoConfig();
  // outgoing whip: last WHIP frames accelerate away; incoming whip: first WHIP frames settle in
  let tx = 0, ty = 0, blur = 0;
  if (cut.whipOut && f > n - WHIP) {
    const p = interpolate(f, [n - WHIP, n], [0, 1], { extrapolateRight: 'clamp' });
    const [dx, dy] = dir(cut.whipOut);
    tx = dx * p * p * width * 0.55; ty = dy * p * p * height * 0.55; blur = p * 60;
  }
  if (whipIn && f < WHIP) {
    const p = interpolate(f, [0, WHIP], [1, 0], { extrapolateRight: 'clamp' });
    const [dx, dy] = dir(whipIn);
    tx = -dx * p * p * width * 0.55; ty = -dy * p * p * height * 0.55; blur = p * 60;
  }
  const axis: 'x' | 'y' = (cut.whipOut && f > n - WHIP ? cut.whipOut : whipIn ?? 'up') === 'left' ||
    (cut.whipOut && f > n - WHIP ? cut.whipOut : whipIn) === 'right' ? 'x' : 'y';
  const push = cut.push ? interpolate(f, [0, n], cut.push) : 1;
  const id = `mb-${index}`;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <MotionBlur id={id} axis={axis} amount={blur} />
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${push})`, filter: blur > 0.5 ? `url(#${id})` : undefined }}>
        <OffthreadVideo
          src={staticFile(cut.clip)}
          trimBefore={Math.round(cut.from * FC_FPS)}
          playbackRate={cut.speed ?? 1}
          volume={cut.volume ?? 0.9}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FastCut: React.FC<FastCutProps> = ({ cuts, tailFrames }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const starts = cutStarts({ cuts, tailFrames });
  const last = cuts.length - 1;
  const fade = interpolate(f, [0, 6, durationInFrames - 14, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {cuts.map((c, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={cutFrames(c) + (i === last ? tailFrames : 0)} name={`cut-${i + 1}`}>
            <CutLayer cut={c} index={i} whipIn={i > 0 ? cuts[i - 1].whipOut : undefined} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
