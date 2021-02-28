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
    port: 3001
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
      name: 'app1',
      filename: 'microservices.js',
      exposes: {
        './add': './src/add'
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
