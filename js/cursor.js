{
    const MOVE_SPEED = 0.15;
    const ANIMATION_SPPED = 0.3;
    class Cursor {
        // * 光标类

        constructor() {
            this.initCursor();
            this.initHovers();
        }

        initCursor() {
            // * 光标初始化

            // ?
            // const {
            // Back
            // } = window;
            // 光标元素
            this.innerCursor = document.querySelector('.cursor-inner');
            this.outerCursor = document.querySelector('.cursor-outer');
            // 光标盒
            this.innerCursorBox = this.innerCursor.getBoundingClientRect();
            this.outerCursorBox = this.outerCursor.getBoundingClientRect();
            // 光标相关属性
            this.outerCursorSpeed = 0;
            // this.easing = Back.easeOut.config(1.7); // ?
            // 一开始先将光标置于屏幕外
            this.clientX = -100;
            this.clientY = -100;
            this.showCursor = false;

            // 自定义光标还没有显示时，监听鼠标第一次的移动，设置自定义光标到光标坐标处
            const unveilCursor = () => {
                TweenLite.set(this.innerCursor, {
                    x: this.clientX - this.innerCursorBox.width / 2,
                    y: this.clientY - this.innerCursorBox.height / 2
                });
                TweenLite.set(this.outerCursor, {
                    x: this.clientX - this.outerCursorBox.width / 2,
                    y: this.clientY - this.outerCursorBox.height / 2
                });
                setTimeout(() => {
                    this.outerCursorSpeed = MOVE_SPEED;
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
                    x: this.clientX - this.innerCursorBox.width / 2,
                    y: this.clientY - this.innerCursorBox.height / 2
                });

                if (!this.isStuck) {
                    // 内部光标平滑延迟移动
                    TweenLite.to(this.outerCursor, this.outerCursorSpeed, {
                        x: this.clientX - this.outerCursorBox.width / 2,
                        y: this.clientY - this.outerCursorBox.height / 2
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

            const handleMouseEnter = e => {
                this.isStuck = true;
                const target = e.currentTarget;
                const box = target.getBoundingClientRect();
                this.outerCursorOriginals = {
                    width: this.outerCursorBox.width,
                    height: this.outerCursorBox.height
                };
                TweenLite.to(this.outerCursor, 0.2, {
                    x: box.left,
                    y: box.top,
                    width: box.width,
                    height: box.height,
                    opacity: 1,
                    // borderColor: "#ff0000"
                });
            };

            const handleMouseLeave = () => {
                this.isStuck = false;
                TweenLite.to(this.outerCursor, 0.2, {
                    width: this.outerCursorOriginals.width,
                    height: this.outerCursorOriginals.height,
                    opacity: 0.2,
                    // borderColor: "#ffffff"
                });
            };

            // TODO .icon-link
            const linkItems = document.querySelectorAll(".icon-btn");
            linkItems.forEach(item => {
                item.addEventListener("mouseenter", handleMouseEnter);
                item.addEventListener("mouseleave", handleMouseLeave);
            });

            // btn

            const btnHoverTween = TweenLite.to(this.outerCursor, ANIMATION_SPPED, {
                backgroundColor: "#ffffff",
                opacity: 0.2,
                paused: true
            });

            const btnMouseEnter = () => {
                this.outerCursorSpeed = 0;
                TweenLite.to(this.innerCursor, ANIMATION_SPPED, {
                    opacity: 0
                });
                btnHoverTween.play();
            };

            const btnMouseLeave = () => {
                this.outerCursorSpeed = MOVE_SPEED;
                TweenLite.to(this.innerCursor, ANIMATION_SPPED, {
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
