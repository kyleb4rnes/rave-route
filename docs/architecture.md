# Rave Route architecture

Rave Route is a mobile-first Ionic Angular application packaged for Android with Capacitor.

## Layers

- `src/app/components/` contains reusable presentation components such as festival cards, the logo, and image fallback.
- `src/app/features/` contains routed user journeys: festival details, editing, and the shared typed reactive form.
- `src/app/core/festivals/` owns the Festival model, date utilities, repository contract, local-storage repository, and signal-based store.
- `src/app/home/` composes the home-screen experience from store state and presentation components.
- `android/` is the generated Capacitor Android project. It contains platform configuration and generated icon/splash resources, while the application UI remains in `src/`.

## Runtime flow

At startup, `FestivalStore` loads persisted festivals from `LocalStorageFestivalRepository`. Its signals expose all festivals, the next festival, later upcoming festivals, past festivals, loading state, and errors. Home and feature pages read those signals and delegate create, update, and delete actions back to the store.

The store calls the repository before updating its local signal, keeping the displayed state aligned with persisted data. Date grouping and countdown calculations are pure utilities. Reusable card components receive data through signal inputs and notify their parents through signal outputs.

## Native boundary

`capacitor.config.ts` identifies the app as `com.raveroute.app`. `npx cap sync android` copies the built Angular application into the Android project and refreshes native plugins. The Camera plugin is used only when Capacitor detects a native platform; the web experience continues to accept an image URL.
