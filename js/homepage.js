/**
 * @author ceynri
 */

'use strict';

/* TODO LIST
 * title 渐入动画
 * let -> const
 */

(() => {
    // * 设置banner日期
    const date = document.getElementById('date');
    let month = date.getElementsByClassName('month')[0];
    let day = date.getElementsByClassName('day')[0];

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();
    currentMonth = (currentMonth > 9) ? currentMonth : ('0' + currentMonth);
    currentDay = (currentDay > 9) ? currentDay : ('0' + currentDay);
    month.innerHTML = currentMonth;
    day.innerHTML = currentDay;
})();

(() => {
    // * 设置bodyBorder宽度
    function getScrollbarWidth() {
        // * 获得滚动条宽度
        let elem = document.createElement('div'),
            styles = {
                width: '100px',
                height: '100px',
                overflowY: 'scroll', // 使其有滚动条
                position: 'absolute' // 移出文档流避免重绘
            },
            scrollbarWidth;
        for (let i in styles) {
            elem.style[i] = styles[i];
        }
        document.body.appendChild(elem);
        scrollbarWidth = elem.offsetWidth - elem.clientWidth;
        elem.remove();
        return scrollbarWidth;
    }

    let bodyBorder = document.getElementsByClassName('body-border')[0];
    bodyBorder.style.border = `#eee ${getScrollbarWidth()} solid`;
})();

window.addEventListener('load', () => {

    // ? (()=>{})()写法和{}写法的区别
    (() => {
        // * 监听滚动，实现视差滚动
        const bodyWindow = document.getElementById('bodyWindow');
        let titleBlock = bodyWindow.getElementsByClassName('title-block')[0];
        let banner = bodyWindow.getElementsByClassName('banner')[0];

        bodyWindow.addEventListener('scroll', () => {
            let bannerBound = banner.getBoundingClientRect();
            let transStr = 'translateY(' + bannerBound.top + 'px)';
            // console.log(transStr);
            titleBlock.style.transform = transStr;
        })
    })();

    (() => {
        // * 图标与鼠标交互效果

        function copyToCilpboard(str) {
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

        let intro = document.getElementById('introMyself');
        let info = document.getElementById('introInfo');
        let infoColor = getComputedStyle(info, null).getPropertyValue('color');
        let infoClickedColor = '#ffc83d';

        let iconWrappers = document.getElementsByClassName('icon-wrapper');
        let introContainer = document.getElementById('introContainer');

        for (let i = 0; i < iconWrappers.length; i++) {
            let wrapper = iconWrappers[i];
            wrapper.children[0].addEventListener('mouseover', () => {
                // icon
                wrapper.children[0].style.opacity = 0.0;
                wrapper.children[1].style.opacity = 1.0;
                // text
                intro.style.opacity = 0.0;
                info.style.opacity = 1.0;
                // section
                introContainer.children[i + 1].style.opacity = 1.0;
                introContainer.children[i + 1].style.visibility = 'inherit';
            });

            wrapper.children[0].addEventListener('mousedown', () => {
                // 按下时icon变透明
                wrapper.children[1].style.opacity = 0.25;
            });
            wrapper.children[0].addEventListener('click', () => {
                // info文字变色特效
                info.style.color = infoClickedColor;
            });
            wrapper.children[0].addEventListener('mouseup', () => {
                wrapper.children[1].style.opacity = 1.0;
            });

            wrapper.children[0].addEventListener('mouseout', () => {
                // icon
                wrapper.children[0].style.opacity = 1.0;
                wrapper.children[1].style.opacity = 0.0;
                // text
                intro.style.opacity = 1.0;
                info.style.opacity = 0.0;
                info.style.color = infoColor;
                // section
                introContainer.children[i + 1].style.opacity = 0.0;
                introContainer.children[i + 1].style.visibility = 'hidden';
            });
        }

        let githubIcon = document.getElementsByClassName('icon-github-line')[0];
        let wechatIcon = document.getElementsByClassName('icon-wechat-line')[0];
        let qqIcon = document.getElementsByClassName('icon-qq-line')[0];
        let bilibiliIcon = document.getElementsByClassName('icon-bilibili-line')[0];
        let mailIcon = document.getElementsByClassName('icon-mail-line')[0];

        // over
        // TODO 改为大字背景
        githubIcon.addEventListener('mouseover', () => {
            info.innerHTML = 'GitHub';
        })
        wechatIcon.addEventListener('mouseover', () => {
            info.innerHTML = 'WeChat | 点击复制微信号';
        })
        qqIcon.addEventListener('mouseover', () => {
            info.innerHTML = 'QQ | 点击复制QQ号';
        })
        bilibiliIcon.addEventListener('mouseover', () => {
            info.innerHTML = 'bilibili';
        })
        mailIcon.addEventListener('mouseover', () => {
            info.innerHTML = 'Mail';
        })

        // click
        // TODO 复制成功的反馈
        wechatIcon.addEventListener('click', () => {
            copyToCilpboard('WeChat: sakuramemory');
            info.innerHTML = '已复制微信号😊';
        })
        qqIcon.addEventListener('click', () => {
            copyToCilpboard('QQ: 347670115');
            info.innerHTML = '已复制QQ号😊';
        })
        mailIcon.addEventListener('click', () => {
            copyToCilpboard('ceynri@gmail.com');
            info.innerHTML = '已复制😊';
        })

    })();

    (() => {
        // * 新页面从新标签页打开
        let socIcons = document.getElementById('socialIcons');
        let aTags = socIcons.getElementsByTagName('a');
        for (let i = 0; i < aTags.length; i++) {
            aTags[i].target = '_blank';
        }
    })();

    (() => {
        // * 点击guideLine滚动页面
        let guideLine = document.getElementById('guideLine');
        guideLine.addEventListener('click', () => {
            // pass
        })
    });

})
