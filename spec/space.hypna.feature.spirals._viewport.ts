/**
 * Keeps a WebGL spiral canvas's drawing buffer matched to the viewport.
 *
 * The spiral canvases size their buffer from `window.innerWidth/innerHeight`
 * once at preload, and only their CSS *width* is declared (100vw / 50vw) — the
 * element's rendered height is whatever the buffer height happens to be. So a
 * viewport change after launch (entering fullscreen, rotating, resizing the
 * window) stretched the old buffer to the new width while the element stayed
 * at the launch-time height: the spiral fell short of the bottom of the screen
 * and its centre no longer lined up with the focus text, which is laid out in
 * vh units and did follow the viewport.
 *
 * Resizing the buffer does not touch the GL viewport, so it is re-declared
 * here too. Callers re-upload their resolution uniforms after a refit (the
 * shader centres on them). Returns true when the buffer was resized.
 *
 * The VR layout keeps its legacy buffer shape: full window width and double
 * height per eye canvas.
 */
export function fitSpiralCanvasToViewport(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext,
  vr: boolean,
): boolean {
  const width = window.innerWidth;
  const height = vr ? window.innerHeight * 2 : window.innerHeight;
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  return true;
}
