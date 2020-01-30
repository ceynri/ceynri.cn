class Cursor {
    // * 光标类

    constructor() {
        this.initConst();
        this.initElem();
        this.initProp();
        this.initCursor();
        this.initHovers();
    }

    initConst() {
        this.MOVE_SPEED = 0.15;
        this.ANIMATION_SPEED = 0.3;
    }
    initElem() {
        // 光标内部元素
        this.innerCursorBox = document.querySelector('.cursor-inner-box');
        this.pointedInnerCursor = this.innerCursorBox.querySelector('.point');
        this.zoomInInnerCursor = this.innerCursorBox.querySelector('.zoom-in');
        // 光标外部元素
        this.outerCursorBox = document.querySelector('.cursor-outer-box');
        this.normalOuterCursor = this.outerCursorBox.querySelector('.normal');
    }
    initProp() {
        // 内部光标大小
        this.innerCursorBox.size = this.innerCursorBox.getBoundingClientRect().width;
        this.pointedInnerCursor.size = this.pointedInnerCursor.getBoundingClientRect().width;
        this.zoomInInnerCursor.size = this.zoomInInnerCursor.getBoundingClientRect().width;
        // 外部光标大小
        this.outerCursorBox.size = this.outerCursorBox.getBoundingClientRect().width;
        this.normalOuterCursor.size = this.normalOuterCursor.getBoundingClientRect().width;

        // 光标默认颜色
        const root = document.querySelector('html');
        this.cursorColor = getComputedStyle(root).getPropertyValue('--cursorColor') || '#fff';
        // 外部光标默认透明度
        this.outerCursorOpacity = getComputedStyle(this.outerCursorBox).getPropertyValue('opacity');

        // 外部光标相关属性
        this.outerCursorSpeed = 0;

        // 一开始先将光标置于屏幕外
        this.clientX = -200;
        this.clientY = -200;
        this.showCursor = false;
    }

    initCursor() {
        // * 光标初始化
        // 需要缩小为0的光标
        TweenLite.set(this.zoomInInnerCursor, {
            scale: 0
        });

        // 初始化鼠标位置
        this.initCursorPos();
        // 开始渲染
        this.render();
    }
    initCursorPos() {
        // 监听鼠标移动
        document.addEventListener("mousemove", e => {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
        });
    }
    render() {
        // 自定义光标还没有显示时，监听鼠标第一次的移动，设置自定义光标到光标坐标处
        const unveilCursor = () => {
            TweenLite.set(this.outerCursorBox, {
                x: this.clientX - this.outerCursorBox.size / 2,
                y: this.clientY - this.outerCursorBox.size / 2
            });
            this.outerCursorSpeed = this.MOVE_SPEED;
            this.showCursor = true;
        };
        document.addEventListener("mousemove", unveilCursor);

        const frame = () => {
            // 内部光标实时改变
            TweenLite.set(this.innerCursorBox, {
                x: this.clientX - this.innerCursorBox.size / 2,
                y: this.clientY - this.innerCursorBox.size / 2
            });

            if (!this.isStuck) {
                // 内部光标平滑延迟移动
                TweenLite.to(this.outerCursorBox, this.outerCursorSpeed, {
                    x: this.clientX - this.outerCursorBox.size / 2,
                    y: this.clientY - this.outerCursorBox.size / 2,
                    ease: Quart.ease
                });
            }
            if (this.showCursor) {
                // 光标已经显示，不再需要unveilCursor监听
                document.removeEventListener("mousemove", unveilCursor);
            }
            // 循环调用以不断循环下去
            requestAnimationFrame(frame);
        };
        // 为了高性能所以使用单独的frame函数调用requestAnimationFrame函数来提高性能
        requestAnimationFrame(frame);
    }

    initHovers() {
        // * 链接元素的hover效果初始化

        // icon-btn
        this.addIconBtnAnimation();

        // icon-link
        this.addIconLinkAnimation();

        // link
        // this.addLinkAnimation();
    }
    addIconBtnAnimation() {

        // enter
        const iconBtnMouseEnter = () => {
            TweenLite.to(this.pointedInnerCursor, this.ANIMATION_SPEED, {
                scale: 3,
                opacity: 0.25,
                ease: Back.easeOut.config(1.5)
            });
        }
        // hover
        const iconBtnMouseOver = e => {
            // 鼠标外盒不再随鼠标移动改变坐标
            this.isStuck = true;
            // 获得当前对象的盒子
            const target = e.currentTarget;
            const box = target.getBoundingClientRect();
            const offset = (box.width - this.outerCursorBox.size) / 2;
            TweenLite.to(this.outerCursorBox, this.ANIMATION_SPEED, {
                x: box.left + offset,
                y: box.top + offset,
                ease: Back.easeOut.config(1.5),
                opacity: 1,
            });
            TweenLite.to(this.normalOuterCursor, this.ANIMATION_SPEED, {
                width: box.width,
                height: box.height,
                ease: Back.easeOut.config(1.5),
            });
        };
        // leave
        const iconBtnMouseLeave = () => {
            this.isStuck = false;
            TweenLite.to(this.outerCursorBox, this.ANIMATION_SPEED, {
                opacity: this.outerCursorOpacity,
            });
            TweenLite.to(this.normalOuterCursor, this.ANIMATION_SPEED, {
                width: this.normalOuterCursor.size,
                height: this.normalOuterCursor.size,
                ease: Back.easeOut.config(1.5),
            });
            TweenLite.to(this.pointedInnerCursor, this.ANIMATION_SPEED, {
                scale: 1,
                opacity: 1,
                ease: Back.easeOut.config(1.5)
            })
        };

        const iconBtns = document.querySelectorAll(".icon-btn");
        iconBtns.forEach(item => {
            item.addEventListener("mouseenter", iconBtnMouseEnter);
            item.addEventListener("mouseover", iconBtnMouseOver);
            item.addEventListener("mouseleave", iconBtnMouseLeave);
        });
    }
    addIconLinkAnimation() {
        // const pointedInnerCursorShrinkTween = TweenLite.to(this.pointedInnerCursor, this.ANIMATION_SPEED, {
        //     scale: 0,
        //     ease: Elastic.easeInOut.config(2),
        //     paused: true
        // });
        const zoomInInnerCursorShowTween = TweenLite.to(this.zoomInInnerCursor, this.ANIMATION_SPEED, {
            scale: 1,
            paused: true
        });
        const zoomInInnerCursorRotateTween = TweenLite.to(this.zoomInInnerCursor, this.ANIMATION_SPEED, {
            rotation: 45,
            paused: true
        });

        const iconLinkMouseEnter = () => {
            zoomInInnerCursorShowTween.play();
            setTimeout(() => {
                zoomInInnerCursorRotateTween.play();
            }, 1000 * this.ANIMATION_SPEED / 2);
        }

        const iconLinkMouseLeave = () => {
            zoomInInnerCursorShowTween.reverse();
            zoomInInnerCursorRotateTween.reverse();
        }

        const iconLink = document.querySelectorAll(".icon-link");
        iconLink.forEach(item => {
            item.addEventListener("mouseenter", iconLinkMouseEnter);
            item.addEventListener("mouseleave", iconLinkMouseLeave);
        });
    }
    addLinkAnimation() {
        // const iconLinkHoverTween = TweenLite.to(this.outerCursor, 0.3, {
        //     backgroundColor: "#ffffff",
        //     opacity: 0.2,
        //     paused: true
        // });

        // const iconLinkMouseEnter = () => {
        //     this.outerCursorSpeed = 0;
        //     TweenLite.to(this.innerCursor, 0.3, {
        //         opacity: 0
        //     });
        //     iconLinkHoverTween.play();
        // };

        // const iconLinkMouseLeave = () => {
        //     this.outerCursorSpeed = this.MOVE_SPEED;
        //     TweenLite.to(this.innerCursor, 0.3, {
        //         opacity: 1
        //     });
        //     iconLinkHoverTween.reverse();
        // };

        // const iconLink = document.querySelectorAll(".iconLink");
        // iconLink.forEach(item => {
        //     item.addEventListener("mouseenter", iconLinkMouseEnter);
        //     item.addEventListener("mouseleave", iconLinkMouseLeave);
        // });
    }
}
// Debug用
const _cursor = new Cursor();
