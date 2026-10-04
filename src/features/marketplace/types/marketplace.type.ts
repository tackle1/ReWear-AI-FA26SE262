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
  /**
   * Trạng thái phát hành của tin, khớp `Listing.Status` của backend.
   *
   * CHỈ `ACTIVE` được hiện trên sàn. Tin `FLAGGED` (điểm 50–75, đang chờ
   * chuyên viên đối soát) và `REJECTED` bị loại khỏi danh sách người mua bởi
   * `isListingPublic` trong `BuyerMarketplacePage`.
   *
   * Không khai báo mặc định `ACTIVE` để bắt buộc mọi nguồn dữ liệu phải nói
   * rõ trạng thái — quên khai báo sẽ khiến tin bị ẩn (an toàn hơn lộ).
   */
  listingStatus?: 'ACTIVE' | 'FLAGGED' | 'REJECTED';
  /** Điểm tin cậy thẩm định thị giác của AI (0 - 100) */
  aiScore: number;
  /** Sẵn sàng ký quỹ (khóa giá + giữ tiền cho người bán). */
  escrowReady: boolean;
  /** Tin đã bán / hết hàng — dùng cho tab "Đã bán / Hết hàng" ở danh sách yêu thích. */
  soldOut?: boolean;
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
  /** Phối màu sản phẩm nếu có trong dữ liệu tin đăng. */
  color?: string;
  /** Quy đổi size giày theo hệ US nếu có trong dữ liệu tin đăng. */
  sizeUs?: string;
  /** Ghi chú về phụ kiện hoặc tình trạng đi kèm sản phẩm. */
  conditionNote?: string;
  /** Handle người bán (VD: @sneaker_house) */
  sellerHandle?: string;
  /** Ký tự avatar người bán (VD: SH, SV) */
  sellerAvatar?: string;
  /** Điểm đánh giá người bán */
  sellerRating?: number;
  /** Số lượt đánh giá */
  sellerReviewCount?: number;
  /**
   * Ảnh thật cho bộ 10 góc chuẩn giám định, khai báo đúng thứ tự hiển thị:
   * 01 Tổng thể, 02 Mặt trong, 03 Mặt ngoài, 04 Gót giày, 05 Mặt trên,
   * 06 Đế giày, 07 Cổ giày, 08 May, 09 Logo, 10 Da.
   * Bỏ trống (hoặc thiếu phần tử) = dùng `image` và crop theo từng góc.
   */
  angles?: string[];
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

/** Mức tin cậy AI của bộ lọc yêu thích (radio — chỉ một mức). */
export type WishlistAiKey = 'all' | '80' | '90';

/** Bộ lọc của trang Danh sách yêu thích. */
export interface WishlistFilters {
  /** Key của `WISHLIST_CATEGORY_GROUPS`, 'all' = không lọc danh mục. */
  category: string;
  brands: string[];
  /** Key của `WISHLIST_TIER_GROUPS` (khớp `brandTier`). */
  tiers: string[];
  /** Key của `WISHLIST_CONDITION_GROUPS` (khớp `conditionTag`). */
  conditions: string[];
  aiConfidence: WishlistAiKey;
  /** Chuỗi số thô, định dạng khi hiển thị. */
  minPrice: string;
  maxPrice: string;
}
