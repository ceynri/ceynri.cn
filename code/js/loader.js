{
    class Loader {
        constructor(loader, contentContainer) {
            this.loader = loader;
            this.overlays = loader.children;
            this.scrollablePage = contentContainer;

            this.overlayNum = loader.childElementCount;
            this.ANIMATION_TIME = 2;
            this.EASING = Power3.easeInOut;

            this.initPageScrollTop();
            this.listenPageLoadedEvent();
        }
        initPageScrollTop() {
            // * 初始化页面滚动位置
            // 禁止页面滚动
            document.body.style.overflow = 'hidden';

            // 清除浏览器缓存的之前的页面滚动位置
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            } else {
                window.scrollTo(0, 0);
            }
            // 设置页面内容的初始位置，以便播放滚上来的动画
            TweenLite.set(this.scrollablePage, {
                y: (this.overlayNum * 100) + 'vh'
            });
        }
        disableScroll(e) {
            // * 禁止移动端的滚动事件
            window.scrollTo(0, 0); // 电脑端
            e.preventDefault(); // 移动端
            // 等页面加载完了再允许滚动
        }
        listenPageLoadedEvent() {
            // * 监听页面加载完成事件，进行一些操作
            const pageLoadedAction = () => {
                // 播放动画
                for (let i = 0; i < this.overlayNum; i++) {
                    TweenLite.to(this.overlays[i], this.ANIMATION_TIME, {
                        // ".1"是为了避免缩放导致的误差故多预算一点空间出来
                        y: (-100.1 * (i + 1)) + 'vh',
                        ease: this.EASING
                    });
                }
                TweenLite.to(this.scrollablePage, this.ANIMATION_TIME, {
                    y: 0,
                    ease: this.EASING
                });
                // 执行动画播放完的操作
                setTimeout(animationEndAction, this.ANIMATION_TIME * 1000);
            };
            const animationEndAction = () => {
                // 重新允许滚动
                document.body.style.overflow = 'visible';
                this.loader.style.display = 'none';
            }
            window.addEventListener('load', pageLoadedAction);
        }
    }

    const loader = document.querySelector('.loader');
    const contentContainer = document.querySelector('div[data-scroll]');
    new Loader(loader, contentContainer);
}
