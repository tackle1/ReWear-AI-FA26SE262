import { useCallback, useEffect, useMemo, useState } from 'react';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useVerificationThresholds from '../../listing/hooks/useVerificationThresholds';
import { listingApi } from '../../../services/api/listing.api';
import { ListingSummary } from '../../../types/listing.type';
import {
  readSellerListings,
  SELLER_LISTINGS_CHANGED_EVENT,
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

/**
 * Giai đoạn của một tin, dùng để tô màu và chọn bộ lọc.
 *
 * `review` bao gồm TIN ĐÃ GẮN CỜ (backend trả `status = FLAGGED`): đó là
 * tin ĐANG CHỜ chuyên viên đối soát, chưa được phát hành lên sàn.
 */
export type SellerListingStage = 'verified' | 'review' | 'rejected' | 'draft';

/** Một dòng dữ liệu cho bảng "Tin đăng gần đây". */
export interface SellerListingRow {
  id: string;
  sku?: string;
  name: string;
  category: string;
  price: number;
  score: number | null;
  /** Hạng AI (ví dụ `GRADE_A_EXCELLENT`), hiển thị ngắn ở bảng. */
  gradeLabel: string;
  /** true nếu điểm bị trừ vì thiếu hóa đơn — chỉ giải thích ở trang chi tiết. */
  billPenaltyApplied: boolean;
  stage: SellerListingStage;
  statusLabel: string;
  statusReason: string | null;
  /**
   * true nếu backend đã xác nhận tin đang CHỜ Admin đối soát
   * (`status = FLAGGED`) — tin này CHƯA được hiện trên sàn người mua.
   *
   * Dashboard dùng cờ này để gắn nhãn "Chờ Admin đối soát" thay vì nhãn
   * chung chung "Chờ chuyên viên thẩm định", để người bán biết chính xác
   * hồ sơ đang ở bước nào.
   */
  isFlagged: boolean;
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

  /*
   * Khớp theo THỨ TỰ ưu tiên, không dùng `includes` rời rạc:
   *   REJECTED → bị từ chối (dừng ở đây, không đụng các nhánh sau)
   *   FLAGGED  → gắn cờ, chờ Admin đối soát thủ công
   *   ACTIVE / PUBLISHED → đã phát hành lên sàn
   *
   * `FLAGGED` PHẢI được nhận diện từ chính `status` của backend. Trước đây
   * chuỗi "FLAGGED" không chứa "pending"/"review" nên tin bị gắn cờ rơi xuống
   * nhánh "suy từ điểm" bên dưới — chỉ đúng NGẪU NHIÊN khi `finalAiScore`
   * rơi đúng vào khoảng 50–75. Backend không trả `finalAiScore` là tin bị
   * gán nhầm "Chờ kiểm định" thay vì "Chờ chuyên viên thẩm định".
   */
  if (status.includes('reject')) return 'rejected';
  if (status.includes('flag')) return 'review';
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

/**
 * Nhãn RIÊNG cho tin đã gắn cờ (`FLAGGED`).
 *
 * Nhãn chung "Chờ chuyên viên thẩm định" không nói rõ tin đã được gửi lên
 * hệ thống hay chưa. Tin gắn cờ thì ĐÃ gửi và đang trong hàng đợi của Admin,
 * nên dùng nhãn riêng để người bán theo dõi được tình trạng thật.
 */
const FLAGGED_LABEL = 'Chờ Admin đối soát';

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

/**
 * Đổi DTO từ API sang đúng cấu trúc `SellerListingRecord` mà phần map dòng
 * đang dùng.
 *
 * Nhờ vậy bảng, thẻ số liệu và trang chi tiết cùng đọc một nguồn, không phải
 * dựng hai đường dữ liệu riêng rồi lệch nhau.
 */
const toLocalRecord = (summary: ListingSummary): SellerListingRecord => ({
  listingId: summary.listingId,
  sku: summary.skuCode,
  title: summary.title,
  categoryId: summary.categoryId,
  brand: summary.brand,
  size: summary.size,
  price: summary.price,
  itemType: summary.itemType,
  thumbnail: summary.thumbnailUrl ?? undefined,
  createdAt: summary.createdAtIso || summary.createdAt,
  result: {
    listingId: summary.listingId,
    status: summary.status,
    finalAiScore: summary.finalAiScore ?? undefined,
    conditionGrade: summary.conditionGrade,
    statusReason: summary.statusReason,
    missingBillPenaltyApplied: summary.missingBillPenaltyApplied,
  },
});

export interface UseSellerDashboardResult {
  rows: SellerListingRow[];
  overview: SellerOverview;
  /** true khi đang đọc kho dữ liệu lần đầu. */
  isLoading: boolean;
  /** true khi seller chưa đăng nhập (thiếu userId). */
  isSignedOut: boolean;
  /**
   * Cảnh báo khi danh sách phải lấy từ kho cục bộ vì API không trả được.
   * null nghĩa là đang hiển thị dữ liệu thật từ máy chủ.
   */
  sourceError: string | null;
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
  /** Cảnh báo khi phải rơi về dữ liệu cục bộ vì API không trả được. */
  const [sourceError, setSourceError] = useState<string | null>(null);

  /*
   * Nguồn dữ liệu: ƯU TIÊN API `GET /my-listings` rồi mới tới kho cục bộ.
   *
   * Vì sao đổi: bảng và trang chi tiết phải cùng nói về MỘT tin. Trước đây
   * bảng đọc `sellerListingsStore` (localStorage) còn trang chi tiết gọi API
   * → bấm vào tin trong bảng luôn 404 vì tin đó không có trong database.
   */
  const load = useCallback(async () => {
    const local = readSellerListings(userId)
      .slice()
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (!userId) {
      setRecords(local);
      setIsLoading(false);
      return;
    }

    try {
      const fromApi = await listingApi.getMyListings(userId);
      setRecords(fromApi.map(toLocalRecord));
      setSourceError(null);
    } catch {
      /*
       * API lỗi (backend chưa chạy, mạng đứt…) thì vẫn hiện tin đã lưu cục
       * bộ và BÁO LỖI riêng — không im lặng thay vì báo danh sách rỗng khiến
       * seller tưởng mất hết tin.
       */
      setRecords(local);
      setSourceError(
        'Không tải được danh sách từ máy chủ. Đang hiển thị dữ liệu đã lưu cục bộ, có thể chưa đầy đủ.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  /*
   * Cùng tab vừa tạo tin xong thì kho đã có dữ liệu, nhưng trang tổng quan có
   * thể đã mount sẵn (ví dụ mở tab mới). Nghe ba tín hiệu để luôn khớp:
   *   • `storage`       → tab KHÁC ghi kho (đồng bộ nhiều thiết bị)
   *   • `focus`         → thay đổi trong chính tab này (localStorage không bắn
   *                        `storage` event tại tab ghi)
   *   • sự kiện tuỳ biến → ghi xong trong chính tab, đồng bộ tức thời
   */
  useEffect(() => {
    const sync = () => load();

    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    window.addEventListener(SELLER_LISTINGS_CHANGED_EVENT, sync);

    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      window.removeEventListener(SELLER_LISTINGS_CHANGED_EVENT, sync);
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

        /*
         * Đọc TRỰC TIẾP `status` của backend thay vì suy từ `stage`: chỉ khi
         * backend thật sự trả `FLAGGED` thì mới coi là tin đã gửi Admin. Tin
         * suy ra "review" từ điểm (chưa tạo xong) thì CHƯA gửi, nhãn phải là
         * "Chờ chuyên viên thẩm định" chứ không phải "Chờ Admin đối soát".
         */
        const isFlagged = (record.result.status ?? '').trim().toLowerCase().includes('flag');

        const score =
          typeof record.result.finalAiScore === 'number'
            ? record.result.finalAiScore
            : null;

        return {
          id: record.listingId,
          sku: record.sku,
          name: record.title || 'Tin đăng chưa đặt tên',
          category: CATEGORY_LABELS[record.categoryId] ?? record.categoryId,
          price: record.price,
          score,
          /*
           * Bảng chỉ hiện HẠNG AI. Câu giải thích dài gộp trước đây ("Đã trừ điểm
           * do thiếu hóa đơn") làm cột này phình to và dễ hiểu nhầm là lỗi hệ
           * thống — nay chỉ hiện ở trang chi tiết.
           */
          gradeLabel: record.result.conditionGrade?.trim() || 'Chưa xếp hạng',
          billPenaltyApplied: record.result.missingBillPenaltyApplied === true,
          stage,
          /* Tin đã gửi Admin thì dùng nhãn riêng cho đúng thực trạng. */
          statusLabel: isFlagged ? FLAGGED_LABEL : STATUS_LABELS[stage],
          statusReason: record.result.statusReason?.trim() || null,
          isFlagged,
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
    sourceError,
    autoPublishThreshold: thresholds.autoPublishThreshold,
    autoRejectThreshold: thresholds.autoRejectThreshold,
    thresholdLabel: `${thresholds.autoPublishThreshold}%`,
    reload: load,
  };
};

export default useSellerDashboard;
