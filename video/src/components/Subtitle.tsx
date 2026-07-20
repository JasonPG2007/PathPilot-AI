import {useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useCurrentFrame} from 'remotion';
import type {SubtitleCue} from '../types';

export const Subtitle = ({cues}: {cues: SubtitleCue[]}) => {
  const frame = useCurrentFrame();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const cue = cues.find((item) => frame >= item.from && frame < item.to);

  useLayoutEffect(() => {
    setOverlayRoot(anchorRef.current?.closest('.scene-transition') as HTMLElement | null);
  }, []);

  return <>
    <span ref={anchorRef} className="subtitle-anchor" aria-hidden="true" />
    {cue && overlayRoot
      ? createPortal(<div className="subtitle" role="presentation">{cue.text}</div>, overlayRoot)
      : null}
  </>;
};
