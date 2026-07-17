import type {ReactNode} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';

export const Transition = ({children, durationInFrames, edge = 12}: {children: ReactNode; durationInFrames: number; edge?: number}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, edge, durationInFrames - edge, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translate = interpolate(frame, [0, edge], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div className="scene-transition" style={{opacity, transform: `translateY(${translate}px)`}}>{children}</div>;
};
