
const merge = require("webpack-merge").smart
const path = require("path")

const baseConfig = require("../webpack.config.base")
const productionConfig = require("../webpack.config.production")
const developmentConfig = require("../webpack.config.development")({ 
    route: "pipeline",
})

function absolutePath(pathString){
    return path.resolve(__dirname, pathString)
}

module.exports = (env) => {
    let config = {
        entry: {
            start: absolutePath("src/apps/start/init"),
            running: absolutePath("src/apps/running/init"),
        },
        output: {
            filename: "[name]-bundle.js",
            sourceMapFilename : "[file].map",
            path: absolutePath("static"),
        },
        resolve: {
            alias: {
                core: absolutePath("src/core"),
                graph: absolutePath("src/core/graph"),
                wizard: absolutePath("src/core/wizard"),
                apps: absolutePath("src/apps"),
            },
        },
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
