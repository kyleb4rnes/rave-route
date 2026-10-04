# Pre-release runbook

This runbook separates repeatable project checks from the account, legal, and store decisions that must be completed by the project owner.

## Automated checks

Run this before every candidate build:

```powershell
npm ci
npm run verify
npm run android:sync
```

The GitHub **Quality checks** workflow runs the same lint, unit-test, and production-build gate on every pull request and push to `main`.

Run and review `npm audit --omit=dev` before each release candidate. The full audit can include development-toolchain findings; review Dependabot alerts and pull requests rather than applying force upgrades without compatibility testing.

## Remote catalogue release path

The Timetable.lol catalogue loader can try a configured hosted JSON file before using the bundled fallback. Before relying on no-release catalogue updates:

1. Choose the public catalogue host. Preferred current candidate: Cloudflare Pages serving static JSON.
2. Publish `timetable-lol-catalogue.json` to a stable HTTPS URL.
3. Set `environment.timetableLolCatalogue.remoteUrl` for production builds.
4. Confirm a native build loads the hosted catalogue when online.
5. Temporarily break or block the hosted URL and confirm the app falls back to the bundled catalogue.
6. Keep the bundled catalogue refreshed for every store release so offline installs and hosting failures still have a current-enough fallback.

## Android device acceptance

On at least one physical Android device, test the following before release:

- Clean install, launch, and normal navigation.
- Create, edit, delete, and reopen a festival.
- Select, replace, and remove a festival image and app background image.
- Upgrade from the previous test build with existing photos, then confirm legacy images migrate and still display.
- Close and reopen the app after every image operation.
- Check Line-up creation, editing, deletion, Must-see filtering, imported presets, and the active-festival card.
- Check light/dark modes, every accent colour, and screens with and without a custom background.
- Test offline launch and an import attempt without connectivity.

Version 1 is deliberately device-only: reinstalling the app normally clears private app storage, and there is no backup, export, account, or cloud synchronisation. Treat this as expected behaviour and make it clear in store copy and the published privacy policy.

## Android release packaging

Before the first Play submission, the owner must:

1. Create and securely back up an upload keystore outside the repository.
2. Record the alias and signing process in a private password manager or equivalent secure location.
3. Set the release version name/code in `android/app/build.gradle`.
4. Set the four signing environment variables described in [Android release packaging](android-release.md).
5. Build a signed Android App Bundle and install it through internal testing.
5. Keep the keystore, passwords, and any Play credentials out of Git.

## Google Play beta path

For a new personal Play Console account, Google currently requires a Closed test with at least 12 testers continuously opted in for 14 days before production access can be requested. Open testing becomes available after production access is granted. An invite-only beta can remain on the Closed testing track.

Before uploading, complete the Play Console app setup, identity verification, store listing, content declarations, Data Safety form, privacy policy URL, and Play App Signing configuration. Upload a signed Android App Bundle rather than a debug APK. Keep the feature graphic separate from the app icon: it is a 1024×500 JPEG or 24-bit PNG promotional banner.

## GitHub security configuration

The repository now contains Dependabot configuration and a quality workflow. The owner must still enable these GitHub settings:

- Dependency graph, Dependabot alerts, and Dependabot security updates.
- Private vulnerability reporting.
- CodeQL **default setup** under **Settings → Advanced Security → CodeQL analysis**. GitHub recommends default setup for repositories that do not need a custom scanning workflow.

## iOS preparation

iOS packaging needs a Mac with Xcode and an Apple Developer account. On that Mac, add the Capacitor iOS platform, set Apple signing, add the Camera/photo-library permission text, and add the Filesystem privacy manifest entry required by Apple. Then test photo selection and stored images on a physical iPhone.

## Required owner decisions and assets

- Final app name, icon, splash assets, screenshots, categories, age rating, listing copy, support contact, and reviewer notes.
- Google Play and Apple Developer/App Store Connect accounts and beta-testing setup.
- The project owner/contact details and jurisdiction-specific review for the privacy policy draft.
- Future accounts/cloud-sync direction after the device-only version 1 release, including data ownership, recovery, migration, and conflict handling.
- Future shared set-time calendar direction, including account provider, calendar ownership, membership, invites, permission rules, deletion, abuse handling, and whether realtime updates are required.
- Whether Terms of Use are required for the intended launch market.
- Timetable.lol has granted permission to use its data and requested the visible “Data provided by Timetable.lol” attribution, which is implemented in the import flow. Before public release, provide the production app and hosted-catalogue URLs for any required allowlisting, validate the live integration, and retain its contact/takedown details.
