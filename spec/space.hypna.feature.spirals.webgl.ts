import {SpiralGlBase} from "./space.hypna.feature.spirals._glbase";

/**
 * The built-in WebGL spiral. Everything but the shader lives in
 * {@link SpiralGlBase}: canvas/VR mounting, uniform seeding from the spec,
 * the render loop, and live variable changes via `setSpiralVariable`
 * (which YSS reaches through `[setting.spiral.*]`).
 */
export class SpaceHypnaFeatureSpiralsWebgl extends SpiralGlBase {

  protected override fragmentSource(): string {
    return `
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
  }

  /** Legacy default: red spiral when the spec has no usable colour. */
  protected override defaultSpiralColor(): number[] { return [1, 0, 0]; }

  protected override onShaderError(error: Error): void {
    console.error('Shader error:', error.message);
    throw new Error('Failed to compile shader');
  }
}
