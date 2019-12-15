const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    mode: "development",
    entry: "./app/app.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "mark_app.js",
        publicPath: "/"
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
        }),
        new CopyWebpackPlugin([
            {from:'app/assets',to:'assets'} 
        ])
    ]
}