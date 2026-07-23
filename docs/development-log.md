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
