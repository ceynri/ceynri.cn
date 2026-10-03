import {
  SHAPE_ATLAS as A,
  EDGE_SOFTNESS,
  FLOATS,
  FLOAT_GEOMETRY as G,
  GLINT_BOOST,
  LINE,
  LOOP_SECONDS,
  PALETTE,
  REFLECTION as R,
  RIPPLE,
  SPLASH,
  STEP_FPS,
  TEXTURE,
  UNDERWATER_GLOW,
  WATERLINE_FEATHER,
} from './config';

/** 数值转 GLSL 浮点字面量 */
function glFloat(value: number) {
  return Number.isInteger(value) ? value.toFixed(1) : String(value);
}

/**
 * 生成分段线性函数的 GLSL 函数体
 * @param points 递增的 [x, y] 控制点
 * @param below x 小于首个控制点时的斜率
 * @param slope 为 true 时返回所在分段的斜率而非函数值
 */
function glPiecewise(points: readonly (readonly [number, number])[], below: number, slope = false) {
  const lines: string[] = [];
  const [x0, y0] = points[0];
  lines.push(
    `if (x < ${glFloat(x0)}) {\n    return ${slope ? glFloat(below) : `${glFloat(y0)} + (x - ${glFloat(x0)}) * ${glFloat(below)}`};\n  }`,
  );
  for (let i = 1; i < points.length; i++) {
    const [xa, ya] = points[i - 1];
    const [xb, yb] = points[i];
    const k = (yb - ya) / (xb - xa);
    const body = slope ? glFloat(k) : `${glFloat(ya)} + (x - ${glFloat(xa)}) * ${glFloat(k)}`;
    lines.push(i < points.length - 1 ? `if (x < ${glFloat(xb)}) {\n    return ${body};\n  }` : `return ${body};`);
  }
  return lines.join('\n  ');
}

/** #rrggbb 转 GLSL vec3 字面量 */
function glColor(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return `vec3(${channels.map((c) => (c / 255).toFixed(5)).join(', ')})`;
}

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * 生成片元着色器：几何、配色等常量由 config 注入
 * @param precision 片元着色器浮点精度（设备不支持 highp 时降级为 mediump）
 */
export function createFragmentShader(precision: 'highp' | 'mediump') {
  const n = FLOATS.length;
  const drawFps = STEP_FPS > 0 ? STEP_FPS : 12;
  const drawCount = LOOP_SECONDS * drawFps;
  const boilCells = drawCount / R.boil.hold;
  if (!Number.isInteger(drawCount) || !Number.isInteger(boilCells)) {
    throw new Error('night-fishing: LOOP_SECONDS × 作画帧率须为 REFLECTION.boil.hold 的整数倍');
  }
  const mirror = R.mirror;
  const inverse = mirror.map(([h, v]) => [v, h] as const);
  const [mirrorTopY, mirrorTopV] = mirror[mirror.length - 1];
  // 落水涟漪更明显的一侧：浮漂从竿梢一侧落回，涟漪偏向另一侧
  const rippleSide = FLOATS.map(
    (f, i) => `if (index < ${i}.5) {\n    return ${f.rodOffset < 0 ? '1.0' : '-1.0'};\n  }`,
  ).join('\n  ');
  return /* glsl */ `
precision ${precision} float;

uniform vec4 uFrame;        // xy：画布尺寸（设备像素）；z：循环内时间（秒，已按作画帧率量化）；w：颗粒种子
uniform float uScale;       // 场景缩放（设备像素 / 参考像素）
uniform sampler2D uShape;   // 浮漂轮廓距离场图集
uniform vec4 uPose[${n}];    // xy：浮漂旋转中心（设备像素，y 向下）；z：缩放；w：倾角（弧度，逆时针为正）
uniform vec4 uWater[${n}];   // x：倒影中心 x；y：水线 y（设备像素）；z：下沉量（参考像素，离水时为极大值以关闭倒影）；w：倒影种子
uniform vec4 uEvent;        // x：咬钩中的浮漂序号（<0 为无）；y：轴向拉伸；z：拖影强度；w：水花已持续的时间（秒，<0 为无）
uniform vec4 uTrail;        // xy：拖影起点；zw：水花中心（设备像素）
uniform vec4 uLineA;        // xy：竿梢；zw：上段终点（发光头或入水点）
uniform vec4 uLineB;        // xy：下段终点；z：上段弯曲；w：下段弯曲
uniform vec4 uLineC;        // x：不透明度；yz：上段断开的参数区间；w：是否有下段
uniform vec4 uRipple;       // xy：落水涟漪中心（设备像素）；z：已持续的时间（秒，<0 为无）；w：水面扰动强度
uniform vec4 uAir;          // xy：空中倒影中心（设备像素）；z：强度；w：散开程度

const int FLOAT_COUNT = ${n};
const int SPLASH_COUNT = ${SPLASH.count};
const float TAU = 6.28318530718;
const float LOOP = ${glFloat(LOOP_SECONDS)};
const float EDGE_SOFTNESS = ${glFloat(EDGE_SOFTNESS)};
const float DRAW_FPS = ${glFloat(drawFps)};
const float DRAW_COUNT = ${glFloat(drawCount)};
const bool STEPPED = ${STEP_FPS > 0};

const vec3 SEA = ${glColor(PALETTE.sea)};
const vec3 HALO = ${glColor(PALETTE.halo)};
const vec3 STICK = ${glColor(PALETTE.stick)};
const vec3 STICK_LINE = ${glColor(PALETTE.stickLine)};
const vec3 TIP_RING = ${glColor(PALETTE.tipRing)};
const vec3 TIP_CORE = ${glColor(PALETTE.tipCore)};
const vec3 CORAL = ${glColor(PALETTE.coral)};
const vec3 CREAM = ${glColor(PALETTE.cream)};
const vec3 GLINT = ${glColor(PALETTE.glint)};
const vec3 CONTACT = ${glColor(PALETTE.contact)};
const vec3 REFL_NEAR = ${glColor(PALETTE.reflectionNear)};
const vec3 REFL_MID = ${glColor(PALETTE.reflectionMid)};
const vec3 REFL_FAR = ${glColor(PALETTE.reflectionFar)};
const vec3 LINE_COLOR = ${glColor(PALETTE.line)};
const vec3 SPLASH_COLOR = ${glColor(PALETTE.splash)};

const float TIP_TINT_Y0 = ${glFloat(G.tipTint.y0)};
const float TIP_TINT_Y1 = ${glFloat(G.tipTint.y1)};
const float TIP_CORE_FROM = ${glFloat(G.tipCoreFrom)};
const float STICK_LINE_Y0 = ${glFloat(G.stickLine.y0)};
const float STICK_LINE_Y1 = ${glFloat(G.stickLine.y1)};
const float STICK_LINE_W = ${glFloat(G.stickLine.width)};
const float HALO_TAIL = ${glFloat(G.haloTail)};
const float GLINT_X = ${glFloat(G.glint.x)};
const float GLINT_Y = ${glFloat(G.glint.y)};
const float GLINT_RX = ${glFloat(G.glint.rx)};
const float GLINT_RY = ${glFloat(G.glint.ry)};
const vec4 GLINT_LOBE = vec4(${[G.glint.lobe.x, G.glint.lobe.y, G.glint.lobe.rx, G.glint.lobe.ry].map(glFloat).join(', ')});
const float FLOAT_TOP = ${glFloat(G.height)};
const float PIVOT = ${glFloat(G.pivot)};
const float TRAIL_RADIUS = 13.0;

const vec2 SHAPE_MIN = vec2(${glFloat(A.bounds.x0)}, ${glFloat(A.bounds.y0)});
const vec2 SHAPE_SIZE = vec2(${glFloat(A.bounds.x1 - A.bounds.x0)}, ${glFloat(A.bounds.y1 - A.bounds.y0)});
const float SHAPE_SPREAD = ${glFloat(A.spread)};
const float FLOAT_COUNT_F = ${glFloat(n)};

const float M_Y3 = ${glFloat(mirrorTopY)};
const float M_V3 = ${glFloat(mirrorTopV)};
const float BLOCK_TOP_Y = ${glFloat(R.block.top)};
const int BLOCK_BLOBS = ${R.block.blobs};
const vec2 BLOCK_Y = vec2(${R.block.y.map(glFloat).join(', ')});
const vec2 BLOCK_RX = vec2(${R.block.rx.map(glFloat).join(', ')});
const vec2 BLOCK_RY = vec2(${R.block.ry.map(glFloat).join(', ')});
const float BLOCK_STEP = ${glFloat(R.block.step)};
const vec2 BLOCK_STACK = vec2(${R.block.stack.map(glFloat).join(', ')});
const float REFL_LEAN = ${glFloat(R.lean)};
const float REFL_SWAY = ${glFloat(R.sway)};
const float BOIL_HOLD = ${glFloat(R.boil.hold)};
const float BOIL_DRIFT = ${glFloat(R.boil.drift)};
const float BOIL_CELLS = ${glFloat(boilCells)};
const float WAVE_LENGTH = ${glFloat(R.wave.length)};
const float WAVE_NEAR = ${glFloat(R.wave.near)};
const float WAVE_FAR = ${glFloat(R.wave.far)};
const float PITCH = ${glFloat(R.rowPitch)};
const float FRAG_START = ${glFloat(R.fragmentStart)};
const float DEPTH_RANGE = ${glFloat(mirrorTopV + 20)};
const float FADE_DEPTH = ${glFloat(R.fadeDepth)};
const float MID_SPARSITY = ${glFloat(R.midSparsity)};
const float FAR_SPARSITY = ${glFloat(R.farSparsity)};
const float JITTER_NEAR = ${glFloat(R.jitterNear)};
const float JITTER_FAR = ${glFloat(R.jitterFar)};
const float HW_NEAR = ${glFloat(R.halfWidthNear)};
const float HW_FAR = ${glFloat(R.halfWidthFar)};
const float THICK_NEAR = ${glFloat(R.thickNear)};
const float SLANT = ${glFloat(R.slant)};
const float ZIGZAG = ${glFloat(R.zigzag)};
const float AGITATE_JITTER = ${glFloat(R.agitation.jitter)};
const float AGITATE_SHRINK = ${glFloat(R.agitation.shrink)};
const float AGITATE_SPARSITY = ${glFloat(R.agitation.sparsity)};
const float AGITATE_BLOCK = ${glFloat(R.agitation.blockShrink)};
const float AGITATE_WOBBLE = ${glFloat(R.agitation.wobble)};

const float RIPPLE_LIFE = ${glFloat(RIPPLE.life)};
const float RIPPLE_R0 = ${glFloat(RIPPLE.radius[0])};
const float RIPPLE_R1 = ${glFloat(RIPPLE.radius[1])};
const float RIPPLE_ASPECT = ${glFloat(RIPPLE.aspect)};
const int RIPPLE_DAUBS = ${RIPPLE.daubs};
const vec2 RIPPLE_SIDE = vec2(${RIPPLE.side.map(glFloat).join(', ')});
const vec2 RIPPLE_BOTTOM = vec2(${RIPPLE.bottom.map(glFloat).join(', ')});
const float GLINT_LIFE = ${glFloat(GLINT_BOOST.life)};
const float GLINT_SCALE = ${glFloat(GLINT_BOOST.scale)};
const vec2 GLINT_OFFSET = vec2(${glFloat(GLINT_BOOST.offset[0])}, ${glFloat(GLINT_BOOST.offset[1])});
const vec4 GLOW_RANGE = vec4(${UNDERWATER_GLOW.range.map(glFloat).join(', ')});
const vec2 GLOW_CENTER = vec2(${UNDERWATER_GLOW.center.map(glFloat).join(', ')});
const vec2 GLOW_OUTER = vec2(${UNDERWATER_GLOW.outer.map(glFloat).join(', ')});
const vec2 GLOW_INNER = vec2(${UNDERWATER_GLOW.inner.map(glFloat).join(', ')});

const float LINE_W = ${glFloat(LINE.width)};

const float SPLASH_LIFE = ${glFloat(SPLASH.life)};
const float SPLASH_GRAVITY = ${glFloat(SPLASH.gravity)};
const float SPLASH_SPREAD = ${glFloat(SPLASH.spread)};
const float SPLASH_SPEED_MIN = ${glFloat(SPLASH.speedMin)};
const float SPLASH_SPEED_MAX = ${glFloat(SPLASH.speedMax)};
const float SPLASH_R_MIN = ${glFloat(SPLASH.radiusMin)};
const float SPLASH_R_MAX = ${glFloat(SPLASH.radiusMax)};

const float GRAIN = ${glFloat(TEXTURE.grain)};
const float SWELL = ${glFloat(TEXTURE.swell)};
const float SWELL_SPACING = ${glFloat(TEXTURE.swellSpacing)};

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// 由有向距离求覆盖率：d < 0 为内部，aa 为过渡宽度
float fill(float d, float aa) {
  return clamp(0.5 - d / aa, 0.0, 1.0);
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// 竖直胶囊：中轴线段 [y0, y1]，半径 r
float sdCapsuleV(vec2 p, float y0, float y1, float r) {
  p.y -= clamp(p.y, y0, y1);
  return length(p) - r;
}

// 蛋形：胶囊两端的半圆分别按拱高 top / bottom 拉伸或压扁
float sdEggV(vec2 p, float y0, float y1, float r, float top, float bottom) {
  if (p.y > y1) {
    p.y = y1 + (p.y - y1) * r / top;
  } else if (p.y < y0) {
    p.y = y0 + (p.y - y0) * r / bottom;
  }
  return sdCapsuleV(p, y0, y1, r);
}

// 椭圆近似距离
float sdEllipse(vec2 p, vec2 r) {
  p += 0.001;
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return length(pa - ba * h);
}

// 读取第 index 支浮漂的四层有向距离（参考像素）：光晕、剪影、发光区、亮芯
vec4 shapeAt(vec2 f, float index) {
  vec2 uv = (f - SHAPE_MIN) / SHAPE_SIZE;
  // 越界时不能读到图集里相邻浮漂的格子
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
    return vec4(SHAPE_SPREAD);
  }
  // 图集按画布行序（自上而下）上传，纹理 t=0 对应轮廓顶部
  uv = vec2((uv.x + index) / FLOAT_COUNT_F, 1.0 - uv.y);
  return (texture2D(uShape, uv) * 255.0 - 128.0) * SHAPE_SPREAD / 127.0;
}

// 光晕：平涂带 + 外侧逐渐淡出的余晖；strength 控制余晖强度
float haloAlpha(float d, float aa, float strength) {
  float tail = exp(-max(d, 0.0) * 3.0 / HALO_TAIL) * (1.0 - smoothstep(HALO_TAIL * 0.8, HALO_TAIL * 1.2, d));
  return max(fill(d, aa), 0.72 * strength * tail);
}

// 发光头顶端的世界坐标
vec2 tipPosition(vec4 pose, float stretch) {
  return pose.xy + vec2(-sin(pose.w), -cos(pose.w)) * (FLOAT_TOP - PIVOT) * stretch * pose.z;
}

// 浮漂部位高度 → 平静时的倒影深度：浮体一段被压扁成实色块，细杆与发光头一段被拉长
float mirrorDepth(float x) {
  ${glPiecewise(mirror, R.gapScale)}
}

// 平静时的倒影深度 → 浮漂部位高度
float mirrorHeight(float x) {
  ${glPiecewise(inverse, 1 / R.gapScale)}
}

// 露出水面的高度 → 倒影总长度
float reflectionReach(float x) {
  ${glPiecewise(R.reach, 0)}
}

// 一维值噪声，取值 [-1, 1]
float valueNoise(float x, float key) {
  float i = floor(x);
  float f = x - i;
  f = f * f * (3.0 - 2.0 * f);
  return 2.0 * mix(hash11(i * 3.17 + key), hash11(i * 3.17 + 3.17 + key), f) - 1.0;
}

// 纵向连贯的横向错位场（约 [-1, 1]）：同一张作画里沿深度 y 是一条平滑曲线；
// 每 BOIL_HOLD 张换一条新曲线并在其间插值，曲线随时间以 BOIL_DRIFT 下漂
float waveField(float y, float drawing, float key) {
  float s = drawing / BOIL_HOLD;
  float j = floor(s);
  float f = s - j;
  f = f * f * (3.0 - 2.0 * f);
  float a = valueNoise((y - BOIL_DRIFT * (drawing - j * BOIL_HOLD)) / WAVE_LENGTH, key + mod(j, BOIL_CELLS) * 7.31);
  float b = valueNoise((y - BOIL_DRIFT * (drawing - (j + 1.0) * BOIL_HOLD)) / WAVE_LENGTH, key + mod(j + 1.0, BOIL_CELLS) * 7.31);
  // 两条独立曲线插值时起伏会变小，按权重归一
  return mix(a, b, f) / sqrt(1.0 - 2.0 * f * (1.0 - f));
}

// 水下倒影：只镜像露出水面的部分。
// 浮体倒影按部位镜像，没入水中的一段消失、其余贴住水线；细杆碎片保持平静时的疏密，随浮体倒影的缩短整体上移，
// 并在倒影总长度处截断——浮漂下沉时倒影变短，只剩发光头时只余正下方的一小团。
// 原片的倒影每张作画都重画一遍：色块形状逐张随机，各深度沿同一条错位曲线左右错开，整串因此上下连贯
vec3 drawReflection(vec3 col, vec2 p, vec4 water, float scale, float tilt, float index, float agitation, float aa, float theta, float drawing) {
  float sink = water.z;
  float reach = reflectionReach(M_Y3 - sink);
  if (reach <= 0.0) {
    return col;
  }
  vec2 r = vec2(p.x - water.x, p.y - water.y) / scale;
  if (r.y < -aa || abs(r.x) > 200.0 || r.y > reach + 30.0) {
    return col;
  }
  float mask = clamp(r.y / aa + 0.5, 0.0, 1.0);
  float seed = water.w;
  float key = mod(floor(drawing + 0.5), DRAW_COUNT);
  float sway = REFL_SWAY * (0.45 * sin(5.0 * theta + TAU * fract(seed * 0.37)) + 0.75 * waveField(0.0, drawing, seed * 5.3));
  float wave = mix(WAVE_NEAR, WAVE_FAR, smoothstep(0.0, DEPTH_RANGE * 0.6, r.y)) * (1.0 + AGITATE_JITTER * agitation)
    * waveField(r.y, drawing, seed * 11.0);
  float x = r.x - sway - wave;
  // 倾斜时，浮漂上越高的部位离轴线越远，倒影随之横移（按原片减弱）
  float lean = sin(clamp(tilt, -1.2, 1.2)) * REFL_LEAN;

  // 浮体倒影：自上而下几团圆润色块叠在一起，越往下越暗、越窄，左右错开；
  // 自下而上绘制，较亮的上层压住下层，亮暗分界随团块边缘弯曲。u 为平静时的等效深度，浮漂下沉时上层先没入水线。
  // 每张作画整串时而收拢成一团、时而拉长断开
  float u = r.y + mirrorDepth(sink);
  float stack = mix(BLOCK_STACK.x, BLOCK_STACK.y, hash11(seed * 5.1 + key * 1.37));
  if (u < BLOCK_Y.x + (BLOCK_Y.y - BLOCK_Y.x) * stack + BLOCK_RY.y * 1.15 + 8.0) {
    float step = BLOCK_STEP * (1.0 + agitation);
    for (int b = BLOCK_BLOBS - 1; b >= 0; b--) {
      float fb = float(b);
      float t = fb / float(BLOCK_BLOBS - 1);
      float hb = hash11(seed * 31.0 + fb * 3.7 + key * 0.913);
      float hc = hash11(seed * 17.0 + fb * 5.3 + key * 1.771);
      float hd = hash11(seed * 23.0 + fb * 2.9 + key * 2.357);
      float cy = BLOCK_Y.x + (BLOCK_Y.y - BLOCK_Y.x) * t * stack + (hc - 0.5) * 6.0;
      float rx = mix(BLOCK_RX.x, BLOCK_RX.y, t * sqrt(t)) * (0.8 + 0.4 * hb) * (1.0 - AGITATE_BLOCK * agitation);
      float ry = mix(BLOCK_RY.x, BLOCK_RY.y, t) * (0.85 + 0.3 * hc);
      float cx = -mirrorHeight(cy) * lean + step * (2.0 * hd - 1.0);
      vec2 q = vec2(x - cx, u - cy);
      // 顶部略平
      if (q.y < 0.0) {
        q.y *= 1.15;
      }
      float d = sdEllipse(q, vec2(rx, ry))
        + ry * 0.18 * (1.0 + AGITATE_WOBBLE * agitation) * sin(q.x / rx * (2.5 + 1.5 * hd) + TAU * hb);
      vec3 tone = t < 0.2 ? REFL_NEAR : (t < 0.5 ? mix(REFL_NEAR, REFL_MID, 0.5) : (t < 0.8 ? REFL_MID : REFL_FAR));
      col = mix(col, tone, fill(d, aa) * mask);
    }
  }

  // 碎片的上移量：浮体倒影缩短了多少就上移多少（浮体完全没入后不再变化）
  float shift = mirrorDepth(min(sink, BLOCK_TOP_Y));
  float uf = r.y + shift;
  // 每张作画的碎片行整体错开一段，碎片不会总落在同一组深度上
  float grid = PITCH * hash11(seed * 3.1 + key * 0.731);
  float row = floor((uf + grid) / PITCH);
  for (int k = -1; k <= 1; k++) {
    float i = row + float(k);
    float yc = (i + 0.5) * PITCH - grid;
    float vc = yc - shift;
    if (yc < FRAG_START || yc > M_V3 || vc > reach) {
      continue;
    }
    float h0 = seed * 97.0 + i * 7.13 + key * 13.37;
    float h1 = hash11(h0 + 0.11);
    float h2 = hash11(h0 + 0.23);
    float h3 = hash11(h0 + 0.37);
    float h4 = hash11(h0 + 0.41);
    float h5 = hash11(h0 + 0.53);
    float h6 = hash11(h0 + 0.67);
    float h7 = hash11(h0 + 0.71);
    float h8 = hash11(h0 + 0.89);
    float h9 = hash11(h0 + 0.97);
    float h10 = hash11(h0 + 1.13);
    float h11 = hash11(h0 + 1.29);

    // 碎片的出现与消失：深处阈值更高；水面受扰动时更稀疏；越接近倒影末端越稀疏
    float threshold = mix(-0.3, MID_SPARSITY, smoothstep(FRAG_START, FRAG_START + 30.0, yc))
      + (FAR_SPARSITY - MID_SPARSITY) * smoothstep(FADE_DEPTH - 20.0, FADE_DEPTH + 40.0, yc)
      + AGITATE_SPARSITY * agitation
      + 0.6 * smoothstep(reach - 40.0, reach, vc);
    float grow = smoothstep(threshold, threshold + 0.2, h1);
    if (grow <= 0.0) {
      continue;
    }

    float jitter = mix(JITTER_NEAR, JITTER_FAR, smoothstep(0.0, DEPTH_RANGE * 0.6, yc)) * (1.0 + AGITATE_JITTER * agitation);
    float cx = -mirrorHeight(yc) * lean + jitter * 0.9 * (2.0 * h7 - 1.0);
    float hw = mix(HW_NEAR, HW_FAR, smoothstep(0.0, DEPTH_RANGE * 0.7, yc))
      * (0.45 + 0.7 * h2) * grow * (1.0 - AGITATE_SHRINK * agitation);
    // 多数是扁平的团块，少数是高团块；厚度不低于宽度的一定比例，避免出现细线
    // 近处的团块更厚；厚度上限保证团块不超出相邻两行的计算范围
    float hh = PITCH * mix(0.22, 0.7, h3 * h3 * sqrt(h3)) * (0.6 + 0.4 * h11) * mix(0.6, 1.0, grow)
      * mix(THICK_NEAR, 1.0, smoothstep(FRAG_START + 20.0, FADE_DEPTH - 100.0, yc));
    hh = min(max(hh, max(hw * 0.22, 3.5)), PITCH * 0.8);
    // 原片的碎片都是横向扁长的
    hw = max(hw, hh * 1.6);
    float cy = yc + (h4 - 0.5) * PITCH * 0.4;
    // 越高的团块越不倾斜，避免扭成竖向的 S 形
    float slant = SLANT * (2.0 * h5 - 1.0) * hw / (hw + 2.0 * hh);

    vec2 f = vec2(x - cx - (uf - cy) * slant, uf - cy);
    // 顶部略平
    if (f.y < 0.0) {
      f.y *= 1.0 + 0.45 * h6;
    }
    // 颜料涂抹般的团块：主体 + 两个错位的小瓣，边缘低频起伏
    float dist = sdEllipse(f, vec2(hw, hh));
    vec2 lobe1 = vec2(hw * mix(0.35, 0.6, h4), hh * mix(0.6, 1.0, h5));
    dist = smin(dist, sdEllipse(f - vec2((h2 - 0.5) * 1.3 * hw, (h3 - 0.5) * 0.9 * hh), vec2(max(lobe1.x, lobe1.y), lobe1.y)), hh * 0.6);
    vec2 lobe2 = vec2(hw * mix(0.25, 0.45, h8), hh * mix(0.5, 0.85, h10));
    dist = smin(dist, sdEllipse(f - vec2((h7 - 0.5) * 1.5 * hw, (h1 - 0.5) * 0.8 * hh), vec2(max(lobe2.x, lobe2.y), lobe2.y)), hh * 0.5);
    dist += hh * 0.15 * sin(f.x / hw * (2.0 + 2.5 * h5) + TAU * h9);
    // 部分扁平碎片旁边还有一团，横向错开、用细桥连成台阶状
    if (h9 < ZIGZAG && hh < hw * 0.45) {
      float lobeH = hh * 0.75;
      vec2 offset = vec2((h10 < 0.5 ? -0.9 : 0.9) * hw, (h8 < 0.5 ? -0.7 : 0.7) * hh);
      dist = smin(dist, sdEllipse(f - offset, vec2(max(hw * 0.55, lobeH), lobeH)), hh * 0.7);
    }
    col = mix(col, REFL_FAR, fill(dist, aa) * mask);
  }
  return col;
}

// 空中的浮漂映在水面上的一团倒影：spread 为 0 时融成一串竖长的团块，为 1 时散成一簇
vec3 drawAirReflection(vec3 col, vec2 p, vec4 air, float seed, float scale, float aa) {
  if (air.z <= 0.0) {
    return col;
  }
  vec2 r = (p - air.xy) / scale;
  if (abs(r.x) > 180.0 || r.y < -170.0 || r.y > 150.0) {
    return col;
  }
  float spread = air.w;
  float d = 1e9;
  for (int k = 0; k < 7; k++) {
    float fk = float(k);
    float h1 = hash11(seed * 11.0 + fk * 1.7);
    float h2 = hash11(seed * 13.0 + fk * 2.3);
    float h3 = hash11(seed * 17.0 + fk * 3.1);
    float h4 = hash11(seed * 19.0 + fk * 4.7);
    // 竖长的一串上细下粗；散开时收成一簇
    vec2 c = vec2((h2 - 0.5) * mix(24.0, 90.0, spread) + 10.0 * sin(fk * 1.3 + seed), mix(-120.0 + fk * 34.0, -60.0 + fk * 22.0, spread) + (h1 - 0.5) * 12.0);
    vec2 radius = vec2(mix(mix(13.0, 27.0, fk / 6.0), 20.0, spread) * (0.75 + 0.5 * h3), mix(24.0, 13.0, spread) * (0.75 + 0.5 * h4));
    vec2 f = r - c;
    float blob = sdEllipse(f, radius) + radius.y * 0.1 * sin(f.x * 0.1 + f.y * 0.08 + TAU * h1);
    d = smin(d, blob, mix(18.0, 7.0, spread));
  }
  return mix(col, REFL_FAR, fill(d, aa) * air.z);
}

// 落水涟漪的偏向：+1 为右侧更明显
float rippleSide(float index) {
  ${rippleSide}
  return 1.0;
}

// 落水涟漪：沿水线下扩张的扁椭圆排布的涂抹团块；下缘宽而扁、连成断续的横带，入水一侧连到水面，另一侧只剩零星小团
vec3 drawRipple(vec3 col, vec2 p, vec4 ripple, float side, float seed, float scale, float aa) {
  float age = ripple.z;
  if (age < 0.0 || age > RIPPLE_LIFE) {
    return col;
  }
  vec2 r = (p - ripple.xy) / scale;
  float e = age / RIPPLE_LIFE;
  float rx = mix(RIPPLE_R0, RIPPLE_R1, 1.0 - (1.0 - e) * (1.0 - e));
  float ry = rx * RIPPLE_ASPECT;
  vec2 c = vec2(0.0, ry * 0.9);
  if (r.y < -aa || abs(r.x) > rx + 40.0 || r.y > c.y + ry + 40.0) {
    return col;
  }
  float d = 1e9;
  for (int k = 0; k < RIPPLE_DAUBS; k++) {
    float fk = float(k);
    float h1 = hash11(seed * 7.0 + fk * 1.31);
    float h2 = hash11(seed * 9.0 + fk * 2.17);
    float h3 = hash11(seed * 5.0 + fk * 3.73);
    // 角度：0 为入水一侧，π/2 为下缘，π 为另一侧
    float a = mix(-0.35, 3.3, (fk + h1 * 0.8) / float(RIPPLE_DAUBS));
    float far = smoothstep(0.2, -0.6, cos(a));
    if (far > 0.5 && h3 < 0.5) {
      continue;
    }
    float bottom = smoothstep(0.2, 0.9, sin(a));
    float size = (1.0 - 0.6 * far) * (0.7 + 0.6 * h2) * (1.0 - 0.3 * e);
    vec2 radius = mix(RIPPLE_SIDE, RIPPLE_BOTTOM, bottom) * size;
    vec2 center = c + vec2(cos(a) * side * rx, sin(a) * ry) + (vec2(h2, h3) - 0.5) * 8.0;
    // 沿椭圆切线方向拉长
    vec2 tangent = normalize(vec2(-sin(a) * side * rx, cos(a) * ry));
    vec2 q = r - center;
    vec2 local = vec2(dot(q, tangent), dot(q, vec2(-tangent.y, tangent.x)));
    float blob = sdEllipse(local, radius) + radius.y * 0.2 * sin(local.x * 0.1 + TAU * h3);
    d = smin(d, blob, 8.0);
  }
  float fade = 1.0 - smoothstep(0.65, 1.0, e);
  vec3 tone = mix(REFL_MID, REFL_FAR, smoothstep(12.0, 30.0, abs(r.x)));
  return mix(col, tone, fill(d, aa) * fade * clamp(r.y / aa + 0.5, 0.0, 1.0));
}

// 浮体刚没入水面时，它的光把细杆周围的一小片水面照亮
vec3 drawGlow(vec3 col, vec2 p, vec4 water, float scale, float aa) {
  float sink = water.z;
  vec2 g = vec2(p.x - water.x, water.y - p.y) / scale;
  if (abs(g.x) > 90.0 || abs(g.y) > 90.0) {
    return col;
  }

  float submerged = sink / FLOAT_TOP;
  float glow = smoothstep(GLOW_RANGE.x, GLOW_RANGE.y, submerged) * (1.0 - smoothstep(GLOW_RANGE.z, GLOW_RANGE.w, submerged));
  if (glow > 0.0) {
    vec2 q = g - GLOW_CENTER;
    col = mix(col, REFL_MID, fill(sdEllipse(q, GLOW_OUTER), aa) * glow);
    col = mix(col, REFL_NEAR, fill(sdEllipse(q, GLOW_INNER), aa) * glow);
  }

  return col;
}

// 提竿、落水时从浮体朝远离发光头的方向拉出、逐渐收尖的红色速度线
vec3 drawTrail(vec3 col, vec2 p, vec2 from, vec2 to, float strength, float scale, float aa) {
  if (strength <= 0.0) {
    return col;
  }
  vec2 pa = p - from;
  vec2 ba = to - from;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1.0), 0.0, 1.0);
  float dist = length(pa - ba * h) / scale;
  float radius = mix(2.0, TRAIL_RADIUS, sqrt(h));
  col = mix(col, HALO, haloAlpha(dist - radius - 6.0, aa, 1.0) * strength);
  return mix(col, STICK, fill(dist - radius, aa) * strength);
}

// 二次贝塞尔曲线的控制点：bow 为相对弦长的弯曲量，正值向弦的右侧（屏幕坐标下行方向的右手边）鼓出
vec2 bowControl(vec2 a, vec2 b, float bow) {
  vec2 dir = b - a;
  return 0.5 * (a + b) + vec2(dir.y, -dir.x) * bow;
}

// 到二次贝塞尔曲线的距离与最近点的曲线参数
vec2 bezierDistance(vec2 p, vec2 a, vec2 c, vec2 b) {
  float best = 1e9;
  float bestT = 0.0;
  vec2 prev = a;
  for (int k = 1; k <= 16; k++) {
    float t = float(k) / 16.0;
    vec2 point = mix(mix(a, c, t), mix(c, b, t), t);
    vec2 pa = p - prev;
    vec2 ba = point - prev;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
    float d = length(pa - ba * h);
    if (d < best) {
      best = d;
      bestT = (float(k) - 1.0 + h) / 16.0;
    }
    prev = point;
  }
  return vec2(best, bestT);
}

// 钓鱼线：上段从竿梢到发光头（或入水点），可在中间断开；下段是被一并带出水面的线
vec3 drawLine(vec3 col, vec2 p, float scale, float aa) {
  if (uLineC.x <= 0.0) {
    return col;
  }
  vec2 rod = uLineA.xy;
  vec2 end = uLineA.zw;
  vec2 ctrl = bowControl(rod, end, uLineB.z);
  vec2 lo = min(min(rod, end), ctrl);
  vec2 hi = max(max(rod, end), ctrl);
  vec2 tailCtrl = bowControl(end, uLineB.xy, uLineB.w);
  if (uLineC.w > 0.5) {
    lo = min(lo, min(uLineB.xy, tailCtrl));
    hi = max(hi, max(uLineB.xy, tailCtrl));
  }
  vec2 margin = vec2(8.0 * scale);
  if (any(lessThan(p, lo - margin)) || any(greaterThan(p, hi + margin))) {
    return col;
  }
  vec2 upper = bezierDistance(p, rod, ctrl, end);
  float dist = (upper.y < uLineC.y || upper.y > uLineC.z) ? upper.x : 1e9;
  if (uLineC.w > 0.5) {
    dist = min(dist, bezierDistance(p, end, tailCtrl, uLineB.xy).x);
  }
  return mix(col, LINE_COLOR, fill(dist / scale - LINE_W * 0.5, aa) * uLineC.x);
}

// 水上的浮漂本体：四层轮廓依次平涂
vec3 drawBody(vec3 col, vec2 p, vec4 pose, vec4 water, float index, float stretch, float boost, float aa, float drawing) {
  vec2 d = p - pose.xy;
  vec2 q = vec2(d.x, -d.y) / pose.z;
  float c = cos(pose.w);
  float s = sin(pose.w);
  vec2 f = vec2(c * q.x + s * q.y, -s * q.x + c * q.y);
  f.y = f.y / stretch + PIVOT;
  if (any(lessThan(f, SHAPE_MIN)) || any(greaterThan(f, SHAPE_MIN + SHAPE_SIZE))) {
    return col;
  }
  float depth = (water.y - p.y) / pose.z;
  // 接触处是扁椭圆，底边落在水线以下，起伏时鱼漂底部仍包在椭圆里
  float ax = clamp(abs(f.x) / 42.0, 0.0, 1.0);
  float rim = 18.0 * sqrt(max(0.0, 1.0 - ax * ax));
  float above = smoothstep(0.0, ${glFloat(WATERLINE_FEATHER)}, depth + rim);
  if (above <= 0.0 && depth < -8.0) {
    return col;
  }
  vec4 shape = shapeAt(f, index);

  // 光晕平涂带越厚余晖越明显：细杆两侧的光晕只是一圈描边，不带余晖
  col = mix(col, HALO, haloAlpha(shape.x, aa, smoothstep(2.0, 6.0, shape.y - shape.x)) * above);

  // 接触光晕画在本体之下：实心椭圆被鱼漂挡住，只露出贴着分界的一圈，本身不被水线裁开
  float glintAlpha = (1.0 - smoothstep(30.0, 90.0, -water.z)) * (1.0 - smoothstep(120.0, 220.0, water.z));
  float key = mod(floor(drawing + 0.5), DRAW_COUNT);
  float hg = hash11(water.w * 7.3 + key * 1.93);
  float hl = hash11(water.w * 3.9 + key * 2.71);
  float ring = sdEllipse(f - vec2(GLINT_X + (hg - 0.5) * 6.0, GLINT_Y + (hl - 0.5) * 6.0), vec2(GLINT_RX * (0.92 + 0.16 * hl), GLINT_RY * (0.85 + 0.45 * hg)));
  float k = (0.55 + 0.75 * hl) * (1.0 + (GLINT_SCALE - 1.0) * boost);
  float lobe = sdEllipse(f - GLINT_LOBE.xy - GLINT_OFFSET * boost, GLINT_LOBE.zw * k);
  float glint = fill(smin(ring, lobe, 4.0), aa) * glintAlpha;
  col = mix(col, mix(GLINT, REFL_MID, 0.6 * boost), glint);

  float line = fill(abs(shape.y - STICK_LINE_W * 0.5) - STICK_LINE_W * 0.5, aa)
    * step(0.0, f.x) * step(STICK_LINE_Y0, f.y) * step(f.y, STICK_LINE_Y1);
  col = mix(col, STICK_LINE, line * above);

  // 发光头一段偏橙；紧挨发光区的红色被映得略偏珊瑚色
  vec3 red = mix(STICK, TIP_RING, smoothstep(TIP_TINT_Y0, TIP_TINT_Y1, f.y));
  red = mix(red, CORAL, 0.35 * (1.0 - smoothstep(0.0, 5.0, shape.z)));
  col = mix(col, red, fill(shape.y, aa) * above);
  // 浮体下缘贴着水面的一段被映成更深的珊瑚红，与外侧被照亮的水面连成一圈
  vec3 lit = mix(CORAL, CONTACT, fill(ring, aa) * glintAlpha);
  col = mix(col, lit, fill(shape.z, aa) * above);
  vec3 cream = f.y > TIP_CORE_FROM ? TIP_CORE : CREAM;
  return mix(col, cream, fill(shape.w, aa) * above);
}


// 水花：从水面溅起、按抛物线飞散后落下的水滴
vec3 drawSplash(vec3 col, vec2 p, vec2 origin, float age, float seed, float scale, float aa) {
  if (age < 0.0 || age > SPLASH_LIFE || length(p - origin) > 1400.0 * scale) {
    return col;
  }
  for (int k = 0; k < SPLASH_COUNT; k++) {
    float key = float(k) + seed * 13.0;
    float h1 = hash11(key * 1.31 + 0.5);
    float h2 = hash11(key * 2.17 + 0.3);
    float h3 = hash11(key * 3.73 + 0.9);
    float h4 = hash11(key * 5.11 + 0.2);
    vec2 velocity = vec2((2.0 * h1 - 1.0) * SPLASH_SPREAD, -mix(SPLASH_SPEED_MIN, SPLASH_SPEED_MAX, h2));
    float t = age * mix(0.7, 1.0, h4);
    vec2 center = origin + (velocity * t + vec2(0.0, 0.5 * SPLASH_GRAVITY * t * t)) * scale;
    vec2 dir = normalize(velocity + vec2(0.001, SPLASH_GRAVITY * t));
    float radius = mix(SPLASH_R_MIN, SPLASH_R_MAX, h3 * h3) * (1.0 - smoothstep(0.5, 1.0, age / SPLASH_LIFE));
    vec2 rel = (p - center) / scale;
    vec2 local = vec2(dot(rel, dir), dot(rel, vec2(-dir.y, dir.x)));
    // 不规则的水团：主体加一个错位的小瓣
    float drop = sdEllipse(local, vec2(radius * 1.25 + 0.5, radius * 0.85 + 0.5));
    vec2 lobe = vec2(h1 - 0.5, h4 - 0.5) * radius * 1.4;
    drop = smin(drop, sdEllipse(local - lobe, vec2(radius * 0.6 + 0.5, radius * 0.5 + 0.5)), radius * 0.5);
    col = mix(col, SPLASH_COLOR, fill(drop, aa));
  }
  return col;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uFrame.y - gl_FragCoord.y);
  float theta = TAU * uFrame.z / LOOP;
  // 作画序号：倒影与水面交界的色块逐张重画
  float drawing = STEPPED ? mod(floor(uFrame.z * DRAW_FPS + 0.5), DRAW_COUNT) : uFrame.z * DRAW_FPS;

  // 极弱的斜向涌浪明暗带
  float u = (p.x + p.y) * 0.70710678 / (SWELL_SPACING * uScale);
  float swell = 0.6 * sin(TAU * u - 3.0 * theta) + 0.4 * sin(TAU * u * 0.53 + 2.0 * theta + 1.3);
  vec3 col = SEA + vec3(0.1, 0.45, 0.8) * swell * SWELL / 255.0;

  for (int i = 0; i < FLOAT_COUNT; i++) {
    float index = float(i);
    vec4 pose = uPose[i];
    vec4 water = uWater[i];
    bool active = index == uEvent.x;
    float stretch = active ? uEvent.y : 1.0;
    float aa = max(EDGE_SOFTNESS, 1.0 / pose.z);
    float boost = 0.0;
    if (active && uRipple.z >= 0.0) {
      col = drawRipple(col, p, uRipple, rippleSide(index), water.w, pose.z, aa);
      boost = 1.0 - smoothstep(0.0, GLINT_LIFE, uRipple.z);
    }
    col = drawGlow(col, p, water, pose.z, aa);
    if (active) {
      col = drawAirReflection(col, p, uAir, water.w, pose.z, aa);
      col = drawTrail(col, p, uTrail.xy, pose.xy, uEvent.z, pose.z, aa);
      col = drawLine(col, p, pose.z, aa);
    }
    col = drawBody(col, p, pose, water, index, stretch, boost, aa, drawing);
    col = drawReflection(col, p, water, pose.z, pose.w, index, active ? uRipple.w : 0.0, aa, theta, drawing);
    if (active) {
      col = drawSplash(col, p, uTrail.zw, uEvent.w, index + fract(uTrail.z * 0.0137), pose.z, aa);
    }
  }

  col += (hash21(p + uFrame.w * 61.7) - 0.5) * GRAIN / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;
}
