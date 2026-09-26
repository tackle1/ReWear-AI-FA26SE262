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

/** Định nghĩa nhóm danh mục của bộ lọc. Số lượng được SUY RA từ BUYER_PRODUCTS ở cuối file. */
const CATEGORY_FILTER_DEFS = [
  { key: 'all', label: 'Tất cả danh mục', categories: [] as string[] },
  { key: 'sneakers', label: 'Giày dép (Sneakers)', categories: ['Giày sneaker'] },
  {
    key: 'apparel',
    label: 'Quần áo & Áo khoác',
    categories: ['Áo khoác & Măng tô', 'Áo sơ mi', 'Áo thun', 'Áo len', 'Quần dài'],
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
    sellerHandle: '@sneaker_vault_',
    sellerAvatar: 'SV',
    sku: 'AJ1-555088',
    brandTier: 'LUXURY / MAJOR BRAND',
    aiScore: 92,
    conditionTag: 'Like New / Full Box',
    escrowReady: true,
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
  { key: 'Nike', group: 'luxury' },
  { key: 'Burberry', group: 'luxury' },
  { key: 'Gucci', group: 'luxury' },
  { key: 'Louis Vuitton', group: 'luxury' },
  { key: 'Chanel', group: 'luxury' },
  { key: 'Hermès', group: 'luxury' },
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

