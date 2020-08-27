/*
 * @Author: ZHT
 * @Date: 2020-08-19 17:01:57
 * @Last Modified by: ZHT
 * @Last Modified time: 2020-08-19 17:30:20
 */

import BMap from 'BMap'
// import transCoords from '@/utils/transCoords'
import defaultImg from '@/assets/images/trajectory_person.png'

const LINE_ARRAY = [
  [120.056017, 30.286746],
  [120.057905, 30.286728],
  [120.060158, 30.286839],
  [120.063345, 30.286755],
  [120.065823, 30.286737],
  [120.067583, 30.286746],
  [120.069224, 30.286783],
  [120.069471, 30.285042],
  [120.069503, 30.283948],
  [120.069578, 30.282892],
  [120.069578, 30.282494],
  [120.069675, 30.281567],
  [120.069707, 30.280567],
  [120.068505, 30.280483],
  [120.068505, 30.280483],
  [120.065169, 30.280335],
  [120.063645, 30.280298],
  [120.062251, 30.280335],
  [120.062208, 30.282281]
]

/**
 * 百度地图轨迹回放类
 */
class Trajectory {
  constructor(map) {
    this.map = map
    this.lineArr = []
    this.timeArr = []
    this.marker = null
    this.polyline = null
    this.passedPolyline = null
    this.markerOffset = null
    this.initData()
    this.markerIcon = defaultImg
  }

  // 初始化数据等
  initData() {
    this.markerOffset = new BMap.Pixel(35, 0)
  }

  /**
   * 初始化轨迹信息
   * @param {Array} points
   */
  initTra(points, iconPath = LINE_ARRAY) {
    if (iconPath) {
      this.markerIcon = iconPath
    }
    if (points && points.length > 0) {
      this.lineArr = points
      // this.timeArr = Array(points.length, '2020-08-19 17:20:12')

      // 坐标去重并过滤偏移点
      // let tempPoint = points[0]
      // this.lineArr.push(
      //   transCoords['BD09toGCJ02'](tempPoint.longitude, tempPoint.latitude)
      // )
      // for (let i = 1; i < points.length; i++) {
      //   const t = points[i]
      //   if (
      //     t.longitude === tempPoint.longitude &&
      //     t.latitude === tempPoint.latitude
      //   ) {
      //     continue
      //   } else {
      //     tempPoint = t
      //     if (
      //       t.longitude === points[0].longitude &&
      //       t.latitude === points[0].latitude
      //     ) {
      //       t.longitude = Number(t.longitude) + 0.00000001
      //     }
      //     this.lineArr.push(transCoords['BD09toGCJ02'](t.longitude, t.latitude))
      //     this.timeArr.push(t.reportTime)
      //   }
      // }

      // 添加标注
      this.marker = new BMap.Marker(this.lineArr[0], {
        icon: this.markerIcon,
        offset: new BMap.Pixel(-20, -18)
      })
      this.marker.setLabel(new BMap.Label(this.timeArr[0], {
        offset: this.markerOffset
      }))

      // 轨迹原路径
      this.polyline = new BMap.Polyline({
        map: this.map,
        path: this.lineArr,
        // showDir: true,
        strokeColor: '#28F', // 线颜色
        strokeWeight: 4, // 线宽
        strokeStyle: 'dashed' // 线样式-虚线
      })

      // 移动过轨迹
      this.passedPolyline = new BMap.Polyline({
        map: this.map,
        strokeColor: '#AF5', // 线颜色
        strokeWeight: 4, // 线宽
        strokeStyle: 'dashed' // 线样式-虚线
      })

      // 移动事件
      this.marker.on('moving', (e) => {
        const len = e.passedPath.length
        this.marker.setLabel({
          offset: this.markerOffset,
          content: this.timeArr[len - 1]
        })
        this.passedPolyline.setPath(e.passedPath)
      })

      // this.map.setFitView(this.polyline, true)
      this.map.setFitView(this.polyline, true, [100, 100, 200, 300])
    }
  }

  // 开始移动
  startAnimation(speed) {
    if (this.marker) {
      this.marker.moveAlong(this.lineArr, speed)
    }
  }

  // 暂停播放
  pauseAnimation() {
    if (this.marker) {
      this.marker.pauseMove()
    }
  }

  // 继续播放
  resumeAnimation() {
    if (this.marker) {
      this.marker.resumeMove()
    }
  }
}

export default Trajectory
