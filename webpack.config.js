const { ErrorDetails$ } = require('@aws-sdk/client-s3');
const path = require('path');

module.exports = {
    entry: './src/renderer.js',
    target: 'electron-renderer',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { 
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ] 
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx'
        ]
    },
    stats: {
        errorDetails: true,
    }
};