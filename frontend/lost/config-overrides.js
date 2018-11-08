const webpack = require("webpack")
const rewireEslint = require("react-app-rewire-eslint")
// const { injectBabelPlugin } = require("react-app-rewired")

const CopyWebpackPlugin = require("copy-webpack-plugin")
const CircularDependencyPlugin = require("circular-dependency-plugin")


const path = require("path")
function absolutePath(pathString){
    return path.resolve(__dirname, pathString)
}

module.exports = (config, env) => {
	// LOST aliases
	config.resolve.alias["root"] = absolutePath("./src/")

	// SIA aliases
	config.resolve.alias["siaRoot"] = absolutePath("./src/tool-test/sia/src/")
	config.resolve.alias["components"] = absolutePath("./src/tool-test/sia/src/components")
	config.resolve.alias["drawables"] = absolutePath("./src/tool-test/sia/src/drawables")
	config.resolve.alias["shared"] = absolutePath("./src/tool-test/sia/src/shared")

	// PIP aliases
	config.resolve.alias["pipRoot"] = absolutePath("src/tool-test/pipeline/src/")
	config.resolve.alias["graph"] = absolutePath("src/tool-test/pipeline/src/core/graph")
	config.resolve.alias["wizard"] = absolutePath("src/tool-test/pipeline/src/core/wizard")
	config.resolve.alias["apps"] = absolutePath("src/tool-test/pipeline/src/apps")
	
	// // additional loaders glyphicons needs.
	// const loaders = [
	// 	{
	// 		test: /\.png$/,
	// 		loader: 'url-loader?limit=100000'
	// 	},
	// 	{
	// 		test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
	// 		loader: 'url-loader?limit=10000&mimetype=application/font-woff'
	// 	},
	// 	{
	// 		test: /\.(ttf|otf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?|(jpg|gif)$/,
	// 		loader: 'file-loader'
	// 	},
	// ]
	// loaders.forEach(loader => config.module.rules[config.module.rules.length-1].oneOf.push(loader))

	config.plugins.push(
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"window.$": "jquery",
		})
	)

	config.devtool = "source-map"

    config.plugins.push(
		new CircularDependencyPlugin({
			exclude: /node_modules/,
			failOnError: false,
			allowAsyncCycles: false,
			cwd: process.cwd(),
		})
	)
    config.plugins.push(
        new CopyWebpackPlugin([{
            from: "./src/tool-test/sia/assets",
            to: "assets",
        }])
    )
	
	// config = injectBabelPlugin("plugin", config)
	config = rewireEslint(config, env)
	
	console.log(config)
	// return
	return config
}

// sia config:
/*
	let config = {
			entry: {
				sia: absolutePath("src/appPresenter")
			},
			output: {
				filename: "[name]-bundle.js",
				sourceMapFilename : "[file].map",
				path: absolutePath("static"),
			},
			resolve: {
				alias: {
					"components": absolutePath("src/components"),
					"core": absolutePath("src/core"),
					"drawables": absolutePath("src/drawables"),
					"shared": absolutePath("src/shared"),
					"l3pfrontend": absolutePath("../../../l3p-frontend-core"),
				},
			},
			plugins: [
				new CopyWebpackPlugin([
					{ from: "assets", to: "assets" },
				]),
			]
		}
	*/