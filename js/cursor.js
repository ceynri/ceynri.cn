{
    class Cursor {
        // * 光标类

        constructor() {
            this.initConst();
            this.initCursor();
            this.initHovers();
            this.initProp();
        }
        initConst() {
            this.MOVE_SPEED = 0.15;
            this.ANIMATION_SPEED = 0.3;
        }
        initProp() {
            this.cursorColor = '#fff';
            const root = document.querySelector('html');
            this.cursorColor = getComputedStyle(root).getPropertyValue('--cursorColor');
            this.outerCursorOpacity = getComputedStyle(this.outerCursor).getPropertyValue('opacity');
        }
        initCursor() {
            // * 光标初始化
            // ? const {Back} = window;
            // 光标元素
            this.innerCursor = document.querySelector('.cursor-inner');
            this.outerCursor = document.querySelector('.cursor-outer');
            // 光标盒
            this.innerCursorSize = this.innerCursor.getBoundingClientRect().width;
            this.outerCursorSize = this.outerCursor.getBoundingClientRect().width;
            // 光标相关属性
            this.outerCursorSpeed = 0;
            // ? this.easing = Back.easeOut.config(1.7);
            // 一开始先将光标置于屏幕外
            this.clientX = -100;
            this.clientY = -100;
            this.showCursor = false;

            // 自定义光标还没有显示时，监听鼠标第一次的移动，设置自定义光标到光标坐标处
            const unveilCursor = () => {
                TweenLite.set(this.innerCursor, {
                    x: this.clientX - this.innerCursorSize / 2,
                    y: this.clientY - this.innerCursorSize / 2
                });
                TweenLite.set(this.outerCursor, {
                    x: this.clientX - this.outerCursorSize / 2,
                    y: this.clientY - this.outerCursorSize / 2
                });
                setTimeout(() => {
                    this.outerCursorSpeed = this.MOVE_SPEED;
                }, 100);
                this.showCursor = true;
            };
            document.addEventListener("mousemove", unveilCursor);

            // 监听鼠标移动
            document.addEventListener("mousemove", e => {
                this.clientX = e.clientX;
                this.clientY = e.clientY;
            });

            const render = () => {
                // 内部光标实时改变
                TweenLite.set(this.innerCursor, {
                    x: this.clientX - this.innerCursorSize / 2,
                    y: this.clientY - this.innerCursorSize / 2
                });

                if (!this.isStuck) {
                    // 内部光标平滑延迟移动
                    TweenLite.to(this.outerCursor, this.outerCursorSpeed, {
                        x: this.clientX - this.outerCursorSize / 2,
                        y: this.clientY - this.outerCursorSize / 2
                    });
                }
                if (this.showCursor) {
                    // 光标已经显示，不再需要unveilCursor监听
                    document.removeEventListener("mousemove", unveilCursor);
                }
                // 循环调用以不断循环下去
                requestAnimationFrame(render);
            };
            // 为了高性能所以使用单独的render函数调用requestAnimationFrame函数来提高性能
            requestAnimationFrame(render);
        }

        initHovers() {
            // * 链接元素的hover效果初始化

            // icon-btn

            const iconMouseOver = e => {
                // 不再随鼠标移动改变坐标
                this.isStuck = true;
                // 获得当前对象的盒子
                const target = e.currentTarget;
                const box = target.getBoundingClientRect();
                TweenLite.to(this.outerCursor, this.MOVE_SPEED, {
                    x: box.left,
                    y: box.top,
                    width: box.width,
                    height: box.height,
                    opacity: 1,
                });
            };

            const iconMouseLeave = () => {
                this.isStuck = false;
                TweenLite.to(this.outerCursor, this.MOVE_SPEED, {
                    width: this.outerCursorSize,
                    height: this.outerCursorSize,
                    opacity: this.outerCursorOpacity,
                });
            };

            // TODO .icon-link
            const linkItems = document.querySelectorAll(".icon-btn");
            linkItems.forEach(item => {
                item.addEventListener("mouseover", iconMouseOver);
                item.addEventListener("mouseleave", iconMouseLeave);
            });

            // btn

            const btnHoverTween = TweenLite.to(this.outerCursor, this.ANIMATION_SPEED, {
                backgroundColor: "#ffffff",
                opacity: 0.2,
                paused: true
            });

            const btnMouseEnter = () => {
                this.outerCursorSpeed = 0;
                TweenLite.to(this.innerCursor, this.ANIMATION_SPEED, {
                    opacity: 0
                });
                btnHoverTween.play();
            };

            const btnMouseLeave = () => {
                this.outerCursorSpeed = this.MOVE_SPEED;
                TweenLite.to(this.innerCursor, this.ANIMATION_SPEED, {
                    opacity: 1
                });
                btnHoverTween.reverse();
            };

            const btn = document.querySelectorAll(".btn");
            btn.forEach(item => {
                item.addEventListener("mouseenter", btnMouseEnter);
                item.addEventListener("mouseleave", btnMouseLeave);
            });
        }
    }
    new Cursor();
}
