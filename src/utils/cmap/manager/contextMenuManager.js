import * as maptalks from "maptalks"
import $ from 'jquery';
import layerManager from './layerManager'
import graphicManager from './graphicManager'
import commonFun from './commonFun'
import queryTask from './queryTaskManager'
import config from '../config/mapConfig'

/**
 * 右键菜单类(路径搜索，poi搜索等)
 */
class contextMenu {
    currentCoord = {
        current: null, //当前点
        start: null, //起点
        end: null //终点
    };
    routeLayer = [];
    currentResult = null;
    map = null;
    constructor() {
        this.layerApi = new layerManager();
        this.graphicApi = new graphicManager();
        this.commonApi = new commonFun();
        this.queryApi = new queryTask();
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
        $("#menuFrom").click(e => {
            this.createMarker('start', this.currentCoord.current,callback)
        })
        $("#menuTo").click(e => {
            this.createMarker('end', this.currentCoord.current, callback)
        })

    }

    createMarker(type, coord, callback) {
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
        // let graphic = this.graphicApi.createGraphic('point', [Number(this.currentCoord.x), Number(this.currentCoord.y)], {
        //     type: 'route_start'
        // }, symbol).addTo(layer);
        this.map.closeMenu();
        if (this.currentCoord.start && this.currentCoord.end)
            this.routePlanning(callback);
    }

    routePlanning(callback) {
        let origin = `${this.currentCoord.start.x},${this.currentCoord.start.y}`; //出发点-起点
        let destination = `${this.currentCoord.end.x},${this.currentCoord.end.y}`; //目的地-终点
        let url = `${config.amap_routeUrl}origin=${origin}&destination=${destination}`;
        this.queryApi.queryDataByApi(url, data => { 
            // console.log(data);
            this.loadRouteLine(data, callback);
        })
    }

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
                <li id="menuFrom">
                    <i class="el-icon-question" style="margin-left:5px;"></i>
                    <span>这是哪</span>
                </li>
                <li id="menuVia">
                    <i class="el-icon-place" style="margin-left:5px;"></i>
                    <span>搜周边</span>
                </li>
                <li id="menuTo">
                    <i class="el-icon-location-information" style="margin-left:5px;"></i>
                    <span>设为中心点</span>
                </li>
            </ul>
        </div>
        `;
        return html;
    }

    clearRouteLayer() { 
        this.routeLayer.forEach(layer => { 
            layer.clear();
        })
        this.currentCoord.start = null;
        this.currentCoord.end = null;
    }
}
export default contextMenu;