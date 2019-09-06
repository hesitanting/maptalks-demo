import * as maptalks from "maptalks"
import coordManager from './coordinateManager'
/**
 * 底图创建
 */
class baseMapManager {
    Map = null;
    constructor() {
        this.coordApi = new coordManager();
        console.log(`Welcome to maptalks's world`);
    }
    /**
     * 创建地图(含百度、谷歌、腾讯、天地图以及arcgis服务加载)
     * @param {string} containId 地图容器id
     * @param {string} type 底图类型(百度-baidu，谷歌-google，腾讯-tencent，天地图-tdt)
     * @param {string} baseUrl 底图地址
     * @param {Object} opts 底图相关配置
     * @param {Function} callfun 加载完回调
     */
    createBaseMap(containId, type, baseUrl, opts, callfun) {
        if (!containId) {
            console.log(`baseMapManager--The container is necessary`)
            return;
        }
        if (type === "" && baseUrl === "") type = 'baidu';
        let option = this.getBaseMapOption(type, baseUrl, opts);
        if (!option) return;
        this.Map && this.Map.remove()
        this.Map = new maptalks.Map(containId, option);
        this.Map.on("click", e => {
            console.log(`x:${e.coordinate.x},y:${e.coordinate.y}`)
        })
        let inter = setInterval(() => {
            if (this.Map) {
                clearInterval(inter);
                callfun(this.Map)
            }
        }, 500)
    }
    /**
     * 根据类型获取底图配置
     * @param {string} type 底图类型
     * @param {string} baseUrl 底图地址
     */
    getBaseMapOption(type, baseUrl, opts) {
        let options = null;
        if (opts.mapCenter && opts.mapCenter.length > 0)
            opts.mapCenter = opts.mapCenter.split(',');
        else
            opts.mapCenter = null;
        let coord = [114.40211, 30.523678]; //百度
        switch (type) {
            case '':
                maptalks.SpatialReference.loadArcgis(
                    baseUrl + "?f=pjson",
                    (err, conf) => {
                        let view = conf.spatialReference
                        let center = [Number((view.fullExtent.xmax + view.fullExtent.xmin) / 2), Number((view.fullExtent.ymax + view.fullExtent.ymin) / 2)]
                        view.projection = 'IDENTITY';
                        options = {
                            center: opts.mapCenter || center,
                            zoom: opts.mapZoomLevel || 3,
                            minZoom: 0,
                            maxZoom: view.resolutions.length - 1,
                            view: view,
                            attribution: false,
                            pitch: opts.mapPitch || 0,
                            baseLayer: new maptalks.TileLayer("customTile", {
                                tileSystem: conf.tileSystem,
                                tileSize: conf.tileSize,
                                renderer: 'canvas',
                                urlTemplate: `${baseUrl}/tile/{z}/{y}/{x}`,
                                repeatWorld: false
                            })
                        };
                    })
                break;
            case 'baidu': //bd09
            case 'baiduDeep': //bd09
                options = {
                    center: opts.mapCenter || [114.40211, 30.523678],
                    zoom: opts.mapZoomLevel || 12,
                    minZoom: 1,
                    maxZoom: 19,
                    pitch: opts.mapPitch || 0,
                    view: {
                        projection: 'baidu'
                    },
                    attribution: false,
                    baseLayer: new maptalks.TileLayer('baiduTile', {
                        //可选值:customid=dark, midnight, grayscale, hardedge, light, redalert, googlelite, grassgreen, pink, darkgreen, bluish
                        urlTemplate: type == "baiduDeep" ? 'http://api2.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20161109&scale=1&styles=t%3Abackground%7Ce%3Aall%7Cc%3A%2308133eff%2Ct%3Aland%7Ce%3Aall%7Cc%3A%2308133eff%2Ct%3Awater%7Ce%3Aall%7Cc%3A%23142a55ff%2Ct%3Abuilding%7Ce%3Aall%7Cc%3A%231a4380ff%2Ct%3Agreen%7Ce%3Ag.s%7Cc%3A%231a4385ff%2Ct%3Aeducation%7Ce%3Aall%7Cc%3A%231a4385ff%2Ct%3Ahighway%7Ce%3Aall%7Cc%3A%23193675ff%2Ct%3Aarterial%7Ce%3Aall%7Cc%3A%23193675ff%2Ct%3Alocal%7Ce%3Aall%7Cc%3A%23012450ff%2Ct%3Arailway%7Ce%3Aall%7Cc%3A%23012450ff%2Ct%3Apoi%7Ce%3Al%7Cc%3A%23ffffffff%2Ct%3Apoi%7Ce%3Al.t.s%7Cc%3A%23000000ff%2Ct%3Ahighway%7Ce%3Al.t.f%7Cc%3A%23000000ff%2Ct%3Aarterial%7Ce%3Al.t.f%7Cc%3A%23000000ff%2Ct%3Aarterial%7Ce%3Al.t.s%7Cc%3A%23f4edd9ff%2Ct%3Ahighway%7Ce%3Al.t.s%7Cc%3A%23f4edd9ff' : 'http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&newmap=1',
                        subdomains: [2]
                    })
                }
                break;
            case 'tdt': //wgs84
                let tdtCenter = this.coordApi.BD_WGS84(coord[0], coord[1])
                options = {
                    center: opts.mapCenter || tdtCenter,
                    zoom: opts.mapZoomLevel || 12,
                    minZoom: 1,
                    maxZoom: 18,
                    pitch: opts.mapPitch || 0,
                    attribution: false,
                    baseLayer: new maptalks.TileLayer('TdtTile', {
                        subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                        urlTemplate: 'http://t{s}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=6ce9abdf453f43ccdd3e1a6375b74306',
                    }),
                    layers: [
                        new maptalks.TileLayer('wordtile', { //文字图层
                            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                            urlTemplate: 'http://t{s}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=6ce9abdf453f43ccdd3e1a6375b74306',
                        })
                    ]
                }
                break;
            case 'google': //gcj02(火星坐标系)
                let googleCenter = this.coordApi.bd09ll_gcj02(coord[0], coord[1]);
                options = {
                    center: opts.mapCenter || googleCenter,
                    zoom: opts.mapZoomLevel || 12,
                    minZoom: 1,
                    maxZoom: 20,
                    pitch: opts.mapPitch || 0,
                    attribution: false,
                    baseLayer: new maptalks.TileLayer('googleTile', {
                        urlTemplate: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
                        // cssFilter: 'sepia(100%) invert(90%)'
                    })
                }
                break;
            case 'amap': //高德gcj02(火星坐标系)
                let amapCenter = this.coordApi.bd09ll_gcj02(coord[0], coord[1]);
                options = {
                    center: opts.mapCenter || amapCenter,
                    zoom: opts.mapZoomLevel || 12,
                    minZoom: 1,
                    maxZoom: 18,
                    pitch: opts.mapPitch || 0,
                    attribution: false,
                    baseLayer: new maptalks.TileLayer('amapTile', {
                        urlTemplate: 'http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                    })
                }
                break;
            case 'tencent': //gcj02(火星坐标系)
                let txCenter = this.coordApi.bd09ll_gcj02(coord[0], coord[1]);
                options = {
                    center: opts.mapCenter || txCenter,
                    zoom: opts.mapZoomLevel || 12,
                    minZoom: 1,
                    maxZoom: 18,
                    pitch: opts.mapPitch || 0,
                    attribution: false,
                    baseLayer: new maptalks.TileLayer('tencentTile', {
                        urlTemplate: (x, y, z) => {
                            var urlArgs = this.getUrlArgs(x, y, z);
                            var z = urlArgs.z;
                            var x = urlArgs.x;
                            var y = urlArgs.y;
                            var m = Math.floor(x / 16.0);
                            var n = Math.floor(y / 16.0);
                            var urlTemplate = 'http://rt0.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=3';
                            var url = urlTemplate.replace('{x}', x).replace('{y}', y).replace('{z}', z).replace('{m}', m).replace('{n}', n);
                            return url;
                        },
                        // cssFilter: 'sepia(100%) invert(100%)'
                    })
                }
                break;
        }
        if (opts.mapBearing)
            options.bearing = opts.mapBearing;
        options.fixCenterOnResize = true;
        return options;
    }

    getUrlArgs(x, y, z) {
        return {
            z: z,
            x: x,
            y: Math.pow(2, z) - 1 - y
        };
    }
}
export default baseMapManager;