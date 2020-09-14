/*
 * @Author: ZHT
 * @Date: 2020-09-14 09:34:48
 * @Last Modified by: ZHT
 * @Last Modified time: 2020-09-14 09:49:10
 */

/**
 * 百度地图轨迹
 */
import BMap from 'BMap'
import workerIcon from '@/assets/images/trajectory_person.png'

// const LINE_ARRAY = [
//   [111.696509, 40.811332],
//   [111.695646, 40.813345],
//   [111.695161, 40.814485],
//   [111.694712, 40.815516],
//   [111.695808, 40.815823],
//   [111.697892, 40.816369],
//   [111.700551, 40.817311],
//   [111.701539, 40.817433],
//   [111.702114, 40.816219],
//   [111.702527, 40.815236],
//   [111.702635, 40.815249],
//   [111.702958, 40.814403],
//   [111.703785, 40.812697],
//   [111.704108, 40.811659],
//   [111.704665, 40.810472]
// ]

class BaiduTra {
  constructor(map) {
    this.map = map
    this.marker = null
    this.markerIcon = null
    this.lineArr = []
    this.timeArr = []
    this.polyline = null
    this.passedPolyline = null
    this.markerOffset = null
    this.markerLabel = null
    this.playInterval = null
    this.curIndex = 0
    this.initData()
  }

  initData() {
    this.markerIcon = new BMap.Icon(workerIcon, new BMap.Size(36, 36))
  }

  /**
   * 初始化轨迹信息
   * @param {Array} points
   */
  initTra(points, iconPath = null) {
    if (iconPath) {
      this.markerIcon = iconPath
    }
    if (points && points.length > 0) {
      this.lineArr = []
      this.timeArr = []

      points.map((item, index) => {
        this.lineArr.push(new BMap.Point(item.longitude, item.latitude))
        this.timeArr.push(item.addtime)

        // this.lineArr.push(new BMap.Point(item[0], item[1]))
        // this.timeArr.push(`2020-09-13 15:${index + 10}:07`)
      })
    }

    // 坐标转换

    // 添加标注
    this.marker = new BMap.Marker(this.lineArr[0], { icon: this.markerIcon })
    this.markerLabel = new BMap.Label(this.timeArr[0], { offset: new BMap.Size(20, -20) })
    this.marker.setLabel(this.markerLabel)
    this.map.baseMap.addOverlay(this.marker)

    // 轨迹原路径
    this.polyline = new BMap.Polyline(this.lineArr, {
      strokeColor: '#28F', // 线颜色
      strokeWeight: 4, // 线宽
      strokeStyle: 'dashed' // 线样式-虚线
    })
    this.map.baseMap.addOverlay(this.polyline)

    // 经过路径
    this.passedPolyline = new BMap.Polyline(null, {
      strokeColor: '#AF5', // 线颜色
      strokeWeight: 4, // 线宽
      strokeStyle: 'dashed' // 线样式-虚线
    })
    this.map.baseMap.addOverlay(this.passedPolyline)

    this.map.baseMap.setViewport(this.lineArr)
  }

  /**
   * 播放事件
   * @param {number} speed 两点间停留时间
   */
  play(speed) {
    this.curIndex = 0
    this.playInterval && clearInterval(this.playInterval)
    this.playInterval = setInterval(() => {
      if (this.curIndex + 1 === this.lineArr.length) {
        clearInterval(this.playInterval)
      } else {
        this.curIndex++
        this.marker.setPosition(this.lineArr[this.curIndex])
        this.markerLabel.setContent(this.timeArr[this.curIndex])
        this.map.baseMap.panTo(this.lineArr[this.curIndex])
      }
    }, speed)
  }

  // 暂停
  pause() {
    this.playInterval && clearInterval(this.playInterval)
  }

  // 继续
  resume(speed) {
    this.playInterval && clearInterval(this.playInterval)
    this.playInterval = setInterval(() => {
      if (this.curIndex + 1 === this.lineArr.length) {
        clearInterval(this.playInterval)
      } else {
        this.curIndex++
        this.marker.setPosition(this.lineArr[this.curIndex])
        this.markerLabel.setContent(this.timeArr[this.curIndex])
        this.map.baseMap.panTo(this.lineArr[this.curIndex])
      }
    }, speed)
  }

  clear() {
    this.marker && this.map.baseMap.removeOverlay(this.marker) && (this.marker = null)
    this.polyline && this.map.baseMap.removeOverlay(this.polyline) && (this.polyline = null)
    this.markerLabel && this.map.baseMap.removeOverlay(this.markerLabel) && (this.markerLabel = null)
  }
}

export default BaiduTra
