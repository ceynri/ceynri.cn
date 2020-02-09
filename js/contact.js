{
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
            this.ICON_INFO_COLOR = getComputedStyle(document.documentElement, null).getPropertyValue('--textColor');
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
            // iconInfo文字变色特效
            const infoHighLightTween = TweenLite.to(this.info, this.FADE_SPEED, {
                color: this.ICON_INFO_CLICK_COLOR,
                paused: true
            });
            const mouseOutAnimation = () => {
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
                    ease: Power3.ease
                });
                infoHighLightTween.reverse();
            };

            this.iconBtn.addEventListener('mouseover', mouseOverAnimation);
            this.iconBtn.addEventListener('click', () => {
                infoHighLightTween.play();
            });
            this.iconBtn.addEventListener('mouseout', mouseOutAnimation);
        }
        addClickCopyString(str, infoText = '已复制😊') {
            this.iconBtn.addEventListener('click', () => {
                this.copyToClipboard(str);
                this.info.innerHTML = infoText;
            });
        }
        copyToClipboard(str) {
            // * 将字符串复制到剪贴板
            const strWrapper = document.createElement('input');
            strWrapper.setAttribute('readonly', 'readonly');
            strWrapper.setAttribute('value', str);
            document.body.appendChild(strWrapper);
            strWrapper.select();
            if (document.execCommand('copy')) {
                if (document.execCommand('copy')) {
                    console.log('复制内容：' + str);
                } else {
                    console.error('复制失败');
                }
            }
            document.body.removeChild(strWrapper);
        };
    }

    const contact = document.querySelector('.contact');

    const defaultText = contact.querySelector('.contact-default');
    const githubText = contact.querySelector('.contact-github');
    const bilibiliText = contact.querySelector('.contact-bilibili');
    const mailText = contact.querySelector('.contact-mail');
    const wechatText = contact.querySelector('.contact-wechat');
    const qqText = contact.querySelector('.contact-qq');

    const githubBtn = contact.querySelector('.github-btn');
    const bilibiliBtn = contact.querySelector('.bilibili-btn');
    const mailBtn = contact.querySelector('.mail-btn');
    const wechatBtn = contact.querySelector('.wechat-btn');
    const qqBtn = contact.querySelector('.qq-btn');

    const btnInfo = contact.querySelector('.btn-info');

    const github = new Contact(githubText, defaultText, githubBtn, btnInfo, 'Github');
    const bilibili = new Contact(bilibiliText, defaultText, bilibiliBtn, btnInfo, 'bilibili');
    const mail = new Contact(mailText, defaultText, mailBtn, btnInfo, 'Mail');
    const wechat = new Contact(wechatText, defaultText, wechatBtn, btnInfo, 'WeChat');
    const qq = new Contact(qqText, defaultText, qqBtn, btnInfo, 'QQ');

    wechat.addClickCopyString('sakuramemory', '已复制微信号😊');
    qq.addClickCopyString('347670115', '已复制QQ号😊');
    mail.addClickCopyString('ceynri@gmail.com', '已复制邮箱😊');
}
