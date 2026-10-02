# Repository Guidelines

## Project Structure & Module Organization

This repository contains `dahamm` (package name `news`), an Electron desktop reader for public RSS/Atom feeds focused on Mittelfranken, using vanilla JavaScript, HTML, and CSS.

- `main.js`: window lifecycle, network requests, geolocation, and IPC handlers.
- `preload.js`: the restricted `window.news` bridge between processes.
- `renderer/app.js`: feed sources, parsing, ranking, state, summaries, and rendering. Add standard feeds to `BASE_SOURCES`.
- `renderer/region.js`: Mittelfranken places, districts, Google News queries, and place matching.
- `renderer/personalization.js`: local interest profile and scoring.
- `renderer/index.html` and `renderer/style.css`: German UI markup, layout, and theme variables. Keep renderer assets here.
- `package.json`: dependencies, scripts, and electron-builder packaging configuration.
- `.github/workflows/build.yml`: Windows builds and tagged releases.

`dist/` contains generated packages. Local `build-cache/` and `my-wincodesign/` folders are tooling artifacts; keep them out of source changes.

## Build, Test, and Development Commands

Use Node.js 20 to match CI. Run commands from the repository root:

- `npm install`: install dependencies; the lockfile is currently ignored.
- `npm start`: launch Electron with `ELECTRON_RUN_AS_NODE` cleared.
- `npm run build`: package for the current platform.
- `npm run build:win`: generate Windows NSIS and portable packages in `dist/`.
- `npm run dist`: explicitly build Windows x64 packages.
- `npm run build:mac` / `npm run build:linux`: generate DMG / AppImage packages on a suitable build host.

The renderer has no compilation step. CI runs manually or on `v*` tags; tagged builds publish release artifacts.

## Coding Style & Naming Conventions

Match existing two-space indentation, JavaScript semicolons, and single-quoted strings. Use camelCase for functions and variables, UPPER_SNAKE_CASE for constant collections, and kebab-case CSS classes. Keep CommonJS imports in Electron files. Reuse CSS theme variables and preserve German user-facing copy. No formatter or linter is configured.

## Testing Guidelines

No test framework or coverage threshold exists; `npm test` runs the plain Node tests in `tests/`. Check JavaScript syntax with `node --check main.js`, `node --check preload.js`, and `node --check renderer/app.js`. Then use `npm start` to verify feed loading, refresh, the place picker, search, sections, filters, both views, themes, summaries, and external links. Exercise unavailable feeds and geolocation failure when changing network behavior. Record manual results in the PR.

## Commit & Pull Request Guidelines

Follow existing `feat:` and `fix:` prefixes, using short imperative subjects. Keep commits focused. PRs should describe the change, link relevant issues, list validation, and include screenshots for UI changes.

## Security & Configuration

Preserve `contextIsolation: true` and `nodeIntegration: false`. Expose narrow IPC methods through `preload.js`; validate external URLs and treat feed content as untrusted. Never commit credentials or generated installers.
