import { Injectable } from '@angular/core';
import { Session } from '../../models/session';
import { YSScript } from '../../models/ysscript';
import { defaultGlobalSettings } from '../../models/default-global-settings';

/**
 * A single command parsed out of a `[...]` token.
 */
export interface YssCommand {
  type: string;          // 'anchor' | 'controller' | 'sound' | 'block' | 'setting.*' | 'style.*'
  value?: string;        // right-hand side of `key=value`
  id?: string | null;    // ;id=… (anchor name, block name, or the block a setting/style targets)
  goto?: string;         // ;goto=… (block=end only)
  apply?: string;        // ;apply=… (style only): number of lines, or 'always'
  fade?: number;         // ;fade=… (setting.spiral.* only): ease to the value over this many ms
  block?: string | null; // the block this token appeared inside
}

/**
 * Something that can change a live spiral variable — the active spiral feature
 * registers itself here at preload so `[setting.spiral.*]` commands have a
 * target. `name` is the setting/uniform name (`spin_speed`, `zoom`,
 * `spiral_color`, `opacity`, or a custom GLSL uniform), `value` the raw string
 * from the script. Returns false when the variable could not be applied.
 */
export interface YssSpiralTarget {
  setSpiralVariable(name: string, value: string, fadeMs?: number): boolean;
}

/**
 * One playable line after compilation: display text with `[*]` placeholders
 * where inline commands were, the inline commands in order, and — on the first
 * line of each block instance — the settings/styles to apply on entry.
 */
export interface YssLine {
  words: string;
  cmds: YssCommand[];
  block: string;
  enterBlock?: { settings: YssCommand[]; styles: YssCommand[] };
}

export interface CompiledYss {
  lines: YssLine[];
  controller: 'sequential' | 'random';
  global_settings: any;
}

interface YssBlock {
  lines: YssLine[];
  settings: YssCommand[];
  styles: YssCommand[];
  goto?: string;
}

/**
 * YuukSpace Script (YSS) engine.
 *
 * A YSS script is the content lines, reinterpreted when the `yss` feature is
 * enabled. Each line may contain `[command]` tokens and plain words. Commands:
 *
 *   Singletons:  [anchor;id=x]  [controller=sequential|random]  [sound=file]
 *                [style.text.main.color=#f00;apply=2]  [setting.spirals.line_duration=1500;id=block]
 *   Spiral:      [setting.spiral.spin_speed=3]  [setting.spiral.zoom=2;fade=3000]
 *                [setting.spiral.spiral_color=#ff0000]  [setting.spiral.opacity=0.5]
 *                [setting.spiral.<uniform>=1,0.5]  (any float/vec uniform a custom shader declares)
 *   Blocks:      [block=start;id=x]  …lines…  [block=end;id=x;goto=y]
 *
 * Spiral settings target the live WebGL spiral (webgl or customgl feature)
 * and, like styles, may sit inline in a line (fired when playback reaches
 * them) or alone on a line (applied when the block is entered).
 *
 * `compile()` turns the raw script into an ordered, finite list of playable
 * lines: blocks are assembled, the controller decides their order
 * (sequential = source order, random = shuffled), `goto` on a block's end jumps
 * to another block/anchor, and the whole thing is flattened with a hard cap so a
 * `goto` loop can never hang the session. The settings/session feature (BST/MST)
 * then just walks that list.
 *
 * This replaces an earlier draft where blocks/controller/goto were parsed but
 * never applied, inline commands never fired (an unpopulated `currentActions`),
 * and a `while (word === '[*]')` guard could hang.
 */
@Injectable({
  providedIn: 'root',
})
export class YuukSpaceScriptParserService {
  public defaultGlobalSettings: any = defaultGlobalSettings;

  /** Hard ceiling on emitted lines — bounds intentional `goto` loops so a
   *  cyclic script produces a long-but-finite sequence instead of hanging. */
  static readonly DEFAULT_MAX_LINES = 2000;

  currentBlock: string | null = null;

  /** The live spiral, if one is mounted; set by the spiral feature at preload. */
  spiral: YssSpiralTarget | null = null;

  constructor() {}

  // -- classification helpers ------------------------------------------------

  private isSetting(type: string): boolean {
    return typeof type === 'string' && type.startsWith('setting.');
  }

  private isStyle(type: string): boolean {
    return typeof type === 'string' && type.startsWith('style.');
  }

  /** `setting.spiral.<name>` — a live spiral variable (see YssSpiralTarget). */
  isSpiralSetting(type: string): boolean {
    return typeof type === 'string' && type.startsWith('setting.spiral.') && type.length > 'setting.spiral.'.length;
  }

  /** Commands that may sit inline in a content line (fired as playback reaches
   *  them) rather than only on block entry. */
  private isInlineCapable(type: string): boolean {
    return type === 'sound' || this.isStyle(type) || this.isSpiralSetting(type);
  }

  /** Split on the FIRST '=' only, so values may themselves contain '='. */
  private splitFirst(text: string, sep: string): [string, string | undefined] {
    const i = text.indexOf(sep);
    if (i === -1) return [text, undefined];
    return [text.slice(0, i), text.slice(i + 1)];
  }

  // -- tokenizing ------------------------------------------------------------

  /** Parse a single `[…]` token into a command. */
  processCommand(token: string): YssCommand {
    const inner = token.replace(/^\[/, '').replace(/\]$/, '');
    const [head, ...args] = inner.split(';');
    const [key, value] = this.splitFirst(head, '=');

    const cmd: YssCommand = { type: key, value, id: null, block: this.currentBlock };
    for (const arg of args) {
      const [argKey, argVal] = this.splitFirst(arg, '=');
      if (argKey === 'id') cmd.id = argVal ?? null;
      else if (argKey === 'goto') cmd.goto = argVal;
      else if (argKey === 'apply') cmd.apply = argVal;
      else if (argKey === 'fade') {
        const ms = parseFloat(argVal ?? '');
        if (isFinite(ms) && ms > 0) cmd.fade = ms;
      }
    }

    // Block state is threaded through the tokenizer so lines know which block
    // they belong to (block=start enters, block=end leaves to the default).
    if (key === 'block') {
      if (value === 'start') this.currentBlock = cmd.id || null;
      else if (value === 'end') this.currentBlock = null;
    }

    if (!this.isSetting(key) && !this.isStyle(key) &&
        !['anchor', 'controller', 'sound', 'block'].includes(key)) {
      console.error(`YSS: invalid command: ${key}`);
    }
    return cmd;
  }

  /** Tokenize a raw line into `{ words, cmds, block }`. `words` keeps the plain
   *  text with each `[…]` token replaced by a `[*]` placeholder. */
  processLine(line: string): YssLine {
    const before: string | null = this.currentBlock;
    const tokens = line.match(/\[(.*?)\]/g)?.map((t) => t.trim()) ?? [];
    const cmds = tokens.map((t) => this.processCommand(t));
    const words = line.replace(/\[(.*?)\]/g, '[*]');
    // A line's block is where its *content* lives: the block it opened (if it
    // starts one) or the block it was already in.
    const block = this.currentBlock || before || '_default';
    return { words, cmds, block };
  }

  /** Split a whole script into tokenized lines (block state reset first). */
  process(script: string): YssLine[] {
    this.currentBlock = null;
    return (script ?? '').split('\n').map((line) => this.processLine(line));
  }

  // -- compilation -----------------------------------------------------------

  private shuffle<T>(items: T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /**
   * Compile a raw script into an ordered, finite list of playable lines.
   * `maxLines` caps the output so a `goto` cycle terminates.
   */
  compile(script: string, maxLines: number = YuukSpaceScriptParserService.DEFAULT_MAX_LINES): CompiledYss {
    this.currentBlock = null;

    const blockOrder: string[] = ['_default'];
    const blocks: Record<string, YssBlock> = { _default: { lines: [], settings: [], styles: [] } };
    const anchors: Record<string, string> = {}; // anchor/block id -> block id
    let controller: 'sequential' | 'random' = 'sequential';

    const ensureBlock = (id: string) => {
      if (!blocks[id]) {
        blocks[id] = { lines: [], settings: [], styles: [] };
        blockOrder.push(id);
      }
    };

    for (const raw of (script ?? '').split('\n')) {
      const before: string | null = this.currentBlock;
      const line = this.processLine(raw); // updates this.currentBlock via block=start/end
      const enteredBlock: string | null = this.currentBlock; // after processing this line's tokens

      for (const cmd of line.cmds) {
        if (cmd.type === 'controller') {
          controller = cmd.value === 'random' ? 'random' : 'sequential';
        } else if (cmd.type === 'block' && cmd.value === 'start') {
          const id = cmd.id || `_b${blockOrder.length}`;
          ensureBlock(id);
          anchors[id] = id;
        } else if (cmd.type === 'block' && cmd.value === 'end') {
          const id = cmd.id || before || '_default';
          if (cmd.goto && blocks[id]) blocks[id].goto = cmd.goto;
        } else if (cmd.type === 'anchor' && cmd.id) {
          anchors[cmd.id] = before || '_default';
        } else if (this.isSpiralSetting(cmd.type)) {
          // Like styles: inline when the line has text, block-level otherwise.
          const isInline = line.words.replace(/\[\*\]/g, '').trim().length > 0;
          if (!isInline) {
            const target = cmd.id && blocks[cmd.id] ? cmd.id : enteredBlock || before || '_default';
            ensureBlock(target);
            blocks[target].settings.push(cmd);
          }
        } else if (this.isSetting(cmd.type)) {
          const target = cmd.id && blocks[cmd.id] ? cmd.id : enteredBlock || before || '_default';
          ensureBlock(target);
          blocks[target].settings.push(cmd);
        } else if (this.isStyle(cmd.type)) {
          // A style on a line with actual text is inline (attached to the line
          // below); a style on its own is block-level (applied on entry).
          const isInline = line.words.replace(/\[\*\]/g, '').trim().length > 0;
          if (!isInline) {
            const target = cmd.id && blocks[cmd.id] ? cmd.id : enteredBlock || before || '_default';
            ensureBlock(target);
            blocks[target].styles.push(cmd);
          }
        }
      }

      // A content line has real text; attach the runnable inline commands.
      const text = line.words.replace(/\[\*\]/g, '').trim();
      if (text.length > 0) {
        const b = blocks[line.block] ? line.block : '_default';
        const inline = line.cmds.filter((c) => this.isInlineCapable(c.type));
        blocks[b].lines.push({ words: line.words, cmds: inline, block: b });
      }
    }

    // Execution order: only blocks that actually have content.
    let order = blockOrder.filter((id) => blocks[id].lines.length > 0);
    if (controller === 'random') order = this.shuffle(order);

    const out: YssLine[] = [];
    if (order.length > 0) {
      let pos = 0;
      let guard = 0;
      const guardCap = maxLines * 4 + order.length + 1;
      while (pos >= 0 && pos < order.length && out.length < maxLines && guard < guardCap) {
        guard++;
        const blk = blocks[order[pos]];
        blk.lines.forEach((ln, i) => {
          if (out.length >= maxLines) return;
          out.push(
            i === 0
              ? { ...ln, enterBlock: { settings: blk.settings, styles: blk.styles } }
              : { ...ln },
          );
        });
        if (blk.goto) {
          const target = anchors[blk.goto] ?? blk.goto;
          pos = order.indexOf(target); // not found -> -1 -> sequence ends
        } else {
          pos += 1;
        }
      }
    }

    return { lines: out, controller, global_settings: this.defaultGlobalSettings };
  }

  // -- inline command execution ---------------------------------------------

  /** Run an inline command against the live DOM (sound + text styling) or the
   *  live spiral (`setting.spiral.*`). Other block settings (durations,
   *  session type) are handled by the feature on entry, not here — those
   *  cannot be applied mid-word. */
  runCommand(cmd: YssCommand | undefined | null): void {
    if (!cmd || !cmd.type) return;

    if (this.isSpiralSetting(cmd.type)) {
      this.runSpiralSetting(cmd);
      return;
    }

    if (cmd.type === 'sound') {
      try {
        const audio = new Audio(cmd.value);
        document.body.appendChild(audio);
        audio.play().catch(() => undefined);
        audio.addEventListener('ended', () => audio.remove());
      } catch (e) {
        console.error('YSS: could not play sound', cmd, e);
      }
      return;
    }

    if (this.isStyle(cmd.type)) {
      const targets = document.getElementsByClassName('focus-line');
      for (let i = 0; i < targets.length; i++) {
        const el = targets[i] as HTMLElement;
        switch (cmd.type) {
          case 'style.text.main.add_class':
            if (cmd.value) el.classList.add(cmd.value);
            break;
          case 'style.text.main.color':
            el.style.color = cmd.value ?? '';
            break;
          case 'style.text.main.size':
            el.style.fontSize = cmd.value ?? '';
            break;
          case 'style.text.main.font_family':
            el.style.fontFamily = cmd.value ?? '';
            break;
          default:
            break;
        }
      }
      return;
    }

    if (this.isSetting(cmd.type)) {
      console.warn('YSS: settings cannot be applied inline, only on block entry:', cmd);
    }
  }

  /** Apply a `setting.spiral.<name>` command to the mounted spiral, if any. */
  runSpiralSetting(cmd: YssCommand): boolean {
    if (!this.isSpiralSetting(cmd.type)) return false;
    const name = cmd.type.slice('setting.spiral.'.length);
    if (!this.spiral) {
      console.warn('YSS: no live spiral to apply setting to:', cmd.type);
      return false;
    }
    const ok = this.spiral.setSpiralVariable(name, cmd.value ?? '', cmd.fade ?? 0);
    if (!ok) console.warn('YSS: spiral setting rejected:', cmd.type, cmd.value);
    return ok;
  }

  // -- legacy shape kept for compatibility ----------------------------------

  /** Retained for the older `session.data.raw_script` entry point. */
  renderScript(session: Session, global_settings: any = null): YSScript {
    const compiled = this.compile((session as any)?.data?.raw_script ?? '');
    return {
      blocks: [],
      global_settings: global_settings ?? this.defaultGlobalSettings,
      session_linear: compiled.lines,
    };
  }
}
