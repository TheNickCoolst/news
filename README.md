# dahamm – Nachrichten aus Mittelfranken

Desktop-App (Electron) für lokale Nachrichten: zuerst dein Ort, dann Mittelfranken, Bayern und die Welt. Alles aus öffentlichen RSS-/Atom-Feeds, in einer Oberfläche im Stil einer Tageszeitung.

> Hinweis: Es werden **keine** Webseiten gescraped. Die App nutzt die öffentlich angebotenen RSS-/Atom-Feeds der Anbieter und Google-News-Suchfeeds. Ein Klick auf eine Meldung öffnet das Original im Standard-Browser.

## Features

- **Mein Ort:** über 40 Orte in Mittelfranken (kreisfreie Städte und alle sieben Landkreise), dazu freie Eingabe für jeden anderen Ort
- **Startseite wie eine Zeitung:** Aufmacher, „Top in der Region“, Rubriken für Ort, Mittelfranken, Blaulicht, Sport, Bayern, Deutschland & Welt, Wirtschaft, Technik
- Regionale Quellen: nordbayern.de (Nürnberg, Fürth, Erlangen, Franken, Bayern, Polizeiberichte, Sport, 1. FC Nürnberg), N-Land, Franken Fernsehen, Radio F, kicker (1. FC Nürnberg), BR/tagesschau Bayern, SZ Bayern, Merkur Bayern, Augsburger Allgemeine Bayern, Google News für Ort, Landkreis, Metropolregion, Wirtschaft in Mittelfranken, Greuther Fürth, Ice Tigers, HC Erlangen und Nürnberg Falcons
- Überregional: u. a. Tagesschau, ZDFheute, Spiegel, ZEIT, SZ, RND, Deutschlandfunk; Wirtschaft (tagesschau, Handelsblatt, WirtschaftsWoche, Manager Magazin) und Technik (Heise, Golem, t3n, ComputerBase, Caschys Blog, Netzpolitik)
- Personalisierung: Themen, Stichwörter und „Mehr/Weniger davon“ pro Quelle, nur lokal gespeichert
- „Gute Nachrichten“-Modus, Suche (Strg + K), Karten- und Listenansicht, Hell/Dunkel
- Kurzfassungen: lokal (extraktiv, ohne Cloud) oder mit Claude Haiku 5.5, wenn ein API-Schlüssel hinterlegt ist
- Auto-Refresh alle 10 Minuten
- Windows-Installer (NSIS) + portable EXE

## Quellen

Feste Feeds stehen in `BASE_SOURCES` in `renderer/app.js`. Orte, Landkreise und Suchbegriffe stehen in `renderer/region.js`.

## Entwicklung

```bash
npm install
npm start
npm test
```

## Kurzfassungen mit Claude (optional)

Kopiere `.env.example` nach `.env` und trage deinen Anthropic-API-Schlüssel ein:

```
ANTHROPIC_API_KEY=sk-ant-…
```

Dann schickt dahamm beim Klick auf „Kurzfassung“ den Text dieser einen Meldung an Claude Haiku 5.5. Ohne Schlüssel, oder wenn Claude nicht erreichbar ist, entsteht die Kurzfassung wie bisher lokal. Der Schlüssel bleibt im Electron-Hauptprozess; `.env` wird weder eingecheckt noch ins Installationspaket gepackt. Die installierte App liest die `.env` aus ihrem Benutzerdaten-Ordner (`%APPDATA%\dahamm\.env`).

## Build für Windows

```bash
npm install
npm run build:win
```

Die Installer landen in `dist/` (`dahamm-2.0.0-x64.exe`, NSIS und portable).

## Architektur

```
main.js                  Electron-Hauptprozess: Feed-Abruf (Zeichensatz-Erkennung), Standort-Hinweis, externe Links, Claude-Kurzfassungen
preload.js               schmale Bridge mit contextIsolation
renderer/
  index.html             Layout: Navigationsleiste, Werkzeugleiste, Startseite, Rubrik-Ansicht, Dialoge
  style.css              Design-Tokens (Hell/Dunkel), Zeitungs-Typografie
  app.js                 Quellen, Parser, Ranking, Rendering, Kurzfassungen
  region.js              Mittelfranken: Orte, Landkreise, Textabgleich
  personalization.js     Interessen-Profil (lokal)
tests/                   Node-Tests ohne Framework
```

## Lizenz

MIT – siehe `LICENSE`.

## Disclaimer

Diese App stellt nur Links zu fremden Inhalten dar. Die Rechte an Schlagzeilen und Artikeln liegen bei den jeweiligen Verlagen.
