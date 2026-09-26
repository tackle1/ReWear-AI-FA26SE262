export interface BuyerProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  size: string;
  condition: string;
  location: string;
  sellerName: string;
  sellerVerified: boolean;
  /** Điểm tin cậy thẩm định thị giác của AI (0 - 100) */
  aiScore: number;
  escrowReady: boolean;
  /** Vị trí hiển thị trong danh sách mock (mới nhất = số lớn nhất). */
  listedAt?: number;
  /** Mã SKU hiển thị trên thẻ (VD: DD1391-100). Bỏ trống để hiển thị sizeNote thay thế (VD: fit, kích thước phụ kiện). */
  sku?: string;
  /** Ghi chú hiển thị bên phải dòng brand/size khi không dùng SKU (VD: Kensington Fit, 168x30cm) */
  sizeNote?: string;
  /** Nhóm thương hiệu hiển thị (VD: LUXURY / MAJOR BRAND) */
  brandTier?: string;
  /** Nhãn tình trạng hiển thị trên ảnh (VD: Good, Like New / Full Box) */
  conditionTag?: string;
  /** Handle người bán (VD: @sneaker_house) */
  sellerHandle?: string;
  /** Ký tự avatar người bán (VD: SH, SV) */
  sellerAvatar?: string;
  /** Điểm đánh giá người bán */
  sellerRating?: number;
  /** Số lượt đánh giá */
  sellerReviewCount?: number;
}

export interface FilterOption {
  key: string;
  label: string;
  count?: number;
  /** Danh mục sản phẩm tương ứng với tag tìm kiếm nhanh (bỏ trống = không lọc danh mục). */
  category?: string;
  /** Nhóm thương hiệu: luxury | popular | local */
  group?: string;
}

export interface BrandGroup {
  key: string;
  title: string;
  options: FilterOption[];
}

export type AiConfidenceKey = 'all' | '80' | '90';

export interface MarketplaceFilters {
  verifiedSellersOnly: boolean;
  categories: string[];
  brands: string[];
  sizes: string[];
  conditions: string[];
  region: string;
  minPrice: string;
  maxPrice: string;
  /** Mức lọc AI Confidence: all = tất cả, 80 = >=80%, 90 = >=90% */
  aiConfidence: AiConfidenceKey;
}

export type MarketplaceSortKey = 'newest' | 'price-asc' | 'price-desc' | 'ai-score' | 'savings';
export type MarketplaceViewMode = 'grid' | 'list';
