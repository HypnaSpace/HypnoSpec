import {FeatureBase} from "./space.hypna.feature._base";
import hexRgb from "hex-rgb";


/**
 * User-scripted WebGL spiral. The fragment shader source comes from the
 * feature configuration (`fragment_source`) instead of being baked in, so
 * session authors can write their own spirals. The same DOM ids and uniforms
 * as space.hypna.feature.spirals.webgl are used, so the standard settings
 * (colors, speeds, opacity) and external hooks (spiral reset, YSS/CSS
 * targeting #webgl-spiral-holder) keep working unchanged. Uniforms the
 * author's shader does not declare resolve to a null location, which WebGL
 * silently ignores.
 */
export class SpaceHypnaFeatureSpiralsCustomgl extends FeatureBase {

  webglCanvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  gl2!: WebGLRenderingContext;

  private stopped = false;

  override preload(): void {
    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
          gl_Position = a_position;
      }
    `;
    const fragSource = String(this.get_configuration_element('fragment_source') ?? '');

    this.webglCanvas = document.createElement('canvas');

    const canvas = this.webglCanvas;

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

    canvas.width = window.innerWidth;
    canvas.height = this._service.vr ? window.innerHeight * 2 : window.innerHeight;
    canvas.style.zIndex = '3';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = this._service.vr ? '50vw' : '100vw';
    canvas.id = 'webgl-spiral-holder';
    canvas.style.opacity = this.get_configuration_element('opacity') || '0.8';
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
      c2.style.opacity = this.get_configuration_element('opacity') || '0.8';
      document.body.appendChild(c2);
    }

    const startTime = performance.now();

    this.gl = this.startPipeline('webgl-spiral-holder', vertexShaderSource, fragSource, startTime)!;
    if(this._service.vr){
      this.gl2 = this.startPipeline('webgl-spiral-holder-2', vertexShaderSource, fragSource, startTime)!;
    }
  }

  /** Compiles the author's shader and runs the render loop against one
   * canvas. Compile/link failures surface in an on-screen overlay (plus the
   * debug console) instead of throwing out of the player launch path. */
  private startPipeline(canvasId: string, vertexShaderSource: string, fragSource: string, startTime: number): WebGLRenderingContext | null {
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
      const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
      program = this.createProgram(gl, vertexShader, fragShader);
    } catch (e) {
      this.showShaderError((e as Error).message);
      return gl;
    }
    gl.useProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const iResUniformLocation = gl.getUniformLocation(program, 'iRes');
    const iTimeUniformLocation = gl.getUniformLocation(program, 'iTime');
    const spiralColorUniformLocation = gl.getUniformLocation(program, 'spiralColor');
    const bgColorUniformLocation = gl.getUniformLocation(program, 'bgColor');
    const spinSpeedUniformLocation = gl.getUniformLocation(program, 'spinSpeed');
    const throbSpeedUniformLocation = gl.getUniformLocation(program, 'throbSpeed');
    const throbStrengthUniformLocation = gl.getUniformLocation(program, 'throbStrength');
    const zoomUniformLocation = gl.getUniformLocation(program, 'zoom');

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

    this.workspace.spiral_color = this.safeHexRgb(this.get_configuration_element("spiral_color"));
    this.workspace.bg_color = this.safeHexRgb(this.get_configuration_element("bg_color"));

    gl.uniform3fv(spiralColorUniformLocation, this.workspace.spiral_color ? [this.workspace.spiral_color.red / 255, this.workspace.spiral_color.green / 255, this.workspace.spiral_color.blue / 255] : [1,1,1]);
    gl.uniform3fv(bgColorUniformLocation, this.workspace.bg_color ? [this.workspace.bg_color.red / 255, this.workspace.bg_color.green / 255, this.workspace.bg_color.blue / 255] : [0,0,0]);
    gl.uniform1f(spinSpeedUniformLocation, parseFloat(this.get_configuration_element("spin_speed")) || 1);
    gl.uniform1f(throbSpeedUniformLocation, parseFloat(this.get_configuration_element("throb_speed")) || 2);
    gl.uniform1f(throbStrengthUniformLocation, parseFloat(this.get_configuration_element("throb_strength")) || 1);
    gl.uniform1f(zoomUniformLocation, parseFloat(this.get_configuration_element("zoom")) || 1);

    const animate = () => {
      if (this.stopped) return;
      const currentCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!currentCanvas) return; // canvas was torn down
      const elapsedTime = (performance.now() - startTime) * 0.001;
      const frameGl = currentCanvas.getContext('webgl') as WebGLRenderingContext;

      frameGl.uniform1f(iTimeUniformLocation, elapsedTime);
      frameGl.uniform2f(iResUniformLocation, frameGl.canvas.width, frameGl.canvas.height);

      frameGl.drawArrays(frameGl.TRIANGLES, 0, 6);
      requestAnimationFrame(animate);
    };

    animate();
    return gl;
  }

  /** hex-rgb throws on malformed input; a hand-edited spec must not take the
   * whole spiral down over a bad color string. */
  private safeHexRgb(value: any): any {
    try {
      return hexRgb(value);
    } catch {
      return null;
    }
  }

  private showShaderError(message: string): void {
    console.error('Custom spiral shader error:', message);
    this._service.console.push(this._id + ': shader error: ' + message);

    const holder = document.getElementById('spiral-holder');
    if (!holder || document.getElementById('customgl-shader-error')) return;
    const overlay = document.createElement('pre');
    overlay.id = 'customgl-shader-error';
    overlay.textContent = 'Custom spiral shader failed to compile:\n\n' + message;
    overlay.style.position = 'absolute';
    overlay.style.top = '1rem';
    overlay.style.left = '1rem';
    overlay.style.right = '1rem';
    overlay.style.zIndex = '10';
    overlay.style.padding = '1rem';
    overlay.style.background = 'rgba(60, 0, 0, 0.85)';
    overlay.style.color = '#ffb3b3';
    overlay.style.font = '12px/1.5 monospace';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.borderRadius = '6px';
    holder.appendChild(overlay);
  }

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

    const deployedCanvas = document.getElementById('webgl-spiral-holder') as HTMLCanvasElement;
    if(deployedCanvas !== null){
      deployedCanvas.remove();
    }

    const deployedCanvas2 = document.getElementById('webgl-spiral-holder-2') as HTMLCanvasElement;
    if(deployedCanvas2 !== null){
      deployedCanvas2.remove();
    }

    const errorOverlay = document.getElementById('customgl-shader-error');
    if(errorOverlay !== null){
      errorOverlay.remove();
    }
  }
}
