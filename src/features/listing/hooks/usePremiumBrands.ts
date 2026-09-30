import { useCallback, useEffect, useState } from 'react';
import listingApi from '../../../services/api/listing.api';

export type PremiumBrandsStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PremiumBrandsState {
  brands: string[];
  status: PremiumBrandsStatus;
  error: string | null;
  reload: () => void;
}

const ERROR_MESSAGE = 'Không tải được danh sách thương hiệu. Vui lòng thử lại.';

/**
 * Lấy danh sách thương hiệu bảo chứng (Luxury / Major Brand) từ API.
 *
 * Backend trả về mảng string thuần nên hàm chuẩn hoá lại thành mảng sạch:
 * loại bỏ phần tử rỗng, cắt khoảng trắng thừa và loại trùng lặp (không phân biệt hoa thường).
 */
export const usePremiumBrands = (): PremiumBrandsState => {
  const [brands, setBrands] = useState<string[]>([]);
  const [status, setStatus] = useState<PremiumBrandsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listingApi.getPremiumBrands();
      const list = Array.isArray(response) ? response : [];

      const normalized = list
        .filter((brand): brand is string => typeof brand === 'string')
        .map((brand) => brand.trim())
        .filter(Boolean);

      const unique = normalized.filter(
        (brand, index) =>
          normalized.findIndex(
            (item) => item.toLowerCase() === brand.toLowerCase(),
          ) === index,
      );

      setBrands(unique);
      setStatus('success');
    } catch {
      setBrands([]);
      setError(ERROR_MESSAGE);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetchBrands();
  }, [fetchBrands]);

  return { brands, status, error, reload: fetchBrands };
};

export default usePremiumBrands;