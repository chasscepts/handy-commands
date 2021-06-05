import { group } from 'node:console';
import * as vscode from 'vscode';
import CommandItem from './command';
import CommandsBank from './commands-bank';
import CommandsProvider from './commands-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const provider = new CommandsProvider();
  const tree = vscode.window.createTreeView(
    'handy-commands.commandTree',
    { treeDataProvider: provider },
  );

  const bank = new CommandsBank(context.globalState);

  bank.setOnChangeListener((group, commands) => {
    if (!group) {
      return;
    }
    provider.setGroup(group, commands);
    if (group !== 'root') {
      vscode.commands.executeCommand('setContext', 'isRoot', false);
      tree.title = `HC - ${group}`;
    } else {
      vscode.commands.executeCommand('setContext', 'isRoot', true);
      tree.title = 'Handy Commands';
    }
    vscode.commands.executeCommand('setContext', 'isNpmScript', group === CommandsBank.npmScriptsTag);
    vscode.commands.executeCommand('setContext', 'isEmpty', commands.length <= 0);
  });

  const groupEmptyMessage = 'Groups Empty! Please add groups before running this command';

  context.subscriptions.push(tree);

  // execute-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.execute-command', (...args: any[]) => {
      const arg = args[0];
      if (arg.type === 'group') {
        bank.selectGroup(arg.name);
      } else {
        arg.run();
      }
    })
  );

  // select-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.select-group', () => {
      bank.selectGroup('root');
    })
  );

  // add-new-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.add-new-group', () => {
      vscode.window.showInputBox({ prompt: 'Please Enter Group Name' }).then((group) => {
        if (!group) {
          return;
        }
        if (!bank.createGroup(group)) {
          vscode.window.showErrorMessage("Unable to create group. Please try again.");
        }
      });
    })
  );

  // delete-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-group', () => {
      const prompt = "This group and all it's items will be deleted";
      vscode.window.showInformationMessage(prompt, 'Delete', 'Cancel').then((choice) => {
        if (!choice) {
          return;
        }
        if (!bank.deleteGroup()) {
          vscode.window.showErrorMessage("Unable to delete group. Please try again.");
        }
      });
    })
  );

  // add-new-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.add-new-command', () => {
      if (!bank.getSelectedGroup()) {
        vscode.window.showErrorMessage('Please select a group to add command to!');
        return;
      }

      vscode.window.showInputBox({ prompt: 'Please Enter Command Label' }).then((label) => {
        if (!label) {
          return;
        }
        vscode.window.showInputBox({ prompt: 'Please Enter Command' }).then((command) => {
          if (!command) {
            return;
          }
          if (!bank.createCommand(label, command)) {
            vscode.window.showErrorMessage("Unable to create command. Please try again.");
          }
        });
      });
    })
  );

  // delete-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-command', (item: CommandItem) => {
      if (!(item && item.label)) {
        vscode.window.showErrorMessage('Action Failed! It seems you did not select any command');
        return;
      }

      const prompt = 'This item will be deleted';
      vscode.window.showInformationMessage(prompt, 'Delete', 'Cancel').then((choice) => {
        if (!choice) {
          return;
        }
        const label = item.label?.toString();
        if (!label) {
          return;
        }
        if (!bank.deleteCommand(label)) {
          vscode.window.showErrorMessage("Unable to delete command. Please try again.");
        }
      });
    })
  );

  // paste-to-terminal
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.paste-to-terminal', (item: CommandItem) => {
      if (!CommandItem) {
        vscode.window.showErrorMessage('Action Failed! It seems you did not select any command');
        return;
      }

      item.paste();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
