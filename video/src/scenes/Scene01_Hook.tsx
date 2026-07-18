import {interpolate, useCurrentFrame} from 'remotion';
import {Subtitle} from '../components/Subtitle';
import {Transition} from '../components/Transition';
import {BrandAsset} from '../components/BrandAsset';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene01_Hook = ({durationInFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 20], [40, 0], {extrapolateRight: 'clamp'});
  return <Transition durationInFrames={durationInFrames}><div className="hook-scene">
    <BrandAsset src={assets.logo} label="PathPilot AI logo" />
    <span className="hook-scene__badge">PATHPILOT AI</span>
    <h1 style={{transform: `translateY(${rise}px)`}}>A roadmap that adapts<br/><em>as the learner does.</em></h1>
    <p>Plan with rigor. Learn with context. Adapt without losing progress.</p>
    <Subtitle cues={[{from: 10, to: durationInFrames - 10, text: 'Subtitle placeholder — meet your adaptive AI learning coach.'}]} />
  </div></Transition>;
};
