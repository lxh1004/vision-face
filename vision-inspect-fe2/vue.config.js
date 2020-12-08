/**
 * vue-cli config
 * @author duanj
 */

const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/inspect2/'
    : '/',
  configureWebpack: process.env.NODE_ENV === 'production'
    ? {
      resolve: {
        // alias
        alias: {
          [`${path.resolve(__dirname, 'src')}/const/website$`] : path.resolve(__dirname, 'src/const/website.sany48.js'),
        }
      }
    }
    : {}
}