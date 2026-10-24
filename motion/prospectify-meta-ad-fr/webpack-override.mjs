// Shared webpack override for Remotion Studio (remotion.config.ts) and the Node render scripts.
// @remotion/transitions@4.0.532's ESM entry inlines a copy of react-dom 19, which crashes on React 18
// ("__CLIENT_INTERNALS_DO_NOT_USE... not found in 'react'"). Its CommonJS build is clean, so we alias to it.
// Remove once the project moves to React 19 or the upstream package is fixed.
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

export const webpackOverride = (config) => ({
	...config,
	resolve: {
		...config.resolve,
		alias: {
			...(config.resolve?.alias ?? {}),
			'@remotion/transitions$': require.resolve('@remotion/transitions'),
		},
	},
});
