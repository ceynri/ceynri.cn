/**
 * @author ceynri
 */

'use strict';

/* TODO LIST
 * title 渐入动画
 * let -> const
 */

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
    // * 新页面从新标签页打开
    const aTags = document.querySelectorAll('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].target = '_blank';
    }
}

{
    // * 点击guideLine滚动页面
    // let guideLine = document.querySelector('.guide-line');
    // guideLine.addEventListener('click', () => {
    //     // pass
    // })
}
