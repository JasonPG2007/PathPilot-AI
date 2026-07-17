import {useCurrentFrame} from 'remotion';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {ZoomImage} from '../components/ZoomImage';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene11_PDFShare = ({durationInFrames}: SceneProps) => {
  const frame = useCurrentFrame();
  const showShare = frame > durationInFrames / 2;
  return <SceneLayout eyebrow="10 · PROFESSIONAL OUTPUT" title="Export clearly. Share honestly." description="Create a structured PDF or share a concise summary while saved progress stays private on-device." durationInFrames={durationInFrames}>
    <ZoomImage src={showShare ? assets.share : assets.pdf} label={showShare ? 'Share & Export screenshot' : 'PDF preview screenshot'} zoomTo={1.02} />
    <div className="media-switch-label">{showShare ? 'SHARE & EXPORT' : 'PROFESSIONAL PDF'}</div>
    <Subtitle cues={[
      {from: 8, to: Math.floor(durationInFrames / 2), text: 'Export the roadmap as a polished, multi-page document.'},
      {from: Math.floor(durationInFrames / 2), to: durationInFrames - 8, text: 'Share a summary without pretending local progress is publicly hosted.'},
    ]} />
  </SceneLayout>;
};
