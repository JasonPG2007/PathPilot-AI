import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type HighlightBoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
  label?: string;
};

export const HighlightBox = ({x, y, width, height, delay = 15, label}: HighlightBoxProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - delay, fps, config: {damping: 18}});
  return (
    <div
      className="highlight-box"
      style={{left: x, top: y, width, height, opacity: interpolate(progress, [0, 1], [0, 1]), transform: `scale(${0.96 + progress * 0.04})`}}
    >
      {label ? <span>{label}</span> : null}
    </div>
  );
};
