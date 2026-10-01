import timeline from './timeline.json';

// Shared frame constants. scripts/build_audio.py reads the same JSON,
// so a visual beat and its sound can never drift apart.
export const T = timeline;
export const FPS = timeline.fps;
export const DURATION = timeline.durationInFrames;
export const WIDTH = timeline.width;
export const HEIGHT = timeline.height;
