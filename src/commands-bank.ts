import { Memento } from "vscode";
import ICommand from "./icommand";
import NpmScripts from "./npm-scripts";
import LocalStorage from "./storage";

const defaultChangeHandler = (group: string | null, commands: ICommand[]) => {};

interface GroupChangeEventListener {
  (group: string | null, commands: ICommand[]): void;
}

export default class CommandsBank {
  private store: LocalStorage;
  private storeKeys: string[] = [];
  //private npmScripts: NpmScripts;
  private group: string | null = null;
  private activeCommands: ICommand[] = [];
  private npmScriptsTag = 'Npm Scripts';
  private npmScriptsCommands: ICommand[] = [];
  private onGroupChange: GroupChangeEventListener = defaultChangeHandler;

  constructor(memento: Memento) {
    this.store = new LocalStorage(memento);
    this.resetGroup(false);
    this.setupNpmScripts();
  }

  setOnChangeListener(listener: GroupChangeEventListener | null) {
    if (listener !== null) {
      this.onGroupChange = listener;
      listener(this.group, this.activeCommands);
    }
    else {
      this.onGroupChange = defaultChangeHandler;
    }
  }

  getSelectedGroup() {
    return this.group;
  }

  selectGroup(group: string): void {
    this.group = group;
    if (group === this.npmScriptsTag) {
      this.activeCommands = this.npmScriptsCommands.map((icommand) => icommand);
    } else if (group === this.group) {
      return;
    } else {
      const groups = this.store.commands[group];
      this.activeCommands = Object.keys(groups).map(
        (key) => ({ title: key, command: groups[key] })
      );
    }
    this.raiseGroupChangedEvent();
  }

  createGroup(group: string) {
    if (!this.isValidGroupName(group)) {
      return false;
    }
    const result = this.store.createGroup(group);
    if (result) {
      this.group = group;
      this.activeCommands = [];
      this.raiseGroupChangedEvent();
    }
    return result;
  }

  createCommand(title: string, commandText: string) {
    if (this.group && this.group !== this.npmScriptsTag) {
      const result = this.store.createCommand(this.group, title, commandText);
      if (result) {
        this.activeCommands.push({ title: title, command: commandText });
        this.raiseGroupChangedEvent();
      }
      return result;
    }
    return false;
  }

  deleteGroup() {
    if (this.group && this.canDeleteGroup()) {
      const result = this.store.deleteGroup(this.group);
      if (result) {
        this.resetGroup(true);
      }
      return result;
    }
    return false;
  }

  deleteCommand(title: string) {
    if (this.canDeleteCommand() && this.group) {
      const result = this.store.deleteCommand(this.group, title);
      if (result) {
        const group = this.store.commands[this.group];
        this.activeCommands = Object.keys(group).map(
          (key) => ({ title: key, command: group[key] })
        );
        this.raiseGroupChangedEvent();
      }
      return result;
    }
    return false;
  }

  getActiveCommands() {
    return this.activeCommands;
  }

  getGroups() {
    const groups = [...this.storeKeys];
    if (this.npmScriptsCommands.length > 0) {
      groups.push(this.npmScriptsTag);
    }
    return groups;
  }

  isEmpty() {
    if (this.npmScriptsCommands.length > 0) {
      return false;
    }
    return this.storeKeys.length <= 0;
  }

  private resetGroup(includeNpm = true) {
    this.group = null;
    const groups = Object.keys(this.store.commands);
    this.storeKeys = groups;
    if (groups.length > 0) {
      this.group = groups[0];
      const selectedGroup = this.store.commands[this.group];
      this.activeCommands = Object.keys(selectedGroup).map(
        key => ({title: key, command: selectedGroup[key]})
      );
    }
    else if (NpmScripts.length > 0) {
      this.group = this.npmScriptsTag;
      this.activeCommands = this.npmScriptsCommands;
    }
    else {
      this.activeCommands = [];
    }
    this.raiseGroupChangedEvent();
  }

  private raiseGroupChangedEvent() {
    const commands = this.group === null? [] : this.activeCommands;
    this.onGroupChange(this.group, this.activeCommands);
  }

  private canDeleteGroup() {
    return this.group !== this.npmScriptsTag;
  }

  private canDeleteCommand() {
    return this.group !== this.npmScriptsTag;
  }

  private isValidGroupName(group: string) {
    return group !== this.npmScriptsTag;
  }

  private setupNpmScripts() {
    const npmScripts = new NpmScripts();
    npmScripts.setOnScriptsChangeListener((scripts) => {
      this.npmScriptsCommands = scripts;
      if (this.group === this.npmScriptsTag) {
        if(scripts.length === 0 && this.activeCommands.length === 0){
          return;
        }
        this.selectGroup(this.npmScriptsTag);
        return;
      }
      if (!this.group && scripts.length > 0) {
        this.selectGroup(this.npmScriptsTag);
      }
    });
  }
}
