{
    // 一些自定义的数学函数
    const MathUtils = {
        // 将x从[a, b]映射到对应的[c, d]上
        map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
        // 线性插值
        lerp: (a, b, n) => (1 - n) * a + n * b
    };

    // todo ? class写法好还是函数式写法更好
    // * 平滑滚动
    class SmoothScroll {
        constructor() {
            // * 构造器

            // body元素
            this.body = document.body;
            // 可滚动元素
            this.scrollElem = document.querySelector('div[data-scroll]');
            // bodyBorder的边框宽度
            this.borderWidth;
            // 滚动时要改变的属性
            this.renderedVal = {
                // 现值与目标值
                currentVal: 0,
                targetVal: 0,
                // 插值的增量系数
                ease: 0.1,
            };

            // 一些初始化
            this.init();
            // 设置body的大小
            this.setSize();
            // 设置初始值
            this.update();
            // 初始化并绑定事件
            this.initEvents();
            // 开始循环渲染
            requestAnimationFrame(() => this.render());
        }

        init() {
            // * 获得borderWidth
            const bodyBorder = document.getElementsByClassName('body-border')[0];
            this.borderWidth = getComputedStyle(bodyBorder, null).getPropertyValue('border-top-width'); // 这里如果使用border-width，会产生在firefox里没有值的bug
            this.borderWidth = parseInt(this.borderWidth.split('px')[0]);
        }

        setSize() {
            // * 设置主体的高度
            this.body.style.height = `${this.scrollElem.scrollHeight + this.borderWidth * 2 - 1}px`;
            // 减1是为了保证浏览器放缩带来的误差的安全
        }

        update() {
            // * 设置初始值
            this.renderedVal.targetVal = this.renderedVal.currentVal = this.getDocScroll();
            this.scroll();
        }

        scroll() {
            // * 设置可滚动元素的translate属性
            const y = -1 * this.renderedVal.currentVal;
            this.scrollElem.style.transform = `translate3d(0, ${y}px, 0)`;
        }

        initEvents() {
            // * 调整大小时重新设置body的高度
            window.addEventListener('resize', () => this.setSize());
        }

        getDocScroll() {
            // * 获得当前的滚动高度
            return window.pageYOffset || document.documentElement.scrollTop;
        }

        // todo 添加至监听器，当有滚动事件时才执行，target=current时结束
        render() {
            // * 渲染，更新当前值和目标值
            // 目标值更新
            const targetVal = this.getDocScroll();
            this.renderedVal.targetVal = targetVal;
            // 当前值更新
            let currentVal = MathUtils.lerp(this.renderedVal.currentVal, targetVal, this.renderedVal.ease);
            // targetVal和currentVal足够小时取等
            this.renderedVal.currentVal = Math.abs(currentVal - targetVal) < 1e-3 ? targetVal : currentVal;
            // 使内容滚动
            this.scroll();
            // 循环下去
            requestAnimationFrame(() => this.render());
        }
    }

    // 开启SmoothScroll
    new SmoothScroll();
}
