const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin

module.exports = {
  entry: {
    app: './src/index'
  },
  mode: 'development',
  target: 'web',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3003
  },
  output: {
    publicPath: 'auto'
  },
  optimization: {
    minimize: false,
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app3',
      filename: 'microservices.js',
      exposes: {
        './math': './src/math'
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
