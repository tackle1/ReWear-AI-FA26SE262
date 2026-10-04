import type { BuyerProduct, FilterOption } from '../types/marketplace.type';
import nikeDunkLow from '../../../assets/images/products/Nike-Dunk-Low.png';
import nikeJordan1High from '../../../assets/images/products/Nike-Air-Jordan-1-Retro-High.png';
import nikeAirForce from '../../../assets/images/products/Nike-Air-Force.png';
import nikeBlazerMid from '../../../assets/images/products/Nike-Blazer-Mid.png';
import coolmatePolo from '../../../assets/images/products/Coolmate-Essentials-Polo.png';
import coolmateTee from '../../../assets/images/products/Coolmate-Premium-T-Shirt.png';
import coolmateHoodie from '../../../assets/images/products/Coolmate-Premium-Hoodie.png';
import coolmateJogger from '../../../assets/images/products/Coolmate-Jogger-Pants.png';
import uniqloOxford from '../../../assets/images/products/Uniqlo-Oxford-Shirt.png';
import uniqloTee from '../../../assets/images/products/Uniqlo-U-Crew-Neck-T-Shirt.png';
import uniqloDown from '../../../assets/images/products/UNIQLO-Ultra-Light-Down-Jacket.png';
import uniqloJeans from '../../../assets/images/products/Uniqlo-Wide-Straight-Jeans.png';
import burberryScarf from '../../../assets/images/products/Burberry-Check-Cashmere-Scarf.png';
import burberryKensington from '../../../assets/images/Burberry-Trench-Coat-Folded.png';
import burberryCrossbody from '../../../assets/images/products/Burberry-Leather-Crossbody.png';
import burberryCheckShirt from '../../../assets/images/products/Burberry-Check-Shirt.png';
import jordanSideProfile from '../../../assets/images/products/parts/jordan-1-side-profile.jpg';
import jordanFrontView from '../../../assets/images/products/parts/jordan-1-front-view.jpg';
import jordanHeelWingsView from '../../../assets/images/products/parts/jordan-1-heel-wings-logo-view.jpg';
import jordanTopFrontView from '../../../assets/images/products/parts/jordan-1-front-3-4-view.jpg';
import jordanOutsole from '../../../assets/images/products/parts/jordan-1-outsole-detail.jpg';
import jordanTongueLabel from '../../../assets/images/products/parts/jordan-1-tongue-label-detail.jpg';
import jordanSwoosh from '../../../assets/images/products/parts/jordan-1-swoosh-detail.jpg';
import jordanWingsLogo from '../../../assets/images/products/parts/jordan-1-wings-logo-detail.jpg';
import jordanToeBox from '../../../assets/images/products/parts/jordan-1-toe-box-detail.jpg';

/**
 * Bộ 10 góc ảnh thật của Nike Air Jordan 1 Retro High.
 * Thứ tự PHẢI khớp với `PHOTO_ANGLES` trong BuyerProductDetailPage:
 * 01 Tổng thể, 02 Mặt trong, 03 Mặt ngoài, 04 Gót giày, 05 Mặt trên,
 * 06 Đế giày, 07 Cổ giày, 08 May, 09 Logo, 10 Da.
 */
const JORDAN_1_ANGLES = [
  jordanSideProfile,   // 01: Tổng thể
  jordanFrontView,     // 02: Mặt trong
  nikeJordan1High,     // 03: Mặt ngoài
  jordanHeelWingsView, // 04: Gót giày
  jordanTopFrontView,  // 05: Mặt trên
  jordanOutsole,       // 06: Đế giày
  jordanTongueLabel,   // 07: Cổ giày
  jordanSwoosh,        // 08: May
  jordanWingsLogo,     // 09: Logo
  jordanToeBox,        // 10: Da
];

/** Định nghĩa nhóm danh mục của bộ lọc. Số lượng được SUY RA từ BUYER_PRODUCTS ở cuối file. */
const CATEGORY_FILTER_DEFS = [
  { key: 'all', label: 'Tất cả danh mục', categories: [] as string[] },
  { key: 'sneakers', label: 'Giày dép (Sneakers)', categories: ['Giày sneaker'] },
  {
    key: 'apparel',
    label: 'Quần áo & Áo khoác',
    categories: [
      // 'Quần áo & Áo khoác' là nhãn danh mục mới do form đăng tin phát ra.
      'Quần áo & Áo khoác',
      'Áo khoác & Măng tô',
      'Áo sơ mi',
      'Áo thun',
      'Áo len',
      'Quần dài',
    ],
  },
  { key: 'bags', label: 'Túi xách & Balo', categories: ['Túi xách', 'Phụ kiện'] },
];

/** Tag "Tìm nhanh" hiển thị ngay dưới thanh tìm kiếm (khớp thiết kế TÌM NHANH). */
export const CATEGORY_CHIPS: FilterOption[] = [
  { key: 'sneakers', label: 'Sneakers', category: 'Giày sneaker' },
  { key: 'luxury-coats', label: 'Luxury Coats', category: 'Áo khoác & Măng tô' },
  { key: 'heritage-coats', label: 'Áo khoác Heritage', category: 'Áo khoác & Măng tô' },
  { key: 'leather-bags', label: 'Túi xách Da thật', category: 'Túi xách' },
  { key: 'watches-accessories', label: 'Đồng hồ & Phụ kiện', category: 'Phụ kiện' },
  { key: 'vintage-archive', label: 'Vintage Archive' },
];

/** Nhóm thương hiệu hiển thị theo ảnh: Luxury / Popular / Local */
export const BRAND_GROUPS = [
  { key: 'luxury', title: 'LUXURY / MAJOR BRAND' },
  { key: 'popular', title: 'POPULAR / MASS-MARKET BRAND' },
  { key: 'local', title: 'LOCAL BRAND' },
];

export const SIZE_OPTIONS = ['39', '40', '41', '42', '43', 'S', 'M', 'L'];

export const CONDITION_OPTIONS: FilterOption[] = [
  { key: 'like-new', label: 'Like New / Đã kích hoạt' },
  { key: 'good', label: 'Good (Tốt, ít vết)' },
  { key: 'fair', label: 'Fair (Sử dụng bình thường)' },
  { key: 'worn', label: 'Worn (Có dấu hiệu hao mòn)' },
];

/** Map key tình trạng ở bộ lọc -> condition thật của dữ liệu mock */
export const FILTER_CONDITION_MAP: Record<string, string[]> = {
  'like-new': ['Như mới'],
  good: ['Rất tốt', 'Tốt'],
  fair: ['Tốt'],
  worn: ['Đã qua sử dụng'],
};

/** Mức AI Confidence hiển thị theo ảnh: Tất cả / 80%+ / 90%+ */
export const AI_CONFIDENCE_OPTIONS = [
  { key: 'all', label: 'Tất cả', min: 0 },
  { key: '80', label: '80%+', min: 80 },
  { key: '90', label: '90%+', min: 90 },
] as const;

/** Mặc định khoảng giá theo ảnh: 1.500.000 - 25.000.000 */
export const PRICE_BOUNDS = { min: 1500000, max: 25000000 };

export const REGION_OPTIONS = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Toàn quốc',
];

export const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'price-asc', label: 'Giá thấp → cao' },
  { key: 'price-desc', label: 'Giá cao → thấp' },
  { key: 'ai-score', label: 'Điểm AI cao nhất' },
  { key: 'savings', label: 'Tiết kiệm nhiều nhất' },
];

export const TRUST_STRIP_ITEMS: { key: string; label: string; note: string }[] = [
  { key: 'ai-vision', label: 'AI Vision Model', note: 'Đối soát 12 góc chụp' },
  { key: 'blockchain', label: 'Blockchain Protection', note: 'Hồ sơ pháp chứng bất biến' },
  { key: 'escrow', label: 'Ký quỹ Escrow', note: 'Giải ngân sau khi nhận hàng' },
  { key: 'return', label: 'Đổi trả 7 ngày', note: 'Hoàn tiền nếu sai mô tả' },
];

export const MARKETPLACE_TOTALS = {
  verifiedListings: '10.376',
  matchRate: '93.8%',
  totalResults: 16,
};

/**
 * Danh mục mock cho không gian người mua.
 * Ảnh sử dụng lại bộ ảnh chụp sản phẩm sẵn có của ReWear AI.
 */
export const BUYER_PRODUCTS: BuyerProduct[] = [
  {
    id: 'BP-1001',
    title: 'Nike Dunk Low',
    brand: 'Nike',
    category: 'Giày sneaker',
    image: nikeDunkLow,
    price: 1950000,
    compareAtPrice: 2600000,
    size: '41',
    condition: 'Tốt',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Sneaker House',
    sellerVerified: true,
    sellerRating: 4.9,
    sellerReviewCount: 98,
    sellerHandle: '@sneaker_house',
    sellerAvatar: 'SH',
    sku: 'DD1391-100',
    brandTier: 'LUXURY / MAJOR BRAND',
    aiScore: 89,
    conditionTag: 'Good',
    escrowReady: true,
  },
  {
    id: 'BP-1002',
    title: 'Nike Air Jordan 1 Retro High',
    brand: 'Nike',
    category: 'Giày sneaker',
    image: nikeJordan1High,
    price: 2890000,
    compareAtPrice: 3600000,
    size: '42',
    condition: 'Như mới',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Sneaker Vault',
    sellerVerified: true,
    sellerRating: 4.9,
    sellerReviewCount: 124,
    sellerHandle: '@sneaker_vault_vn',
    sellerAvatar: 'SV',
    sku: 'AJ1-555088',
    brandTier: 'LUXURY / MAJOR BRAND',
    aiScore: 92,
    conditionTag: 'Like New / Full Box',
    color: 'Red / White / Black',
    sizeUs: '8.5 US',
    conditionNote: 'Bao gồm: Hộp gốc nguyên bản, dây giày phụ kèm theo, tag giày Nike.',
    escrowReady: true,
    angles: JORDAN_1_ANGLES,
  },
  {
    id: 'BP-1003',
    title: "Nike Air Force 1 '07",
    brand: 'Nike',
    category: 'Giày sneaker',
    image: nikeAirForce,
    price: 2150000,
    compareAtPrice: 2700000,
    size: '42',
    condition: 'Như mới',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Urban Kicks',
    sellerVerified: true,
    sellerRating: 4.9,
    sellerReviewCount: 110,
    sellerHandle: '@urban_kicks',
    sellerAvatar: 'UK',
    sku: 'CW2288-111',
    brandTier: 'LUXURY / MAJOR BRAND',
    aiScore: 94,
    conditionTag: 'Like New',
    escrowReady: true,
  },
  {
    id: 'BP-1004',
    title: "Nike Blazer Mid '77",
    brand: 'Nike',
    category: 'Giày sneaker',
    image: nikeBlazerMid,
    price: 1680000,
    compareAtPrice: 2200000,
    size: '42',
    condition: 'Tốt',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Street Archive',
    sellerVerified: true,
    sellerRating: 4.8,
    sellerReviewCount: 72,
    sellerHandle: '@streetarchive',
    sellerAvatar: 'SA',
    sku: 'BQ6806-100',
    brandTier: 'LUXURY / MAJOR BRAND',
    aiScore: 91,
    conditionTag: 'Good',
    escrowReady: true,
    soldOut: true,
  },
  {
    id: 'BP-1005',
    title: 'Coolmate Premium Hoodie',
    brand: 'Coolmate',
    category: 'Áo thun',
    image: coolmateTee,
    price: 680000,
    compareAtPrice: 890000,
    size: 'L',
    condition: 'Như mới',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Streetwear VN',
    sellerVerified: true,
    sellerRating: 4.8,
    sellerReviewCount: 64,
    sellerHandle: '@streetwear_vn',
    sellerAvatar: 'SW',
    sku: 'CM-HD-2024',
    brandTier: 'LOCAL BRAND',
    aiScore: 88,
    conditionTag: 'Like New',
    escrowReady: true,
  },
  {
    id: 'BP-1006',
    title: 'Coolmate Essentials Polo',
    brand: 'Coolmate',
    category: 'Áo thun',
    image: coolmatePolo,
    price: 420000,
    compareAtPrice: 560000,
    size: 'L',
    condition: 'Tốt',
    location: 'TP. Hồ Chí Minh',
    sellerName: 'Coolmate Store',
    sellerVerified: true,
    sellerRating: 4.9,
    sellerReviewCount: 82,
    sellerHandle: '@coolmate_store',
    sellerAvatar: 'CS',
    sku: 'CM-POLO-88',
    brandTier: 'LOCAL BRAND',
    aiScore: 90,
    conditionTag: 'Good',
    escrowReady: true,
    soldOut: true,
  },
  {
    id: 'BP-1007', title: 'Coolmate Premium Hoodie', brand: 'Coolmate', category: 'Áo thun',
    image: coolmateHoodie, price: 680000, compareAtPrice: 890000, size: 'L', condition: 'Như mới',
    location: 'TP. Hồ Chí Minh', sellerName: 'Streetwear VN', sellerVerified: true, aiScore: 88, escrowReady: true,
    sku: 'CM-HD-2024', brandTier: 'LOCAL BRAND', conditionTag: 'Like New',
    sellerHandle: '@streetwear_vn', sellerAvatar: 'SW', sellerRating: 4.8, sellerReviewCount: 64,
  },
  {
    id: 'BP-1008', title: 'Coolmate Jogger Pants', brand: 'Coolmate', category: 'Quần dài',
    image: coolmateJogger, price: 450000, compareAtPrice: 590000, size: 'M', condition: 'Tốt',
    location: 'TP. Hồ Chí Minh', sellerName: 'Daily Wear', sellerVerified: true, aiScore: 87, escrowReady: true,
    sku: 'CM-JG-99', brandTier: 'LOCAL BRAND', conditionTag: 'Good',
    sellerHandle: '@dailywear', sellerAvatar: 'DW', sellerRating: 4.8, sellerReviewCount: 56,
  },
  {
    id: 'BP-1009', title: 'Uniqlo Oxford Shirt', brand: 'Uniqlo', category: 'Áo sơ mi',
    image: uniqloOxford, price: 490000, compareAtPrice: 690000, size: 'M', condition: 'Như mới',
    location: 'Hà Nội', sellerName: 'Minimal Closet', sellerVerified: true, aiScore: 92, escrowReady: true,
    sku: 'UQ-OX-102', brandTier: 'POPULAR / MASS-MARKET BRAND', conditionTag: 'Like New',
    sellerHandle: '@minimalcloset', sellerAvatar: 'MC', sellerRating: 4.9, sellerReviewCount: 112,
  },
  {
    id: 'BP-1010', title: 'Uniqlo U Crew Neck T-Shirt', brand: 'Uniqlo', category: 'Áo thun',
    image: uniqloTee, price: 280000, compareAtPrice: 390000, size: 'M', condition: 'Tốt',
    location: 'TP. Hồ Chí Minh', sellerName: 'Basic Wear', sellerVerified: true, aiScore: 90, escrowReady: true,
    sku: 'UQ-U-55', brandTier: 'POPULAR / MASS-MARKET BRAND', conditionTag: 'Good',
    sellerHandle: '@basicwear', sellerAvatar: 'BW', sellerRating: 4.9, sellerReviewCount: 88,
  },
  {
    id: 'BP-1011', title: 'Uniqlo Lightweight Down Vest', brand: 'Uniqlo', category: 'Áo khoác & Măng tô',
    image: uniqloDown, price: 1250000, compareAtPrice: 1690000, size: 'L', condition: 'Tốt',
    location: 'Hà Nội', sellerName: 'Outerwear VN', sellerVerified: true, aiScore: 89, escrowReady: true,
    sku: 'UQ-DW-67', brandTier: 'POPULAR / MASS-MARKET BRAND', conditionTag: 'Good',
    sellerHandle: '@outerwear_vn', sellerAvatar: 'OW', sellerRating: 4.8, sellerReviewCount: 58,
  },
  {
    id: 'BP-1012', title: 'Uniqlo Wide Straight Jeans', brand: 'Uniqlo', category: 'Quần dài',
    image: uniqloJeans, price: 590000, compareAtPrice: 790000, size: 'M', condition: 'Như mới',
    location: 'TP. Hồ Chí Minh', sellerName: 'Minimal Closet', sellerVerified: true, aiScore: 91, escrowReady: true,
    sku: 'UQ-JN-44', brandTier: 'POPULAR / MASS-MARKET BRAND', conditionTag: 'Like New',
    sellerHandle: '@minimalcloset', sellerAvatar: 'MC', sellerRating: 4.9, sellerReviewCount: 96,
    soldOut: true,
  },
  {
    id: 'BP-1013', title: 'Burberry Check Cashmere Scarf', brand: 'Burberry', category: 'Phụ kiện',
    image: burberryScarf, price: 8900000, compareAtPrice: 10900000, size: 'One size', condition: 'Như mới',
    location: 'Hà Nội', sellerName: 'Luxury Archive', sellerVerified: true, aiScore: 96, escrowReady: true,
    sizeNote: '168x30cm', brandTier: 'LUXURY / MAJOR BRAND', conditionTag: 'Like New',
    sellerHandle: '@luxury_archive', sellerAvatar: 'LA', sellerRating: 5.0, sellerReviewCount: 64,
  },
  {
    id: 'BP-1014', title: 'Burberry Kensington Trench Coat', brand: 'Burberry', category: 'Áo khoác & Măng tô',
    image: burberryKensington, price: 14500000, compareAtPrice: 18900000, size: 'M', condition: 'Tốt',
    location: 'TP. Hồ Chí Minh', sellerName: 'Heritage Archive', sellerVerified: true, aiScore: 94, escrowReady: true,
    sizeNote: 'Kensington Fit', brandTier: 'LUXURY / MAJOR BRAND', conditionTag: 'Good',
    sellerHandle: '@heritage_archive', sellerAvatar: 'HA', sellerRating: 5.0, sellerReviewCount: 82,
  },
  {
    id: 'BP-1015', title: 'Burberry Leather Crossbody', brand: 'Burberry', category: 'Túi xách',
    image: burberryCrossbody, price: 9200000, compareAtPrice: 11900000, size: 'One size', condition: 'Như mới',
    location: 'Hà Nội', sellerName: 'Luxury Archive', sellerVerified: true, aiScore: 95, escrowReady: true,
    sizeNote: 'Crossbody', brandTier: 'LUXURY / MAJOR BRAND', conditionTag: 'Like New',
    sellerHandle: '@luxury_archive', sellerAvatar: 'LA', sellerRating: 5.0, sellerReviewCount: 70,
  },
  {
    id: 'BP-1016', title: 'Burberry Check Shirt', brand: 'Burberry', category: 'Áo sơ mi',
    image: burberryCheckShirt, price: 6800000, compareAtPrice: 8900000, size: 'L', condition: 'Tốt',
    location: 'TP. Hồ Chí Minh', sellerName: 'Heritage Archive', sellerVerified: true, aiScore: 93, escrowReady: true,
    sizeNote: 'Classic Fit', brandTier: 'LUXURY / MAJOR BRAND', conditionTag: 'Good',
    sellerHandle: '@heritage_archive', sellerAvatar: 'HA', sellerRating: 4.9, sellerReviewCount: 52,
  },
];

/**
 * Ánh xạ key danh mục ở bộ lọc -> danh mục thật của sản phẩm mock.
 * 'all' = không lọc. Các key còn lại map về 1..n category thật.
 */
export const FILTER_CATEGORY_MAP: Record<string, string[]> = CATEGORY_FILTER_DEFS.reduce(
  (acc, def) => {
    acc[def.key] = def.categories;
    return acc;
  },
  {} as Record<string, string[]>
);

/** Danh mục hiển thị trong bộ lọc, số lượng đếm trực tiếp trên BUYER_PRODUCTS. */
export const PRODUCT_CATEGORIES: FilterOption[] = CATEGORY_FILTER_DEFS.map((def) => ({
  key: def.key,
  label: def.label,
  count:
    def.key === 'all'
      ? BUYER_PRODUCTS.length
      : BUYER_PRODUCTS.filter((product) => def.categories.includes(product.category)).length,
}));

/**
 * Danh sách thương hiệu đầy đủ theo thiết kế (giữ nguyên thứ tự & nhóm).
 * Số lượng KHÔNG ghi cứng mà đếm trực tiếp trên BUYER_PRODUCTS,
 * nên hãng chưa có sản phẩm sẽ hiện 0.
 */
const BRAND_CATALOG: { key: string; group: string }[] = [
  { key: 'Burberry', group: 'luxury' },
  { key: 'Gucci', group: 'luxury' },
  { key: 'Louis Vuitton', group: 'luxury' },
  { key: 'Chanel', group: 'luxury' },
  { key: 'Hermès', group: 'luxury' },
  { key: 'Nike', group: 'popular' },
  { key: 'Uniqlo', group: 'popular' },
  { key: 'H&M', group: 'popular' },
  { key: 'Zara', group: 'popular' },
  { key: 'Adidas', group: 'popular' },
  { key: 'Puma', group: 'popular' },
  { key: 'Converse', group: 'popular' },
  { key: "Biti's", group: 'local' },
  { key: 'Coolmate', group: 'local' },
  { key: 'DirtyCoins', group: 'local' },
  { key: '5THEWAY', group: 'local' },
  { key: 'Routine', group: 'local' },
  { key: 'Owen', group: 'local' },
];

export const BRAND_OPTIONS: FilterOption[] = BRAND_CATALOG.map((brand) => ({
  key: brand.key,
  label: brand.key,
  count: BUYER_PRODUCTS.filter((product) => product.brand === brand.key).length,
  group: brand.group,
}));

/**
 * Các tab lọc của trang Danh sách yêu thích.
 * Số lượng được page đếm trực tiếp trên danh sách đã lưu nên luôn khớp thực tế.
 */
export const WISHLIST_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'discounted', label: 'Đang giảm giá' },
  { key: 'available', label: 'Còn hàng' },
  { key: 'sold-out', label: 'Đã bán / Hết hàng' },
] as const;

export type WishlistTabKey = (typeof WISHLIST_TABS)[number]['key'];

/** Cách sắp xếp danh sách yêu thích. */
export const WISHLIST_SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'price-asc', label: 'Giá thấp đến cao' },
  { key: 'price-desc', label: 'Giá cao đến thấp' },
  { key: 'name-asc', label: 'Tên A - Z' },
] as const;

export type WishlistSortKey = (typeof WISHLIST_SORT_OPTIONS)[number]['key'];

/**
 * Nhóm danh mục của bộ lọc yêu thích. Mỗi nhóm gom nhiều `category` thật
 * của sản phẩm về một mục hiển thị cho gọn.
 */
export const WISHLIST_CATEGORY_GROUPS = [
  { key: 'all', label: 'Tất cả', categories: [] as string[] },
  { key: 'shoes', label: 'Giày dép', categories: ['Giày sneaker'] },
  {
    key: 'clothing',
    label: 'Quần áo',
    categories: [
      'Áo thun',
      'Áo sơ mi',
      'Quần dài',
      'Quần áo & Áo khoác',
      'Áo khoác & Măng tô',
    ],
  },
  { key: 'bags', label: 'Túi xách & Balo', categories: ['Túi xách'] },
  { key: 'accessories', label: 'Phụ kiện', categories: ['Phụ kiện'] },
] as const;

/** Nhóm phân khúc thương hiệu (khớp với `brandTier` của sản phẩm). */
export const WISHLIST_TIER_GROUPS = [
  { key: 'LUXURY / MAJOR BRAND', label: 'Luxury / Major Brand' },
  { key: 'POPULAR / MASS-MARKET BRAND', label: 'Popular / Mass-market' },
  { key: 'LOCAL BRAND', label: 'Local Brand' },
] as const;

/** Tình trạng phẩm cấp (khớp với `conditionTag` của sản phẩm). */
export const WISHLIST_CONDITION_GROUPS = [
  { key: 'Like New', label: 'Like New / 99%' },
  { key: 'Good', label: 'Good / Tốt' },
] as const;

/**
 * Kiểm tra `conditionTag` của sản phẩm có thuộc nhóm tình trạng hay không.
 * Khớp theo TIỀN TỐ để gom các biến thể như `Like New / Full Box` về đúng
 * nhóm `Like New` — so khớp chính xác sẽ làm sản phẩm rơi ra khỏi mọi nhóm.
 */
export const isInConditionGroup = (conditionTag: string | undefined, groupKey: string) =>
  (conditionTag ?? '').startsWith(groupKey);

/** Mức tin cậy AI — dùng radio, chỉ chọn được một mức. */
export const WISHLIST_AI_OPTIONS = [
  { key: 'all', label: 'Tất cả mức độ' },
  { key: '90', label: '≥ 90% Tin cậy cao' },
  { key: '80', label: '≥ 80% Đạt kiểm định' },
] as const;

/** Nội dung banner kêu gọi giảm định ở chân trang trang Danh sách yêu thích. */
export const WISHLIST_VERIFY_CTA = {
  title: 'Bạn có món đồ muốn giảm định lại?',
  description:
    'Tất cả sản phẩm yêu thích đều được lưu kết quả trắc nghiệm quang phổ AI và bảo chứng tiền gửi',
  actionLabel: 'Xem quy chuẩn giảm định',
} as const;

/**
 * Danh mục đầy đủ dùng chung cho sàn giao dịch và trang Danh sách yêu thích,
 * để sản phẩm đã lưu ở trang này vẫn tìm thấy đúng tin trong CATALOG.
 */
export const MARKETPLACE_CATALOG: BuyerProduct[] = Array.from(
  { length: MARKETPLACE_TOTALS.totalResults },
  (_, index) => {
    const source = BUYER_PRODUCTS[index % BUYER_PRODUCTS.length];
    /*
     * Mọi tin trong bộ dữ liệu mô phỏng đều đã được phát hành công khai, nên
     * gắn `listingStatus: 'ACTIVE'` ở đây. `isListingPublic` của
     * `BuyerMarketplacePage` sẽ loại tin không phải ACTIVE (tin gắn cờ
     * FLAGGED, tin bị từ chối) — khi backend thay bộ dữ liệu này bằng dữ
     * liệu thật, trường này đến từ `Listing.Status`.
     */
    const withStatus = { ...source, listingStatus: 'ACTIVE' as const };

    // listedAt giảm dần để chế độ "Mới nhất" trải đều 16 mẫu gốc trên trang đầu tiên.
    return index < BUYER_PRODUCTS.length
      ? { ...withStatus, listedAt: index }
      : { ...withStatus, id: `${source.id}-${index}`, listedAt: index };
  },
);
