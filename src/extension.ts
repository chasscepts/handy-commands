import * as vscode from 'vscode';
import CommandItem from './command';
import CommandsProvider from './commands-provider';
import LocalStorage from './storage';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const storage = new LocalStorage(context.globalState);
  const provider = new CommandsProvider(storage);
  const groupEmptyMessage = 'Groups Empty! Please add groups before running this command';

  // eslint-disable-next-line max-len
  const tree = vscode.window.createTreeView('handy-commands.commandTree', { treeDataProvider: provider });

  if (provider.group) {
    tree.title = `Handy Commands - ${provider.group}`;
  }

  context.subscriptions.push(tree);

  // execute-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.execute-command', (...args: any[]) => {
      args[0].run();
    })
  );

  // change-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.change-group', () => {
      if (storage.isEmpty()) {
        vscode.window.showInformationMessage(groupEmptyMessage);
        return;
      }

      vscode.window.showQuickPick(Object.keys(storage.commands)).then((group) => {
        if (!group || group === provider.group) {
          return;
        }
        provider.group = group;
        provider.refresh();
        tree.title = `Handy Commands - ${group}`;
      });
    })
  );

  // add-new-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.add-new-group', () => {
      vscode.window.showInputBox({ prompt: 'Please Enter Group Name' }).then((group) => {
        if (!group || !storage.createGroup(group)) {
          return;
        }
        provider.group = group;
        provider.refresh();
        tree.title = `Handy Commands - ${group}`;
      });
    })
  );

  // add-new-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.add-new-command', () => {
      if (!provider.group) {
        vscode.window.showErrorMessage('Please select a group to add command to!');
        return;
      }

      vscode.window.showInputBox({ prompt: 'Please Enter Command' }).then((command) => {
        if (!command) {
          return;
        }
        vscode.window.showInputBox({ prompt: 'Please Enter Command Label' }).then((label) => {
          if (!label || !storage.createCommand(provider.group, label, command)) {
            return;
          }
          provider.refresh();
        });
      });
    })
  );

  //delete-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-group', () => {
      if (!provider.group) {
        vscode.window.showErrorMessage('You have not selected any group yet!');
        return;
      }
      const prompt = `This group ${provider.group} and all it's commands will be deleted!`;
      vscode.window.showInformationMessage(prompt, 'Delete', 'Cancel').then((choice) => {
        if (choice !== 'Delete' || !storage.deleteGroup(provider.group)) {
          return;
        }
        provider.reset();
        provider.refresh();
        tree.title = provider.group ? `Handy Commands - ${provider.group}` : 'Handy Commands';
      });
    })
  );

  // delete-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-command', (item: CommandItem) => {
      if (!CommandItem) {
        vscode.window.showErrorMessage('Action Failed! It seems you did not select any command');
        return;
      }

      const prompt = 'This item will be deleted';
      vscode.window.showInformationMessage(prompt, 'Delete', 'Cancel').then((choice) => {
        if (choice !== 'Delete' || !storage.deleteCommand(item)) {
          return;
        }
        provider.refresh();
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
