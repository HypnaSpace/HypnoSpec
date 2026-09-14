import {SpiralGlBase} from "./space.hypna.feature.spirals._glbase";

/**
 * User-scripted WebGL spiral. The fragment shader source comes from the
 * feature configuration (`fragment_source`) instead of being baked in, so
 * session authors can write their own spirals. The same DOM ids and uniforms
 * as space.hypna.feature.spirals.webgl are used (see {@link SpiralGlBase}),
 * so the standard settings (colors, speeds, opacity) and external hooks
 * (spiral reset, YSS/CSS targeting #webgl-spiral-holder) keep working
 * unchanged. Uniforms the author's shader does not declare resolve to a null
 * location, which WebGL silently ignores.
 *
 * Any extra `uniform float` / `uniform vecN` the author declares can be driven
 * from YSS by its GLSL name: `[setting.spiral.myPulse=0.5;fade=2000]`.
 */
export class SpaceHypnaFeatureSpiralsCustomgl extends SpiralGlBase {

  protected override fragmentSource(): string {
    return String(this.get_configuration_element('fragment_source') ?? '');
  }

  /** Compile/link failures surface in an on-screen overlay (plus the debug
   * console) instead of throwing out of the player launch path. */
  protected override onShaderError(error: Error): void {
    this.showShaderError(error.message);
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

  override unload() {
    super.unload();
    const errorOverlay = document.getElementById('customgl-shader-error');
    if(errorOverlay !== null){
      errorOverlay.remove();
    }
  }
}
