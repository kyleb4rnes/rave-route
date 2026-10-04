# User accounts and cloud sync: proposed plan

Prepared 4 October 2026. Status: recommendation for review; no account functionality implemented or external services provisioned.

## Recommendation

Use Supabase Auth and Postgres for optional accounts and personal festival-plan synchronisation. Keep the app usable without an account and preserve local access and editing when a signed-in user loses connectivity. Add private Supabase Storage for user-selected festival photos after text-data sync is dependable. Keep the public Timetable.lol catalogue on its existing static-file path.

Supabase fits the current Angular/Ionic/Capacitor app and the stated future interest in shared calendars. Its relational database and ownership policies are useful for later membership and permissions. Authentication is only one part of this change: data migration, offline synchronisation, account isolation, recovery and deletion require application code.

Assumptions: Android and web remain the current targets; accounts are optional; the first release synchronises one person's data across devices; sharing, invites, public profiles, payments and realtime collaboration are later work. These are proposed defaults, not previously approved product decisions.

## Current application assessment

This is a static architecture and implementation review of the current working tree, including existing uncommitted catalogue changes. It covers startup, routes, feature flows, models, persistence, images, imports, native configuration, test coverage and delivery configuration. It is not a penetration test or a claim that every runtime behaviour has been verified. Generated binaries, dependency internals and unrelated workspace outputs are outside scope. No application tests were run for this documentation-only task.

| Area and evidence | Current behaviour | Consequence for accounts |
| --- | --- | --- |
| `package.json`, `src/main.ts` | Angular 20, Ionic 8, Capacitor 8; standalone bootstrap; no auth SDK or app backend | Add a small Supabase integration without replacing the UI framework |
| `src/app/core/festivals/data/festival.repository.ts` and `src/main.ts:14` | Async CRUD contract injected through `FESTIVAL_REPOSITORY` | Good seam for an account-aware local repository plus a remote adapter |
| `local-storage-festival.repository.ts:7` | One global `rave-route.festivals.v1` array; whole-array read/modify/write; only top-level array validation | Introduce owner-scoped storage, validated migration and transactional writes; prevent overlapping writes from losing changes |
| `festival.store.ts:43` | Loads immediately in its constructor; updates signals after repository persistence | Coordinate startup with identity restoration, and distinguish local-save success from cloud-sync success |
| `festival.store.ts:47` | A load error clears displayed festivals | A network error must not empty the locally saved plan |
| `festival.store.ts:342` | Loading can write catalogue-location backfills | Treat backfills as versioned local migrations, not uncontrolled cloud writes on every read |
| `models/festival.ts` and `models/festival-set.ts` | Line-up and packing nested inside festivals; must-see nested inside each set; UUIDs for newly created entities | Preserve IDs; separate frequently edited items and preferences to avoid overwriting unrelated changes |
| `festival-budget.service.ts:9` | Budgets use a separate global `rave-route.budgets.v1` object and synchronous methods | A festival-only migration would omit budgets; add a budget repository/store and reactive updates |
| `festival-budget.page.ts:24` | Page takes an initial budget snapshot | Reload/react to account changes and incoming sync; handle persistence failures visibly |
| `festival.store.ts:308` and `:323` | Delete/clear remove festivals and images, but never invoke budget cleanup | Correct orphaned budgets; define local-cache clearing separately from deletion across devices |
| `app-settings.store.ts:12` | Theme, appearance and background stored in `rave-route.settings.v1` | Keep theme/appearance as device preferences initially; scope private backgrounds so one account cannot expose another's image |
| `image-storage.service.ts` | Capacitor private files identified by `rave-route-image://`; in-memory resolved URLs; native downloads of provider artwork | Local references are not portable. Separate local cache paths, public artwork URLs and private cloud object keys |
| `app.routes.ts`, `app.component.ts` | No auth routes/guards; launch waits for festival loading, with a temporary five-second minimum | Add account/callback/recovery routes; never make offline startup wait indefinitely for the network |
| `src/main.ts`, feature page constructors | Ionic route reuse and page-local forms/state | Reset navigation, forms, stores and image caches on account change, including cached pages and late async completions |
| `timetable-lol-lineup.service.ts`, environments | Public catalogue tries configured remote JSON then bundled fallback; both remote URLs currently null; catalogue cached per session | Keep catalogue browsing independent of authentication. Remote hosting is still an operational task |
| `AndroidManifest.xml` | Internet access and `singleTask`, but no auth callback intent filter; Android backup enabled | Add and test native return links and token backup exclusions |
| `package.json`, native projects | No Capacitor App/Browser dependency; Android exists, iOS project absent | Native callback/lifecycle handling needs additional integration; iOS is a separate validation milestone |
| Tests and CI | Repository/store unit tests, nine Playwright journeys, lint/build/audit jobs | Extend with real ownership-policy tests, two-device sync, migration and native auth coverage |
| Privacy/release documents | Describe device-only data and no accounts | Update before enabling cloud uploads |

Date utilities, active-festival selection, travel/ticket links, browse filters, logos, cards and most templates/styles can remain. Preserve existing overnight set semantics when converting records; do not reinterpret local festival date/time strings as UTC timestamps. Review venue time-zone support separately before promising equivalent live-set displays on devices in different zones.

## Free options and realistic cost

| Option | Fit for Rave Route | Recommendation |
| --- | --- | --- |
| Supabase | Auth, relational database, private files and database ownership rules in one service | Preferred, with application-owned offline sync |
| Firebase Auth + Firestore | Strong alternative when built-in offline document sync is the highest priority | Viable, but different data model and less attractive for a strict no-billing photo-storage requirement |
| Build and host our own authentication | Requires operating identity, email delivery, recovery, security updates and backups | Unnecessary maintenance for this app |

Firestore can cache data and synchronise queued writes, with last-write-wins behaviour on the same document. Its web persistence needs explicit configuration and Capacitor testing. Firebase Cloud Storage now requires the Blaze billing plan, even where actual usage falls inside a no-cost allowance. That is different from remaining on a strictly free plan. Sources: [Firestore offline behaviour](https://firebase.google.com/docs/firestore/manage-data/enable-offline), [Firebase pricing](https://firebase.google.com/pricing), [Firebase Storage billing requirement](https://firebase.google.com/docs/storage/faq-and-troubleshooting).

The checked Supabase Free plan includes 50,000 monthly active users, a 500 MB database, 1 GB file storage, 5 GB egress and a separate 5 GB cached-egress allowance, with a limit of two active projects. It may pause after a week of inactivity and does not include automatic database backups. Pro starts at US$25/month; upgrading would be a deliberate future decision. Source: [Supabase pricing](https://supabase.com/pricing).

The likely early constraints are photos, duplicated line-ups, bandwidth and email delivery, rather than sign-ins. For illustration, 1,000 people with ten 200 KB photos each consume about 2 GB before overhead. That exceeds the free file allowance even though the auth allowance is barely used. This is an estimate, not a capacity forecast. Measure actual row/index sizes and image sizes with a representative beta dataset.

To stay free initially: keep the public catalogue outside per-user storage, omit avatars, keep backgrounds device-local, compress photos locally, impose server-enforced upload limits, fetch changes rather than entire accounts repeatedly, and avoid realtime subscriptions until useful. Review usage at 50%, 75% and 90% of quotas. At the limit, preserve local editing and show cloud-sync failure clearly; do not silently enable paid billing.

### Email and sign-in recommendation

Default recommendation: email/password, verified email, password reset, sign-out and account deletion. Add Google later if desired. Password sign-in avoids sending an email for every login, which helps stay within free email limits. Never store or implement password verification ourselves.

Supabase's default email sender is restricted to project-team addresses and currently two messages per hour. Public email sign-up therefore needs custom SMTP. [Supabase email setup](https://supabase.com/docs/guides/auth/auth-smtp).

Resend is one candidate: its free transactional allowance is 3,000 emails/month and 100/day. It requires a verified sending domain you control; buying a domain is a separate cost if one is not already available. Free backend hosting does not make that domain free. [Resend limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits), [domain verification](https://resend.com/docs/dashboard/domains/introduction).

If spending absolutely nothing, including a domain, is essential, a Google-only Android/web beta is an alternative because the OAuth flow does not require our own verification/reset email sender. It excludes people unwilling to use Google and needs native-browser callback work. Decide this before the auth stage; do not disable email verification merely to avoid SMTP. Defer SMS authentication and magic-link-only login.

## Proposed architecture

```text
Ionic pages -> Angular signal stores -> owner-scoped local repositories
                                             |
                                 durable outgoing-change queue
                                             |
                                      sync coordinator
                                             |
                         Supabase Auth + Postgres ownership policies

Image service -> private device cache <-> private Supabase Storage (later)
Public catalogue -> hosted static JSON / bundled fallback (independent)
```

Keep `FestivalStore` as the UI-facing domain store. Add an `AuthStore`, an account-context coordinator, a remote adapter, a sync service and a budget store. Do not scatter Supabase calls through pages or simply change the injected repository to a cloud-only implementation.

Use IndexedDB for the new structured local data and outgoing queue, with both changes committed in one transaction. Prove persistence in the Android WebView before committing to this choice; a native database can be considered if that spike fails. Keep Filesystem for image bytes. Retain legacy localStorage readers exclusively for migration. This is a deliberate storage improvement needed for durable sync, not a requirement of Supabase itself.

Use one Supabase client. Only the project URL and publishable key belong in the compiled app. Administrative credentials and SMTP secrets stay on the server/provider. Proposed dependencies are `@supabase/supabase-js`, Capacitor App for callbacks/resume events, and Browser if external-browser OAuth is selected; evaluate a small local-database wrapper and a maintained native secure-storage adapter during the spike. Approve dependencies at implementation time under the developer guide; none are installed by this plan.

### Data design

Keep the current `Festival` shape available to screens through a mapping layer. Proposed remote entities:

| Entity | Contents |
| --- | --- |
| `profiles` | Auth user ID, optional display name, account status; no duplicate password or required avatar |
| `festival_plans` | Owner ID, existing festival UUID, dates/location/arrangements, source metadata, revision, server timestamps, deletion marker |
| `festival_lineups` | One versioned snapshot per personal plan, preserving set UUIDs and provider performance IDs; must-see preferences excluded |
| `set_preferences` | Owner, festival, stable set identity, must-see state |
| `packing_items` | Owner, festival, existing item UUID, label, packed/custom state |
| `festival_budgets` | Owner, festival, currency and limit |
| `budget_items` | Owner, festival, item UUID, description/category/amount |
| `image_assets` (photo phase) | Owner, festival, object key and upload state; never another device's filesystem path |

The first version may duplicate selected public line-up snapshots between accounts to ensure complete restoration without depending on an old catalogue remaining online. Measure this explicitly against 500 MB. If duplication is significant, introduce immutable shared catalogue snapshots referenced by version/hash before broad launch. Do not upload the complete bundled catalogue for every user. This staged compromise avoids building a public-catalogue backend merely to launch private accounts.

Use owner-scoped composite keys and foreign keys on children so ownership cannot disagree with the parent. Add a uniqueness rule for owner/provider/event slug to prevent a catalogue festival being added twice on two devices. Keep server-managed revisions and timestamps separate from legacy client timestamps. Store money as validated decimal values or currency-aware minor units; preserve current numeric values carefully during migration.

### Ownership and security

Enable row-level security on every exposed private table. For reads/deletes, restrict existing rows to the authenticated owner; for inserts/updates, also check the resulting owner and parent relationship. Enforce ownership at the database, independently of UI guards. Only active accounts may use private data, including during account deletion. Server operations must derive user identity from a verified session, not a submitted user ID. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Use private image buckets and owner-prefixed paths, with matching Storage policies, MIME/size restrictions and server-enforced per-user quotas. Persist object keys; obtain temporary access URLs when required and cache bytes for offline use. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

On native devices, store refresh credentials using a reviewed platform-secure adapter and exclude credentials from Android backups. Preferences/localStorage are not a secure vault. Browser sessions need an explicit persistence choice, XSS protection and no token logging. Validate callbacks against exact configured origins/paths; never accept arbitrary redirect destinations.

## Offline, switching accounts and migration

### Synchronisation rules

1. Persist a local edit and its outgoing operation atomically; only then show it as saved on this device.
2. Sync after sign-in, app resume, restored connectivity and explicit retry. Use bounded retries/backoff and handle actual request failures rather than relying only on an online flag.
3. Include owner ID, stable operation ID and expected server revision with each queued change. Server-side writes must be idempotent and compare/update revisions atomically.
4. Merge edits to different items independently. For conflicting edits to the same record, preserve both versions and offer a clear choice; do not silently overwrite expenses or plans based on device clocks.
5. Queue deletions with tombstones so an offline device cannot resurrect deleted data. Older devices outside the tombstone retention window must perform a full reconciliation before uploading stale work.
6. Pull changes in pages using a server-controlled cursor; never advance the cursor before local commit. A transactional change sequence is preferable to an unqualified timestamp cursor.
7. Show Saved on this device, Waiting to sync, Synced, Sign in again, and Needs attention. A failed cloud save does not mean a locally committed edit failed.

Auth expiry while offline must leave the previously authorised user's local plan usable. New sign-ins, server sync and account deletion require connectivity. Cloud revocation cannot instantly erase an offline device; account deletion copy must describe that limit.

### Account boundaries

Use separate guest and user-ID namespaces, including queues and image caches. On sign-out, stop sync, invalidate pending responses, clear in-memory state and cached Ionic pages, and return to the guest area. Never automatically turn private account data into guest data.

If outgoing changes exist, offer sync first or explicit export/discard before removing the account's local copy. Do not silently discard offline edits. Before account B loads, reset A's budget snapshot, form drafts, image URL cache and navigation history. Every async operation captures an account-generation token so a late A response cannot update B's screen or queue.

### Existing user data

Create a versioned local snapshot before conversion, including all three legacy storage keys and an image manifest. Do not treat parse failures as an empty successful migration. Validate IDs, dates, nested items and budgets; map non-UUID legacy IDs consistently when necessary. Orphaned budgets should be reported and preserved for export rather than uploaded as unrelated records.

On first sign-in, present an import summary and ask whether to add this device's guest plans to the account. Copy them using an owner-bound migration ID and stable record mapping. Detect duplicate catalogue selections by provider/event slug; merge preferences by provider performance ID and resolve contradictory values. Custom festivals are not duplicates merely because titles match.

Persist migration checkpoints so interruptions can resume without duplicates. Keep guest originals until the selected data is acknowledged and recovery verified. Mark migrated data with its account destination so signing into another account does not automatically re-upload it. If photos are deferred, say explicitly that text plans are synced and selected photos remain on this device.

## Account experience and lifecycle

Add an Account section to Settings. Guests see the benefit of backup/sync without a mandatory opening sign-up screen. Signed-in users see their email, last successful sync, pending changes, retry, export, sign-out and delete-account actions. Keep appearance controls separate.

Add sign-in, registration, email-confirmation, recovery and callback routes. Guards improve navigation but do not replace database policies. Restore identity and load the correct local namespace before showing private content; don't block Home on a cloud request. Preserve form input on save failure, including the current festival form that resets before its parent confirms success.

Native email and OAuth links need both cold-start and already-running handling through Capacitor App. Choose verified HTTPS App Links where a suitable domain is available; otherwise explicitly configure and validate the chosen app scheme. Configure Supabase redirects and web fallback pages. With PKCE, the verifier must remain available where the code is exchanged; test links opened on a different device/browser and provide a recovery/OTP fallback rather than assuming they work. [Native links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Capacitor App](https://capacitorjs.com/docs/apis/app).

Account deletion is a small authenticated server function with retryable cleanup: require recent authentication, mark the account as deleting and deny further private writes, delete private storage objects, remove app rows, then remove the Auth user and clear local state. Derive the user from the session. Never put the admin deletion API in the client. Supabase notes that owned Storage objects prevent user deletion and existing access JWTs can outlive deletion; policies and function checks must cover this interval. [User deletion](https://supabase.com/docs/guides/auth/managing-user-data).

Provide a machine-readable export of plans, budgets and preferences, with an explicit photo export option once photos sync. Rewrite Clear data into distinct local-cache removal and delete-plans-everywhere actions. Sync is not historical backup: maintain protected database and object backups with a tested restore procedure, particularly on the Free plan.

## Delivery stages and acceptance criteria

| Stage | Deliverable and main files | Done when |
| --- | --- | --- |
| 1. Prove the integration | Disposable development Supabase project; auth/callback spike; local DB and secure-session-storage selection; proposed `core/auth/` | Sign-in survives restart on Android/web; offline cache survives restart; dependency and email choices recorded |
| 2. Prepare local data | Owner-scoped repositories, budget store, migration/export; `core/festivals/data/`, budget service/page, image service | Existing guest plans, budgets and images survive migration; deletes clean up children; failed conversion preserves originals |
| 3. Add accounts privately | `core/auth/`, `features/account/`, auth routes, Settings, startup coordinator, native manifest; SQL migrations/RLS tests | Verification/recovery/sign-out work; account A cannot access B locally or remotely; feature remains behind rollout control |
| 4. Add private plan sync | Remote repositories, queue/sync coordinator, proposed tables and atomic server operations | Two devices converge after offline edits, retries and restarts; duplicates/conflicts/deletions tested; migration import resumes safely |
| 5. Complete lifecycle | Deletion function, export, sync status, usage/backups; Help/privacy/release documents | Entire account can be exported/deleted; partial failure retries safely; no misleading backup claims |
| 6. Add photo sync | Private bucket/policies, image mapping/cache/upload queue, quota enforcement | User photos restore on a second device and remain private; interrupted uploads and cleanup work; usage stays within budget |
| 7. Release beta | Existing CI plus database integration tests; Android device matrix; updated operational runbook | Acceptance tests pass, backup restore rehearsed, limited beta validated and rollout/rollback procedure ready |

Stages 1-5 are the minimum useful accounts + text-sync beta. Stage 6 may follow with clear device-only photo messaging. iOS support and shared calendars are separate later stages. Keep each stage small and reviewable, as required by the existing development guide.

Planning estimate for one developer familiar with this app: roughly 3-5 focused days for an auth/native proof of concept, then 3-5 weeks for migration, safe offline sync, lifecycle handling and beta hardening; photo sync may add about a week. These are rough estimates, not a delivery commitment, and exclude store review, iOS packaging and time spent learning unfamiliar infrastructure. The sync engine is the largest uncertainty.

### Required validation

- Existing guest journeys continue without an account or cloud connection; test Android cold start offline. Web offline reload is a separate concern: the current app has no configured service worker, so do not promise installable/offline web startup without adding and testing app-shell caching.
- A and B cannot select/insert/update/delete each other's data or download private images, including forged owner IDs and mismatched parent IDs. Run these against actual database/storage policies, not only mocks.
- Interrupted migration, malformed legacy data, full local storage, duplicate catalogue imports, and missing photos preserve recoverable data.
- Two-device changes, retry after server commit, expired credentials, account switches during requests, deleted records and conflicting budgets do not lose or leak data.
- Native confirmation/recovery callbacks work when the app is open, closed and backgrounded; cancellation and expired links are understandable.
- Photo upload failures do not block text sync; deletion retry removes objects and metadata; account deletion cannot be undone by a stale queued request.
- Run existing lint/unit/build/audit and Playwright checks. Add isolated Supabase integration tests and physical Android tests. The present Playwright fixture clears localStorage on every document initialisation, so account/reload tests need different fixtures that retain session and data state.

## Decisions before implementation

Recommended defaults are optional accounts, email/password with free SMTP and an existing domain, text sync first, device-local appearance/backgrounds, and no sharing in the first release. Confirm whether a sending domain already exists; if not, choose between that small external cost and a Google-only beta. Confirm whether cloud photos are required in the first accounts release. Choose the hosting region and operating contact details when creating the project.

The next concrete step is Stage 1, followed by the local data foundation. No replacement of working festival screens or move of the public catalogue into Supabase is needed to begin.
