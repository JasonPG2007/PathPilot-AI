import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene07_ExplainWhy = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="06 · EXPLAINABILITY" title="Know why every step matters" description="Contextual explanations connect prerequisites, expected benefit, and career relevance." durationInFrames={durationInFrames}>
  <RecordedClip src={assets.generationAndRoadmapRecording} label="Explain Why interaction" sourceStartFrame={3495} />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — explain the reason, career impact, and expected benefit.'}]} />
</SceneLayout>;
