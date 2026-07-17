# Rave Route MVP Specification

## Product goal

Give a user one cheerful, dependable place to track upcoming festivals on a mobile device.

## Target experience

A user can open Rave Route, immediately recognise their next festival, inspect later plans, and maintain their festival information without creating an account.

## Functional requirements

The MVP must allow a user to:

1. Open the application on mobile.
2. See the Rave Route logo on the home screen.
3. See the next upcoming festival emphasised in a large card.
4. See later festivals as collapsed cards and expand them.
5. View full festival details.
6. Add a festival.
7. Edit a festival.
8. Delete a festival after confirmation.
9. Retain festival data after closing or refreshing the application.

## Festival information

Each festival records:

- Title
- Start date
- End date
- Picture, with a default when none is supplied
- Location
- Whether transport is arranged

The application will also maintain identifiers and creation/update timestamps needed to manage records reliably.

## Core display rules

- The nearest future festival is the primary home-screen focus.
- Later upcoming festivals are visually secondary and initially collapsed.
- Past festivals do not replace the next upcoming festival.
- Empty, loading, missing-record, and storage-error states must be understandable.

## Data and platform constraints

- Festival data is stored locally on the device.
- No account or network connection is required for core MVP use.
- The interface is designed mobile-first and packaged with Capacitor.

## Out of scope

The MVP does not include:

- Backend services or cloud synchronisation
- Authentication
- Payments
- AI features
- Social features
- Music playback
- Packing lists
- Budgets
- Maps
- Complex image upload or cloud image storage

## MVP acceptance outcome

A user can install or open Rave Route, create festival plans, see the next plan emphasised, inspect later plans, edit or delete them, and return later without losing the locally stored data.

