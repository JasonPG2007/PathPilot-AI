import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene03_CreateJourney = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="02 · PERSONALIZATION" title="Built around the learner" description="Goal, experience, time, skills, and learning style become explicit planning constraints." durationInFrames={durationInFrames}>
  <RecordedClip src={assets.formToProcessingRecording} label="Create Journey recording" sourceStartFrame={15} playbackRate={1.59} />
  <Subtitle cues={[{from: 4, to: durationInFrames - 4, text: 'Built around your goals,\nskills, time, and learning style.'}]} />
</SceneLayout>;
