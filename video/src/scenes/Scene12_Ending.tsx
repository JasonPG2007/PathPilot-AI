import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Subtitle} from '../components/Subtitle';
import {Transition} from '../components/Transition';
import {BrandAsset} from '../components/BrandAsset';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene12_Ending = ({durationInFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, config: {damping: 16}});
  return <Transition durationInFrames={durationInFrames}><div className="ending-scene">
    <BrandAsset src={assets.ending} label="PathPilot ending artwork" />
    <div className="ending-scene__logo" style={{transform: `scale(${scale})`}}>PathPilot <em>AI</em></div>
    <h1>Plan with rigor.<br/>Learn with context.<br/><span>Adapt without losing progress.</span></h1>
    <p>pathpilotaihackathon.vercel.app</p>
    <Subtitle cues={[{from: 4, to: durationInFrames - 4, text: 'PathPilot AI\nYour journey, built to adapt.'}]} />
  </div></Transition>;
};
