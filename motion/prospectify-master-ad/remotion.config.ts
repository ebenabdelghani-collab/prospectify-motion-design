import {Config} from '@remotion/cli/config';
import {webpackOverride} from './webpack-override.mjs';

Config.setVideoImageFormat('png');
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer('angle');
Config.overrideWebpackConfig(webpackOverride);
