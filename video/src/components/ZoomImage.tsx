import {useState} from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {AssetPlaceholder} from './AssetPlaceholder';

type ZoomImageProps = {
  src: string;
  label: string;
  zoomFrom?: number;
  zoomTo?: number;
  objectPosition?: string;
};

export const ZoomImage = ({src, label, zoomFrom = 1, zoomTo = 1.06, objectPosition = 'center'}: ZoomImageProps) => {
  const frame = useCurrentFrame();
  const [failed, setFailed] = useState(false);
  const scale = interpolate(frame, [0, 180], [zoomFrom, zoomTo], {extrapolateRight: 'clamp'});

  if (failed) return <AssetPlaceholder label={label} path={src} />;

  return (
    <div className="zoom-image">
      <Img
        src={staticFile(src)}
        alt=""
        onError={() => setFailed(true)}
        style={{transform: `scale(${scale})`, objectPosition}}
      />
    </div>
  );
};
