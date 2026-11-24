import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { Scene, ReelProps, SCENE_FRAMES, XFADE } from '../reel';
import { Caption } from './Caption';

/* One approved clip, full-bleed. It fades in over the previous scene (cross-dissolve),
   drifts in very slightly so cuts never feel static, and carries its caption. */
export const ClipScene: React.FC<{ scene: Scene; index: number; total: number; palette: ReelProps['palette'] }> = ({
  scene,
  index,
}) => {
  const f = useCurrentFrame();
  const fadeIn = index === 0 ? 1 : interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: 'clamp' });
  const drift = interpolate(f, [0, SCENE_FRAMES], [1.0, 1.035], { easing: Easing.out(Easing.quad) });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <OffthreadVideo src={staticFile(scene.clip)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      {/* soft lower scrim so white type reads on whitewash and white shirts */}
      <AbsoluteFill
        style={{
          background:
            scene.place === 'top' || scene.place === 'top-right'
              ? 'linear-gradient(180deg, rgba(20,12,4,0.5) 0%, rgba(20,12,4,0.32) 30%, rgba(0,0,0,0) 52%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.25) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 48%, rgba(20,12,4,0.55) 82%, rgba(20,12,4,0.62) 100%)',
        }}
      />
      <Caption scene={scene} />
    </AbsoluteFill>
  );
};
