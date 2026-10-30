import {makeProject} from '@motion-canvas/core';

import hook from './scenes/m1_l1_hook?scene';
import concept from './scenes/m1_l1_concept?scene';
import realterms from './scenes/m1_l1_realterms?scene';
import walkthrough from './scenes/m1_l1_walkthrough?scene';
import wrong from './scenes/m1_l1_wrong?scene';
import recap from './scenes/m1_l1_recap?scene';

// Once the narration is recorded, save it as audio/m1_l1.wav and
// uncomment these two lines to play it under the animation.
// import audio from '../audio/m1_l1.wav';

export default makeProject({
  name: 'M1 L1 · First Hello',
  scenes: [hook, concept, realterms, walkthrough, wrong, recap],
  // audio,
});
