# KogTrain V6.5 — Security Decision Record

Branch: `dev/v6.5-platform`
Standard: Raptor Delta V9.7

## Current architecture
- No authentication, payments or server-side personal profile database in V6.5 scope.
- Training progress is stored in browser `localStorage` per origin.
- No secrets are embedded in the client application by design.
- Preview origins have isolated storage and are treated as non-production environments.

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

This is an explicit HOLD item, not a silent omission. SECURITY_GATE cannot be considered fully PASS until dependency review and the final CSP decision are evidenced against the release commit.

## Data-handling boundary
KogTrain V6.5 is a learning/training application. Progress metrics are local browser state and are not represented as medical records or diagnostic data.
