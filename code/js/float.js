if (!MediaMatcher.isTouchScreenDevice()) {
    class Float {
        constructor() {
            this.initProp();
            this.initEvent();
        }
        initProp() {
            this.clientWidth = document.documentElement.clientWidth;
            this.clientHeight = document.documentElement.clientHeight;
            this.SPEED = 1;
        }
        initEvent() {
            window.addEventListener('resize', () => {
                this.clientWidth = document.documentElement.clientWidth;
                this.clientHeight = document.documentElement.clientHeight;
            }, {
                passive: true
            })
        }
        addFloat(elems, level) {
            if (!Array.isArray(elems)) {
                this.float(elems, level);
            } else {
                elems.forEach(elem => {
                    this.float(elem, level);
                });
            }
            return this;
        }
        float(elem, level) {
            const floatTween = e => {
                TweenLite.to(elem, this.SPEED, {
                    x: (this.clientWidth / 2 - e.clientX) * level * 0.01,
                    y: (this.clientHeight / 2 - e.clientY) * level * 0.01,
                    ease: Power3.easeOut
                });
            }
            window.addEventListener('mousemove', floatTween, {
                passive: true
            });
        }
    }

    const background = document.querySelector('.body-background');
    const hero = document.querySelector('.hero');
    const engTitle = hero.querySelector('.title h2');
    const lines = CeynriUtils.nodeListToArray(document.querySelectorAll('.decoration-line'));

    const float = new Float();
    float.addFloat(background, 1)
        .addFloat(hero, 2)
        .addFloat(engTitle, .5)
        .addFloat(lines, 6);
}
