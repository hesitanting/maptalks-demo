<template>
  <div id="app">
    <router-view />
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import start from "./components/start.vue";

export default {
  name: "app",
  components: {
    start
  }
};
</script>

<style>
#app {
  /* font-family: 'Avenir', Helvetica, Arial, sans-serif; */
  font-family: "Microsoft Yahei";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

p {
  margin: 0;
}
::-webkit-scrollbar {
    width: 16px;
    height: 16px;
    border-radius: 10px;
    background-color: #f5f5f5;
    display: none;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #1499fe;
}

::-webkit-input-placeholder {
    /* WebKit browsers */
    color: #39b4f9;
    font-size: 14px;
}

:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #39b4f9;
    font-size: 14px;
}

::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #39b4f9;
    font-size: 14px;
}

:-ms-input-placeholder {
    /* Internet Explorer 10+ */
    color: #39b4f9;
    font-size: 14px;
}
</style>
<style lang="scss" src>
@import '../public/css/infowindow.scss'
</style>
