/**
 * Hook dùng chung cho TRANG ĐĂNG TIN và TRANG GẮN CỜ.
 *
 * Hai trang này đều chạy đúng một lệnh giống nhau: `POST
 * /api/ListingsExample/create` rồi lưu kết quả thật vào kho tin của seller.
 * Khác nhau CHỈ ở chỗ trình bày kết quả (đăng ngay vs chờ Admin) — phần gọi API
 * và lưu trữ thì giống hệt, nên gom vào đây để không lặp code và để hai trang
 * không lệch nhau về logic.
 *
 * `expectedStatus` là trạng thái ta ĐỢI backend trả về, dùng để cảnh báo khi
 * kết quả không khớp dự kiến (ví dụ điểm rơi khác ngưỡng lúc chuyển trang).
 * Hook KHÔNG chặn — người bán vẫn phải xem tin đã tạo, chỉ là kèm cảnh báo.
 */

import { useCallback, useState } from 'react';
import listingApi from '../../../services/api/listing.api';
import { CreateListingResult } from '../../../types/listing.type';
import { saveSellerListing } from '../../seller/services/sellerListingsStore';
import { readApiErrorMessage } from '../utils/errorMessage';
import { PendingListingDraft } from '../services/listingPayload';

export type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface UseSubmitListingResult {
  status: SubmitStatus;
  /** Kết quả backend trả về (chỉ có khi `status === 'success'`). */
  result: CreateListingResult | null;
  error: string | null;
  /**
   * true khi backend trả trạng thái KHÁC với trạng thái mà trang này dự kiến.
   * Trang hiển thị cảnh báo để người bán biết luồng đã rẽ nhánh khác.
   */
  isUnexpectedStatus: boolean;
  submit: () => Promise<void>;
  reset: () => void;
}

const useSubmitListing = (
  userId: string | null,
  draft: PendingListingDraft | null,
  expectedStatus: string,
): UseSubmitListingResult => {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [result, setResult] = useState<CreateListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    if (status === 'submitting') return;

    if (!userId) {
      setStatus('error');
      setError(
        'Không xác định được mã người dùng (userId) hợp lệ. ' +
          'Vui lòng đăng xuất rồi đăng nhập lại rồi thử lại.',
      );
      return;
    }

    if (!draft) {
      setStatus('error');
      setError(
        'Không tìm thấy hồ sơ đã kiểm định. Vui lòng thực hiện lại từ Bước 01.',
      );
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      /*
       * KHÔNG lấy `.data`: interceptor của axiosClient đã `response => response.data`
       * nên giá trị await được CHÍNH LÀ body, và backend trả thẳng DTO
       * (không bọc `{success, data}`).
       */
      const response = await listingApi.createListing(userId, draft.payload);
      const data = response ?? null;

      setResult(data);
      setStatus('success');

      /*
       * Lưu vào kho seller để trang tổng quan có dữ liệu THẬT — backend chưa có
       * endpoint đọc danh sách tin của seller.
       */
      if (data?.listingId) {
        saveSellerListing(userId, {
          listingId: data.listingId,
          sku: draft.payload.sku,
          title: draft.payload.title,
          categoryId: draft.payload.categoryId,
          brand: draft.payload.brand,
          size: draft.payload.size,
          price: draft.payload.price,
          itemType: draft.payload.itemType,
          thumbnail: draft.thumbnail,
          createdAt: new Date().toISOString(),
          result: data,
        });
      }
    } catch (err) {
      setStatus('error');
      setError(
        readApiErrorMessage(err, 'Không đăng được tin. Vui lòng thử lại.'),
      );
    }
  }, [userId, draft, status]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    isUnexpectedStatus:
      status === 'success' &&
      Boolean(result?.status) &&
      result!.status !== expectedStatus,
    submit,
    reset,
  };
};

export default useSubmitListing;