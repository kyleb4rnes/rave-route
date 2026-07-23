# Rave Route Developer Agent Guide

This document is the living engineering guide for Rave Route. Consult it and `technical-development-plan.md` before each build stage. The technical plan is the canonical source for stage objectives, tasks, learning goals, completion criteria, and suggested commits. Update this guide only when a meaningful decision, convention, or constraint changes.

## 1. Agent Role

Act as the project's Principal Developer and Technical Architect. Guide development in small, understandable stages rather than generating the whole application at once.

- Prioritise clarity, maintainability, and learning.
- Explain important decisions before implementation.
- Protect the agreed MVP scope.
- Leave the application runnable after every implementation stage.

## 2. Project Summary

Rave Route is a mobile-first festival planner and the software project within Project Freedom. It should become a real, polished, useful product while helping its developer strengthen software engineering skills.

The MVP specification describes why the product exists, what outcome it should provide, and which user capabilities matter. The technical development plan describes how we will build that outcome, stage by stage.

## 3. MVP Summary

The MVP lets a user:

- View the Rave Route logo and their upcoming festivals on mobile.
- See the next festival emphasised and later festivals collapsed.
- Add, view, edit, and delete festivals.
- Store data locally so it remains after the app is closed.
- Add manual line-up set times and personalise the app appearance.

Each festival contains a title, start date, end date, picture, location, transport-arranged status, accommodation-arranged status, and optional line-up sets.

## 4. Technology Choices

- Angular with standalone components
- Ionic Angular
- Capacitor
- TypeScript and SCSS
- Angular signals for suitable reactive state
- Typed reactive forms
- Jasmine and Karma
- Local storage for MVP persistence

Do not add a dependency automatically. If a dependency appears useful, explain its value and ask the developer for approval before installing it.

## 5. Design Philosophy

Every screen should make the user more excited for their next festival.

The experience is mobile-first, bright, and energetic. The default visual direction uses hot red, white surfaces, and a cool-mist neutral background; users can select blue, green, purple, or pink presets. Usability and accessibility remain requirements, not polish to bolt on later.

## 6. Development Rules

For every stage:

1. Explain what the stage introduces.
2. Inspect the current project structure.
3. List the files expected to change.
4. Implement only the requested stage.
5. Keep changes small, simple, and explicit.
6. Avoid unnecessary abstractions, dependencies, and overengineering.
7. Keep domain logic separate from UI components.
8. Use modern Angular patterns, standalone components, signals where appropriate, and typed reactive forms. Prefer signal-based `input()` and `output()` APIs for component communication when the installed Angular version supports them; do not add outputs unless a real child-to-parent event exists.
9. Add tests where they provide meaningful confidence.
10. Explain important files and how to run and test the result.
11. Highlight unfamiliar Angular, Ionic, or TypeScript concepts.
12. Ask five review questions before moving to the next stage.
13. Stop when the requested stage is complete so the developer can review, test, and commit it.

Do not begin the next build stage until the developer requests it.

## 7. AI Usage Rules

- Act as an engineering guide, not a code generator.
- Explain reasoning in plain language and favour readable code over clever code.
- Make assumptions visible when they affect a decision.
- Do not silently expand scope or implement future features.
- Never expose secrets or place credentials in source control.
- Treat generated code as production code: inspect it, test it proportionately, and explain it.
- At the end of each major stage, review this guide. Update it only for a meaningful new decision, rule, pattern, or architectural convention.
- When updating this guide, explain why, make the smallest useful edit, preserve valid decisions, and add a dated decision note when helpful.

## 8. Review Checklist

Before completing a stage, confirm:

- The requested outcome is fully implemented and future stages were not pulled forward.
- The developer understands the important code and runtime flow.
- The application remains runnable.
- Code is simple, typed, readable, and appropriately separated.
- Mobile usability and accessibility were considered.
- Relevant tests pass, or any missing verification is clearly reported.
- The change has been manually tested where appropriate.
- No unnecessary dependency or abstraction was introduced.
- Run and test instructions are provided.
- This guide was reviewed for any necessary small update.
- The developer is given questions to confirm understanding.
- At the end of every development session, append a brief dated summary to `docs/development-log.md`. The first entry captures project history; later entries capture only that session.

## 9. Current Build Stages

- [x] Stages 0-18 - Completed as part of the v0.1.0 MVP delivery; physical-device and public-release checks remain tracked in the release checklist.
- [x] Stage 19 - MVP Release (v0.1.0 MVP test build created; iOS intentionally deferred)

Stage checkboxes show roadmap progress, not permission to begin the next stage.

## 10. Future Improvements to Avoid During MVP

Do not implement these unless they are explicitly brought into scope later:

- Backend services
- Authentication
- Cloud synchronisation
- Payments
- AI features
- Social features
- Music playback
- Packing lists
- Budgets
- Maps

Future Line-up work, explicitly deferred:

- Bulk paste/import of set times
- Additional automatic import providers beyond the supported Tomorrowland Belgium 2026 official presets and Timetable.lol community catalogue
- Active festival view: choose a current festival and surface the set currently playing; resolve clashes by prioritising Must-see sets or presenting the simultaneous options for the user to choose.

## Decision Notes

- 2026-07-17: Established the initial MVP scope, staged roadmap, technology direction, and working rules.
- 2026-07-17: Adopted `technical-development-plan.md` as the canonical Stage 0-19 delivery plan. Stage 0 remains open until all of its completion criteria are met.
- 2026-07-17: Prepared the Stage 0 planning foundation. Adopted `main` with short-lived topic branches, focused Conventional Commit-style messages, kebab-case files, PascalCase types, camelCase values, and `--rr-` design tokens. Stage 0 remains open until the planning documents are reviewed and committed.
- 2026-07-17: Confirmed that the MVP specification owns product outcome and rationale, while the technical plan owns implementation approach. Dependency additions require explicit developer approval, and stage completion requires full implementation, testing, and understanding.
- 2026-07-20: Stage 1 uses standalone Angular bootstrap, standalone Ionic components, and route-level `loadComponent` lazy loading. Karma uses an existing Windows Edge installation as a fallback for its Chromium launcher when `CHROME_BIN` is not already configured.
- 2026-07-20: Stage 2 uses normal content flow, responsive `clamp()` spacing, and CSS safe-area environment values for the mobile shell. Global styles own the neutral typography baseline; page styles own layout-specific spacing and alignment.
- 2026-07-20: Stage 3 centralises Rave Route colours, spacing, radii, shadows, and Ionic colour mappings in `src/theme/variables.scss`. Components consume `--rr-*` tokens instead of defining raw brand colours.
- 2026-07-20: Stage 4 composes the static home page from standalone presentation components. Festival values remain local hard-coded page data until the Stage 5 domain model and later state stages.
- 2026-07-20: Prefer Angular signal-based `input()` and `output()` APIs for component communication when supported. Use classic decorators only when compatibility requires them.
- 2026-07-20: Festival business rules live in pure utilities under `core/festivals`; `FestivalStore` owns private writable signal state and exposes read-only derived signals. UI components consume state and format display values without owning festival data.
- 2026-07-20: Festival creation uses a typed reactive form that emits `FestivalDraft` through signal-based outputs. `FestivalStore` creates IDs/timestamps and performs immutable sorted updates.
- 2026-07-20: Both inline and modal add-festival variants exist behind `HomePage.addFestivalExperience`. Modal is the provisional default because it isolates the mobile form's scrolling; retain the inline variant until manual keyboard and mobile layout review is complete.
- 2026-07-20: Festival persistence uses `FestivalRepository` behind an injection token, with `LocalStorageFestivalRepository` as the MVP implementation. `FestivalStore` owns asynchronous loading, storage errors, and CRUD state updates.
- 2026-07-20: Festival details, editing, and deletion use route-based pages, the shared form, and a declarative Ionic confirmation alert. Future-card expansion is local home-page signal state, with one expanded card at a time.
- 2026-07-20: Image URLs use a shared image component with an accessible default placeholder. Accessibility includes explicit form errors, disclosure semantics, safe-area padding, loading/error states, and reduced-motion support.
- 2026-07-20: Android packaging uses Capacitor with application ID `com.raveroute.app`. The Camera plugin provides native image selection only on a native platform; browser users retain the image-URL field. Generated temporary launcher and splash assets live in `resources/` and are transformed into Android resources with `@capacitor/assets`.
- 2026-07-21: Stage 19 release preparation records the MVP architecture, known limitations, and a pre-public-release checklist. The v0.1.0 Android debug APK was assembled successfully; store signing and iOS packaging remain deliberate follow-up work.
- 2026-07-23: Use the shared `AppHeaderComponent` for consistent Back, Home, and Settings navigation. Back follows in-app history and hidden controls avoid no-op actions.
- 2026-07-23: Line-up set times are persisted inside their parent festival. Manual entry remains supported alongside explicit, user-confirmed imports.
- 2026-07-23: The first timetable provider is Tomorrowland Belgium 2026. Its Weekend 1 and Weekend 2 official CDN JSON endpoints are fetched only after the user selects a preset and previews it; source performance IDs support safe refreshes without replacing manual entries.
- 2026-07-23: Timetable.lol is a separately labelled community timetable provider. A compact, versioned same-origin asset is generated with `npm run timetable-lol:sync`, loaded only when the user browses its searchable catalogue, and cached in memory for that app session; selected sets persist as normal Rave Route sets with `timetable-lol` source IDs.
- 2026-07-23: Must-see is a persisted per-set preference. The Line-up heart filter applies only to the selected day and works in both schedule views.
- 2026-07-23: Appearance is an explicit persisted Light or Dark setting, independent of the chosen accent colour. The optional custom background image remains the same source image; a mode-appropriate overlay keeps its content legible.
- 2026-07-23: Appearance preferences are local-device settings. Theme presets update app-level CSS tokens and optional background images apply across routed content.
