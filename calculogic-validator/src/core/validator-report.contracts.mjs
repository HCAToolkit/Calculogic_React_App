export const CALCULOGIC_VALIDATOR_REPORT_VERSION = '0.1.0';

/**
 * Combined validator report contract (V0.1.0):
 * {
 *   version: string,
 *   mode: 'report',
 *   scope?: string,
 *   toolVersion?: string,
 *   validatorId?: string,
 *   validatorVersion?: string,
 *   configDigest?: string,
 *   sourceSnapshot?: {
 *     source: 'fs',
 *     gitRef?: 'HEAD',
 *     gitHeadSha?: string,
 *     diagnostics?: {
 *       isDirty: boolean,
 *       changedCount: number,
 *       untrackedCount: number
 *     }
 *   },
 *   startedAt: string,
 *   endedAt: string,
 *   durationMs: number,
 *   validators: Array<{
 *     id: string,
 *     validatorId?: string,
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
