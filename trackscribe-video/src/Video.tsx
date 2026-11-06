import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Camera} from './Camera';
import {CutFlash, FadeInOut, Grade, PortalSparks, SpeedLines, Storm, SunGlow} from './Overlays';
import {Sound} from './Sound';

export const TrackscribeVideo: React.FC = () => (
  <AbsoluteFill style={{background: '#0a0416'}}>
    <Camera />
    <SunGlow />
    <PortalSparks />
    <Storm />
    <SpeedLines />
    <Grade />
    <CutFlash />
    <FadeInOut />
    <Sound />
  </AbsoluteFill>
);
