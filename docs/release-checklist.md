# Rave Route public release checklist

## Verified for this release candidate

- [x] Production Angular build succeeds.
- [x] Lint succeeds.
- [x] Unit tests pass.
- [x] Pull-request quality gate checks lint, unit tests, and production builds.
- [x] Security-reporting policy and an owner-completion release runbook are documented.
- [x] Android debug APK is produced from the Capacitor Android project.
- [x] Android application identifier is `com.raveroute.app`.
- [x] Core journey has been reviewed: catalogue browse/import, add, view, edit, delete, persistence, line-up, packing, budget, and image selection.
- [x] Temporary Android icon and splash assets are present.
- [x] Android target and compile SDK are set to API 36, with min SDK 24.

## Before a public/store release

- [ ] Run the complete journey on at least one physical Android device.
- [ ] Replace the temporary icon and splash assets with final brand assets.
- [ ] Define release signing and generate a signed release bundle.
- [x] Version 1 storage decision: device-only, with no backup, export, accounts, or cloud synchronisation.
- [ ] Package and test the iOS application on macOS with Xcode if iOS distribution is planned.
- [x] Enabled GitHub Dependabot alerts/security updates, private vulnerability reporting, and CodeQL default setup.
- [ ] Run and review a dependency vulnerability audit before a public release.
- [x] Store selected images as private Capacitor Filesystem files rather than base64 data in browser local storage.
- [ ] Test image retention through app upgrades, reinstalls, and storage-pressure scenarios.
- [ ] Establish release signing, versioning, and signed Android App Bundle delivery.
- [ ] Create and verify a Google Play Console developer account and complete the app identity/profile requirements.
- [ ] Prepare the Play listing: 512px icon, 1024×500 feature graphic, screenshots, descriptions, category, content rating, target audience, Data Safety form, and support contact.
- [ ] Run Internal testing with a signed bundle, then complete the required Closed testing track before requesting production access.
- [ ] For a new personal Play Console account, keep at least 12 testers continuously opted in for 14 days before applying for production access.
- [ ] Decide whether the first public beta is invite-only Closed testing or Open testing after production access is granted.
- [ ] Publish an accurate privacy policy and complete current store privacy disclosures.
- [ ] Before public launch, establish the production Rave Route URL and provide it to Timetable.lol for API-origin allowlisting. Validate live imports from the deployed web app and native builds, retain the agreed “Data provided by Timetable.lol” attribution, and document the agreed contact/takedown process.
