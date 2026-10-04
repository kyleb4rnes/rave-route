# Rave Route architecture

Rave Route is a mobile-first Ionic Angular application packaged for Android with Capacitor. The web application remains platform-neutral so an iOS Capacitor project can be added on macOS when iPhone testing is introduced.

## Layers

- `src/app/components/` contains reusable presentation components such as the shared app header, festival cards, the logo, and image fallback.
- `src/app/features/` contains routed user journeys: catalogue browsing/import, custom festival creation, festival details/editing, line-ups, budgets, Help, Settings, and the shared typed reactive form.
- `src/app/core/festivals/` owns the Festival model, date utilities, repository contract, local-storage repository, and signal-based store.
- `src/app/core/settings/` owns persisted appearance preferences and theme-colour presets.
- `src/app/home/` composes the home-screen experience from store state and presentation components.
- `android/` is the generated Capacitor Android project. It contains platform configuration and generated icon/splash resources, while the application UI remains in `src/`. An `ios/` generated project is deliberately deferred until macOS/Xcode is available.

## Runtime flow

At startup, `FestivalStore` loads persisted festivals from `LocalStorageFestivalRepository`. Its signals expose all festivals, the next festival, later upcoming festivals, past festivals, loading state, and errors. Home and feature pages read those signals and delegate create, update, and delete actions back to the store.

The Home page derives an active festival from today's local date and refreshes its schedule view every minute. Pure active-festival utilities select all currently playing sets and the next scheduled start, ordering concurrent sets with Must-see entries first.

The store calls the repository before updating its local signal, keeping the displayed state aligned with persisted data. Date grouping, countdown calculations, and line-up day selection are pure utilities. Reusable card components receive data through signal inputs and notify their parents through signal outputs.

Festival Details owns packing-list and budget interactions through the store. Catalogue Browse presents current/future festivals by default, supports search and filters, and places past festivals behind an explicit control. Help and Settings use full-page routes as overlay-style surfaces: closing either waits for its transition and navigates to Home rather than returning through browser history.

The Timetable.lol catalogue is generated from its public events and planner-data API endpoints. The generated asset contains only live events with importable timed sets, plus venue/address metadata, provider artwork, ticket metadata, and stable performance IDs. The app can try a configured hosted catalogue first, then fall back to the bundled asset if the hosted copy is unavailable or malformed. Existing legacy imports retain their reviewed location backfill map; coordinates for future maps remain deferred.

`AppSettingsStore` persists the optional background image and selected theme colour. `AppComponent` applies those settings as app-level CSS custom properties, so routed pages share the same background and theme tokens without reloading.

## Native boundary

`capacitor.config.ts` identifies the app as `com.raveroute.app`. `npx cap sync android` copies the built Angular application into the Android project and refreshes native plugins. The Camera plugin selects images from the device photo library for festival artwork and the optional app background; image URLs are no longer entered by users.

The Android project currently targets API 36, uses min SDK 24, and still needs a protected upload keystore and signed release bundle before Play distribution.

## Deferred platform, security, and identity work

- Add, configure, sign, and test the Capacitor iOS project from macOS/Xcode before claiming iPhone support.
- GitHub dependency alerts/security updates and CodeQL are enabled; include dependency-audit, Dependabot, and CodeQL review in release preparation.
- Keep data local until account, authentication, authorisation, cloud storage, session, and migration requirements have been designed together.
