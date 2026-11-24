import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Scene, SCENE_FRAMES } from '../reel';

/* Editorial caption: small tracked kicker, serif headline revealed word by word,
   optional note. Sits above the Reels UI safe zone (bottom ~420 px, right ~150 px). */
const IN = 6;
const OUT = SCENE_FRAMES - 14;

const Word: React.FC<{ word: string; delay: number; italic?: boolean }> = ({ word, delay, italic }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200, mass: 0.6 } });
  const out = interpolate(f, [OUT, OUT + 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span
      style={{
        display: 'inline-block',
        marginLeft: '0.12em',
        marginRight: '0.12em',
        opacity: s * out,
        transform: `translateY(${(1 - s) * 34}px)`,
        filter: `blur(${(1 - s) * 8}px)`,
        fontStyle: italic ? 'italic' : 'normal',
      }}
    >
      {word}
    </span>
  );
};

export const Caption: React.FC<{ scene: Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const fade = (start: number) =>
    interpolate(f, [start, start + 10, OUT, OUT + 10], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  let d = IN + (scene.kicker ? 5 : 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: scene.place === 'bottom-right' ? 300 : scene.place === 'top-right' ? 540 : 84,
        right: 150,
        color: '#fff',
        textAlign: scene.place === 'bottom-right' ? 'right' : 'left',
        ...(scene.place === 'top' || scene.place === 'top-right' ? { top: 330 } : { bottom: 430 }),
      }}
    >
      {scene.kicker ? (
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: fade(IN) * 0.92,
            marginBottom: 18,
            textShadow: '0 1px 12px rgba(0,0,0,0.35)',
          }}
        >
          {scene.kicker}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: 'Instrument Serif',
          fontSize: 118,
          lineHeight: 0.98,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 24px rgba(0,0,0,0.35)',
        }}
      >
        {scene.lines.map((line, li) => (
          <div key={li}>
            {line.text.split(' ').map((w, wi) => {
              const el = <Word key={wi} word={w} delay={d} italic={line.italic} />;
              d += 4;
              return el;
            })}
          </div>
        ))}
      </div>
      {scene.note ? (
        <div
          style={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 28,
            marginTop: 22,
            opacity: fade(d + 4) * 0.9,
            textShadow: '0 1px 12px rgba(0,0,0,0.35)',
          }}
        >
          {scene.note}
        </div>
      ) : null}
    </div>
  );
};
