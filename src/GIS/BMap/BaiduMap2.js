/**
 * 百度地图
 */
import BMap from 'BMap'
import { GetGridList, GetGridInfo, GetGridStatic } from '@/modules/grid/api/index'
import transCoords from '@/utils/gps'
import { getColorByIndex } from '@/utils/color'
import gridImg from '@/modules/grid/images/community/grid.png'
import gridActiveImg from '@/modules/grid/images/community/grid-active.png'
import store from '@/store/index.js'
import Saihan from '../../../static/saihan.js'

const POLYGON_STYLES = {
  1: {
    strokeWeight: 4, strokeColor: 'rgba(102, 0, 204, 1)', strokeStyle: 'dashed',
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

const CITY_NAME = '呼和浩特市赛罕区'

class BaiduMap {
  constructor(container, center, showGrid = true, showLevel = false) {
    this.container = container
    this.baseMap = null
    this.bmapApi = BMap
    this.infoWindow = null
    this.center = center
    this.gridPolygons = {}
    this.curGridTypes = []
    this.showGrid = showGrid
    this.showLevel = showLevel
    this.gridIcon = null
    this.gridActiveIcon = null
    this.curGridMark = null
    this.coverPolygon = null
    this.boundaryPoints = []
    this.initMap()
  }

  initMap() {
    // const center = transCoords.WGS84toBD09(window.$setting.center[0], window.$setting.center[1])
    // 初始化地图
    this.baseMap = new BMap.Map(this.container, { enableMapClick: false })
    this.baseMap.setMaxZoom(20)
    this.baseMap.setMinZoom(10)
    this.baseMap.enableScrollWheelZoom(true)
    this.baseMap.setDefaultCursor('grab')
    const opts = {
      width: 200, // 信息窗口宽度
      height: 250, // 信息窗口高度
      // title: '海底捞王府井店', // 信息窗口标题
      enableMessage: true, // 设置允许信息窗发送短息
      enableCloseOnClick: false,
      message: '内容'
    }
    this.infoWindow = new BMap.InfoWindow('内容', opts)

    // this.baseMap.setMapStyleV2({
    //   styleJson: STYLE_JSON
    // })

    this.mouseLabel = new BMap.Label('', { offset: new BMap.Size(0, -42) })
    this.mouseLabel.setStyle({ color: '#000', fontSize: '16px', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none' })

    if (this.showGrid) {
      this.gridIcon = new BMap.Icon(gridImg, new BMap.Size(34, 45))
      this.gridActiveIcon = new BMap.Icon(gridActiveImg, new BMap.Size(34, 45))

      // 点击层级展示
      this.addGrids(1, '01')

      // this.getGridPolygons()
      // 缩放展示不同层级
      // this.baseMap.addEventListener('zoomend', () => {
      //   const curZoom = this.baseMap.getZoom()
      //   if (curZoom <= 15) {
      //     this.displayGrid([1])
      //   } else if (curZoom <= 17) {
      //     this.displayGrid([1, 2])
      //   } else {
      //     this.displayGrid([3])
      //   }
      // })
    }
    this.getBoundary(CITY_NAME)
  }

  // 获取行政边界
  getBoundary(cityName) {
    // const bdary = new BMap.Boundary()
    // // 获取行政区域
    // bdary.get(cityName, (rs) => {
    //   // 行政区域的点有多少个
    //   const count = rs.boundaries.length
    //   if (count === 0) {
    //     alert('未能获取当前输入行政区域')
    //     return
    //   }
    //   this.boundaryPoints = []
    //   for (let i = 0; i < count; i++) {
    //     const ply = new BMap.Polygon(rs.boundaries[i], {
    //       strokeWeight: 5, strokeColor: 'rgba(13, 101, 251, 1)', fillColor: 'rgba(13, 101, 251, 0.4)', strokeStyle: 'dashed',
    //       // strokeWeight: 10, strokeColor: 'rgba(255, 0, 0, 1)', fillColor: 'rgba(13, 101, 251, 0.4)', strokeStyle: 'solid',
    //       strokeDasharray: [5, 5], fillOpacity: 0.2
    //     })
    //     this.baseMap.addOverlay(ply)
    //     this.boundaryPoints = this.boundaryPoints.concat(ply.getPath())
    //   }

    //   this.setBoundView()
    // })

    // 根据已有面画行政区划
    this.boundaryPoints = []
    const path = []
    Saihan.map(point => {
      path.push(transCoords.GCJ02toBD09(point[0], point[1]))
    })
    const ply = this.addPolygon(path, {
      strokeWeight: 5, strokeColor: 'rgba(13, 101, 251, 1)', fillColor: 'rgba(13, 101, 251, 0.4)', strokeStyle: 'dashed',
      strokeDasharray: [5, 5], fillOpacity: 0.2
    })
    this.baseMap.addOverlay(ply)
    this.boundaryPoints = this.boundaryPoints.concat(ply.getPath())

    this.setBoundView()
  }

  /**
   * 设置视野，初始化、重置视野等
   */
  setBoundView() {
    if (this.center) {
      const point = new BMap.Point(this.center[0], this.center[1])
      this.baseMap.centerAndZoom(point, 14)
    } else {
      this.baseMap.setViewport(this.boundaryPoints) // 调整视野
    }
  }

  showGridInfo(branchId, grid) {
    GetGridStatic({ code: branchId, type: grid.type }).then(response => {
      const info = `<div class="info-congrid">
        <h5 class="info-con-title" >${grid.name || ''}</h5>
        <div class="info-con-detail">
          <span>总户数：${response.data.house}</span>
          <span>总人口：${response.data.person}</span>
          <span>党员数：${response.data.dy}</span>
          <span>常住人口：${response.data.czrk}</span>
          <span>流动人口：${response.data.ldrk}</span>
          <span>网格数：${response.data.wgs}</span>
          <span>网格员：${response.data.wgy}</span>
          <span>小区数：${response.data.xqzs}</span>
          <span>房屋数：${response.data.fwzs}</span>
          <span>驻区单位数：${response.data.zqdyzs}</span>
          <span>男性人口：${response.data.man}</span>
          <span>女性人口：${response.data.woman}</span>
          <span>特殊人数：${response.data.tsrs}</span>
          <span>低保人数：${response.data.dbr}</span>
          <span>残疾人：${response.data.cjr}</span>
          <span>老人：${response.data.lr}</span>
          <span>60岁以上老人：${response.data.sixty}</span>
        </div>
        </div>`

      if (grid.center) {
        switch (grid.type) {
          case 1:
            this.infoWindowSetContent(info, grid.center, null)
            break
          case 2:
            this.infoWindowSetContent(info, grid.center, null)
            break
          case 3:
            this.infoWindowSetContent(info, grid.center, null)
            break

          default:
            break
        }
      } else {
        this.$message.warning('当前网格无中心点！')
      }
    })
  }

  getGridPolygons() {
    GetGridList({ page: 1, pageSize: 1000 }).then(response => {
      if (response.data && response.data.length > 0) {
        response.data.map((item, index) => {
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

        this.getBoundary(CITY_NAME)
      }
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

    // marker 高亮
    const marker = curBranch.marker
    marker.setIcon(this.gridActiveIcon)
    this.curGridMark && this.curGridMark.setIcon(this.gridIcon)
    this.curGridMark = marker

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

  /**
   * 高亮显示街道、社区、网格
   * @param {string} branchId 标识
   * @param {string} type 类型
   */
  highlightGrid(branchId, type) {
    if (!branchId) return

    if (this.curType && this.curBranchId) {
      this.gridPolygons[`${this.curBranchId}_type_${this.curType}`].map(grid => {
        this.baseMap.removeOverlay(grid.polygon)
        this.baseMap.removeOverlay(grid.marker)
      })
    }
    this.baseMap.closeInfoWindow()

    this.addGrids(type, branchId)

    // 遮盖版本
    // this.showGridInfo(branchId)
    // this.handleCoverPolygon(branchId)
  }

  // 清除地图上网格相关要素
  clearGridInfo() {
    if (this.coverPolygon) {
      this.baseMap.removeOverlay(this.coverPolygon)
      this.coverPolygon = null
    }
    if (this.curGridMark) {
      this.curGridMark.setIcon(this.gridIcon)
      this.curGridMark = null
    }
    this.baseMap.closeInfoWindow()

    store.dispatch('map/setStreet', null)
    store.dispatch('map/setCommunity', null)
    this.highlightGrid('01', 1)
  }

  curType = null
  curBranchId = null
  curGrid = null
  curLabel = null
  mouseLabel = null
  /**
   * 根据层级类型、父级标识添加网格
   * @param {number} type 层级类型
   * @param {string} branchId 父级标识
   */
  addGrids(type, branchId) {
    this.curType = type
    this.curBranchId = branchId

    let viewPath = []
    const objName = `${branchId}_type_${type}`
    if (this.gridPolygons[objName]) {
      this.gridPolygons[objName].map(grid => {
        this.baseMap.addOverlay(grid.polygon)
        this.baseMap.addOverlay(grid.marker)
        viewPath = viewPath.concat(grid.polygon.getPath())
      })
      this.baseMap.setViewport(viewPath) // 调整视野到当前街道
    } else {
      GetGridList({ page: 1, pageSize: 100, type, branchId }).then(response => {
        const polygonList = []
        if (response.data && response.data.length > 0) {
          response.data.map((item, index) => {
            const location = JSON.parse(item.location)
            const path = []
            location.map(point => {
              path.push(transCoords.GCJ02toBD09(point[0], point[1]))
            })
            const color = getColorByIndex(index)
            const grid = this.addPolygon(path, { ...POLYGON_STYLES[item.type], fillColor: color, fillOpacity: 0.5 })
            viewPath = viewPath.concat(grid.getPath())
            let center = null
            if (item.centerPoint) {
              const point = JSON.parse(item.centerPoint)
              const BDpoint = transCoords.GCJ02toBD09(point[0], point[1])
              center = new BMap.Point(BDpoint[0], BDpoint[1])
            }
            const marker = new BMap.Marker(center, { icon: this.gridIcon })
            // 添加事件
            if (type === 3) {
              marker.addEventListener('click', () => {
                this.showGridInfo(item.branchId, { center, type: type, name: item.branchName })
              })
            } else if (this.showLevel) {
              marker.addEventListener('click', () => {
                this.highlightGrid(item.branchId, type + 1)
                type === 1 && store.dispatch('map/setStreet', { name: item.branchName, branchId: item.branchId, type: type + 1 })
                type === 2 && store.dispatch('map/setCommunity', { name: item.branchName, branchId: item.branchId, type: type + 1 })
              })
            }
            // 鼠标移入移出事件
            marker.addEventListener('mouseover', () => {
              this.mouseLabel.setContent(item.branchName)
              this.mouseLabel.setPosition(center)
              this.baseMap.addOverlay(this.mouseLabel)
            })
            marker.addEventListener('mouseout', () => {
              this.baseMap.removeOverlay(this.mouseLabel)
            })

            this.baseMap.addOverlay(marker)

            polygonList.push({
              type: item.type,
              polygon: grid,
              center: center,
              marker: marker,
              color
            })
          })
        }
        this.gridPolygons[objName] = polygonList
        this.baseMap.setViewport(viewPath) // 调整视野到当前街道
      })
    }

    this.curGrid && this.baseMap.removeOverlay(this.curGrid)
    this.curLabel && this.baseMap.removeOverlay(this.curLabel)
    if (type === 2 || type === 3) {
      GetGridInfo({ id: branchId }).then(response => {
        if (response.data && response.data.location) {
          const location = JSON.parse(response.data.location)
          const path = []
          location.map(point => {
            path.push(transCoords.GCJ02toBD09(point[0], point[1]))
          })
          this.curGrid = this.addPolygon(path, {
            strokeWeight: 3, strokeColor: '#FF00cc', strokeStyle: 'dashed',
            strokeDasharray: [5, 5], fillOpacity: 0
          })

          let center = null
          if (response.data.centerPoint) {
            const point = JSON.parse(response.data.centerPoint)
            const BDpoint = transCoords.GCJ02toBD09(point[0], point[1])
            center = new BMap.Point(BDpoint[0], BDpoint[1])
          }
          this.curLabel = new BMap.Label(response.data.branchName, { position: center })
          this.curLabel.setStyle({ color: '#f00', fontSize: '24px', backgroundColor: 'transparent', border: 'none' })
          this.baseMap.addOverlay(this.curLabel)

          this.baseMap.setViewport(this.curGrid.getPath()) // 调整视野到当前街道

          this.showGridInfo(branchId, { center, type: type - 1, name: response.data.branchName })
        }
      })
    }
  }

  getPoint(point) {
    const BDpoint = transCoords.GCJ02toBD09(point[0], point[1])
    return new BMap.Point(BDpoint[0], BDpoint[1])
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
   * 初始化标注，不添加到地图
   * @param {Object} options 参数
   */
  getMarker(point, options) {
    const pointT = new BMap.Point(point[0], point[1])
    const marker = new BMap.Marker(pointT, options)
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
   * 实例化面，添加到地图
   * @param {array} path
   * @param {object} options
   */
  addPolygon(path, options) {
    const pathTemp = []
    path.map(item => {
      pathTemp.push(new BMap.Point(item[0], item[1]))
    })
    const polyline = new BMap.Polygon(pathTemp, options)
    this.baseMap.addOverlay(polyline)
    return polyline
  }

  /**
   * 设置InfoWindow内容及坐标
   */
  infoWindowSetContent(content, point, zoom = 16) {
    this.infoWindow.setContent(content)
    const pointM = Array.isArray(point) ? new this.bmapApi.Point(point[0], point[1]) : point
    this.baseMap.openInfoWindow(this.infoWindow, pointM)
    if (zoom) {
      this.baseMap.setZoom(zoom)
      this.baseMap.panTo(pointM)
    }
    // this.baseMap.centerAndZoom(pointM, zoom)
  }
}

export default BaiduMap
