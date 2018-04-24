
import {
  Uri,
  Event,
  CancellationToken,
  TextDocumentContentProvider,
  ExtensionContext
} from "vscode";
import * as path from "path";
import * as fs from 'fs';

import { CodeStatsAPI } from "./code-stats-api";

import template = require('lodash.template');

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

    function getSortedArray(profile: any, obj: string): any[] {

      let langs = [];
      let languages_object = profile[obj] 
      for( let lang in languages_object) {
        langs.push(
          {
            name: lang,
            xp: languages_object[lang].xps,
            new_xp: languages_object[lang].new_xps,
            progress: getLevelProgress(languages_object[lang].xps)
          }
        );
      }
      langs = langs.sort( (a,b) => {return b.xp - a.xp;});
      
      return langs;
    }

    return this.api.getProfile().then(profile => {

      let htmlTemplate = fs.readFileSync(this.context.asAbsolutePath("assets/profile.html"));

      profile["style"] = this.context.asAbsolutePath("assets/profile.css");
      profile["level"] = getLevel(profile["total_xp"]);


      let langs = getSortedArray(profile, "languages");
      
      let machines = getSortedArray(profile, "machines");


      
      let html = template(htmlTemplate);
          
      return html({profile: profile, languages: langs, machines: machines});

    });
  }
}
