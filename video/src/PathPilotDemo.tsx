import {Series} from 'remotion';
import {assets} from './assetManifest';
import {BackgroundMusic} from './components/BackgroundMusic';
import {Scene01_Hook} from './scenes/Scene01_Hook';
import {Scene02_Landing} from './scenes/Scene02_Landing';
import {Scene03_CreateJourney} from './scenes/Scene03_CreateJourney';
import {Scene04_Generation} from './scenes/Scene04_Generation';
import {Scene05_Roadmap} from './scenes/Scene05_Roadmap';
import {Scene06_Strategies} from './scenes/Scene06_Strategies';
import {Scene07_ExplainWhy} from './scenes/Scene07_ExplainWhy';
import {Scene08_Replanning} from './scenes/Scene08_Replanning';
import {Scene09_Dashboard} from './scenes/Scene09_Dashboard';
import {Scene10_Resources} from './scenes/Scene10_Resources';
import {Scene11_PDFShare} from './scenes/Scene11_PDFShare';
import {Scene12_Ending} from './scenes/Scene12_Ending';

export const sceneDurations = {
  hook: 120,
  landing: 150,
  createJourney: 165,
  generation: 180,
  roadmap: 180,
  strategies: 165,
  explainWhy: 150,
  replanning: 180,
  dashboard: 165,
  resources: 150,
  pdfShare: 180,
  ending: 135,
} as const;

export const TOTAL_DURATION = Object.values(sceneDurations).reduce((sum, duration) => sum + duration, 0);

export const PathPilotDemo = ({musicVolume}: {musicVolume: number}) => (
  <div className="video-root">
    <BackgroundMusic src={assets.music} volume={musicVolume} />
    <Series>
      <Series.Sequence durationInFrames={sceneDurations.hook}><Scene01_Hook durationInFrames={sceneDurations.hook} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.landing}><Scene02_Landing durationInFrames={sceneDurations.landing} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.createJourney}><Scene03_CreateJourney durationInFrames={sceneDurations.createJourney} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.generation}><Scene04_Generation durationInFrames={sceneDurations.generation} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.roadmap}><Scene05_Roadmap durationInFrames={sceneDurations.roadmap} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.strategies}><Scene06_Strategies durationInFrames={sceneDurations.strategies} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.explainWhy}><Scene07_ExplainWhy durationInFrames={sceneDurations.explainWhy} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.replanning}><Scene08_Replanning durationInFrames={sceneDurations.replanning} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.dashboard}><Scene09_Dashboard durationInFrames={sceneDurations.dashboard} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.resources}><Scene10_Resources durationInFrames={sceneDurations.resources} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.pdfShare}><Scene11_PDFShare durationInFrames={sceneDurations.pdfShare} /></Series.Sequence>
      <Series.Sequence durationInFrames={sceneDurations.ending}><Scene12_Ending durationInFrames={sceneDurations.ending} /></Series.Sequence>
    </Series>
  </div>
);
