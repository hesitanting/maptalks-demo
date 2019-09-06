import * as maptalks from "maptalks"
import commonFun from './commonFun'

/**
 * 要素创建(点线面)、查找、高亮等
 */
class GraphicManager {
    constructor() {
        this.glowTarget = null;
        this.glowInter = [];
        this.commomApi = new commonFun();
    }

    /**
     * 创建要素(标注(点)|线|面)
     * @param {string} geometryType 要素类型('point','line','polygon')
     * @param {Array} coordinate 坐标
     * @param {Object} properties 要素绑定的数据
     * @param {Object} symbol 要素样式
     */
    createGraphic(geometryType, coordinate, properties, symbol) {
        let graphic = null;
        switch (geometryType) {
            case 'point':
                graphic = new maptalks.Marker(coordinate, {
                    symbol: symbol,
                    properties: properties
                });
                break;
            case 'line':
                graphic = new maptalks.LineString(coordinate, {
                    // smoothness:0.5,
                    symbol: symbol,
                    properties: properties
                })
                break;
            case 'polygon':
                graphic = new maptalks.Polygon(coordinate, {
                    symbol: symbol,
                    properties: properties
                })
                break;
        }
        return graphic;
    }

    /**
     * 根据geometry类别获取样式
     * @param {string} type 样式类别(point-点(标注),line-线,polygon-面)
     * @param {Object} opts 样式属性 所有参数属性详见--https://github.com/maptalks/maptalks.js/wiki/Symbol-Reference
     * @param {Object} data 数据
     */
    createSymbol(type, opts) {
        let symbol = null;
        switch (type) {
            case 'point':
                symbol = {
                    textName: '',
                    textFaceName: "microsoft yahei,arial,sans-serif",
                    textSize: 14,
                    textWeight: 'normal',
                    textOpacity: 1,
                    textDx: 0,
                    textDy: 0,
                    markerFile: this.commomApi.getCommonImg('marker'),
                    // markerWidth: 26,
                    // markerHeight: 33,
                    markerOpacity: 1,
                    markerDx: 0,
                    markerDy: 0
                };
                break;
            case 'line':
                symbol = {
                    lineColor: '#5298f8',
                    lineWidth: 2,
                    lineOpacity: 1
                }
                break;
            case 'polygon':
                symbol = {
                    lineColor: '#5298f8',
                    lineWidth: 2,
                    lineOpacity: 1,
                    polygonFill: '#5298f8',
                    polygonOpacity: 0.5
                }
                break;
        }
        symbol = Object.assign(symbol, opts);
        return symbol;
    }

    /**
     *  根据要素属性查找要素
     * @param layer 被查找的 图层
     * @param name 被查找的属性名
     * @param value 被查找的属性值
     * @return 匹配的单个要素
     */
    findGraphicByAttr(layer, name, value) {
        //图层为空则放弃查找
        if (!layer)
            return null;
        //构建返回值
        var graphic = null;
        let graphics = layer.filter(x => x.getProperties()[name] === value);
        if (graphics.length > 0)
            graphic = graphics[0];
        return graphic;
    }

    /**
     * 根据要素属性查找匹配到的要素集合
     * @param layer 被查找的 图层
     * @param name 被查找的属性名
     * @param value 被查找的属性值
     * @return 匹配的要素数组
     */
    findGraphicsByAttr(layer, name, value) {
        //图层为空则放弃查找
        if (!layer)
            return null;
        //构建返回值
        let graphics = [];
        graphics = layer.filter(x => x.getProperties()[name] === value);
        return graphics;
    }

    /**
     *  根据要素属性查找要素
     * @param map 地图
     * @param layerId 图层ID
     * @param name 匹配名称
     * @param value 匹配值
     * @return  返回匹配的要素，未找到，为null
     */
    findGraphicByAttrLayerId(map, layerId, name, value) {
        return this.findGraphicByAttr(map.getLayer(layerId), name, value);
    }

    /**
     * 高亮要素 
     * @param target 要高亮的要素(marker line polygon)
     * @param shadowColor 高亮颜色
     * @return 
     */
    highEffect(target, shadowColor) {
        if (!this.glowTarget) this.glowTarget = target;
        else if (this.glowTarget == target) {
            this.clearGlowEffect();
            this.glowTarget = null;
            return;
        } else
            this.glowTarget = target;
        let status = true,
            shadowSize = 0;
        this.clearGlowEffect();
        let inter = setInterval(() => {
            if (!Map) {
                clearInterval(inter);
                return;
            }
            status == true ? shadowSize++ : shadowSize--;
            if (shadowSize > 20) status = false;
            if (shadowSize == 1) status = true;
            target.updateSymbol({
                shadowBlur: shadowSize,
                shadowColor: shadowColor,
                // shadowOffsetX: 5,
                // shadowOffsetY: 7
            })
            let data = {
                marker: target,
                inter: inter
            }
            this.glowInter.push(data);
        }, 50)
    }

    /**
     * 清除发光闪烁效果
     */
    clearGlowEffect() {
        if (this.glowInter.length > 0) {
            this.glowInter.forEach(item => {
                item.marker.updateSymbol({
                    shadowBlur: 0
                })
                clearInterval(item.inter);
            })
        }
    }

    /**
     * 在指定图层里查找要素并高亮显示 
     * @param map 地图对象
     * @param layerId 图层ID
     * @param name  匹配名称
     * @param value 匹配值
     * @return 
     * 
     */
    highEffectByLayer(map, layerId, name, value) {
        var g = this.findGraphicByAttrLayerId(map, layerId, name, value);
        this.highEffect(g);
    }

    /**
     * 在地图里全部的要素图层查找该graphic 
     * @param map 地图对象
     * @param name 匹配名称
     * @param value 匹配值
     * @return true 找到，false 未找到
     * 
     */
    highEffectInMap(map, name, value) {
        map.getLayers().forEach(layer => {
            var g = this.findGraphicByAttrLayerId(map, layer.getId(), name, value);
            // if (!g) continue;
            //找到要素后高亮它
            this.highEffect(g);
            return true;
        })
    }
}
export default GraphicManager;