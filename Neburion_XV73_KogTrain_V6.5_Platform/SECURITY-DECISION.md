# KogTrain V6.5 — Security Decision Record

Branch: `dev/v6.5-platform`
Standard: Raptor Delta V9.7

## Current architecture
- No authentication, payments or server-side personal profile database in V6.5 scope.
- Training progress is stored in browser `localStorage` per origin.
- No secrets are embedded in the client application by design.
- Preview origins have isolated storage and are treated as non-production environments.

## Dependency security review
The release candidate was checked against current July/August 2026 advisories.

Actions taken:
- Next.js upgraded from `16.2.10` to `16.2.11` to leave the affected range fixed by the July 2026 security releases.
- React upgraded from `19.2.7` to `19.2.8`.
- React DOM upgraded from `19.2.7` to `19.2.8` to keep the React pair aligned.

This dependency floor is now part of the final validation baseline and must not be downgraded for V6.5 release.

## Response-header baseline
Configured globally in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disables camera, microphone and geolocation
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-DNS-Prefetch-Control: off`
- Next.js `X-Powered-By` fingerprint disabled

## CSP decision
A blocking Content-Security-Policy is **not** added blindly in this release-candidate patch. Next.js runtime scripts and any future asset domains must first be observed on the final production deployment so that a nonce/hash/domain policy can be defined without breaking the application.

This is an explicit runtime-verification item, not a silent omission. The application has no external script integrations in the reviewed V6.5 baseline, but CSP remains a deliberate post-render verification decision.

## Data-handling boundary
KogTrain V6.5 is a learning/training application. Progress metrics are local browser state and are not represented as medical records or diagnostic data.
