/** Minimum time to study a task before its answer view is revealed. */
export const MIN_TASK_PREVIEW_MS = 13_000;

/**
 * Enforced at the presentation boundary, including adaptive replacements.
 * Preserve longer durations; do not apply this to answer or reaction timers.
 */
export function taskPreviewDurationMs(requestedMs?: number): number {
  if (typeof requestedMs !== "number" || !Number.isFinite(requestedMs)) {
    return MIN_TASK_PREVIEW_MS;
  }
  // Browser timeouts overflow above a signed 32-bit integer.
  return Math.min(2_147_483_647, Math.max(MIN_TASK_PREVIEW_MS, Math.ceil(requestedMs)));
}
