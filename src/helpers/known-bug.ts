import { test } from '@playwright/test';

/**
 * Marks the current test as covering a KNOWN, intentionally planted defect of the
 * ÉCRU practice site (see docs/BUG-CATALOG.md).
 *
 * The test asserts the CORRECT behaviour, so it fails while the defect exists and
 * Playwright reports it as an expected failure. If the defect is ever fixed the
 * test starts passing and Playwright flags it ("expected to fail, but passed"),
 * which is the signal to remove this call.
 */
export function knownBug(id: string, summary: string): void {
  test.info().annotations.push({ type: 'known-bug', description: `${id}: ${summary}` });
  test.fail(true, `Known defect ${id}: ${summary}`);
}
