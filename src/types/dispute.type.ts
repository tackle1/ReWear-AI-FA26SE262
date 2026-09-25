import { DisputeStatusType } from '../constants/disputeStatus';

export interface DisputeEvidence {
  id: string;
  uploaderId: string;
  description: string;
  mediaUrls: string[];
  submittedAt: string;
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  claimantId: string;
  respondentId: string;
  reason: string;
  status: DisputeStatusType;
  claimantEvidence: DisputeEvidence[];
  counterEvidence: DisputeEvidence[];
  resolutionNotes?: string;
  adjudicatedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
