import {HighlightBox} from '../components/HighlightBox';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene09_Dashboard = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="08 · MOMENTUM" title="Progress that stays visible" description="Completion, current phase, next action, estimated finish, and achievements make the journey actionable." durationInFrames={durationInFrames}>
  <ZoomImage src={assets.dashboard} label="Journey Dashboard screenshot" zoomTo={1.03} objectPosition="top" />
  <HighlightBox x={350} y={430} width={1220} height={300} label="Progress + next action" />
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'The dashboard turns a generated plan into persistent, motivating progress.'}]} />
</SceneLayout>;
