import type {ReactNode} from 'react';
import {Transition} from './Transition';

export const SceneLayout = ({eyebrow, title, description, durationInFrames, children}: {
  eyebrow: string;
  title: string;
  description: string;
  durationInFrames: number;
  children?: ReactNode;
}) => (
  <Transition durationInFrames={durationInFrames}>
    <div className="scene">
      <div className="scene__glow scene__glow--one" />
      <div className="scene__glow scene__glow--two" />
      <header className="scene__header">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <main className="scene__media">{children}</main>
    </div>
  </Transition>
);
