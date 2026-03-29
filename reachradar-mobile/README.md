# ReachRadar Mobile

This folder contains the Flutter mobile app for ReachRadar AI.

## Included now

- generated Android, iOS, web, desktop platform folders from `flutter create`
- auth flow against the existing ReachRadar backend
- dashboard with live audit history
- free-plan usage counters for audits and pre-checks
- audit submission and result screens
- history detail fetch for saved full audit reports
- working pre-post checker flow against `/api/audit/pre-check`
- secure token storage with `flutter_secure_storage`

## Not included yet

- native payments / Razorpay flow
- image upload support in the mobile pre-checker
- push notifications
- app-store ready branding / signing configuration

## Build

Use the Flutter toolchain from this folder:

`flutter pub get`

`flutter analyze`

`flutter build appbundle`

The latest Android bundle is generated at:

`build/app/outputs/bundle/release/app-release.aab`

## API configuration

The app currently points to production in `lib/config/app_config.dart`:

`https://reachradarai.com/api`

If you need a staging build, update that file or move it to flavor-based config.
