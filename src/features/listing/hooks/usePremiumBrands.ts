import { useCallback, useEffect, useState } from 'react';
import listingApi from '../../../services/api/listing.api';

export type BrandsStatus = 'idle' | 'loading' | 'success' | 'error';

export interface BrandsState {
  brands: string[];
  status: BrandsStatus;
  error: string | null;
  reload: () => void;
}

const ERROR_MESSAGE = 'Không tải được danh sách thương hiệu. Vui lòng thử lại.';

/**
 * Nhóm thương hiệu BẢO CHỨNG (Luxury / Major Brand) cho hàng Secondhand.
 *
 * Lấy từ `GET /api/ListingsExample/premium-brands`, mà backend đọc thẳng hàng
 * cấu hình `HIGH_END_BRANDS_LIST` trong NeonDB. Admin sửa JSON ở đó (rồi Save)
 * là danh sách này đổi theo — không cần deploy.
 */
export const usePremiumBrands = (): BrandsState => {
  const [brands, setBrands] = useState<string[]>([]);
  const [status, setStatus] = useState<BrandsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listingApi.getPremiumBrands();
      setBrands(normalizeBrandList(response));
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

/**
 * Nhóm thương hiệu PHỔ THÔNG (Popular / Mass-market).
 *
 * Lấy từ `GET /api/ListingsExample/popular-brands` → SystemConfig
 * `POPULAR_BRANDS_LIST`.
 */
export const usePopularBrands = (): BrandsState => {
  const [brands, setBrands] = useState<string[]>([]);
  const [status, setStatus] = useState<BrandsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listingApi.getPopularBrands();
      setBrands(normalizeBrandList(response));
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

/**
 * Nhóm thương hiệu NỘI ĐỊA / không nhãn hiệu (Local / No-brand).
 *
 * Lấy từ `GET /api/ListingsExample/local-brands` → SystemConfig
 * `LOCAL_BRANDS_LIST`.
 */
export const useLocalBrands = (): BrandsState => {
  const [brands, setBrands] = useState<string[]>([]);
  const [status, setStatus] = useState<BrandsStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const response = await listingApi.getLocalBrands();
      setBrands(normalizeBrandList(response));
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

/**
 * Chuẩn hoá danh sách từ API: bỏ phần tử rỗng/rỗng trắng, cắt khoảng trắng
 * thừa và bỏ trùng lặp (không phân biệt hoa thường). Danh sách trong NeonDB là
 * do admin gõ tay nên không thể tin tuyệt đối là sạch.
 */
const normalizeBrandList = (response: unknown): string[] => {
  if (!Array.isArray(response)) return [];

  const trimmed = response
    .filter((brand): brand is string => typeof brand === 'string')
    .map((brand) => brand.trim())
    .filter(Boolean);

  return trimmed.filter(
    (brand, index) =>
      trimmed.findIndex((item) => item.toLowerCase() === brand.toLowerCase()) === index,
  );
};

export default usePremiumBrands;