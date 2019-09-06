import * as maptalks from "maptalks"
/**
 * 图层创建、清除、移除等
 */
class LayerManager {
    constructor() {}
    /**
     * 根据图层ID查找图层 不存在则创建
     * @param {object} map 地图对象
     * @param {string} layerid  图层ID
     * @return 图层对象
     */
    getLayerByID(map, layerid) {
        //地图未初始化则放弃查找
        if (!map) {
            console.log('layerManager--The map is necessary')
            return null;
        }
        if (!layerid) {
            console.log('layerManager--The map is necessary')
            return null;
        }
        //查找图层，不存在则创建
        let layer = map.getLayer(layerid);
        if (!layer) {
            layer = new maptalks.VectorLayer(layerid, {
                enableAltitude: true,
                forceRenderOnZooming: true
            });
            map.addLayer(layer);
        }
        return layer;
    }

    /**
     *  根据图层ID查找图层 不存在则创建，存在则清空图层
     * @param map 地图对象
     * @param layerid 图层ID
     * @return 图层
     */
    getEmptyLayerByID(map, layerid) {
        //地图未初始化则放弃查找
        if (!map) {
            console.log('layerManager--The map is necessary')
            return null;
        }
        if (!layerid) {
            console.log('layerManager--The layerid is necessary')
            return null;
        }
        //查找图层，不存在则创建
        var layer = map.getLayer(layerid);
        if (!layer) {
            layer = new maptalks.VectorLayer(layerid, {
                enableAltitude: true,
                forceRenderOnZooming: true
            });
            map.addLayer(layer);
        } else {
            //找到图层 则清空
            layer.clear();
        }
        return layer;
    }

    /**
     * 创建图层 图层随机命名
     * @param map 地图对象
     * @return 图层对象
     */
    getRandomLayer(map) {
        if (!map) {
            console.log('layerManager--The map is necessary')
            return null;
        }
        var num = Math.random();
        return this.getLayerByID(map, "RandomLayer" + num.toString());
    }

    /**
     * 缩放到图层适应层级
     * @param {string} layerid 图层id
     */
    layerToExtent(map,layerid) {
        if (!layerid) {
            console.log('layerManager--The layerid is necessary')
            return null;
        }
        let layer = map.getLayer(layerid);
        if (!layer) return;
        if (layer.getGeometries().length == 0) return;
        let Extent = layer.getExtent();
        let coord = Extent.getCenter();
        let zoom = map.getFitZoom(Extent);
        map.animateTo({
            center: coord,
            zoom: zoom
        }, {
            duration: 1000
        });
    }

    /**
     * 清除图层
     * @param {object} map 地图
     * @param {string} layerid 图层id
     */
    clearLayerById(map, layerid) {
        if (!map) return;
        if (map.getLayer(layerid))
            map.getLayer(layerid).clear();
    }

    /**
     * 移除图层
     * @param {object} map 地图
     * @param {string} layerid 图层id
     */
    removeLayerById(map, layerid) {
        if (!map) return;
        if (map.getLayer(layerid))
            map.removeLayer(map.getLayer(layerid));
    }

    /**
     * 图层置顶
     * @param map
     * @param layerId
     */
    reorderLayer(map, layerId) {
        let layer = this.getLayerByID(map, layerId);
        layer.setZIndex(map.getLayers.length);
    }

    /**
     * 移除所有图层 
     * @param map
     */
    removeAllGraphicsLayer(map) {
        map.getLayers.forEach(layer => {
            map.removeLayer(layer)
        });
    }

    /**
     * 清空所有图层 
     * @param map
     */
    clearAllGraphicsLayer(map) {
        map.getLayers.forEach(layer => {
            layer.clear()
        });
    }
}
export default LayerManager;