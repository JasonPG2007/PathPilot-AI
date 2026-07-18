import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene10_Resources = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="09 · TRUSTED GROUNDING" title="From roadmap to reliable resources" description="Deterministic matching favors reputable providers and explains why each resource fits." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.resources} label="Trusted Resources screenshot" zoomTo={1.035} />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — ground each phase in trusted learning resources.'}]} />
</SceneLayout>;
