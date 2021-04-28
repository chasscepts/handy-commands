import * as vscode from 'vscode';
import CommandItem from './command';
import CommandsBank from './commands-bank';
import CommandsProvider from './commands-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  const provider = new CommandsProvider();
   // eslint-disable-next-line max-len
   const tree = vscode.window.createTreeView('handy-commands.commandTree', { treeDataProvider: provider });

  const bank = new CommandsBank(context.globalState);

  bank.setOnChangeListener((group, commands) => {
    if (group !== null) {
      vscode.commands.executeCommand('setContext', 'hasGroups', true);
      provider.setGroup(group, commands);
      tree.title = `HC - ${group}`;
    } else {
      vscode.commands.executeCommand('setContext', 'hasGroups', false);
      tree.title = 'Handy Commands';
    }
  });

  const groupEmptyMessage = 'Groups Empty! Please add groups before running this command';

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
      if (bank.isEmpty()) {
        vscode.window.showInformationMessage(groupEmptyMessage);
        return;
      }

      vscode.window.showQuickPick(bank.getGroups()).then((group) => {
        if (!group || group === bank.getSelectedGroup()) {
          return;
        }
        bank.selectGroup(group);
      });
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

  // add-new-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.add-new-command', () => {
      if (!bank.getSelectedGroup()) {
        vscode.window.showErrorMessage('Please select a group to add command to!');
        return;
      }

      vscode.window.showInputBox({ prompt: 'Please Enter Command' }).then((command) => {
        if (!command) {
          return;
        }
        vscode.window.showInputBox({ prompt: 'Please Enter Command Label' }).then((label) => {
          if (!label) {
            return;
          }
          if (!bank.createCommand(label, command)) {
            vscode.window.showErrorMessage("Unable to create command. Please try again.");
          }
        });
      });
    })
  );

  //delete-group
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-group', () => {
      if (!bank.getSelectedGroup()) {
        vscode.window.showErrorMessage('You have not selected any group yet!');
        return;
      }
      const prompt = `This group ${bank.getSelectedGroup()} and all it's commands will be deleted!`;
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

  // delete-command
  context.subscriptions.push(
    vscode.commands.registerCommand('handy-commands.delete-command', (item: CommandItem) => {
      if (!(item && item.label)) {
        vscode.window.showErrorMessage('Action Failed! It seems you did not select any command');
        return;
      }

      const prompt = 'This item will be deleted';
      vscode.window.showInformationMessage(prompt, 'Delete', 'Cancel').then((choice) => {
        if (!(choice && item && item.label)) {
          return;
        }
        if (!bank.deleteCommand(item.label.toString())) {
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
