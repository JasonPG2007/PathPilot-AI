import {ArrowCallout} from '../components/ArrowCallout';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene07_ExplainWhy = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="06 · EXPLAINABILITY" title="Know why every step matters" description="Contextual explanations connect prerequisites, expected benefit, and career relevance." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.explainWhy} label="Explain Why screenshot" zoomTo={1.03} />
  <ArrowCallout text="Reason, impact, benefit" x={1230} y={340} />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Explain Why makes roadmap recommendations transparent instead of mysterious.'}]} />
</SceneLayout>;
