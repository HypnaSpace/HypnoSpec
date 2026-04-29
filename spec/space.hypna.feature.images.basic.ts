import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureImagesBasic extends  FeatureBase {

  interval: any;
  workspaceContainer!: HTMLDivElement;
  imagesContainer!: HTMLDivElement;
  imagesContainer2!: HTMLDivElement;

  override preload(): void {
    this.workspace.images = this.get_configuration_element("images_handled_by_outside_source") ? this._service.images : this.get_configuration_element("images");

    if(this.imagesContainer === undefined) {
      this._service.console.push(this._id + ": Drawing #images-holder");
      this.imagesContainer = document.createElement('div');
    }

    this.workspaceContainer = document.createElement('div');
    this.workspaceContainer.id = "workspace-container";
    this.workspaceContainer.classList.add('workspace-container');
    this.workspaceContainer.style.position = "absolute";
    this.workspaceContainer.style.top = "0";
    this.workspaceContainer.style.left = "0";
    this.workspaceContainer.style.width = "100vw";
    this.workspaceContainer.style.height = "100vh";
    this.workspaceContainer.style.zIndex = "1";

    if(this._service.vr){
      this.imagesContainer2 = document.createElement('div');
      this.imagesContainer2.id = "images-holder-2";
      this.imagesContainer2.classList.add('images-holder');
      this.imagesContainer2.style.position = "absolute";
      this.imagesContainer2.style.width = this._service.vr ? "50vw" : "100vw";
      this.imagesContainer2.style.height = "100vh";
      this.imagesContainer2.style.top = "0";
      this.imagesContainer2.style.left = "50vw";
      this.imagesContainer2.style.zIndex = "1";
    }
    this.imagesContainer.id = "images-holder";
    this.imagesContainer.classList.add('images-holder');
    this.imagesContainer.style.position = "flex";
    this.imagesContainer.style.width = this._service.vr ? "50vw" : "100vw";
    this.imagesContainer.style.height = "100vh";
    this.imagesContainer.style.zIndex = "1";


    document.body.appendChild(this.workspaceContainer);
    this.workspaceContainer = document.getElementById('workspace-container') as HTMLDivElement || this.workspaceContainer;
    this.workspaceContainer.appendChild(this.imagesContainer);
    if(this._service.vr){
      this.workspaceContainer.appendChild(this.imagesContainer2);
    }

    this._service.console.push(this._id + ": Adding CSS to document head");
    let styleElement: HTMLStyleElement = document.createElement('style');
    let css: any = `
.images-holder {
  animation: zoomin 1.5s linear infinite;
  background-repeat: repeat;
  background-position: center center;
  background-size: contain;
  overflow-x: hidden;
  overflow-y: hidden;
  overflow: hidden;
  overflow-scrolling: unset;
}

@-webkit-keyframes zoomin {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
    overflow: hidden;
  }

  100% {
    -webkit-transform: scale(1.25);
    transform: scale(1.25);
    overflow: hidden;
  }
}

@keyframes zoomin {
  0% {
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
    overflow: hidden;
  }

  /**
  60% {
    -webkit-transform: scale(0.9);
    -ms-transform: scale(0.9);
    transform: scale(0.9);
  }
**/

  100% {
    -webkit-transform: scale(1.25);
    -ms-transform: scale(1.25);
    transform: scale(1.25);
    overflow: hidden;
  }
 }
  `;
    styleElement.innerHTML = css;

    // dumbest hack in the world.

    document.head.appendChild(styleElement);
    setTimeout(() => {
          document.head.appendChild(styleElement);
    },1500)
    setTimeout(() => {
          document.head.appendChild(styleElement);
    },2000)


    this._service.console.push(this._id + ": Setting up interval.");
    this.interval = setInterval(() => {
      let c = document.getElementsByClassName("images-holder");
      let indx = Math.floor(Math.random() * this.workspace.images.length);
      // if image index is in this._service.disabledImageArray, try again
      while(this._service.disabledImageArray.includes(indx)){
        indx = Math.floor(Math.random() * this.workspace.images.length);
      }
      let r = this.workspace.images[indx];
      for (let i = 0; i < c.length; i++) {
        //console.log("_images", c[i]);
        (c[i] as HTMLDivElement).style.backgroundImage = "url("+r+")"
      }
    }, parseInt(this.get_configuration_element("switch_frequency").toString()));

  }

}
