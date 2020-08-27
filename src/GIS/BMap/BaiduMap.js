/**
 * 百度地图
 */

import BMap from 'BMap'
import transCoords from '../../utils/transCoords'

class BaiduMap {
  constructor(container) {
    this.container = container
    this.baseMap = null
    this.bmapApi = BMap
    this.initMap()
  }

  initMap() {
    const center = transCoords.WGS84toGCJ02(window.$setting.center[0], window.$setting.center[1])
    // 初始化地图
    this.baseMap = new BMap.Map(this.container)
    this.baseMap.centerAndZoom(new BMap.Point(center[0], center[1]), 15)
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
  addMarker(point, options) {
    return new BMap.Marker(point, options)
  }

  /**
   * 实例化线
   * @param {array} points
   * @param {object} options
   */
  drawPolyline(points, options) {
    return new BMap.Polyline(points, options)
  }

  /**
   * 实例化面
   * @param {array} path
   * @param {object} options
   */
  drawPolygon(path, options) {
    return new BMap.Polygon(path, options)
  }
}

export default BaiduMap
