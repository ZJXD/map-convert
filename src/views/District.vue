<template>
  <div class="district">
    <div id="districtMap" />
    <el-input v-model="districtName" placeholder="请输入行政区划名称" @change="onInputChange" />
  </div>
</template>

<script>
import GaodeMap from '../GIS/AMap/GaodeMap'

export default {
  data() {
    return {
      districtMap: null,
      districtName: ''
    }
  },
  mounted() {
    this.districtMap = new GaodeMap('districtMap', null, null, [6, 20])
  },
  methods: {
    onInputChange() {
      this.districtMap.drawBounds(this.districtName)
    }
  }
}
</script>

<style lang="scss" scoped>
.district {
  position: relative;
  width: 100%;
  height: 100%;

  #districtMap {
    width: 100%;
    height: 100%;
  }

  .el-input {
    position: absolute;
    right: 20px;
    top: 20px;
    width: 180px;
  }
}
</style>
