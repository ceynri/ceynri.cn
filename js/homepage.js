'use strict';

// icons
(function () {

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
        wrapper.children[0].addEventListener('mouseover', function () {
            // icon
            this.style.opacity = 0.0;
            wrapper.children[1].style.opacity = 1.0;
            // text
            intro.style.opacity = 0.0;
        });

        wrapper.children[0].addEventListener('mouseout', function () {
            // icon
            this.style.opacity = 1.0;
            wrapper.children[1].style.opacity = 0.0;
            // text
            intro.style.opacity = 1.0;
            info.innerHTML = '';
        });
    }
    
    let info = document.getElementById('introInfo');
    let wechatInfo = '点击按钮复制微信号';
    let qqInfo = '点击按钮复制QQ号';

    // over
    githubIcon.addEventListener('mouseover', function () {
        githubIntro.style.opacity = 1.0;
    })
    wechatIcon.addEventListener('mouseover', function () {
        wechatIntro.style.opacity = 1.0;
        info.innerHTML = wechatInfo;
    })
    qqIcon.addEventListener('mouseover', function () {
        qqIntro.style.opacity = 1.0;
        info.innerHTML = qqInfo;
    })
    mailIcon.addEventListener('mouseover', function () {
        mailIntro.style.opacity = 1.0;
    })
    // out
    githubIcon.addEventListener('mouseout', function () {
        githubIntro.style.opacity = 0.0;
    })
    wechatIcon.addEventListener('mouseout', function () {
        wechatIntro.style.opacity = 0.0;
    })
    qqIcon.addEventListener('mouseout', function () {
        qqIntro.style.opacity = 0.0;
    })
    mailIcon.addEventListener('mouseout', function () {
        mailIntro.style.opacity = 0.0;
    })
    

})();
