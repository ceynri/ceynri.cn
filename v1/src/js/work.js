'use strict';

if (MediaMatcher.isPC) {
    /*
     * work基类
     * 实现鼠标交互动画功能
     */
    class Work {
        constructor(work) {
            this.initElem(work);
            this.initConst();
            this.initProp();
            this.initPerspective();
        }
        initConst() {
            this.ANGLE = 30;
            this.ROTATE_SPEED = 0.2;
            this.LAYERED_SPEED = 0.4;
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
            this.title = this.panel.querySelector('.work-title');
            this.seeMore = this.panel.querySelector('.see-more');
        }

        initPerspective() {
            const cardZoomOutTween = TweenLite.to(this.card, this.LAYERED_SPEED, {
                z: -80,
                paused: true
            });
            const textZoomInTween = TweenLite.to(this.title, this.LAYERED_SPEED, {
                z: 20,
                paused: true
            });
            const seeMoreShowTween = TweenLite.to(this.seeMore, this.LAYERED_SPEED, {
                opacity: 1,
                ease: Strong.easeOut,
                paused: true
            });
            
            this.work.addEventListener('mouseenter', () => {
                cardZoomOutTween.play();
                textZoomInTween.play();
                seeMoreShowTween.play();
            });
            this.work.addEventListener('mousemove', e => {
                // 取得光标与work中心的相对坐标
                this.mouseX = e.offsetX - this.workWidth / 2;
                this.mouseY = e.offsetY - this.workHeight / 2;
                // 应用动画：光标离中心越远，旋转角度越大
                TweenLite.to(this.panel, this.ROTATE_SPEED, {
                    rotationX: -this.mouseY / this.workHeight * this.ANGLE,
                    rotationY: this.mouseX / this.workWidth * this.ANGLE,
                    ease: Power0.easeOut,
                });
            }, {
                passive: true
            });
            this.work.addEventListener('mouseleave', () => {
                // 复原旋转角度
                TweenLite.to(this.panel, this.ROTATE_SPEED, {
                    rotationX: 0,
                    rotationY: 0,
                    ease: Power0.easeIn
                });
                cardZoomOutTween.reverse();
                textZoomInTween.reverse();
                seeMoreShowTween.reverse();
            });
        }
    }

    class Note extends Work {
        constructor(work) {
            super(work);
            this.addElem();
            this.initParallax();
        }
        addElem() {
            this.bangage = this.card.querySelector('.bangage');
            this.bookmark = this.card.querySelector('.bookmark');
        }
        initParallax() {
            const bangageZoomInTween = TweenLite.to(this.bangage, this.LAYERED_SPEED, {
                z: 30,
                paused: true
            });
            const bookmarkZoomInTween = TweenLite.to(this.bookmark, this.LAYERED_SPEED, {
                z: -20,
                paused: true
            });
            this.work.addEventListener('mouseenter', () => {
                bangageZoomInTween.play();
                bookmarkZoomInTween.play();
            });
            this.work.addEventListener('mouseleave', () => {
                bangageZoomInTween.reverse();
                bookmarkZoomInTween.reverse();
            });
        }
    }

    class DemoCollection extends Work {
        constructor(work) {
            super(work);
            this.addElem();
            this.initParallax();
            this.initCursorAttachment();
        }
        addElem() {
            this.man = this.card.querySelector('.man-wrapper');
            this.speedLines = this.card.querySelector('.speed-lines');
            this.cursors = document.querySelector('.cursors');
        }
        initParallax() {
            const manZoomInTween = TweenLite.to(this.man, this.LAYERED_SPEED, {
                z: 80,
                paused: true
            });

            const speedLinesZoomInTween = TweenLite.to(this.speedLines, this.LAYERED_SPEED, {
                z: 100,
                paused: true
            })

            this.work.addEventListener('mouseenter', () => {
                manZoomInTween.play();
                speedLinesZoomInTween.play();
            });
            this.work.addEventListener('mouseleave', () => {
                manZoomInTween.reverse();
                speedLinesZoomInTween.reverse();
            });
        }
        // * 贴片元素吸附到光标上的交互效果
        initCursorAttachment() {
            const cursorsFadedTween = TweenLite.to(this.cursors, this.ROTATE_SPEED, {
                opacity: 0,
                paused: true
            });
            this.work.addEventListener('mouseenter', () => {
                cursorsFadedTween.play();
            });
            this.work.addEventListener('mousemove', () => {
                TweenLite.to(this.man, this.ROTATE_SPEED, {
                    x: this.mouseX,
                    y: this.mouseY,
                    ease: Power0.easeOut,
                });
            }, {
                passive: true
            });
            this.work.addEventListener('mouseleave', () => {
                cursorsFadedTween.reverse();
                TweenLite.to(this.man, this.ROTATE_SPEED, {
                    x: 0,
                    y: 0,
                    ease: Power0.easeOut
                });
            });
        }
    }

    new Note(document.querySelector('.work.case-note'));
    new DemoCollection(document.querySelector('.work.case-demo-collection'));
    new Work(document.querySelector('.work.case-more'));
}
