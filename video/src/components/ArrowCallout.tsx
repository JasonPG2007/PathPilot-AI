import {interpolate, useCurrentFrame} from 'remotion';

export const ArrowCallout = ({text, x, y, delay = 20}: {text: string; x: number; y: number; delay?: number}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - delay, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div className="arrow-callout" style={{left: x, top: y, opacity: progress, transform: `translateY(${(1 - progress) * 12}px)`}}>
      <span>↗</span><strong>{text}</strong>
    </div>
  );
};
