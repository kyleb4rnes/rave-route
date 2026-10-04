# Rave Route Product Specification

This document describes the current local-first product and its intended user experience. The original staged implementation plan is complete through Stage 19; remaining work is ongoing product development, release preparation, remote catalogue operations, and explicitly deferred features.

## Product goal

Give a user one cheerful, dependable place to track upcoming festivals on a mobile device.

## Target experience

A user can open Rave Route, immediately recognise their next festival, inspect later plans, and maintain their festival information without creating an account.

## Functional requirements

The product must allow a user to:

1. Open the application on mobile.
2. See the Rave Route logo on the home screen.
3. See the next upcoming festival emphasised in a large card.
4. See later festivals as collapsed cards and expand them.
5. View full festival details.
6. Browse current and past catalogue festivals, including events whose set times are not yet released, and search/filter them by location, date, duration, and reviewed genre group.
7. Add a catalogue or custom festival and check a saved catalogue festival for newly published set times.
8. Edit a festival.
9. Delete a festival after confirmation.
10. Retain festival data after closing or refreshing the application.
11. Open Help and configure app appearance in Settings.

## Festival information

Each festival records:

- Title
- Start date
- End date
- Picture, with a default when none is supplied
- Location
- Whether transport is arranged
- Whether accommodation is arranged
- Optional ticket and resale links, estimated ticket price, and currency
- A packing list with packed state
- A budget with currency, expenses, and remaining total

The application will also maintain identifiers and creation/update timestamps needed to manage records reliably.

## Core display rules

- The nearest future festival is the primary home-screen focus.
- Later upcoming festivals are visually secondary and initially collapsed.
- Past festivals do not replace the next upcoming festival.
- Empty, loading, missing-record, and storage-error states must be understandable.

## Data and platform constraints

- Festival data is stored locally on the device.
- No account is required for core festival-planning use.
- The app can load a hosted public catalogue so festival listings and set-time data can be updated without a new app-store release. If the hosted catalogue is unavailable or malformed, the app falls back to the bundled catalogue included with the app.
- The app does not call Timetable.lol directly on the user's device.
- The interface is designed mobile-first and packaged with Capacitor.

## Deferred decisions

The current product still does not include:

- User accounts, authentication, and cloud synchronisation
- Shared set-time calendars, calendar membership, and invite flows
- Payments
- AI features
- Social features
- Music playback
- Maps
- Complex image upload or cloud image storage

## Backend direction

The near-term backend work is limited to hosting the generated public catalogue as a static JSON file, with Cloudflare Pages as the preferred free candidate. This keeps weekly catalogue updates independent of app-store releases while preserving the bundled catalogue as a fallback.

Future accounts and shared set-time calendars should be designed as a separate backend phase. Supabase is the preferred candidate to evaluate because it provides authentication, a relational Postgres database, row-level permissions, storage, and realtime capabilities that fit shared calendar ownership and membership rules.

## Current product surface

The current application also includes catalogue browsing/import, ticket metadata, packing lists, budgets, configurable app backgrounds, persistent theme-colour presets, Help, Settings, and full line-up views. User-created festival data remains local-device data and does not currently require an account or cloud service.

## Product outcome

A user can install or open Rave Route, create festival plans, see the next plan emphasised, inspect later plans, edit or delete them, and return later without losing the locally stored data.
