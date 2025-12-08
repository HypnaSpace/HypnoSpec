import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsWlt extends FeatureBase {

  header!: HTMLDivElement;
  lineHolder!: HTMLDivElement;
  hiddenMobileKeyboard!: HTMLInputElement;
  stats!: HTMLDivElement;
  textContainer!: HTMLDivElement;
  showKeyboardButton!: HTMLButtonElement;

  override preload(): void {

    let css = document.createElement("style");
    css.innerHTML = `
      .ui-element {
        width: 100vw;
        color: white;
        display: block;
      }

      .hidden {
        display: none;
      }

      #line-holder {
        overflow-y: scroll !important;
        height: 64vh;
        scroll-behavior: auto;
        display: flex;
        flex-direction: column-reverse;
      }

      .blinking-cursor {
        font-weight: 100;
        font-size: 30px;
        color: #2E3D48;
        -webkit-animation: 1s blink step-end infinite;
        -moz-animation: 1s blink step-end infinite;
        -ms-animation: 1s blink step-end infinite;
        -o-animation: 1s blink step-end infinite;
        animation: 1s blink step-end infinite;
      }

      @keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-moz-keyframes blink {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-webkit-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-ms-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-o-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }


    `;
    document.head.appendChild(css);


    this._update_completion_flag(false);

    this.workspace.time_container = this._get_item_from_register("space.hypna.feature.content.time");
    this.workspace.line_container = this._get_item_from_register("space.hypna.feature.content.text");
    this.workspace.text = this.workspace.line_container.get_configuration_element("text");
    this.workspace.toDo = parseInt(this.workspace.time_container.get_configuration_element("time")) || 10;
    this.workspace.punishment = this.get_configuration_element("punishment");
    this.workspace.interrupters = this.get_configuration_element("interrupters");
    this.workspace.interrupters_enabled = this.get_configuration_element("interrupters_enabled") || false;
    this.workspace.overlay_display_time = this.get_configuration_element("overlay_display_time") || "3000";
    this.workspace.interrupters_frequency = this.get_configuration_element("interrupters_frequency") || "40";
    this.workspace.add_lines_as_punishment = this.get_configuration_element("add_lines_as_punishment") || 0;
    this.workspace.interrupters_freq_random = this.get_configuration_element("interrupters_freq_random") || true;

    this.workspace.nextLetter = this.workspace.text[0];
    this.workspace.currentLetterIndex = 0;

    this.workspace.distractor_trigger_number = Math.floor(parseInt(this.workspace.interrupters_frequency.toString()) * (1 + Math.random() * 0.4 - 0.2))
    this.workspace.distractor_counter = 0;

    this.workspace.mistakeCounter = 0;

    this.workspace.linesWritten = 0;

    this.workspace.wordString = "";

    this.workspace.isReadOnly = false;


    this.lineHolder = document.createElement("div");
    this.lineHolder.id = "line-holder";
    this.textContainer = document.createElement("div");
    this.hiddenMobileKeyboard = document.createElement("input");
    this.stats = document.createElement("div");
    this.showKeyboardButton = document.createElement("button");
    this.header = document.createElement("div");
    this.lineHolder.classList.add("ui-element");
    this.textContainer.classList.add("ui-element");
    this.hiddenMobileKeyboard.classList.add("ui-element");
    this.hiddenMobileKeyboard.style.color = "black";
    this.stats.classList.add("ui-element");
    this.showKeyboardButton.classList.add("ui-element");
    this.header.classList.add("ui-element");

    this.renderUI();

    // add a global keystroke listener
    document.addEventListener("keyup", (event) => {
      if(!this.workspace.isReadOnly){
        console.table({
        'letterIndex': this.workspace.currentLetterIndex,
        'distractorTriggerNumber': this.workspace.distractor_trigger_number,
        'distractorCounter': this.workspace.distractor_counter,
        'nextLetter': this.workspace.nextLetter,
      })

      let lcel = this.workspace.wordString + event.key;
    let lc = lcel.charAt(lcel.length - 1);
    // filter out non-alphabetic characters
    let ignoredKeys = ['Shift', 'Control', 'CapsLock', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Tab', 'Enter']
    if(ignoredKeys.includes(event.key) || this.workspace.isReadOnly){
      // ignore the event
      return;
    }

    if(this.workspace.nextLetter === lc){
      this.workspace.currentLetterIndex++;
      this.workspace.wordString = lcel;
      // get number of characters in the model line
      if(this.workspace.text.length <= this.workspace.currentLetterIndex){
        // we've reached the end.
        this.workspace.linesWritten++;
        document.getElementById('line-holder')!.insertAdjacentHTML('afterbegin', '<p>'+lcel+' <span style="color: green">&checkmark;</span></p>');
        (document.getElementById('line-holder') as unknown as HTMLDivElement).scrollTop = (document.getElementById('line-holder') as unknown as HTMLDivElement).scrollHeight;
        this.workspace.currentLetterIndex = 0;
        this.workspace.nextLetter = this.workspace.text[0];
        this.workspace.wordString = "";

        if(parseInt(this.workspace.linesWritten) >= parseInt(this.workspace.toDo)) {
          this._update_completion_flag(true);
        }

      }else{
        this.workspace.nextLetter = this.workspace.text[this.workspace.currentLetterIndex];
        this.workspace.wordString = lcel;

        if(this.workspace.interrupters_enabled) {
          if(this.workspace.distractor_trigger_number <= this.workspace.distractor_counter) {
            this.workspace.distractor_counter = 0;
            this.displayDistractor();
            this.workspace.distractor_trigger_number = Math.floor(parseInt(this.workspace.interrupters_frequency.toString()) * (1 + Math.random() * 0.4 - 0.2))
          }
          this.workspace.distractor_counter++;
        }

      }

      this.updateUI();
    }else{
      this.workspace.mistakeCounter++;
      this.workspace.currentLetterIndex = 0;
      this.workspace.nextLetter = this.workspace.text[0];
      document.getElementById('line-holder')!.insertAdjacentHTML('afterbegin','<p>'+lcel+' <span style="color: red">&cross;</span></p>');
      (document.getElementById('line-holder') as unknown as HTMLDivElement).scrollTop = (document.getElementById('line-holder') as unknown as HTMLDivElement).scrollHeight;
      this.workspace.wordString = "";
      this.updateUI();
      this.renderPunishment();
    }
      }


    });


  }

  renderUI() {
    this.header.insertAdjacentHTML('beforeend', "<p>You will type the following phrase....</p>");
    this.header.insertAdjacentHTML('beforeend', "<h3 style='text-align: center;'>"+this.workspace.text+"</h3>");
    this.header.insertAdjacentHTML('beforeend', "<p>... <span class='total-counter'></span> times</p>");
    this.header.insertAdjacentHTML('beforeend', "<br>");
    document.body.append(this.header);
    document.body.append(this.lineHolder);
    document.body.append(this.hiddenMobileKeyboard);

    // "width: 100vw; height: 40px; text-align: center; background: white; cursor: text"
    this.textContainer.style.width = "100vw";
    this.textContainer.style.height = "40px";
    this.textContainer.style.textAlign = "center";
    this.textContainer.style.backgroundColor = "white";
    this.textContainer.style.cursor = "text";

    this.textContainer.insertAdjacentHTML('beforeend', '<p style="color: black;"><span class="wordString"></span><span class="blinking-cursor">|</span></p>')

    document.body.append(this.textContainer);

    this.stats.style.textAlign = "center";
    this.stats.insertAdjacentHTML('beforeend', "<p><strong>Mistakes: </strong><span class='mistake-counter'></span></p>");
    this.stats.insertAdjacentHTML('beforeend', "<p><strong>Lines Left to Write: </strong><span class='left-to-write-counter'></span></p>");
    this.stats.insertAdjacentHTML('beforeend', "<p><strong>Number of Lines Total: </strong><span class='total-counter'></span></p>");
    this.stats.insertAdjacentHTML('beforeend', "<p><strong>Lines Completed: </strong><span id='lines-counter'></span></p>")

    document.body.append(this.stats);

    this.updateElement("mistake-counter", this.workspace.mistakeCounter);
    this.updateElement("left-to-write-counter", this.workspace.toDo - this.workspace.linesWritten);
    this.updateElement("total-counter", this.workspace.toDo);
    this.updateElement("lines-counter", this.workspace.linesWritten);

  }

  renderPunishment() {
    this.workspace.toDo = parseInt(this.workspace.toDo) + parseInt(this.workspace.add_lines_as_punishment);

    let punDom = document.createElement("div");
    punDom.style.backgroundColor = "black";
    punDom.style.color = "white";
    punDom.style.zIndex = "9999";
    punDom.style.position = "absolute";
    punDom.style.top = "0";
    punDom.style.left = "0";
    punDom.style.width = "100vw";
    punDom.style.height = "100vh";
    punDom.style.display = "flex";
    punDom.style.justifyContent = "center";
    punDom.style.alignItems = "center";
    let line = this.workspace.punishment[Math.floor(Math.random() * this.workspace.punishment.length)]
    punDom.innerHTML = line;
    document.body.appendChild(punDom);
    this.workspace.isReadOnly = true;
    setTimeout(() => {
      this.workspace.isReadOnly = false;
      punDom.remove();
    }, parseInt(this.workspace.overlay_display_time.toString()) + ((line.split(" ").length / 5) * 500));
  }

  updateElement(cls: string, value: number) {
    let elements = document.getElementsByClassName(cls);
    for (let i = 0; i < elements.length; i++) {
      (elements[i] as HTMLDivElement).innerText = value.toString();
    }
  }

  updateUI() {
    this.updateElement("mistake-counter", this.workspace.mistakeCounter);
    this.updateElement("left-to-write-counter", this.workspace.toDo - this.workspace.linesWritten);
    this.updateElement("total-counter", this.workspace.toDo);
    this.updateElement("lines-counter", this.workspace.linesWritten);
    this.updateElement("wordString", this.workspace.wordString);
  }

  displayDistractor() {
    let punDom = document.createElement("div");
    punDom.style.backgroundColor = "black";
    punDom.style.color = "white";
    punDom.style.zIndex = "9999";
    punDom.style.position = "absolute";
    punDom.style.top = "0";
    punDom.style.left = "0";
    punDom.style.width = "100vw";
    punDom.style.height = "100vh";
    punDom.style.display = "flex";
    punDom.style.justifyContent = "center";
    punDom.style.alignItems = "center";
    let line = this.workspace.interrupters[Math.floor(Math.random() * this.workspace.interrupters.length)]
    punDom.innerHTML = line;
    document.body.appendChild(punDom);
    this.workspace.isReadOnly = true;
    setTimeout(() => {
      this.workspace.isReadOnly = false;
      punDom.remove();
    }, parseInt(this.workspace.overlay_display_time.toString()) + ((line.split(" ").length / 5) * 500));
  }
}
