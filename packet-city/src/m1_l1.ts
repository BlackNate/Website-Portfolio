import {makeProject} from '@motion-canvas/core';

import hook from './scenes/m1_l1_hook?scene';
import concept from './scenes/m1_l1_concept?scene';
import realterms from './scenes/m1_l1_realterms?scene';
import walkthrough from './scenes/m1_l1_walkthrough?scene';
import wrong from './scenes/m1_l1_wrong?scene';
import recap from './scenes/m1_l1_recap?scene';

// One track for the whole lesson, built from the six beat clips in audio/
// by scripts/build-audio.py so each clip starts with its scene.
import audio from '../audio/m1_l1.mp3';

export default makeProject({
  name: 'M1 L1 · First Hello',
  scenes: [hook, concept, realterms, walkthrough, wrong, recap],
  audio,
  variables: {narrated: true},
});
