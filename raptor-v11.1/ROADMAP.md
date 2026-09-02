# Raptor Delta V11.1 — Development Roadmap

Status: ACTIVE_DEVELOPMENT
Base: V11.0-RC1 TECHNICALLY_CERTIFIED baseline
Branch: dev/raptor-v11.1

## Mission
V11.1 improves operational usability and observability without weakening any V11.0 enterprise control, evidence, RBAC, approval, security, or release rule.

## Priority 1 — Raptor Control Center
Create a consolidated operational view for:
- project/build identity
- gate states
- evidence freshness
- reviewer state
- risk/severity
- release readiness
- deployment/rollback state

## Priority 2 — Evidence & Release Dashboard
Provide a machine-readable and human-readable evidence index with direct mapping:
CONTROL -> TEST -> EVIDENCE -> REVIEW -> GATE -> RELEASE DECISION.

## Priority 3 — Observability
Standardize structured events for control execution, gate transitions, failures, overrides, approval events, deployments and rollbacks.

## Priority 4 — Policy as Code
Move critical enterprise rules into executable policies with default-deny behavior and explicit documented exceptions.

## Priority 5 — Cost-to-PASS
Measure runtime, model/tool cost, human correction effort, rework and first-pass success until all required gates PASS.

## Non-regression requirements
- NO EVIDENCE -> NO PASS -> NO RELEASE.
- NO AGENT MAY APPROVE ITS OWN CRITICAL WORK.
- Default deny for unknown roles/actions.
- Evidence must remain build-bound and freshness-valid.
- Independent approval remains mandatory where classified as critical.
- V11.0-RC1 frozen baseline must not be modified by V11.1 feature work.

## Delivery sequence
1. Control Center contract/schema
2. Evidence index/schema
3. Observability event schema
4. Policy-as-Code layer
5. Cost-to-PASS telemetry
6. Failure-injection suite
7. Reference implementation
8. Multi-viewport / A11Y / performance / security QA
9. Independent review
10. Release candidate
