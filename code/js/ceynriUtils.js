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
    isTouchScreenDevice: () => {
        // < ipad pro 12.9
        const portraitLimit = window.matchMedia("screen and (max-device-width: 1024px) and (orientation: portrait)").matches;
        const landscapeLimit = window.matchMedia("screen and (max-device-width: 1366px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    isTabletDevice: () => {
        // ipad (mini) ~ ipad pro 12.9
        const portraitLimit = window.matchMedia("screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait)").matches;
        // ? ipad在横屏的时候，设备宽度竟然和竖屏时的设备宽度相等？
        const landscapeLimit = window.matchMedia("screen and (min-device-width: 768px) and (max-device-width: 1366px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    isMobileDevice: () => {
        // iphone4 ~ ipad
        const portraitLimit = window.matchMedia("screen and (min-device-width: 320px) and (max-device-width: 767px) and (orientation: portrait)").matches;
        const landscapeLimit = window.matchMedia("screen and (min-device-width: 480px) and (max-device-width: 1023px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    widthMoreThan: width => window.matchMedia(`screen and (min-width: ${width}px)`).matches,
    widthLessThan: width => window.matchMedia(`screen and (max-width: ${width}px)`).matches,
}
