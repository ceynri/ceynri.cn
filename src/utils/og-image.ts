import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';

import { SITE_TITLE } from '~/consts';

/**
 * OG 分享卡片生成：satori（JSX 对象树 → SVG）+ resvg-js（SVG → PNG）。
 *
 * 设计：Vercel 式浅色极简 —— 近白底 + 深色大标题 + 品牌 logo 图形，无多余装饰。
 * - 无封面：右下角 logo 线稿放大作品牌符号（像 Vercel 的三角形线稿）。
 * - 有封面：封面去噪后作右侧圆角图版当「配图」，标题居左。
 * - 标题用 textWrap:'balance' 智能断行：短标题一行、长标题自动平衡两行，
 *   避免「第二行只剩一两个字」的难看断行。
 * - 字体：英文/数字 Poppins（与站点自定义英文字体一致），中文思源黑体 Bold。
 *   satori 需静态 TTF/OTF，不支持 woff2 与 variable font。
 */

// satori 的 JSX 元素类型（无需引入 react，用纯对象树描述）
interface SatoriNode {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: SatoriNodeChild | SatoriNodeChild[];
    [key: string]: unknown;
  };
}
type SatoriNodeChild = SatoriNode | string | number | null;

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const DOMAIN = 'ceynri.cn';

// 浅色配色（jade 浅阶，取自 variables.css）
const COLORS = {
  bg: '#f6f9fd', // --jade-50 近白底
  title: '#1a1e22', // --jade-900 深标题
  body: '#34393e', // --jade-700 站点名
  muted: '#808890', // --jade-500 次要信息
};

// 字体缓存：构建期同一进程内复用，避免每篇重复读字体文件
interface Fonts {
  poppins700: Buffer;
  poppins600: Buffer;
  poppins500: Buffer;
  poppins400: Buffer;
  notoBold: Buffer;
  notoRegular: Buffer;
}
let fontsCache: Fonts | null = null;
async function loadFonts(): Promise<Fonts> {
  if (!fontsCache) {
    const dir = path.join(process.cwd(), 'src/assets/fonts/og');
    const [poppins700, poppins600, poppins500, poppins400, notoBold, notoRegular] = await Promise.all([
      readFile(path.join(dir, 'Poppins-Bold.ttf')),
      readFile(path.join(dir, 'Poppins-SemiBold.ttf')),
      readFile(path.join(dir, 'Poppins-Medium.ttf')),
      readFile(path.join(dir, 'Poppins-Regular.ttf')),
      readFile(path.join(dir, 'NotoSansSC-Bold.ttf')),
      readFile(path.join(dir, 'NotoSansSC-Regular.ttf')),
    ]);
    fontsCache = { poppins700, poppins600, poppins500, poppins400, notoBold, notoRegular };
  }
  return fontsCache;
}

// 站点 logo（favicon.png）：左上角小尺寸 + 右下品牌符号放大，缓存 data URI
let logoCache: { small: string; symbol: string } | null = null;
async function loadLogo() {
  if (!logoCache) {
    const buf = await readFile(path.join(process.cwd(), 'public/favicon.png'));
    const small = `data:image/png;base64,${buf.toString('base64')}`;
    const symbolBuf = await sharp(buf)
      .resize(680, 680, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const symbol = `data:image/png;base64,${symbolBuf.toString('base64')}`;
    logoCache = { small, symbol };
  }
  return logoCache;
}

export interface OgImageOptions {
  title: string;
  /** 形如 2026-04-18 的日期串，可空 */
  date?: string;
  /** 封面图版 data URI（去噪后），可空（无封面走 logo 符号版） */
  coverDataUri?: string;
}

/** 基准字号：短标题大、长标题小（给一行尽量放下留空间），配 balance 智能断行 */
function baseFontSize(title: string): number {
  const len = title.length;
  if (len > 26) return 56;
  if (len > 16) return 68;
  return 82;
}

const FONT_FAMILY = 'Poppins, Noto Sans SC';

/** 顶栏：logo + 站点名 ｜ 日期 */
function topBar(logoUri: string, date?: string): SatoriNode {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '14px' },
            children: [
              { type: 'img', props: { src: logoUri, width: 40, height: 40 } },
              {
                type: 'div',
                props: {
                  style: { fontSize: '24px', color: COLORS.body, letterSpacing: '1px', fontWeight: 500 },
                  children: SITE_TITLE,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: '22px', color: COLORS.muted, fontFamily: 'Poppins' },
            children: date ?? '',
          },
        },
      ],
    },
  };
}

/** 底栏：域名（中性灰，无装饰图形） */
function bottomBar(): SatoriNode {
  return {
    type: 'div',
    props: {
      style: { display: 'flex', alignItems: 'center' },
      children: {
        type: 'div',
        props: {
          style: { fontSize: '22px', color: COLORS.muted, fontFamily: 'Poppins', letterSpacing: '0.5px' },
          children: DOMAIN,
        },
      },
    },
  };
}

/** 构建 OG 卡片的 satori 元素树 */
function buildElement(options: OgImageOptions, logo: { small: string; symbol: string }): SatoriNode {
  const { title, date, coverDataUri } = options;
  const size = baseFontSize(title);

  const titleNode: SatoriNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flex: 1,
        fontSize: size,
        fontWeight: 700,
        color: COLORS.title,
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
        textWrap: 'balance',
      },
      children: title,
    },
  };

  // 中部：有封面时标题居左 + 封面右侧图版；无封面时标题独占 + 右下 logo 符号
  const middle: SatoriNode = coverDataUri
    ? {
        type: 'div',
        props: {
          style: { display: 'flex', flex: 1, alignItems: 'center', gap: '48px', paddingTop: '12px' },
          children: [
            titleNode,
            { type: 'img', props: { src: coverDataUri, width: 400, height: 400, style: { borderRadius: '12px', flexShrink: 0 } } },
          ],
        },
      }
    : {
        type: 'div',
        props: {
          style: { display: 'flex', flex: 1, alignItems: 'center', paddingTop: '8px', maxWidth: '980px' },
          children: titleNode,
        },
      };

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.bg,
        padding: '52px 64px 48px',
        fontFamily: FONT_FAMILY,
        position: 'relative',
      },
      children: [
        // 无封面时右下品牌符号（logo 线稿放大，极低存在感）
        ...(coverDataUri
          ? []
          : [{ type: 'img', props: { src: logo.symbol, width: 340, height: 340, style: { position: 'absolute', right: '24px', bottom: '-30px', opacity: 0.1 } } } as SatoriNode]),
        topBar(logo.small, date),
        middle,
        bottomBar(),
      ],
    },
  };
}

/** 生成一张 OG 卡片的 PNG Buffer */
export async function generateOgImage(options: OgImageOptions): Promise<Buffer> {
  const [fonts, logo] = await Promise.all([loadFonts(), loadLogo()]);
  const svg = await satori(buildElement(options, logo) as never, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Poppins', data: fonts.poppins700, weight: 700, style: 'normal' },
      { name: 'Poppins', data: fonts.poppins600, weight: 600, style: 'normal' },
      { name: 'Poppins', data: fonts.poppins500, weight: 500, style: 'normal' },
      { name: 'Poppins', data: fonts.poppins400, weight: 400, style: 'normal' },
      { name: 'Noto Sans SC', data: fonts.notoBold, weight: 700, style: 'normal' },
      { name: 'Noto Sans SC', data: fonts.notoRegular, weight: 400, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } });
  return Buffer.from(resvg.render().asPng());
}
