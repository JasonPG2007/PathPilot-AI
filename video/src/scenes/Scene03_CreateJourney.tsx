import {HighlightBox} from '../components/HighlightBox';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene03_CreateJourney = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="02 · PERSONALIZATION" title="Built around the learner" description="Goal, experience, time, skills, and learning style become explicit planning constraints." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.createJourney} label="Create Journey screenshot" />
  <HighlightBox x={1010} y={335} width={520} height={420} label="Live learner summary" />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'The journey begins with the learner’s real constraints — not a generic prompt.'}]} />
</SceneLayout>;
