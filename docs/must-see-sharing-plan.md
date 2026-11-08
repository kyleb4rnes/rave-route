# Must-see sharing and calendar export

Planning proposal — 8 November 2026. This document defines a small, device-local sharing feature. It does not create accounts, links, shared state, or a backend.

## Outcome

Let a user share the set times they have marked with a heart (currently named **Must-see**) for one festival. Friends receive a readable itinerary they can discuss immediately. An optional calendar export lets the recipient add those same sets to a compatible calendar app.

Only Must-see sets are eligible. Do not export the full line-up, other festival plans, budgets, packing, images, internal identifiers, provider metadata, or the user's device-local preferences beyond the selected sets.

## Placement and user journey

Place the primary action in the existing Line-up page's sticky header, beside the existing line-up update/check action and above the day picker. It is the natural location because users choose Must-see sets there, and the action applies to the whole festival rather than the day or either schedule view.

Use one compact, clearly labelled **Share must-sees** button with a share icon. It must be available in both Stage and Time views and must not disappear when the Must-see filter is off. Do not render it when the festival has no Must-see sets; show a short nearby explanation, such as "Heart sets to share your plan", rather than presenting a share flow with no content.

On activation:

1. Open an Ionic action sheet offering **Share itinerary**, **Add to calendar**, and **Copy itinerary**.
2. Share itinerary opens the platform share sheet with the plain-text itinerary.
3. Add to calendar creates and shares/downloads one `.ics` calendar file containing only the Must-see sets.
4. Copy itinerary writes the same plain text to the clipboard and confirms success with an accessible toast/status message.

If a native or browser share route is unavailable, retain Copy itinerary as the dependable fallback. A cancellation is not an error and should not show a failure message.

## Export contracts

Put data transformation and formatting in pure utilities under `src/app/core/festivals/`, separate from Ionic and Capacitor APIs. Suggested files:

| File | Responsibility |
| --- | --- |
| `must-see-export.utils.ts` | Select eligible sets, chronological sort, build a share view model, format plain text, and create standards-compliant iCalendar text. |
| `must-see-export.utils.spec.ts` | Unit-test filtering, ordering, text formatting, escaping, dates, and overnight set handling. |
| `must-see-share.service.ts` | Platform boundary: share text/files, create a downloadable web file, and copy text with capability checks and typed results. |

Define a small exported view model rather than passing the complete `Festival` record beyond the feature:

```ts
interface MustSeeExport {
  festivalTitle: string;
  sets: readonly MustSeeExportSet[];
}

interface MustSeeExportSet {
  artist: string;
  day: string;       // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  stage: string;
}
```

The selector must include only `FestivalSet` records with `isMustSee === true`. Sort by `day`, then the existing `getFestivalDayTimeSortValue(startTime)`, then artist/stage as a stable tie-breaker. Export every Must-see set in the festival, not merely the selected Line-up day or currently filtered schedule.

## Plain-text itinerary

Make plain text the primary format. It should be concise, useful in messaging apps, and safe to paste anywhere:

```text
My must-sees at Rave Route Festival

Saturday 18 July
14:00–15:00  Artist A — Main Stage
18:30–19:30  Artist B — Arena

Sunday 19 July
22:00–23:00  Artist C — Afterlife
```

Formatting rules:

- Use the festival title in the heading; do not call it a shared calendar or imply that recipients can edit it.
- Group by festival-local day and format dates with the existing UK English date style.
- Show `Artist — Stage`; use `Unassigned stage` only if stage is blank.
- Preserve the stored 24-hour set-time strings.
- Do not add source attribution or external URLs to the share payload. Timetable.lol attribution remains in the Rave Route UI, where the source is displayed.

## Calendar export (`.ics`)

Generate an iCalendar file with one `VEVENT` per Must-see set. iCalendar is the interoperable format used to exchange calendar events, and it is suitable for recipients using Apple Calendar, Google Calendar, Outlook, and other compatible apps.

Each event should contain:

- `UID`: a deterministic Rave Route namespace plus a non-reversible digest of the festival title, set date/time, artist, and stage, solely to avoid duplicate imports without exposing local record IDs;
- `DTSTAMP`: export generation time in UTC;
- `DTSTART` and `DTEND`: the festival set's local date and time;
- `SUMMARY`: artist name;
- `LOCATION`: stage name, when supplied;
- `DESCRIPTION`: `Must-see at [festival title]`.

Set time data has no festival timezone today. Do **not** invent UTC timestamps: that would shift the visible time for friends in another timezone. The first version should emit floating local `DATE-TIME` values (for example, `20260718T140000`) and document that the times are the festival's published local times. When the product later stores a verified IANA timezone per festival, add `TZID` and regenerate the calendar contract deliberately.

Handle an end time that is less than or equal to the start time as ending on the following calendar day, matching the existing overlap helper. Escape iCalendar text values correctly (backslashes, commas, semicolons, and newlines), use CRLF line endings, and fold long content lines according to the format specification. Name files safely, for example `rave-route-[festival-slug]-must-sees.ics`.

Calendar export is a one-way snapshot. Editing the source Must-see choices later must not modify a recipient's imported events, and recipient calendar changes must never alter Rave Route data.

## Platform approach and dependency decision

The current app has Capacitor Filesystem but does not include `@capacitor/share` or a Clipboard plugin.

Use an adapter with these routes:

| Capability | Web/PWA | Android/iOS Capacitor build |
| --- | --- | --- |
| Share text | `navigator.share()` when available | `@capacitor/share` |
| Copy text | `navigator.clipboard.writeText()` with a safe fallback | Native/web clipboard route behind the same adapter |
| Calendar file | Blob + download link, then user opens/imports it | Write `.ics` to the cache directory, then share file via `@capacitor/share` |

For reliable Android and future iOS share sheets, approve and add the official `@capacitor/share` package, then run `npx cap sync`. Its introduction needs the project's explicit dependency approval before implementation. The service must call availability checks and return a neutral `unavailable`/`cancelled` result rather than assuming every browser or share target supports the operation. Browser sharing and downloads should be tested on installed iPhone Safari PWA as well as desktop browsers.

Avoid an image or PDF export in this stage: both are less accessible and copyable, add rendering complexity, and solve a weaker version of the immediate messaging problem.

## Delivery stages

### Stage 1 — Pure export contracts and preview

- Add the export view model and pure formatter utility with no plugin or platform dependency.
- Build the exact plain-text and `.ics` payloads from representative manual and imported sets.
- Add unit tests for selection, ordering, same-time ties, stage fallback, empty result, escaping, multi-day grouping, and overnight sets.
- Add a development-only or temporary preview path only if needed to verify the payload; do not add a permanent second screen.

**Acceptance:** Given a festival with mixed sets, both formats contain exactly the hearted sets, in chronological order, with no unrelated private data.

### Stage 2 — Line-up controls and text sharing

- Add the compact Line-up sticky-header action and accessible Ionic action sheet.
- Implement Share itinerary and Copy itinerary through the adapter.
- Preserve current line-up refresh, day selection, view switching, filtering, and heart actions.
- Add component tests and Playwright coverage for visible, disabled/hidden, no-favourites, copy-success, unsupported-share, and share-cancel states.

**Acceptance:** A user can share or copy their complete festival itinerary from either Line-up view without changing any Must-see selection.

### Stage 3 — Add to calendar

- Implement iCalendar generation and safe filename creation.
- Add browser download behaviour and native cache-file sharing.
- Install and configure `@capacitor/share` only after approval; ensure Android cache-file sharing works after `npx cap sync`.
- Test imports in at least Apple Calendar, Google Calendar, and Outlook where available, including an overnight set and a festival spanning multiple days.

**Acceptance:** A recipient can add the generated file to a calendar and sees one event per Must-see set at the intended local festival time.

### Stage 4 — Device and release documentation

- Run the full automated suite plus Android device and iPhone Safari/PWA checks.
- Update Help with the one-way snapshot behaviour and the fact that all export choices originate from the user's Must-see hearts.
- Update privacy and release wording: sharing is user initiated; Rave Route still operates without account-based syncing or shared calendars.
- Add a concise entry to `docs/development-log.md` after implementation, including validation results and any browser/platform limitations.

**Acceptance:** The user can understand what is shared, the generated content is accurate, and the product makes no implication of live collaboration or ongoing calendar synchronization.

## Out of scope

- Shared links, invitation flows, recipient editing, read receipts, accounts, cloud sync, or group likes.
- Importing a friend's itinerary into Rave Route.
- Exporting the full line-up or any non-Must-see data.
- Event reminders, alarms, time-zone conversion, or automatic updates to an already imported calendar.
- Image/PDF exports, custom themes/templates, and external social-network integrations.

Those remain distinct from the later accounts and shared set-time calendars work described in `docs/shared-set-time-calendars-plan.md`.
