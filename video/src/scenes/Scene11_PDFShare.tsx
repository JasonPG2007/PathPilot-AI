import {Sequence} from 'remotion';
import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene11_PDFShare = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="10 · PROFESSIONAL OUTPUT" title="Export clearly. Share honestly." description="Create a structured PDF or share a concise summary while saved progress stays private on-device." durationInFrames={durationInFrames}>
  <Sequence durationInFrames={238}>
    <RecordedClip src={assets.exportRecording} label="Professional PDF export" sourceStartFrame={525} playbackRate={1.7} />
    <div className="media-switch-label">PROFESSIONAL PDF</div>
  </Sequence>
  <Sequence from={238} durationInFrames={106}>
    <RecordedClip src={assets.exportRecording} label="Share and Export panel" sourceStartFrame={990} playbackRate={1.7} />
    <div className="media-switch-label">SHARE & EXPORT</div>
  </Sequence>
  <Subtitle cues={[
    {from: 4, to: 238, text: 'Professional PDF export.\nHonest, privacy-aware sharing.'},
    {from: 238, to: durationInFrames - 4, text: 'Professional PDF export.\nHonest, privacy-aware sharing.'},
  ]} />
</SceneLayout>;
