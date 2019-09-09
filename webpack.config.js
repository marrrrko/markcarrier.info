const path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: "development",
    entry: "./app/mark-app.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "mark_app.js"
    },
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: "babel-loader"
            },
            {
                test: /\.css$/,
                use: [ "style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "app/mark.html"
        })
    ]
}