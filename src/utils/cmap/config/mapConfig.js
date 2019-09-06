export default {
    bd_poiSearchUrl: `http://api.map.baidu.com/place/v2/search?ak=LHbvxjEMkESd4QsxuBG5eO8sWqrpLWf0&output=json&scope=2&region=全国&query=`,
    amap_poiSearchUrl: `https://restapi.amap.com/v3/place/text?key=971f0581c3096160235921a171e1690f&children=1&offset=20&page=1&extensions=all&keywords=`,
    /**
     * 路径webapi
     */
    amap_routeUrl: `https://restapi.amap.com/v3/direction/walking?key=971f0581c3096160235921a171e1690f&`,
    /**
     * 逆地理编码webapi(根据坐标查询地址)
     */
    amap_queryByLocate: `https://restapi.amap.com/v3/geocode/regeo?key=971f0581c3096160235921a171e1690f&poitype=&radius=&extensions=all&batch=false&location=`
}