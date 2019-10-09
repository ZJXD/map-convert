<template>
  <div id="app">
    <home />
  </div>
</template>

<script>
import Home from "./views/Home"

export default {
  name: "app",
  components: {
    Home
  }
}
</script>

<style>
body {
  margin: 0;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  overflow: hidden;
}
</style>
