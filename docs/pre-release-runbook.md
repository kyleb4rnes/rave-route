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

`npm audit --omit=dev` currently reports no production dependency vulnerabilities. The full audit includes development-toolchain findings; review Dependabot pull requests rather than applying force upgrades without compatibility testing.

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
3. Set the release version name/code.
4. Build a signed Android App Bundle and install it through internal testing.
5. Keep the keystore, passwords, and any Play credentials out of Git.

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
- Whether Terms of Use are required for the intended launch market.
- Timetable.lol's written licence/permission, attribution terms, data-refresh expectations, and takedown contact. Do not distribute the bundled Timetable.lol catalogue unless this is resolved; otherwise remove it before public release.
