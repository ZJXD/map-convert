/**
 * 天地图
 */

import T from 'T'

class TiandiMap {
  constructor(container) {
    this.container = container
    this.T = null
    this.baseMap = null
    this.initMap()
  }

  // 初始化天地图 API，自动添加 Script 标签
  initT() {
    const AK = '07d4e04324b413cb0582fa99fe833cd3'
    const TMapURL = 'http://api.tianditu.gov.cn/api?v=4.0&tk=' + AK
    return new Promise((resolve, reject) => {
      window.onload = function() {
        console.log('地图脚本初始化成功...')
        // eslint-disable-next-line
        resolve(T)
      }

      // 插入script脚本
      const scriptNode = document.createElement('script')
      scriptNode.setAttribute('type', 'text/javascript')
      scriptNode.setAttribute('src', TMapURL)
      document.body.appendChild(scriptNode)
    })
  }

  async initMap() {
    // this.T = await this.initT()
    // 初始化地图
    this.baseMap = new T.Map(this.container, {
      // projection: 'EPSG:4326'
    })
    const point = new T.LngLat(window.$setting.center[0], window.$setting.center[1])
    this.baseMap.centerAndZoom(point, 14)
    this.baseMap.checkResize()
  }

  /**
   * 初始化标注并添加到地图
   * @param {Object} options 参数
   */
  // addMarker(options) {
  //   return new AMap.Marker({
  //     map: this.baseMap,
  //     ...options
  //   })
  // }

  /**
   * 初始化像素位置
   * @param {*} x
   * @param {*} y
   */
  // initPixel(x, y) {
  //   return new AMap.Pixel(x, y)
  // }
}

export default TiandiMap
