export type EvidenceStepStatus = 'completed' | 'active' | 'next' | 'locked';

export interface EvidenceChecklistItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  status: EvidenceStepStatus;
  thumbnailUrl?: string;
  badge?: string;
  aiVerificationLabel?: string;
}

export interface EvidenceChecklistProps {
  items?: EvidenceChecklistItem[];
  title?: string;
  subtitle?: string;
  completionPercentage?: number;
  completedCount?: number;
  totalCount?: number;
  onItemClick?: (item: EvidenceChecklistItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}
