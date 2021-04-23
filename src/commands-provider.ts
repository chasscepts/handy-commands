/* eslint-disable class-methods-use-this */
import {
  TreeDataProvider, TreeItem, Event, EventEmitter, commands,
} from 'vscode';

import CommandItem from './command';
import LocalStorage from './storage';

export default class CommandsProvider implements TreeDataProvider<CommandItem> {
  group: string;

  constructor(private storage: LocalStorage) {
    [this.group] = Object.keys(this.storage.commands);
    this.setHasGroupsContext();
  }

  getTreeItem(element: CommandItem): TreeItem {
    return element;
  }

  getChildren(element?: CommandItem) {
    if (element || !this.group) {
      return Promise.resolve([]);
    }
    return Promise.resolve(this.getCommands());
  }

  // eslint-disable-next-line max-len
  pOnDidChangeTreeData: EventEmitter<CommandItem | undefined | null | void> = new EventEmitter<CommandItem | undefined | null | void>();

  // eslint-disable-next-line max-len
  onDidChangeTreeData: Event<CommandItem | undefined | null | void> = this.pOnDidChangeTreeData.event;

  refresh(): void {
    this.pOnDidChangeTreeData.fire();
    this.setHasGroupsContext();
  }

  reset(): void {
    [this.group] = Object.keys(this.storage.commands);
    this.setHasGroupsContext();
  }

  private getCommands = () => {
    const group = this.storage.commands[this.group];
    return Object.keys(group).map((key) => new CommandItem(key, group[key], this.group));
  };

  private setHasGroupsContext = () => {
    // Has one or more groups saved
    const hasGroups = Object.keys(this.storage.commands).length > 0;
    commands.executeCommand('setContext', 'hasGroups', hasGroups);
  };
}
