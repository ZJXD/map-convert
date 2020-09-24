/**
 * AntV L7 地理信息数据可视化
 */

import * as L7 from '@antv/l7'

class l7Map {
  constructor(continer) {
    this.continer = continer
    this.scene = null
    this.initScene()
  }

  // 初始化L7视图
  initScene() {
    debugger
    this.scene = new L7.Scene({
      id: this.continer,
      mapStyle: 'dark', // 样式URL
      center: [102.602992, 23.107329],
      pitch: 15,
      zoom: 13.82
    })
    // 初始化地图，添加线图层
    fetch('https://gw.alipayobjects.com/os/rmsportal/oVTMqfzuuRFKiDwhPSFL.json')
      .then(res => res.json())
      .then(data => {
        const pointLayer = new L7.PointLayer({ zIndex: 2 })
          .source(data.list, {
            parser: {
              type: 'json',
              x: 'j',
              y: 'w'
            }
          })
          .shape('cylinder')
          .size('t', function(level) {
            return [1, 2, level * 2 + 20]
          })
          .color('t', [
            '#094D4A',
            '#146968',
            '#1D7F7E',
            '#289899',
            '#34B6B7',
            '#4AC5AF',
            '#5FD3A6',
            '#7BE39E',
            '#A1EDB8',
            '#CEF8D6'
          ])
          .style({
            opacity: 1.0
          })
        this.scene.addLayer(pointLayer)
      })

    // this.scene.on('loaded', function() {
    //   $.get(
    //     'https://gw.alipayobjects.com/os/rmsportal/ZVfOvhVCzwBkISNsuKCc.json',
    //     function(data) {
    //       this.scene
    //         .LineLayer({
    //           zIndex: 2,
    //         })
    //         .source(data)
    //         .size('ELEV', function(value) {
    //           return [1, (value - 1000) * 7]
    //         })
    //         .active(true)
    //         .shape('line')
    //         .color(
    //           'ELEV',
    //           [
    //             '#E8FCFF',
    //             '#CFF6FF',
    //             '#A1E9ff',
    //             '#65CEF7',
    //             '#3CB1F0',
    //             '#2894E0',
    //             '#1772c2',
    //             '#105CB3',
    //             '#0D408C',
    //             '#002466',
    //           ].reverse(),
    //         )
    //         .render()
    //     },
    //   )
    // })
  }
}

export default l7Map
