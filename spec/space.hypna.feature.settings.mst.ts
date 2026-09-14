import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureSettingsMst extends FeatureBase {
  iterator: any;
  lineDOMElement!: HTMLDivElement;
  lineDOMElement2!: HTMLDivElement;
  workspaceDOMElement!: HTMLDivElement;
  lineCount: number = 0;
  yssActivated: boolean = false;
  private retimeIterator: ((ms: number) => void) | null = null;

  /** Apply a block's on-entry styles/settings when YSS reaches its first line. */
  private applyYssBlockEntry(line: any): void {
    if (!line || !line.enterBlock) return;
    for (const style of line.enterBlock.styles) this._service.yssService.runCommand(style);
    for (const setting of line.enterBlock.settings) {
      if (this._service.yssService.isSpiralSetting(setting.type)) {
        // Live spiral variable (colour, speed, zoom, opacity, custom uniform).
        this._service.yssService.runSpiralSetting(setting);
      } else if (setting.type === 'setting.spirals.line_duration') {
        const ms = parseInt(setting.value);
        if (!isNaN(ms) && ms > 0 && this.retimeIterator) this.retimeIterator(ms);
      } else if (setting.type === 'setting.session.type') {
        console.warn('YSS: setting.session.type is not hot-swappable mid-session; ignoring', setting.value);
      }
    }
  }

  override preload(): void {

    this._update_completion_flag(false);

    this.workspace.metrics = {
      is_vr_mode: this._service.vr,
      iteration_total: 0,
      iterations_so_far: 0,
    }

    console.log("register", this._register)
    this.workspace.content_container = this._get_item_from_register("space.hypna.feature.content.lines");
    if(this.workspace.content_container !== undefined){
      this.workspace.lines = this.workspace.content_container.get_configuration_element("lines");
      this.workspace.metrics.iteration_total = this.workspace.lines.length;
    }
    if(this.workspace.lines){
      // iteration code
      this._service.console.push(this._id+": Drawing .focus-line");


      this.workspaceDOMElement = document.createElement("div");
      this.workspaceDOMElement.id = "workspace-lines";
      this.workspaceDOMElement.style.width = "100vw";
      this.workspaceDOMElement.style.height = "100vh";
      this.workspaceDOMElement.style.display = "flex";
      this.workspaceDOMElement.style.justifyContent = "center";
      this.workspaceDOMElement.style.alignItems = "center";
      this.workspaceDOMElement.style.textAlign = "center";
      this.workspaceDOMElement.style.flexDirection = "column";



      // draw 1
      this.lineDOMElement = document.createElement("div");
      this.lineDOMElement.id = "focus-line";
      this.lineDOMElement.classList.add("focus-line");
      this.lineDOMElement.style.width = this._service.vr ? "50%" : "100%";
      this.lineDOMElement.style.height = "100%";
      this.lineDOMElement.style.display = "flex";
      this.lineDOMElement.style.alignItems = "center";
      this.lineDOMElement.style.textAlign = "center";
      this.lineDOMElement.style.flex = "1";
      // font-size: 6vh; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; position: absolute; top: 0; left: 0; display: flex; justify-content: center; align-items: center; font-family: sans-serif;
      this.lineDOMElement.style.fontSize = "6vh";
      this.lineDOMElement.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
      this.lineDOMElement.style.position = "absolute";
      this.lineDOMElement.style.top = "0";
      this.lineDOMElement.style.left = "0";
      this.lineDOMElement.style.display = "flex";
      this.lineDOMElement.style.justifyContent = "center";
      this.lineDOMElement.style.alignItems = "center";
      this.lineDOMElement.style.textAlign = "center";
      this.lineDOMElement.style.fontFamily = "sans-serif";
      this.lineDOMElement.style.zIndex = "10";

      document.body.appendChild(this.workspaceDOMElement);
      this.workspaceDOMElement = document.getElementById("workspace-lines") as HTMLDivElement || this.workspaceDOMElement;
      this.workspaceDOMElement.appendChild(this.lineDOMElement);
      if(this._service.vr){
        // draw 1
        this.lineDOMElement2 = document.createElement("div");
        this.lineDOMElement2.id = "focus-line-2";
        this.lineDOMElement2.classList.add("focus-line");
        this.lineDOMElement2.style.width = "150%";
        this.lineDOMElement2.style.height = "100%";
        this.lineDOMElement2.style.display = "flex";
        this.lineDOMElement2.style.alignItems = "center";
        this.lineDOMElement2.style.textAlign = "center";
        this.lineDOMElement2.style.flex = "1";
        // font-size: 6vh; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; position: absolute; top: 0; left: 0; display: flex; justify-content: center; align-items: center; font-family: sans-serif;
        this.lineDOMElement2.style.fontSize = "6vh";
        this.lineDOMElement2.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
        this.lineDOMElement2.style.position = "absolute";
        this.lineDOMElement2.style.top = "0";
        this.lineDOMElement2.style.left = "0";
        this.lineDOMElement2.style.display = "flex";
        this.lineDOMElement2.style.justifyContent = "center";
        this.lineDOMElement2.style.alignItems = "center";
        this.lineDOMElement2.style.textAlign = "center";
        this.lineDOMElement2.style.fontFamily = "sans-serif";
        this.lineDOMElement2.style.zIndex = "10";
        this.workspaceDOMElement.appendChild(this.lineDOMElement2);
      }



      const tick = () => {
          if(this._service.use_yss && !this.yssActivated){
            console.warn(this._id, "YSS is activated, compiling script.")
            this.yssActivated = true;
            const cap = Math.min(Math.max(this.workspace.lines.length * 4, 200), 5000);
            const compiled = this._service.yssService.compile(this.workspace.lines.join('\n'), cap);
            this.workspace.lines = compiled.lines;
            this._service.console.push(this._id + ": YSS compiled " + this.workspace.lines.length + " line(s)");
          }


          // YSS activated: play the compiled lines in order, one line per tick.
        if(this.yssActivated){
          let selected = this.workspace.lines[this.lineCount] || "";
          if(selected === "" || selected.words === undefined || selected.words === ""){
            let c = document.getElementsByClassName("focus-line")
          for(let i = 0; i < c.length; i++) {
            (c[i] as HTMLDivElement).innerText = "";
          }
          }else{
            this.applyYssBlockEntry(selected);

            let trimmed = selected.words.replace(/\[\*\]/g, '').replace(/\s+/g, ' ').trim();

            let c = document.getElementsByClassName("focus-line")
          for(let i = 0; i < c.length; i++) {
            (c[i] as HTMLDivElement).innerText = trimmed;
          }

            if(selected.cmds !== undefined){
              for(let cmd of selected.cmds) {
                this._service.yssService.runCommand(cmd);
              }
            }
          }
          this.workspace.metrics.iterations_so_far = this.lineCount;
          this.lineCount++;
        }else{
          //document.getElementById("focus-line")!.innerText = this.workspace.lines[this.lineCount]! || "";
          let c = document.getElementsByClassName("focus-line")
          for(let i = 0; i < c.length; i++) {
            (c[i] as HTMLDivElement).innerText = this.workspace.lines[this.lineCount]! || "";
          }
          this.lineCount++;
          this.workspace.metrics.iterations_so_far = this.lineCount;
          //console.log(this.workspace.lines.length, this.lineCount)
        }
        this._service.console_data["metrics"] = this.workspace.metrics;
        if(this.workspace.lines.length <= this.lineCount) {
            if(this._service.disableEndCheck){
              this.lineCount = 0;
            }else{
              this._update_completion_flag(true);
              clearInterval(this.iterator);
              return;
            }
        }

      };
      this.iterator = setInterval(tick, parseInt(this.get_configuration_element("line_duration").toString()));
      // Lets a YSS block re-pace the session via setting.spirals.line_duration.
      this.retimeIterator = (ms: number) => {
        clearInterval(this.iterator);
        this.iterator = setInterval(tick, ms);
      };

    }else{
      this._service.console.push("["+this._id+"] Could not fetch required content containers. Be sure that you have registered them first before calling this settings module.");
      this._update_completion_flag(true);
    }
  }
}
