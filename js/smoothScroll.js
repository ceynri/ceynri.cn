{
    // 自定义的一些数学计算工具
    const MathUtils = {
        // 将x使用tanh函数归一化到(-scale, scale)区间中
        normallize: (x, scale = 1) => scale * Math.tanh(x / scale)
    }

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
            // 开始循环渲染滚动页面
            this.renderScrollPage();
        }

        init() {
            // * 属性初始化
            // 可滚动元素
            this.page = document.querySelector('div[data-scroll]');
            this.works = document.querySelector('.works');
            // 设置works最大滚动边界
            this.worksRightBound = 0;
            this.setWorksRightBound();
            // 鼠标状态
            this.mouseDownX = 0;
            // 缓动类型
            this.easing = Power0.easeOut;
            // 缓动速度
            this.EASE_SPEED = .5;
            // 滚动效率（鼠标每移动1px，元素移动的px值）
            this.SCROLL_RATE = 1;
            // works横向滚动边界的弹性区间（即最多可以移出边界范围的px值）
            this.ELASTIC_RANGE = 200;
        }

        initEvents() {
            // * 事件监听初始化
            this.listenWindowResizeEvent();
            this.listenWorksDragEvent();
        }
        listenWindowResizeEvent() {
            // * resize窗口大小时重新设置body的高度
            window.addEventListener('resize', () => {
                this.setBodySize();
                this.setWorksRightBound();
            });
        }
        listenWorksDragEvent() {
            // * 拖动works事件
            // drag动画
            const dragWorksAnimation = e => {
                // 获得works应该需要移动到的坐标位置
                let worksTargetX = this.dragOffset + e.clientX * this.SCROLL_RATE;
                // 将worksTargetX限制到works应该处于的安全坐标范围内
                const safedX = this.convertToWorksSafedX(worksTargetX);
                // 如果worksTargetX已经移出了安全范围，bias将不为零（表示与最近的安全范围的距离）
                const bias = worksTargetX - safedX;
                // worksTargetX等于safedX加上归一化后的bias，随着bias的增大，斜率趋近于0
                worksTargetX = safedX + MathUtils.normallize(bias, this.ELASTIC_RANGE);
                // 执行drag动画
                TweenLite.to(this.works, 1, {
                    x: worksTargetX,
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

            // mouseup事件
            document.addEventListener('mouseup', () => {
                // mouseup时删除works拖拽事件监听（如果有的话）
                document.removeEventListener('mousemove', dragWorksAnimation);
                // 检测是否超出边界，如果超出则移动回安全范围
                const currentX = this.getWorksScroll();
                const safedX = this.convertToWorksSafedX(currentX);
                if (currentX != safedX) {
                    TweenLite.to(this.works, 1, {
                        x: safedX,
                        ease: Power4.easeOut
                    });
                }
            });
        }

        renderScrollPage() {
            // * 渲染滚动页面
            const frame = () => {
                // 使内容滚动
                TweenLite.to(this.page, this.EASE_SPEED, {
                    y: -this.getPageScroll(),
                    ease: this.easing
                });
                // 循环下去
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        }

        // setter
        setBodySize() {
            // * 设置主体的高度
            document.body.style.height = `${this.page.scrollHeight}px`;
        }
        setWorksRightBound() {
            // * 设置works的右边界（即向左最多可以位移的距离）
            this.worksRightBound = this.works.getBoundingClientRect().width - window.innerWidth;
        }
        setPageScroll() {
            // * 设置初始滚动值（浏览器对滚动高度会有缓存）
            TweenLite.set(this.page, {
                y: -this.getPageScroll()
            });
        }

        // getter
        getWorksScroll() {
            // * 获得works的横向滚动距离
            return this.works.getBoundingClientRect().left;
        }
        getPageScroll() {
            // * 获得当前的页面滚动高度
            return window.pageYOffset || document.documentElement.scrollTop;
        }

        // calc
        convertToWorksSafedX(x) {
            return Math.max(Math.min(x, 0), -this.worksRightBound);
        }
    }

    // 开启SmoothScroll
    new SmoothScroll();
}
