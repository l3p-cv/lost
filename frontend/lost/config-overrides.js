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
	config.resolve.alias["siaRoot"] = absolutePath("./src/tools/sia/src/")
	config.resolve.alias["components"] = absolutePath("./src/tools/sia/src/components")
	config.resolve.alias["drawables"] = absolutePath("./src/tools/sia/src/drawables")
	config.resolve.alias["shared"] = absolutePath("./src/tools/sia/src/shared")

	// PIP aliases
	config.resolve.alias["pipRoot"] = absolutePath("src/tools/pipeline/src/")
	config.resolve.alias["graph"] = absolutePath("src/tools/pipeline/src/core/graph")
	config.resolve.alias["wizard"] = absolutePath("src/tools/pipeline/src/core/wizard")
	config.resolve.alias["apps"] = absolutePath("src/tools/pipeline/src/apps")
	
	config.devtool = "source-map"

	config.plugins.push(
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			"window.jQuery": "jquery",
			"window.$": "jquery",
		})
	)
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
            from: "./src/tools/sia/assets",
            to: "assets",
        }])
    )
	
	// config = injectBabelPlugin("plugin", config)
	config = rewireEslint(config, env)
	
	// console.log(config)
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