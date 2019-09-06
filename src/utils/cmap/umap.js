import baseMapManager from './manager/baseMapManager'
import drawToolManager from './manager/drawToolManager'
import layerManager from './manager/layerManager'
import graphicManager from './manager/graphicManager'
import queryTask from './manager/queryTaskManager'
import contextMenu from './manager/contextMenuManager'
import config from './config/mapConfig'

class uMap {
    constructor() {
        this.baseMapApi = new baseMapManager();
        this.drawApi = new drawToolManager();
        this.queryApi = new queryTask();
        this.layerApi = new layerManager();
        this.graphicApi = new graphicManager();
        this.cmenuApi = new contextMenu();
        this.Map = null;
    }

    mapInit(containId, type, baseUrl, opts, callfun) {
        this.baseMapApi.createBaseMap(containId, type, baseUrl, opts, baseMap => {
            this.Map = baseMap;
            if (callfun)
                callfun();
        })
    }

    drawToolsInit(type, layerid, callback) {
        this.drawApi.createDrawTool(this.Map, type, layerid, callback);
    }

    queryData(querystr, callback) {
        let url = `${config.amap_poiSearchUrl}${querystr}`;
        this.queryApi.queryDataByApi(url, callback);
    }

    addMarker(layerid, data) {
        let layer = this.layerApi.getEmptyLayerByID(this.Map, layerid);
        let foo = data => {
            let coord = [Number(data.longitude), Number(data.latitude)];
            let symbol = this.graphicApi.createSymbol('point', {});
            let graphic = this.graphicApi.createGraphic('point', coord, data, symbol).addTo(layer);
        }
        if (Array.isArray(data))
            data.forEach(item => {
                foo(item)
            })
        else
            foo(data)
        this.layerApi.layerToExtent(this.Map, layerid);
    }

    clearLayerById(layerid) {
        this.layerApi.clearLayerById(this.Map, layerid);
    }

    createNavMenu(callback) {
        this.cmenuApi.createNavMenu(this.Map, callback);
    }

    clearRouteLayer() { 
        this.cmenuApi.clearRouteLayer();
    }
}
let expMap = new uMap();
export default {
    baseMap: { //底图相关
        mapInit(containId, type, baseUrl, opts, callfun) {
            return expMap.mapInit(containId, type, baseUrl, opts, callfun);
        }
    },
    layer: { //图层相关
        clearLayerById(layerid) {
            return expMap.clearLayerById(layerid);
        },
        clearRouteLayer() { 
            return expMap.clearRouteLayer();
        }
    },
    graphic: { //要素相关
        addMarker(layerid, data) {
            return expMap.addMarker(layerid, data);
        }
    },
    drawTool: { //工具类相关
        drawToolsInit(type, layerid, callback) {
            return expMap.drawToolsInit(type, layerid, callback);
        }
    },
    query: {//查询类相关
        queryData(str, cb) {
            return expMap.queryData(str, cb);
        }
    },
    contextMenu: {
        createNavMenu(cb) { 
            return expMap.createNavMenu(cb);
        }
    }
}