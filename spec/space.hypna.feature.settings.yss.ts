import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsYss extends FeatureBase {
  override preload(): void {

    console.log(this._featureConfiguration);

    this._service.console.push(this._id+": Setting up yss");
    this.workspace.yss = this.get_configuration_element("enabled")! || false;
    if(this.workspace.yss) {
      this._service.console.push(this._id+": YSS enabled");
      this._service.use_yss = true;
    }
  }
}
