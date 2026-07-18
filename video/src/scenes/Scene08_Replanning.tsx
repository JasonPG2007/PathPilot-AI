import {Sequence} from 'remotion';
import {RecordedClip} from '../components/RecordedClip';
import {SceneLayout} from '../components/SceneLayout';
import {Subtitle} from '../components/Subtitle';
import {assets} from '../assetManifest';
import type {SceneProps} from '../types';

export const Scene08_Replanning = ({durationInFrames}: SceneProps) => <SceneLayout eyebrow="07 · ADAPTIVE REPLANNING" title="Change the future, not the past" description="Updated constraints revise unfinished work while completed items remain immutable and credited." durationInFrames={durationInFrames}>
  <Sequence durationInFrames={350}>
    <RecordedClip src={assets.replanningRecording} label="Adaptive Replanning inputs" sourceStartFrame={375} playbackRate={1.5} />
  </Sequence>
  <Sequence from={350} durationInFrames={190}>
    <RecordedClip src={assets.replanningRecording} label="Successful replan result" sourceStartFrame={1350} playbackRate={1.5} />
  </Sequence>
  <Subtitle cues={[{from: 8, to: durationInFrames - 8, text: 'Subtitle placeholder — revise unfinished work while preserving completed progress.'}]} />
</SceneLayout>;
