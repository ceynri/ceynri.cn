    class Parallax {
        constructor() {
            this.items = [];
            // this.easing = Power1.easeOut;
            // this.EASE_SPEED = .75;
        }
        addParallax(elem, ratio) {
            // 检查输入是否有值，避免误操作
            if (elem && ratio) {
                this.items.push({
                    elem: elem,
                    ratio: ratio,
                });
            }
            return this;
        }
        renderScrollParallax() {
            // * 渲染滚动页面
            const frame = () => {
                this.items.forEach((item) => {
                    // 使item滚动
                    TweenLite.set(item.elem, {
                        y: this.getScrollTop(item.elem) * (item.ratio - 1),
                        // ease: this.easing
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
        getScrollTop(elem) {
            return elem.getBoundingClientRect().top - document.documentElement.clientHeight;
        }
    }

    const aboutHeader = document.querySelector('.about-header');
    const aboutText = document.querySelector('.about-text');
    const parallax = new Parallax();
    parallax.addParallax(aboutHeader, 1.2)
        .addParallax(aboutText, .5);
    parallax.renderScrollParallax();
