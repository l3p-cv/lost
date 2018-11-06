const rewireEslint = require("react-app-rewire-eslint")
// const { injectBabelPlugin } = require("react-app-rewired")

const CopyWebpackPlugin = require("copy-webpack-plugin")
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const CircularDependencyPlugin = require("circular-dependency-plugin")


const path = require("path")
function absolutePath(pathString){
    return path.resolve(__dirname, pathString)
}

module.exports = (config, env) => {
	// config.entry.push(absolutePath("./src/tool-test/sia/src/appPresenter"))
	config.resolve.alias.components = absolutePath("./src/tool-test/sia/src/components")
	config.resolve.alias.core = absolutePath("./src/tool-test/sia/src/core")
	config.resolve.alias.drawables = absolutePath("./src/tool-test/sia/src/drawables")
	config.resolve.alias.shared = absolutePath("./src/tool-test/sia/src/shared")
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