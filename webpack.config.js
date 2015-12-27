var webpack = require('webpack');

module.exports = {
    context: __dirname + '/src',
    entry: {
        popup: './popup.ts',
        background: './background.ts'
    },
    output: {
        path: __dirname + '/release/manga-downloader',
        filename: '[name].js'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('manga.js', ['popup', 'background'])
    ],
    devtool: '#source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    }
}