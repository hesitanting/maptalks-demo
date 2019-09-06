<template>
  <div class="container">
    <div
      v-loading="loading"
      element-loading-text="地图加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      id="map"
      class="map"
    ></div>
    <div class="seartchCon">
      <!-- <el-select
        class="sinput"
        v-model="queryStr"
        filterable
        clearable
        remote
        placeholder="搜地点、查公交、找路线"
        :remote-method="remoteMethod"
      >
        <el-option
          v-for="(item,index) in seartchResult"
          :key="index"
          :label="item.name"
          :value="item.name"
        >
          <span style="float: left">{{ item.name||'' }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.address||'' }}</span>
        </el-option>
      </el-select>-->
      <el-autocomplete
        class="sinput"
        popper-class="my-autocomplete"
        clearable
        v-model="queryStr"
        :fetch-suggestions="querySearch"
        placeholder="请输入内容"
        @select="handleSelect"
      >
        <i class="el-icon-edit el-input__icon" slot="suffix" @click="handleIconClick"></i>
        <template slot-scope="{ item }">
          <div class="name">{{ item.name }}</div>
          <span class="addr" style="color: #8492a6; font-size: 12px">{{ item.address }}</span>
        </template>
      </el-autocomplete>
      <el-button type="primary" class="sbtn" icon="el-icon-search">搜索</el-button>
    </div>
    <div class="routeInfo">
      <div class="infoclose">×</div>
      <div class="timeCon">
        <el-timeline class="timeline">
          <el-timeline-item
            v-for="item in routeResult"
            :key="item.guid"
            :timestamp="item.instruction"
            placement="top"
          >
            <el-card>
              <span>预计耗时:{{secondToDate(item.duration)}}</span>
              <span>距离:{{item.distance}}米</span>
              <p>当前路段:{{item.road.length==0?'':item.road}}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div class="endLine"></div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
export default {
  name: "mapIndex",
  props: {
    msg: String
  },
  data() {
    return {
      loading: true,
      queryStr: "",
      searchResult: [],
      routeResult: []
    };
  },
  watch: {
    queryStr(val) {
      if ($.trim(val) == "") this.$mapapi.layer.clearLayerById("markerLayer1");
    }
  },
  mounted() {
    this.$mapapi.baseMap.mapInit("map", "amap", "", {}, () => {
      this.loading = false;
      // this.$mapapi.drawTool.drawToolsInit("point", "drawToolLayer", data => {});
      this.$mapapi.contextMenu.createNavMenu(data => {
        this.routeResult = data;
        $('.routeInfo').animate({
          left: 20
        }, 500)
        this.resize();
      });
    });
    this.resize();
    this.evtBind();
    window.addEventListener("resize", this.resize, false);
  },
  methods: {
    remoteMethod(str) {
      this.$mapapi.query.queryData(str, data => {
        this.searchResult = data.results;
        return;
        this.searchResult = data.results.map(item => {
          return {
            label: item.name,
            value: `${item.city || ""}${item.area || ""}`
          };
        });
      });
    },
    querySearch(queryString, cb) {
      if (queryString == "") cb([]);
      this.$mapapi.query.queryData(queryString, data => {
        this.searchResult = data.pois;
        cb(this.searchResult);
      });
    },
    handleSelect(item) {
      this.queryStr = item.name;
      item.longitude = item.location.split(",")[0];
      item.latitude = item.location.split(",")[1];
      this.$mapapi.graphic.addMarker("markerLayer1", item);
      // console.log(item);
    },
    handleIconClick(ev) {
      console.log(ev);
    },
    secondToDate(result) {
      var h =
        Math.floor(result / 3600) < 10
          ? "0" + Math.floor(result / 3600)
          : Math.floor(result / 3600);
      var m =
        Math.floor((result / 60) % 60) < 10
          ? "0" + Math.floor((result / 60) % 60)
          : Math.floor((result / 60) % 60);
      var s =
        Math.floor(result % 60) < 10
          ? "0" + Math.floor(result % 60)
          : Math.floor(result % 60);
      return (result = h + ":" + m + ":" + s);
    },
    resize() {
      $(".routeInfo").css(
        "height",
        $(".container").height() - $(".seartchCon").height() - 60
      );
      setTimeout(() => {
        $(".timeCon").css("max-height", $(".routeInfo").height() - 20);
      }, 500);
    },
    evtBind(){
      $('.infoclose').bind('click',e=>{
        $('.routeInfo').animate({
          left: -450
        }, 500)
        this.$mapapi.layer.clearRouteLayer()
      })
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only scss(npm install node-sass sass-loader style-loader --save) -->
<style lang='scss' scoped>
.container {
  width: 100%;
  height: 100%;
  .map {
    width: 100%;
    height: 100%;
  }
  .seartchCon {
    position: absolute;
    left: 20px;
    top: 20px;
    pointer-events: auto;
    width: 390px;
    float: left;
    box-sizing: border-box;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.15);
    .sinput {
      width: 300px;
      height: 40px;
      line-height: 35px;
      text-align: left;
      float: left;
    }
    .my-autocomplete {
      width: 300px;
      height: 40px;
      line-height: 40px;
      text-align: left;
      float: left;
      li {
        line-height: normal;
        // padding: 7px;

        .name {
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .addr {
          font-size: 12px;
          color: #b4b4b4 !important;
        }

        .highlighted .addr {
          color: #ddd !important;
        }
      }
    }
  }
  .routeInfo {
    left: -430px;
    top: 70px;
    position: absolute;
    z-index: 11;
    width: 390px;
    border-radius: 8px;
    box-shadow: 1px 2px 8px rgba(0, 0, 0, 0.15);
    background: rgba($color: #fff, $alpha: 0.9);
    .timeCon {
      width: 100%;
      overflow-y: auto;
      .timeline {
        margin: 15px;
        text-align: left;
      }
    }
    .endLine {
      width: 360px;
      height: 2px;
      border-radius: 2px;
      background: rgba($color: #cece, $alpha: 0.9);
      bottom: 5px;
      position: absolute;
      margin-left: 15px;
    }
    .infoclose {
      position: absolute;
      right: -10px;
      top: -6px;
      z-index: 11;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      line-height: 22px;
      text-align: center;
      font-size: 20px;
      cursor: pointer;
      background: #409eff;
      color: #fff;
    }
  }
}
</style>
