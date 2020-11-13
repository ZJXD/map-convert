/*
 * @Author: ZHT
 * @Date: 2020-01-16 15:24:35
 * @Last Modified by: ZHT
 * @Last Modified time: 2020-11-13 17:14:37
 */

/*
高德地图
 */

import AMap from 'AMap'
// import union from '@turf/union'
// import { polygon } from '@turf/helpers'
import transCoords from '../../utils/transCoords'

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
    const center = transCoords.WGS84toGCJ02(window.$setting.center[0], window.$setting.center[1])
    // 初始化地图
    this.baseMap = new AMap.Map(this.container, {
      center: center,
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
   * 初始化 PolygonEditor 工具类
   * V2.0 后可使用
   */
  initPolygonEditor() {
    this.polygonEditor = new AMap.PolygonEditor(this.baseMap)
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
   * 画线
   * @param {Object} options 参数
   */
  drawLine(options) {
    const tempStyle = options || POLYLINE_STYLE
    return new AMap.Polyline({
      map: this.baseMap,
      ...tempStyle
    })
  }

  /**
   * 画面
   * @param {Object} options 参数
   */
  drawPolygonByPath(options) {
    const tempStyle = options || POLYLINE_STYLE
    return new AMap.Polygon({
      map: this.baseMap,
      ...tempStyle
    })
  }

  /**
   * 用 MouseTool 画点
   * @param {Object} options 参数
   */
  drawMarker(options) {
    const tempStyle = options || null
    this.mouseTool.marker(tempStyle)
  }

  /**
   * 用 MouseTool 画线
   * @param {Object} options 参数
   */
  drawPolyline(options) {
    const tempStyle = options || POLYLINE_STYLE
    this.mouseTool.polyline(tempStyle)
  }

  /**
   * 用 MouseTool 画面
   * @param {Object} options 参数
   */
  drawPolygon(options) {
    const tempStyle = options || POLYLINE_STYLE
    this.mouseTool.polygon(tempStyle)
  }

  /**
   * 添加文本
   * @param {Object} options 参数
   */
  addText(options) {
    const tempStyle = options || null
    return new AMap.Text({
      map: this.baseMap,
      ...tempStyle
    })
  }

  /**
   * 初始化 InfoWindow
   */
  initInfoWindow() {
    return new AMap.InfoWindow({
      offset: new AMap.Pixel(0, -20)
    })
  }

  /**
   * 获取覆盖物图层
   * @param {String} type 覆盖物类别，省略是全部
   */
  getOverlays(type) {
    if (type) {
      return this.baseMap.getAllOverlays(type)
    } else {
      return this.baseMap.getAllOverlays()
    }
  }

  /**
   * 删除覆盖物
   * @param {*} type 覆盖物类别，省略是全部
   */
  getOverlaysAndRemove(type) {
    if (type) {
      const layer = this.baseMap.getAllOverlays(type)
      this.baseMap.remove(layer)
    } else {
      this.baseMap.clearMap()
    }
  }

  /**
   * 初始化聚合
   * @param {*} markerArray marker 数组
   * @param {*} options 参数
   */
  initMarkerClusterer(markerArray, options) {
    return new AMap.MarkerClusterer(this.baseMap, markerArray, options)
  }

  /**
   * 地图销毁
   */
  destroyMap() {
    this.mouseTool.close(true)
    this.baseMap && this.baseMap.destroy()
  }

  /**
   * 使用 turf 合并面
   */
  unionPolygon() {
    // let points = JSON.parse(Saihan[0].location)
    // points.push(points[0])
    // let firstPolygon = polygon([points])
    // let unionPolygon = null
    // for (let index = 1; index < Saihan.length; index++) {
    //   points = JSON.parse(Saihan[index].location)
    //   points.push(points[0])
    //   const secondPolygon = polygon([points])
    //   unionPolygon = union(firstPolygon, secondPolygon)
    //   firstPolygon = unionPolygon
    // }
    // console.log(JSON.stringify(unionPolygon.geometry.coordinates))
  }
}

export default GaodeMap
