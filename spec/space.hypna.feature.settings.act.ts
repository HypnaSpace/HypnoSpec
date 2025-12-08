import {FeatureBase} from "./space.hypna.feature._base";

export class SpaceHypnaFeatureSettingsAct extends FeatureBase {

  headerDiv!: HTMLDivElement;
  textBox!: HTMLDivElement;
  doneButton!: HTMLButtonElement;

  override preload(): void {
    this._update_completion_flag(false);
    this.headerDiv = document.createElement('div');
    this.textBox = document.createElement('div');
    this.doneButton = document.createElement('button');

    this.headerDiv.id = 'instructions';
    this.headerDiv.style.width = '100vw';
    this.headerDiv.style.height = '10vh';
    this.headerDiv.style.color = 'white';
    this.textBox.id = 'text-box';
    this.textBox.style.width = '100vw';
    this.textBox.style.height = '25vh';
    this.textBox.style.color = 'white';
    this.doneButton.id = 'done-button';
    this.doneButton.style.width = '100vw';
    this.doneButton.style.display = 'block';

    this.headerDiv.innerHTML = "<h4>Your Task</h4>";
    this.textBox.innerText = this._get_item_from_register("space.hypna.feature.content.text").get_configuration_element("text");
    this.doneButton.innerText = "Click here to Complete Your Task";
    this.doneButton.addEventListener('click', () => {
      this._update_completion_flag(true);
      this._service.console.push(`Completed feature ${this._id}`);
    });
    document.body.appendChild(this.headerDiv);
    document.body.appendChild(this.textBox);
    document.body.appendChild(this.doneButton);
  }
}
