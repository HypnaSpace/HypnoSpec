import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsCustomCSS extends FeatureBase {


  override preload(): void {
    this._service.console.push(this._id+": Applying custom CSS styles");
    let cssEl = document.createElement('style');
    cssEl.innerHTML = this.get_configuration_element("data") || "";
    document.head.appendChild(cssEl);
  }
}
