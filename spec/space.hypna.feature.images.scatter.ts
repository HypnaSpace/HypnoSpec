import {FeatureBase} from "./space.hypna.feature._base";

/**
 * Scatter images: a second images cycler. Where images.basic swaps one
 * full-screen background, this drops single images at random positions,
 * fades + zooms each one in, holds it, fades it out and removes it. Several
 * can be up at once (max_images).
 *
 * DOM contract (public, like #images-holder: custom CSS / YSS may target it,
 * and the XR presenter mirrors it into the headset):
 *
 *   #scatter-holder                    full-screen layer, z-index 1
 *   #scatter-holder img.scatter-image  one floating image
 *     data-x, data-y      centre, percent of the viewport
 *     data-size           width, percent of the viewport width
 *     data-depth          0..1 depth hint; flat ignores it, XR places the
 *                         image nearer/farther by it
 *     .is-in / .is-out    the fade+zoom in / fade out animations
 *
 * The current opacity and scale of an image are whatever its CSS animation
 * says, so anything mirroring it (XR) reads getComputedStyle and stays in
 * step with the flat player automatically.
 */
export class SpaceHypnaFeatureImagesScatter extends FeatureBase {

  // `declare`: FeatureBase's constructor runs preload() before this class's
  // own field initialisers, which would otherwise reset everything preload
  // created (a field with an initialiser, or any field under
  // useDefineForClassFields). Declared-only fields emit nothing.
  declare interval: any;
  declare holder: HTMLDivElement;
  declare holder2: HTMLDivElement | undefined;
  declare styleElement: HTMLStyleElement;
  declare private live: HTMLImageElement[];
  declare private timers: any[];
  declare private counter: number;

  private num(key: string, fallback: number): number {
    const v = parseFloat(String(this.get_configuration_element(key)));
    return isNaN(v) ? fallback : v;
  }

  override preload(): void {
    this.live = [];
    this.timers = [];
    this.counter = 0;
    this.workspace.images = this.get_configuration_element("images_handled_by_outside_source") ? this._service.images : this.get_configuration_element("images");
    this.workspace.spawn_frequency = Math.max(100, this.num("spawn_frequency", 1500));
    this.workspace.lifetime = Math.max(300, this.num("lifetime", 4000));
    this.workspace.fade_duration = Math.max(50, Math.min(this.num("fade_duration", 800), this.workspace.lifetime / 2));
    this.workspace.max_images = Math.max(1, Math.floor(this.num("max_images", 6)));
    this.workspace.size = Math.max(1, Math.min(100, this.num("size", 25)));
    this.workspace.zoom_from = Math.max(0.05, this.num("zoom_from", 0.6));
    this.workspace.opacity = Math.max(0, Math.min(1, this.num("opacity", 0.9)));

    this._service.console.push(this._id + ": Drawing #scatter-holder");
    this.holder = this.makeHolder("scatter-holder", "0");
    document.body.appendChild(this.holder);
    if (this._service.vr) {
      this.holder2 = this.makeHolder("scatter-holder-2", "50vw");
      document.body.appendChild(this.holder2);
    }

    this._service.console.push(this._id + ": Adding CSS to document head");
    const fade = this.workspace.fade_duration;
    const o = this.workspace.opacity;
    const z = this.workspace.zoom_from;
    this.styleElement = document.createElement('style');
    this.styleElement.innerHTML = `
.scatter-image {
  position: absolute;
  transform: translate(-50%, -50%) scale(${z});
  opacity: 0;
  will-change: opacity, transform;
  pointer-events: none;
}
.scatter-image.is-in {
  animation: scatter-in ${fade}ms ease-out forwards;
}
.scatter-image.is-out {
  animation: scatter-out ${fade}ms ease-in forwards;
}
@keyframes scatter-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(${z}); }
  to { opacity: ${o}; transform: translate(-50%, -50%) scale(1); }
}
@keyframes scatter-out {
  from { opacity: ${o}; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(1.08); }
}
`;
    document.head.appendChild(this.styleElement);

    this._service.console.push(this._id + ": Setting up interval.");
    this.interval = setInterval(() => this.spawn(), this.workspace.spawn_frequency);
  }

  private makeHolder(id: string, left: string): HTMLDivElement {
    const holder = document.createElement('div');
    holder.id = id;
    holder.classList.add('scatter-holder');
    holder.style.position = "absolute";
    holder.style.top = "0";
    holder.style.left = left;
    holder.style.width = this._service.vr ? "50vw" : "100vw";
    holder.style.height = "100vh";
    holder.style.overflow = "hidden";
    holder.style.zIndex = "1";
    holder.style.pointerEvents = "none";
    return holder;
  }

  spawn(): void {
    const images: string[] = this.workspace.images || [];
    if (images.length === 0) return;
    // Count per holder: VR duplicates each image into both eyes.
    const perHolder = this._service.vr ? 2 : 1;
    if (this.live.length >= this.workspace.max_images * perHolder) return;

    let indx = Math.floor(Math.random() * images.length);
    let guard = 0;
    while (this._service.disabledImageArray.includes(indx) && guard++ < 50) {
      indx = Math.floor(Math.random() * images.length);
    }
    if (this._service.disabledImageArray.includes(indx)) return;

    const url = images[indx];
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    const depth = Math.random();
    const id = String(++this.counter);
    const holders = [this.holder, this.holder2].filter((h): h is HTMLDivElement => !!h);
    for (const holder of holders) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = "";
      img.className = "scatter-image is-in";
      img.style.left = x.toFixed(2) + "%";
      img.style.top = y.toFixed(2) + "%";
      img.style.width = this.workspace.size + "%";
      img.dataset['id'] = id;
      img.dataset['x'] = x.toFixed(2);
      img.dataset['y'] = y.toFixed(2);
      img.dataset['size'] = String(this.workspace.size);
      img.dataset['depth'] = depth.toFixed(3);
      holder.appendChild(img);
      this.live.push(img);

      this.timers.push(setTimeout(() => {
        img.classList.remove('is-in');
        img.classList.add('is-out');
      }, this.workspace.lifetime - this.workspace.fade_duration));
      this.timers.push(setTimeout(() => {
        img.remove();
        this.live = this.live.filter((i) => i !== img);
      }, this.workspace.lifetime));
    }
  }

  override unload(): void {
    if (this.interval) clearInterval(this.interval);
    for (const t of this.timers || []) clearTimeout(t);
    this.timers = [];
    for (const img of this.live || []) img.remove();
    this.live = [];
    if (this.holder) this.holder.remove();
    if (this.holder2) this.holder2.remove();
    if (this.styleElement) this.styleElement.remove();
  }
}
