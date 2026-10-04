# Shared set-time calendars

Planning proposal — 4 October 2026. Assumes Supabase and user accounts will be available later. This document does not implement accounts, database changes, or sharing.

## Recommended product behaviour

An event can have several private, named group calendars, such as “Weekend crew” and “Camping friends”. Each group references one event edition and its shared timetable. A person can belong to several groups. Start the interface with one group, but avoid a one-group-per-event database restriction.

Every member can like and unlike sets for themselves. The heart means “I want to see this”, not confirmed attendance or a group decision. Show a count and member names so friends can spot common interests. Nobody, including the owner, can change another person's likes.

Keep personal must-sees and group likes separate in the first release. On creating or joining a calendar, offer “Copy my must-sees into this group” with a clear explanation that members will see those selections. This is a one-time copy; subsequent changes stay in the selected calendar. Label the active context persistently. A globally synchronised favourites model is simpler to tap through, but would expose later personal choices to every joined group and should require a separate product decision.

## Main journey

1. Open an event's existing Line-up screen and select “Create shared calendar”.
2. Name the group; optionally copy personal must-sees. Creating the calendar also creates its owner membership atomically.
3. Open Invite and use the device share sheet or copy its join link.
4. A friend opens the link, sees a minimal invitation preview, signs in if necessary, and explicitly joins. Preserve the pending invitation through sign-in and ask whether to copy personal must-sees.
5. Both see the same timetable and can like sets. Counts update without changing the chronological order under someone's finger.
6. Tap a count to see who liked the set. Filter to all sets, my likes in this group, anyone's likes, or everyone’s likes; optionally select particular friends.
7. Members can leave; owners can rename, remove members, revoke invitations, transfer ownership, or delete the calendar. The sole owner must transfer ownership or delete before leaving.

Sharing covers timetable information, display names, avatars, and group likes only. Personal budgets, packing lists, arrangements, and private event images are outside this feature. Removing a local festival does not silently delete a shared calendar. Leaving/removal removes that person's active likes from group totals.

## UI directions

### Crew overlay — recommended first release

Extend the existing Line-up screen with a context selector (“Personal” / “Weekend crew”), member summary, and Invite action above the day selector. Keep stage and time views. Under each set show “You, Maya +2” or “3 interested”. The heart always edits the current user's selection in the displayed context. Use the current app theme, including alternative accent colours and dark mode.

This is the smallest change to the existing experience and keeps timetable browsing familiar. Use a bottom sheet for group selection, invitation, and the member list to avoid overcrowding the sticky header.

### Group hub

A group landing screen highlights most-liked sets, upcoming shared interests, and a link to the full timetable. Ranked sets display their actual time and stage. This helps planning before the event but adds navigation when users need to quickly check a set time. Popularity ordering belongs here, not in the chronological timetable.

### Friends comparison

Sets form rows and selected people form columns. Hearts make agreement and differences easy to scan. Only the user's own column is editable. Best as an optional comparison view: on mobile, show a small selected subset with a people picker and an accessible stacked alternative for larger groups. Avoid assigning one colour per friend.

Recommendation: ship Crew overlay, add a lightweight “Popular” filter or panel if needed, and defer the full comparison view until usage supports it.

## Existing code and integration points

- `src/app/features/festivals/festival-lineup/festival-lineup.page.ts` and `.html` already handle days, stage/time views, must-see filtering, and overlap grouping. Extract reusable set rows and pure filtering/clash helpers as required by sharing.
- `src/app/core/festivals/models/festival-set.ts` stores `isMustSee` on each local set. Future shared preferences must be individual records rather than a flag on a shared performance.
- `src/app/core/festivals/festival.store.ts` creates random local set IDs and preserves imported must-sees on refresh by source performance identity. Local IDs cannot be assumed equal across devices.
- The existing festival repository reads/writes whole local festival records. Introduce a separate shared-calendar repository and signal store; do not use whole-festival writes for likes.
- Add a shared calendar route such as `/shared-calendars/:calendarId`, plus `/join/:token`. A joining user must be able to open the calendar without first possessing the creator's local festival record. Existing event screens can link to these canonical calendars.

## Proposed data contract

Exact table names can adapt to the future account schema.

| Record | Key information and constraints |
| --- | --- |
| Event | Canonical ID, source provider/event identity, edition, title, IANA timezone. Private personal planning remains separate. |
| Performance | Canonical ID, event ID, source performance ID, artist, stage, start/end timestamps, festival day, active/cancelled status. Unique imported identity includes event, provider, and performance ID. |
| Shared calendar | ID, event ID, name, owner user ID, status, created/updated times. |
| Membership | Calendar ID, user ID, owner/member role, joined time. Unique calendar/user pair. |
| Group preference | Calendar ID, user ID, performance ID, liked boolean, revision/update time. Unique calendar/user/performance tuple. Validate that the performance belongs to the calendar's event and the user is a current member. |
| Invitation | Calendar ID, hashed random token, expiry, revocation, optional usage limit. Redemption validates availability and creates membership atomically. |
| Personal preference | User ID, performance ID, must-see state; private to that user. Existing local preferences migrate here when account migration is designed. |

Persist positive and negative group preference state so reconnects and unlikes can be reconciled without relying solely on delete notifications. Derive counts from current memberships and liked records; never let clients directly increment a shared counter. Index membership and preference lookups by calendar and user.

## Identity, updates, and time

Catalogue events should map to a common event edition. Map imported performances using event + provider + performance ID, never artist name or time alone. Time/stage edits must retain performance identity and likes. Track cancellations explicitly; show a cancelled set with its previous likes rather than transferring them to a replacement artist. If a provider replaces an ID, reconcile deliberately and leave uncertain matches unresolved.

For custom events, either defer sharing in version one or explicitly publish a shared timetable copy with stable server IDs and an owner-only edit policy. Recommended initial scope is catalogue events, with a clear message on custom-event screens. Do not silently imply custom events are shareable.

Store real start/end instants and an event timezone while retaining the provider's festival-day grouping. The current UI treats early-morning sets as following the evening; test midnight, daylight-saving changes, multi-day events, and viewing from another timezone. Label times as event-local. A set ending exactly when another begins is not a time overlap.

## Permissions and invitations

Use Supabase Row Level Security to enforce membership-based access and self-only preference writes. Owners manage membership and group metadata, not other people's likes. Invitations grant join eligibility, not unrestricted reads. Only minimal invite information is visible before joining, and lookup/redemption should be rate limited. No service-role credential belongs in the client.

Revocation blocks future redemptions but does not remove existing members. Removing a member invalidates their access and queued writes; rotating the invitation prevents immediate rejoining using the same link. Owner transfer and deletion need server-side transactional rules. Counts and member displays must exclude former members. Test permissions through direct requests, not just hidden UI controls.

Supabase reference: https://supabase.com/docs/guides/database/postgres/row-level-security

## Live updates and poor connectivity

Cache the last loaded timetable and group state. Apply a heart immediately with a pending indicator; save an explicit desired value rather than a toggle operation. Coalesce queued changes for the same selection. Show “Offline — changes waiting to sync” and retry on reconnect. Failed permission checks revert the pending change and explain why.

Fetch a full authorised snapshot after reconnect and app resume; live notifications are not a durable history. Subscribe only while the calendar is active, reconcile updates by record identity/revision, and dispose subscriptions when switching groups. Concurrent edits by different users never overwrite one another. For the same user's selection across devices, use revision checks; refresh a stale conflict and offer to reapply rather than blindly replaying an old offline intent.

Invalidate displayed group data and clear its local cache when access is lost or the user signs out. Previously viewed information cannot be made unseen. Invite redemption, group creation, ownership changes, and member removal require a connection in the first release.

Supabase reference: https://supabase.com/docs/guides/realtime/postgres-changes

## Clash semantics

“Your clashes” means overlapping sets liked by the current user in the selected context. “Group overlaps” means different liked sets overlap across the group; this is not automatically a conflict, since friends can split up. “Everyone” means all current members, with a visible denominator such as “4 of 5 interested”; members with no likes are not silently excluded. Keep the full timetable available when nobody has voted or set times have not been released.

## Delivery stages

1. **Before accounts: contracts and prototype.** Agree group-scoped likes, canonical identity, and catalogue-only initial scope. Build the shared-calendar repository contract, fake identities/repository, shared store, and Crew overlay behind a development flag. Demonstrate create/join, context switching, votes, counts, filters, members, and simulated loading/offline/error states. Fake invitation links must be clearly demo-only. No claim of real cross-device sharing.
2. **After accounts: persistence and access.** Add the Supabase adapter, schema migrations, membership policies, invitation redemption, join-after-login flow, owner/member actions, and personal preference migration. Only copy preferences into groups on explicit user action. Keep original local data until migration is acknowledged and make retries idempotent.
3. **Reliability before release.** Add live updates, cache reconciliation, queued preference writes, canonical catalogue refresh, and app/browser invitation routing. Verify actual two-device operation and permission failures before enabling sharing publicly.
4. **Later enhancements.** Friends comparison, custom-event timetable publishing, optional agreed meeting sets, notifications, and external calendar export. These are separate from the first release; a liked set does not automatically become an agreed plan.

## Acceptance checks

- Two accounts join the same event calendar; each heart changes only its owner's preference and both clients show the correct distinct-member count.
- One user can have different selections in two groups; personal must-sees stay private until copied.
- Refreshing the timetable retains votes through time/stage changes; cancelled and unknown sets are handled visibly.
- Joining twice creates no duplicate membership. Expired/revoked links, sign-in interruption, removal, and owner transfer behave predictably.
- Non-members cannot read the group; members cannot alter another user's preference, escalate roles, or vote on another event's performance.
- Offline like/unlike sequences reconcile once without duplicate votes; stale same-user edits and revoked access do not silently overwrite valid state.
- Empty groups, no released timetable, long artist names, larger groups, midnight overlaps, keyboard/screen-reader use, and 320px screens work.
- Existing personal stage/time views, favourites, imports, local festival deletion, and unrelated planning features retain their intended behaviour.

Planning status: source code inspected; only this proposal and illustrative UI concepts were created. Production implementation and multi-user validation remain future work.
