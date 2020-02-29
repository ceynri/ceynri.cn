{
    // * 平滑滚动
    class SmoothScroll {
        constructor() {
            // 元素初始化
            this.initElem();
            // 属性初始化
            this.initProp();
            // 常量初始化
            this.initConst();
            // 初始化并绑定事件
            this.initEvents();
            if (!MediaMatcher.isTouchScreenDevice()) {
                // 开始循环渲染滚动页面
                this.render();
            } else {
                this.touchScreenRender();
            }
        }
        initElem() {
            // 可滚动元素
            this.page = document.querySelector('div[data-scroll]');
            this.works = document.querySelector('.works');
            this.footer = document.querySelector('.homepage-footer');
            this.copyright = this.footer.querySelector('.copyright');
        }
        initProp() {
            // * 属性初始化
            // 设置body高度
            this.setBodySize();
            // 初始化文档滚动高度
            this.setPageScrollTop();

            // 设置works最大滚动边界
            this.worksRightBound = 0;
            this.setWorksRightBound();
        }
        initConst() {
            // 缓动速度
            this.EASE_SPEED = 1.75;
            // 页面滚动的缓动类型
            this.EASE = Power4.easeOut;
            // 滚动效率（鼠标每移动1px，元素移动的px值）
            this.WORK_SCROLL_RATIO = 1.2;
            // works横向滚动边界的弹性区间（即最多可以移出边界范围的px值）
            this.WORK_ELASTIC_RANGE = 200;
            // footer高度
            this.FOOTER_HEIGHT = parseInt(getComputedStyle(this.footer, null).getPropertyValue('height'));
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
                this.checkWidth();
            });
        }
        listenWorksDragEvent() {
            // * 拖动works事件
            // drag动画
            const dragWorksAnimation = e => {
                // 获得works应该需要移动到的坐标位置
                let worksTargetX = this.dragOffset + e.clientX * this.WORK_SCROLL_RATIO;
                // 将worksTargetX限制到works应该处于的安全坐标范围内
                const safedX = this.convertToWorksSafedX(worksTargetX);
                // 如果worksTargetX已经移出了安全范围，bias将不为零（表示与最近的安全范围的距离）
                const bias = worksTargetX - safedX;
                // worksTargetX等于safedX加上归一化后的bias，随着bias的增大，斜率趋近于0
                worksTargetX = safedX + CeynriUtils.normallize(bias, this.WORK_ELASTIC_RANGE);
                // 执行drag动画
                TweenLite.to(this.works, 1, {
                    x: worksTargetX,
                    ease: Power4.easeOut
                });
            };
            // start
            const mouseDragWorksStartEvent = e => {
                // 仅当屏幕宽度大于540px时，才允许拖动works
                if (MediaMatcher.widthMoreThan(540)) {
                    this.dragOffset = this.getWorksScrollLeft() - e.clientX * this.WORK_SCROLL_RATIO;
                    // 鼠标移动转化为拖拽works的监听
                    // 因为拖拽过程中可能会离开works范围，所以将事件绑定在document上
                    document.addEventListener('mousemove', dragWorksAnimation);
                    document.addEventListener('mouseup', mouseDragWorksEndEvent);
                }
            };
            // end
            const mouseDragWorksEndEvent = () => {
                // mouseup时删除works拖拽事件监听（如果有的话）
                document.removeEventListener('mousemove', dragWorksAnimation);
                document.removeEventListener('mouseup', mouseDragWorksEndEvent);
                // 设置循环检测是否超出边界，避免出现鼠标抬起后因为works缓动惯性导致超过安全区域
                let times = 5;
                const checkLoop = setInterval(() => {
                    // 检测是否超出边界，如果超出则移动回安全范围
                    if (times-- == 0 || !this.checkWorksXSafe()) {
                        // 循环次数到了或者检测到不安全已经执行了回弹，则结束检测
                        clearInterval(checkLoop);
                    }
                }, 200);
            };
            // 判断是否是移动设备
            if (!MediaMatcher.isTouchScreenDevice()) {
                // 电脑设备
                // 监听works上的mousedown/mouseup事件
                this.works.addEventListener('mousedown', mouseDragWorksStartEvent);
            }
            // 触屏设备改变works样式为竖向排列，不再需要横向滚动
        }
        pageScroll() {
            // 使内容滚动
                TweenLite.to(this.page, this.EASE_SPEED, {
                    y: -this.getPageScrollTop(),
                    ease: this.EASE
                });
        }
        touchScreenPageScroll() {
            TweenLite.set(this.page, {
                y: -this.getPageScrollTop(),
            });
        }
        copyrightFixed() {
            const top = this.footer.getBoundingClientRect().top;
            const footerShowingTop = (document.documentElement.clientHeight || window.innerHeight) - top;
            // 提前100px进行文字的相对窗口固定
            if (footerShowingTop > -100) {
                TweenLite.set(this.copyright, {
                    y: footerShowingTop - this.FOOTER_HEIGHT
                })
            }
        }

        render() {
            // * 渲染滚动页面
            const frame = () => {
                this.pageScroll();
                this.copyrightFixed();
                // 循环下去
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        }
        touchScreenRender() {
            const frame = () => {
                this.touchScreenPageScroll();
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
            this.worksRightBound = this.works.getBoundingClientRect().width - document.documentElement.clientWidth;
        }
        setPageScrollTop() {
            // * 设置初始滚动值（浏览器对滚动高度会有缓存）
            TweenLite.set(this.page, {
                y: -this.getPageScrollTop()
            });
        }

        // getter
        getWorksScrollLeft() {
            // * 获得works的横向滚动距离
            return this.works.getBoundingClientRect().left;
        }
        getPageScrollTop() {
            // * 获得当前的页面滚动高度
            return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
        }

        // calc
        convertToWorksSafedX(x) {
            return Math.max(Math.min(x, 0), -this.worksRightBound);
        }

        // check
        checkWorksXSafe() {
            const currentX = this.getWorksScrollLeft();
            const safedX = this.convertToWorksSafedX(currentX);
            if (currentX != safedX) {
                TweenLite.to(this.works, 1, {
                    x: safedX,
                    ease: Power4.easeOut
                });
                return false;
            }
            return true;
        }
        checkWidth() {
            if (MediaMatcher.widthLessThan(540)) {
                // 如果浏览器宽度小于540px，复原拖动的位置
                TweenLite.set(this.works, {
                    x: 0
                });
            }
        }
    }

    // 开启SmoothScroll
    new SmoothScroll();
}
