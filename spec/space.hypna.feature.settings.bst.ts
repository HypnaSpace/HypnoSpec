import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureSettingsBst extends FeatureBase {

  iterator: any;
  lineDOMElement!: HTMLDivElement;
  lineDOMElement2!: HTMLDivElement;
  workspaceDOMElement!: HTMLDivElement;

  currentLine: any = "";
  currentWordIndex: number = 0;
  currentWord: string = "";
  currentActions: any[] = [];
  actionCounter: number = 0;
  numberOfLines: number = 0;
  yssActivated: boolean = false;
  private selected: any;

  // YSS playback state (see YuukSpaceScriptParserService.compile).
  yssLines: any[] = [];
  yssLineIndex: number = 0;
  yssCmdIndex: number = 0;
  // `declare`, not an initialiser: FeatureBase's constructor runs preload()
  // before this class's field initialisers, so `= null` here would wipe the
  // hook preload() installs and silently drop setting.spirals.line_duration.
  declare private retimeIterator: ((ms: number) => void) | null;

  /** Apply a block's on-entry styles and settings when YSS reaches its first line. */
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
        // The session type is fixed at launch by whichever feature is running;
        // it cannot be hot-swapped mid-session without rebuilding the feature
        // tree, so it is parsed but not applied here.
        console.warn('YSS: setting.session.type is not hot-swappable mid-session; ignoring', setting.value);
      }
    }
  }

  override preload(): void {
    this.retimeIterator = null;
    console.log("register", this._register)

    console.log("vrmode? ", this._service.vr);

    this.workspace.metrics = {
      is_vr_mode: this._service.vr,
      iteration_total: 0,
      iterations_so_far: 0,
      current_line_index: 0,
      current_word_index: 0,
      current_word: ""
    }

    this._update_completion_flag(false);

    this.workspace.content_container = this._get_item_from_register("space.hypna.feature.content.lines");
    if(this.workspace.content_container !== undefined){
      this.workspace.lines = this.workspace.content_container.get_configuration_element("lines");
    }
    this.workspace.time_container = this._get_item_from_register("space.hypna.feature.content.time");
    if(this.workspace.time_container !== undefined){
      this.workspace.time = this.workspace.time_container.get_configuration_element("time");
    }
    this.workspace.metrics.iteration_total = parseInt(this.workspace.time);
    if(this.workspace.lines && this.workspace.time){
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
            const cap = Math.min(Math.max(parseInt(this.workspace.time) || 0, 200), 5000);
            const compiled = this._service.yssService.compile(this.workspace.lines.join('\n'), cap);
            this.yssLines = compiled.lines;
            this.workspace.lines = this.yssLines;
            this._service.console.push(this._id + ": YSS compiled " + this.yssLines.length + " line(s)");
            // BST picks its starting line at random (legacy behaviour); the
            // compiled lines are a pool to draw from, not a sequence.
            this.yssLineIndex = Math.floor(Math.random() * this.yssLines.length);
            this.currentWordIndex = 0;
            this.yssCmdIndex = 0;
            this.selected = this.yssLines[this.yssLineIndex];
            if (this.selected) {
              this.currentLine = this.selected.words.split(" ");
              this.applyYssBlockEntry(this.selected);
            }
        }

        if(this.yssActivated){

          // YSS activated: BST keeps its random line selection (the compiled
          // lines are a pool, not a sequence — MST is the ordered variant).
          // One token per tick; `[*]` placeholders run the line's next inline
          // command; block entries apply styles/settings when a line is picked.

          if (!this.selected) {
            this._update_completion_flag(true);
            clearInterval(this.iterator);
            return;
          }
          this.currentLine = this.selected.words.split(" ");
          const token = this.currentLine[this.currentWordIndex];

          if (token === '[*]') {
            this._service.yssService.runCommand(this.selected.cmds[this.yssCmdIndex]);
            this.yssCmdIndex++;
            this.currentWord = "";
          } else {
            this.currentWord = token ?? "";
          }

          let c = document.getElementsByClassName("focus-line")
          for(let i = 0; i < c.length; i++) {
            (c[i] as HTMLDivElement).innerText = this.currentWord;
          }

          this.currentWordIndex++;
          this.workspace.metrics.current_word = this.currentWord;
          this.workspace.metrics.current_word_index = this.currentWordIndex;

          if (this.currentWordIndex >= this.currentLine.length) {
            this.numberOfLines++;
            this.workspace.metrics.iterations_so_far = this.numberOfLines;
            this.currentWordIndex = 0;
            this.yssCmdIndex = 0;
            this.yssLineIndex = Math.floor(Math.random() * this.yssLines.length);
            this.workspace.metrics.current_line_index = this.yssLineIndex;
            this.selected = this.yssLines[this.yssLineIndex];
            if (this.selected) {
              this.currentLine = this.selected.words.split(" ");
              this.applyYssBlockEntry(this.selected);
            }
          }

        }else{

          // YSS not activated.

          if(this.currentWordIndex < this.currentLine.split(" ").length){

            let c = document.getElementsByClassName("focus-line")
            for(let i = 0; i < c.length; i++) {
              (c[i] as HTMLDivElement).innerText = this.currentLine.split(" ")[this.currentWordIndex];
            }
            this.workspace.metrics.current_word_index = this.currentWordIndex;
            this.currentWord = this.currentLine.split(" ")[this.currentWordIndex];
            this.workspace.metrics.current_word = this.currentWord;

            this.currentWordIndex++;
          } else{
            // either pick a new line or check this.workspace.time
            this.numberOfLines++;
            this.currentWordIndex = 0;
            // choose a new line randomly
            let li = Math.floor(Math.random() * this.workspace.lines.length);
            this.workspace.metrics.current_line_index = li;
            this.currentLine = this.workspace.lines[li];
            this.workspace.metrics.iterations_so_far = this.numberOfLines;
            this.workspace.metrics.current_word_index = this.currentWordIndex;
            let c = document.getElementsByClassName("focus-line")
            for(let i = 0; i < c.length; i++) {
              (c[i] as HTMLDivElement).innerText = this.currentLine.split(" ")[this.currentWordIndex];
            }
          }
        }
        if(parseInt(this.workspace.time) <= this.numberOfLines) {
            if(this._service.disableEndCheck){
              this.numberOfLines = 0;
              this.currentWordIndex = 0;
            }else{
              this._update_completion_flag(true);
              clearInterval(this.iterator);
              return;
            }
        }

        // lastly, update the metrics in the service.

        //this.currentWordIndex++;
        //this.currentWord = this.currentLine.split(" ")[this.currentWordIndex];
        this.workspace.metrics.current_word = this.currentWord;
        this.workspace.metrics.current_line = Array.isArray(this.currentLine) ? this.currentLine.join(" ") : this.currentLine;
        this.workspace.metrics.current_line_length = this.currentLine.length;
        this._service.console_data.metrics = this.workspace.metrics;

      };
      this.iterator = setInterval(tick, this.get_configuration_element("word_duration"));
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
