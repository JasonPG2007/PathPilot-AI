import {interpolate, useCurrentFrame} from 'remotion';

type HighlightBoxProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
  label?: string;
  sourceWidth?: number;
  sourceHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  fit?: 'cover' | 'contain';
  objectPosition?: 'center' | 'top';
  zoomFrom?: number;
  zoomTo?: number;
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export const HighlightBox = ({
  x,
  y,
  width,
  height,
  delay = 15,
  label,
  sourceWidth = 1920,
  sourceHeight = 1080,
  viewportWidth = 1500,
  viewportHeight = 740,
  fit = 'cover',
  objectPosition = 'top',
  zoomFrom = 1,
  zoomTo = 1.03,
}: HighlightBoxProps) => {
  const frame = useCurrentFrame();
  const baseScale = fit === 'cover'
    ? Math.max(viewportWidth / sourceWidth, viewportHeight / sourceHeight)
    : Math.min(viewportWidth / sourceWidth, viewportHeight / sourceHeight);
  const renderedWidth = sourceWidth * baseScale;
  const renderedHeight = sourceHeight * baseScale;
  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = objectPosition === 'top' ? 0 : (viewportHeight - renderedHeight) / 2;
  const zoom = interpolate(frame, [0, 180], [zoomFrom, zoomTo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const transformedX = centerX + (offsetX + x * baseScale - centerX) * zoom;
  const transformedY = centerY + (offsetY + y * baseScale - centerY) * zoom;
  const transformedWidth = width * baseScale * zoom;
  const transformedHeight = height * baseScale * zoom;
  const left = clamp(transformedX, 0, Math.max(0, viewportWidth - transformedWidth));
  const top = clamp(transformedY, 0, Math.max(0, viewportHeight - transformedHeight));
  const visibleWidth = Math.min(transformedWidth, viewportWidth - left);
  const visibleHeight = Math.min(transformedHeight, viewportHeight - top);
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className="highlight-box"
      style={{left, top, width: visibleWidth, height: visibleHeight, opacity}}
    >
      {label ? <span>{label}</span> : null}
    </div>
  );
};
