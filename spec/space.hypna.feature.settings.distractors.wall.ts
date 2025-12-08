import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsDistractorsWall extends FeatureBase {

  interval: any;
  c!: HTMLDivElement;

  override preload(): void {
    this._service.console.push(this._id+": Setting up wall distractors and fetching from content features");
    this.workspace.lines = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("lines");
    this.workspace.duration = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("duration");
    this.workspace.base_frequency = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("base_frequency");
    this.workspace.base_random_offset = this._get_item_from_register("space.hypna.feature.content.distractors").get_configuration_element("base_random_offset");
    this.workspace.rerender_frequency = this.get_configuration_element("rerender_frequency")
    this.workspace.enabled = this.get_configuration_element("enabled") || false;

    this.c = document.createElement<any>('div');
    this.c.id = 'dis-container';
    this.c.style.position = 'absolute';
    this.c.style.top = '0';
    this.c.style.left = '0';
    this.c.style.width = '100vw';
    this.c.style.height = '100vh';
    this.c.style.zIndex = '2';
    this.c.style.opacity = '0.5';
    document.body.appendChild(this.c);
    if(this.workspace.enabled){
      this.interval = setInterval(() => {
      this.c = document.getElementById('dis-container') || document.createElement<any>('div');
      var fontSize: string = "24";
      var txtHeight: number = 20;
      let viewportWidth = window.innerWidth;
      let viewportHeight = window.innerHeight;
      let numLines = Math.ceil((viewportHeight / (txtHeight)) + 5);
      let maxChars = Math.ceil((viewportWidth / parseInt(fontSize)) * 4);
      let generatedText = "";
      for (var i = 0; i < numLines; i++) {
        let line = "";
        for (var j = 0; j < maxChars; j++) {
          line += this.spawnNewDistractor();
          if (line.length >= maxChars) {
            j = maxChars + 1;
          }
        }
        generatedText += line + "<br>";
      }
      this.c.innerHTML = generatedText;

    }, Math.floor((this.workspace.base_random_offset ? Math.random() : 1) * (parseInt(this.workspace.rerender_frequency.toString()) - 200) + 200));
    }

  }

  spawnNewDistractor(){
    return this.workspace.lines[Math.floor(Math.random() * this.workspace.lines.length)];
  }

}
