# OpaNews

Lokaler Nachrichten-Aggregator als Windows-Desktop-App (Electron). Sammelt Schlagzeilen aus mehreren öffentlichen deutschen RSS-Feeds und zeigt sie in einer einzigen, durchsuchbaren Oberfläche.

> Hinweis: Es werden **keine** Webseiten gescraped. Die App nutzt ausschließlich die offiziellen, öffentlich angebotenen RSS-/Atom-Feeds der jeweiligen Anbieter. Klick auf einen Artikel öffnet die Original-URL im Standard-Browser.

## Features

- Aggregiert ~10 deutsche Nachrichtenquellen (Tagesschau, Spiegel, ZEIT, Heise, SZ, n-tv, Welt, FAZ, Tagesspiegel, Deutsche Welle)
- Karten- und Listen-Ansicht
- Volltextsuche über alle Schlagzeilen
- Filter nach Quelle
- Dark / Light Theme
- Auto-Refresh alle 10 Minuten
- Komplett offline lauffähig (außer beim Feed-Update)
- Windows-Installer (NSIS) + portable EXE

## Quellen

Alle Feeds sind öffentlich erreichbar und in `renderer/app.js` konfigurierbar. Neue Quelle hinzufügen: einfach Eintrag im `SOURCES`-Array ergänzen.

## Entwicklung

```bash
npm install
npm start
```

## Build für Windows

Vom Mac/Linux/Windows aus:

```bash
npm install
npm run build:win
```

Die fertigen Installer landen in `dist/`:

- `OpaNews-1.0.0-x64.exe` – NSIS-Installer
- `OpaNews-1.0.0-x64.exe` (portable) – Single-File-Variante ohne Installation

## Build für macOS / Linux

```bash
npm run build:mac
npm run build:linux
```

## Tech Stack

- Electron 33
- electron-builder
- Vanilla JS / HTML / CSS (keine Frameworks, kein Build-Step für den Renderer)
- DOMParser für RSS/Atom/RDF

## Architektur

```
main.js          Electron-Hauptprozess, RSS-Fetch über Node (umgeht CORS)
preload.js       Bridge mit contextIsolation
renderer/
  index.html     Layout (Topbar / Sidebar / Content-Grid)
  style.css      Theme-Variablen, Dark/Light
  app.js         Feed-Parser, State, Rendering
```

Der Fetch läuft im Main-Prozess (Node `https`), weil viele RSS-Feeds keine `Access-Control-Allow-Origin`-Header setzen.

## Lizenz

MIT – siehe `LICENSE`.

## Disclaimer

Diese App stellt nur Links zu fremden Inhalten dar. Die Rechte an den Schlagzeilen und Artikeln liegen bei den jeweiligen Verlagen. Wer einen Artikel liest, landet auf der Original-Seite des Anbieters.
