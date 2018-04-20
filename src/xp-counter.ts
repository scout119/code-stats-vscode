// tslint:disable-next-line:max-line-length
import {
  Disposable,
  workspace,
  window,
  Uri,
  ViewColumn,
  commands,
  TextDocumentContentProvider,
  Event,
  CancellationToken,
  StatusBarItem,
  TextDocument,
  StatusBarAlignment,
  TextDocumentChangeEvent,
  Range,
  WorkspaceConfiguration
} from "vscode";
import { Pulse } from "./pulse";
import { CodeStatsAPI } from "./code-stats-api";

class HtmlProvider implements TextDocumentContentProvider {
  onDidChange?: Event<Uri>;
  provideTextDocumentContent(uri: Uri, token: CancellationToken): string | Thenable<string> {
    return `
    <style>
    .tile {
      float: left;
      width: 7rem;
      height: 7rem;
      padding-top: 2.5rem;
      text-align: center;
      background: gray;
      margin: 0.1rem;
      border-radius: 50%;
      border-style: solid 2px;
      border-color: black;
     
      color: #ddca7e;
      font-size: 0.8em;      
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
  }

  .tile span {
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .tile:nth-child(even) {
      background: gray;
  }    
    </style>
    <div class="tile">C#<span style="display:block;">10</span></div>
    <div class="tile">Elixir</div>
    <div class="tile">TypeScript</div>
    <div class="tile">Rust</div>
    <div class="tile">Html</div>
    <div class="tile">PlainText</div>
    <div class="tile">C++</div>
    <div class="tile">VB</div>
    <div class="tile">F#</div>    
    <div class="tile">C#</div>
    <div class="tile">Elixir</div>
    <div class="tile">TypeScript</div>
    <div class="tile">Rust</div>
    <div class="tile">Html</div>
    <div class="tile">PlainText</div>
    <div class="tile">C++</div>
    <div class="tile">VB</div>
    <div class="tile">F#</div>    
    `;
  }
}

export class XpCounter {
  private combinedDisposable: Disposable;
  private statusBarItem: StatusBarItem;
  private pulse: Pulse;
  private api: CodeStatsAPI;
  private updateTimeout: any;

  //    private languages: Array<string> = ["typescript", "javascript"];

  // wait 10s after each change in the document before sending an update
  private UPDATE_DELAY = 10000;


  constructor() {
    this.pulse = new Pulse();

    /* // print out supported language names
        let allLanguages = languages.getLanguages().then(
            (result => {
                console.log(JSON.stringify(result));
            })
        );
        */

    this.initAPI();

    let subscriptions: Disposable[] = [];

    if (!this.statusBarItem) {
      this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
      this.statusBarItem.command = "code-stats.profile";
    }

    let provider = new HtmlProvider();
    let registration = workspace.registerTextDocumentContentProvider('code-stats', provider);
  
    subscriptions.push(registration);

    let previewUri = Uri.parse('code-stats://profile')

    subscriptions.push(commands.registerCommand("code-stats.profile", () => {
      commands.executeCommand('vscode.previewHtml', previewUri, ViewColumn.Two, 'Code::Stats Profile');
    } ) );
    
    workspace.onDidChangeTextDocument(
      this.onTextDocumentChanged,
      this,
      subscriptions
    );
    workspace.onDidChangeConfiguration(this.initAPI, this, subscriptions);
    this.combinedDisposable = Disposable.from(...subscriptions);
  }

  dispose(): void {
    this.combinedDisposable.dispose();
    this.statusBarItem.dispose();
  }

  private onTextDocumentChanged(event: TextDocumentChangeEvent): void {
    this.updateXpCount(event.document, 1);
  }

  public updateXpCount(document: TextDocument, changeCount: number): void {
    let show: boolean;
    if (this.isSupportedLanguage(document.languageId)) {
      this.pulse.addXP(document.languageId, changeCount);
      show = true;
    } else {
      show = false;
    }
    this.updateStatusBar(show, `${this.pulse.getXP(document.languageId)}`);

    // each change resets the timeout so we only send updates when there is a 10s delay in updates to the document
    if (this.updateTimeout !== null) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const promise = this.api.sendUpdate(this.pulse);

      if (promise !== null) {
        promise.then(() => {
          this.updateStatusBar(
            show,
            `${this.pulse.getXP(document.languageId)}`
          );
        });
      }
    }, this.UPDATE_DELAY);
  }

  private updateStatusBar(show: boolean, changeCount: string): void {
    if (!show) {
      this.statusBarItem.hide();
    } else {
      this.statusBarItem.text = `$(pencil) C::S ${changeCount}`;
      this.statusBarItem.show();
    }
  }

  private isSupportedLanguage(language: string): boolean {
    // todo: check supported languages
    // only update xp if one of supported languages
    return true;
  }

  private initAPI() {
    let config: WorkspaceConfiguration = workspace.getConfiguration(
      "codestats"
    );
    if (!config) {
      return;
    }

    const apiKey: string = config.get("apikey");
    const apiURL: string = config.get("apiurl");
    console.log(
      "code-stats-vscode setting up with API URL",
      apiURL,
      "and key",
      apiKey
    );
    this.api = new CodeStatsAPI(apiKey, apiURL);
  }
}
