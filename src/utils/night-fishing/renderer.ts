import { createFragmentShader, VERTEX_SHADER } from './shader';
import type { ShapeAtlas } from './shape-atlas';

/** 单帧绘制所需的 uniform 数据（各分量含义见着色器中的 uniform 注释） */
export interface FrameUniforms {
  /** 循环内的时间（秒） */
  time: number;
  /** 颗粒噪声种子 */
  grainSeed: number;
  /** 场景缩放（设备像素 / 参考像素） */
  scale: number;
  /** 每支浮漂：旋转中心、缩放、倾角 */
  pose: Float32Array;
  /** 每支浮漂：倒影中心、水线、下沉量（离水时为极大值）、倒影种子 */
  water: Float32Array;
  /** 咬钩事件：浮漂序号、轴向拉伸、拖影强度、水花已持续时间 */
  event: Float32Array;
  /** 拖影起点、水花中心 */
  trail: Float32Array;
  /** 钓鱼线：竿梢、上段终点 */
  lineA: Float32Array;
  /** 钓鱼线：下段终点、上段弯曲、下段弯曲 */
  lineB: Float32Array;
  /** 钓鱼线：不透明度、断开区间、是否有下段 */
  lineC: Float32Array;
  /** 落水涟漪中心、已持续时间、水面扰动强度 */
  ripple: Float32Array;
  /** 空中倒影中心、强度、散开程度 */
  air: Float32Array;
}

type UniformName =
  | 'frame'
  | 'scale'
  | 'shape'
  | 'pose'
  | 'water'
  | 'event'
  | 'trail'
  | 'lineA'
  | 'lineB'
  | 'lineC'
  | 'ripple'
  | 'air';

const UNIFORMS: Record<UniformName, string> = {
  frame: 'uFrame',
  scale: 'uScale',
  shape: 'uShape',
  pose: 'uPose',
  water: 'uWater',
  event: 'uEvent',
  trail: 'uTrail',
  lineA: 'uLineA',
  lineB: 'uLineB',
  lineC: 'uLineC',
  ripple: 'uRipple',
  air: 'uAir',
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('无法创建着色器');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`着色器编译失败：${log}`);
  }
  return shader;
}

/**
 * 夜钓场景的 WebGL 渲染器：整幅画面由一个全屏三角形 + 片元着色器绘制
 */
export class NightFishingRenderer {
  private readonly gl: WebGLRenderingContext;
  private readonly locations: Record<UniformName, WebGLUniformLocation | null>;

  /**
   * 创建渲染器
   * @param atlas 浮漂轮廓距离场图集
   * @returns 设备不支持 WebGL 或着色器编译失败时返回 null
   */
  static create(canvas: HTMLCanvasElement, atlas: ShapeAtlas) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    });
    if (!gl) {
      return null;
    }
    try {
      return new NightFishingRenderer(gl, atlas);
    } catch (error) {
      console.warn('[night-fishing]', error);
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext, atlas: ShapeAtlas) {
    this.gl = gl;

    const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    const precision = highp && highp.precision > 0 ? 'highp' : 'mediump';

    const program = gl.createProgram();
    if (!program) {
      throw new Error('无法创建着色器程序');
    }
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, createFragmentShader(precision)));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`着色器程序链接失败：${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);

    // 覆盖整个裁剪空间的单个三角形
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // 距离场图集：线性插值，不预乘 alpha（alpha 通道存的是亮芯距离而非透明度）
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, atlas.width, atlas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, atlas.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.locations = Object.fromEntries(
      Object.entries(UNIFORMS).map(([key, name]) => [key, gl.getUniformLocation(program, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;
    gl.uniform1i(this.locations.shape, 0);
  }

  /** 设置绘制缓冲尺寸（设备像素） */
  resize(width: number, height: number) {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
  }

  /** 绘制一帧 */
  render(frame: FrameUniforms) {
    const gl = this.gl;
    const locations = this.locations;
    gl.uniform4f(locations.frame, gl.drawingBufferWidth, gl.drawingBufferHeight, frame.time, frame.grainSeed);
    gl.uniform1f(locations.scale, frame.scale);
    gl.uniform4fv(locations.pose, frame.pose);
    gl.uniform4fv(locations.water, frame.water);
    gl.uniform4fv(locations.event, frame.event);
    gl.uniform4fv(locations.trail, frame.trail);
    gl.uniform4fv(locations.lineA, frame.lineA);
    gl.uniform4fv(locations.lineB, frame.lineB);
    gl.uniform4fv(locations.lineC, frame.lineC);
    gl.uniform4fv(locations.ripple, frame.ripple);
    gl.uniform4fv(locations.air, frame.air);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
