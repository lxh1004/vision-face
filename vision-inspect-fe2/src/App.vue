<template>
  <el-container id="app">
    <el-header id="header" height="70px">
      <h1>现场管理审核平台</h1>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
export default {
  // global awareness
  name: "App",
};
</script>

<style lang="scss">
$content-width: 1200px;
$header-height: 70px;

#app {
  padding-top: $header-height;
  background: #d1d4d7;
  display: block;
  #header {
    width: 100%;
    background: #111;
    position: fixed;
    top: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    h1 {
      width: $content-width;
      margin: 0 auto;
      color: #dcdcdc;
      line-height: $header-height;
    }
  }
  .el-main {
    height: 100%;
    padding: 0;
    #main {
      width: $content-width;
      min-height: 100%;
      margin: 0 auto;
      padding: 15px 50px;
      background: #eee;
      border: solid #dcdcdc;
      border-width: 0 1px;
      box-sizing: border-box;
    }
  }
}
</style>
