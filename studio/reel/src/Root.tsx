import { Composition } from 'remotion';
import { ShootReel } from './ShootReel';
import { CinematicAd } from './CinematicAd';
import { FPS, reelDuration, skinbellEveryTwoHours, ReelProps } from './reel';
import { CINE_FPS, cineDuration, skinbellCinematic, CineProps } from './cinematic';

export const Root: React.FC = () => (
  <>
    <Composition
      id="ShootReel"
      component={ShootReel}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={reelDuration(skinbellEveryTwoHours)}
      defaultProps={skinbellEveryTwoHours}
      calculateMetadata={({ props }: { props: ReelProps }) => ({ durationInFrames: reelDuration(props) })}
    />
    <Composition
      id="CinematicAd"
      component={CinematicAd}
      width={1080}
      height={1920}
      fps={CINE_FPS}
      durationInFrames={cineDuration(skinbellCinematic)}
      defaultProps={skinbellCinematic}
      calculateMetadata={({ props }: { props: CineProps }) => ({ durationInFrames: cineDuration(props) })}
    />
  </>
);
