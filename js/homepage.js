'use strict';

// 将字符串复制到剪贴板
let _copyToCilpboard = (str) => {
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

// icons
(() => {

    let intro = document.getElementById('intro');
    let githubIntro = document.getElementById('githubIntro');
    let wechatIntro = document.getElementById('wechatIntro');
    let qqIntro = document.getElementById('qqIntro');
    let mailIntro = document.getElementById('mailIntro');

    let githubIcon = document.getElementsByClassName('icon-github')[0];
    let wechatIcon = document.getElementsByClassName('icon-wechat')[0];
    let qqIcon = document.getElementsByClassName('icon-qq')[0];
    let mailIcon = document.getElementsByClassName('icon-mail')[0];

    let iconWrappers = document.getElementsByClassName('icon-wrapper');

    for (let i = 0; i < iconWrappers.length; i++) {
        let wrapper = iconWrappers[i];
        wrapper.children[0].addEventListener('mouseover', () => {
            // icon
            wrapper.children[0].style.opacity = 0.0;
            wrapper.children[1].style.opacity = 1.0;
            // text
            intro.style.opacity = 0.0;
            info.style.opacity = 1.0;
        });

        wrapper.children[0].addEventListener('mouseout', () => {
            // icon
            wrapper.children[0].style.opacity = 1.0;
            wrapper.children[1].style.opacity = 0.0;
            // text
            intro.style.opacity = 1.0;
            info.style.opacity = 0.0;
        });
    }

    let info = document.getElementById('introInfo');

    // over
    githubIcon.addEventListener('mouseover', () => {
        githubIntro.style.opacity = 1.0;
        info.innerHTML = 'GitHub';
    })
    wechatIcon.addEventListener('mouseover', () => {
        wechatIntro.style.opacity = 1.0;
        info.innerHTML = 'WeChat 点击复制';
    })
    qqIcon.addEventListener('mouseover', () => {
        qqIntro.style.opacity = 1.0;
        info.innerHTML = 'QQ 点击复制';
    })
    mailIcon.addEventListener('mouseover', () => {
        mailIntro.style.opacity = 1.0;
        info.innerHTML = 'Mail';
    })
    // out
    githubIcon.addEventListener('mouseout', () => {
        githubIntro.style.opacity = 0.0;
    })
    wechatIcon.addEventListener('mouseout', () => {
        wechatIntro.style.opacity = 0.0;
    })
    qqIcon.addEventListener('mouseout', () => {
        qqIntro.style.opacity = 0.0;
    })
    mailIcon.addEventListener('mouseout', () => {
        mailIntro.style.opacity = 0.0;
    })
    // click
    wechatIcon.addEventListener('click', () => {
        _copyToCilpboard('WeChat: sakuramemory');
    })
    qqIcon.addEventListener('click', () => {
        _copyToCilpboard('QQ: 347670115');
    })
    mailIcon.addEventListener('click', () => {
        _copyToCilpboard('ceynri@gmail.com');
    })

})();

// 新页面从新标签页打开
(() => {
    let socIcons = document.getElementById('socialIcons');
    let aTags = socIcons.getElementsByTagName('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].target = '_blank';
    }
})();
