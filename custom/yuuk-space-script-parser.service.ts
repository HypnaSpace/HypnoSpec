import { Injectable } from '@angular/core';
import {single} from "rxjs";
import {Session} from "../../models/session";
import {YSScript} from "../../models/ysscript";
import {defaultGlobalSettings} from "../../models/default-global-settings";

@Injectable({
  providedIn: 'root'
})
export class YuukSpaceScriptParserService {

  public defaultGlobalSettings: any = defaultGlobalSettings;

  constructor() { }

  /**
   * - Singletons
   * [anchor]
   * [setting.element=value]
   * [controller=sequential]
   * [style.text.main.color=#FF0000]
   * [style.text.main.size=24px]
   * [style.text.main.weight=bold]
   * [style.text.main.additional_class=class1]
   * [style.text.distractors.color=#0000FF]
   * [style.text.distractors.size=18px]
   * [style.text.distractors.weight=normal]
   * [style.text.distractors.additional_class=class2]
   * [sound=file.mp3]
   * - Blocks
   * [block=start]
   * [block=end]
   * - Parameters
   * [anchor;id=first]
   * [block=start;id=something]
   * [block=end;id=something;goto=first]
   * - List of Singletons
   * anchor: sets an anchor point
   * setting.el=val: sets a setting with name "el" to value "val". if has an id, will set setting for a block with that
   * controller: sets the controller for the session. Default Sequential. Will go down the list in order. Optional, random: Will generate a random list of the blocks then follow that list.
   * - List of Blocks
   * [block=start] starts a new block
   * [block=end] ends the current block. Optional goto parameter will go to the ID with that name.
   *
   * - List of Parameters
   *
   * id = Anchor point, must be unique, must start with a letter, must have no spaces, and must be unique (except block=end)
   * goto = For Block=End. ID to go to when block=end is reached. If not present, it will go to the next block.
   * apply = For Style.*, Sound.*. Determines if the Singleton applies for x number of lines or the word "always". Defaults to 1 if not present.
   *
   */

  sampleScript: string = `[anchor;id=top]
[setting.session.type=bst]
[setting.spirals.line_duration=1500]
[controller=random]
[block=start;id=initial]
[setting.session.type=mst;id=initial]
[setting.spirals.line_duration=2000;id=initial]
[style.text.main.color=#FF0000;apply=1] This is a test of the first block
Second line
Third Line[sound=/static/testing/ding.mp3]
[block=end;id=initial]
[block=start;id=bsttest]
[setting.session.type=bst;id=msttest]
[setting.spirals.line_duration=1000;id=msttest]
This is a test of the BST block
BST block tests are cool [sound=/static/testing/ding.mp3]
[style.text.main.color=#FF0000;apply=1] BST application is fun
[block=end;id=bsttest]`


  acceptableCommands: string[] = [
      'anchor',
      'controller',
      'sound',
      'block'
  ];
  styleCommands: string[] = [
      'style.text.main.add_class',
      'style.text.main.color',
      'style.text.main.size',
      'style.text.main.font_family',
  ];
  settingCommand: string[] = [
      'setting.session.type',
      'setting.spirals.line_duration',
      'setting.spirals.loops',
  ]

  settings: any = {

  }
  blocks: any = [

  ]

  currentBlock: any = null;

  loadBlockyScript(script: YSScript): YSScript{
    for (let i = 0; i < script.blocks.length; i++) {
      for (let j = 0; j < script.blocks[i].lines; j++) {
        script.session_linear.push(script.blocks[i].lines[j]);
      }
    }

    return script;
  }

  renderScript(session: Session, global_settings: any = null): YSScript {
    console.log("Rendering script for session", session);
    if(global_settings === null) {
      global_settings = this.defaultGlobalSettings;
    }

    let script: YSScript = {
      blocks: [],
      global_settings: global_settings,
      session_linear: []
    }

    script.blocks.push({
      id: '_default',
      settings: [],
      style: [],
      lines: []
    })

    // let's get this hellhole started.
    script.session_linear = this.process(session.data.raw_script);
    // first, let's get all the overridden settings from linear output.
    for (let i = 0; i < script.session_linear.length; i++) {
      console.log("values", script.session_linear[i].words.trim().replace('[*]', '').trim().length);

      if(script.session_linear[i].block !== null){
        script.blocks[script.blocks.findIndex(b => b.id === script.session_linear[i].block)].lines.push(script.session_linear[i]);
      }else{
        script.blocks[0].lines.push(script.session_linear[i]);
      }

      if(script.session_linear[i].cmds.length != 0 && script.session_linear[i].block !== null && script.session_linear[i].words.trim().replace('[*]', '').trim().length === 0){
        // this filter should return pure settings only that are assigned to a block.
        for (let j = 0; j < script.session_linear[i].cmds.length; j++) {
          switch(script.session_linear[i].cmds[j].type) {
            case 'block':
              console.log("Handling BLOCK command", script.session_linear[i].cmds[j]);
              if (script.session_linear[i].cmds[j].value === 'start') {
                script.blocks.push({
                  id: script.session_linear[i].cmds[j].id,
                  settings: [],
                  style: [],
                  lines: [script.session_linear[i]]
                });
              }
              break;
            case this.settingCommand.find(s => s.includes(script.session_linear[i].cmds[j].type)) !== undefined ? script.session_linear[i].cmds[j].type : false:
              // find a block in script.block with id and add setting to array
              for (let k = 0; k < script.blocks.length; k++) {
                if(script.blocks[k].id === script.session_linear[i].cmds[j].id){
                  script.blocks[k].settings.push(script.session_linear[i].cmds[j]);
                  break;
                }
              }
              break;
              //script.session_linear[i].cmds[j].type
            case this.styleCommands.find(s => s.includes(script.session_linear[i].cmds[j].type)) !== undefined ? script.session_linear[i].cmds[j].type : false:
              // find a block in script.block with id and add style to array
              for (let k = 0; k < script.blocks.length; k++) {
                if(script.blocks[k].id === script.session_linear[i].cmds[j].id){
                  script.blocks[k].style.push(script.session_linear[i].cmds[j]);
                  break;
                }
              }
              break;
            default:
              break;
          }
        }

      }
    }

    if(script.blocks[0].lines.length > 0){
      script.blocks[0].settings.push(this.processLine("[setting.session.type=mst;id=_default]").cmds[0])
    }

    return script;

  }

  processCommand(cmd: string){
    console.log(cmd);
    const [command,...args] = cmd.replace('[','').replace(']','').split(';');
    // singleton commands accepted list
    const acceptableCommands = [
      'anchor',
      'controller',
      'sound',
      'block'
    ];
    const styleCommands = [
      'style.text.main.add_class',
      'style.text.main.color',
      'style.text.main.size',
      'style.text.main.font_family',
    ];
    const settingCommands = [
      'setting.session.type',
      'setting.spirals.line_duration',
      'setting.spirals.loops',
    ]
    let singleton: any = {
      type: null,
      value: null,
      id: null
    }
    let acceptableArgs = [];
    console.log("Switching on", command.split('=')[0]);
    console.log("setting check", settingCommands.find(s => s === command.split('=')[0]) !== undefined ? command.split('=')[0] : false);
    console.log("style check", styleCommands.find(s => s === command.split('=')[0]) !== undefined ? command.split('=')[0] : false)
    switch(command.split('=')[0]){
      case 'anchor':

        singleton = {
          type: 'anchor',
          id: null,
          block: this.currentBlock
        }

        acceptableArgs = ['id'];
        //find in args if it contains an acceptable arg before the = sign
        for (let i = 0; i < args.length; i++) {
          if(acceptableArgs.includes(args[i].split('=')[0])){
            singleton.id = args[i].split('=')[1];
          }
        }
        console.log("anchor", singleton);
        // anchor is finished.
        break;
      case 'controller':
        singleton = {
          type: command.split('=')[0],
          value: command.split('=')[1],
          block: this.currentBlock
        }
        break;
      case 'sound':
        singleton = {
          type: command.split('=')[0],
          value: command.split('=')[1],
          block: this.currentBlock
        }

        break;
      case settingCommands.find(s => s.includes(command.split('=')[0])) !== undefined ? command.split('=')[0] : false:
        singleton = {
          type: command.split('=')[0],
          value: command.split('=')[1],
          id: null,
          block: this.currentBlock
        }
        acceptableArgs = ['id'];
        for (let i = 0; i < args.length; i++) {
          if(acceptableArgs.includes(args[i].split('=')[0])){
            singleton[args[i].split('=')[0]] = args[i].split('=')[1];
          }
        }
        break;
      case styleCommands.find(s => s.includes(command.split('=')[0])) !== undefined ? command.split('=')[0] : false:
        singleton = {
          type: command.split('=')[0],
          value: command.split('=')[1],
          apply: '1',
          id: null,
          block: this.currentBlock
        }
        acceptableArgs = ['id', 'apply'];
        for (let i = 0; i < args.length; i++) {
          if(acceptableArgs.includes(args[i].split('=')[0])){
            singleton[args[i].split('=')[0]] = args[i].split('=')[1];
          }
        }
        break;
      case 'block':

        singleton = {
          type: 'block',
          value: command.split('=')[1],
          id: null,
          block: this.currentBlock
        }
        if(singleton.value ==='start'){
          acceptableArgs = ['id'];
          for (let i = 0; i < args.length; i++) {
          if(acceptableArgs.includes(args[i].split('=')[0])){
            singleton.id = args[i].split('=')[1];
            this.currentBlock = singleton.id;
            singleton.block = this.currentBlock;
            break;
          }
        }
        }
        if(singleton.value === 'end'){
          acceptableArgs = ['id', 'goto'];
          for (let i = 0; i < args.length; i++) {
            if(acceptableArgs.includes(args[i].split('=')[0])){
              singleton.id = args[i].split('=')[1];
            }
            if(args[i].split('=')[0] === 'goto'){
              singleton.goto = args[i].split('=')[1];
            }
            this.currentBlock = null;
            singleton.block = null;
          }
        }
        break;
      case 'apply':
      default:
        console.error(`Invalid command: ${command}`);
        break;
    }
    return singleton;
  }

  processLine(line: string){
    // remove brackets and split by spaces
    // regex find
    let cmds = [];
    const parts: string[] = line.match(/\[(.*?)\]/g)?.map(part => part.trim()) || [];
    for (let i = 0; i < parts.length; i++) {
      cmds.push(this.processCommand(parts[i]));
    }
    let words = line.replace(/\[(.*?)\]/g, '[*]');
    return {
      words: words,
      cmds: cmds,
      block: this.currentBlock || '_default',
    }
  }

  process(script: string){
    const lines = script.split('\n');
    let processed: any[] = [];
    lines.forEach((line, index) => {
      let result = this.processLine(line);
      processed.push(result);
    })
    return processed;
  }

  runCommand(cmd: any, settings: Session | null) {
    let template = {
          type: '',
          value: '',
          apply: '',
          id: '',
          block: ''
    }

    const acceptableCommands = [
      'anchor',
      'controller',
      'sound',
      'block'
    ];
    const styleCommands = [
      'style.text.main.add_class',
      'style.text.main.color',
      'style.text.main.size',
      'style.text.main.font_family',
    ];
    const settingCommands = [
      'setting.session.type',
      'setting.spirals.line_duration',
      'setting.spirals.loops',
    ]

    if(cmd === undefined){
      console.info("Command is undefined. Skipping as complete.");
      return;
    }

    switch(cmd.type){
      case 'anchor':
      case 'controller':
      case 'setting':
      case 'style':
        break;
      case settingCommands.find(s => s.includes(cmd.type)) !== undefined ? cmd.type : false:
        console.error("Can't run settings changes inline. Offending Line: ", cmd);
        break;
      case styleCommands.find(s => s.includes(cmd.type)) !== undefined ? cmd.type : false:
        if(cmd.type.includes('text.main')) {
          switch (cmd.type) {
            case 'style.text.main.add_class':
              console.log("Adding class", cmd.value, "to .focus-line");
              document.querySelector(`.focus-line`)?.classList.add(cmd.value);
              break;
            case 'style.text.main.color':
              console.log("Changing color to", cmd.value, "on .focus-line");
              (document.querySelector(`.focus-line`) as unknown as HTMLElement).style.color = cmd.value;
              break;
            case 'style.text.main.size':
              console.log("Changing size to", cmd.value, "on .focus-line");
              (document.querySelector(`.focus-line`) as unknown as HTMLElement).style.fontSize = cmd.value;
              break;
            case 'style.text.main.font_family':
              console.log("Changing font family to", cmd.value, "on .focus-line");
              (document.querySelector(`.focus-line`) as unknown as HTMLElement).style.fontFamily = cmd.value;
              break;
            default:
              break;
          }
        }
        break;
      case 'sound':
        try{
          console.log("Playing sound", cmd.value);
          // play sound by adding to document.body then play it.
        let el = new Audio(cmd.value);
        document.body.appendChild(el);
        el.play().then(r => console.log("Played sound:", r));
        // now delete it.
        el.addEventListener('ended', () => document.body.removeChild(el));
        }catch(e){
          console.error("Can't play sound inline. Offending Line: ", cmd);
        }
          break;
        default:
          break;
        }
    }

}
