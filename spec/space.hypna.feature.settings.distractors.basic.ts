import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsDistractorsBasic extends FeatureBase {

  interval: any;


  override preload(): void {
    this._service.console.push(this._id+": Setting up distractors and fetching from content features");
    this.workspace.lines = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("lines");
    this.workspace.duration = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("duration");
    this.workspace.base_frequency = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("base_frequency");
    this.workspace.base_random_offset = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("base_random_offset");

    this.interval = setInterval(() => {
      this.spawnNewDistractor();
    }, Math.floor((this.workspace.base_random_offset ? Math.random() : 1) * (parseInt(this.workspace.base_frequency.toString()) - 200) + 200));

  }

  spawnNewDistractor(){
    let d = this.workspace.lines[Math.floor(Math.random() * this.workspace.lines.length)];
    if(d === undefined){
      return;
    }
    let el = document.getElementById("spiral-holder") as unknown as HTMLDivElement;
    let newEl: HTMLDivElement = document.createElement("div");
    newEl.innerText = d;
    newEl.style.position = "absolute";
    newEl.style.top = (Math.floor(Math.random() * (80-20 + 1)) + 20)+"vh";
    newEl.style.left = (Math.floor(Math.random() * (80-20 + 1)) + 20)+"vw";
    newEl.className = "animation-breathing content-text distractor";
    el.appendChild(newEl);
    setTimeout(() => {
      newEl.remove();
    },Math.floor((this.workspace.base_random_offset ? Math.random() : 1) * (parseInt(this.workspace.duration.toString()) - 500) + 500));
  }

}
