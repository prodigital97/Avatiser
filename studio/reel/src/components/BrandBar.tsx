import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ReelProps } from '../reel';

/* Top-left brand name plus an optional countdown pill. The pill carries the campaign idea
   ("every two hours") as a ticking 2:00:00 timer. Kept below the Reels top bar (~220 px). */
const fmt = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const BrandBar: React.FC<ReelProps> = ({ brand, timerFromSeconds, palette }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const opacity = interpolate(f, [4, 16, durationInFrames - 12, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const remaining = timerFromSeconds ? timerFromSeconds - Math.floor(f / fps) : 0;

  return (
    <div style={{ position: 'absolute', top: 236, left: 84, display: 'flex', alignItems: 'center', gap: 22, opacity }}>
      <div
        style={{
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: '0.34em',
          color: '#fff',
          textShadow: '0 1px 10px rgba(0,0,0,0.35)',
        }}
      >
        {brand}
      </div>
      {timerFromSeconds ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px 8px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.45)',
            backdropFilter: 'blur(6px)',
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 24,
            color: '#fff',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 6, background: palette.accent, display: 'inline-block' }} />
          Reapply in {fmt(remaining)}
        </div>
      ) : null}
    </div>
  );
};
