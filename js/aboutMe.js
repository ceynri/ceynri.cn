/* 
 * 图标与鼠标交互效果
 */
{
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

    const intro = document.querySelector('.intro-myself');
    const info = document.querySelector('.icon-info');
    const infoColor = getComputedStyle(info, null).getPropertyValue('color');
    const infoClickedColor = '#ffc83d';

    const iconWrappers = document.querySelectorAll('.icon');
    const introContainer = document.querySelector('.intro-container');

    for (let i = 0; i < iconWrappers.length; i++) {
        const wrapper = iconWrappers[i];
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

    const githubIcon = document.querySelector('.icon-github-line');
    const wechatIcon = document.querySelector('.icon-wechat-line');
    const qqIcon = document.querySelector('.icon-qq-line');
    const bilibiliIcon = document.querySelector('.icon-bilibili-line');
    const mailIcon = document.querySelector('.icon-mail-line');

    // over
    // TODO 改为大字背景
    githubIcon.addEventListener('mouseover', () => {
        info.innerHTML = 'GitHub';
    })
    wechatIcon.addEventListener('mouseover', () => {
        info.innerHTML = 'WeChat';
    })
    qqIcon.addEventListener('mouseover', () => {
        info.innerHTML = 'QQ';
    })
    bilibiliIcon.addEventListener('mouseover', () => {
        info.innerHTML = 'bilibili';
    })
    mailIcon.addEventListener('mouseover', () => {
        info.innerHTML = 'Mail';
    })

    // click
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
        info.innerHTML = '已复制邮箱😊';
    })
}
