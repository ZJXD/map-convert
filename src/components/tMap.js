/**
 * 天地图
 */

import T from 'T'


class tMap {
  constructor(container) {
    this.container = container
    this.baseMap = null
    this.tmapApi = T
    this.initMap()
  }

  async initMap() {
    // 初始化地图
    this.baseMap = new T.Map(this.container, {
      projection: 'EPSG:4326'
    })
    let point = new T.LngLat(120.189705, 30.309652)
    this.baseMap.centerAndZoom(point, 12)
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

export default tMap