/**
 * 一些比较短的代码，收纳于此
 */

'use strict';

// ? (()=>{})()写法和{}写法的区别

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
    // * 加载时间超过5秒，提示刷新
    setTimeout(() => {
        let loadingText = document.querySelector('.loader .overlay.loading .loading-text');
        if (loadingText) {
            loadingText.innerHTML = '加载过慢？尝试刷新页面😥';
        }
        // 释放引用以允许垃圾内存回收
        loadingText = null;
    }, 5000);
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
    }, {
        passive: true
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
        // 点击about-header区域向下滚30vh
        aboutHeader.addEventListener('click', () => {
            window.scrollBy(0, document.documentElement.clientHeight * .3);
        }, {
            passive: true
        });
    }
}

{
    // * 新页面从新标签页打开
    const aTags = document.querySelectorAll('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].target = '_blank';
    }
}
