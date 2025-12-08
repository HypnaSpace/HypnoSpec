import { Injectable } from '@angular/core';
import {sessionBaseRequirements} from "../session-base-requirements";
import {YuukSpaceScriptParserService} from "../custom/yuuk-space-script-parser.service";

@Injectable({
  providedIn: 'root'
})
export class HypnospecUtilsService {
  images: string[] = [];
  use_yss: boolean = false;
  vr: boolean = false;
  console_data = {
    metrics: {} as any
  };

  disabledImageArray: any[] = [];
  disableEndCheck: boolean = false;

  constructor(
    public yssService: YuukSpaceScriptParserService
  ) {
    console.log("[HypnoSpecUtilsService]: Initiated.");
    if(localStorage.getItem("ysVr") === "true"){
      this.vr = true;
      setTimeout(() => {
        localStorage.removeItem("ysVr");
      },2000);
    }
  }

  console: string[] = [];

  completionFlags: any[] = [];

  validateHypnoSpecMinimums(type: string, spec: any): boolean {
    let requirements = sessionBaseRequirements[type];
    if (!requirements) {
      throw new Error(`No requirements found for session type: ${type} and thats not a good thing.`);
    }
    console.debug(requirements);
    for (let item of requirements) {
      console.debug(item);
      for(let key in item){
        console.debug(key);
        switch(key){
          case "allOf":
            for (let req in item[key]){
              console.log("Checking Requirement allOf, ", req)
              if(req.includes("feature.content")){
                // check content array
                // checking for spec.content.features object has id matching req
                if(!(spec.content.features as any[]).some((feature: any) => feature.id === req)){
                  console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  return false;
                }
              }
              if(req.includes("feature.settings")){
                // check settings array
                // checking for spec.settings.features object has id matching req
                if(!(spec.settings.features as any[]).some((feature: any) => feature.id === req)){
                  console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  return false;
                }
              }
              if(req.includes("feature.spirals")){
                // check spirals array
                // checking for spec.spirals.features object has id matching req
                if(spec.spiral){
                  if(spec.spiral.id !== req){
                    console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                    this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                    return false;
                  }
                }else{
                  console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  return false;
                }
              }
              if(req.includes("feature.images")){
                if(spec.images){
                  if(spec.images.id !== req){
                    console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                    this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                    return false;
                  }
                }else{
                  console.error(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  this.console.push(`Required Feature Not Found: ${type}, requirement: ${req}`);
                  return false;
                }
              }
            }
            break;
          case "either":
            let found = false;
            console.log(item, item[key]);
            for (let req of item[key]) {

              console.table(
                [
                  ["Feature", "Is Content", "Is Settings", "Is Spiral", "Is Images"],
                  [
                    req,
                    req.includes("feature.content"),
                    req.includes("feature.settings"),
                    req.includes("feature.spirals"),
                    req.includes("feature.images")
                  ]
                ]
              )

              if (req.includes("feature.content")) {
                // check content array
                // checking for spec.content.features object has id matching req
                if ((spec.content.features as any[]).some((feature: any) => feature.id === req)) {
                  found = true;
                  break;
                }
              }
              if (req.includes("feature.settings")) {
                // check settings array
                // checking for spec.settings.features object has id matching req
                if ((spec.settings.features as any[]).some((feature: any) => feature.id === req)) {
                  found = true;
                  break;
                }
              }
              if (req.includes("feature.spirals")) {
                // check spirals array
                // checking for spec.spirals.features object has id matching req
                if (spec.spiral && spec.spiral.id === req) {
                  found = true;
                  break;
                }
              }
              if (req.includes("feature.images")) {
                if (spec.images && spec.images.id === req) {
                  found = true;
                  break;
                }
              }
            }

            if(!found){
              console.error(`Required Feature Not Found: ${type}, one of: ${item[key]}`);
              this.console.push(`Required Feature Not Found: ${type}, one of: ${item[key]}`);
              return false;
            }

            break;
          default:
            console.error(`Invalid requirement type: ${item[key]}`);
            this.console.push(`Invalid requirement type: ${item[key]}`);
            return false;
        }
      }
    }
    return true;

  }

}
