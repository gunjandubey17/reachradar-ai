# Play Upload Guide

## Signed bundle to upload

Upload this file to Google Play Console:

`D:\reachradarApp\reachradar-mobile\build\app\outputs\bundle\release\reachradar-ai-signed.aab`

## Android application ID

`com.reachradarai.mobile`

## App display name

`ReachRadar AI`

## Closed testing upload steps

1. Open Google Play Console.
2. Go to:
   - `ReachRadar AI`
   - `Closed testing`
   - your active test track
3. Create a new release.
4. Upload:
   - `reachradar-ai-signed.aab`
5. Save release notes.
6. Review and roll out.

## Suggested release notes

### Title
ReachRadar AI mobile app beta update

### Body
- Added the first real Flutter mobile app build for ReachRadar AI
- Sign in and register flow connected to the live backend
- Dashboard now loads real audit history
- Audit history items now open full saved reports
- Added working mobile pre-post checker flow
- Added free-plan usage counters for audits and pre-checks
- Updated app identity to ReachRadar AI with branded launcher icon
- Android package ID set to `com.reachradarai.mobile`

## Local signing files

These stay local and must not be committed to Git:
- `D:\reachradarApp\reachradar-mobile\android\upload-keystore.jks`
- `D:\reachradarApp\reachradar-mobile\android\key.properties`

## Important note

On this machine, the AGP / Flutter Gradle signing task crashes at `signReleaseBundle`, so the final upload bundle was manually signed and verified. The final signed file to upload is still the one listed above.
