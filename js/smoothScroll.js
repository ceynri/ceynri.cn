{
    // * 平滑滚动
    class SmoothScroll {
        constructor() {
            // 一些初始化
            this.init();
            // 设置body高度
            this.setBodySize();
            // 初始化文档滚动高度
            this.setPageScroll();
            // 初始化并绑定事件
            this.initEvents();
            // 开始循环渲染
            this.render();
        }

        init() {
            // * 属性初始化
            // 可滚动元素
            this.page = document.querySelector('div[data-scroll]');
            this.works = document.querySelector('.works');
            // 获得当前的页面滚动高度
            this.getPageScroll = () => {
                return window.pageYOffset || document.documentElement.scrollTop;
            };
            // 获得works的横向滚动距离
            this.getWorksScroll = () => {
                return this.works.getBoundingClientRect().left;
            };
            // 鼠标状态
            // this.mouse = {down: {x: 0,y: 0},up: {x: 0,y: 0}};
            this.mouseDownX = 0;
            // 缓动类型
            this.easing = Power0.easeOut;
            // 缓动速度
            this.EASE_SPEED = .5;
            // 滚动效率（每移动1px相当于移动`SCROLL_RATE`px）
            this.SCROLL_RATE = 2;
        }

        setBodySize() {
            // * 设置主体的高度
            document.body.style.height = `${this.page.scrollHeight}px`;
        }

        setPageScroll() {
            // * 设置初始滚动值（浏览器对滚动高度会有缓存）
            TweenLite.set(this.page, {
                y: -this.getPageScroll()
            });
        }

        initEvents() {
            // 调整大小时重新设置body的高度
            window.addEventListener('resize', () => this.setBodySize());

            // 拖动works的动画 
            const dragWorksAnimation = e => {
                TweenLite.to(this.works, 1, {
                    x: this.dragOffset + e.clientX * this.SCROLL_RATE,
                    ease: Power4.easeOut
                });
            };

            // 监听works上的mousedown事件
            this.works.addEventListener('mousedown', e => {
                this.mouseDownX = e.clientX;
                this.dragOffset = this.getWorksScroll() - this.mouseDownX * this.SCROLL_RATE;
                // 鼠标移动转化为拖拽works的监听
                // 因为拖拽过程中可能会离开works范围，所以将事件绑定在document上
                document.addEventListener('mousemove', dragWorksAnimation);
            });

            // mouseup时删除works拖拽事件监听（如果有的话）
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', dragWorksAnimation);
            });
        }

        render() {
            // * 渲染，更新当前值和目标值
            const frame = () => {
                // 使内容滚动
                this.scrollPage();
                // 循环下去
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        }

        scrollPage() {
            // * 滚动元素
            TweenLite.to(this.page, this.EASE_SPEED, {
                y: -this.getPageScroll(),
                ease: this.easing
            });
        }

    }

    // 开启SmoothScroll
    new SmoothScroll();
}
