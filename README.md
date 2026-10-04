# Rave Route

Rave Route is a mobile-first festival planner that helps users keep upcoming festivals in one place and feel more excited about their next event.

The project is part of **Project Freedom**, a personal mission focused on greater freedom, stronger finances and health, more travel, and improved software engineering skills.

## Project status

Active product development is underway, with Android beta preparation underway.

The app persists festival plans locally and supports catalogue-first festival browsing, Timetable.lol imports, festival CRUD, line-ups and set times, an automatic Live now view for active festivals, expandable cards, ticket and resale links, packing lists, budgets, photo-library artwork, accessible navigation, personal backgrounds, selectable colour themes, Help, and Settings. The Android project uses the `com.raveroute.app` application ID, version `0.1.0` / code `1`, and supports environment-based release signing.

## Current capabilities

The current product lets a user:

- See their next festival emphasised on the home screen.
- See later festivals as collapsed cards.
- Add, view, edit, and delete festivals.
- Record dates, an image, a location, transport status, and accommodation status.
- Add and browse manual set times by time or stage, including clash indicators and selectable official/community timetable imports.
- Browse current and past catalogue festivals with search and filters, then import a selected festival and its published line-up.
- View available ticket, resale, and estimated ticket-price metadata for catalogue festivals.
- Maintain a packing list and a per-festival budget.
- Open concise Help guidance and configure appearance in Settings.
- Personalise the app with a background image, Light or Dark appearance, and one of five theme-colour presets.
- Keep festival data locally between app restarts.

See [product specification](docs/product-specification.md) for the current scope and known deferred work.

## Refreshing the Timetable.lol catalogue

Run `npm run timetable-lol:sync` to fetch Timetable.lol's public events and planner-data API endpoints and generate the compact bundled catalogue used by the community import flow. Only live events with importable timed sets are included; the script reports skipped events and malformed rows for review before committing. The app visibly attributes imported catalogue data as “Data provided by Timetable.lol”.

## Technical direction

- Angular and Ionic Angular
- Capacitor
- TypeScript and SCSS
- Angular signals
- Typed reactive forms
- Jasmine and Karma
- Local device storage for the current release

## Project documents

- [Product specification](docs/product-specification.md)
- [Design philosophy](docs/design-philosophy.md)
- [Technical development plan](technical-development-plan.md)
- [Development workflow](docs/development-workflow.md)
- [Architecture](docs/architecture.md)
- [Release checklist](docs/release-checklist.md)
- [Developer agent guide](developer.agent.md)

## Development

Run the development server:

```powershell
npm start
```

Run verification:

```powershell
npm run lint
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

The combined CI-style command is `npm run verify`; it also runs the production dependency audit.

## Android development

Install Android Studio and its Android SDK, then use:

```bash
npm run android:sync
npm run android:open
```

Run the project from Android Studio on an emulator or a physical Android device. iOS packaging is intentionally unverified until the project is opened on macOS with Xcode.

## Known limitations

- Festival data stays on the current device/browser only; there is currently no account, sync, backup, or cloud storage.
- Device-selected images are stored alongside local festival data, so many large images can exhaust browser/device storage.
- The Android project still needs release signing, an Android App Bundle, Play Console setup, and beta testing before public distribution.
- iOS has not been packaged or tested because that requires macOS and Xcode.

The original staged build plan is complete through Stage 19. Current priorities and release tasks are tracked in [the developer guide](developer.agent.md), [the release checklist](docs/release-checklist.md), and [the pre-release runbook](docs/pre-release-runbook.md).
