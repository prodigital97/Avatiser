import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { EndCard, ReelProps, XFADE } from '../reel';

/* Product end card on the brand's paper colour: the label-locked still in a rounded frame,
   name, claims taken only from the brand's own product page, and the URL. */
export const EndCardScene: React.FC<{ end: EndCard; palette: ReelProps['palette'] }> = ({ end, palette }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(f, [0, XFADE], [0, 1], { extrapolateRight: 'clamp' });
  const rise = spring({ frame: f - 4, fps, config: { damping: 200 } });
  const zoom = interpolate(f, [0, 84], [1.06, 1.0], { easing: Easing.out(Easing.cubic) });
  const t = (start: number) =>
    interpolate(f, [start, start + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: palette.paper, alignItems: 'center' }}>
      <div
        style={{
          marginTop: 250,
          width: 760,
          height: 900,
          borderRadius: 36,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(43,29,16,0.22)',
          transform: `translateY(${(1 - rise) * 60}px)`,
          opacity: rise,
        }}
      >
        <Img src={staticFile(end.still)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
      </div>
      <div style={{ textAlign: 'center', color: palette.ink, marginTop: 56 }}>
        <div style={{ fontFamily: 'Instrument Serif', fontSize: 120, lineHeight: 1, opacity: t(10) }}>{end.title}</div>
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '0.26em',
            marginTop: 16,
            color: palette.accent,
            opacity: t(16),
          }}
        >
          {end.subtitle}
        </div>
        <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 27, marginTop: 30, opacity: t(24) * 0.85 }}>
          {end.claims.join('  ·  ')}
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 40,
            padding: '16px 40px',
            borderRadius: 999,
            background: palette.ink,
            color: palette.paper,
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '0.08em',
            opacity: t(32),
          }}
        >
          {end.url}
        </div>
      </div>
    </AbsoluteFill>
  );
};
