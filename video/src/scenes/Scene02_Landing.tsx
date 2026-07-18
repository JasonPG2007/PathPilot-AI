import {ArrowCallout} from '../components/ArrowCallout';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene02_Landing = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="01 · PRODUCT VISION" title="From career goal to guided journey" description="A focused starting point for personalized, explainable learning." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.landing} label="Landing page screenshot" />
  <ArrowCallout text="Start with one goal" x={1220} y={650} />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — turn one goal into a guided learning journey.'}]} />
</SceneLayout>;
