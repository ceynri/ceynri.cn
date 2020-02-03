{
    class Work {
        constructor(work) {
            this.initElem(work);
            this.initConst();
            this.initProp();
            this.addStereoParallax();
        }
        initConst() {
            this.ANGLE = 30;
            this.ANIMATION_SPEED = 0.2;
        }
        initProp() {
            this.workWidth = this.work.clientWidth;
            this.workHeight = this.work.clientHeight;
            // 以work中心点为坐标原点的鼠标坐标值（左手系）
            this.mouseX = 0;
            this.mouseY = 0;
        }
        initElem(work) {
            this.work = work;
            this.panel = this.work.querySelector('.work-panel');
            this.card = this.panel.querySelector('.work-card');
            this.text = this.panel.querySelector('.work-text');
        }

        addStereoParallax() {
            const cardZoomOutTween = TweenLite.to(this.card, this.ANIMATION_SPEED * 2, {
                z: -72,
                paused: true
            });
            const textZoomInTween = TweenLite.to(this.text, this.ANIMATION_SPEED * 2, {
                z: 36,
                paused: true
            });

            this.work.addEventListener('mousemove', e => {
                this.mouseX = e.offsetX - this.workWidth / 2;
                this.mouseY = e.offsetY - this.workHeight / 2;
                TweenLite.to(this.panel, this.ANIMATION_SPEED, {
                    rotationX: -this.mouseY / this.workHeight * this.ANGLE,
                    rotationY: this.mouseX / this.workWidth * this.ANGLE,
                    ease: Power0.easeOut,
                });
                cardZoomOutTween.play();
                textZoomInTween.play();
            });
            this.work.addEventListener('mouseout', () => {
                TweenLite.to(this.panel, this.ANIMATION_SPEED, {
                    rotationX: 0,
                    rotationY: 0,
                    ease: Power0.easeIn
                });
                cardZoomOutTween.reverse();
                textZoomInTween.reverse();
            });
        }
    }

    const works = document.querySelectorAll('.work');
    works.forEach(work => {
        new Work(work);
    });

}
