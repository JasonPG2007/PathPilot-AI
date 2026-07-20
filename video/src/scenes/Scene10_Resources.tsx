import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {RecordedClip} from '../components/RecordedClip';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene10_Resources = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="09 · TRUSTED GROUNDING" title="From roadmap to reliable resources" description="Deterministic matching favors reputable providers and explains why each resource fits." durationInFrames={durationInFrames}>
  <RecordedClip src={assets.resourcesRecording} label="Trusted Resources interaction" sourceStartFrame={0} playbackRate={1.25} />
  <Subtitle cues={[{from: 4, to: durationInFrames - 4, text: 'Trusted resources,\nmatched to each phase.'}]} />
</SceneLayout>;
