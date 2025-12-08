import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureSettingsEct extends FeatureBase {

  override preload(): void {

    this._update_completion_flag(false);
    this.workspace.text = this._get_item_from_register("space.hypna.feature.content.text").get_configuration_element("text");
    this.workspace.time = this._get_item_from_register("space.hypna.feature.content.time").get_configuration_element("time") || "5";
    this.workspace.punishment = this.get_configuration_element("punishment") || [];
    this.workspace.wrongWords = this.get_configuration_element("wrongWords") || [];
    this.workspace.builtPhrase = this.workspace.text.split(" ");
    this.workspace.phraseBreak = [];
    this.workspace.phraseIndex = 0;
    this.workspace.countComplete = 0;
    this.workspace.isReadOnly = false;

    console.log({
      "text": this.workspace.text,
      "time": this.workspace.time,
      "punishment": this.workspace.punishment,
      "wrongWords": this.workspace.wrongWords,
      "phraseBreak": this.workspace.phraseBreak,
      "builtPhrase": this.workspace.builtPhrase,

    })


    this.renderUI();
    this.renderButtons();

  }

  renderUI() {

    let s = document.createElement("style");
    s.innerHTML = `
      .button {
      cursor: pointer;
      padding: 40px;
      display: flex;
      border: 1px solid white;
      color: white;
      width: 100%;
      height: 15vh;
      margin: 10px
      justify-content: center;
      align-items: center;
      font-size: 24px;
      text-align: center;
      }
    `;


    let r = document.createElement("div");
    r.innerHTML = `
      <p>Complete the phrase <span class="times"></span> times by using the buttons below</p>
      <p style="padding-top: 15px; background: #222; height: 3em; display: flex; justify-content: center; align-content: center"><span class="phrase-container">`+this.workspace.text+`</span></p>
      <div id="buttons-top" style="display: flex; flex-direction: row; width: 100vw; min-height: 25vh;">
      </div>
      <div id="buttons-bottom" style="display: flex; flex-direction: row; width: 100vw; min-height: 25vh;">
      </div>
    `;

    document.body.appendChild(s);
    document.body.appendChild(r);

    this.updateElement("times", this.workspace.time);
  }

  updateUI() {
    this.updateElement("phrase-container", this.workspace.phraseBreak.join(" ") || "");
    this.updateElement("times", this.workspace.time);
  }

  renderButtons() {
    this.generateNewWords();

    // destroy all button event listeners
    (document.querySelectorAll(".button") as unknown as any).forEach((button: HTMLDivElement) => {
      button.removeEventListener("click", () => {});
    });

    document.getElementById("buttons-top")!.innerHTML = `
      <div class="button" data-text="`+this.workspace.phrases[0]+`" >`+this.workspace.phrases[0]+`</div>
      <div class="button" data-text="`+this.workspace.phrases[1]+`" >`+this.workspace.phrases[1]+`</div>
    `;
    document.getElementById("buttons-bottom")!.innerHTML = `
      <div class="button" data-text="`+this.workspace.phrases[2]+`">`+this.workspace.phrases[2]+`</div>
      <div class="button" data-text="`+this.workspace.phrases[3]+`">`+this.workspace.phrases[3]+`</div>
    `;

    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener("click", (event) => {
        this.handleButtonClick(event.target);
      });
    });
  }

  generateNewWords() {

    this.workspace.phrases = [];

    function shuffle(array: any[]) {
      let currentIndex = array.length, randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }

    this.workspace.phrases.push(this.workspace.wrongWords[Math.floor(Math.random() * this.workspace.wrongWords.length)]);
    this.workspace.phrases.push(this.workspace.wrongWords[Math.floor(Math.random() * this.workspace.wrongWords.length)]);
    this.workspace.phrases.push(this.workspace.wrongWords[Math.floor(Math.random() * this.workspace.wrongWords.length)]);
    console.log(this.workspace.builtPhrase, this.workspace.builtPhrase[this.workspace.phraseIndex], this.workspace.builtPhrase[1]);
    this.workspace.phrases.push(this.workspace.builtPhrase[this.workspace.phraseIndex]);
    console.log("before shuffle", this.workspace.phrases);
    this.workspace.phrases = shuffle(this.workspace.phrases);
  }

  updateElement(cls: string, text: string) {
    let els = document.getElementsByClassName(cls);
    for (let i = 0; i < els.length; i++) {
      (els[i] as HTMLElement).innerText = text;
    }
  }


  private handleButtonClick(target: EventTarget | null) {
    console.log(target);

    let ta = (target as HTMLDivElement).getAttribute("data-text");
    if (ta === this.workspace.builtPhrase[this.workspace.phraseIndex]) {
      this.workspace.phraseBreak.push(ta);
      this.workspace.phraseIndex++;
      if (this.workspace.phraseIndex >= this.workspace.builtPhrase.length) {
        this.workspace.phraseIndex = 0;
        this.workspace.countComplete++;
        this.workspace.phraseBreak = [];
        this.updateUI();
        this.renderButtons();

        if(this.workspace.countComplete >= this.workspace.time) {
          this._update_completion_flag(true);
        }

      } else {
        this.renderButtons();
        this.updateUI();
      }
    }else{
      this.workspace.phraseIndex = 0;
      this.workspace.phraseBreak = [];
      this.updateUI();
      this.renderPunishment();

    }

  }

  renderPunishment() {

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
      this.renderButtons();
      punDom.remove();
    }, 2000 + ((line.split(" ").length / 5) * 500));
  }

}
