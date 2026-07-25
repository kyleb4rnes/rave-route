# Rave Route v0.1.0 MVP release checklist

## Verified for this release candidate

- [x] Production Angular build succeeds.
- [x] Lint succeeds.
- [x] Unit tests pass.
- [x] Android debug APK is produced from the Capacitor Android project.
- [x] Android application identifier is `com.raveroute.app`.
- [x] Core journey has been reviewed: add, view, edit, delete, persistence, and image selection.
- [x] Temporary Android icon and splash assets are present.

## Before a public/store release

- [ ] Run the complete journey on at least one physical Android device.
- [ ] Replace the temporary icon and splash assets with final brand assets.
- [ ] Define release signing and generate a signed release bundle.
- [ ] Decide whether cloud backup/sync is required before public release.
- [ ] Package and test the iOS application on macOS with Xcode if iOS distribution is planned.
- [ ] Enable and review GitHub Dependabot alerts/security updates and code scanning before a public release.
- [ ] Run and review a dependency vulnerability audit before a public release.
- [ ] Design authentication, authorisation, account recovery, session handling, and local-data migration before introducing user accounts or cloud sync.
- [ ] Move selected images out of browser local storage and test data retention through app upgrades, reinstalls, and storage-pressure scenarios.
- [ ] Establish release signing, versioning, and signed Android App Bundle delivery.
- [ ] Prepare complete store listings: final icon/splash, screenshots, descriptions, classifications, support contact, and reviewer notes.
- [ ] Publish an accurate privacy policy and complete current store privacy disclosures.
- [ ] Review Timetable.lol's licence/terms and source-data rights; confirm redistribution and attribution permission, or remove the bundled catalogue before public release.
