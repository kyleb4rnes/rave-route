# Mac setup and private iOS beta runbook

This is the smallest practical path for packaging the current device-only Rave Route app for private iPhone testing through TestFlight. The Mac is needed for Xcode, iOS signing, and uploading the build; normal web and Android development can continue on Windows.

## Before using the Mac

- Apple ID enrolled in the Apple Developer Program.
- App Store Connect app record using bundle ID `com.raveroute.app`.
- At least one iPhone for TestFlight testing.
- Repository pushed to the commit that should be tested.
- Secure storage for Apple credentials and recovery details; never put them in the repository.

The first private test remains device-only: there are no accounts, cloud sync, backup, analytics, or push notifications. Tell testers that deleting the app can delete local festival plans and private images.

## Minimum-Mac-use strategy

Do all ordinary preparation on Windows first. The Mac should be reserved for the native iOS project, real-iPhone checks, signing, archiving, and TestFlight upload.

### Before opening the Mac — Windows/CI

1. Finish the intended code and content changes on Windows.
2. Run `npm ci` and `npm run verify`.
3. Run the browser end-to-end tests when the change affects a user journey.
4. Confirm the production catalogue URL and bundled catalogue are correct.
5. Commit and push the candidate to `main`.
6. Write down the candidate commit, intended version, build number, and the specific iPhone checks required.

Do not spend Mac time fixing ordinary Angular, Ionic, TypeScript, catalogue, or browser-test issues. Fix those on Windows, push again, and only then use the Mac.

## One-time Mac setup

1. Update macOS and install Xcode from the Mac App Store.
2. Open Xcode once, accept its licence, and install the requested iOS platform/runtime.
3. Install Node.js 22 LTS and Git, then authenticate to the repository host.
4. Clone the repository and enter the `rave-route` directory.
5. Install dependencies: `npm ci`.
6. Generate the native project once: `npm run ios:add`. If `ios/` already exists, use `npm run ios:sync` instead.
7. Open it with `npm run ios:open`.

After the first native project is generated and configured, commit the complete `ios/` directory and the Xcode project settings back to GitHub. This is the main one-time Mac handoff. Do not commit certificates, private keys, provisioning profiles, or credentials. Once `ios/` is in the repository, later Mac sessions only need to pull it and sync the web build.

## Xcode configuration

Select the `App` target and set:

- Bundle Identifier: `com.raveroute.app`.
- Team: the Apple Developer team that owns the App Store Connect app.
- Automatically manage signing: enabled for the first beta.
- Version: `0.1.0` for the first private build.
- Build: `1`; increase it for every later upload of the same version.

In the iOS target Info tab, add:

- `NSPhotoLibraryUsageDescription`: `Rave Route uses your photo library when you choose a festival or background image.`

The app does not request camera capture, location, contacts, microphone, notifications, or tracking permissions. Do not add those capabilities. Review the generated privacy manifest for the Xcode/Apple SDK version in use and keep it limited to APIs actually reported by Xcode and the bundled Capacitor plugins.

## Build and local device check

After pulling a new commit or changing dependencies:

```bash
npm ci
npm run verify
npm run ios:sync
```

For a later session, do not run the full verification suite on the Mac if it already passed on Windows/CI. The shortest normal Mac path is:

```bash
git pull --ff-only
npm ci
npm run ios:sync
npm run ios:open
```

Use `npm run verify` on Windows or CI before the Mac session. Run it on the Mac only when the Mac itself, Xcode, the iOS project, or a native plugin has changed.

Run from Xcode on a connected iPhone and check onboarding, catalogue import and offline fallback, festival CRUD and relaunch, photo selection/replacement/removal, line-up, must-see, packing, budget, settings, help, external links, Light/Dark modes, accent colours, and relaunch after image operations.

## Upload the private beta

1. In Xcode choose `Any iOS Device (arm64)` or the current archive destination.
2. Product → Archive.
3. Validate the archive, resolve signing/privacy warnings, and distribute it to App Store Connect.
4. After processing, add the build to an internal TestFlight group first.
5. Add intended testers, send invitations, and install through TestFlight.
6. Record the build number and any iOS-only defects.

Keep the group invite-only; do not create a public testing link yet.

## Set up TestFlight and test on your own iPhone

### 1. Prepare Apple accounts

1. Enrol in the Apple Developer Program using the Apple ID that will own the app.
2. Sign in to [App Store Connect](https://appstoreconnect.apple.com/) with that Apple ID.
3. Accept any outstanding agreements and complete the required account, tax, and banking information when prompted.
4. In App Store Connect, create a new iOS app with:

   - Name: `Rave Route`
   - Primary language: English
   - Bundle ID: `com.raveroute.app`
   - SKU: an internal value such as `rave-route-ios`

5. In the Apple Developer account, confirm that the `com.raveroute.app` App ID exists. If it does not, create it as an explicit App ID.

### 2. Connect the Mac and iPhone

1. Sign the Mac into the same Apple ID in Xcode under Settings → Accounts.
2. Connect the iPhone to the Mac with a cable the first time.
3. Unlock the iPhone and choose Trust if asked.
4. Enable Developer Mode on the iPhone if Xcode requests it. The phone will restart.
5. In Xcode, select the iPhone as the run destination, select the `App` target, choose the correct Apple Team, and let Xcode manage signing.
6. Press Run. This installs a development build directly on your phone.

Use this direct build for quick debugging. It is separate from TestFlight and does not require inviting testers.

### 3. Upload the first TestFlight build

1. In Xcode, select `Any iOS Device (arm64)` as the destination.
2. Confirm the version is `0.1.0` and the build number is `1`.
3. Select Product → Archive.
4. When the archive finishes, choose Distribute App.
5. Choose App Store Connect → Upload.
6. Leave automatic signing and symbol upload enabled unless there is a specific reason not to.
7. Wait for App Store Connect to process the build. Processing can take some time; the build is not immediately available in TestFlight.

### 4. Create your internal testing group

1. Open the app in App Store Connect and select the TestFlight tab.
2. Add yourself as an App Store Connect user with a suitable role if you are not already the Account Holder.
3. Create an internal tester group such as `Rave Route private test`.
4. Add your Apple ID email address to the group.
5. Add the processed build to the group.
6. Install the TestFlight app from the App Store on your iPhone.
7. Open the invitation email or TestFlight invitation link on the iPhone.
8. Accept the invitation and install Rave Route.

Internal testers are the best first step because they are members of the App Store Connect team and normally do not require beta App Review. Apple allows up to 100 internal testers. [Apple TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)

### 5. Test the installed TestFlight app

Test the app as a normal user, not only from Xcode:

- Complete and replay onboarding.
- Browse and import a catalogue festival.
- Create, edit, delete, and reopen festivals.
- Select, replace, display, and remove festival photos.
- Select and remove the app background photo.
- Check line-ups, must-see sets, packing, budgets, Help, and Settings.
- Test Light mode, Dark mode, every accent colour, and custom backgrounds.
- Close and reopen the app after image changes.
- Test catalogue loading with internet access, then test the bundled fallback offline.
- Open ticket, transport, accommodation, and other external links.
- Confirm that the app clearly behaves as device-only storage.

Keep a simple record of the phone model, iOS version, TestFlight build number, result, and any defect found.

## Share the private beta with other people

### Option A: internal testers

Use this for people who can be added to your App Store Connect team.

1. In App Store Connect, go to Users and Access.
2. Invite the tester using the email attached to their Apple ID.
3. Give them the minimum suitable role and TestFlight access.
4. Add them to the internal tester group.
5. Add the build to that group.
6. They install TestFlight, accept the email invitation, and install Rave Route.

This is the simplest route for yourself and a very small trusted team.

### Option B: external testers

Use this for friends or testers who should not receive App Store Connect access.

1. In TestFlight, create an external tester group such as `Friends and family`.
2. Add the build to the group.
3. Enter the beta app description and what testers should test.
4. Add the required beta review information, including a contact email and clear test instructions.
5. Submit the first external build for Apple beta review if App Store Connect requests it.
6. After approval, invite testers individually by email or create an invite link.
7. Tell testers to install TestFlight, accept the invitation on their iPhone, and install Rave Route.

External testers do not need App Store Connect accounts. The first build shared with an external group may require Apple beta review; later builds generally follow the existing approved testing setup. Apple supports up to 10,000 external testers, although this project should remain a small invite-only test. [Apple TestFlight guidance](https://developer.apple.com/testflight/)

### What to send testers

Send them:

- The TestFlight invitation or invite link.
- A short list of the main journeys to test.
- The current build number.
- A warning that festival data and photos are stored only on the phone and may be lost if the app is deleted.
- A simple feedback route, such as email or a shared form.

Ask testers to include their iPhone model, iOS version, build number, steps to reproduce, and screenshots where useful. TestFlight also provides tester feedback and crash information in App Store Connect.

## Share later builds

For each update:

1. Pull the intended commit on the Mac.
2. Run `npm ci`, `npm run verify`, and `npm run ios:sync`.
3. Increase the Xcode build number. Keep the marketing version at `0.1.0` for private beta fixes, or change it deliberately for a larger release.
4. Archive and upload again.
5. Wait for processing.
6. Add the new build to the existing internal and/or external groups.
7. Add release notes describing what changed and what testers should focus on.

TestFlight builds expire after a limited testing period, so replace old builds when necessary. Keep the same tester groups throughout the private beta so testers receive update invitations consistently.

## Repeatable Mac session

```bash
git pull --ff-only
npm ci
npm run verify
npm run ios:sync
npm run ios:open
```

Increment the Xcode build number, archive, upload, and replace the TestFlight build only after the checks pass. Never commit certificates, provisioning profiles, or App Store Connect API keys.

## Mac session decision guide

Use the smallest session that matches the change:

| Change | Mac required? | Mac work |
| --- | --- | --- |
| Angular/Ionic UI or business logic | No, unless releasing iOS | Windows verification; later Mac sync/archive |
| Catalogue JSON or hosted catalogue | No | Windows/CI and Cloudflare Pages |
| Dependency update with no native plugin change | Only to release iOS | Pull, `npm ci`, sync, smoke-test, archive |
| Capacitor/plugin update | Yes | Sync, inspect native changes, test on iPhone, archive |
| iOS permission/capability | Yes | Xcode project settings, privacy text, real-device test |
| iOS-only defect | Yes | Reproduce with Xcode logs, fix on Windows where possible, retest |
| New TestFlight build | Yes | Pull, sync, smoke-test, archive, upload |
| Public store release | Yes | Final archive, App Store submission, review responses |

If the Mac is too slow or its Xcode is too old to upload, use it for the real-iPhone diagnosis and use a newer/cloud Mac only for the archive/upload step.

## What does not need the Mac

Angular/Ionic development, browser testing, unit tests, linting, production builds, Playwright checks, catalogue refreshes, Cloudflare Pages publishing, and Android development can continue on Windows.
