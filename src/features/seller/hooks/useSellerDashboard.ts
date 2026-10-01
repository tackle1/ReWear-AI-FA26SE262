import { useCallback, useEffect, useMemo, useState } from 'react';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useVerificationThresholds from '../../listing/hooks/useVerificationThresholds';
import {
  readSellerListings,
  SellerListingRecord,
} from '../services/sellerListingsStore';

/**
 * Gom dữ liệu tổng quan người bán TỪ NGUỒN THẬT, không dùng số liệu bịa đặt.
 *
 * Nguồn dữ liệu:
 * - Danh sách tin đã tạo của đúng seller đang đăng nhập (`sellerListingsStore`,
 *   ghi lại từ response thật của `POST /api/ListingsExample/create`).
 * - Cấu hình ngưỡng lấy live từ `GET /api/ListingsExample/thresholds` để phân
 *   loại "đã xác thực / cần kiểm tra" theo đúng luật của backend.
 *
 * Backend chưa có endpoint đọc danh sách tin của seller, nên đây là nguồn khả
 * dụng đầy đủ nhất. Khi backend bổ sung endpoint đọc, chỉ cần thay phần đọc
 * trong hook này, phần hiển thị không phải sửa.
 */

/** Giai đoạn của một tin, dùng để tô màu và chọn bộ lọc. */
export type SellerListingStage = 'verified' | 'review' | 'rejected' | 'draft';

/** Một dòng dữ liệu cho bảng "Tin đăng gần đây". */
export interface SellerListingRow {
  id: string;
  name: string;
  category: string;
  price: number;
  score: number | null;
  condition: string;
  stage: SellerListingStage;
  statusLabel: string;
  statusReason: string | null;
  thumbnail?: string;
  createdAt: string;
}

/** Số liệu tổng quan, đều tính từ danh sách tin thật. */
export interface SellerOverview {
  total: number;
  verified: number;
  review: number;
  rejected: number;
  /** Tỷ lệ % tin đạt ngưỡng đăng tự động; null khi chưa tin nào có điểm. */
  verificationRate: number | null;
  /** Điểm trung bình của các tin đã có điểm; null khi chưa có. */
  averageScore: number | null;
}

/** Nhãn tiếng Việt cho `categoryId` mà Bước 01 gửi lên. */
const CATEGORY_LABELS: Record<string, string> = {
  apparel: 'Quần áo & Áo khoác',
  bags: 'Túi xách & Đồ da',
  accessories: 'Lụa & Phụ kiện',
  shoes: 'Giày dép',
};

/**
 * Xác định giai đoạn của một tin từ kết quả backend trả về.
 *
 * Ưu tiên `status` của backend; chỉ khi backend không trả status mới suy ra từ
 * điểm so với ngưỡng. Không tự bịa trạng thái.
 */
const resolveStage = (
  record: SellerListingRecord,
  autoPublishThreshold: number,
  autoRejectThreshold: number,
): SellerListingStage => {
  const status = (record.result.status ?? '').trim().toLowerCase();

  if (status.includes('reject')) return 'rejected';
  if (status.includes('pending') || status.includes('review')) return 'review';
  if (status.includes('publish') || status.includes('active')) return 'verified';

  // Không có status: suy ra từ điểm thật mà backend đã trả.
  const score = record.result.finalAiScore;

  if (typeof score !== 'number') return 'draft';
  if (score >= autoPublishThreshold) return 'verified';
  if (score <= autoRejectThreshold) return 'rejected';
  return 'review';
};

/** Nhãn trạng thái hiển thị cho người bán. */
const STATUS_LABELS: Record<SellerListingStage, string> = {
  verified: 'Đã xác thực AI',
  review: 'Chờ chuyên viên thẩm định',
  rejected: 'Bị từ chối tự động',
  draft: 'Chờ kiểm định',
};

/** Định dạng mốc thời gian kiểu Việt Nam, ví dụ `12/11/2024 14:30`. */
const formatDateTime = (iso: string): string => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export interface UseSellerDashboardResult {
  rows: SellerListingRow[];
  overview: SellerOverview;
  /** true khi đang đọc kho dữ liệu lần đầu. */
  isLoading: boolean;
  /** true khi seller chưa đăng nhập (thiếu userId). */
  isSignedOut: boolean;
  /** Ngưỡng đăng tự động đang áp dụng (từ API, có dự phòng). */
  autoPublishThreshold: number;
  /** Ngưỡng từ chối tự động đang áp dụng (từ API, có dự phòng). */
  autoRejectThreshold: number;
  /** Nhãn ngưỡng để hiển thị, ví dụ `75%`. */
  thresholdLabel: string;
  /** Đọc lại kho dữ liệu (dùng sau khi tạo tin xong). */
  reload: () => void;
}

export const useSellerDashboard = (): UseSellerDashboardResult => {
  const { userId } = useCurrentUser();
  const { thresholds } = useVerificationThresholds();

  const [records, setRecords] = useState<SellerListingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    // Đọc lại kho theo userId hiện tại: mỗi seller chỉ thấy tin của mình.
    const next = readSellerListings(userId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    setRecords(next);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  /*
   * Cùng tab vừa tạo tin xong thì kho đã có dữ liệu, nhưng trang tổng quan có
   * thể đã mount sẵn (ví dụ quay lại bằng nút của trình duyệt). Nghe sự kiện
   * `storage` để đồng bộ khi tab khác tạo tin, và `focus` để bắt được thay đổi
   * trong chính tab này (localStorage không tự bắn `storage` event).
   */
  useEffect(() => {
    const sync = () => load();

    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [load]);

  const rows = useMemo<SellerListingRow[]>(
    () =>
      records.map((record) => {
        const stage = resolveStage(
          record,
          thresholds.autoPublishThreshold,
          thresholds.autoRejectThreshold,
        );

        const score =
          typeof record.result.finalAiScore === 'number'
            ? record.result.finalAiScore
            : null;

        const conditionParts = [
          record.result.conditionGrade?.trim() || null,
          record.result.missingBillPenaltyApplied
            ? 'Đã trừ điểm do thiếu hóa đơn'
            : null,
        ].filter((part): part is string => Boolean(part));

        return {
          id: record.listingId,
          name: record.title || 'Tin đăng chưa đặt tên',
          category: CATEGORY_LABELS[record.categoryId] ?? record.categoryId,
          price: record.price,
          score,
          condition: conditionParts.join(' • ') || 'Chưa có đánh giá',
          stage,
          statusLabel: STATUS_LABELS[stage],
          statusReason: record.result.statusReason?.trim() || null,
          thumbnail: record.thumbnail,
          createdAt: formatDateTime(record.createdAt),
        };
      }),
    [records, thresholds.autoPublishThreshold, thresholds.autoRejectThreshold],
  );

  const overview = useMemo<SellerOverview>(() => {
    const total = rows.length;
    const verified = rows.filter((row) => row.stage === 'verified').length;
    const review = rows.filter((row) => row.stage === 'review').length;
    const rejected = rows.filter((row) => row.stage === 'rejected').length;

    // Chỉ tính tỷ lệ trên các tin backend đã trả điểm, tránh chia cho 0.
    const scored = rows.filter((row) => row.score !== null);
    const passed = scored.filter(
      (row) => row.score !== null && row.score >= thresholds.autoPublishThreshold,
    ).length;

    const averageScore = scored.length
      ? Math.round(
          scored.reduce((sum, row) => sum + (row.score ?? 0), 0) / scored.length,
        )
      : null;

    return {
      total,
      verified,
      review,
      rejected,
      verificationRate: scored.length
        ? Math.round((passed / scored.length) * 1000) / 10
        : null,
      averageScore,
    };
  }, [rows, thresholds.autoPublishThreshold]);

  return {
    rows,
    overview,
    isLoading,
    isSignedOut: !userId,
    autoPublishThreshold: thresholds.autoPublishThreshold,
    autoRejectThreshold: thresholds.autoRejectThreshold,
    thresholdLabel: `${thresholds.autoPublishThreshold}%`,
    reload: load,
  };
};

export default useSellerDashboard;
