import {useState} from 'react';
import {staticFile} from 'remotion';

export const BrandAsset = ({src, label}: {src: string; label: string}) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <img className="brand-asset" src={staticFile(src)} alt="" onError={() => setFailed(true)} />;
};
