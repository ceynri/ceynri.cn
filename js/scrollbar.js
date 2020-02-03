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
        // 记录是否产生了拖动行为
        this.isDragged = false;
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
        window.addEventListener('scroll', () => {
            this.renderScroll()
        });

        this.scrollbar.addEventListener('mousedown', e => {
            this.scrollByScrollbar(e);
        });
    }
    renderScroll() {
        TweenLite.to(this.bar, this.speed, {
            height: this.getScrollbarHeight(),
            ease: Back.easeOut
        });
    }
    scrollByScrollbar(e) {
        // 禁止默认行为，避免拖动鼠标的时候把页面中的文本也选中了
        e.preventDefault();
        // 以滚动条高度与页面高度比例映射拖动的距离值
        const mapFromBarToPage = y => y / this.windowHeight * this.pageHeight;
        const scrollPageByClickScrollbar = clickY => {
            // 令鼠标点击的位置对应滚动后的页面的窗口底端位置
            const bottomY = mapFromBarToPage(clickY);
            // 底端位置减去窗口高度得到顶端y坐标值
            const targetY = bottomY - this.windowHeight;
            window.scrollTo(0, targetY);
            // targetY小于0时会自动取0
        }

        // 记录鼠标落下的位置
        const mouseDownClientY = e.clientY;
        // 判断鼠标落下的位置是否在滚动条未滚动到的位置
        if (mouseDownClientY > this.getScrollbarHeight()) {
            scrollPageByClickScrollbar(mouseDownClientY);
        }

        // 记录拖动前的窗口顶端坐标值
        const beforeDragScrollTop = this.getScrollTop();
        // 记录是否产生了拖动行为
        this.isDragged = false;

        // 响应接下来的产生的拖动滚动条的行为
        const dragEvent = e => {
            this.isDragged = true;
            const dragDist = mapFromBarToPage(e.clientY - mouseDownClientY);
            const targetY = dragDist + beforeDragScrollTop;
            window.scrollTo(0, targetY);
        };
        const mouseUpEvent = () => {
            if (!this.isDragged) {
                // 如果没有拖动过，则行为变成滚动到所点击的位置
                scrollPageByClickScrollbar(mouseDownClientY);
            }
            // 移除监听
            document.removeEventListener('mousemove', dragEvent);
            document.removeEventListener('mouseup', mouseUpEvent);
        }
        // 因为用户拖动滚动条时可能会移出滚动条的边界，所以把事件绑定到document上
        document.addEventListener('mousemove', dragEvent);
        document.addEventListener('mouseup', mouseUpEvent);
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
