import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Lottie, LottieAnimationData} from '@remotion/lottie';
import bell from './lottie/bell.json';
import checklist from './lottie/checklist.json';
import chart from './lottie/chart.json';
import coins from './lottie/coins.json';
import calendarMiss from './lottie/calendar_miss.json';
import burst from './lottie/burst.json';
import logo from './lottie/logo.json';
import ping from './lottie/ping.json';

const all = {bell, checklist, chart, coins, calendarMiss, burst, logo, ping} as Record<string, unknown>;

/** Dev sheet: every Lottie side by side, to check the illustrations. */
export const LottieSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#1A0B2E', flexDirection: 'row', flexWrap: 'wrap'}}>
    {Object.entries(all).map(([k, data]) => (
      <div key={k} style={{width: 270, height: 270, border: '1px solid #333'}}>
        <Lottie animationData={data as LottieAnimationData} loop />
      </div>
    ))}
  </AbsoluteFill>
);
