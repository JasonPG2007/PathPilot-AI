import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene05_Roadmap = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="04 · PERSONALIZED GUIDANCE" title="A roadmap with a coach built in" description="Coach insights connect the plan to the learner’s strengths, challenge, strategy, and next move." durationInFrames={durationInFrames}>
  <RecordedClip src={assets.generationAndRoadmapRecording} label="Completed roadmap reveal" sourceStartFrame={2925} playbackRate={1.23} objectPosition="top" />
  <Subtitle cues={[{from: 4, to: durationInFrames - 4, text: 'A personalized roadmap\nwith AI Coach Insights.'}]} />
</SceneLayout>;
