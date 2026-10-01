import { useCallback, useEffect, useState } from 'react';
import listingApi from '../../../services/api/listing.api';
import { buildPhotos } from '../services/listingPayload';
import { PhotoQualityCheckResult } from '../../../types/verification.type';
import { readApiErrorMessage } from '../utils/errorMessage';

export interface UsePhotoQualityCheck {
  /** Kết quả đo thật; `null` khi chưa gọi xong hoặc đã lỗi. */
  result: PhotoQualityCheckResult | null;
  isLoading: boolean;
  error: string | null;
  /** Gọi lại kiểm tra (dùng sau khi chụp lại ảnh ở Bước 02). */
  recheck: () => void;
}

/**
 * Bước 03 — kiểm tra chất lượng ảnh bằng endpoint thật.
 *
 * `POST /api/ListingsExample/photo-quality` đo độ nét (Laplacian variance),
 * độ sáng và kích thước ngay trên pixel của ảnh, đồng thời kiểm tra đủ 4 góc
 * bắt buộc. Endpoint này chạy độc lập và KHÔNG trừ token AI, nên seller gọi
 * lại nhiều lần được sau mỗi lần chụp lại ảnh.
 *
 * Kết quả được dùng lại ở Bước 04 để hiển thị chỉ số thật thay vì số bịa.
 */
export const usePhotoQualityCheck = (
  photos: Record<string, string>,
): UsePhotoQualityCheck => {
  const [result, setResult] = useState<PhotoQualityCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `JSON.stringify` dùng làm khoá phụ thuộc: cùng key angleType nhưng ảnh đã
  // đổi nội dung thì vẫn phải kiểm tra lại.
  const photosKey = JSON.stringify(photos);
  const photoCount = Object.keys(photos).length;

  const run = useCallback(async () => {
    if (photoCount === 0) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await listingApi.checkPhotoQuality({
        photos: buildPhotos(photos),      });

      if (data) {
        setResult(data);
      } else {
        // Không có body → coi như lỗi để UI hiện cảnh báo thay vì im lặng
        // hiển thị "Chưa đo" mãi không giải thích.
        setResult(null);
        setError('Server không trả về kết quả kiểm tra ảnh.');
      }
    } catch (err) {
      setResult(null);
      setError(readApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosKey]);

  useEffect(() => {
    void run();
  }, [run]);

  return { result, isLoading, error, recheck: run };
};

export default usePhotoQualityCheck;
