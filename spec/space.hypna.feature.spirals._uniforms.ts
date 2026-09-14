/**
 * Live uniform state for one WebGL spiral pipeline.
 *
 * Both spiral features (webgl and customgl) expose the same uniforms to the
 * shader: colours, spin/throb/zoom. This rig owns the *current* value of each
 * of those, uploads them to the GL program, and lets them be changed after
 * launch — instantly or eased over a number of milliseconds — so YSS can drive
 * the spiral on the fly (`[setting.spiral.zoom=2;fade=3000]`).
 *
 * Only the tiny slice of WebGLRenderingContext that is actually used is
 * required, so the rig can be exercised in unit tests with a fake context.
 */
export interface SpiralUniformGl {
  getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null;
  uniform1f(location: WebGLUniformLocation | null, x: number): void;
  uniform2f(location: WebGLUniformLocation | null, x: number, y: number): void;
  uniform3fv(location: WebGLUniformLocation | null, v: Float32List): void;
  uniform4fv(location: WebGLUniformLocation | null, v: Float32List): void;
}

/** Spec/YSS setting name -> GLSL uniform name for the built-in variables. */
export const SPIRAL_STANDARD_UNIFORMS: Record<string, string> = {
  spiral_color: 'spiralColor',
  bg_color: 'bgColor',
  spin_speed: 'spinSpeed',
  throb_speed: 'throbSpeed',
  throb_strength: 'throbStrength',
  zoom: 'zoom',
};

interface Transition {
  from: number[];
  to: number[];
  start: number;
  duration: number;
}

/** Parse a YSS/spec value into a numeric vector: `#rrggbb` (-> rgb 0..1),
 *  a single number, or comma/space separated components. Returns null when
 *  nothing numeric could be read. */
export function parseSpiralValue(raw: any): number[] | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return isFinite(raw) ? [raw] : null;
  if (Array.isArray(raw)) {
    const nums = raw.map((x) => parseFloat(x));
    return nums.length > 0 && nums.every((n) => isFinite(n)) ? nums : null;
  }
  const text = String(raw).trim();
  if (text === '') return null;

  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const out: number[] = [];
    for (let i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16) / 255);
    return out.slice(0, 3);
  }

  const parts = text.split(/[,\s]+/).filter((p) => p.length > 0).map((p) => parseFloat(p));
  return parts.length > 0 && parts.every((n) => isFinite(n)) ? parts : null;
}

export class SpiralUniformRig {
  private readonly locations: Record<string, WebGLUniformLocation | null> = {};
  private readonly values: Record<string, number[]> = {};
  private readonly transitions: Record<string, Transition> = {};

  constructor(
    private readonly gl: SpiralUniformGl,
    private readonly program: WebGLProgram,
  ) {}

  /** Resolve `name` (a setting name such as `spin_speed`, or a raw GLSL
   *  uniform name for author-declared uniforms) to a uniform location. */
  private locate(name: string): WebGLUniformLocation | null {
    const glName = SPIRAL_STANDARD_UNIFORMS[name] ?? name;
    if (!(glName in this.locations)) {
      this.locations[glName] = this.gl.getUniformLocation(this.program, glName);
    }
    return this.locations[glName];
  }

  private upload(name: string, v: number[]): void {
    const loc = this.locate(name);
    if (loc === null) return; // shader does not declare it; WebGL ignores null anyway
    switch (v.length) {
      case 1: this.gl.uniform1f(loc, v[0]); break;
      case 2: this.gl.uniform2f(loc, v[0], v[1]); break;
      case 3: this.gl.uniform3fv(loc, v); break;
      default: this.gl.uniform4fv(loc, v.slice(0, 4)); break;
    }
  }

  /** Current value of a variable (null if never set). */
  get(name: string): number[] | null {
    return this.values[name] ? this.values[name].slice() : null;
  }

  /**
   * Set a variable. `fadeMs > 0` eases from the current value to `value`
   * over that many milliseconds (driven by `frame()`); otherwise it applies
   * immediately. Returns false when `value` is unusable.
   */
  set(name: string, value: any, fadeMs: number = 0, now: number = performance.now()): boolean {
    const target = parseSpiralValue(value);
    if (!target) return false;

    const current = this.values[name];
    if (fadeMs > 0 && current && current.length === target.length) {
      this.transitions[name] = { from: current.slice(), to: target, start: now, duration: fadeMs };
      return true;
    }
    delete this.transitions[name];
    this.values[name] = target;
    this.upload(name, target);
    return true;
  }

  /** Advance any running fades. Call once per rendered frame. */
  frame(now: number = performance.now()): void {
    for (const name of Object.keys(this.transitions)) {
      const t = this.transitions[name];
      const p = Math.min(1, Math.max(0, (now - t.start) / t.duration));
      // smoothstep so a fade lands softly instead of snapping at the end
      const s = p * p * (3 - 2 * p);
      const v = t.to.map((to, i) => t.from[i] + (to - t.from[i]) * s);
      this.values[name] = v;
      this.upload(name, v);
      if (p >= 1) delete this.transitions[name];
    }
  }

  /** True while any fade is still in progress. */
  get busy(): boolean {
    return Object.keys(this.transitions).length > 0;
  }
}
