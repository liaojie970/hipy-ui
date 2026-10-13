'use strict'
const path = require('path')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = defaultSettings.title || 'vue Element Admin' // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 8080 npm run dev OR npm run dev --port = 8080
// 注意: Windows 上 Hyper-V/WSL/Docker 会保留一部分动态端口(如 9524-9823),
// 原 9527/9526 落在保留区间内无法绑定, 会导致 dev server 被自动顺延到 9824。
// 这里改用 8080, 如需恢复请先释放对应端口保留区间。
const port = process.env.port || process.env.npm_config_port || 8080 // dev port

// 开发模式后端地址: 优先显式配置, 否则取 VUE_APP_BASE_API 的 origin, 兜底 5707。
const backendOrigin = process.env.VUE_APP_BACKEND_ORIGIN ||
  (/^https?:\/\//i.test(process.env.VUE_APP_BASE_API || '')
    ? new URL(process.env.VUE_APP_BASE_API).origin
    : 'http://localhost:5707')

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: false,
  // lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    // 开发模式下前端(:8082)与后端(:5707)不同源, 而部分接口/链接使用同源根路径
    // (如 /version /database_update /config /files /docs)。若不代理, 这些请求会打到
    // 前端 devServer 并 404(见 commit 8edd259)。此处反向代理到后端, 使开发环境
    // 与生产(前后端同源)行为一致。生产构建不使用 devServer, 故不受影响。
    proxy: {
      '/version': { target: backendOrigin, changeOrigin: true },
      '/database_update': { target: backendOrigin, changeOrigin: true },
      '/config': { target: backendOrigin, changeOrigin: true },
      '/files': { target: backendOrigin, changeOrigin: true },
      '/docs': { target: backendOrigin, changeOrigin: true },
      '/openapi.json': { target: backendOrigin, changeOrigin: true },
      '/redoc': { target: backendOrigin, changeOrigin: true },
      '/api': { target: backendOrigin, changeOrigin: true },
      '/media': { target: backendOrigin, changeOrigin: true },
      '/images': { target: backendOrigin, changeOrigin: true },
      '/sniffer': { target: backendOrigin, changeOrigin: true, ws: true }
    }
    // before: require('./mock/mock-server.js')
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    // config.plugins.delete('preload')

    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch') //

    // set svg-sprite-loader
    // config.module
    //   .rule('svg')
    //   // .exclude.add(resolve('src/icons'))
    //   .exclude.add(resolve('src/assets/icons'))
    //   .end()
    // config.module
    //   .rule('icons')
    //   .test(/\.svg$/)
    //   // .include.add(resolve('src/icons'))
    //   .include.add(resolve('src/assets/icons'))
    //   .end()
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })
    //   .end()

    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
