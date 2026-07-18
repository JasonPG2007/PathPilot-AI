import {Sequence} from 'remotion';
import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene11_PDFShare = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="10 · PROFESSIONAL OUTPUT" title="Export clearly. Share honestly." description="Create a structured PDF or share a concise summary while saved progress stays private on-device." durationInFrames={durationInFrames}>
  <Sequence durationInFrames={270}>
    <RecordedClip src={assets.exportRecording} label="Professional PDF export" sourceStartFrame={540} playbackRate={1.5} />
    <div className="media-switch-label">PROFESSIONAL PDF</div>
  </Sequence>
  <Sequence from={270} durationInFrames={210}>
    <RecordedClip src={assets.exportRecording} label="Share and Export panel" sourceStartFrame={960} />
    <div className="media-switch-label">SHARE & EXPORT</div>
  </Sequence>
  <Subtitle cues={[
    {from: 8, to: 270, text: 'Subtitle placeholder — export a polished multi-page roadmap.'},
    {from: 270, to: durationInFrames - 8, text: 'Subtitle placeholder — share a concise summary without exposing local progress.'},
  ]} />
</SceneLayout>;
