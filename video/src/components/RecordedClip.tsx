import {useState} from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {AssetPlaceholder} from './AssetPlaceholder';

type RecordedClipProps = {
  src: string;
  label: string;
  sourceStartFrame: number;
  playbackRate?: number;
  objectPosition?: string;
};

export const RecordedClip = ({
  src,
  label,
  sourceStartFrame,
  playbackRate = 1,
}: RecordedClipProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) return <AssetPlaceholder label={label} path={src} />;

  return (
    <div className="recorded-clip">
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={sourceStartFrame}
        playbackRate={playbackRate}
        muted
        onError={() => setFailed(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
        }}
      />
    </div>
  );
};
