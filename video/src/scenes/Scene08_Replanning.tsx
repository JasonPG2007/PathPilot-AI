import {HighlightBox} from '../components/HighlightBox';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene08_Replanning = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="07 · ADAPTIVE REPLANNING" title="Change the future, not the past" description="Updated constraints revise unfinished work while completed items remain immutable and credited." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.replanningFallback} label="Adaptive Replanning screenshot or recording" zoomTo={1.02} />
  <HighlightBox x={1325} y={210} width={500} height={640} label="Completed work stays locked" />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Replanning adapts the remaining journey without rewriting what the learner already completed.'}]} />
</SceneLayout>;
