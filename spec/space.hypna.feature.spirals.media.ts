import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureSpiralsMedia extends FeatureBase {

  spiralDOMElement!: HTMLDivElement;
  spiralDOMElement2!: HTMLDivElement;

  override preload(): void {
    if(this.spiralDOMElement === undefined){
      this._service.console.push(this._id+": Drawing #spiral-holder");
      this.spiralDOMElement = document.createElement('div');
      this.spiralDOMElement.id = "spiral-holder";
      this.spiralDOMElement.classList.add('focus-spiral');
      this.spiralDOMElement.style.position = "absolute";
      this.spiralDOMElement.style.top = "0";
      this.spiralDOMElement.style.left = "0";
      this.spiralDOMElement.style.width = this._service.vr ? "50vw" : "100vw";
      this.spiralDOMElement.style.height = "100vh";
      this.spiralDOMElement.style.opacity = this.get_configuration_element('media_opacity');
      if(this.get_configuration_element('media_is_image') === true) {
        this.spiralDOMElement.style.backgroundImage = `url(${this.get_configuration_element('media_url')})`;
        this.spiralDOMElement.style.backgroundSize = "cover";
        this.spiralDOMElement.style.backgroundPosition = "center center";
        this.spiralDOMElement.style.backgroundRepeat = "no-repeat";
        this.spiralDOMElement.style.zIndex = "2";
      }else{
        // add a video element here
        let v: HTMLVideoElement = document.createElement('video');
        v.src = this.get_configuration_element('media_url');
        v.style.width = this._service.vr ? "50vw" : "100vw";
        v.style.height = "100vh";
        this.spiralDOMElement.appendChild(v);
        this.spiralDOMElement.style.zIndex = "2";
        this.spiralDOMElement.style.opacity = this.get_configuration_element('media_opacity');
        v.play();
      }




      if(this._service.vr){
        // draw 1
        this.spiralDOMElement2 = document.createElement("div");
        this.spiralDOMElement2.id = "spiral-holder-2";
        this.spiralDOMElement2.classList.add("focus-spiral");
        this.spiralDOMElement2.style.width = "50vw";
        this.spiralDOMElement2.style.height = "100vh";
        this.spiralDOMElement2.style.top = "0";
        this.spiralDOMElement2.style.left = "50vw";
        this.spiralDOMElement2.style.zIndex = "2";
        this.spiralDOMElement2.style.position = "absolute";
        this.spiralDOMElement2.style.backgroundImage = `url(${this.get_configuration_element('media_url')})`;
        this.spiralDOMElement2.style.backgroundSize = "cover";
        this.spiralDOMElement2.style.backgroundPosition = "center center";
        this.spiralDOMElement2.style.backgroundRepeat = "no-repeat";
        this.spiralDOMElement2.style.zIndex = "2";
        this.spiralDOMElement2.style.opacity = this.get_configuration_element('media_opacity');
        document.body.appendChild(this.spiralDOMElement2);
      }


      document.body.appendChild(this.spiralDOMElement);

    }
  }

  override unload() {

    if(this.spiralDOMElement){
      this.spiralDOMElement.remove();
    }
    if(this.spiralDOMElement2){
      this.spiralDOMElement2.remove();
    }
  }

}
