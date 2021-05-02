'use strict';

// 个人的自定义函数工具箱
const CeynriUtils = {
    // 将NodeList转换为装Node的Array
    nodeListToArray: (nodes) => {
        let array = null;
        try {
            array = Array.prototype.slice.call(nodes, 0);
        } catch (ex) {
            array = new Array();
            const len = nodes.length;
            for (let i = 0; i < len; i++) {
                array.push(nodes[i]);
            }
        }
        return array;
    },
    // 将x使用tanh函数归一化到(-scale, scale)区间中
    normallize: (x, scale = 1) => scale * Math.tanh(x / scale),
}

// 简易的媒体查询函数工具箱
const MediaMatcher = {
    widthMoreThan: width => window.matchMedia(`screen and (min-width: ${width}px)`).matches,
    widthLessThan: width => window.matchMedia(`screen and (max-width: ${width}px)`).matches
};

(() => {
    const ua = navigator.userAgent || '';
    // 系统
    const isIPhone = /iPhone|iPod/i.test(ua);
    const isIPad = /iPad/i.test(ua);
    const isIos = isIPhone || isIPad;
    const isAndroid = /Android/i.test(ua);
    const isOtherPhone = /Windows Phone|IEMobile|SymbianOS/i.test(ua);
    // 浏览器
    const isFireFox = /Firefox/i.test(ua);
    const isChrome = /Chrome|CriOS/i.test(ua);
    const isWeChat = /micromessenger/i.test(ua);
    // 设备类型
    const isTablet = isIPad || (isAndroid && !/Mobile/i.test(ua)) || (isFireFox && /Tablet/i.test(ua)) || /PlayBook/i.test(ua);
    const isPhone = (isIPhone || isAndroid || isOtherPhone) && !isTablet;
    const isPC = !(isPhone || isAndroid || isOtherPhone || isTablet);
    
    MediaMatcher.isPC = isPC;
    MediaMatcher.isTablet = isTablet;
    MediaMatcher.isPhone = isPhone;
})();
