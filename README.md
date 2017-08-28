# Code::Stats extension to Visual Studio Code.

This is a Visual Studio Code extension to send updates to [https://codestats.net](https://codestats.net)

## Features

This extension tracks the amount of changes you make to your files and sends out pulses to [https://codestats.net/api-docs#pulse](https://codestats.net/api-docs#pulse) to track your XP.

## Extension Settings

You need to register your machine at [https://codestats.net/my/machines](https://codestats.net/my/machines) to get an API key which you need to set in the settings.

This extension contributes the following settings:

* `codestats.apikey`: API key for your machine

## Known Issues

## Release Notes

### 1.0.8

Merged a PR from nicd to refactor the counting logic.

### 1.0.7

Merged a PR from sharpred to count formatting a large JSON-object only as 1 XP.

### 1.0.6

Changed to return just the langId if not found in the mapped languages names.
Added Elm and Elixir to the mapped names.

### 1.0.5

Changed language names to reflect the ones already used in Code::Stats.

### 1.0.4

Added a manual mapping to natural language language names.

### 1.0.3

Fixed an accumulation of XP bug.
Added a license for the logo.

### 1.0.2

Added a logo for the extension.

### 1.0.1

Added the missing github information to package.json
Added the .vsix installation package as well.

### 1.0.0

Initial release of code-stats-vscode


### For more information

* [Github repository](https://github.com/riussi/code-stats-vscode)

**Enjoy!**