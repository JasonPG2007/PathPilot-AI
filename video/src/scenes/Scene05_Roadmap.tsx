import {HighlightBox} from '../components/HighlightBox';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene05_Roadmap = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="04 · PERSONALIZED GUIDANCE" title="A roadmap with a coach built in" description="Coach insights connect the plan to the learner’s strengths, challenge, strategy, and next move." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.roadmap} label="Roadmap overview screenshot" zoomTo={1.04} objectPosition="top" />
  <HighlightBox x={350} y={310} width={1220} height={280} label="AI Coach Insights" />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'The final roadmap includes practical phases, feasibility, and concise AI Coach Insights.'}]} />
</SceneLayout>;
