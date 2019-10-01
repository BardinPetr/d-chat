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
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const paths = require('../paths');
const staticFiles = require('./static-files');
// 'WEB' || 'EXT'.
const appTarget = process.env.APP_TARGET || 'EXT';


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

	const scriptExtHtmlPlugin = new ScriptExtHtmlWebpackPlugin({
		defaultAttribute: 'async',
	});

	const popupHtmlPlugin = new HtmlWebpackPlugin(
		Object.assign(
			{},
			{
				title: 'Popup',
				chunks: ['popup'],
				filename: 'popup.html',
				template: paths.popupTemplate,
			}
		)
	);

	const sidebarHtmlPlugin = new HtmlWebpackPlugin(
		Object.assign(
			{},
			{
				title: 'Sidebar',
				chunks: ['sidebar'],
				filename: 'sidebar.html',
				template: paths.sidebarTemplate,
			}
		)
	);

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

	return {
		optionsHtmlPlugin,
		popupHtmlPlugin,
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
		scriptExtHtmlPlugin,
		friendlyErrorsWebpackPlugin,
		normalModuleReplacementPlugin,
		appTargetPlugin,
	};
};

module.exports = getPlugins;
