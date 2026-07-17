import {useState} from 'react';
import {Img, staticFile} from 'remotion';

export const BrandAsset = ({src, label}: {src: string; label: string}) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="brand-asset brand-asset--missing">{label}</div>;
  return <Img className="brand-asset" src={staticFile(src)} alt="" onError={() => setFailed(true)} />;
};
