const path = require('path')

function resolve(dir) {
  return path.join(__dirname, './', dir)
}

module.exports = {
  // 允许对内部的 webpack 配置进行更细粒度的修改。
  chainWebpack: config => {
    // 为src下文件配别名，不使用相对路径
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('icons', resolve('src/icons'))
      .set('router', resolve('src/router'))
      .set('utils', resolve('src/utils'))
      .set('style', resolve('src/style'))

    /** 设置处理svg的router，使svg可直接用名称调用，无需路径 */
    // svg rule loader
    const svgRule = config.module.rule('svg') // 找到svg-loader
    svgRule.uses.clear() // 清除已有的loader, 如果不这样做会添加在此loader之后
    svgRule.exclude.add(/node_modules/) // 正则匹配排除node_modules目录
    svgRule // 添加svg新的loader处理
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
  },

  // #region webpack-dev-server 选项都支持
  // devServer: {
  //   open: true,
  //   开发环境代理
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000',
  //       ws: true,
  //       changeOrigin: true,
  //       pathRequires: {
  //         '^/api': ''
  //       }
  //     }
  //   }
  // }
  // #endregion
  devServer: {
    port: 57103, // 端口号配置
    open: true // 自动在浏览器打开
  },
  configureWebpack: {
    externals: {
      AMap: 'AMap', // 高德地图配置
      T: 'T', // 天地图
      BMap: 'BMap' // 百度地图配置
    }
  }
}
