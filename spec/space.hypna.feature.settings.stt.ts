import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsStt extends FeatureBase {

  override preload(): void {
    this._update_completion_flag(false);

    this.workspace.lines = this._get_item_from_register("space.hypna.feature.content.lines").get_configuration_element("lines");
    this.workspace.lines_processed = [];
    this.workspace.lines_index = 0;

    this.renderUI();

  }

  renderUI() {

    let css = `
    .container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      align-content: center;
      height:100vh;
    }

    .item-0 {

      flex-grow: 1;
      flex-shrink: 1;

      border: 1px solid black;
      position:relative;

    }

    #display-content {

      display: flex;
      flex-direction: column;
      align-items: stretch;
      align-content: center;
      position: absolute;
      bottom: 0;
      width: 100vw;

    }
    .container-item {
      flex-grow: 0;
      flex-shrink: 1;

      text-align: left;
      padding: 10px;

      font-size: larger;

    }

    `;

    let ui = `
        <div class="container">
          <div class="item-0">

            <div id="display-content">

            </div>

          </div>
          <div class="item-1">

            <button class="btn btn-dark btn-block btn-sm text-white" style="display: block; width: 100%; height: 15vh; padding: 10px 0px" id="anotherLine"">Yes</button>

          </div>
        </div>
    `;

    let cssC = document.createElement('style');
    cssC.innerHTML = css;
    document.head.appendChild(cssC);
    let uiC = document.createElement('div');
    uiC.innerHTML = ui;
    document.body.appendChild(uiC);

    let line = this.workspace.lines[this.workspace.lines_index]
    this.workspace.lines_processed.push(line);

    document.getElementById('display-content')!.insertAdjacentHTML('beforeend',`
      <div class="container-item">`+line+`</div>
    `)

    // anotherLine button click
    document.getElementById('anotherLine')!.addEventListener('click', () => {

      this.workspace.lines_index++;
      let line = this.workspace.lines[this.workspace.lines_index] || "";
      this.workspace.lines_processed.push(line);
      document.getElementById('display-content')!.insertAdjacentHTML('beforeend',`
      <div class="container-item">`+line+`</div>
      `)

      if(this.workspace.lines_processed.length >= this.workspace.lines.length){
        this._update_completion_flag(true);
      }

    });

  }

}
