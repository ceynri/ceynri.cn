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
    }
}

const MediaMatcher = {
    isTouchScreenDevice: () => {
        const portraitLimit = window.matchMedia("screen and (max-device-width: 1024px) and (orientation: portrait)").matches;
        const landscapeLimit = window.matchMedia("screen and (max-device-width: 1366px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
    isTabletDevice: () => {
        const portraitLimit = window.matchMedia("screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait)").matches;
        const landscapeLimit = window.matchMedia("screen and (min-device-width: 1024px) and (max-device-width: 1366px) and (orientation: landscape)").matches;
        return portraitLimit || landscapeLimit;
    },
}
