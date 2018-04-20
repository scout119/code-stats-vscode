
import {
  Uri,
  Event,
  CancellationToken,
  TextDocumentContentProvider
} from "vscode";

import { CodeStatsAPI } from "./code-stats-api";

export class ProfileHtmlProvider implements TextDocumentContentProvider {
  onDidChange?: Event<Uri>;

  api: CodeStatsAPI;

  constructor(api: CodeStatsAPI) {
    this.api = api;
  }

  provideTextDocumentContent(uri: Uri, token: CancellationToken): string | Thenable<string> {

    const LEVEL_FACTOR = 0.025;

    function getLevel(xp: number): number {
      return Math.floor(Math.sqrt(xp) * LEVEL_FACTOR);
    }

    function getNextLevelXp(level: number): number {
      return Math.pow(Math.ceil((level+1)/LEVEL_FACTOR) ,2);
    }

    function getLevelProgress(xp: number): number {
      let level = getLevel(xp);
      let curLevelXp = getNextLevelXp(level-1);
      let nextLevelXp = getNextLevelXp(level);

      let haveXp = xp - curLevelXp;
      let needXp = nextLevelXp - curLevelXp;

      return Math.round(haveXp * 100.0 / needXp);
    }

    function getLanguages(languages: any): string {

      let ret = '';
      for( let lang in languages )
      {
        ret+=`<div class="language">${lang}<span style="display:block;">${languages[lang]["xps"]}</span></div>`;
      }

      return ret;
    }

    function getHeader(profile: any): string {
      
     let userName = profile["user"];
     let totalXp = profile["total_xp"];
     let newXp = profile["new_xp"];
     let currentLevel = getLevel(totalXp);

     return `<h3> ${userName}'s Profile Level ${currentLevel} (${totalXp} XP) ${newXp > 0 ? '<sup>(+' + newXp +')</sup>' :'' }</h3>`;
    }


    return this.api.getProfile().then( profile => {

      console.log(profile);

      return `
      <style>
      .language {
        float: left;
        width: 6rem;
        height: 6rem;
        padding-top: 2rem;
        text-align: center;
        background: rgb(37,37,38);
        margin: 0.1rem;
        border-radius: 50%;
        border-style: solid 2px;
        border-color: black;
               
        font-size: 0.9em;      
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }
    .language span {
      font-weight: bold;
      font-size: 1.1em;
    }

    .vs-dark .language {
      color: #ddca7e;
    }

    .vs .language {
      color: blue;
    }

    sup {
      top: -.5em;
      font-size: 75%;
    }

    h3 {
      text-align: center;
    }        
    </style>
      ${getHeader(profile)}
      ${getLanguages(profile["languages"])}      
      `;

    });    
  }
}
