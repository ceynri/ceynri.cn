<div align="center">
  <h1>山风的小角落</h1>
  <p>实验性质个人主页 / 注重动画交互 / <a href="http://ceynri.cn/" target="_blank">ceynri.cn</a></p>
  <img src="https://i.loli.net/2020/02/28/VhjGPQi5S7HRpgy.jpg" alt="封面"/>
</div>

<br>
<br>

## 介绍

山风的小角落是我以兴趣驱动编写的个人主页，实现了一些个人比较喜欢的动画交互效果，欢迎访问它，希望能给你带来“有点意思”的印象。

如果有可以改进的意见和建议（设计、用户体验甚至代码更好的写法都可以）欢迎提交 issue；如果页面出现了某些 bug，允许我道个歉并希望你能提供 bug 内容、bug 发生时的行为、所使用的平台和浏览器等相关信息。

<br>

## 兼容性

| Chrome | Firefox | Mircosoft Edge | Internet Explorer |
| :----: | :-----: | :------------: | :---------------: |
|   O    |    O    |       ×        |         ×         |

> 开发时以 Chrome 浏览器为主，并尽量兼容了 Firefox。在 Edge 上遇到了性能问题故表现较差，不推荐使用。
> 
> 暂未进行更多详细的兼容性测试。

## 更多细节

### 一些文字

很多内容写完后放在一个 README 里太长，且大家一般不感兴趣，故不在这里展开。我将内容分为了三个部分，有兴趣了解本项目、听我碎碎念的同学可以点击下面的梗概查看文章🐟

- 🚩 做完这个页面，有些想说和想记录的**感受**：

> [在一开始的编写过程中，我有时会因为自己终于实现了一个炫酷地新效果感到巨大的喜悦，但很快又会意识到我所花费的时间和我当前的完成度，会不会让别人感到不成正比。确实，在不断地栽跟头中，我经常会不自主地拿别人的网站完成度和自己现有的完成度进行......](./article/summary.md)

- 🔨 关于页面实现所**用到的技术**，我简单的带过了一遍（内容过多，不好将所有的实现细节都展开来讲）：

> [滚动效果方面分为了平滑滚动、渐变滚动和视差滚动三个部分，分别负责不同的效果。其中，平滑滚动的实现是将整个页面的所有内容作为一个元素包裹起来并且不予 body 元素绑定，即浏览器窗口滚动时，并不会造成页面的滚动，从而屏蔽默认的滚动效果......](./article/technical-points.md)

- 🎨 虽然是半吊子水平，我也来强答一波本站的**设计思路和设计细节**：

> [暗示是对某特点与某效果之间的关系进行间接的绑定的手法，一般用于大家普遍默认的关系。注意，非常浅显的图形标识或者文字标识当然不算暗示，信息量更小的特点被称为暗示更加合适。例如绿色常常用来暗示正确，红色往往被当作错误警告，这是颜色的暗示......](./article/design-ideas.md)

<br>

### 动图展示

因为在文章中插动图非常影响阅读的注意力，所以关于页面交互效果的动图演示被整合起来放在下面。

（由于 gif 图较大，如果出现加载不出来的情况可以尝试点击动图的标题单独加载图片）

1. [圆形光标的双层结构](https://i.loli.net/2020/02/27/GCj84SvNfqRQFcY.gif)

    ![cursor-move.gif](https://i.loli.net/2020/02/27/GCj84SvNfqRQFcY.gif)

2. [光标样式变化](https://i.loli.net/2020/02/27/xFQikNLCJOXHgsA.gif)

    ![cursor-transform.gif](https://i.loli.net/2020/02/27/xFQikNLCJOXHgsA.gif)

3. [视差浮动效果](https://i.loli.net/2020/02/27/hu5I7tTRLCzqD1F.gif)（红色粗线条、标题与背景的移动距离不同）

    ![float.gif](https://i.loli.net/2020/02/27/hu5I7tTRLCzqD1F.gif)

4. [向下滚动的指引](https://i.loli.net/2020/02/27/M5REnATWa4kOXhg.gif)

    ![page-down.gif](https://i.loli.net/2020/02/27/M5REnATWa4kOXhg.gif)

5. [红-青颜色渐变动画](https://i.loli.net/2020/02/27/1xKfrjNCFnvEBi4.gif)

    ![color-transition.gif](https://i.loli.net/2020/02/27/1xKfrjNCFnvEBi4.gif)

6. [ABOUT 可以进行点击交互](https://i.loli.net/2020/02/27/HNCbyFKarpom4YQ.gif)（发现了么）

    ![about-click.gif](https://i.loli.net/2020/02/27/HNCbyFKarpom4YQ.gif)

7. [视差滚动（左右两栏向上滚动的速度不一样） & 渐入渐出滚动（透明度变化）](https://i.loli.net/2020/02/27/c6V8JRixWQ4AgIK.gif)

    ![parallax-fade-scroll.gif](https://i.loli.net/2020/02/27/c6V8JRixWQ4AgIK.gif)

8. [3D 透视交互](https://i.loli.net/2020/02/27/1YWfMpsOVdlz68T.gif)

    ![3d-transition.gif](https://i.loli.net/2020/02/27/1YWfMpsOVdlz68T.gif)

9. [喷气式飞行员 CSS 动画 + JS 鼠标交互](https://i.loli.net/2020/02/27/HEhTJ8PBZe7d5CO.gif)

    ![flying-man.gif](https://i.loli.net/2020/02/27/HEhTJ8PBZe7d5CO.gif)

10. [可以拖动的 works 栏与进度条](https://i.loli.net/2020/02/27/fPLZaG59rtlxp8X.gif)

    ![draggable-elem.gif](https://i.loli.net/2020/02/27/fPLZaG59rtlxp8X.gif)

11. [拖动超过内容区域后的回弹动画](https://i.loli.net/2020/02/27/TSYQwcb3AeiVn8v.gif)

    ![drag-rebound.gif](https://i.loli.net/2020/02/27/TSYQwcb3AeiVn8v.gif)

12. [“揭底”效果的底部栏](https://i.loli.net/2020/02/27/1rXCWzGTmnSgQqF.gif)

    ![footer.gif](https://i.loli.net/2020/02/27/1rXCWzGTmnSgQqF.gif)

<br>

## 许可

[MIT License](./LICENSE)

<br>
