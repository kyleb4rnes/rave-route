# Android release packaging

The current launcher icon is approved and remains sourced from `resources/icon.png`. Do not replace it during Play testing. A 512×512 Play listing copy is available at `resources/play-store-icon.png`.

## One-time owner setup

Create an upload keystore outside the repository and back it up in a password manager or other secure location. Never commit the keystore or its passwords.

Set these environment variables in the terminal used for the release build:

```powershell
$env:RAVE_ROUTE_KEYSTORE_PATH = 'C:\secure\rave-route-upload.jks'
$env:RAVE_ROUTE_KEYSTORE_PASSWORD = 'use-the-password-from-your-password-manager'
$env:RAVE_ROUTE_KEY_ALIAS = 'rave-route-upload'
$env:RAVE_ROUTE_KEY_PASSWORD = 'use-the-key-password-from-your-password-manager'
```

The Android Gradle project reads these values only when all four are present. Without them, a release build remains unsigned and cannot be uploaded to Google Play.

## Build the signed bundle

From the project root:

```powershell
npm ci
npm run verify
npm run android:sync
Push-Location android
./gradlew.bat bundleRelease
Pop-Location
```

The upload candidate is created at:

`android/app/build/outputs/bundle/release/app-release.aab`

Before uploading, confirm the version name and code in `android/app/build.gradle`, install the signed build on a physical device, and use Google Play App Signing during Play Console setup.

## Versioning

The first Play testing candidate is `0.1.0` with version code `1`. Every later upload must increase the version code. Keep the signing environment variables and keystore outside Git.
