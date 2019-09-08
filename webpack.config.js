const path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: "development",
    entry: "./app/mark.js",
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
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
                use: [ "file-loader" ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "app/mark.html"
        })
    ]
}