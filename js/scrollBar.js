{
    // * 设置bodyBorder宽度
    // function getScrollbarWidth() {
    //     // * 获得滚动条宽度
    //     const elem = document.createElement('div');
    //     const styles = {
    //             width: '100px',
    //             height: '100px',
    //             overflowY: 'scroll', // 使其有滚动条
    //             position: 'absolute' // 移出文档流避免重绘
    //         };
    //     let scrollbarWidth;
    //     for (let i in styles) {
    //         elem.style[i] = styles[i];
    //     }
    //     document.body.appendChild(elem);
    //     scrollbarWidth = elem.offsetWidth - elem.clientWidth;
    //     elem.remove();
    //     return scrollbarWidth;
    // }

    // const bodyBorder = document.querySelector('.body-border');
    // bodyBorder.style.border = `#eee ${getScrollbarWidth()} solid`;
}
