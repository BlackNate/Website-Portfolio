import '@fontsource/bangers/400.css';
import '@fontsource/comic-neue/700.css';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera} from './Camera';
import {Captions} from './Captions';
import {CutFlash, EndCard, Grade, Intro, PortalSparks, SpeedLines, Storm, SunGlow} from './Overlays';
import {Sound} from './Sound';

export const TrackscribeVideo: React.FC<{captions: boolean}> = ({captions}) => (
  <AbsoluteFill style={{background: '#0a0416'}}>
    <Camera />
    <SunGlow />
    <PortalSparks />
    <Storm />
    <SpeedLines />
    <Grade />
    <CutFlash />
    {captions && <Captions />}
    <Intro />
    <EndCard />
    <Sound />
  </AbsoluteFill>
);
