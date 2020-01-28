{
    // 状态值
    const NORMAL = 0; // 一般状态
    const ACTIVE = 1; // 活跃状态（可交互元素）
    const LINKED = 2; // 放在链接上时
    const SCROLLED = 3; // 放在可横向滚动的部分上时

    class Cursor {
        // * 光标类

        constructor(cursor, cursorSize, easeVal) {
            this.cursor = cursor;
            this.cursorSize = cursorSize;

            this.easeVal = easeVal;

            this.targetX = 0;
            this.targetY = 0;

            this.state = NORMAL;

            this.init();
        }

        init() {
            this.cursor.style.width = this.cursor.style.height = `${this.cursorSize}px`;

            this.initEvent();
        }
        initEvent() {
            document.addEventListener("mousemove", (e) => {
                this.onCursor(e);
            });
        }
        onCursor(e) {
            if (this.state != NORMAL) {
                this.cursorSize = this.cursor.getBoundingClientRect().width;
            }

            this.targetX = e.clientX - this.cursorSize / 2;
            this.targetY = e.clientY - this.cursorSize / 2;

            TweenLite.to(this.cursor, this.easeVal, {
                x: this.targetX,
                y: this.targetY
            });
        }
    }

    // 初始值
    const cursor = document.querySelector('.cursor');
    const cursorSize = 35;
    const easeVal = .25;

    new Cursor(cursor, cursorSize, easeVal);
}
