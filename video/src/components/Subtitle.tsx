import {useCurrentFrame} from 'remotion';
import type {SubtitleCue} from '../types';

export const Subtitle = ({cues}: {cues: SubtitleCue[]}) => {
  const frame = useCurrentFrame();
  const cue = cues.find((item) => frame >= item.from && frame < item.to);
  if (!cue) return null;
  return <div className="subtitle" role="presentation">{cue.text}</div>;
};
