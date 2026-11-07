import React from 'react';
import {Composition} from 'remotion';
import {TrackscribeAd} from './Ad';
import {LottieSheet} from './LottieSheet';
import {DURATION, FPS} from './timing';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TrackscribeAd" component={TrackscribeAd} durationInFrames={DURATION * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="LottieSheet" component={LottieSheet} durationInFrames={90} fps={30} width={1080} height={540} />
  </>
);
