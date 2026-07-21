# Rave Route

Rave Route is a mobile-first festival planner. Its first MVP will help users keep upcoming festivals in one place and feel more excited about their next event.

The project is part of **Project Freedom**, a personal mission focused on greater freedom, stronger finances and health, more travel, and improved software engineering skills.

## Project status

Stages 10–18 - Persisted Festival MVP (Android project configured; device verification pending)

The app now persists festivals in local storage, supports expandable cards, details, editing, deletion confirmation, image URLs/default images, optional Android device-image selection, and accessibility-focused states. The Android project uses the `com.raveroute.app` application ID and includes temporary generated icon and splash assets. Physical-device verification remains outstanding.

## MVP capabilities

The MVP will let a user:

- See their next festival emphasised on the home screen.
- See later festivals as collapsed cards.
- Add, view, edit, and delete festivals.
- Record dates, an image, a location, and transport status.
- Keep festival data locally between app restarts.

See [MVP specification](docs/mvp-specification.md) for the full scope.

## Technical direction

- Angular and Ionic Angular
- Capacitor
- TypeScript and SCSS
- Angular signals
- Typed reactive forms
- Jest
- Local device storage for the MVP

## Project documents

- [MVP specification](docs/mvp-specification.md)
- [Design philosophy](docs/design-philosophy.md)
- [Technical development plan](technical-development-plan.md)
- [Development workflow](docs/development-workflow.md)
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

## Android development

Install Android Studio and its Android SDK, then use:

```bash
npm run android:sync
npm run android:open
```

Run the project from Android Studio on an emulator or a physical Android device. iOS packaging is intentionally unverified until the project is opened on macOS with Xcode.

Work on one documented stage at a time. Review, run, test, and understand each stage before moving to the next one.
