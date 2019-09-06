/**
 * 坐标转换(84转百度,百度转84,84转墨卡托/墨卡托转84等等)
 */
class coordinateConvert {
  PI = Math.PI
  x_pi = Math.PI * 3000.0 / 180.0
  constructor() {}

  /**
   * wgs84转百度
   * @param {number} wgsLon longtitude
   * @param {number} wgsLat latitude
   */
  WGS84_BD(wgsLon, wgsLat) {
    let c = this.wgs84_gcj02(wgsLon, wgsLat);
    return this.gcj02_bd09ll(c[0], c[1]);
  }

  /**
   * 百度转wgs84
   * @param {number} bdLon longtitude
   * @param {number} bdsLat latitude
   */
  BD_WGS84(bdLon, bdsLat) {
    let c = this.bd09ll_gcj02(bdLon, bdsLat);
    return this.gcj02_wgs84(c[0], c[1]);
  }
  /**
   * wgs84转墨卡托
   * @param {number} lon longtitude
   * @param {number} lat latitude
   */
  WGS84_Mercator(lon, lat) {
    let mercator = {};
    let x = lon * 20037508.34 / 180;
    let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    mercator.x = x;
    mercator.y = y;
    return mercator;
  }

  /**
   * 墨卡托转wgs84
   * @param {number} lon longtitude
   * @param {number} lat latitude
   */
  Mercator_WGS84(lon, lat) {
    let lonLat = {};
    let x = lon / 20037508.34 * 180;
    let y = lat / 20037508.34 * 180;
    y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
    lonLat.x = x;
    lonLat.y = y;
    return lonLat;
  }

  //WGS-84 to GCJ-02
  wgs84_gcj02(wgsLon, wgsLat) {
    if (this.outOfChina(wgsLat, wgsLon))
      return [wgsLon, wgsLat];
    let d = this.delta(wgsLat, wgsLon);
    return [wgsLon + d.lon, wgsLat + d.lat];
  }
  //GCJ-02 to WGS-84
  gcj02_wgs84(gcjLon, gcjLat) {
    if (this.outOfChina(gcjLat, gcjLon))
      return [gcjLon, gcjLat];

    let d = this.delta(gcjLat, gcjLon);
    return [gcjLon - d.lon, gcjLat - d.lat];
  }
  //GCJ-02 to BD-09
  gcj02_bd09ll(gcjLon, gcjLat) {
    let x = gcjLon,
      y = gcjLat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
    let bdLon = z * Math.cos(theta) + 0.0065;
    let bdLat = z * Math.sin(theta) + 0.006;
    bdLon = bdLon;
    bdLat = bdLat;
    return [bdLon, bdLat];
  }
  //BD-09 to GCJ-02
  bd09ll_gcj02(bdLon, bdLat) {
    let x = bdLon - 0.0065,
      y = bdLat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
    let gcjLon = z * Math.cos(theta);
    let gcjLat = z * Math.sin(theta);
    return [gcjLon, gcjLat];
  }
  delta(lat, lon) {
    // Krasovsky 1940
    //
    // a = 6378245.0, 1/f = 298.3
    // b = a * (1 - f)
    // ee = (a^2 - b^2) / a^2;
    let a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
    let ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
    let dLat = this.transformLat(lon - 105.0, lat - 35.0);
    let dLon = this.transformLon(lon - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * this.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
    return {
      'lat': dLat,
      'lon': dLon
    };
  }
  transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }
  transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
    return ret;
  }
  outOfChina(lat, lon) {
    if (lon < 72.004 || lon > 137.8347)
      return true;
    if (lat < 0.8293 || lat > 55.8271)
      return true;
    return false;
  }
}
export default coordinateConvert;