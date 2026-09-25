import { EscrowStatusType } from '../constants/escrowStatus';

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: EscrowStatusType;
  vietQrUrl?: string;
  paymentCode?: string;
  shippingTrackingNumber?: string;
  heldAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}
