<template>
  <div class="map-page">
    <div :id="aMapContainerId" class="map-box" style="display:block;" />
    <div :id="bMapContainerId" class="map-box" />
    <div :id="tMapContainerId" class="map-box" />
    <!-- <div :id="l7MapContainerId" class="map-box"></div> -->
    <el-select v-model="selectedMap" placeholder="请选择底图" size="mini" class="map-select" @change="mapChange">
      <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
    <div class="map-page-right">
      <h2>操作区</h2>
      <div class="oper-item">
        <h3>坐标拾取</h3>
        <button :class="['button', isGetCoord === true ? 'active' : '']" @click="getCoordBtn">
          拾取坐标
        </button>
        <label class="text">X:{{ X }}</label>
        <label class="text">Y:{{ Y }}</label>
        <label class="text">XY:{{ XY }}</label>
      </div>
      <div class="oper-item">
        <h3>坐标转换</h3>
        <el-form label-width="70px">
          <el-form-item label="转换方式">
            <el-select v-model="selectedConvert" placeholder="请选择转换方式" size="mini">
              <el-option v-for="item in convertOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="坐标X">
            <el-input v-model="inputX" placeholder="请输入X坐标" size="mini" />
          </el-form-item>
          <el-form-item label="坐标Y">
            <el-input v-model="inputY" placeholder="请输入Y坐标" size="mini" />
          </el-form-item>
          <el-form-item label="OutputXY">
            <label>{{ outputXY }}</label>
          </el-form-item>
          <el-form-item>
            <button class="button" @click="convertCoord">
              转换坐标
            </button>
          </el-form-item>
        </el-form>
      </div>
      <div class="oper-item" style="padding-bottom:10px;">
        <h3>画线</h3>
        <button :class="['button', isGetPolyline === true ? 'active' : '']" @click="getPolylineBtn">
          开始画线
        </button>
        <label class="text">线坐标：</label>
        <el-input v-model="polylineDataStr" :rows="5" type="textarea" />
      </div>
      <div class="oper-item">
        <h3>切割线</h3>
        <button :class="['button', isDrawPolyline === true ? 'active' : '']" @click="drawPolyline">
          开始画线
        </button>
        <button :class="['button', isSliceline === true ? 'active' : '']" @click="sliceLine">
          交点线
        </button>
        <button :class="['button', isSplitLine === true ? 'active' : '']" @click="splitLine">
          切割线
        </button>
      </div>
      <div class="oper-item">
        <h3>合并面</h3>
        <button class="button" @click="unionPolygon">
          合并并打印
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import BaiduMap from '../GIS/BMap/BaiduMap'
import GaodeMap from '../GIS/AMap/GaodeMap'
import TiandiMap from '../GIS/TMap/TiandiMap'
// import l7Map from '../components/l7Map'
import Convert from '../utils/transCoords'
import lineIntersect from '@turf/line-intersect'
// import lineSlice from '@turf/line-slice'
import { lineString } from '@turf/helpers'
import lineSplit from '@turf/line-split'
import { randomColor2 } from '../utils/color'

export default {
  components: {},
  data() {
    return {
      aMapContainerId: 'gaodeMap',
      gaodeMap: null,
      l7MapContainerId: 'l7Map',
      l7Map: null,
      bMapContainerId: 'baiduMap',
      baiduMap: null,
      tMapContainerId: 'tiandituMap',
      tiandituMap: null,
      mapList: [
        {
          label: '高德地图',
          value: 'gaode'
        },
        {
          label: '百度地图',
          value: 'baidu'
        },
        {
          label: '天地图',
          value: 'tianditu'
        }
        // {
        //   label: 'AntV L7',
        //   value: 4,
        // },
      ],
      selectedMap: 'gaode',
      aMapBox: null,
      bMapBox: null,
      tMapBox: null,
      l7MapBox: null,
      isGetCoord: false,
      X: null,
      Y: null,
      XY: null,
      mapClickEvent: null,
      convertOptions: [
        {
          label: 'WGS转高德',
          value: 'WGS84toGCJ02'
        },
        {
          label: '百度转高德',
          value: 'BD09toGCJ02'
        },
        {
          label: '高德转百度',
          value: 'GCJ02toBD09'
        },
        {
          label: '高德转WGS',
          value: 'GCJ02toWGS84'
        },
        {
          label: '百度转WGS',
          value: 'BD09toWGS84'
        },
        {
          label: 'WGS转百度',
          value: 'WGS84toBD09'
        }
      ],
      selectedConvert: null,
      inputX: null,
      inputY: null,
      outputXY: null,
      oldMarker: null,
      newMarker: null,
      markerOffset: null,
      polylineDataStr: '',
      polylineData: [],
      mouseToolEvent: null,
      isGetPolyline: false,
      isDrawPolyline: false,
      aMapLine: null,
      isSliceline: false,
      aMapSliceLine: null,
      intersectPointMarker: [],
      isSplitLine: false,
      aMapSplitLine: null,
      splitLines: []
    }
  },
  mounted() {
    if (this.selectedMap === 'baidu') {
      this.baiduMap = new BaiduMap(this.bMapContainerId)
    }
    this.tiandituMap = new TiandiMap(this.tMapContainerId)
    this.gaodeMap = new GaodeMap(this.aMapContainerId)
    // this.l7Map = new l7Map(this.l7MapContainerId)
    this.aMapBox = document.getElementById(this.aMapContainerId)
    this.bMapBox = document.getElementById(this.bMapContainerId)
    this.tMapBox = document.getElementById(this.tMapContainerId)
    // this.l7MapBox = document.getElementById(this.l7MapContainerId)
  },
  beforeDestroy() {
    this.mapClickEvent && this.gaodeMap.event.removeListener(this.mapClickEvent)
  },
  methods: {
    // 切换地图时，调取拾取坐标按钮事件，重置对应地图拾取状态
    mapChange(value) {
      // 为了使百度地图的容器第一次显示时再初始化，做了几个地图的容器显示的调整，用了原生 JS 控制
      switch (value) {
        case 'gaode':
          this.aMapBox.style.display = 'block'
          this.bMapBox.style.display = 'none'
          this.tMapBox.style.display = 'none'
          // this.l7MapBox.style.display = 'none'
          break
        case 'baidu':
          this.aMapBox.style.display = 'none'
          this.bMapBox.style.display = 'block'
          this.tMapBox.style.display = 'none'
          // this.l7MapBox.style.display = 'none'
          break
        case 'tianditu':
          this.aMapBox.style.display = 'none'
          this.bMapBox.style.display = 'none'
          this.tMapBox.style.display = 'block'
          // this.l7MapBox.style.display = 'none'
          break

        case 4:
          this.aMapBox.style.display = 'none'
          this.bMapBox.style.display = 'none'
          this.tMapBox.style.display = 'none'
          // this.l7MapBox.style.display = 'block'
          break

        default:
          break
      }
      if (!this.baiduMap && this.selectedMap === 'baidu') {
        this.baiduMap = new BaiduMap(this.bMapContainerId)
      }
      this.getCoordBtn(false)
      this.getPolylineBtn(false)
    },

    // 拾取坐标按钮事件
    getCoordBtn(changeBtn = true) {
      if (changeBtn) {
        this.isGetCoord = !this.isGetCoord
      }
      if (this.isGetCoord) {
        if (this.selectedMap === 'gaode') {
          this.gaodeMap.baseMap.setDefaultCursor('crosshair')
          this.mapClickEvent = this.gaodeMap.amapApi.event.addListener(
            this.gaodeMap.baseMap,
            'click',
            this.TDTAndGgaodeGetCoord
          )
        } else if (this.selectedMap === 'baidu') {
          this.baiduMap.baseMap.setDefaultCursor('crosshair')
          this.baiduMap.baseMap.addEventListener('click', this.baiduGetCoord)
        } else if (this.selectedMap === 'tianditu') {
          this.tMapBox.style.cursor = 'crosshair'
          this.tiandituMap.baseMap.addEventListener(
            'click',
            this.TDTAndGgaodeGetCoord
          )
        }
      } else {
        if (this.selectedMap === 'gaode') {
          this.gaodeMap.baseMap.setDefaultCursor('grab')
          this.mapClickEvent &&
            this.gaodeMap.amapApi.event.removeListener(this.mapClickEvent)
        } else if (this.selectedMap === 'baidu') {
          this.baiduMap.baseMap.setDefaultCursor('grab')
          this.baiduMap.baseMap.removeEventListener('click', this.baiduGetCoord)
        } else if (this.selectedMap === 'tianditu') {
          this.tMapBox.style.cursor = 'grab'
          this.tiandituMap.baseMap.removeEventListener(
            'click',
            this.TDTAndGgaodeGetCoord
          )
        }
      }
    },

    // 百度地图拾取坐标事件
    baiduGetCoord(e) {
      this.X = e.point.lng
      this.Y = e.point.lat
      this.XY = this.X + ',' + this.Y
    },

    // 天地图和高德地图拾取坐标事件
    TDTAndGgaodeGetCoord(e) {
      this.X = e.lnglat.getLng()
      this.Y = e.lnglat.getLat()
      this.XY = this.X + ',' + this.Y
    },

    // 转换坐标
    convertCoord() {
      if (!this.selectedConvert) {
        this.$message({
          message: '请选择转换方式',
          type: 'warning'
        })
        return
      }

      if (!this.inputX || !this.inputY) {
        this.$message({
          message: '请输入坐标',
          type: 'warning'
        })
        return
      }

      if (!this.markerOffset) {
        this.markerOffset = this.gaodeMap.initPixel(25, 0)
      }
      const x = Number(this.inputX)
      const y = Number(this.inputY)

      // 输入点标注
      if (this.oldMarker) {
        this.oldMarker.setPosition([x, y])
      } else {
        this.oldMarker = this.gaodeMap.addMarker({
          anchor: 'bottom-center',
          position: [x, y]
        })
        this.oldMarker.setLabel({
          offset: this.markerOffset,
          content: '输入点'
        })
      }

      // 转换坐标
      const temp = Convert[this.selectedConvert](x, y)
      this.outputXY = temp[0].toFixed(6) + ',' + temp[1].toFixed(6)

      // 输出点标注
      if (this.newMarker) {
        this.newMarker.setPosition(temp)
      } else {
        this.newMarker = this.gaodeMap.addMarker({
          anchor: 'bottom-center',
          position: temp
        })
        this.newMarker.setLabel({
          offset: this.markerOffset,
          content: '输出点'
        })
      }
    },

    // 画线
    getPolylineBtn(changeBtn = true) {
      if (changeBtn) {
        this.isGetPolyline = !this.isGetPolyline
      }

      if (this.isGetPolyline) {
        this.polylineDataStr = ''
        this.polylineData = []

        if (this.selectedMap === 'gaode') {
          this.gaodeMap.baseMap.setDefaultCursor('crosshair')
          this.gaodeMap.drawPolyline({ strokeColor: '#336699', strokeWeight: 4 })
          this.mapClickEvent = this.gaodeMap.amapApi.event.addListener(
            this.gaodeMap.mouseTool,
            'draw',
            event => {
              this.polylineData && this.gaodeMap.baseMap.remove(this.polylineData)
              this.polylineData = event.obj
              this.polylineDataStr = JSON.stringify(this.polylineData.getPath(), null, 4)
            }
          )
        } else if (this.selectedMap === 'baidu') {
          this.baiduMap.baseMap.setDefaultCursor('crosshair')
          this.baiduMap.baseMap.addEventListener(
            'click',
            this.getBaiduPolylineData
          )
        } else if (this.selectedMap === 'tianditu') {
          const tiandituBox = document.getElementById(this.tMapContainerId)
          tiandituBox.style.cursor = 'crosshair'
          this.tiandituMap.baseMap.addEventListener(
            'click',
            this.getPolylineData
          )
        }
      } else {
        if (this.selectedMap === 'gaode') {
          this.gaodeMap.baseMap.setDefaultCursor('grab')
          this.mapClickEvent &&
            this.gaodeMap.amapApi.event.removeListener(this.mapClickEvent)
        } else if (this.selectedMap === 'baidu') {
          this.baiduMap.baseMap.setDefaultCursor('grab')
          this.baiduMap.baseMap.removeEventListener(
            'click',
            this.getBaiduPolylineData
          )
        } else if (this.selectedMap === 'tianditu') {
          const tiandituBox = document.getElementById(this.tMapContainerId)
          tiandituBox.style.cursor = 'grab'
          this.tiandituMap.baseMap.removeEventListener(
            'click',
            this.getPolylineData
          )
        }
      }
    },

    // 天地图和高德地图，画线点击事件，拼接坐标
    getPolylineData(e) {
      this.polylineData.push({
        longitude: e.lnglat.getLng(),
        latitude: e.lnglat.getLat()
      })
      this.polylineDataStr = JSON.stringify(this.polylineData, null, 4)
    },
    // 百度地图，画线点击事件，拼接坐标
    getBaiduPolylineData(e) {
      this.polylineData.push({ longitude: e.point.lng, latitude: e.point.lat })
      this.polylineDataStr = JSON.stringify(this.polylineData, null, 4)
    },

    // 高德地图画线
    drawPolyline() {
      if (this.selectedMap !== 'gaode') {
        this.$message.warning('当前功能仅限高德地图！')
        return
      }

      this.isDrawPolyline = !this.isDrawPolyline
      if (this.gaodeMap && this.isDrawPolyline) {
        if (this.aMapLine) {
          this.gaodeMap.baseMap.remove(this.aMapLine)
          this.aMapLine = null
        }
        this.gaodeMap.baseMap.setDefaultCursor('crosshair')
        this.gaodeMap.drawPolyline()
        this.mouseToolEvent &&
          this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
        this.mouseToolEvent = this.gaodeMap.amapApi.event.addListener(
          this.gaodeMap.mouseTool,
          'draw',
          (event) => {
            this.aMapLine = event.obj
            this.gaodeMap.baseMap.setDefaultCursor('pointer')
            this.gaodeMap.mouseTool.close()
            this.mouseToolEvent &&
              this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
          }
        )
        // this.gaodeMap.mouseTool.on('draw', event => {
        //   this.aMapLine = event.obj
        //   this.gaodeMap.baseMap.setDefaultCursor('pointer')
        //   this.gaodeMap.mouseTool.close()
        // })
      }
    },

    // 画交点线，计算交点
    sliceLine() {
      if (this.selectedMap !== 'gaode') {
        this.$message.warning('当前功能仅限高德地图！')
        return
      }

      this.isSliceline = !this.isSliceline
      if (this.gaodeMap && this.isSliceline) {
        if (this.aMapSliceLine) {
          this.gaodeMap.baseMap.remove(this.aMapSliceLine)
          this.aMapSliceLine = null
          this.gaodeMap.baseMap.remove(this.intersectPointMarker)
          this.intersectPointMarker = []
        }
        this.gaodeMap.baseMap.setDefaultCursor('crosshair')
        this.gaodeMap.drawPolyline({ strokeColor: '#33FF66', strokeWeight: 4 })

        this.mouseToolEvent &&
          this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
        this.mouseToolEvent = this.gaodeMap.amapApi.event.addListener(
          this.gaodeMap.mouseTool,
          'draw',
          (event) => {
            this.aMapSliceLine = event.obj
            this.gaodeMap.baseMap.setDefaultCursor('pointer')
            this.gaodeMap.mouseTool.close()

            // 进行交点计算
            if (this.aMapLine) {
              const line1 = []
              const line2 = []
              this.aMapLine.getPath().map((item) => {
                line1.push([item.lng, item.lat])
              })
              this.aMapSliceLine.getPath().map((item) => {
                line2.push([item.lng, item.lat])
              })

              const intersectPoint = lineIntersect(
                lineString(line1),
                lineString(line2)
              )
              // debugger
              // console.log('intersectPoint', intersectPoint)
              intersectPoint.features &&
                intersectPoint.features.map((item) => {
                  this.intersectPointMarker.push(
                    this.gaodeMap.addMarker({
                      position: item.geometry.coordinates
                    })
                  )
                })
            }
            this.mouseToolEvent &&
              this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
          }
        )
      }
    },

    // 切割线
    splitLine() {
      if (this.selectedMap !== 'gaode') {
        this.$message.warning('当前功能仅限高德地图！')
        return
      }
      this.isSplitLine = !this.isSplitLine
      if (this.gaodeMap && this.isSplitLine) {
        if (this.aMapSplitLine) {
          this.gaodeMap.baseMap.remove(this.aMapSplitLine)
          this.aMapSplitLine = null
          this.gaodeMap.baseMap.remove(this.splitLines)
          this.splitLines = []
        }
        this.gaodeMap.baseMap.setDefaultCursor('crosshair')
        this.gaodeMap.drawPolyline({ strokeColor: '#dd3333', strokeWeight: 4 })

        this.mouseToolEvent &&
          this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
        this.mouseToolEvent = this.gaodeMap.amapApi.event.addListener(
          this.gaodeMap.mouseTool,
          'draw',
          (event) => {
            this.aMapSplitLine = event.obj
            this.gaodeMap.baseMap.setDefaultCursor('pointer')
            this.gaodeMap.mouseTool.close()

            // 进行切割
            if (this.aMapLine) {
              const line1 = []
              const line2 = []
              this.aMapLine.getPath().map((item) => {
                line1.push([item.lng, item.lat])
              })
              this.aMapSplitLine.getPath().map((item) => {
                line2.push([item.lng, item.lat])
              })

              const split = lineSplit(lineString(line1), lineString(line2))
              // debugger
              // console.log('split', split)
              split.features &&
                split.features.map((item) => {
                  this.splitLines.push(
                    this.gaodeMap.drawLine({
                      path: item.geometry.coordinates,
                      strokeColor: randomColor2(),
                      strokeWeight: 3
                    })
                  )
                })
            }
            this.mouseToolEvent &&
              this.gaodeMap.amapApi.event.removeListener(this.mouseToolEvent)
          }
        )
      }
    },

    // 合并面数据
    unionPolygon() {
      if (this.selectedMap === 'gaode') {
        this.gaodeMap.unionPolygon()
      } else {
        this.$message.warning('当前功能仅限高德地图')
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.map-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  font-size: 12px;
  position: relative;

  .map-box {
    width: 85%;
    height: 100%;
    display: none;
  }

  .map-select {
    position: absolute;
    top: 10px;
    right: 18%;
    width: 150px;
    z-index: 999;
  }

  .map-page-right {
    overflow-y: auto;
    height: 100%;
    width: 15%;
    padding: 0 20px 20px;
    box-sizing: border-box;

    // 设置滚动条样式
    // 血槽宽度（分别对应水平和垂直的）
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    // 拖动条
    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 6px;
    }
    // 背景槽
    &::-webkit-scrollbar-track {
      background-color: #ddd;
      border-radius: 6px;
    }

    .oper-item {
      text-align: left;
      border-bottom: 1px dashed #e66565;

      .text {
        display: block;
        margin: 10px 0;
      }

      .text-area {
        width: 100%;
        height: 100px;
      }
    }

    h3 {
      font-size: 14px;
      text-align: left;
      margin-block-end: 10px;
      color: #00e;
    }

    .button {
      height: 26px;
      width: 100px;
      background-color: white;
      border: 1px solid;
      border-radius: 3px;
      margin: 0 10px 10px 0;
      cursor: pointer;

      &:hover {
        background-color: #409eff;
      }

      &:focus {
        outline: none;
      }

      &.active {
        color: white;
        background-color: #409eff;
        border: none;
      }
    }
  }
}
</style>

<style lang="scss">
.map-page {
  .el-form-item {
    margin-bottom: 5px;
  }
}
</style>
