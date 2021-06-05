import * as vscode from 'vscode';

export default class CommandItem extends vscode.TreeItem {
  commandText: string;
  name: string;
  group: string;
  type: string;

  constructor(label: string, commandText: string, group: string, type: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.commandText = commandText;
    this.group = group;
    this.name = label;
    this.type = type;
    this.command = {
      title: label,
      command: 'handy-commands.execute-command',
      arguments: [this],
    };
    this.tooltip = commandText;
  }

  run() {
    const terminal = this.getTerminal();

    terminal.sendText(this.commandText, true);
  }

  paste() {
    const terminal = this.getTerminal();

    terminal.sendText(this.commandText, false);
  }

  private getTerminal(): vscode.Terminal {
    vscode.window.showInformationMessage(this.commandText);
    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
      terminal = vscode.window.createTerminal();
    }

    terminal.show(false);
    return terminal;
  }
}
