export const AIGrade = {
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  WORN: 'WORN',
} as const;

export type AIGradeType = (typeof AIGrade)[keyof typeof AIGrade];
