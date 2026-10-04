export type EvidenceStepStatus = 'completed' | 'active' | 'next' | 'locked';

export interface EvidenceChecklistItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  status: EvidenceStepStatus;
  thumbnailUrl?: string;
  badge?: string;
  /**
   * Mã góc ảnh theo backend (OVERALL, BRAND_TAG, WASH_TAG, STITCHING_ZIPPER).
   * Hiển thị để người bán đối chiếu với danh sách `missingAngles` mà API trả về.
   */
  angleType?: string;
  aiVerificationLabel?: string;
}

export interface EvidenceChecklistProps {
  items?: EvidenceChecklistItem[];
  title?: string;
  /** Mặc định tự sinh từ số góc `completed` / tổng số góc. */
  subtitle?: string;
  /** Mặc định tự tính từ `items`; chỉ truyền khi muốn ghi đè. */
  completionPercentage?: number;
  onItemClick?: (item: EvidenceChecklistItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}
