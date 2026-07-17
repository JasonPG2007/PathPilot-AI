import {Composition} from 'remotion';
import {PathPilotDemo, TOTAL_DURATION} from './PathPilotDemo';

export const RemotionRoot = () => (
  <Composition
    id="PathPilotDemo"
    component={PathPilotDemo}
    durationInFrames={TOTAL_DURATION}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{musicVolume: 0.12}}
  />
);
