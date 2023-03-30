<template>
  <div id="app">
    <Layout />
  </div>
</template>

<script>
import Layout from './layout'

export default {
  name: 'App',
  components: { Layout }
}
</script>

<style>
body {
  margin: 0;
}
#app {
  width: 100%;
  height: 100vh;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}

/* 隐藏地图标识 */
.anchorBL,
.amap-logo,
.amap-copyright,
.tdt-control-copyright {
  display: none !important;
}
</style>
