const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// NOTE: Loader `include` paths are relative to this module
const paths = require('../paths');

const nknClientJsLibProtocolRegex = /(.*)_pb\.js$/;
const cssRegex = /\.s?css$/;
const cssModuleRegex = /\.module\.s?css$/;
const workerRegex = /webpack\.worker\.js$/;




const getLoaders = (isEnvProduction = false, isEnvDevelopment = true, shouldUseRelativeAssetPaths = true, shouldUseSourceMap = false) => {

	const getStyleLoaders = (cssOptions, preProcessor) => {
		const styleLoaders = [
			isEnvDevelopment && require.resolve('style-loader'),
			isEnvProduction && {
				loader: MiniCssExtractPlugin.loader,
				options: Object.assign(
					{},
					shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
				),
			},
			{
				loader: require.resolve('css-loader'),
				options: cssOptions,
			},
			{
				loader: 'sass-loader',
				options: cssOptions,
			},
			{
				loader: require.resolve('postcss-loader'),
				options: {
					ident: 'postcss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						require('postcss-preset-env')({
							autoprefixer: {
								flexbox: 'no-2009',
							},
							stage: 3,
						}),
					],
					sourceMap: isEnvProduction && shouldUseSourceMap,
				},
			},
		].filter(Boolean);
		if (preProcessor) {
			styleLoaders.push({
				loader: require.resolve(preProcessor),
				options: {
					sourceMap: isEnvProduction && shouldUseSourceMap,
				},
			});
		}
		return styleLoaders;
	};

	const eslintLoader = {
		test: /\.(js|mjs|jsx)$/,
		enforce: 'pre',
		use: [
			{
				options: {
					formatter: require.resolve('react-dev-utils/eslintFormatter'),
					eslintPath: require.resolve('eslint'),

				},
				loader: require.resolve('eslint-loader'),
			},
		],
		include: paths.appSrc,
	};

	const urlLoader = {
		test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
		loader: require.resolve('url-loader'),
		options: {
			limit: 10000,
			name: 'static/media/[name].[hash:8].[ext]',
		},
	};
	// Process application JS with Babel.
	// The preset includes JSX, Flow, TypeScript, and some ESnext features.
	const insideBabelLoader = {
		test: /\.(js|mjs|jsx|ts|tsx)$/,
		include: paths.appSrc,
		loader: require.resolve('babel-loader'),
		options: {
			customize: require.resolve(
				'babel-preset-react-app/webpack-overrides'
			),

			plugins: [
				[
					require.resolve('babel-plugin-named-asset-import'),
					{
						loaderMap: {
							svg: {
								ReactComponent:
                  '@svgr/webpack?-prettier,-svgo![path]',
							},
						},
					},
				],
				'@babel/plugin-transform-runtime',
				'@babel/plugin-proposal-optional-chaining',
			],
			cacheCompression: isEnvProduction,
			compact: isEnvProduction,
		},
	};
	// Process any JS outside of the app with Babel.
	// Unlike the application JS, we only compile the standard ES features.
	const outsideBabelLoader = {
		test: /\.(js|mjs)$/,
		exclude: /@babel(?:\/|\\{1,2})runtime/,
		loader: require.resolve('babel-loader'),
		options: {
			babelrc: false,
			configFile: false,
			compact: false,
			presets: [
				[
					require.resolve('babel-preset-react-app/dependencies'),
					{ helpers: true },
				],
			],
			cacheDirectory: true,
			cacheCompression: isEnvProduction,
			sourceMaps: false,
		},
	};
	// "postcss" loader applies autoprefixer to our CSS.
	// "css" loader resolves paths in CSS and adds assets as dependencies.
	// "style" loader turns CSS into JS modules that inject <style> tags.
	// In production, we use MiniCSSExtractPlugin to extract that CSS
	// to a file, but in development "style" loader enables hot editing
	// of CSS.
	// By default we support CSS Modules with the extension .module.css
	const styleLoader = {
		test: cssRegex,
		exclude: cssModuleRegex,
		use: getStyleLoaders({
			importLoaders: 1,
			sourceMap: isEnvProduction && shouldUseSourceMap,
		}),
		sideEffects: true,
	};
	// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
	// using the extension .module.css
	const cssModuleLoader = {
		test: cssModuleRegex,
		use: getStyleLoaders({
			importLoaders: 1,
			sourceMap: isEnvProduction && shouldUseSourceMap,
			modules: true,
			getLocalIdent: getCSSModuleLocalIdent,
		}),
	};

	const stringReplaceLoader = {
		test: nknClientJsLibProtocolRegex,
		loader: require.resolve('string-replace-loader'),
		options: {
			search: 'Function(\'return this\')()',
			replace: `(function(){return this || globalThis || window || self;}())`
		}
	};

	const fileLoader = {
		loader: require.resolve('file-loader'),
		exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
		options: {
			name: 'static/media/[name].[hash:8].[ext]',
		},
	};

	const workerLoader = {
		test: workerRegex,
		loader: require.resolve('worker-loader'),
		options: { name: '[hash].[name].js' }
	};



	return {
		eslintLoader,
		urlLoader,
		insideBabelLoader,
		outsideBabelLoader,
		styleLoader,
		cssModuleLoader,
		stringReplaceLoader,
		workerLoader,
		fileLoader
	};
};

module.exports = getLoaders;


