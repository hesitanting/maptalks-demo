import * as maptalks from "maptalks"
import layerManager from './layerManager'
import graphicManager from './graphicManager'
import commonFun from './commonFun'

/**
 * 绘制工具
 */
class drawToolManager {
    constructor() {
        this.drawTool = null;
        this.layerApi = new layerManager();
        this.graphicApi = new graphicManager();
        this.commomApi = new commonFun();
    }

    /**
     * 创建带拖动距离的圆(类似百度搜索周边)
     * @param {object} map 地图对象
     * @param {array} coord 坐标
     * @param {string} layerid 图层id
     */
    createDistanceCircle(map, coord, layerid, finishCall) {
        if (!this.Verification(map, coord, layerid)) return;
        //中心点坐标
        //coord = [114.40574405802731, 30.511866371789772];
        // 定位到中心点
        map.panTo(coord);
        let radius = 500;
        //创建图层
        let layer = this.layerApi.getLayerByID(map, layerid);
        //创建半径500米的区域范围(圆)
        let mainCircle = new maptalks.Circle(coord, radius, {
            symbol: {
                lineColor: '#5298f8',
                lineWidth: 2,
                lineOpacity: 1,
                lineDasharray: [10, 10, 10],
                polygonFill: '#5298f8',
                polygonOpacity: 0.3
            }
        }).addTo(layer);
        //创建范围中心点(可不加)
        let circleCenter = new maptalks.Circle(coord, 5, {
            symbol: {
                lineColor: '#5298f8',
                lineWidth: 1,
                polygonFill: '#fff',
                polygonOpacity: 1
            }
        }).addTo(layer);
        //500米范围的坐标点(根据需要设置差值)
        let dCoord = [coord[0] + 0.005221611647172608, coord[1]];
        //let val = coord[0] - dCoord[0];
        //console.log(val)
        //创建拖动范围的标注点
        let dragMarker = new maptalks.Marker(dCoord, {
            draggable: true,
            dragShadow: false, //不设false则拖动的时候不实时更新圆的大小，在拖动结束才更新
            dragOnAxis: 'x', //设置在xy轴方向拖动 可设值为x，y
            id: 'dragMarker',
            'symbol': {
                textName: '500米',
                textHaloFill: '#fff',
                textHaloRadius: 5,
                textFill: '#5298f8',
                textWeight: 600,
                textDx: 40,
                textDy: 3,
                markerFile: this.commomApi.getCommonImg('drag'),
                markerWidth: 27,
                markerHeight: 12,
                markerDy: 5
            }
        }).addTo(layer);
        this.layerApi.layerToExtent(map, layerid);
        //标注添加拖动事件
        dragMarker.on('dragging', e => {
            let coord1 = e.target.getCoordinates();
            let coord2 = circleCenter.getCoordinates();
            radius = map.computeLength(coord1, coord2); //半径
            dragMarker.updateSymbol({
                textName: `${Math.floor(radius).toFixed(0)}米`
            })
            mainCircle.setRadius(radius)
            //console.log(coord1)
        })
        //拖动结束事件
        dragMarker.on('dragend', e => {
            this.layerApi.layerToExtent(map, layerid);
            finishCall({
                centerCoord: coord, //中心点
                radius: radius, //半径
                extent: mainCircle.getExtent() //圆的范围
            })
        })
    }

    /**
     * 验证参数
     * @param {*} map 
     * @param {*} coord 
     * @param {*} layerid 
     */
    Verification(map, coord, layerid) {
        if (!map) {
            console.log('drawTooManager--The map is not allow null')
            return false;
        }
        if (!coord) {
            console.log('drawTooManager--The coordinate is necessary')
            return false;
        }
        if (!Array.isArray(coord)) {
            console.log(`drawTooManager--The coordinate is required array(like this-[112.123,30.123]) or array's val is invalid`)
            return false;
        }
        if (!layerid) {
            console.log(`drawTooManager--The layer's id is necessary`);
            return false
        }
        return true;
    }

    /**
     * 绘制工具
     * @param {object} map 地图对象
     * @param {string} type 类型(可选值-point|line|polygon)
     * @param {string} layerid 图层id
     * @param {function} callback 回调
     */
    createDrawTool(map, type, layerid, callback) {
        let symbolData = this.getDrawSymbol(type);
        this.drawTool = new maptalks.DrawTool({
            mode: symbolData.mode,
            symbol: symbolData.symbol,
            once: true
        }).addTo(map)
        this.drawTool.on('drawend', param => { //定位结束
            this.loadDrawResult(map, type, layerid, param.geometry.getCoordinates(), callback);
        });
    }

    //绘制上图
    loadDrawResult(map, type, layerid, coords, callback) {
        let layer = this.layerApi.getLayerByID(map, layerid);
        this.layerApi.reorderLayer(map, layerid);
        let symbol = this.getDrawSymbol(type).symbol;
        let graphic = this.graphicApi.createGraphic(type, coords, {}, symbol);
        graphic.addTo(layer);
        if (type == 'point' || type == 'line') graphic.bringToFront();
        graphic.config('draggable', true); //配置可拖拽属性
        let data = this.formatGraphicCoord(graphic);
        callback(data);
        this.dtEvtBind(graphic, callback);
    }

    /**
     * 返回geometry类型("Point","LineString","Polygon") 以及坐标字符串
     * @param {object} graphic geometry对象
     */
    formatGraphicCoord(graphic) { 
        let coords = '';
        if (graphic.getType() == "Polygon") {
            coords = graphic.getCoordinates()[0];
        } else if (graphic.getType() == "LineString") {
            coords = graphic.getCoordinates()
        } else
            coords = [graphic.getCoordinates()]
        let coordstr = '';
        coords.forEach(item => {
            coordstr += item.x + "," + item.y + ";";
        })
        return {
            type: graphic.getType(),
            coord: coordstr
        }
    }
    /**
     * 点击事件绑定
     * @param {object} graphic 绘制要素
     * @param {function} callback 回调
     */
    dtEvtBind(graphic, callback) {
        graphic.on('click', e => {
            let attr = graphic.getProperties();
            if (e.target.getType() !== 'Point') {
                if (!attr.editStatus) {
                    attr.editStatus = true;
                    let options = this.getEditSymbol();
                    graphic.startEdit(options); //添加可编辑性
                } else {
                    attr.editStatus = false;
                    graphic.endEdit();
                }
                graphic.setProperties(attr);
            }
            // let html = `<div class="delGraphic" style="width:70px;height:30px;text-align:center;line-height:30px;border-radius:5px;background:#fff;cursor:pointer;">删除<div>`;
            // this.setInfoWindow(graphic, html, 0, 0, {
            //     single: true,
            //     autoPan: true
            // });
        })
        graphic.on('shapechange', e => {
            callback(this.formatGraphicCoord(e.target))
        })
    }

    /**
     *(DrawToolModeAndSymbol)根据类型获取绘制类型(mode)以及样式(symbol)
     * @param {string} type 绘制类型-point,line,polygon
     */
    getDrawSymbol(type) {
        let symbol = {}, //样式
            mode = ''; //绘制模式
        switch (type) {
            case 'point':
                mode = 'Point';
                symbol = {
                    markerFile: this.commomApi.getCommonImg('marker'),
                    markerWidth: 26,
                    markerHeight: 33
                }
                break;
            case 'line':
                mode = 'LineString';
                symbol = {
                    lineColor: '#5298f8',
                    lineWidth: 4,
                }
                break;
            case 'polygon':
                mode = 'Polygon';
                symbol = {
                    lineColor: '#5298f8',
                    lineWidth: 4,
                    polygonFill: '#5298f8',
                    polygonOpacity: 0.5,
                    polygonPatternFile: drawFillStyle('#5298f8', 1, 10)
                }
                break;
        }

        function drawFillStyle(lineColor, lineWidth, spacing) {
            var color = lineColor || '#ccc';
            var width = lineWidth || 1.0;
            var space = spacing || 15;
            var canvas = document.createElement('canvas');
            canvas.width = spacing * 3 + lineWidth;
            canvas.height = spacing * 3 + lineWidth;
            return drawGrid(canvas, color, width, spacing, spacing);
        }

        function drawGrid(canvas, color, lineWidth, stepx, stepy) {
            var context = canvas.getContext("2d");
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
                context.beginPath();
                context.moveTo(i, 0);
                context.lineTo(i, context.canvas.height);
                context.stroke();
            }

            for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
                context.beginPath();
                context.moveTo(0, i);
                context.lineTo(context.canvas.width, i);
                context.stroke();
            }
            const data = canvas.toDataURL('image/png', 1);
            return data;
        }
        return {
            mode: mode,
            symbol: symbol
        };
    }

    /**
     * 绘制工具编辑样式
     */
    getEditSymbol() {
        function createHandleSymbol(markerType, opacity) {
            return {
                'markerType': markerType,
                'markerFill': '#fff',
                // markerFillOpacity: 0.5,
                'markerLineColor': '#5298f8',
                'markerLineWidth': 2,
                'markerWidth': 10,
                'markerHeight': 10,
                'opacity': opacity
            };
        }
        const options = {
            //fix outline's aspect ratio when resizing
            'fixAspectRatio': false,
            // geometry's symbol when editing
            // 'symbol': null,
            'removeVertexOn': 'contextmenu',
            //symbols of edit handles
            'centerHandleSymbol': createHandleSymbol('ellipse', 1),
            'vertexHandleSymbol': createHandleSymbol('ellipse', 1),
            'newVertexHandleSymbol': createHandleSymbol('ellipse', 0.4)
        };
        return options;
    }
}
export default drawToolManager;