/**
 * 一些比较短的代码，收纳于此
 */

'use strict';

{
    // 2020.4.4公祭日 主页灰度化处理
    if ((new Date() + '').includes('Sat Apr 04 2020')) {
        document.documentElement.setAttribute('style', 'filter: grayscale(100%)');
    }
}

{
    // * 在head标签中添加theme-color meta标签
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--themeColor').trim() || '#333333';
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', themeColor);
    const head = document.querySelector('head');
    head.append(meta);
}

{
    
    // * 加载时间超过一定时间，提示刷新
    const TIMEOUT_THRESHOLD = 10;
    setTimeout(() => {
        let loadingText = document.querySelector('.loader .overlay.loading .loading-text');
        if (loadingText) {
            loadingText.innerHTML = '加载过慢？尝试刷新页面😥';
        }
    }, TIMEOUT_THRESHOLD * 1000);
}

{
    // * 设置hero日期
    const month = document.querySelector('.date .month');
    const day = document.querySelector('.date .day');

    const currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();
    currentMonth = (currentMonth > 9) ? currentMonth : ('0' + currentMonth);
    currentDay = (currentDay > 9) ? currentDay : ('0' + currentDay);
    month.innerHTML = currentMonth;
    day.innerHTML = currentDay;
}

if (!MediaMatcher.isTouchScreenDevice()) {
    // * 点击hero自动向下滚动页面
    const hero = document.querySelector('.hero');
    hero.addEventListener('click', () => {
        window.scrollTo(0, (document.documentElement.clientHeight || window.innerHeight));
    });
}

{
    // * 生成about-header
    const aboutHeader = document.querySelector('.about-header');
    const textNum = 42;
    for (let i = 0; i < textNum; i++) {
        const text = document.createElement('span');
        text.append('ABOUT');
        aboutHeader.append(text);
    }
    aboutHeader.children[textNum - 1].classList.add('full-text');
    if (!MediaMatcher.isTouchScreenDevice()) {
        // 点击about-header区域向下滚50vh
        aboutHeader.addEventListener('click', () => {
            window.scrollBy(0, document.documentElement.clientHeight * .5);
        });
    }
}

{
    // * 图片延迟加载
    window.addEventListener('load', () => {
        const qrcodes = document.querySelectorAll('.qrcode');
        qrcodes.forEach(qrcode => {
            qrcode.setAttribute('src', qrcode.getAttribute('data-src'));
        })
    })
}

{
    // * 新页面从新标签页打开
    const aTags = document.querySelectorAll('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].target = '_blank';
    }
}
