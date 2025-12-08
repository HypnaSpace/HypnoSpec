import {FeatureBase} from "./space.hypna.feature._base";


export class SpaceHypnaFeatureSettingsAudio extends FeatureBase {

  audioInterval: any;
  audioFinallyLoaded: boolean = false;

  override preload(): void {
    this._service.console.push(this._id+": Setting up audio");
    this.workspace.audio = this.get_configuration_element("url");

    if(this.workspace.audio === undefined || this.workspace.audio === null || this.workspace.audio === "") {
      console.warn(this._id+": No audio URL provided. Audio feature will not be activated.");
      return;
    }

    let audioEl = document.createElement('audio');
    audioEl.src = this.workspace.audio;
    document.body.appendChild(audioEl);
    audioEl.loop = true;
    audioEl.load();
    audioEl.play();

        this.audioInterval = setInterval(() => {
            console.log("Still looping audio...")
            try{

              audioEl.play().catch((reason) => {

              }).then((yes) => {

              });


            }catch(e){
              console.error(e);
            }
              if(!audioEl.paused){
                    this.audioFinallyLoaded = true;
              }


            if(this.audioFinallyLoaded){
              clearInterval(this.audioInterval);
            }

          },1000);

  }
}
