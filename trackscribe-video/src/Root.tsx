import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './timeline';
import {TrackscribeVideo} from './Video';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Trackscribe"
      component={TrackscribeVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
