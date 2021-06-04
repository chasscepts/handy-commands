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
  private group = 'root';
  private activeCommands: ICommand[] = [];
  private npmScriptsCommands: ICommand[] = [];
  private onGroupChange: GroupChangeEventListener = defaultChangeHandler;

  static npmScriptsTag = 'Npm Scripts';

  constructor(memento: Memento) {
    this.store = new LocalStorage(memento);
    this.reset();
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
    if (group === CommandsBank.npmScriptsTag) {
      this.activeCommands = this.npmScriptsCommands.map((icommand) => icommand);
    } else if(group === 'root') {
      this.activeCommands = this.getGroups().map(
        (key) => ({ title: key, command: 'select-group', type: 'group' })
      );
    } else {
      const groups = this.store.commands[group];
      this.activeCommands = Object.keys(groups).map(
        (key) => ({ title: key, command: groups[key], type: 'command' })
      );
      this.store.setlastOpennedGroup(this.group);
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
    if (this.group && this.group !== CommandsBank.npmScriptsTag) {
      const result = this.store.createCommand(this.group, title, commandText);
      if (result) {
        this.activeCommands.push({ title: title, command: commandText, type: 'command' });
        this.raiseGroupChangedEvent();
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
          (key) => ({ title: key, command: group[key], type: 'command' })
        );
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
        this.reset();
      }
      return result;
    }
    return false;
  }

  getActiveCommands() {
    return this.activeCommands;
  }

  getGroups() {
    const groups = Object.keys(this.store.commands);
    if (this.npmScriptsCommands.length > 0) {
      groups.push(CommandsBank.npmScriptsTag);
    }
    return groups;
  }

  isEmpty() {
    if (this.npmScriptsCommands.length > 0) {
      return false;
    }
    return Object.keys(this.store.commands).length <= 0;
  }

  private reset() {
    if (this.group === CommandsBank.npmScriptsTag) {
      return;
    }
    const group = this.store.lastOpennedGroup;
    console.log('group', group);
    if (group) {
      const groups = this.store.commands[group];
      console.log(groups);
      if (groups) {
        this.activeCommands = Object.keys(groups).map(
          (key) => ({ title: key, command: groups[key], type: 'command' })
        );
        this.group = group;
        return;
      }
    }
    this.group = 'root';
    this.activeCommands = this.getGroups().map((key) => ({ title: key, command: 'select-group', type: 'group' }));
    this.raiseGroupChangedEvent();
  }

  private setupNpmScripts() {
    const npmScripts = new NpmScripts();
    npmScripts.setOnScriptsChangeListener((scripts) => {
      this.npmScriptsCommands = scripts;
      if (this.group === CommandsBank.npmScriptsTag) {
        if(scripts.length === 0 && this.activeCommands.length === 0){
          return;
        }
        this.selectGroup(CommandsBank.npmScriptsTag);
        return;
      }
      if (this.isRoot() && scripts.length > 0) {
        this.selectGroup(CommandsBank.npmScriptsTag);
      }
    });
  }

  private isRoot() {
    return this.group === 'root';
  }

  private raiseGroupChangedEvent() {
    const commands = this.group === null? [] : this.activeCommands;
    this.onGroupChange(this.group, commands);
  }

  private canDeleteGroup() {
    return this.group !== CommandsBank.npmScriptsTag;
  }

  private canDeleteCommand() {
    return this.group !== CommandsBank.npmScriptsTag;
  }

  private isValidGroupName(group: string) {
    return group !== CommandsBank.npmScriptsTag;
  }
}
