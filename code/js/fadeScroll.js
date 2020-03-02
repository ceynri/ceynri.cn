{
    class FadeScroll {
        constructor() {
            this.items = [];
            this.clientHeight = document.documentElement.clientHeight;
            window.addEventListener('resize', () => {
                this.clientHeight = document.documentElement.clientHeight;
            }, {
                passive: true
            });
        }
        addElems(elems, lowerbound, upperbound, fadeBound) {
            try {
                elems.forEach(elem => this.items.push({
                    elem,
                    lowerbound: 1 - lowerbound * .01,
                    upperbound: upperbound * .01,
                    fadeBound: fadeBound * .01
                }));
            } catch (ex) {
                console.error(ex);
            }
        }
        render() {
            const frame = () => {
                this.items.forEach(item => {
                    const elemY = this.getElemClientCenterY(item.elem);
                    const lowerDist = this.clientHeight * item.lowerbound - elemY;
                    const upperDist = elemY - this.clientHeight * item.upperbound;
                    let opacityVal = Math.min(lowerDist, upperDist) / (this.clientHeight * item.fadeBound);
                    opacityVal = Math.min(1, Math.max(0, opacityVal));
                    TweenLite.to(item.elem, 1, {
                        opacity: opacityVal,
                        ease: Power4.easeOut
                    });
                });
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        }
        getPageScrollTop() {
            // * 获得当前的页面滚动高度
            return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        }
        getElemClientCenterY(elem) {
            const box = elem.getBoundingClientRect();
            return box.top + box.height / 2;
        }
    }

    const aboutTexts = CeynriUtils.nodeListToArray(document.querySelectorAll('.about-text div'));

    const fadeScroll = new FadeScroll();
    fadeScroll.addElems(aboutTexts, 15, 15, 30);
    fadeScroll.render();
}
