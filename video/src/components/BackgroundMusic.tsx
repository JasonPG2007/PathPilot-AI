import {useState} from 'react';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';

export const BackgroundMusic = ({src, volume = 0.12}: {src: string; volume?: number}) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <Audio src={staticFile(src)} volume={volume} loop onError={() => setFailed(true)} />;
};
