const merge = require("webpack-merge").smart
const path = require("path")

const baseConfig = require("../webpack.config.base")
const productionConfig = require("../webpack.config.production")
const developmentConfig = require("../webpack.config.development")({ 
    route: "sia",
})

const CopyWebpackPlugin = require("copy-webpack-plugin")

function absolutePath(pathString){
    return path.resolve(__dirname, pathString)
}

module.exports = (env) => {
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
    switch(env){
        case "production":
            config = merge(config, baseConfig, productionConfig)
            config = merge(config, {
                mode: "production",
            })
            console.log(config)
            break
        case "development":
            config = merge(config, baseConfig, developmentConfig)
            config = merge(config, {
                mode: "development",
            })
            console.log(config)
            break
    }
    return config
}
