import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { CINE_FPS, CineProps, DISSOLVE, Move, Shot, shotFrames } from './cinematic';
import { Grain } from './components/Grain';

/* Text-free cinematic cut: slow-motion shots, slow virtual camera moves, long dissolves,
   a sunlight bloom into the product end frame, fade in from and out to black. */

const ease = Easing.inOut(Easing.sin);

const Camera: React.FC<{ move: Move; frames: number; children: React.ReactNode }> = ({ move, frames, children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, frames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
  const s = move.scale[0] + (move.scale[1] - move.scale[0]) * p;
  const x = move.x ? move.x[0] + (move.x[1] - move.x[0]) * p : 0;
  const y = move.y ? move.y[0] + (move.y[1] - move.y[0]) * p : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: move.origin ?? '50% 50%' }}>
      {children}
    </AbsoluteFill>
  );
};

const ShotLayer: React.FC<{ shot: Shot; first: boolean }> = ({ shot, first }) => {
  const f = useCurrentFrame();
  const frames = shotFrames(shot);
  const opacity = first ? 1 : interpolate(f, [0, DISSOLVE], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  return (
    <AbsoluteFill style={{ opacity }}>
      <Camera move={shot.move} frames={frames}>
        <OffthreadVideo
          src={staticFile(shot.clip)}
          muted
          playbackRate={shot.speed}
          trimBefore={Math.round(shot.from * CINE_FPS)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Camera>
    </AbsoluteFill>
  );
};

const EndFrame: React.FC<{ still: string; frames: number }> = ({ still, frames }) => {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, DISSOLVE], [0, 1], { extrapolateRight: 'clamp', easing: ease });
  const s = interpolate(f, [0, frames], [1.0, 1.08], { easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: '45% 40%' }}>
        <Img src={staticFile(still)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* a warm wash of sunlight that peaks on a cut, like flare from the lens */
const SunBloom: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, 20], [0, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        mixBlendMode: 'screen',
        background: 'radial-gradient(ellipse at 25% 15%, rgba(255,236,200,1) 0%, rgba(255,200,140,0.6) 35%, rgba(255,180,120,0) 70%)',
      }}
    />
  );
};

export const CinematicAd: React.FC<CineProps> = ({ shots, endStill, endFrames }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let at = 0;
  const starts = shots.map((s) => {
    const start = at;
    at += shotFrames(s) - DISSOLVE;
    return start;
  });
  const endFrom = at;
  const fade = interpolate(f, [0, 12, durationInFrames - 16, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ opacity: fade }}>
        {shots.map((s, i) => (
          <Sequence key={s.clip} from={starts[i]} durationInFrames={shotFrames(s)} name={`shot-${i + 1}`}>
            <ShotLayer shot={s} first={i === 0} />
          </Sequence>
        ))}
        <Sequence from={endFrom} durationInFrames={endFrames} name="end-frame">
          <EndFrame still={endStill} frames={endFrames} />
        </Sequence>
        <Sequence from={endFrom - 6} durationInFrames={22} name="sun-bloom">
          <SunBloom />
        </Sequence>
        {/* gentle edge falloff for every shot, the grade's vignette carried over the virtual moves */}
        <AbsoluteFill
          style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,6,2,0.28) 100%)' }}
        />
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
