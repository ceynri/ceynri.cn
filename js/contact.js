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

    const defaultInfo = document.querySelector('.info-default');
    const iconInfo = document.querySelector('.icon-info');
    const iconInfoColor = getComputedStyle(iconInfo, null).getPropertyValue('color');
    const iconInfoClickedColor = '#ffc83d';

    const iconWrappers = document.querySelectorAll('.icon-wrapper');
    const infoContainer = document.querySelector('.info-container');

    iconWrappers.forEach((wrapper, i) => {
        const icon = wrapper.children[0];
        wrapper.addEventListener('mouseover', () => {
            // icon
            icon.children[0].style.opacity = 0.0;
            icon.children[1].style.opacity = 1.0;
            // text
            defaultInfo.style.opacity = 0.0;
            iconInfo.style.opacity = 1.0;
            // section
            infoContainer.children[i + 1].style.opacity = 1.0;
            infoContainer.children[i + 1].style.visibility = 'inherit';
        });

        wrapper.addEventListener('mousedown', () => {
            // 按下时icon变透明
            icon.children[1].style.opacity = 0.25;
        });
        wrapper.addEventListener('click', () => {
            // iconInfo文字变色特效
            iconInfo.style.color = iconInfoClickedColor;
        });
        wrapper.addEventListener('mouseup', () => {
            icon.children[1].style.opacity = 1.0;
        });

        wrapper.addEventListener('mouseout', () => {
            // icon
            icon.children[0].style.opacity = 1.0;
            icon.children[1].style.opacity = 0.0;
            // text
            defaultInfo.style.opacity = 1.0;
            iconInfo.style.opacity = 0.0;
            iconInfo.style.color = iconInfoColor;
            // section
            infoContainer.children[i + 1].style.opacity = 0.0;
            infoContainer.children[i + 1].style.visibility = 'hidden';
        });
    });

    const githubIcon = document.querySelector('.icon-github');
    const wechatIcon = document.querySelector('.icon-wechat');
    const qqIcon = document.querySelector('.icon-qq');
    const bilibiliIcon = document.querySelector('.icon-bilibili');
    const mailIcon = document.querySelector('.icon-mail');

    // over
    // TODO 改为大字背景
    githubIcon.addEventListener('mouseover', () => {
        iconInfo.innerHTML = 'GitHub';
    })
    wechatIcon.addEventListener('mouseover', () => {
        iconInfo.innerHTML = 'WeChat';
    })
    qqIcon.addEventListener('mouseover', () => {
        iconInfo.innerHTML = 'QQ';
    })
    bilibiliIcon.addEventListener('mouseover', () => {
        iconInfo.innerHTML = 'bilibili';
    })
    mailIcon.addEventListener('mouseover', () => {
        iconInfo.innerHTML = 'Mail';
    })

    // click
    wechatIcon.addEventListener('click', () => {
        copyToCilpboard('sakuramemory');
        iconInfo.innerHTML = '已复制微信号😊';
    })
    qqIcon.addEventListener('click', () => {
        copyToCilpboard('347670115');
        iconInfo.innerHTML = '已复制QQ号😊';
    })
    mailIcon.addEventListener('click', () => {
        copyToCilpboard('ceynri@gmail.com');
        iconInfo.innerHTML = '已复制邮箱😊';
    })
}
