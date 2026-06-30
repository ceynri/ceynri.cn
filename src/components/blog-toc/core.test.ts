import { describe, expect, it } from 'vitest';

import {
  buildSections,
  clamp,
  clamp01,
  computeBandCenter,
  computeLineFills,
  computeProgress,
  computeTrackOffset,
  type LineGeometry,
} from './core';

describe('clamp / clamp01', () => {
  it('钳制到区间', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(-0.2)).toBe(0);
  });
});

describe('buildSections', () => {
  it('相邻标题构成区间，末章右界取正文底', () => {
    const sections = buildSections(
      [
        { slug: 'a', top: 100 },
        { slug: 'b', top: 300 },
        { slug: 'c', top: 600 },
      ],
      1000,
    );
    expect(sections).toEqual([
      { slug: 'a', top: 100, bottom: 300 },
      { slug: 'b', top: 300, bottom: 600 },
      { slug: 'c', top: 600, bottom: 1000 },
    ]);
  });

  it('空标题列表返回空', () => {
    expect(buildSections([], 1000)).toEqual([]);
  });

  it('单标题：区间为 [top, bodyBottom]', () => {
    expect(buildSections([{ slug: 'only', top: 200 }], 800)).toEqual([{ slug: 'only', top: 200, bottom: 800 }]);
  });

  it('防御负高度：bottom 不小于 top', () => {
    const sections = buildSections([{ slug: 'x', top: 500 }], 100);
    expect(sections[0].bottom).toBe(500);
  });
});

describe('computeLineFills', () => {
  const sections = buildSections(
    [
      { slug: 'a', top: 0 },
      { slug: 'b', top: 1000 },
      { slug: 'c', top: 2000 },
    ],
    3000,
  );

  // 工具：仅取真正可见（零宽以上）的线
  const visible = (fills: { slug: string; start: number; end: number }[]) => fills.filter((f) => f.end > f.start);

  it('始终为每条线返回确定值（不跳过离屏章节）', () => {
    const fills = computeLineFills(sections, 1200, 1800);
    expect(fills.map((f) => f.slug)).toEqual(['a', 'b', 'c']);
  });

  it('单章节占满屏：仅该线可见整段，其余收敛为零宽', () => {
    // 视口完全落在 b 区间内
    const fills = computeLineFills(sections, 1200, 1800);
    const map = new Map(fills.map((f) => [f.slug, f]));
    expect(map.get('a')).toMatchObject({ start: 1, end: 1 }); // a 在视口上方 → 贴右端零宽
    expect(map.get('b')).toMatchObject({ start: 0.2, end: 0.8 });
    expect(map.get('c')).toMatchObject({ start: 0, end: 0 }); // c 在视口下方 → 贴左端零宽
    expect(visible(fills).map((f) => f.slug)).toEqual(['b']);
  });

  it('跨章节交界：上一章高亮右端、下一章高亮左端，比例与可见部分一致', () => {
    // 视口 [800, 1400] 跨 a 末尾与 b 开头
    const fills = computeLineFills(sections, 800, 1400);
    const map = new Map(fills.map((f) => [f.slug, f]));
    expect(map.get('a')).toMatchObject({ start: 0.8, end: 1 }); // a 右端
    expect(map.get('b')).toMatchObject({ start: 0, end: 0.4 }); // b 左端
    expect(visible(fills).map((f) => f.slug)).toEqual(['a', 'b']);
  });

  it('超长章节内滚动：子区段随滚动从左向右移动', () => {
    const long = buildSections([{ slug: 'long', top: 0 }], 4000); // 区间高 4000，远超一屏
    const early = computeLineFills(long, 0, 800)[0];
    const later = computeLineFills(long, 2000, 2800)[0];
    expect(early).toMatchObject({ start: 0, end: 0.2 });
    expect(later).toMatchObject({ start: 0.5, end: 0.7 });
    expect(later.start).toBeGreaterThan(early.start); // 越往下滚，子区段整体右移
  });

  it('一屏含三章节：三条线同时可见（顶右端 / 中整段 / 底左端）', () => {
    // 视口 [900, 2100] 同时覆盖 a 末尾、整个 b、c 开头
    const fills = computeLineFills(sections, 900, 2100);
    const map = new Map(fills.map((f) => [f.slug, f]));
    expect(map.get('a')).toMatchObject({ start: 0.9, end: 1 });
    expect(map.get('b')).toMatchObject({ start: 0, end: 1 });
    expect(map.get('c')).toMatchObject({ start: 0, end: 0.1 });
    expect(visible(fills).map((f) => f.slug)).toEqual(['a', 'b', 'c']);
  });

  it('离屏收敛：视口在所有章节之上 → 全部 [0,0]；在所有章节之下 → 全部 [1,1]', () => {
    const below = computeLineFills(sections, -800, -200); // 视口尚在全部章节上方（未抵达）
    expect(below.every((f) => f.start === 0 && f.end === 0)).toBe(true);
    expect(visible(below)).toHaveLength(0);

    const above = computeLineFills(sections, 5000, 5800); // 视口已滚过全部章节
    expect(above.every((f) => f.start === 1 && f.end === 1)).toBe(true);
    expect(visible(above)).toHaveLength(0);
  });
});

describe('computeBandCenter', () => {
  const lines: LineGeometry[] = [
    { slug: 'a', top: 0, height: 10 },
    { slug: 'b', top: 20, height: 10 },
    { slug: 'c', top: 40, height: 10 },
  ];

  it('取首末高亮线之间的跨度中点', () => {
    // 高亮 a、b → 跨度 [0, 30] → 中点 15
    expect(computeBandCenter(lines, new Set(['a', 'b']))).toBe(15);
  });

  it('单条高亮线：中点取该线中心', () => {
    expect(computeBandCenter(lines, new Set(['b']))).toBe(25);
  });

  it('无高亮线返回 null', () => {
    expect(computeBandCenter(lines, new Set())).toBeNull();
  });
});

describe('computeTrackOffset', () => {
  it('内容不超过可视区：恒为 0（不滚动）', () => {
    expect(computeTrackOffset(100, 600, 400)).toBe(0);
  });

  it('中段：高亮带中点居中', () => {
    // viewportH/2 - bandCenter = 300 - 500 = -200，落在 [minOffset,0] 内
    expect(computeTrackOffset(500, 600, 1200)).toBe(-200);
  });

  it('开头阶段：钉顶（offset = 0）', () => {
    // 期望 desired = 300 - 100 = 200 > 0 → 钳到 0
    expect(computeTrackOffset(100, 600, 1200)).toBe(0);
  });

  it('结尾阶段：沉底（offset = minOffset）', () => {
    // contentH=1200, viewportH=600 → minOffset = -600
    // bandCenter 接近底部 1150 → desired = 300 - 1150 = -850 < -600 → 钳到 -600
    expect(computeTrackOffset(1150, 600, 1200)).toBe(-600);
  });

  it('bandCenter 为 null：返回 0', () => {
    expect(computeTrackOffset(null, 600, 1200)).toBe(0);
  });
});

describe('computeProgress', () => {
  it('焦点位于正文顶 → 0%', () => {
    // 正文 [1000, 5000]，焦点 = scrollY + innerH/2 = 1000
    expect(computeProgress(200, 1600, 1000, 5000)).toBe(0);
  });

  it('焦点位于正文底 → 100%', () => {
    // 焦点 = 4200 + 800 = 5000 = bodyBottom
    expect(computeProgress(4200, 1600, 1000, 5000)).toBe(1);
  });

  it('焦点位于正文中点 → 50%', () => {
    // 焦点 = 2200 + 800 = 3000，正文中点 (1000+5000)/2 = 3000
    expect(computeProgress(2200, 1600, 1000, 5000)).toBe(0.5);
  });

  it('焦点越过正文底（评论/页脚区域）→ 钳为 100%，不超过也不回退', () => {
    expect(computeProgress(9000, 1600, 1000, 5000)).toBe(1);
  });

  it('正文范围非法（span ≤ 0）→ 0', () => {
    expect(computeProgress(100, 800, 500, 500)).toBe(0);
  });
});
