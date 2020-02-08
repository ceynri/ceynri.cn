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
    isMobileDevice: () => {
        const landscapeLimit = window.matchMedia("screen and (max-device-width: 1366px) and (orientation: landscape)").matches;
        const portraitLimit = window.matchMedia("screen and (max-device-width: 1024px) and (orientation: portrait)").matches;
        return landscapeLimit || portraitLimit;
    },
}
