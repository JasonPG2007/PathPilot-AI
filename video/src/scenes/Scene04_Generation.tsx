import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene04_Generation = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="03 · STRUCTURED AI WORKFLOW" title="Planner → Critic → Revision" description="Three explicit stages draft, challenge, and refine one schema-validated roadmap." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.generationFallback} label="Processing workflow screenshot or recording" zoomTo={1.03} />
  <div className="workflow-pills"><span>PLAN</span><b>→</b><span>CRITIQUE</span><b>→</b><span>REVISE</span></div>
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Planner drafts. Critic audits feasibility. Revision returns strict structured output.'}]} />
</SceneLayout>;
