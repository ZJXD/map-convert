/*
 * @Author: ZHT
 * @Date: 2020-09-16 09:52:16
 * @Last Modified by:   ZHT
 * @Last Modified time: 2020-09-16 09:52:16
 */

/**
 * 百度地图-基于网格操作
 */
import BMap from 'BMap'
import { GetGridList, GetBranchDetail } from '@/modules/grid/api/index'
import transCoords from '@/utils/gps'
import { getColorByIndex } from '@/utils/color'
import gridImg from '@/modules/grid/images/community/grid.png'

const POLYGON_STYLES = {
  1: {
    strokeWeight: 4, strokeColor: '#6600cc', strokeStyle: 'dashed',
    strokeDasharray: [5, 5]
  },
  2: {
    strokeWeight: 3, strokeColor: 'rgba(255,255, 0, 1)', strokeStyle: 'dashed',
    strokeDasharray: [3, 3]
  },
  3: {
    strokeWeight: 2, strokeColor: 'rgba(21, 207, 253, 1)', strokeStyle: 'dashed',
    strokeDasharray: [2, 2]
  }
}

const BOUNDARY = [
  { lat: 59.0, lng: 73.0 },
  { lat: 59.0, lng: 136.0 },
  { lat: 3.0, lng: 136.0 },
  { lat: 3.0, lng: 73.0 },
  { lat: 59.0, lng: 73.0 }
]

class BaiduMap {
  constructor(container, center, showGrid = true) {
    this.container = container
    this.baseMap = null
    this.bmapApi = BMap
    this.infoWindow = null
    this.center = center
    this.gridPolygons = {}
    this.curGridTypes = []
    this.showGrid = showGrid
    this.gridIcon = null
    this.coverPolygon = null
    this.initMap()
  }

  initMap() {
    // const center = transCoords.WGS84toBD09(window.$setting.center[0], window.$setting.center[1])
    // 初始化地图
    this.baseMap = new BMap.Map(this.container, { enableMapClick: false })
    // this.baseMap.centerAndZoom(new BMap.Point(center[0], center[1]), 15)
    // this.baseMap.centerAndZoom('呼和浩特市')
    // let point = new BMap.Point(120.20085967, 30.31299727)
    // this.baseMap.centerAndZoom(point, 15)
    this.baseMap.setMaxZoom(20)
    this.baseMap.setMinZoom(10)
    this.baseMap.enableScrollWheelZoom(true)
    this.baseMap.setDefaultCursor('grab')
    const opts = {
      width: 200, // 信息窗口宽度
      height: 200, // 信息窗口高度
      // title: '海底捞王府井店', // 信息窗口标题
      enableMessage: true, // 设置允许信息窗发送短息
      enableCloseOnClick: false,
      message: '亲耐滴，晚上一起吃个饭吧？戳下面的链接看下地址喔~'
    }
    this.infoWindow = new BMap.InfoWindow('地址：北京市东城区王府井大街88号乐天银泰百货八层', opts)

    if (this.showGrid) {
      this.gridIcon = new BMap.Icon(gridImg, new BMap.Size(34, 45))
      this.getGridPolygons()

      this.baseMap.addEventListener('zoomend', () => {
        const curZoom = this.baseMap.getZoom()
        if (curZoom <= 15) {
          this.displayGrid([1])
        } else if (curZoom <= 17) {
          this.displayGrid([1, 2])
        } else {
          this.displayGrid([3])
        }
      })
    } else {
      this.getBoundary()
    }
  }

  boundaryPoints = []
  getBoundary() {
    const bdary = new BMap.Boundary()
    bdary.get('呼和浩特市赛罕区', (rs) => { // 获取行政区域
      const count = rs.boundaries.length // 行政区域的点有多少个
      if (count === 0) {
        alert('未能获取当前输入行政区域')
        return
      }
      this.boundaryPoints = []
      for (let i = 0; i < count; i++) {
        const ply = new BMap.Polygon(rs.boundaries[i], {
          strokeWeight: 5, strokeColor: 'rgba(13, 101, 251, 1)', fillColor: 'rgba(13, 101, 251, 0.4)', strokeStyle: 'dashed',
          strokeDasharray: [5, 5], fillOpacity: 0.2
        }) // 建立多边形覆盖物
        this.baseMap.addOverlay(ply) // 添加覆盖物
        this.boundaryPoints = this.boundaryPoints.concat(ply.getPath())
      }

      if (this.center) {
        const point = new BMap.Point(this.center[0], this.center[1])
        this.baseMap.centerAndZoom(point, 14)
      } else {
        this.baseMap.setViewport(this.boundaryPoints) // 调整视野
      }
    })
  }

  showGridInfo(branchId) {
    GetBranchDetail({ id: branchId }).then(response => {
      const info = `<div class="info-congrid">
        <h5 class="info-con-title" >${response.data.branchname || ''}</h5>
        <div class="info-con-detail">
          <span>楼栋数：${response.data.floorsCount}幢</span>
          <span>居民数：${response.data.populationCount}人</span>
          <span>网格员：${response.data.fuzheren}</span>
          <span>联系方式：${response.data.fuzherenphone}</span>
          <span>事件数量：${response.data.eventCount}</span>
        </div>
        </div>`
      const point = this.gridPolygons[branchId].center || this.highlightPolygon.getPath()[0]
      this.infoWindowSetContent(info, point)
    })
  }

  branchList = {}
  getGridPolygons() {
    GetGridList({ page: 1, pageSize: 1000 }).then(response => {
      if (response.data && response.data.length > 0) {
        response.data.map((item, index) => {
          this.branchList[item.branchId] = item.branchName
          const location = JSON.parse(item.location)
          const path = []
          location.map(point => {
            path.push(transCoords.GCJ02toBD09(point[0], point[1]))
          })
          const color = getColorByIndex(index)
          const grid = this.getPolygon(path, { ...POLYGON_STYLES[item.type], fillColor: color, fillOpacity: 0.5 })
          let center = null
          if (item.centerPoint) {
            const point = JSON.parse(item.centerPoint)
            const BDpoint = transCoords.GCJ02toBD09(point[0], point[1])
            center = new BMap.Point(BDpoint[0], BDpoint[1])
          }
          const marker = new BMap.Marker(center, { icon: this.gridIcon })
          marker.addEventListener('click', () => {
            this.highlightGrid(item.branchId)
          })

          this.gridPolygons[item.branchId] = {
            type: item.type,
            polygon: grid,
            center: center,
            marker: marker,
            color
          }
        })
      }

      this.getBoundary()
    })
  }

  displayGrid(showTypes) {
    const keys = Object.keys(this.gridPolygons)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      const curGridType = this.gridPolygons[key].type
      if (showTypes.includes(curGridType) && !this.curGridTypes.includes(curGridType)) {
        this.baseMap.addOverlay(this.gridPolygons[key].polygon)
        this.baseMap.addOverlay(this.gridPolygons[key].marker)
      } else if (!showTypes.includes(curGridType) && this.curGridTypes.includes(curGridType)) {
        this.baseMap.removeOverlay(this.gridPolygons[key].polygon)
        this.baseMap.removeOverlay(this.gridPolygons[key].marker)
      }
    }
    keys.length > 0 && (this.curGridTypes = showTypes)
    if (this.coverPolygon) {
      this.baseMap.removeOverlay(this.coverPolygon)
      this.baseMap.addOverlay(this.coverPolygon)
    }
  }

  handleCoverPolygon(branchId) {
    const curBranch = this.gridPolygons[branchId]
    if (curBranch.type !== 1) {
      return
    }
    let path = BOUNDARY
    const pathT = curBranch.polygon.getPath()
    path = path.concat(pathT)
    path.push(pathT[0])
    path.push(BOUNDARY[0])
    if (this.coverPolygon) {
      this.coverPolygon.setPath(path)
    } else {
      this.coverPolygon = new BMap.Polygon(path, { strokeOpacity: 0.0001, strokeColor: '#000', strokeWeight: 0.0001, fillColor: '#000', fillOpacity: 0.4 })
      this.baseMap.addOverlay(this.coverPolygon)
    }
    this.baseMap.setViewport(pathT) // 调整视野到当前街道
  }

  highlightPolygon = null
  curHighlightColor = null
  /**
   * 高亮显示街道、社区、网格
   * @param {string} branchId 标识
   * @param {string} type 类型
   */
  highlightGrid(branchId, type) {
    this.showGridInfo(branchId)
    this.handleCoverPolygon(branchId)
    // this.unHighlightGrid()
    // this.highlightPolygon = null
    // if (this.gridPolygons[branchId]) {
    //   this.curHighlightColor = this.gridPolygons[branchId].color
    //   this.highlightPolygon = this.gridPolygons[branchId].polygon
    //   this.highlightPolygon.setFillColor('rgba(255,198,42,0.25)')
    //   this.baseMap.setViewport(this.highlightPolygon.getPath())
    //   setTimeout(() => {
    //     type === 'street' ? this.baseMap.setZoom(15) : (type === 'community' ? this.baseMap.setZoom(17) : '')
    //   }, 10)

    //   this.showGridInfo(branchId)
    // }
  }
  unHighlightGrid() {
    if (this.highlightPolygon) {
      this.highlightPolygon.setFillColor(this.curHighlightColor)
    }
  }

  /**
   * 初始化标注并添加到地图
   * @param {Object} options 参数
   */
  addMarker(point, options) {
    const pointT = new BMap.Point(point[0], point[1])
    const marker = new BMap.Marker(pointT, options)
    this.baseMap.addOverlay(marker)
    return marker
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
    const pathTemp = []
    path.map(item => {
      pathTemp.push(new BMap.Point(item[0], item[1]))
    })
    const polygon = new BMap.Polygon(pathTemp, options)
    this.baseMap.addOverlay(polygon)
    return polygon
  }

  /**
   * 实例化面，不添加到地图
   * @param {array} path
   * @param {object} options
   */
  getPolygon(path, options) {
    const pathTemp = []
    path.map(item => {
      pathTemp.push(new BMap.Point(item[0], item[1]))
    })
    return new BMap.Polygon(pathTemp, options)
  }

  /**
   * 设置InfoWindow内容及坐标
   */
  infoWindowSetContent(conten, point) {
    this.infoWindow.setContent(conten)
    const pointM = Array.isArray(point) ? new this.bmapApi.Point(point[0], point[1]) : point
    this.baseMap.openInfoWindow(this.infoWindow, pointM)
    this.baseMap.panTo(pointM)
    // this.baseMap.centerAndZoom(pointM, 17)
  }
}

export default BaiduMap
