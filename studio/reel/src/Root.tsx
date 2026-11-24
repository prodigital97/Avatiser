import { Composition } from 'remotion';
import { ShootReel } from './ShootReel';
import { FPS, reelDuration, skinbellEveryTwoHours, ReelProps } from './reel';

export const Root: React.FC = () => (
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
);
