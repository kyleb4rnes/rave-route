# Development log

## 2026-07-26 â€” Angular dependency safety

- Configured Dependabot to group Angular core, Angular devkit, and Angular ESLint updates into one PR, preventing isolated framework-tooling upgrades.
- Recorded that Angular major updates require a deliberate, fully verified upgrade rather than automatic merging.
- Grouped all routine minor and patch dependency updates into one separate Dependabot PR.

## 2026-07-26 â€” GitHub security configuration

- Confirmed that Dependabot alerts/security updates, private vulnerability reporting, and CodeQL default setup are enabled for the repository.

## 2026-07-26 â€” Version 1 storage decision

- Confirmed that version 1 is deliberately device-only, with no backup, export, account, or cloud synchronisation.
- Deferred accounts and cloud synchronisation to future considerations, pending a full data ownership and migration design.

## 2026-07-26 â€” Release readiness foundation

- Added GitHub Actions quality checks for every pull request and push to `main`.
- Added a security reporting policy, a pre-release runbook, and a locally accurate privacy-policy draft.
- Confirmed `npm audit --omit=dev` has no production dependency vulnerabilities; full-audit development-toolchain updates remain subject to compatibility review.

## 2026-07-26 â€” Native image storage

- Added Capacitor Filesystem-backed private storage for festival and app-background images.
- Replaced persisted base64 image data with lightweight internal file references; legacy images migrate automatically while remaining safe if migration cannot complete.
- Removed replaced and deleted festival/background image files as a best-effort cleanup.

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

## 2026-07-25 — Device refinement and future roadmap

- Replaced separate start/end controls with one two-step festival date-range calendar.
- Made the App Settings page scrollable without displaying a web-style scrollbar, and corrected its bottom surface so scrolling no longer reveals the red transition layer.
- Replaced user-entered image URLs with photo-library selection, previews, and removal controls for both festival artwork and the shared app background.
- Synced the current web bundle and Camera plugin configuration into the Android project; lint, production build, and 23 unit tests passed.
- Deferred iOS project readiness on macOS, GitHub/dependency security scanning, and the complete future account/authentication/authorisation design.
- Recorded the wider public-release backlog: native image-storage resilience, signing and versioning, store onboarding/testing/listings, privacy and support operations, plus a required Timetable.lol licence and redistribution-rights review.

## 2026-07-26 — Active festival

- Added an automatic Live now card above the Home-page festival route whenever a festival is in progress.
- The card refreshes every minute and always presents the preferred current set and the next upcoming set when either exists, including later festival days.
- Concurrent sets are counted and Must-see entries take priority; the card links directly to the festival Line-up.
- Added focused utility coverage for active-festival detection, current/next schedule selection, and Must-see clash prioritisation.
- Added a non-destructive Live festival demo seed to exercise current, next, Must-see clash, and later-day schedule states on a physical device.
- Refined the Live card so it appears only during an active festival, with stage and time displayed on separate lines for mobile readability.
- Corrected the festival date-range picker to use Ionic's inline-modal template pattern after a blank nested modal was found on device testing.
- Deferred two Live festival refinements: opening its Line-up should default to the current day, and Home should not repeat the active festival in “Your festival route”.
- Recorded future discussion for richer transport and accommodation planning beyond the current arranged-status toggles.

## 2026-07-26 — Active festival refinements

- Aligned active-festival and Line-up day selection to the device's local date, so Live Line-up entry opens on today.
- Excluded an active festival from the Home route cards, showing the next planned festival instead.
- Reorganised deferred work into Additional Future Features and Work to Complete Before First Public Release.

## 2026-07-23 — Festival line-ups

- Added persisted manual festival set times with artist, day, start/end times, and optional stage.
- Added prominent LINE UP actions from home cards and Festival Details.
- Added one Line-up page per festival with day tabs; it defaults to the current festival day when active, otherwise the first day.
- Added a stage-grouped schedule and quick Save & add another form that preserves the selected day and stage.
- Made each festival's saved stage names reusable as quick-pick chips when adding another set.
- Replaced the Line-up header's history-dependent back control with an explicit, themed route back to Festival Details.
- Reworked page navigation into one shared header with Back, Home, and Settings controls; Back now follows browser/app history instead of creating a new route entry.
- Added a mobile-friendly By time / By stage Line-up switch; time view is the default and highlights overlapping sets as clashes.
- Refined the Line-up layout with a collapsed-by-default Add a set panel, compact scrollable festival-day picker, and icon-based view switch.
- Replaced unaligned festival-card text links with consistent, equal-width Line up and Details action buttons.
- Added persisted Line-up set deletion with a red bin action in both time and stage views.
- Made shared navigation controls context-aware: Home hides on Home, and Back only appears when an in-app history entry exists.
- Applied the optional custom background image at app level so it is shared across Home, festival pages, Line-up, and Settings.
- Switched the default neutral palette from warm cream to cool mist, including the custom-background overlay and supporting neutral tokens.
- Extracted theme colour presets and added persistent Red, Blue, Green, Purple, and Pink choices in App Settings.
- Added accommodation planning alongside transport, with form toggles and clear status indicators on festival cards and details.
- Reviewed and aligned the README, architecture, MVP, design, and developer-guide documentation with the current post-MVP application.
- Deferred Must see artists and bulk paste entry until a later Line-up enhancement.
- Added Line-up set editing through a modal that can change artist, day, stage, and set times.
- Constrained the set-edit modal to a centred, mobile-friendly sheet with vertical breathing room.
- Added a reusable Import official line-up flow with explicit Tomorrowland Belgium 2026 Weekend 1 and Weekend 2 presets, a date-validated preview, official source tracking, safe re-import refreshes, and manual-duplicate protection.
- Added a searchable Timetable.lol community catalogue containing all indexed event presets; a compact same-origin asset holds its 4,415 complete acts across 27 events, is loaded on demand, filtered to the selected event and festival dates, then persisted only as normal imported sets.
- Added persisted Must-see hearts to Line-up sets and a compact heart-only filter beside the schedule view switcher.
- Added persistent Light and Dark appearance modes across all accent presets, surfaces, text, borders, forms, cards, and modals while retaining the selected custom background image.
- Made Line-up set actions compact and horizontal, added a collapsible Past adventures archive on Home, and generated a CORS-safe bundled Timetable.lol asset with a repeatable refresh script.
- Recorded the deferred Active festival idea: surface the set currently playing at a selected current festival, with clear Must-see-first clash handling or simultaneous-set choices.
- 2026-07-26: Timetable.lol confirmed permission to use its data. Before public launch, Rave Route must provide its production URL for API-origin allowlisting, validate the live integration, and retain visible attribution.
- 2026-07-26: Completed a UI resilience and accessibility pass: aligned the Angular build toolchain, improved Red/Green contrast, made settings radio pickers keyboard-operable, increased Line-up action hit areas, made modals viewport-aware, clarified official versus community line-up sources with Timetable.lol attribution, and moved Line-up-specific styles out of global CSS. The custom background no longer uses a fixed attachment to reduce mobile webview repaint risk.
- 2026-07-26: Timetable.lol confirmed the exact visible attribution: “Data provided by Timetable.lol”. The import flow now uses that wording and distinguishes Tomorrowland as an official source from Timetable.lol as a community source.
