const TOP = 0;
const CENTER = 1;
const BOTTOM = 2;

class ParallaxScroll {
    constructor() {
        this.items = [];
    }
    addParallax(elem, parallaxRate, positionRatio) {
        // 检查输入是否有值，避免误操作
        if (elem && parallaxRate) {
            if (!Array.isArray(elem)) {
                this.items.push({
                    elem,
                    parallaxRate,
                    positionRatio
                }); // key和value名称相同的情况下可以简写为一个
            } else {
                elem.forEach(elem => {
                    this.items.push({
                        elem,
                        parallaxRate,
                        positionRatio
                    });
                });
            }
        }
        return this;
    }

    renderScrollParallax() {
        // * 渲染滚动页面
        const frame = () => {
            this.items.forEach((item) => {
                // 使item滚动
                TweenLite.set(item.elem, {
                    y: this.getScroll(item.elem, item.positionRatio) * (item.parallaxRate - 1),
                });
            });
            // 循环下去
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
    getPageScroll() {
        return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    }
    getScroll(elem, rate) {
        return elem.getBoundingClientRect().top - rate * (document.documentElement.clientHeight / 2);
    }
}

const aboutHeader = document.querySelector('.about-header');
const aboutText = document.querySelector('.about-text');

const lines = [];
lines.push(document.querySelector('.hero .title h1 span:nth-child(1) *:last-child'));
lines.push(document.querySelector('.hero .title h1 span:nth-child(2) *:last-child'));
lines.push(document.querySelector('.hero .title h2 *:last-child'));
lines.push(document.querySelector('.date-line'));

const parallax = new ParallaxScroll();
parallax.addParallax(aboutHeader, 1.2, BOTTOM)
    .addParallax(aboutText, .5, BOTTOM)
    .addParallax(lines, 1.2, CENTER);
parallax.renderScrollParallax();
