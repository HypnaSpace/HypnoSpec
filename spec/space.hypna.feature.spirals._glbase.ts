import {FeatureBase} from "./space.hypna.feature._base";
import {fitSpiralCanvasToViewport} from "./space.hypna.feature.spirals._viewport";
import {SpiralUniformRig, SPIRAL_STANDARD_UNIFORMS} from "./space.hypna.feature.spirals._uniforms";
import {YssSpiralTarget} from "../custom/yuuk-space-script-parser.service";

/**
 * Shared machinery for the WebGL spirals (`spirals.webgl` with its baked-in
 * shader, `spirals.customgl` with an author-supplied one).
 *
 * Mounts the `#spiral-holder` overlay and the `#webgl-spiral-holder` canvas
 * (plus `#webgl-spiral-holder-2` for the second eye in VR), compiles the
 * shader, seeds the standard uniforms from the feature configuration and runs
 * one render loop per canvas.
 *
 * Every pipeline keeps a {@link SpiralUniformRig}, and the feature registers
 * itself with the YSS parser as the live spiral, so `[setting.spiral.*]`
 * commands (and anything else holding a reference) can change colours, speeds,
 * zoom, opacity or any custom uniform after launch — instantly or eased.
 */
export abstract class SpiralGlBase extends FeatureBase implements YssSpiralTarget {

  // `declare` fields on purpose: FeatureBase's constructor calls preload()
  // before this class's own field definitions run, so an ordinary field
  // (even one without an initialiser) would be re-defined as undefined
  // *after* preload() had populated it. `declare` emits no definition, and
  // preload() assigns everything it needs.
  declare gl: WebGLRenderingContext;
  declare gl2: WebGLRenderingContext;
  declare protected stopped: boolean;
  declare protected rigs: SpiralUniformRig[];

  protected static readonly VERTEX_SHADER = `
      attribute vec4 a_position;
      void main() {
          gl_Position = a_position;
      }
    `;

  /** Fragment shader source for this spiral. */
  protected abstract fragmentSource(): string;

  /** Colour used when `spiral_color` is missing or malformed. */
  protected defaultSpiralColor(): number[] { return [1, 1, 1]; }

  /** Called when the shader fails to compile or link. The default rethrows;
   *  subclasses may swallow it and show the error instead. */
  protected onShaderError(error: Error): void {
    throw error;
  }

  override preload(): void {
    this.stopped = false;
    this.rigs = [];
    const fragSource = this.fragmentSource();

    let nd = document.createElement('div');
    nd.id ='spiral-holder';
    nd.style.position = 'absolute';
    nd.style.width = '100vw';
    nd.style.height = '100vh';
    nd.style.zIndex = '4';
    nd.style.top = '0';
    nd.style.left = '0';
    nd.style.pointerEvents = 'none';
    document.body.appendChild(nd);

    const opacity = this.get_configuration_element('opacity') || '0.8';

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = this._service.vr ? window.innerHeight * 2 : window.innerHeight;
    canvas.style.zIndex = '3';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = this._service.vr ? '50vw' : '100vw';
    canvas.id = 'webgl-spiral-holder';
    canvas.style.opacity = opacity;
    document.body.appendChild(canvas);

    if(this._service.vr){
      let c2 = document.createElement('canvas');
      c2.width = window.innerWidth;
      c2.height = window.innerHeight * 2;
      c2.style.zIndex = '3';
      c2.style.position = 'absolute';
      c2.style.top = '0';
      c2.style.left = '50vw';
      c2.style.width = '50vw';
      c2.id = 'webgl-spiral-holder-2'
      c2.style.opacity = opacity;
      document.body.appendChild(c2);
    }

    const startTime = performance.now();

    this.gl = this.startPipeline('webgl-spiral-holder', fragSource, startTime)!;
    if(this._service.vr){
      this.gl2 = this.startPipeline('webgl-spiral-holder-2', fragSource, startTime)!;
    }

    // Become the target of YSS `[setting.spiral.*]` commands.
    this._service.yssService.spiral = this;
  }

  /** Compiles the shader and runs the render loop against one canvas. */
  protected startPipeline(canvasId: string, fragSource: string, startTime: number): WebGLRenderingContext | null {
    const deployedCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const gl = deployedCanvas.getContext('webgl') as WebGLRenderingContext;

    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    gl.viewport(0, 0, deployedCanvas.width, deployedCanvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let program: WebGLProgram;
    try {
      const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, SpiralGlBase.VERTEX_SHADER);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
      program = this.createProgram(gl, vertexShader, fragShader);
    } catch (e) {
      this.onShaderError(e as Error);
      return gl;
    }
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const iResUniformLocation = gl.getUniformLocation(program, 'iRes');
    const iTimeUniformLocation = gl.getUniformLocation(program, 'iTime');

    // Full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1,  1,
      -1,  1,
      1, -1,
      1,  1,
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(iResUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(iTimeUniformLocation, performance.now() / 1000.0);

    // Seed the standard uniforms from the spec; the rig keeps them live.
    const rig = new SpiralUniformRig(gl, program);
    this.rigs.push(rig);
    if (!rig.set('spiral_color', this.get_configuration_element('spiral_color'))) rig.set('spiral_color', this.defaultSpiralColor());
    if (!rig.set('bg_color', this.get_configuration_element('bg_color'))) rig.set('bg_color', [0, 0, 0]);
    rig.set('spin_speed', parseFloat(this.get_configuration_element('spin_speed')) || 1);
    rig.set('throb_speed', parseFloat(this.get_configuration_element('throb_speed')) || 2);
    rig.set('throb_strength', parseFloat(this.get_configuration_element('throb_strength')) || 1);
    rig.set('zoom', parseFloat(this.get_configuration_element('zoom')) || 1);
    this.workspace.spiral_color = rig.get('spiral_color');
    this.workspace.bg_color = rig.get('bg_color');

    const animate = () => {
      if (this.stopped) return;
      const currentCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!currentCanvas) return; // canvas was torn down
      const now = performance.now();
      const elapsedTime = (now - startTime) * 0.001;
      const frameGl = currentCanvas.getContext('webgl') as WebGLRenderingContext;

      frameGl.uniform1f(iTimeUniformLocation, elapsedTime);
      // Follow the viewport (fullscreen after launch, window resize) and keep
      // both resolution uniforms current — shaders centre on them.
      fitSpiralCanvasToViewport(currentCanvas, frameGl, this._service.vr);
      frameGl.uniform2f(resolutionUniformLocation, frameGl.canvas.width, frameGl.canvas.height);
      frameGl.uniform2f(iResUniformLocation, frameGl.canvas.width, frameGl.canvas.height);

      rig.frame(now); // advance any eased variable changes

      frameGl.drawArrays(frameGl.TRIANGLES, 0, 6);
      requestAnimationFrame(animate);
    };

    animate();
    return gl;
  }

  // -- live variables ---------------------------------------------------------

  /** Names YSS may set on this spiral beyond the shader's own uniforms. */
  static readonly SETTING_NAMES: string[] = [...Object.keys(SPIRAL_STANDARD_UNIFORMS), 'opacity'];

  /**
   * Change a spiral variable after launch. `name` is a spec setting
   * (`spin_speed`, `zoom`, `spiral_color`, `bg_color`, `throb_speed`,
   * `throb_strength`, `opacity`) or a GLSL uniform name declared by the
   * shader (float, or vec2/3/4 as comma-separated components; colours as
   * `#rrggbb`). `fadeMs > 0` eases to the new value. Returns false when the
   * value is unusable or no pipeline is running.
   */
  setSpiralVariable(name: string, value: any, fadeMs: number = 0): boolean {
    if (this.stopped || !this.rigs) return false;
    const key = String(name ?? '').trim();
    if (key === '') return false;

    if (key === 'opacity') {
      const o = parseFloat(String(value));
      if (!isFinite(o)) return false;
      const clamped = Math.min(1, Math.max(0, o));
      for (const id of ['webgl-spiral-holder', 'webgl-spiral-holder-2']) {
        const c = document.getElementById(id) as HTMLCanvasElement | null;
        if (!c) continue;
        c.style.transition = fadeMs > 0 ? `opacity ${Math.round(fadeMs)}ms ease-in-out` : '';
        c.style.opacity = String(clamped);
      }
      this.set_configuration_element('opacity', clamped);
      return true;
    }

    if (this.rigs.length === 0) return false;
    let ok = true;
    const now = performance.now();
    for (const rig of this.rigs) ok = rig.set(key, value, fadeMs, now) && ok;
    if (ok) {
      if (key === 'spiral_color') this.workspace.spiral_color = this.rigs[0].get(key);
      if (key === 'bg_color') this.workspace.bg_color = this.rigs[0].get(key);
      this._service.console.push(this._id + ': spiral ' + key + ' = ' + String(value) + (fadeMs > 0 ? ' (fade ' + fadeMs + 'ms)' : ''));
    }
    return ok;
  }

  /** Current numeric value of a spiral variable (null when unknown). */
  getSpiralVariable(name: string): number[] | null {
    return this.rigs && this.rigs.length > 0 ? this.rigs[0].get(name) : null;
  }

  // -- GL helpers ---------------------------------------------------------------

  compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? 'unknown error';
      gl.deleteShader(shader);
      throw new Error(log);
    }
    return shader;
  }

  createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragShader: WebGLShader): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? 'unknown error';
      gl.deleteProgram(program);
      throw new Error(log);
    }
    return program;
  }

  override unload() {
    this.stopped = true;
    this.rigs = [];
    if (this._service.yssService.spiral === this) this._service.yssService.spiral = null;

    // #spiral-holder stays: other features (distractors) mount into it.
    for (const id of ['webgl-spiral-holder', 'webgl-spiral-holder-2']) {
      const el = document.getElementById(id);
      if (el !== null) el.remove();
    }
  }
}
