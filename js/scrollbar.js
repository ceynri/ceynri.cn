class Scrollbar {
    constructor() {
        this.initElem();
        this.initProp();
        this.initScroll();
        this.initEvents();
    }
    initElem() {
        this.scrollbar = document.querySelector('.scrollbar');
        this.bar = this.scrollbar.children[0];
        this.page = document.querySelector('div[data-scroll]');
    }
    initProp() {
        // 获得页面高度的属性
        this.pageHeight = 0;
        this.setPageHeight();
        // 获取窗口内部高度
        this.windowHeight = 0;
        this.setWindowHeight();
        // 缓动速度（初始为0以禁止动画，便于优先应用set动画）
        this.speed = 0;
    }
    initScroll() {
        TweenLite.set(this.bar, {
            height: this.getScrollbarHeight(),
        });
        // set处理需要时间，set完后设置speed值以启用renderScroll的滚动动画
        setTimeout(() => {
            this.speed = 1;
        }, 100);
    }
    initEvents() {
        // 窗口尺寸改变时，重新设置pageHeight
        window.addEventListener('resize', () => {
            this.setPageHeight();
            this.setWindowHeight();
        });
        window.addEventListener('scroll', () => this.renderScroll());
    }
    renderScroll() {
        TweenLite.to(this.bar, this.speed, {
            height: this.getScrollbarHeight(),
            ease: Back.easeOut
        });
    }

    // setter 保存以不必重复从DOM中获取
    setPageHeight() {
        // * 保存页面的高度
        this.pageHeight = this.page.scrollHeight;
    }
    setWindowHeight() {
        // * 保存窗口高度
        this.windowHeight = document.documentElement.clientHeight || window.innerHeight;
    }
    // getter
    getScrollbarHeight() {
        // * 获得滚动条应该设置的高度
        return (this.getWindowBottomY() / this.pageHeight) * this.windowHeight;
    }
    getWindowBottomY() {
        // * 获得当前窗口底端所对应的y坐标值
        return this.getScrollTop() + this.windowHeight;
    }
    getScrollTop() {
        // * 获得当前页面的滚动高度
        return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    }
}

const scrollbar = new Scrollbar();
