import { Memento } from "vscode";
import CommandItem from "./command";

const STORAGE_KEY = 'handy-commands.storage.STORAGE_KEY';

export default class LocalStorage {
  commands: { [group: string]: { [command: string]: string} };

  constructor(private storage: Memento) {
    let text = this.storage.get<string>(STORAGE_KEY);
    if (!text) {
      this.commands = {};
    }
    else {
      try{
        this.commands = JSON.parse(text);
      }catch {
        this.commands = {};
      }
    }
  }

  /**
   * Creates a new command and saves it to the db.
   * If @group does not exist in db, it is created
   * @param {String} group the group command belong to
   * @param {String} label display name of command
   * @param {String} command what is run when this view is clicked
   * @returns false if saving fails, true otherwise
   */
  createCommand = (group: string, label: string, command: string): Boolean => {
    let cat = this.commands[group];
    if (!cat) {
      cat = Object.create(null);
    }
    cat[label] = command;
    return this.save();
  };

  /**
   * Adds a new group to the db
   * @param {String} group name of this group
   * @returns false if save fails, true otherwise
   */
  createGroup = (group: string) => {
    this.commands[group] = Object.create(null);
    return this.save();
  };

  deleteCommand = (item: CommandItem) => {
    delete this.commands[item.parent][item.name];
    return this.save();
  };

  deleteGroup = (group: string) => {
    delete this.commands[group];
    return this.save();
  };

  isEmpty = () => Object.keys(this.commands).length <= 0;

  private save = ()=> {
    try {
      this.storage.update(STORAGE_KEY, JSON.stringify(this.commands));
    } catch (e) {
      return false;
    }
    return true;
  };
}
