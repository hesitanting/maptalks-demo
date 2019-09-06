import * as maptalks from "maptalks"
class queryTask {
    constructor() {}

    queryDataByApi(url, callfun) {
        maptalks.Ajax.getJSON(url, {
            'jsonp': true
        }, (obj, data) => {
            callfun(data)
        })
    }
}
export default queryTask;