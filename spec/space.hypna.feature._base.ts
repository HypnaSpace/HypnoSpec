import {HypnospecUtilsService} from "../services/hypnospec-utils.service";

export class FeatureBase {

  private _workspace: any = {

  }

  constructor(
    protected _register: any[],
    protected _id: string,
    protected _featureConfiguration: any,
    protected _service: HypnospecUtilsService,
    protected _needsPreload: boolean = false
  ) {
    this._register.push({
        id: this._id,
        class: this
    });
    if (this._needsPreload) {
      this.preload();
      console.log(`Feature ${this._id} registered.`);
    }else{
      console.log(`Feature ${this._id} registered.`);
    }

  }



  preload(): void {
    // Placeholder for feature-specific preload logic
    this._service.console.push(this._id+": Needed preloading but no preload override was implemented. Registering anyway.");
  }

  get id(): string {
    return this._id;
  }

  get featureConfiguration(): any {
    return this._featureConfiguration;
  }

  get_configuration_element(key: string): any {
    return this._featureConfiguration[key];
  }

  set_configuration_element(key: string, value: any): void {
    this._featureConfiguration[key] = value;
  }

  protected _get_item_from_register(id: string): any | undefined {
    return this._register.find((item: any) => item.id === id).class;
  }

  protected _update_completion_flag(value: boolean): void {
    let completionFlag = this._service.completionFlags.find((flag: any) => flag.id === this._id);
    if (completionFlag) {
      completionFlag.completed = value;
    }else{
      this._service.completionFlags.push({
        id: this._id,
        completed: value
      });
    }
  }

  get workspace(): any {
    return this._workspace;
  }

  unload(): void {

  }




}
