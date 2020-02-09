const CeynriUtils = {
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
        const landscapeLimit = window.matchMedia("screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    isMobileDevice: () => {
        // iphone4 ~ ipad
        const portraitLimit = window.matchMedia("screen and (min-device-width: 320px) and (max-device-width: 767px) and (orientation: portrait)").matches;
        const landscapeLimit = window.matchMedia("screen and (min-device-width: 480px) and (max-device-width: 1023px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    widthMoreThan: width => {
        return window.matchMedia(`screen and (min-width: ${width}px)`).matches;
    },
    widthLessThan: width => {
        return window.matchMedia(`screen and (max-width: ${width}px)`).matches;
    },
}
