# Rave Route public release checklist

The staged execution path for these checks is documented in [Public-release execution plan](public-release-execution-plan.md).

## Verified for this release candidate

- [x] Production Angular build succeeds.
- [x] Lint succeeds.
- [x] Unit tests pass.
- [x] Pull-request quality gate checks lint, unit tests, and production builds.
- [x] Security-reporting policy and an owner-completion release runbook are documented.
- [x] Android debug APK is produced from the Capacitor Android project.
- [x] Android application identifier is `com.raveroute.app`.
- [x] Core journey has been reviewed: catalogue browse/import, add, view, edit, delete, persistence, line-up, packing, budget, and image selection.
- [x] Current Android icon is approved for Play testing and is kept as the final icon source (`resources/icon.png`).
- [x] Android splash assets are present for testing.
- [x] Android target and compile SDK are set to API 36, with min SDK 24.

## Before a public/store release

- [x] Run the complete journey on at least one physical Android device.
- [ ] Decide whether the current splash artwork is final before public release.
- [ ] Review the first-run onboarding flow and its four mobile demonstration videos on a physical device before public release.
- [ ] Define release signing and generate a signed release bundle.
- [x] Version 1 storage decision: device-only, with no backup, export, accounts, or cloud synchronisation.
- [x] iOS access decision: use a rented cloud Mac for builds, signing, App Store Connect uploads, and periodic maintenance; do not buy a Mac unless this becomes more cost-effective or physical-device debugging becomes routine.
- [ ] Package and test the iOS application on the rented macOS/Xcode environment if iOS distribution is planned.
- [ ] Test the iOS build through TestFlight on a physical iPhone, including catalogue loading, catalogue fallback, photo selection, stored images, navigation, and external links.
- [x] Enabled GitHub Dependabot alerts/security updates, private vulnerability reporting, and CodeQL default setup.
- [x] Run and review the production dependency vulnerability audit (`npm run audit:production` reported 0 vulnerabilities on 2026-10-04).
- [x] Store selected images as private Capacitor Filesystem files rather than base64 data in browser local storage.
- [ ] Test image retention through app upgrades, reinstalls, and storage-pressure scenarios.
- [x] Establish Android versioning: version name `0.1.0`, version code `1`, and environment-based release signing configuration.
- [x] Choose Cloudflare Pages for the hosted catalogue URL: `https://rave-route-catalogue.pages.dev/timetable-lol-catalogue.json`.
- [x] Configure `environment.timetableLolCatalogue.remoteUrl` for production builds.
- [ ] Verify online hosted-catalogue loading and bundled fallback behaviour in a native build.
- [ ] Create the protected upload keystore and generate the signed Android App Bundle.
- [ ] Create and verify a Google Play Console developer account and complete the app identity/profile requirements.
- [ ] Prepare the Play listing: use `resources/play-store-icon.png` for the 512px icon, then provide a 1024×500 feature graphic, screenshots, descriptions, category, content rating, target audience, Data Safety form, and support contact.
- [ ] Run Internal testing with a signed bundle, then complete the required Closed testing track before requesting production access.
- [ ] For a new personal Play Console account, keep at least 12 testers continuously opted in for 14 days before applying for production access.
- [ ] Decide whether the first public beta is invite-only Closed testing or Open testing after production access is granted.
- [ ] Publish an accurate privacy policy and complete current store privacy disclosures.
- [ ] Before public launch, establish the production Rave Route and hosted-catalogue URLs and provide them to Timetable.lol for any required API-origin allowlisting. Validate hosted-catalogue imports from the deployed web app and native builds, retain the agreed “Data provided by Timetable.lol” attribution, and document the agreed contact/takedown process.
