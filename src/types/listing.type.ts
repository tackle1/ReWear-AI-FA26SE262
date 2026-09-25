import { AIGradeType } from '../constants/aiGrade';

export interface ListingItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  aiGrade: AIGradeType;
  aiVerificationScore: number;
  isVerified: boolean;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'SOLD' | 'REMOVED';
  createdAt: string;
  updatedAt: string;
}
