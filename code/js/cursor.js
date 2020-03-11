// 已知bug：对于第一次使用play方法执行的tween动画，如果在reverse动画播放过程中执行了冲突的
//         另外一个动画，会使某些样式（主要是缩放）永久失效（直到重新刷新页面）
// 暂时解决：加大了about与其他区域之间的距离，最大程度避免bug情况的条件达成（但仍然无法避免）
// 问题原因：overwrite使得play/reverse()保存了错误的状态
// 完全解决：不使用play与reverse，直接写死动画效果（目前已将部分易出现bug的scale效果改写）
if (!MediaMatcher.isTouchScreenDevice()) {
    /*
     * @title 光标类
     * @author ceynri
     */
    class Cursor {
        constructor() {
            this.initElem();
            this.initProp();
            this.initConst();
            this.initCursor();
            this.initTweens();
            this.initEvents();
        }

        initElem() {
            // * 初始化元素
            // 光标内部元素
            this.innerCursor = {};
            this.innerCursor.box = document.querySelector('.cursor-inner-box');
            this.innerCursor.point = this.innerCursor.box.querySelector('.point');
            this.innerCursor.zoomIn = this.innerCursor.box.querySelector('.zoom-in');
            this.innerCursor.down = this.innerCursor.box.querySelector('.page-down');
            this.innerCursor.hand = this.innerCursor.box.querySelector('.hand');
            this.innerCursor.detail = this.innerCursor.box.querySelector('.detail');

            // 光标外部元素
            this.outerCursor = {};
            this.outerCursor.box = document.querySelector('.cursor-outer-box');
            this.outerCursor.normal = this.outerCursor.box.querySelector('.normal');
            this.outerCursor.arrow = this.outerCursor.box.querySelector('.arrow');
        }
        initProp() {
            // * 初始化属性
            // 内部光标大小
            this.innerCursor.box.size = this.innerCursor.box.getBoundingClientRect().width;
            // 外部光标大小
            this.outerCursor.box.size = this.outerCursor.box.getBoundingClientRect().width;
            this.outerCursor.normal.size = this.outerCursor.normal.getBoundingClientRect().width;

            // 光标默认颜色
            const root = document.documentElement;
            this.cursorColor = getComputedStyle(root).getPropertyValue('--cursorColor') || '#fff';
            // 外部光标默认透明度
            this.outerCursorOpacity = getComputedStyle(this.outerCursor.box).getPropertyValue('opacity');
            // 外部光标相关属性
            this.outerCursorSpeed = 0;

            // 一开始先将光标置于屏幕外
            this.clientX = -1000;
            this.clientY = -1000;

            // 是否在work区域
            this.isInWork = false;
        }
        initConst() {
            // * 初始化常量
            // 外光标移动速度
            this.MOVE_SPEED = 0.15;
            // 缓动动画播放速度
            this.ANIMATION_SPEED = .3;
            // hero区域的鼠标缩放比例
            this.HERO_SCALING_RATIO = 4;
            // about区域的鼠标缩放比例
            this.ABOUT_SCALING_RATIO = 6;
            // works元素区域的鼠标缩放比例
            this.WORKS_SCALING_RATIO = 3;
            // icon-btn元素区域的内光标缩放比例
            this.ICON_BTN_SCALING_RATIO = 3;
        }

        initCursor() {
            // * 初始化光标
            // 初始化光标与动画相关的样式
            this.initCursorStyle();
            // 初始化光标位置
            this.initCursorPos();
            // 开始渲染光标的移动
            this.renderCursorMove();
        }
        initCursorStyle() {
            // * 初始化光标与动画相关的样式
            // 需要缩小为0的光标
            const scale0List = [
                this.innerCursor.zoomIn,
                this.innerCursor.down,
                this.innerCursor.hand,
                this.innerCursor.detail,
                this.outerCursor.arrow,
            ];
            scale0List.forEach(cursor => {
                TweenLite.set(cursor, {
                    scale: 0
                });
            });
        }
        setCursorCoord(cursorBox) {
            // * 将传入的光标设定实时的鼠标坐标值
            TweenLite.set(cursorBox, {
                x: this.clientX - cursorBox.size / 2,
                y: this.clientY - cursorBox.size / 2
            });
        }
        initCursorPos() {
            // * 初始化光标位置
            // 自定义光标还没有显示时，监听鼠标第一次的移动，设置自定义光标到光标坐标处
            const unveilCursor = () => {
                this.setCursorCoord(this.outerCursor.box);
                setTimeout(() => {
                    // 初始化outCursorSpeed，从而启动关于outerCursor的缓动动画
                    this.outerCursorSpeed = this.MOVE_SPEED;
                    // set需要计算时间，需要延迟一下再设置speed
                    // 避免后文的缓动动画启用导致外部光标有从屏幕外移入动画的情况
                }, 100);
                // 完成任务后把自己移除
                document.removeEventListener('mousemove', unveilCursor, {
                    passive: true
                });
            };
            document.addEventListener('mousemove', unveilCursor, {
                passive: true
            });

            // 监听鼠标移动
            document.addEventListener('mousemove', e => {
                this.clientX = e.clientX;
                this.clientY = e.clientY;
            }, {
                passive: true
            });
        }
        renderCursorMove() {
            // * 开始渲染光标移动
            const frame = () => {
                // 内部光标实时改变
                this.setCursorCoord(this.innerCursor.box);
                if (!this.isStuck) {
                    // 外部光标平滑延迟移动
                    TweenLite.to(this.outerCursor.box, this.outerCursorSpeed, {
                        x: this.clientX - this.outerCursor.box.size / 2,
                        y: this.clientY - this.outerCursor.box.size / 2,
                        ease: Quart.ease
                    });
                }
                // 循环调用以不断循环下去
                requestAnimationFrame(frame);
            };
            // 为了高性能所以使用单独的frame函数调用requestAnimationFrame函数来提高性能
            requestAnimationFrame(frame);
        }

        initTweens() {
            // * 全局Tween
            this.tween = {};
            // outerCursor
            this.tween.shrinkOuterCursor = TweenLite.to(this.outerCursor.box, this.ANIMATION_SPEED, {
                scale: 0.8,
                ease: Back.easeOut,
                paused: true
            });
            this.tween.brightenOuterCursor = TweenLite.to(this.outerCursor.normal, this.ANIMATION_SPEED, {
                backgroundColor: 'rgba(255, 255, 255, .9)',
                paused: true
            });
            // innerCursor
            this.tween.shrinkPoint = TweenLite.to(this.innerCursor.point, this.ANIMATION_SPEED, {
                scale: 0,
                ease: Back.easeOut.config(2),
                paused: true
            });
            // 因为外光标的scale动画使用play与reverse太容易出现bug，所以单独写为函数，便于手动play与reverse
            this.tween.expandOuterCursorFunc = (scalingRatio = 1) => {
                if (scalingRatio !== 1) {
                    // 正向动画
                    TweenLite.to(this.outerCursor.normal, this.ANIMATION_SPEED, {
                        scale: scalingRatio,
                        ease: Back.easeOut.config(1.5)
                    });
                } else {
                    // 逆向动画（复原为默认大小的动画）
                    TweenLite.to(this.outerCursor.normal, this.ANIMATION_SPEED, {
                        scale: 1,
                        ease: Back.easeIn.config(2)
                    });
                }
            }
        }
        initEvents() {
            // * 各种事件监听的初始化
            // global
            this.addGlobalAnimation();
            // hero
            this.addHeroAnimation();
            // about
            this.addAboutAnimation();
            // works
            this.addWorksAnimation();
            // work
            this.addWorkAnimation();
            // icon-btn
            this.addIconBtnAnimation();
            // icon-link
            this.addIconLinkAnimation();
            // work的a标签
            this.listenWorkLinkEvent();
        }

        addGlobalAnimation() {
            // * 全局动画
            const globalMouseDown = () => {
                this.tween.shrinkOuterCursor.play();
            }
            const globalMouseUp = () => {
                this.tween.shrinkOuterCursor.reverse();
            }

            document.addEventListener('mousedown', globalMouseDown, {
                passive: true
            });
            document.addEventListener('mouseup', globalMouseUp, {
                passive: true
            });
        }
        addHeroAnimation() {
            // * pagedown出现向下箭头的动画
            const downArrowShowTween = TweenLite.to(this.innerCursor.down, this.ANIMATION_SPEED, {
                scale: this.HERO_SCALING_RATIO,
                ease: Back.easeOut.config(1.5),
                paused: true
            });

            const pageDownMouseEnter = () => {
                this.tween.expandOuterCursorFunc(this.HERO_SCALING_RATIO);
                this.tween.brightenOuterCursor.play();
                this.tween.shrinkPoint.play();
                downArrowShowTween.play();
                this.outerCursorSpeed = 0;
                this.setCursorCoord(this.outerCursor.box);
            }
            const pageDownMouseLeave = () => {
                this.tween.expandOuterCursorFunc(1);
                this.tween.brightenOuterCursor.reverse();
                this.tween.shrinkPoint.reverse();
                downArrowShowTween.reverse();
                this.outerCursorSpeed = this.MOVE_SPEED;
            }
            // 应用hero相关监听器
            const hero = document.querySelector('.hero');
            hero.addEventListener('mouseenter', pageDownMouseEnter, {
                passive: true
            });
            hero.addEventListener('mouseleave', pageDownMouseLeave, {
                passive: true
            });
        }
        addAboutAnimation() {
            // * about部分的动画
            const aboutMouseEnter = () => {
                this.tween.expandOuterCursorFunc(this.ABOUT_SCALING_RATIO);
                this.tween.brightenOuterCursor.play();
                this.tween.shrinkPoint.play();
            }
            const aboutMouseLeave = () => {
                this.tween.expandOuterCursorFunc(1);
                this.tween.brightenOuterCursor.reverse();
                this.tween.shrinkPoint.reverse();
            }
            // 应用hero相关监听器
            const aboutArea = document.querySelector('.about');
            aboutArea.addEventListener('mouseenter', aboutMouseEnter, {
                passive: true
            });
            aboutArea.addEventListener('mouseleave', aboutMouseLeave, {
                passive: true
            });
        }
        addWorksAnimation() {
            // * works动画
            const arrowShowTween = TweenLite.to(this.outerCursor.arrow, this.ANIMATION_SPEED, {
                scale: this.WORKS_SCALING_RATIO,
                ease: Back.easeOut.config(1.5),
                paused: true
            });

            const handShowTween = TweenLite.to(this.innerCursor.hand, this.ANIMATION_SPEED, {
                scale: this.WORKS_SCALING_RATIO,
                ease: Back.easeOut.config(1.5),
                paused: true
            });

            // mouseover与mouseenter的区别在于
            // 在进入父元素的子元素时也会触发mouseover事件
            const worksMouseOver = () => {
                this.tween.expandOuterCursorFunc(this.WORKS_SCALING_RATIO);
                this.tween.shrinkPoint.play();
                // 判断是否在work内
                if (!this.isInWork && MediaMatcher.widthMoreThan(540)) {
                    // 在works内而不在work内，且浏览器宽度大于540px，则显示hand和arrow
                    handShowTween.play();
                    // 因为opacity一开始就是1，想要实现进入works是缩放而work中退出是渐变则不能合并入handShowTween
                    TweenLite.to(this.innerCursor.hand, this.ANIMATION_SPEED, {
                        opacity: 1
                    })
                    arrowShowTween.play();
                } else if (this.isInWork) {
                    // 在work内，隐藏hand和arrow，其中hand应用透明度渐变动画
                    handShowTween.reverse();
                    TweenLite.to(this.innerCursor.hand, this.ANIMATION_SPEED, {
                        opacity: 0
                    });
                    arrowShowTween.reverse();
                }
            }

            const worksMouseDown = () => {
                // hand变为drag-hand
                this.innerCursor.hand.children[0].classList.remove('icon-hand');
                this.innerCursor.hand.children[0].classList.add('icon-drag-hand');
            }
            const worksMouseUp = () => {
                // 换回去
                this.innerCursor.hand.children[0].classList.remove('icon-drag-hand');
                this.innerCursor.hand.children[0].classList.add('icon-hand');
            }
            const worksMouseLeave = e => {
                // 保存一下需要执行的动画
                const reverseAnimation = () => {
                    this.tween.expandOuterCursorFunc(1);
                    arrowShowTween.reverse();
                    this.tween.shrinkPoint.reverse();
                    handShowTween.reverse();
                }
                // 如果鼠标是拖拽着超出了works边缘
                if (e.buttons) {
                    // 持续监听直到松开鼠标再执行动画
                    const delayReverseAnimation = () => {
                        reverseAnimation();
                        worksMouseUp();
                        document.removeEventListener('mouseup', delayReverseAnimation, {
                            passive: true
                        });
                    }
                    document.addEventListener('mouseup', delayReverseAnimation, {
                        passive: true
                    });
                } else {
                    // 直接执行动画
                    reverseAnimation();
                }
            }
            // 应用works相关监听器
            const works = document.querySelector('.works');
            works.addEventListener('mouseover', worksMouseOver, {
                passive: true
            });
            works.addEventListener('mousedown', worksMouseDown, {
                passive: true
            });
            works.addEventListener('mouseup', worksMouseUp, {
                passive: true
            });
            works.addEventListener('mouseleave', worksMouseLeave, {
                passive: true
            });
        }
        addWorkAnimation() {
            // * work动画
            const workDetailShowTween = TweenLite.to(this.innerCursor.detail, this.ANIMATION_SPEED, {
                scale: this.WORKS_SCALING_RATIO,
                ease: Back.easeOut.config(1.5),
                paused: true
            });
            const arrowFadeOutTween = TweenLite.to(this.outerCursor.arrow, this.ANIMATION_SPEED / 2, {
                opacity: 0,
                ease: Back.easeOut.config(1.5),
                paused: true
            });

            // 因为work会有缩放，使用mouseenter会有点小bug，故使用mouseover
            const workMouseOver = () => {
                workDetailShowTween.play();
                arrowFadeOutTween.play();
                this.tween.brightenOuterCursor.play();
                // 外光标改为实时移动
                this.outerCursorSpeed = 0;
                this.setCursorCoord(this.outerCursor.box);
                // 设置“处于work中”，works中监听的mouseover事件会让光标隐藏hand和arrow
                this.isInWork = true;
            }
            const workMouseLeave = () => {
                // 反向播放动画
                arrowFadeOutTween.reverse();
                workDetailShowTween.reverse();
                this.tween.brightenOuterCursor.reverse();
                // 恢复缓动移动
                this.outerCursorSpeed = this.MOVE_SPEED;
                // 恢复hand型
                this.isInWork = false;
            }

            const works = document.querySelectorAll('.work');
            works.forEach(work => {
                work.addEventListener('mouseover', workMouseOver, {
                    passive: true
                });
                work.addEventListener('mouseleave', workMouseLeave, {
                    passive: true
                });
            });
        }
        addIconBtnAnimation() {
            // * icon-btn动画
            const iconBtnMouseEnter = () => {
                TweenLite.to(this.innerCursor.point, this.ANIMATION_SPEED, {
                    scale: this.ICON_BTN_SCALING_RATIO,
                    opacity: 0.25,
                    ease: Back.easeOut.config(1.5)
                });
            }
            const iconBtnMouseOver = e => {
                // 鼠标外盒不再随鼠标移动改变坐标
                this.isStuck = true;
                // 获得当前对象的盒子
                const target = e.currentTarget;
                const box = target.getBoundingClientRect();
                const offset = (box.width - this.outerCursor.box.size) / 2;
                TweenLite.to(this.outerCursor.box, this.ANIMATION_SPEED, {
                    x: box.left + offset,
                    y: box.top + offset,
                    ease: Back.easeOut.config(1.5),
                });
                TweenLite.to(this.outerCursor.normal, this.ANIMATION_SPEED, {
                    width: box.width,
                    height: box.height,
                    borderWidth: 2,
                    ease: Back.easeOut.config(1.5),
                });
                // 为什么不把mouseover部分放入mouseenter？
                // 答：因为页面是缓动滚动的，如果放在mouseenter很容易提前固定导致错位
            };
            const iconBtnMouseLeave = () => {
                this.isStuck = false;
                TweenLite.to(this.outerCursor.normal, this.ANIMATION_SPEED, {
                    width: this.outerCursor.normal.size,
                    height: this.outerCursor.normal.size,
                    borderWidth: 1,
                    ease: Back.easeOut.config(1.5),
                });
                TweenLite.to(this.innerCursor.point, this.ANIMATION_SPEED, {
                    scale: 1,
                    opacity: 1,
                    ease: Back.easeOut.config(1.5)
                })
            };

            // 应用icon-btn相关监听器
            const iconBtns = document.querySelectorAll('.icon-btn');
            iconBtns.forEach(item => {
                item.addEventListener('mouseenter', iconBtnMouseEnter, {
                    passive: true
                });
                item.addEventListener('mouseover', iconBtnMouseOver, {
                    passive: true
                });
                item.addEventListener('mouseleave', iconBtnMouseLeave, {
                    passive: true
                });
            });
        }
        addIconLinkAnimation() {
            // * icon-link动画
            const zoomInShowTween = TweenLite.to(this.innerCursor.zoomIn, this.ANIMATION_SPEED, {
                scale: 1,
                paused: true
            });
            const zoomInRotateTween = TweenLite.to(this.innerCursor.zoomIn, this.ANIMATION_SPEED, {
                rotation: 135,
                delay: this.ANIMATION_SPEED / 2,
                paused: true
            });

            const iconLinkMouseEnter = () => {
                zoomInShowTween.play();
                zoomInRotateTween.play();
            }
            const iconLinkMouseLeave = () => {
                zoomInShowTween.reverse();
                zoomInRotateTween.reverse();
            }

            // 应用icon-link相关监听器
            const iconLink = document.querySelectorAll('.icon-link');
            iconLink.forEach(item => {
                item.addEventListener('mouseenter', iconLinkMouseEnter, {
                    passive: true
                });
                item.addEventListener('mouseleave', iconLinkMouseLeave, {
                    passive: true
                });
            });
        }

        listenWorkLinkEvent() {
            // 监听鼠标点击，允许用户可以在work上仍然执行拖动的操作
            let mouseDownX = 0,
                mouseDownY = 0;
            const linkMouseDown = e => {
                mouseDownX = e.clientX;
                mouseDownY = e.clientY;
                // 有些浏览器（如firefox）有手势插件（如拖拽链接从后台新标签页打开），禁用事件默认操作可以解决该问题
                e.preventDefault();
            };
            const linkClick = e => {
                // 计算鼠标点下再抬起所移动的曼哈顿距离（没有使用欧式距离是因为这个计算简单）
                const dist = Math.abs(mouseDownX - e.clientX) + Math.abs(mouseDownY - e.clientY);
                // 如果距离大于20，则判断此次行为为拖动works而不是打开链接
                if (dist > 20) {
                    // 阻止默认事件（a标签的href链接跳转）
                    e.preventDefault();
                }
            };
            // work a事件监听
            const workLinks = document.querySelectorAll('.work a');
            workLinks.forEach(link => {
                link.addEventListener('mousedown', linkMouseDown);
                link.addEventListener('click', linkClick);
            })
        }
    }

    new Cursor();
}
