export const EscrowStatus = {
  PENDING: 'PENDING',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  DISPUTED: 'DISPUTED',
} as const;

export type EscrowStatusType = (typeof EscrowStatus)[keyof typeof EscrowStatus];
