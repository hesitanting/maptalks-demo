/**
 * 通用方法(获取图片路径-按需修改、随机数、随机颜色等)
 */
class commonFun { 
    constructor() {}

    /**
     * 获取通用图片路径
     * @param {string} name 图片名称
     */
    getCommonImg(name) {
        return require(`../../../../public/image/${name}.png`);
    }
    /**
     * 获取轨迹图片路径
     * @param {string} name 图片名称
     */
    getTrackImg(name) {
        return require(`../../../../public/image/track/${name}.png`);
    }
    /**
     * 获取范围内随机数
     * @param {number} m 最小值
     * @param {number} n 最大值
     */
    getRandomNum(m, n) {
        let num = parseInt(Math.random() * (m - n + 1) + n);
        return num;
    }

    /**
     * 获取rgb类型的颜色
     */
    randomRgbColor() {
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    /**
     * 获取随机十六进制颜色
     */
    randomColor() {
        var str = "#",random = 0;
        var aryNum = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
        for (let i = 0; i < 6; i++) {
            random = parseInt(Math.random() * 16);
            str += aryNum[random];
        }
        return str;
    }
    /**
     * 获取随机十六进制颜色
     */
    RandomColorEasy() {
        return '#' + (function (h) {
            return new Array(7 - h.length).join("0") + h
        })((Math.random() * 0x1000000 << 0).toString(16));
    }

    /**
     * 生成GUID
     * @param {number} len guid长度
     * @param {number} radix 基数(2,10,16)
     */
    GetGuid(len, radix) {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = [],
            i;
        radix = radix || chars.length;
        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            let r;
            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    }
}
export default commonFun;