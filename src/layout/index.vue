<template>
  <div class="layout">
    <el-menu :default-active="curPath" :router="true">
      <el-menu-item v-for="menu in menuList" :key="menu.id" :index="menu.path">
        {{ menu.name }}
      </el-menu-item>
    </el-menu>
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuList: [
        { id: 1, name: '转换', path: '/convert' },
        { id: 2, name: '行政区划', path: '/district' },

        { id: 100, name: '关于', path: '/about' }
      ],
      curPath: '/convert'
    }
  },
  created() {
    this.curPath = this.$route.fullPath
  }
}
</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
