/**
 * @author ceynri
 */

'use strict';

// ? (()=>{})()写法和{}写法的区别

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

{
    // * 点击hero自动向下滚动页面
    const hero = document.querySelector('.hero');
    hero.addEventListener('click', () => {
        window.scrollTo(0, (document.documentElement.clientHeight || window.innerHeight));
    });
}

{
    // * 点击about-header区域向下滚30vh
    const aboutHeader = document.querySelector('.about-header');
    aboutHeader.addEventListener('click', () => {
        window.scrollBy(0, document.documentElement.clientHeight * .3);
    });
}

{
    // * 新页面从新标签页打开
    const aTags = document.querySelectorAll('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].target = '_blank';
    }
}
