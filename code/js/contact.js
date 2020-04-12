{
    /*
     * 绑定文本与对应的按钮
     * 增加交互动画与复制文本功能
     */
    class Contact {
        constructor(text, defaultText, iconBtn, info, infoText) {
            this.initElem(text, defaultText, iconBtn, info, infoText);
            this.initConst();
            this.initEvent();
        }
        initElem(text, defaultText, iconBtn, info, infoText) {
            this.text = text;
            this.defaultText = defaultText;
            this.iconBtn = iconBtn;
            this.icons = iconBtn.querySelector('.icons');
            this.info = info;
            this.infoText = infoText;
        }
        initConst() {
            this.ICON_INFO_COLOR = getComputedStyle(document.documentElement, null).getPropertyValue('--textColor').trim();
            this.ICON_INFO_CLICK_COLOR = '#ffc83d';
            this.OPACITY = .8;
            this.FADE_SPEED = .3;
        }
        initEvent() {
            this.listenMouseEvent();
        }
        listenMouseEvent() {
            const mouseOverAnimation = () => {
                TweenLite.to(this.icons.children[0], this.FADE_SPEED, {
                    opacity: 0,
                    ease: Power3.ease
                });
                TweenLite.to(this.icons.children[1], this.FADE_SPEED, {
                    opacity: 1,
                    ease: Power3.ease
                });
                TweenLite.to(this.defaultText, this.FADE_SPEED, {
                    opacity: 0,
                    ease: Power3.easeOut
                });
                TweenLite.to(this.text, this.FADE_SPEED, {
                    opacity: 1,
                    ease: Power3.ease
                });
                TweenLite.to(this.info, this.FADE_SPEED, {
                    opacity: 1,
                    ease: Power3.ease
                });
                this.info.innerHTML = this.infoText;
            };
            const mouseLeaveAnimation = () => {
                TweenLite.to(this.icons.children[0], this.FADE_SPEED, {
                    opacity: 1,
                    ease: Power3.ease
                });
                TweenLite.to(this.icons.children[1], this.FADE_SPEED, {
                    opacity: 0,
                    ease: Power3.ease
                });
                TweenLite.to(this.defaultText, this.FADE_SPEED, {
                    opacity: 1,
                    ease: Power3.easeIn
                });
                TweenLite.to(this.text, this.FADE_SPEED, {
                    opacity: 0,
                    ease: Power3.ease
                });
                TweenLite.to(this.info, this.FADE_SPEED, {
                    opacity: 0,
                    color: this.ICON_INFO_COLOR,
                    ease: Power3.ease
                });
            };

            this.iconBtn.addEventListener('mouseover', mouseOverAnimation);
            if (MediaMatcher.isPC()) {
                this.iconBtn.addEventListener('click', () => {
                    TweenLite.to(this.info, this.FADE_SPEED, {
                        color: this.ICON_INFO_CLICK_COLOR,
                    });
                });
            }
            this.iconBtn.addEventListener('mouseleave', mouseLeaveAnimation);
        }
        addClickCopyString(str, copyedInfoText, isResetInfoText = false) {
            if (isResetInfoText) {
                this.infoText = `点击复制${copyedInfoText}`;
            }
            this.iconBtn.addEventListener('click', () => {
                if (this.copyToClipboard(str)) {
                    this.info.innerHTML = `已复制${copyedInfoText}😊`;
                } else {
                    this.info.innerHTML = `复制${str}失败😥`;
                }
            });
        }
        addTouchCopyString(str, copyedInfoText, isResetInfoText = false) {
            // 禁止弹出菜单，避免长按导致浏览器菜单弹出
            this.iconBtn.oncontextmenu = e => {
                e.preventDefault();
            };
            if (isResetInfoText) {
                this.infoText = `长按按钮复制${copyedInfoText}`;
            }

            let longPressTimer;
            this.iconBtn.addEventListener('touchstart', e => {
                longPressTimer = setTimeout(() => {
                    e.preventDefault();
                    if (this.copyToClipboard(str)) {
                        this.info.innerHTML = `已复制${copyedInfoText}😊`;
                    } else {
                        this.info.innerHTML = `复制失败😥：${str} 浏览器不支持`;
                    }
                }, 500);
            });
            this.iconBtn.addEventListener('touchend', () => {
                clearTimeout(longPressTimer);
            });
        }
        // * 将字符串复制到剪贴板
        copyToClipboard(str) {
            const strWrapper = document.createElement('input');
            strWrapper.setAttribute('readonly', 'readonly');
            strWrapper.setAttribute('value', str);
            document.body.appendChild(strWrapper);
            strWrapper.select();
            if (document.execCommand('copy')) {
                document.body.removeChild(strWrapper);
                console.log('复制内容：' + str);
                return true;
            } else {
                document.body.removeChild(strWrapper);
                console.error('复制失败');
                return false;
            }
        };
    }
    // 主体
    const contact = document.querySelector('.contact');
    // 默认介绍
    const defaultText = contact.querySelector('.contact-default');
    // 不同平台的介绍
    const githubText = contact.querySelector('.contact-github');
    const bilibiliText = contact.querySelector('.contact-bilibili');
    const musicText = contact.querySelector('.contact-music');
    const mailText = contact.querySelector('.contact-mail');
    const wechatText = contact.querySelector('.contact-wechat');
    const qqText = contact.querySelector('.contact-qq');
    // 不同平台的按钮
    const githubBtn = contact.querySelector('.github-btn');
    const bilibiliBtn = contact.querySelector('.bilibili-btn');
    const musicBtn = contact.querySelector('.music-btn');
    const mailBtn = contact.querySelector('.mail-btn');
    const wechatBtn = contact.querySelector('.wechat-btn');
    const qqBtn = contact.querySelector('.qq-btn');
    // 按钮的文本解释
    const btnInfo = contact.querySelector('.btn-info');
    // 绑定文本与按钮的关联，绑定交互事件
    const github = new Contact(githubText, defaultText, githubBtn, btnInfo, 'Github');
    const bilibili = new Contact(bilibiliText, defaultText, bilibiliBtn, btnInfo, 'bilibili');
    const music = new Contact(musicText, defaultText, musicBtn, btnInfo, '网易云音乐');
    const mail = new Contact(mailText, defaultText, mailBtn, btnInfo, 'Gmail');
    const wechat = new Contact(wechatText, defaultText, wechatBtn, btnInfo, 'WeChat');
    const qq = new Contact(qqText, defaultText, qqBtn, btnInfo, 'QQ');
    // 设置点击按钮复制相关内容的功能
    if (MediaMatcher.isPC()) {
        wechat.addClickCopyString('sakuramemory', '微信号', true);
        qq.addClickCopyString('347670115', 'QQ号', true);
        mail.addClickCopyString('ceynri@gmail.com', 'Mail');
    } else {
        wechat.addTouchCopyString('sakuramemory', '微信号', true);
        qq.addTouchCopyString('347670115', 'QQ号', true);
        mail.addTouchCopyString('ceynri@gmail.com', '邮箱');
    }
}
