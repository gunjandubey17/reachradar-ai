# ReachRadar Delivery Log

Last updated: 2026-03-29

## Overview

This document records the work completed on ReachRadar across the web app, policy/compliance pages, pricing and free-trial logic, and the new Flutter mobile app.

## 1. Website and compliance work completed

### Delete account page
- Added a real public route for account deletion requests.
- URL: `https://reachradarai.com/delete-account`
- Files involved:
  - `client/src/pages/DeleteAccount.jsx`
  - `client/src/App.jsx`
  - `client/src/pages/Privacy.jsx`
  - `client/public/sitemap.xml`

### CSAE / safety standards page
- Added a public safety standards page for Play Console compliance.
- URL: `https://reachradarai.com/safety-standards`
- Files involved:
  - `client/src/pages/SafetyStandards.jsx`
  - `client/src/pages/Landing.jsx`
  - `client/public/sitemap.xml`

### Public contact email update
- Replaced public-facing email references from `rakhhbakk@gmail.com` to `gd@reachradarai.com`.
- Files updated:
  - `client/src/pages/Privacy.jsx`
  - `client/src/pages/Terms.jsx`
  - `client/src/pages/DeleteAccount.jsx`
  - `client/src/pages/SafetyStandards.jsx`

## 2. Product and website UX improvements completed

### Landing page interactive demo
- Added an interactive demo section on the landing page.
- Users can select platform-like inputs and see a live sample risk score / action output.
- Goal: reduce friction and let visitors see product value before sign-in.
- File involved:
  - `client/src/pages/Landing.jsx`

### Free plan expansion
- Free tier updated to:
  - 5 audits
  - 5 pre-post checks
- Backend logic updated without adding a new Supabase schema column for pre-checks.
- Files involved:
  - `api/index.js`
  - `client/src/pages/Pricing.jsx`
  - `client/src/pages/Audit.jsx`
  - `client/src/pages/PreCheck.jsx`

### Free-trial messaging improvements
- Updated copy to say:
  - `Your first 5 audits are free`
  - `Your first 5 pre-post checks are free`
- Added visible usage counters to the web app.
- Files involved:
  - `client/src/pages/Pricing.jsx`
  - `client/src/pages/Audit.jsx`
  - `client/src/pages/PreCheck.jsx`
  - `client/src/pages/Dashboard.jsx`
  - `api/index.js`

### Pricing page interaction fix
- Fixed the pricing cards so the selected card highlights correctly.
- Removed the behavior where the Pro Monthly card stayed visually selected regardless of user interaction.
- File involved:
  - `client/src/pages/Pricing.jsx`

### Pre-post checker engagement goals
- Changed engagement goal selection from single-select to multi-select.
- Web client now sends multiple selected goals while staying backend-compatible.
- File involved:
  - `client/src/pages/PreCheck.jsx`

## 3. API bug fixes completed

### Supabase `.catch is not a function` fix
- Root cause:
  - Supabase query builders were being used like normal promises with `.catch()`.
  - These builders are awaitable, but do not behave like ordinary promise chains for this usage.
- Fix:
  - replaced `.catch()` chaining with explicit `await` + `{ error }` handling.
- File involved:
  - `api/index.js`

## 4. Flutter mobile app completed

### Flutter project creation and toolchain setup
- Installed Flutter using Puro.
- Installed JDK 17.
- Installed Android Studio.
- Installed Android command-line tools and SDK components.
- Accepted Android SDK licenses.
- Generated the Flutter platform folders using `flutter create .`.

### Mobile app architecture implemented
- New Flutter app created under:
  - `reachradar-mobile/`
- Main mobile app features implemented:
  - auth flow
  - dashboard
  - audit submission
  - audit history
  - audit detail fetching
  - pre-post checker flow
  - secure token storage

### Mobile app review and fixes completed
- Replaced placeholder pre-check screen with a real working screen.
- Fixed audit history taps to load the real saved full report instead of a fake placeholder object.
- Added mobile-side free-plan usage handling.
- Added cleaner mobile error handling so API errors render human-readable messages.
- Added analyzer-clean state/session handling.
- Files involved:
  - `reachradar-mobile/lib/screens/auth_screen.dart`
  - `reachradar-mobile/lib/screens/dashboard_screen.dart`
  - `reachradar-mobile/lib/screens/audit_screen.dart`
  - `reachradar-mobile/lib/screens/precheck_screen.dart`
  - `reachradar-mobile/lib/screens/results_screen.dart`
  - `reachradar-mobile/lib/services/api_client.dart`
  - `reachradar-mobile/lib/services/audit_repository.dart`
  - `reachradar-mobile/lib/state/session_controller.dart`
  - `reachradar-mobile/lib/models/user.dart`
  - `reachradar-mobile/lib/models/audit_report.dart`
  - `reachradar-mobile/lib/models/precheck_result.dart`

### Mobile identity / branding completed
- Android package ID updated to:
  - `com.reachradarai.mobile`
- Android launcher label updated to:
  - `ReachRadar AI`
- Generated branded launcher icons and replaced the Flutter defaults.
- Also aligned iOS / macOS / web app display assets in the Flutter project.
- Key files involved:
  - `reachradar-mobile/android/app/build.gradle.kts`
  - `reachradar-mobile/android/app/src/main/AndroidManifest.xml`
  - `reachradar-mobile/android/app/src/main/kotlin/com/reachradarai/mobile/MainActivity.kt`
  - platform icon asset files under Android, iOS, macOS, web, and Windows resources

## 5. Android signing work completed

### Safe repo setup completed
- Added a safe signing template file:
  - `reachradar-mobile/android/key.properties.example`
- Updated Gradle signing config to read local signing values from `key.properties`.
- Added Android Gradle compatibility flag in `reachradar-mobile/android/gradle.properties`.

### Local signing files created on this machine only
These were intentionally not committed to Git:
- `D:\reachradarApp\reachradar-mobile\android\upload-keystore.jks`
- `D:\reachradarApp\reachradar-mobile\android\key.properties`

### Important note about AGP/Flutter signing
- The Flutter / AGP environment on this machine crashes at Gradle task `signReleaseBundle` with a `NullPointerException`.
- The bundle itself still builds successfully before the final Gradle signing step.
- To work around that, the final `.aab` was manually signed using `jarsigner` and verified.

## 6. Current final artifacts

### Signed Play-uploadable Android bundle
- Path:
  - `D:\reachradarApp\reachradar-mobile\build\app\outputs\bundle\release\reachradar-ai-signed.aab`

### Generated Flutter release output used for signing
- Intermediary bundle path:
  - `D:\reachradarApp\reachradar-mobile\build\app\intermediates\intermediary_bundle\release\packageReleaseBundle\intermediary-bundle.aab`

## 7. Verification completed

### Web app verification
- `npm.cmd run build` passed after the relevant web changes.
- `node --check api/index.js` passed after backend changes.

### Flutter mobile verification
- `flutter analyze` passed.
- `flutter build appbundle` passed for the unsigned/pre-sign bundle generation.
- final signed `.aab` was manually signed and verified.

## 8. Git / push history summary

Relevant recent pushes included:
- delete account page
- safety standards page
- contact email updates
- landing demo and expanded free trials
- Supabase error-handling fix
- mobile app project addition
- mobile identity / branding update
- Android signing setup

## 9. Current limitations / known follow-up items

These are not blockers for closed testing, but they remain future improvements:
- native payment flow is not implemented in the Flutter app
- mobile pre-checker does not yet support image upload
- Play signing currently relies on manual final bundle signing due the local AGP / Flutter signing-task crash
- release keystore must be backed up securely outside Git

## 10. Recommended next actions

1. Upload `reachradar-ai-signed.aab` to Google Play closed testing.
2. Keep a secure backup of:
   - `upload-keystore.jks`
   - the passwords stored in local `key.properties`
3. After closed-test validation, decide whether to:
   - add image upload support to mobile pre-checker
   - add native payment flow
   - finalize Play Store listing graphics and screenshots
