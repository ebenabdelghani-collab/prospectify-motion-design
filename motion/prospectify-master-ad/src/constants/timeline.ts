import timeline from './timeline.json';

// Generated from the real voiceover by scripts/build_timeline.py.
// scripts/build_audio.py reads the same JSON — visuals, voice, music and SFX share one clock.
export const T = timeline;
export const FPS = timeline.fps;
export const DURATION = timeline.durationInFrames;
export const WIDTH = timeline.width;
export const HEIGHT = timeline.height;
