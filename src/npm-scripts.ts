import * as vscode from 'vscode';
import * as fs from 'fs';
import ICommand from './icommand';

const defaultListener = () => {  };

interface ScriptsChangeListener {
  (scripts: ICommand[]): void
}

export default class NpmScripts {
  watcher: vscode.FileSystemWatcher | null = null;
  currentPattern: string | null = null;

  private onScriptsChangeListener: ScriptsChangeListener = defaultListener;

  private scripts: ICommand[] = [];

  constructor() {
    this.initialize();
    this.setupEventListeners();
  }

  setOnScriptsChangeListener(listener: ScriptsChangeListener) {
    this.onScriptsChangeListener = listener;
    this.onScriptsChange();
  }

  unsetOnScriptsChangeListener() {
    this.onScriptsChangeListener = defaultListener;
  }

  private onScriptsChange() {
    this.onScriptsChangeListener(this.scripts);
  }

  private setScripts(scripts: ICommand[]) {
    this.scripts = scripts;
    this.onScriptsChange();
  }

  private loadScripts(uri: vscode.Uri) {
    const file = uri.fsPath;
    try {
      if (!fs.existsSync(file)) {
        this.setScripts([]);
        return;
      }
      const json = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (!json) {
        this.setScripts([]);
        return;
      }
      const scripts = json.scripts;
      if (!scripts) {
        this.setScripts([]);
        return;
      }
      const cmds = Object.keys(scripts).map(key => ({ title: key, command: scripts[key], type: 'command'}));
      this.setScripts(cmds);
    }catch(e) {
      this.setScripts([]);
    }
  }

  private initialize() {
    vscode.workspace.onDidChangeWorkspaceFolders(() => this.initialize());

    const uri = vscode.window.activeTextEditor?.document.uri;
    if (uri) {
      this.setupWatcher(uri);
      return;
    }
    const uris = vscode.workspace.workspaceFolders?.map((workspace) => workspace.uri);
    if (!uris || !uris.length) {
      this.setScripts([]);
      return;
    }
    this.setupWatcher(uris[0]);
  }

  private setupEventListeners() {
    vscode.window.onDidChangeActiveTextEditor((evt) => {
      const uri = evt?.document.uri;
      if (!uri) {
        return;
      }

      this.setupWatcher(uri);
    });
  }

  private setupWatcher(uri: vscode.Uri) {
    const pattern = new vscode.RelativePattern (
      vscode.workspace.getWorkspaceFolder(uri)!, 'package.json'
    );

    if (pattern.pattern === this.currentPattern) {
      return;
    }

    this.currentPattern = pattern.pattern;

    if (this.watcher) {
      this.watcher.dispose();
    }

    const jsonFile = vscode.Uri.joinPath(vscode.Uri.parse(pattern.base), 'package.json');
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern, true, false, false);

    this.watcher.onDidDelete(() => {
      this.onScriptsChangeListener([]);
    });
    this.watcher.onDidChange((uri) => {
      this.loadScripts(jsonFile);
    });

    this.loadScripts(jsonFile);
  }
}
