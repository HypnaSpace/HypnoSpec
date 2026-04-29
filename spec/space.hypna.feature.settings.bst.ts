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

  override preload(): void {
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


      this.iterator = setInterval(() => {


        if(this._service.use_yss && !this.yssActivated){
            console.warn(this._id, "YSS is activated, reconfiguring session.")
            this.yssActivated = true;
            this.workspace.lines = this._service.yssService.process(this.workspace.lines.join('\n'))
            console.log("Processed script: ", this.workspace.lines)
            this.selected = this.workspace.lines[Math.floor(this._service.vr ? Math.random() : Math.random() * this.workspace.lines.length)];
            this.currentWordIndex = 0;
        }


          // choose a new line randomly
        if(this.yssActivated){

          // YSS Activated.

          /**
          if(this.currentWordIndex >= this.selected.words.split(" ").length){
            this.numberOfLines++;
            this.currentWordIndex = 0;
            this.selected = this.workspace.lines[Math.floor(Math.random() * this.workspace.lines.length)];
          } **/

          let t = this.currentWord;

          this.currentLine = this.selected.words.split(" ");
          this.currentWord = this.currentLine[this.currentWordIndex] || t;
          this.currentWordIndex++;
          this.workspace.metrics.current_word = this.currentWord;

          while(this.currentWord === '[*]'){
            this.processCommand(t);
          }
          console.log("Render Word", this.currentWord);
          let c = document.getElementsByClassName("focus-line")
          for(let i = 0; i < c.length; i++) {
            (c[i] as HTMLDivElement).innerText = this.currentWord;
          }

          this.workspace.metrics.current_word = this.currentWord;
          this.workspace.metrics.current_word_index = this.currentWordIndex;

          if(this.currentWordIndex > this.currentLine.length){
              this.numberOfLines++;
              this.workspace.metrics.iterations_so_far = this.numberOfLines;
              this.currentWordIndex = 0;
              this.actionCounter = 0;
              // choose a new line randomly
              let li = Math.floor(Math.random() * this.workspace.lines.length);
              this.selected = this.workspace.lines[li];
              this.workspace.metrics.current_line_index = li;
              this.currentLine = this.selected.words.split(" ");
              let c = document.getElementsByClassName("focus-line")

              while(this.currentWord === '[*]'){
              /*console.log("Action Counter: ", this.actionCounter);
              console.log('Setting command', this.currentActions[this.actionCounter]);
              console.log("Immediate Next Word: ", this.currentLine[this.currentWordIndex + 1]);
              let storedCommand = this.currentActions[this.actionCounter];
              this.currentWord = this.currentLine[this.currentWordIndex + 1] || undefined;
              if(this.currentWord === undefined || this.currentWord === ''){
                setTimeout(() => {
                  console.log('Running command Delayed', this.currentActions[this.actionCounter]);
                  this._service.yssService.runCommand(storedCommand, null);
                  this.actionCounter++;
                }, parseInt(this.workspace.word_duration.toString()) * 2);
                this.currentWord = this.currentLine[this.currentWordIndex - 1] || t;
              }else{
                console.log('Running command normally', this.currentActions[this.actionCounter]);
                this._service.yssService.runCommand(storedCommand,null);
                this.actionCounter++;
                this.currentWordIndex++;
              }*/
                this.processCommand(t);
              }

            this.workspace.metrics.current_word_index = this.currentWordIndex;
            this.workspace.metrics.current_word = this.currentWord;
              for(let i = 0; i < c.length; i++) {
                (c[i] as HTMLDivElement).innerText = this.currentWord;
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
        this.workspace.metrics.current_line = this.currentLine.join(" ");
        this.workspace.metrics.current_line_length = this.currentLine.length;
        this._service.console_data.metrics = this.workspace.metrics;

      }, this.get_configuration_element("word_duration"));

    }else{
      this._service.console.push("["+this._id+"] Could not fetch required content containers. Be sure that you have registered them first before calling this settings module.");
      this._update_completion_flag(true);
    }
  }

  processCommand(t: string = '') {
                console.log("Action Counter: ", this.actionCounter);
            console.log('Setting command', this.currentActions[this.actionCounter]);
            console.log("Immediate Next Word: ", this.currentLine[this.currentWordIndex + 1]);
            let storedCommand = this.currentActions[this.actionCounter];
            this.currentWord = this.currentLine[this.currentWordIndex + 1] || this.currentLine[this.currentWordIndex - 1] || this.currentLine[this.currentWordIndex];
            if(this.currentWord === undefined || this.currentWord === ''){
              setTimeout(() => {
                console.log('Running command Delayed', this.currentActions[this.actionCounter]);
                this._service.yssService.runCommand(storedCommand, null);
                this.actionCounter++;
              }, parseInt(this.workspace.word_duration.toString()) * 2);
              this.currentWord = this.currentLine[this.currentWordIndex - 1] || t;
            }else{
              console.log('Running command normally', this.currentActions[this.actionCounter]);
              this._service.yssService.runCommand(storedCommand,null);
              this.actionCounter++;
              this.currentWordIndex++;
            }
  }

}
