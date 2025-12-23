import {FeatureBase} from "./space.hypna.feature._base";
import {ElementRef} from "@angular/core";
import hexRgb from "hex-rgb";


export class SpaceHypnaFeatureSpiralsWebgl extends FeatureBase {

  webglCanvas!: HTMLCanvasElement;
  gl!: WebGLRenderingContext;
  gl2!: WebGLRenderingContext;

  override preload(): void {
    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
          gl_Position = a_position;
      }
    `;
    const frag2Source = `
    precision highp float;

    #define PI 3.1415926538

    uniform vec2 u_resolution;

    uniform vec2 iRes;
    uniform float iTime;

    uniform vec3 spiralColor;
    uniform vec3 bgColor;

    uniform float spinSpeed;
    uniform float throbSpeed;
    uniform float throbStrength;
    uniform float zoom;

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 uv = (fragCoord - 0.5 * u_resolution) / u_resolution.y;
        vec2 truPos = uv;

        float angle = atan(truPos.y, truPos.x);
        float dist = pow(length(truPos), .4 + sin((iTime + cos(iTime * .05) * 0.1) * throbSpeed) * 0.2 * throbStrength);

        float spiFactor = pow(sin(dist * 40. * zoom - iTime * 5. * spinSpeed) + 1.0, 50.);
        spiFactor = clamp(spiFactor, 0., 1.);

        vec3 color = mix(spiralColor, bgColor, spiFactor);
        gl_FragColor = vec4(color, 1.0);
    }
    `;

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

    // reacquire after appending to the DOM

    let deployedCanvas = document.getElementById('webgl-spiral-holder') as HTMLCanvasElement;
    this.gl = deployedCanvas.getContext('webgl') as WebGLRenderingContext;

    let startTime = performance.now();

    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set up viewport and other WebGL configurations
    this.gl.viewport(0, 0, canvas.width, deployedCanvas.height);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const vertexShader = this.compileShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    //const fragmentShader = this.compileShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    const frag2Shader = this.compileShader(this.gl, this.gl.FRAGMENT_SHADER, frag2Source);
    const program = this.createProgram(this.gl, vertexShader, frag2Shader);
    this.gl.useProgram(program);

    // Get attribute and uniform locations
    const positionAttributeLocation = this.gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = this.gl.getUniformLocation(program, 'u_resolution');
    //const timeUniformLocation = this.gl.getUniformLocation(program, 'u_time');


    const iResUniformLocation = this.gl.getUniformLocation(program, 'iRes');
    const iTimeUniformLocation = this.gl.getUniformLocation(program, 'iTime');
    const spiralColorUniformLocation = this.gl.getUniformLocation(program, 'spiralColor');
    const bgColorUniformLocation = this.gl.getUniformLocation(program, 'bgColor');
    const spinSpeedUniformLocation = this.gl.getUniformLocation(program, 'spinSpeed');
    const throbSpeedUniformLocation = this.gl.getUniformLocation(program, 'throbSpeed');
    const throbStrengthUniformLocation = this.gl.getUniformLocation(program, 'throbStrength');
    const zoomUniformLocation = this.gl.getUniformLocation(program, 'zoom');


    // Create a buffer for a full-screen quad (to cover the canvas)
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1,  1,
      -1,  1,
      1, -1,
      1,  1,
    ]), this.gl.STATIC_DRAW);

    // Set the position attribute
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Set initial uniform values
    this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform2f(iResUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform1f(iTimeUniformLocation, performance.now() / 1000.0);
    // vec3 spiralColor

    // convert color hex code to rgb
    this.workspace.spiral_color = hexRgb(this.get_configuration_element("spiral_color"))
    this.workspace.bg_color = hexRgb(this.get_configuration_element("bg_color"))

    // 255 to percentage to 0.0-1.0

    this.gl.uniform3fv(spiralColorUniformLocation, this.workspace.spiral_color ? [this.workspace.spiral_color.red / 255, this.workspace.spiral_color.green / 255, this.workspace.spiral_color.blue / 255] : [1,0,0]); // Red
    this.gl.uniform3fv(bgColorUniformLocation, this.workspace.spiral_color ? [this.workspace.spiral_color.red / 255, this.workspace.spiral_color.green / 255, this.workspace.spiral_color.blue / 255] : [0,0,0]); // Black
    this.gl.uniform1f(spinSpeedUniformLocation, parseInt(this.get_configuration_element("spin_speed")) || 1);
    this.gl.uniform1f(throbSpeedUniformLocation, parseInt(this.get_configuration_element("throb_speed")) || 2);
    this.gl.uniform1f(throbStrengthUniformLocation, parseInt(this.get_configuration_element("throb_strength")) || 1);
    this.gl.uniform1f(zoomUniformLocation, parseInt(this.get_configuration_element("zoom")) || 1);

    // Render loop
    const animate = () => {
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) * 0.001; // Convert to seconds
      let deployedCanvas = document.getElementById('webgl-spiral-holder') as HTMLCanvasElement;
      this.gl = deployedCanvas.getContext('webgl') as WebGLRenderingContext;
      // Update time uniform
      this.gl.uniform1f(iTimeUniformLocation, elapsedTime);

      // Update resolution uniform in case canvas size changes
      this.gl.uniform2f(iResUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6); // Draw the full-screen quad
      requestAnimationFrame(animate);
    };

    animate();

    if(this._service.vr){
      let deployedCanvas2 = document.getElementById('webgl-spiral-holder-2') as HTMLCanvasElement;
      this.gl2 = deployedCanvas2.getContext('webgl') as WebGLRenderingContext;

      if (!this.gl2) {
        console.error('WebGL not supported');
        return;
      }

      // Set up viewport and other WebGL configurations
      this.gl2.viewport(0, 0, canvas.width, deployedCanvas2.height);
      this.gl2.clearColor(0.0, 0.0, 0.0, 1.0); // Black background
      this.gl2.clear(this.gl.COLOR_BUFFER_BIT);

      const vertexShader = this.compileShader(this.gl2, this.gl2.VERTEX_SHADER, vertexShaderSource);
      //const fragmentShader = this.compileShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
      const frag2Shader = this.compileShader(this.gl2, this.gl2.FRAGMENT_SHADER, frag2Source);
      const program = this.createProgram(this.gl2, vertexShader, frag2Shader);
      this.gl2.useProgram(program);

      // Get attribute and uniform locations
      const positionAttributeLocation = this.gl2.getAttribLocation(program, 'a_position');
      const resolutionUniformLocation = this.gl2.getUniformLocation(program, 'u_resolution');
      //const timeUniformLocation = this.gl.getUniformLocation(program, 'u_time');


      const iResUniformLocation = this.gl2.getUniformLocation(program, 'iRes');
      const iTimeUniformLocation = this.gl2.getUniformLocation(program, 'iTime');
      const spiralColorUniformLocation = this.gl2.getUniformLocation(program, 'spiralColor');
      const bgColorUniformLocation = this.gl2.getUniformLocation(program, 'bgColor');
      const spinSpeedUniformLocation = this.gl2.getUniformLocation(program, 'spinSpeed');
      const throbSpeedUniformLocation = this.gl2.getUniformLocation(program, 'throbSpeed');
      const throbStrengthUniformLocation = this.gl2.getUniformLocation(program, 'throbStrength');
      const zoomUniformLocation = this.gl2.getUniformLocation(program, 'zoom');


      // Create a buffer for a full-screen quad (to cover the canvas)
      const positionBuffer = this.gl2.createBuffer();
      this.gl2.bindBuffer(this.gl2.ARRAY_BUFFER, positionBuffer);
      this.gl2.bufferData(this.gl2.ARRAY_BUFFER, new Float32Array([
        -1, -1,
        1, -1,
        -1,  1,
        -1,  1,
        1, -1,
        1,  1,
      ]), this.gl2.STATIC_DRAW);

      // Set the position attribute
      this.gl2.enableVertexAttribArray(positionAttributeLocation);
      this.gl2.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

      // Set initial uniform values
      this.gl2.uniform2f(resolutionUniformLocation, this.gl2.canvas.width, this.gl2.canvas.height);
      this.gl2.uniform2f(iResUniformLocation, this.gl2.canvas.width, this.gl2.canvas.height);
      this.gl2.uniform1f(iTimeUniformLocation, performance.now() / 1000.0);
      // vec3 spiralColor

      // convert color hex code to rgb
      this.workspace.spiral_color = hexRgb(this.get_configuration_element("spiral_color"))
      this.workspace.bg_color = hexRgb(this.get_configuration_element("bg_color"))

      // 255 to percentage to 0.0-1.0

      this.gl.uniform3fv(spiralColorUniformLocation, this.workspace.spiral_color ? [this.workspace.spiral_color.red / 255, this.workspace.spiral_color.green / 255, this.workspace.spiral_color.blue / 255] : [1,0,0]); // Red
      this.gl.uniform3fv(bgColorUniformLocation, this.workspace.spiral_color ? [this.workspace.spiral_color.red / 255, this.workspace.spiral_color.green / 255, this.workspace.spiral_color.blue / 255] : [0,0,0]); // Black
      this.gl2.uniform1f(spinSpeedUniformLocation, parseInt(this.get_configuration_element("spin_speed")) || 1);
      this.gl2.uniform1f(throbSpeedUniformLocation, parseInt(this.get_configuration_element("throb_speed")) || 2);
      this.gl2.uniform1f(throbStrengthUniformLocation, parseInt(this.get_configuration_element("throb_strength")) || 1);
      this.gl2.uniform1f(zoomUniformLocation, parseInt(this.get_configuration_element("zoom")) || 1);



      // Render loop
      const animate2 = () => {
        const currentTime = performance.now();
        const elapsedTime = (currentTime - startTime) * 0.001; // Convert to seconds
        let deployedCanvas2 = document.getElementById('webgl-spiral-holder-2') as HTMLCanvasElement;
        this.gl2 = deployedCanvas2.getContext('webgl') as WebGLRenderingContext;
        // Update time uniform
        this.gl2.uniform1f(iTimeUniformLocation, elapsedTime);

        // Update resolution uniform in case canvas size changes
        this.gl2.uniform2f(iResUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

        this.gl2.drawArrays(this.gl.TRIANGLES, 0, 6); // Draw the full-screen quad
        requestAnimationFrame(animate2);
      };

      animate2();

    }


  }

  compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error('Failed to compile shader');
    }
    return shader;
  }

  createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, frag2Shader: WebGLShader): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    //gl.attachShader(program, fragmentShader);
    gl.attachShader(program, frag2Shader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Failed to link program');
    }
    return program;
  }


  override unload() {

    // Cleanup WebGL resources

    const deployedCanvas = document.getElementById('webgl-spiral-holder') as HTMLCanvasElement;
    deployedCanvas.remove();

    const deployedCanvas2 = document.getElementById('webgl-spiral-holder-2') as HTMLCanvasElement;
    if(deployedCanvas2!== null){
      deployedCanvas2.remove();
    }

  }
}
