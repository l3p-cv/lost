// const mergeObjects = require("@cartok/object-assign-deep")

// const webpack = require("webpack")
// const rewireEslint = require("react-app-rewire-eslint")
// // const { injectBabelPlugin } = require("react-app-rewired")

// const CopyWebpackPlugin = require("copy-webpack-plugin")
// const CircularDependencyPlugin = require("circular-dependency-plugin")


// const path = require("path")
// function absolutePath(pathString){
//     return path.resolve(__dirname, pathString)
// }

// module.exports = (config, env) => {
// 	// LOST aliases
// 	config.resolve.alias["root"] = absolutePath("./src/")
// 	config.resolve.alias["libs"] = absolutePath("./src/libs")


// 	// PIP aliases
// 	config.resolve.alias["pipRoot"] = absolutePath("src/components/pipeline/src/")

// 	// Actions alias
// 	config.resolve.alias["actions"] = absolutePath("src/actions")
// 	config.resolve.alias["pipelineGlobalComponents"] = absolutePath("src/components/pipeline/src/globalComponents")


	
// 	config.devtool = "source-map"

// 	config.plugins.push(
// 		new webpack.ProvidePlugin({
// 			$: "jquery",
// 			jQuery: "jquery",
// 			"window.jQuery": "jquery",
// 			"window.$": "jquery",
// 		})
// 	)
//     config.plugins.push(
// 		new CircularDependencyPlugin({
// 			exclude: /node_modules/,
// 			failOnError: false,
// 			allowAsyncCycles: false,
// 			cwd: process.cwd(),
// 		})
// 	)

// 	// config = injectBabelPlugin("@babel/plugin-transform-flow-strip-types", config)
// 	config = rewireEslint(config, env)
	
// 	if(env === "production"){
// 		// keep class names
// 		// const terserOverride = {
// 		// 	keep_classnames: true,
// 		// 	keep_fnames: true,
// 		// }
// 		config.optimization.minimizer[0].options.terserOptions.keep_classnames = true
// 		config.optimization.minimizer[0].options.terserOptions.keep_fnames = true
// 	}
	
// 	// return
// 	return config
// }
