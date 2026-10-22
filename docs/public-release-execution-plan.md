# Rave Route public-release execution plan

This plan takes the current feature-complete device-only app to a private beta and then a public store release. The feature scope is frozen for this release. New work should be limited to defects, platform requirements, privacy/release obligations, and usability issues discovered during acceptance testing.

## Release outcome

Ship Rave Route as a stable, offline-capable festival planner with:

- a signed Android release and a private beta path;
- a signed iOS build distributed privately through TestFlight, if iOS distribution is pursued;
- a reliable hosted catalogue with a bundled offline fallback;
- clear device-only storage, privacy, and support information;
- no unresolved release-blocking crash, data-loss, permission, signing, or store-compliance issue.

The target release remains version `0.1.0` for the first candidate. Every subsequent store upload must increment the platform build number.

## Working rules

1. Freeze product scope. Do not add accounts, cloud sync, social features, payments, music, maps, or other deferred features before this release.
2. Keep the `main` branch releasable. Use short-lived branches for fixes and merge only after the automated gate passes.
3. Treat local festival data and private images as device-only. Do not imply backup, synchronisation, or recovery in product or store copy.
4. Record evidence for every gate: build number, device/OS, date, result, and any defect link.
5. A failed gate creates a fix-and-retest loop; it does not silently become a release exception.

## Milestone 0 — Scope freeze and release baseline

**Goal:** establish the exact candidate that will be tested.

Tasks:

- Review the current feature set and explicitly defer new feature requests.
- Remove temporary development behavior, including the onboarding debug override.
- Confirm the app name, bundle/application identifiers, version, support contact, and target launch markets.
- Review splash artwork, logo treatment, onboarding copy, and the four onboarding videos on a mobile device.
- Create a release branch or release tag point from a clean `main` commit.

Exit criteria:

- The candidate can be installed from a clean build.
- Product and privacy wording matches the actual device-only behavior.
- All known defects are classified as release-blocking, post-release, or accepted cosmetic issues.

## Milestone 1 — Engineering release candidate

**Goal:** prove the web and native source are reproducible and clean.

Tasks:

- Run `npm ci` and the full `npm run verify` quality gate.
- Run the Playwright journey suite and confirm the first-run onboarding path separately.
- Run `npm audit --omit=dev` and review Dependabot findings; resolve production-impacting issues and document development-only exceptions.
- Verify production environment configuration, including the hosted catalogue URL and bundled fallback.
- Confirm no credentials, signing files, personal data, or rental-machine artifacts are tracked.
- Confirm generated onboarding media is present, mobile-formatted, silent, and loaded from bundled assets.

Exit criteria:

- Lint, unit tests, browser journeys, production build, and production dependency audit pass.
- A clean checkout can reproduce the candidate build.
- The release notes list the exact commit and version/build numbers under test.

## Milestone 2 — Catalogue and hosted-service readiness

**Goal:** make catalogue data dependable at release time.

Tasks:

- Run the reviewed Timetable.lol catalogue sync and inspect all JSON changes.
- Push the approved catalogue and verify the Cloudflare Pages URL serves the expected file.
- Test a native build online: catalogue browse, search, filters, import, artwork, ticket metadata, and attribution.
- Test the failure path by blocking or disabling the hosted URL and confirming the bundled catalogue is used.
- Confirm a saved catalogue festival can check for updated set times without losing manual sets or Must-see choices.
- Confirm the final production URL and hosted catalogue URL are ready for any Timetable.lol allowlisting request.

Exit criteria:

- Hosted and bundled catalogue versions are known and recorded.
- Online and offline/fallback import behavior both pass on native builds.
- Attribution and source labeling remain visible and accurate.

## Milestone 3 — Android physical-device acceptance

**Goal:** validate the complete product on supported Android hardware before signing.

Tasks:

- Test clean install, upgrade over an earlier build, relaunch, offline launch, and storage-pressure behavior.
- Exercise create, catalogue import, custom festival, edit, delete, details, line-up, Must-see, packing, budget, ticket, transport, and accommodation flows.
- Select, replace, remove, persist, and migrate festival and app-background images.
- Test the first-run onboarding: splash handoff, visible progress segments, video playback, Skip intro, Back, replay from Help, and Start planning transition.
- Test Light/Dark modes, every accent colour, custom backgrounds, safe areas, keyboard/form behavior, and external links.
- Record defects with device model, Android version, build number, reproduction steps, and screenshots/video.

Exit criteria:

- No release-blocking Android defect remains.
- Image retention and migration are proven across an upgrade.
- The onboarding videos have been reviewed on a physical device and the release checklist item is complete.

## Milestone 4 — iOS packaging and private TestFlight beta

**Goal:** produce and test the first iPhone build.

Prerequisites before renting the Mac:

- Apple Developer Program membership is active.
- App Store Connect access works and an app record exists for the chosen bundle ID.
- The repository candidate has passed Milestones 0–3, or any remaining exceptions are explicitly accepted.
- Permission copy, privacy wording, icon, splash, support contact, and beta test notes are prepared.

Tasks on the rented Mac:

- Install the compatible Xcode and command-line tools.
- Add `@capacitor/ios`, generate the iOS project, build the web app, and run `npx cap sync ios`.
- Configure the Apple team, bundle ID, signing, deployment target, version/build number, icon, and splash assets.
- Add Camera and photo-library usage descriptions to `Info.plist`.
- Add and validate the iOS privacy manifest for the app and included SDKs.
- Archive and upload a build to App Store Connect.
- Create an internal TestFlight group, add the owner account, and install the build on the iPhone.

Exit criteria:

- The build installs through TestFlight and launches without a signing or provisioning warning.
- iPhone acceptance passes for catalogue loading/fallback, photo selection, private image persistence, onboarding/video playback, navigation, external links, and relaunch.
- Any iOS-only defect is fixed and the build is re-uploaded, or explicitly deferred with a documented reason.

## Milestone 5 — Store, privacy, and support package

**Goal:** make the release understandable and reviewable.

Tasks:

- Finalize app name, icon, splash, screenshots, feature graphic, descriptions, category, age rating, and support URL/contact.
- Publish the privacy policy and ensure it accurately describes local storage, private images, hosted catalogue requests, external links, and the absence of accounts/sync.
- Complete Apple App Privacy and Google Play Data Safety declarations from the actual implementation.
- Decide whether Terms of Use are needed for the launch market.
- Prepare reviewer notes: device-only storage, catalogue source/attribution, image permissions, TestFlight credentials if needed, and the main test path.
- Write a short changelog and known-limitations note.

Exit criteria:

- Store metadata, privacy disclosures, permissions, and app behavior agree.
- Support contact and failure-reporting route are live and tested.
- No required listing asset or legal disclosure is outstanding.

## Milestone 6 — Signed beta and release-candidate hardening

**Goal:** test the exact signed artifacts that could become public.

Tasks:

- Create the protected Android upload keystore and back it up securely outside the repository.
- Build the signed Android App Bundle and distribute it through Play internal testing.
- Upload the signed iOS build to TestFlight and repeat the core acceptance matrix.
- Test upgrade from the previous beta on both platforms, including image retention and local data behavior.
- Monitor crash reports, TestFlight feedback, Play internal-test feedback, and catalogue hosting logs.
- Fix only release-blocking defects; rerun the full gate after each fix.

Exit criteria:

- Android and iOS signed candidates pass the same release acceptance matrix.
- No open release blocker, data-loss issue, signing issue, or store disclosure mismatch remains.
- The exact artifacts, hashes/build numbers, and rollback notes are recorded.

## Milestone 7 — Public release decision and launch

**Goal:** publish deliberately and retain a recovery path.

Tasks:

- Make the go/no-go decision using the exit criteria below.
- Submit the chosen Android track and iOS version for the intended release path.
- Confirm store processing, listing visibility, install, launch, and first-run onboarding from a fresh device state.
- Monitor the first 24–72 hours for crashes, catalogue failures, image failures, and severe support reports.
- Keep the prior known-good artifacts and release notes available for rollback or hotfix preparation.

Exit criteria:

- The public builds are installable from the intended stores.
- A fresh user can complete onboarding and reach Home.
- Core planning data remains local and usable after relaunch.
- Monitoring and support ownership are active.

## Critical path and recommended order

```text
Scope freeze
  -> engineering candidate
  -> catalogue readiness
  -> Android physical QA
  -> Apple account + App Store Connect setup
  -> rented Mac / iOS project
  -> TestFlight iPhone QA
  -> store/privacy package
  -> signed beta hardening
  -> go/no-go and public release
```

The most efficient next work is Milestone 0 followed by Milestone 1. Do not rent the Mac until the candidate is stable enough that the rental session is for iOS packaging, signing, and device testing—not feature development.

## Go/no-go checklist

Release only when all answers are “yes”:

- Is the tested commit identified and reproducible?
- Do lint, unit tests, browser journeys, production build, and production audit pass?
- Have Android and iPhone signed candidates passed the core acceptance matrix?
- Are hosted and bundled catalogue paths both verified?
- Are image permissions, image persistence, and device-only storage behavior understood?
- Are privacy policy, App Privacy, Data Safety, permissions, and store copy consistent?
- Are signing credentials and release artifacts backed up securely?
- Is there an owner for support, crash monitoring, catalogue failures, and hotfix decisions?

## Post-release, still intentionally deferred

Accounts, cloud synchronization, shared calendars, payments, social features, music playback, maps, and other deferred roadmap items remain separate from this release. Revisit them only after the first release has real usage and support evidence.
