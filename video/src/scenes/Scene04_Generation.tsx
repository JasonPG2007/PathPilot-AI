import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene04_Generation = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="03 · STRUCTURED AI WORKFLOW" title="Planner → Critic → Revision" description="Three explicit stages draft, challenge, and refine one schema-validated roadmap." durationInFrames={durationInFrames}>
  <RecordedClip src={assets.generationAndRoadmapRecording} label="Planner, Critic, and Revision recording" sourceStartFrame={510} playbackRate={5} />
  <div className="workflow-pills"><span>PLAN</span><b>→</b><span>CRITIQUE</span><b>→</b><span>REVISE</span></div>
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — Planner drafts, Critic audits, Revision returns structured output.'}]} />
</SceneLayout>;
