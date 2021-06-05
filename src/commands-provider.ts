/* eslint-disable class-methods-use-this */
import {
  TreeDataProvider, TreeItem, Event, EventEmitter, commands,
} from 'vscode';

import CommandItem from './command';
import ICommand from './icommand';

export default class CommandsProvider implements TreeDataProvider<CommandItem> {
  private commands: ICommand[] = [];
  private group: string = '';

  getTreeItem(element: CommandItem): TreeItem {
    return element;
  }

  getChildren(element?: CommandItem) {
    const commands = !element?
      this.commands.map(
        (command) => new CommandItem(command.title, command.command, this.group, command.type)
      ) : [];
    return Promise.resolve(commands);
  }

  // eslint-disable-next-line max-len
  pOnDidChangeTreeData: EventEmitter<CommandItem | undefined | null | void> = new EventEmitter<CommandItem | undefined | null | void>();

  // eslint-disable-next-line max-len
  onDidChangeTreeData: Event<CommandItem | undefined | null | void> = this.pOnDidChangeTreeData.event;

  setGroup(group: string, commands: ICommand[]) {
    this.group = group;
    this.commands = commands;
    this.pOnDidChangeTreeData.fire();
  }
}
