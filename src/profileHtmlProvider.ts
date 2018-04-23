
import {
  Uri,
  Event,
  CancellationToken,
  TextDocumentContentProvider,
  ExtensionContext
} from "vscode";
import * as path from "path";

import { CodeStatsAPI } from "./code-stats-api";

export class ProfileHtmlProvider implements TextDocumentContentProvider {
  onDidChange?: Event<Uri>;

  api: CodeStatsAPI;
  context: ExtensionContext;

  constructor(context: ExtensionContext, api: CodeStatsAPI) {
    this.context = context;
    this.api = api;
  }

  provideTextDocumentContent(uri: Uri, token: CancellationToken): string | Thenable<string> {

    const LEVEL_FACTOR = 0.025;

    function getLevel(xp: number): number {
      return Math.floor(Math.sqrt(xp) * LEVEL_FACTOR);
    }

    function getNextLevelXp(level: number): number {
      return Math.pow(Math.ceil((level + 1) / LEVEL_FACTOR), 2);
    }

    function getLevelProgress(xp: number): number {
      let level = getLevel(xp);
      let curLevelXp = getNextLevelXp(level - 1);
      let nextLevelXp = getNextLevelXp(level);

      let haveXp = xp - curLevelXp;
      let needXp = nextLevelXp - curLevelXp;

      return Math.round(haveXp * 100.0 / needXp);
    }

    function getLanguages(languages: any): string {

      let ret = '';
      for (let lang in languages) {
        ret += `<div class="language">${lang}<span style="display:block;">${languages[lang]["xps"]}</span></div>`;
      }

      return ret;
    }

    function getHeader(profile: any): string {

      let userName = profile["user"];
      let totalXp = profile["total_xp"];
      let newXp = profile["new_xp"];
      let currentLevel = getLevel(totalXp);

      return `<h3> ${userName}'s Profile Level ${currentLevel} (${totalXp} XP) ${newXp > 0 ? '<sup>(+' + newXp + ')</sup>' : ''}</h3>`;
    }


    return this.api.getProfile().then(profile => {

      //console.log(profile);
      return `
      <link rel="stylesheet" href="file:///${this.context.asAbsolutePath("assets/style.css")}">
      <img width="64px" height="64px" src="file:///${this.context.asAbsolutePath("assets/r2.svg")}">
      ${getHeader(profile)}
      ${getLanguages(profile["languages"])}      
      `;

    });
  }
}
