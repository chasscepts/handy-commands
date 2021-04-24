import * as assert from 'assert';
// import { suite, test } from 'mocha';
import { TreeItemCollapsibleState } from 'vscode';
import CommandItem from '../../command';

describe ('CommandItem', () => {
  describe ('Initialization', () => {
    const commandItem = new CommandItem('test', 'label', 'parent');
    it ('Correctly sets collapsible state to none', () => {
      assert(commandItem.collapsibleState === TreeItemCollapsibleState.None);
    });

    it ('Correctly sets up a command', () => {
      const command = commandItem.command;
      assert(command?.command === 'test' &&
        command.title === 'label' &&
        command.arguments &&
        command.arguments[0] === commandItem);
    });
  });
});

/*
suite('CommandItem Initialization', () => {
  const commandItem = new CommandItem('test', 'label', 'parent');
  test ('Correctly sets collapsible state to none', () => {
    assert(commandItem.collapsibleState === TreeItemCollapsibleState.None);
  });

  test ('Correctly sets up a command', () => {
    const command = commandItem.command;
    assert(command?.command === 'test' &&
      command.title === 'label' &&
      command.arguments &&
      command.arguments[0] === commandItem);
  });
});
*/
