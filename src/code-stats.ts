"use strict";
import { ExtensionContext } from "vscode";
import { XpCounter } from "./xp-counter";

export function activate(context: ExtensionContext): void {
  let controller: XpCounter = new XpCounter(context);
  context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
export function deactivate(): void {}
