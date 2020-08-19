/*
 * @Author: ZHT
 * @Date: 2020-01-16 15:24:35
 * @Last Modified by: ZHT
 * @Last Modified time: 2020-08-19 09:39:56
 */

/*
高德地图
 */

import AMap from 'AMap'

const POLYLINE_STYLE = {
  strokeColor: '#3366FF',
  strokeOpacity: 1,
  strokeWeight: 6,
  strokeStyle: 'solid'
}

class GaodeMap {
  constructor(container) {
    this.container = container
    this.baseMap = null
    this.amapApi = AMap
    this.mouseTool = null
    this.initMap()
    this.initMouseTool()
  }

  async initMap() {
    // 初始化地图
    this.baseMap = new AMap.Map(this.container, {
      center: [120.19430026, 30.30726322],
      zoom: 14,
      zooms: [12, 20],
      resizeEnable: true,
      expandZoomRange: true,
      defaultCursor: 'grab'
    })
  }

  /**
   * 初始化 MouseTool 工具类
   */
  initMouseTool() {
    this.mouseTool = new AMap.MouseTool(this.baseMap)
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

  /**
   * 画线
   * @param {Object} options 参数
   */
  drawLine(options) {
    return new AMap.Polyline({
      map: this.baseMap,
      ...options
    })
  }

  /**
   * 用 MouseTool 画线
   * @param {Object} options 参数
   */
  drawPolyline(options) {
    const tempStyle = options || POLYLINE_STYLE
    this.mouseTool.polyline(tempStyle)
  }
}

export default GaodeMap
