import { AbsoluteFill, Sequence, continueRender, delayRender } from 'remotion';
import { useEffect, useState } from 'react';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import { ReelProps, SCENE_FRAMES, XFADE, END_FRAMES } from './reel';
import { ClipScene } from './components/ClipScene';
import { EndCardScene } from './components/EndCardScene';
import { Grain } from './components/Grain';
import { BrandBar } from './components/BrandBar';

/* Fonts are bundled locally (fontsource), but the browser still loads them lazily:
   hold the first frame until every face we draw with is ready. */
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('96px "Instrument Serif"'),
      document.fonts.load('italic 96px "Instrument Serif"'),
      document.fonts.load('500 28px Inter'),
      document.fonts.load('600 28px Inter'),
    ]).then(() => continueRender(handle));
  }, [handle]);
};

export const ShootReel: React.FC<ReelProps> = (props) => {
  useFonts();
  const { scenes, end, palette } = props;
  const step = SCENE_FRAMES - XFADE;
  const endFrom = scenes.length * step;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((s, i) => (
        <Sequence key={s.clip} from={i * step} durationInFrames={SCENE_FRAMES} name={`scene-${i + 1}`}>
          <ClipScene scene={s} index={i} total={scenes.length} palette={palette} />
        </Sequence>
      ))}
      <Sequence from={endFrom} durationInFrames={END_FRAMES} name="end-card">
        <EndCardScene end={end} palette={palette} />
      </Sequence>
      <Sequence durationInFrames={endFrom + XFADE} name="brand-bar">
        <BrandBar {...props} />
      </Sequence>
      <Grain />
    </AbsoluteFill>
  );
};
