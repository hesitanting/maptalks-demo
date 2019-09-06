import * as maptalks from "maptalks"
import $ from 'jquery';
import layerManager from './layerManager'
import graphicManager from './graphicManager'
import commonFun from './commonFun'
import queryTask from './queryTaskManager'
import drawTool from './drawToolManager'
import config from '../config/mapConfig'
import {
    Object
} from "core-js";

/**
 * 右键菜单类(路径搜索，poi搜索等)
 */
class contextMenu {
    currentCoord = {
        current: null, //当前点
        start: null, //起点
        end: null //终点
    };
    routeLayer = []; //路径图层集
    whereLayer = []; //这是哪图层集
    currentResult = null; //路径结果集
    map = null;
    constructor() {
        this.layerApi = new layerManager();
        this.graphicApi = new graphicManager();
        this.commonApi = new commonFun();
        this.queryApi = new queryTask();
        this.drawToolApi = new drawTool();
    }

    createNavMenu(map, callback) {
        this.map = map;
        var options = {
            'custom': true,
            'items': this.getContext()
        };
        map.setMenu(options);

        map.on('contextmenu', e => {
            this.currentCoord.current = e.coordinate;
            map.openMenu(e.coordinate);
            this.eventBind(callback);
        });
        map.on('click', e => {
            map.closeMenu()
        })
    }

    eventBind(callback) {
        //起点
        $("#menuFrom").click(e => {
            this.createStartEndMarker('start', this.currentCoord.current, callback)
        })
        //终点
        $("#menuTo").click(e => {
            this.createStartEndMarker('end', this.currentCoord.current, callback)
        })
        //这是哪
        $('#menuWhere').click(e => {
            this.map.closeMenu();
            this.createWhere()
        })
        //设为中心点
        $('#menuCenter').click(e => {
            this.map.panTo(this.currentCoord.current);
        })
        //搜周边
        $('#menuAround').click(e => {
            let layerid = 'distanceCirleLayer';
            this.layerApi.clearLayerById(this.map, layerid);
            this.drawToolApi.createDistanceCircle(this.map, [this.currentCoord.current.x, this.currentCoord.current.y], layerid, data => { 
                
            });
        })

    }

    /**
     * 创建起止点标注并调用接口查询路径规划数据
     * @param {string} type 起止点类型(start|end)
     * @param {array} coord 坐标
     * @param {function} callback 回调
     */
    createStartEndMarker(type, coord, callback) {
        this.clearWhereLayer();
        type == 'start' ? this.currentCoord.start = coord : this.currentCoord.end = coord;
        let point = coord;
        let imgsrc = type == 'start' ? this.commonApi.getTrackImg('trackstart') : this.commonApi.getTrackImg('trackend');
        let properties = type == 'start' ? {
            type: 'route_start'
        } : {
            type: 'route_end'
        }
        let layer = this.layerApi.getEmptyLayerByID(this.map, `route${type}MarkerLayer`);
        this.routeLayer.push(layer);
        let symbol = this.graphicApi.createSymbol('point', {
            markerFile: imgsrc,
            markerWidth: 30,
            markerHeight: 48
        });
        let graphic = this.graphicApi.createGraphic('point', point, properties, symbol).addTo(layer);
        this.map.closeMenu();
        if (this.currentCoord.start && this.currentCoord.end)
            this.routePlanning(callback);
    }

    /**
     * 查询路径规划数据
     * @param {*} callback 
     */
    routePlanning(callback) {
        let origin = `${this.currentCoord.start.x},${this.currentCoord.start.y}`; //出发点-起点
        let destination = `${this.currentCoord.end.x},${this.currentCoord.end.y}`; //目的地-终点
        let url = `${config.amap_routeUrl}origin=${origin}&destination=${destination}`;
        this.queryApi.queryDataByApi(url, data => {
            // console.log(data);
            this.loadRouteLine(data, callback);
        })
    }

    /**
     * 绘制路径
     * @param {*} data 
     * @param {*} callback 
     */
    loadRouteLine(data, callback) {
        let layer = this.layerApi.getEmptyLayerByID(this.map, 'routeLineLayer');
        layer.bringToBack();
        this.routeLayer.push(layer);
        let sresult = [];
        let foo = item => {
            let coordinate = item.polyline.split(';').map(xdata => {
                return [Number(xdata.split(',')[0]), Number(xdata.split(',')[1])]
            })
            let symbol = this.graphicApi.createSymbol('line', {
                lineWidth: 6,
                lineCap: 'round'
            });
            let graphic = this.graphicApi.createGraphic('line', coordinate, item, symbol).addTo(layer);
            let guid = this.commonApi.GetGuid(6, 10);
            item.guid = guid;
            sresult.push(item);
            graphic.setId(guid);
        }
        data.route.paths[0].steps.forEach(item => {
            foo(item);
        });
        this.currentResult = sresult;
        callback(this.currentResult);
        this.layerApi.layerToExtent(this.map, 'routeLineLayer');
    }

    /**
     * 查询当前位置数据并弹窗显示
     */
    createWhere() {
        this.getNowLocationData(data => {
            this.createWhereMarker(data);
        })
    }

    createWhereMarker(data) {
        let img = this.commonApi.getCommonImg('marker3');
        let layer = this.layerApi.getEmptyLayerByID(this.map, `markerWhereLayer`);
        this.whereLayer.push(layer);
        let symbol = this.graphicApi.createSymbol('point', {
            markerFile: img,
            // markerWidth: 30,
            // markerHeight: 46
        });
        let graphic = this.graphicApi.createGraphic('point', this.currentCoord.current, data, symbol).addTo(layer);
        let content = this.getWhereHtml(data);
        setTimeout(() => {
            this.setInfoWindow(graphic, content, {
                dy: -12
            }, g => {
                g.remove();
            });
            this.map.panTo(this.currentCoord.current);
        }, 100);
    }

    /**
     * 调用接口查询当前位置数据
     * @param {*} callback 
     */
    getNowLocationData(callback) {
        let locate = `${this.currentCoord.current.x},${this.currentCoord.current.y}`; //当前右键坐标点
        let url = `${config.amap_queryByLocate}${locate}`;
        this.queryApi.queryDataByApi(url, data => {
            callback(data)
        })
    }
    /**
     * 返回菜单html标签内容
     */
    getContext() {
        let html = `
        <div class="contextMenu">
            <ul class="context_menu" style="border-bottom:2px solid rgba(246, 246, 246, 1);">
                <li id="menuFrom">
                    <i class="menu-icon menu-icon-from"></i>
                    <span>设为起点</span>
                </li>
                <li id="menuVia">
                    <i class="menu-icon menu-icon-via"></i>
                    <span>设为途经点</span>
                </li>
                <li id="menuTo">
                    <i class="menu-icon menu-icon-to"></i>
                    <span>设为终点</span>
                </li>
            </ul>
            <ul class="context_menu">
                <li id="menuWhere">
                    <i class="el-icon-question" style="margin-left:5px;"></i>
                    <span>这是哪</span>
                </li>
                <li id="menuAround">
                    <i class="el-icon-place" style="margin-left:5px;"></i>
                    <span>搜周边</span>
                </li>
                <li id="menuCenter">
                    <i class="el-icon-location-information" style="margin-left:5px;"></i>
                    <span>设为中心点</span>
                </li>
            </ul>
        </div>
        `;
        return html;
    }

    getWhereHtml(data) {
        let title = `${data.regeocode.addressComponent.city}${data.regeocode.addressComponent.district}${data.regeocode.addressComponent.township}`;
        let address = `${data.regeocode.addressComponent.streetNumber.street}${data.regeocode.aois.length == 0 ? data.regeocode.formatted_address : data.regeocode.aois[0].name}`;
        let html = `
            <div class="whereInfo">
                <div class="_closeBtn">×</div>
                <div class="title">${title}</div>
                <div class="addressCon">
                    <div class="address">在${address}附近</div>
                    <div class="searchBtn">搜周边</div>
                </div>
                <div class="arrow"></div>
            </div>
        `;
        return html;
    }

    /**
     * 信息弹窗
     * @param {Object} graphic 要素(点|线|面)
     * @param {string} content html
     * @param {Number} dx 窗口x方向调整值
     * @param {Number} dy 窗口y方向调整值
     */
    setInfoWindow(graphic, content, opts, closeCall) {
        var options = {
            'single': true,
            'autoPan': true,
            'custom': true,
            'dx': 0,
            'dy': 0,
            'content': content
        };
        options = Object.assign(options, opts);
        // graphic.removeInfoWindow();
        graphic.setInfoWindow(options);
        graphic.openInfoWindow();
        $('._closeBtn').click(e => {
            graphic.closeInfoWindow();
            closeCall(graphic);
        })
    }

    clearRouteLayer() {
        this.routeLayer.forEach(layer => {
            layer.clear();
        })
        this.currentCoord.start = null;
        this.currentCoord.end = null;
    }
    clearWhereLayer() {
        this.whereLayer.forEach(layer => {
            layer.clear();
        })
    }
}
export default contextMenu;