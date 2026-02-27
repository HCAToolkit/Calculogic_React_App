export const CALCULOGIC_VALIDATOR_REPORT_VERSION = '0.1.0';

/**
 * Combined validator report contract (V0.1.0):
 * {
 *   version: string,
 *   mode: 'report',
 *   scope?: string,
 *   startedAt: string,
 *   endedAt: string,
 *   durationMs: number,
 *   validators: Array<{
 *     id: string,
 *     description: string,
 *     scope?: string,
 *     totalFilesScanned?: number,
 *     counts?: Record<string, number>,
 *     ...validatorSpecificSummaryPassThrough,
 *     findings?: Array<unknown>,
 *     meta?: Record<string, unknown>
 *   }>
 * }
 */
