/**
 * 百度地图
 */

import BMap from 'BMap'

class bMap {
  constructor(container) {
    this.container = container
    this.baseMap = null
    this.bmapApi = BMap
    this.initMap()
  }

  initMap() {
    // 初始化地图
    this.baseMap = new BMap.Map(this.container)
    this.baseMap.centerAndZoom(new BMap.Point(120.20085967, 30.31299727), 15)
    // this.baseMap.centerAndZoom('杭州市')
    // let point = new BMap.Point(120.20085967, 30.31299727)
    // this.baseMap.centerAndZoom(point, 15)
    this.baseMap.enableScrollWheelZoom(true)
    this.baseMap.setDefaultCursor('grab')
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

export default bMap
