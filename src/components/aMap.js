/*
高德地图
 */

import AMap from "AMap"

class aMap {
  constructor(container) {
    this.container = container
    this.baseMap = null
    this.amapApi = AMap
    this.initMap()
  }

  async initMap() {
    // 初始化地图
    this.baseMap = new AMap.Map(this.container, {
      center: [120.18312, 30.304009],
      zoom: 14,
      zooms: [12, 20],
      resizeEnable: true,
      expandZoomRange: true
    })
  }

  /**
   * 初始化标注并添加到地图
   * @param {Object} options 参数
   */
  addMarker(options) {
    return new AMap.Marker({
      map: this.baseMap,
      ...options
    })
  }

  /**
   * 初始化像素位置
   * @param {*} x
   * @param {*} y
   */
  initPixel(x, y) {
    return new AMap.Pixel(x, y)
  }
}

export default aMap
