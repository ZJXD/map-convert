<template>
  <div class="map-page">
    <div v-show="selectedMap === 1" :id="aMapContainerId" class="map-box"></div>
    <div v-show="selectedMap === 2" :id="bMapContainerId" class="map-box"></div>
    <el-select v-model="selectedMap" placeholder="请选择底图" size="mini" class="map-select" @change="mapChange">
      <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
      </el-option>
    </el-select>
    <div class="map-page-right">
      <h4>操作区</h4>
      <div class="oper-item">
        <h6>坐标拾取</h6>
        <button :class="['button', isGetCoord === true ? 'active' : '']" size="mini" @click="getCoordBtn">
          拾取坐标
        </button>
        <label class="text">X:{{ X }}</label>
        <label class="text">Y:{{ Y }}</label>
        <label class="text">XY:{{ XY }}</label>
      </div>
      <div class="oper-item">
        <h6>坐标转换</h6>
        <span>选取转换方式：</span>
        <el-select v-model="selectedConvert" placeholder="请选择转换方式" size="mini">
          <el-option v-for="item in convertOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <span>X:</span>
        <el-input v-model="inputX" placeholder="请输入X坐标" size="mini"></el-input>
        <span>Y:</span>
        <el-input v-model="inputY" placeholder="请输入Y坐标" size="mini"></el-input>
        <label class="text">OutputXY:{{ outputXY }}</label>
        <button class="button" @click="convertCoord">转换坐标</button>
      </div>
    </div>
  </div>
</template>

<script>
import aMap from "../components/aMap"
import bMap from "../components/bMap"
import Convert from "../utils/transCoords"

export default {
  components: {},
  data() {
    return {
      aMapContainerId: "gaodeMap",
      gaodeMap: null,
      bMapContainerId: "baiduMap",
      baiduMap: null,
      mapList: [
        {
          label: '高德地图',
          value: 1
        },
        {
          label: '百度地图',
          value: 2
        }
      ],
      selectedMap: 2,
      isGetCoord: false,
      X: null,
      Y: null,
      XY: null,
      mapClickEvent: null,
      convertOptions: [
        {
          label: "WGS转高德",
          value: 1
        },
        {
          label: "百度转高德",
          value: 2
        },
        {
          label: "高德转百度",
          value: 3
        },
        {
          label: "高德转WGS",
          value: 4
        }
      ],
      selectedConvert: null,
      inputX: null,
      inputY: null,
      outputXY: null,
      oldMarker: null,
      newMarker: null,
      markerOffset: null
    }
  },
  mounted() {
    this.baiduMap = new bMap(this.bMapContainerId)
    this.gaodeMap = new aMap(this.aMapContainerId)
  },
  methods: {
    // 切换地图时，调取拾取坐标按钮事件，重置对应地图拾取状态
    mapChange() {
      this.getCoordBtn(false)
    },

    // 拾取坐标按钮事件
    getCoordBtn(changeBtn = true) {
      if (changeBtn) {
        this.isGetCoord = !this.isGetCoord
      }
      if (this.isGetCoord) {
        if (this.selectedMap === 1) {
          this.gaodeMap.baseMap.setDefaultCursor("crosshair")
          this.mapClickEvent = this.gaodeMap.amapApi.event.addListener(
            this.gaodeMap.baseMap,
            "click",
            e => {
              this.X = e.lnglat.getLng()
              this.Y = e.lnglat.getLat()
              this.XY = e.lnglat.getLng() + "," + e.lnglat.getLat()
            }
          )
        } else if (this.selectedMap === 2) {
          this.baiduMap.baseMap.setDefaultCursor("crosshair")
          this.baiduMap.baseMap.addEventListener("click", this.baiduGetCoord)
        }
      } else {
        if (this.selectedMap === 1) {
          this.gaodeMap.baseMap.setDefaultCursor("default")
          this.mapClickEvent && this.gaodeMap.amapApi.event.removeListener(this.mapClickEvent)
        } else if (this.selectedMap === 2) {
          this.baiduMap.baseMap.setDefaultCursor("default")
          this.baiduMap.baseMap.removeEventListener("click", this.baiduGetCoord)

        }
      }
    },

    // 百度地图拾取坐标事件
    baiduGetCoord(e) {
      this.X = e.point.lng
      this.Y = e.point.lat
      this.XY = e.point.lng + "," + e.point.lat
    },

    // 转换坐标
    convertCoord() {
      if (!this.selectedConvert) {
        this.$message({
          message: "请选择转换方式",
          type: "warning"
        })
        return
      }

      if (!this.markerOffset) {
        this.markerOffset = this.gaodeMap.initPixel(25, 0)
      }
      const x = Number(this.inputX)
      const y = Number(this.inputY)
      if (this.oldMarker) {
        this.oldMarker.setPosition([x, y])
      } else {
        this.oldMarker = this.gaodeMap.addMarker({
          anchor: "bottom-center",
          position: [x, y]
        })
        this.oldMarker.setLabel({
          offset: this.markerOffset,
          content: "输入点"
        })
      }
      let temp = []
      switch (this.selectedConvert) {
        case 1:
          temp = Convert.WGS84toGCJ02(x, y)
          break
        case 2:
          temp = Convert.BD09toGCJ02(x, y)
          break
        case 3:
          temp = Convert.GCJ02toBD09(x, y)
          break
        case 4:
          temp = Convert.GCJ02toWGS84(x, y)
          break

        default:
          break
      }
      this.outputXY = temp.join(",")
      if (this.newMarker) {
        this.newMarker.setPosition(temp)
      } else {
        this.newMarker = this.gaodeMap.addMarker({
          anchor: "bottom-center",
          position: temp
        })
        this.newMarker.setLabel({
          offset: this.markerOffset,
          content: "输出点"
        })
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
  }

  .map-select {
    position: absolute;
    top: 10px;
    right: 18%;
    width: 150px;
  }

  .map-page-right {
    height: 100%;
    width: 15%;
    padding: 20px 10px 30px 10px;

    h4 {
      font-size: 18px;
      margin-block-start: 0;
    }

    .oper-item {
      text-align: left;

      .text {
        display: block;
        margin: 10px 0;
      }
    }

    h6 {
      font-size: 14px;
      text-align: left;
      margin-block-end: 10px;
    }

    .button {
      height: 26px;
      width: 100px;
      background-color: white;
      border: 1px solid;
      border-radius: 3px;

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
  .el-input--mini .el-input__inner {
    margin: 10px 0;
  }
}
</style>
