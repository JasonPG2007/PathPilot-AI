import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene06_Strategies = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="05 · CHOICE WITH TRADE-OFFS" title="Fast. Balanced. Deep." description="Compare speed, workload, depth, risk, and confidence without losing completed progress." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.strategies} label="Alternative Roadmaps screenshot" zoomTo={1.025} objectPosition="top" />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — compare Fast, Balanced, and Deep trade-offs.'}]} />
</SceneLayout>;
