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
    port: 3000
  },
  output: {
    publicPath: 'auto'
  },
  optimization: {
    minimize: false,
    runtimeChunk: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'app',
      remotes: {
        'app1': 'app1@http://localhost:3001/microservices.js',
        'app2': 'app2@http://localhost:3002/microservices.js'
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
}
