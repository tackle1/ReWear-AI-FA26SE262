export const DisputeStatus = {
  OPEN: 'OPEN',
  COUNTERED: 'COUNTERED',
  RESOLVED: 'RESOLVED',
} as const;

export type DisputeStatusType = (typeof DisputeStatus)[keyof typeof DisputeStatus];
