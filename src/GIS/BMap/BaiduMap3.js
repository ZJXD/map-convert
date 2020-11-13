/*
 * @Author: ZHT
 * @Date: 2020-11-13 17:12:49
 * @Last Modified by:   ZHT
 * @Last Modified time: 2020-11-13 17:12:49
 */
/**
 * 百度地图
 */
import BMap from 'BMap'
import { GetGridList, GetGridInfo, GetGridStatic } from '@/modules/grid/api/index'
import transCoords from '@/utils/gps'
import { getColorByIndex } from '@/utils/color'
import store from '@/store/index.js'

const POLYGON_STYLES = {
  1: {
    strokeWeight: 3, strokeStyle: 'solid'
  },
  2: {
    strokeWeight: 2, strokeStyle: 'solid'
  },
  3: {
    strokeWeight: 1, strokeStyle: 'solid'
  }
}

class BaiduMap {
  constructor(container, center, showGrid = true, showLevel = false) {
    this.container = container
    this.baseMap = null
    this.bmapApi = BMap
    this.infoWindow = null
    this.center = center
    this.gridPolygons = {}
    this.showGrid = showGrid
    this.showLevel = showLevel
    this.boundaryPoints = []
    this.initMap()
  }

  initMap() {
    this.center || (this.center = transCoords.WGS84toBD09(window.$setting.center[0], window.$setting.center[1]))
    // 初始化地图
    this.baseMap = new BMap.Map(this.container, { enableMapClick: false })
    this.baseMap.setMaxZoom(20)
    this.baseMap.setMinZoom(10)
    this.baseMap.enableScrollWheelZoom(true)
    this.baseMap.setDefaultCursor('grab')
    const opts = {
      width: 200, // 信息窗口宽度
      height: 250, // 信息窗口高度
      enableMessage: true, // 设置允许信息窗发送短息
      enableCloseOnClick: false,
      message: '内容'
    }
    this.infoWindow = new BMap.InfoWindow('内容', opts)

    if (this.showGrid) {
      // 点击层级展示
      this.addGrids(1, '01')
    }

    this.setBoundView()

    this.baseMap.setMapStyleV2({
      styleId: '489443e2086eeb1a87530afcc5aa0043'
    })
  }

  /**
   * 设置视野，初始化、重置视野等
   */
  setBoundView(point) {
    if (this.center) {
      const pointC = new BMap.Point(this.center[0], this.center[1])
      this.baseMap.centerAndZoom(pointC, 14)
    } else if (point) {
      const pointC = new BMap.Point(point[0], point[1])
      this.baseMap.centerAndZoom(pointC, 14)
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
        </div>
        </div>`

      // <span>60岁以上老人：${response.data.sixty}</span>
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
        this.baseMap.removeOverlay(grid.gridLabel)
      })
    }
    this.baseMap.closeInfoWindow()

    this.addGrids(type, branchId)
  }

  // 清除地图上网格相关要素
  clearGridInfo() {
    this.baseMap.closeInfoWindow()
    this.highlightGrid('01', 1)
    store.dispatch('map/setStreet', null)
    store.dispatch('map/setCommunity', null)
  }

  curType = null
  curBranchId = null
  curGrid = null
  /**
   * 根据层级类型、父级标识添加网格
   * @param {number} type 层级类型
   * @param {string} branchId 父级标识
   */
  async addGrids(type, branchId) {
    this.curType = type
    this.curBranchId = branchId

    this.curGrid && this.baseMap.removeOverlay(this.curGrid)
    if (type === 2 || type === 3) {
      const response = await GetGridInfo({ id: branchId })
      if (response.data && response.data.location) {
        const location = JSON.parse(response.data.location)
        const path = []
        location.map(point => {
          path.push(transCoords.GCJ02toBD09(point[0], point[1]))
        })
        this.curGrid = this.addPolygon(path, {
          strokeWeight: 3, strokeColor: '#FF00cc', strokeStyle: 'dashed',
          strokeDasharray: [5, 5], fillColor: '#000', fillOpacity: 0
        })

        this.baseMap.setViewport(this.curGrid.getPath()) // 调整视野到当前街道
      }
    }

    let viewPath = []
    const objName = `${branchId}_type_${type}`
    if (this.gridPolygons[objName]) {
      this.gridPolygons[objName].map(grid => {
        this.baseMap.addOverlay(grid.polygon)
        this.baseMap.addOverlay(grid.gridLabel)
        viewPath = viewPath.concat(grid.polygon.getPath())
      })
      type === 1 && this.baseMap.setViewport(viewPath) // 调整视野到当前街道
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
            const grid = this.addPolygon(path, { ...POLYGON_STYLES[item.type], strokeColor: color, fillColor: color, fillOpacity: 0.6 })
            viewPath = viewPath.concat(grid.getPath())

            // 添加事件
            if (type !== 3 && this.showLevel) {
              grid.addEventListener('click', () => {
                this.highlightGrid(item.branchId, type + 1)
                type === 1 && store.dispatch('map/setStreet', { name: item.branchName, branchId: item.branchId, type: type + 1 })
                type === 2 && store.dispatch('map/setCommunity', { name: item.branchName, branchId: item.branchId, type: type + 1 })
              })
            }

            let center = null
            if (item.centerPoint) {
              const point = JSON.parse(item.centerPoint)
              const BDpoint = transCoords.GCJ02toBD09(point[0], point[1])
              center = new BMap.Point(BDpoint[0], BDpoint[1])
            }

            const gridLabel = new BMap.Label(item.branchName, { offset: new BMap.Size(-40, 0), position: center })
            gridLabel.setStyle({ color: '#fff', fontSize: '16px', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', textAlign: 'center', lineHeight: '10px' })
            let content = `<p class="numberfont" style="margin:0 0 5px 0;">${item.wgNum}<p/><p style="margin:0;">${item.branchName}<p/>`
            type === 3 && (content = `<p style="margin:0;">${item.branchName}<p/>`)
            gridLabel.setContent(content)
            this.baseMap.addOverlay(gridLabel)

            polygonList.push({
              type: item.type,
              polygon: grid,
              center: center,
              gridLabel: gridLabel,
              color
            })
          })
        }
        this.gridPolygons[objName] = polygonList
        type === 1 && this.baseMap.setViewport(viewPath) // 调整视野到当前街道
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
