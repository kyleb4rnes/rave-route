# Development log

## 2026-07-21 — Initial project history

- Prepared the Rave Route product, design, technical-plan, workflow, and agent guidance documents.
- Created the Ionic Angular application with standalone components, signal-first patterns, and typed reactive forms.
- Established the hot-red visual theme and mobile-first application shell.
- Built the Festival domain model, date utilities, signal store, typed create/edit form, and festival card components.
- Added local-storage persistence, expandable later-festival cards, details, editing, and deletion confirmation.
- Added image URLs, a default festival image, Android device image selection, accessibility improvements, and automated coverage.
- Configured Capacitor Android packaging with application ID `com.raveroute.app`, temporary icon/splash assets, and an Android debug test build.
- Completed the v0.1.0 MVP release preparation, including architecture notes, known limitations, checklist, tag, and pushed release commit.
- Added an in-app launch screen that waits for data readiness, uses a temporary five-second minimum duration, and retracts into the app header.
- Reverted the temporary image-based logo experiments and retained a simple static `RR` placeholder.
- Added an App Settings route with a persistent optional home-screen background-image URL.
- Replaced the Settings route’s horizontal navigation with a red expand/retract transition, and made header actions visible.
- Hid the desktop-style scrollbar globally while retaining normal page scrolling.

## Ongoing rule

- At the end of each future development session, append a brief dated bullet list describing that session’s completed work, decisions, and verification.
