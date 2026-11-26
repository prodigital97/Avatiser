import { Composition } from 'remotion';
import { ShootReel } from './ShootReel';
import { CinematicAd } from './CinematicAd';
import { FPS, reelDuration, skinbellEveryTwoHours, ReelProps } from './reel';
import { CINE_FPS, cineDuration, skinbellCinematic, CineProps } from './cinematic';
import { FastCut } from './FastCut';
import { FC_FPS, fastCutDuration, skinbellLiquidSun, FastCutProps } from './fastcut';

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
    <Composition
      id="FastCut"
      component={FastCut}
      width={1080}
      height={1920}
      fps={FC_FPS}
      durationInFrames={fastCutDuration(skinbellLiquidSun)}
      defaultProps={skinbellLiquidSun}
      calculateMetadata={({ props }: { props: FastCutProps }) => ({ durationInFrames: fastCutDuration(props) })}
    />
  </>
);
