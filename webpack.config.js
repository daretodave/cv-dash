const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dash = {
    target: 'web',
    entry: {
        dash: './src/dash/main.js',
    },
    module: {
        rules: [
            {
                test: /\.hbs/i,
                loader: 'handlebars-loader',
                options: {
                    helperDirs: path.join(__dirname, 'src/dash/helpers'),
                    precompileOptions: {
                        knownHelpersOnly: false,
                    },
                },
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: `src/dash/main.hbs`,
        }),
        new FaviconsWebpackPlugin(path.join(__dirname, 'src/dash/icon.png'))
    ],
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};

module.exports = [
    dash
];