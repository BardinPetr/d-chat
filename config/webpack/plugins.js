const { DefinePlugin, IgnorePlugin, NormalModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlIncAssetsPlugin = require('html-webpack-include-assets-plugin');
const safePostCssParser = require('postcss-safe-parser');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const CopyPlugin = require('copy-webpack-plugin');
const WorkerInjectorGeneratorPlugin = require('worker-injector-generator-plugin');

const paths = require('../paths');
const staticFiles = require('./static-files');
// 'WEB' || 'EXT'.
const appTarget = process.env.APP_TARGET || 'WEB';


// eslint-disable-next-line
const getPlugins = (isEnvProduction = false, shouldUseSourceMap = false) => {
	/* HTML Plugins for options, sidebar, options */
	const optionsHtmlPlugin = new HtmlWebpackPlugin(
		Object.assign(
			{},
			{
				title: 'Options',
				chunks: ['options'],
				filename: 'options.html',
				template: paths.optionsTemplate,
			}
		)
	);

	const popupHtmlPlugin = new HtmlWebpackPlugin(
		Object.assign(
			{},
			{
				title: 'Popup',
				chunks: ['popup'],
				filename: 'popup.html',
				template: paths.popupTemplate,
				scriptLoading: 'defer',
			}
		)
	);

	const sidebarHtmlPlugin = new HtmlWebpackPlugin(
		Object.assign(
			{},
			{
				title: 'Sidebar',
				// Not sure where "background" goes in WEB version.
				chunks: process.env.APP_TARGET === 'EXT' ? ['popup'] : ['popup', 'common'],
				filename: 'index.html',
				template: paths.sidebarTemplate,
				scriptLoading: 'defer',
			}
		)
	);

	const backgroundHtmlPlugin = new HtmlWebpackPlugin({
		title: 'Background',
		chunks: ['background', 'common'],
		filename: 'background.html',
		template: paths.backgroundTemplate,
		scriptLoading: 'defer',
	});

	const moduleNotFoundPlugin = new ModuleNotFoundPlugin(paths.appPath);
	const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
	const watchMissingNodeModulesPlugin = new WatchMissingNodeModulesPlugin(paths.appNodeModules);
	const miniCssExtractPlugin = new MiniCssExtractPlugin({
		filename: '[name].css',
		// chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
	});
	const ignorePlugin = new IgnorePlugin(/^\.\/locale$/, /moment$/);
	// eslint-disable-next-line
	const terserPlugin = new TerserPlugin({
		terserOptions: {
			parse: {
				ecma: 8,
			},
			compress: {
				ecma: 6,
				warnings: false,
				comparisons: false,
				inline: 2,
			},
			mangle: {
				// huh?
				safari10: true,
			},
			output: {
				ecma: 6,
				comments: false,
				ascii_only: true,
			},
		},
		parallel: true,
		cache: true,
		sourceMap: shouldUseSourceMap,
	});
	const optimizeCSSAssetsPlugin = new OptimizeCSSAssetsPlugin({
		cssProcessorOptions: {
			parser: safePostCssParser,
			map: shouldUseSourceMap
				? {
					inline: false,
					annotation: true,
				}
				: false,
		},
	});
	/* Include these static JS and CSS assets in the generated HTML files */
	const htmlIncAssetsPlugin = new HtmlIncAssetsPlugin({
		append: false,
		// assets: staticFiles.htmlAssets,
		// <!-- There is something wrong with the webpack configs.
		// Things get included twice in either popup or sidebar.
		// This is workaround. -->
		assets: [],
	});

	const moduleScopePlugin = new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]);
	const copyPlugin = new CopyPlugin(staticFiles.copyPatterns);
	const friendlyErrorsWebpackPlugin = new FriendlyErrorsWebpackPlugin();

	const normalModuleReplacementPlugin = new NormalModuleReplacementPlugin(
		/(.*)-APP_TARGET(\.*)/, function(resource) {
			resource.request = resource.request.replace(/-APP_TARGET/, `-${appTarget}`);
		});

	const appTargetPlugin = new DefinePlugin({
		APP_TARGET: JSON.stringify(appTarget),
	});

	const workerInjectorGeneratorPlugin = new WorkerInjectorGeneratorPlugin({
		name: 'dchat-nkn-worker-injector.js',
		importScripts: [
			'common.js',
			'nkn-worker.js'
		],
		isAsync: false,
		// Gitlab.io hosts at /d-chat/.
		publicPath: (isEnvProduction && process.env.APP_TARGET === 'WEB') ? '/d-chat/' : undefined,
	});

	return {
		optionsHtmlPlugin,
		popupHtmlPlugin,
		backgroundHtmlPlugin,
		sidebarHtmlPlugin,
		moduleNotFoundPlugin,
		caseSensitivePathsPlugin,
		watchMissingNodeModulesPlugin,
		miniCssExtractPlugin,
		ignorePlugin,
		terserPlugin,
		optimizeCSSAssetsPlugin,
		moduleScopePlugin,
		copyPlugin,
		htmlIncAssetsPlugin,
		friendlyErrorsWebpackPlugin,
		normalModuleReplacementPlugin,
		appTargetPlugin,
		workerInjectorGeneratorPlugin,
	};
};

module.exports = getPlugins;
