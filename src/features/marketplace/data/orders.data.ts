import type { BuyerOrder, OrderStatCard } from '../types/orders.type';
import nikeJordan1High from '../../../assets/images/products/Nike-Air-Jordan-1-Retro-High.png';
import nikeDunkLow from '../../../assets/images/products/Nike-Dunk-Low.png';
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

/** Nhãn + icon của các thẻ thống kê; phần `value` được tính từ BUYER_ORDERS ở cuối file. */
const ORDER_STAT_LAYOUT: Array<Omit<OrderStatCard, 'value'>> = [
  { key: 'all', label: 'TẤT CẢ', note: 'Toàn bộ đơn hàng', icon: 'all' },
  { key: 'pending-payment', label: 'CHỜ THANH TOÁN', note: 'Cần thanh toán', icon: 'clock' },
  { key: 'processing', label: 'ĐANG XỬ LÝ', note: 'Đang xử lý', icon: 'refresh' },
  { key: 'awaiting-seller', label: 'CHỜ SELLER GIAO', note: 'Lưu giữ Escrow 100%', icon: 'truck', highlight: true },
  { key: 'shipping', label: 'ĐANG GIAO', note: 'Đang vận chuyển', icon: 'box' },
  { key: 'completed', label: 'ĐÃ HOÀN TẤT', note: 'Đã quyết toán', icon: 'check' },
];

/* ============================================================
   Dữ liệu riêng cho trang Chi tiết đơn hàng (/buyer/orders/:orderId)
   ============================================================ */

/** Bước trên thanh tiến trình vòng đời đơn hàng. */
export interface OrderTimelineStep {
  key: string;
  /** Số thứ tự hiển thị trước tiêu đề (1 - 6). */
  index: number;
  /** Tiêu đề bước. */
  title: string;
  /** Mốc thời gian / trạng thái phụ hiển thị dưới tiêu đề. */
  time: string;
  /** Nhãn pill nhỏ hiển thị cuối cùng (sau khi thay placeholder động). */
  badge: string;
}

/**
 * Sáu bước của vòng đời đơn hàng. Placeholder `{{date}}` / `{{time}}` trong
 * `time` sẽ được page thay bằng ngày/giờ thật của đơn.
 */
export const ORDER_TIMELINE_LAYOUT: OrderTimelineStep[] = [
  {
    key: 'placed',
    index: 1,
    title: 'Đã đặt hàng',
    time: '{{date}} · {{time}}',
    badge: 'Thành công',
  },
  {
    key: 'paid',
    index: 2,
    title: 'Đã thanh toán',
    time: '{{date}} · 14:38',
    badge: 'VietQR Napas',
  },
  {
    key: 'escrow',
    index: 3,
    title: 'Giữ Escrow',
    time: 'Bảo lưu 100%',
    badge: 'An toàn Vault',
  },
  {
    key: 'awaiting-seller',
    index: 4,
    title: 'Chờ Seller giao',
    time: 'Đang chuẩn bị',
    badge: 'Đóng gói & gửi hàng',
  },
  {
    key: 'shipping',
    index: 5,
    title: 'Đang vận chuyển',
    time: 'Chờ vận đơn',
    badge: 'Dự kiến 2–3 ngày',
  },
  {
    key: 'completed',
    index: 6,
    title: 'Nhận & Đóng kiệm',
    time: '48h đổi soát',
    badge: 'Thị giác AI',
  },
];

/** Thông số sản phẩm hiển thị trong card "Sản phẩm & Thời điểm đặt AI". */
export const ORDER_PRODUCT_INFO = {
  sku: '555088-101',
  colorway: 'Red / White / Black',
  sizeEu: '42 EU',
  sizeUs: '8.5 US',
  condition: 'Like New (99%)',
  quantity: '01',
  /** Hạng mục AI đã vượt qua (hiển thị dạng 5/5 Vùng quang học hợp lệ). */
  aiValidZones: 5,
  /** Tiêu đề card + tiêu đề sản phẩm. */
  cardTitle: 'Sản phẩm & Thời điểm đặt AI',
  cardSubtitle: 'sản phẩm được chứng thực quang học',
  cardBadge: 'Đạt chuẩn ReWear AI',
  cardBadgeOld: 'Báo cáo chi tiết bị lỗi',
  detailLink: 'Xem chi tiết sản phẩm',
};

/** Chỉ số uy tín của người bán hiển thị trong card "Thông tin người bán". */
export const ORDER_SELLER_INFO = {
  /** Hạng cấp hiển thị ở góc phải tiêu đề card. */
  tier: 'Cấp 2 • Pro Merchant',
  rateLabel: 'Tỷ lệ giao địch hoàn tất',
  successRate: 98,
  commitment: 'Seller cam kết bàn giao hàng kèm tem chống giả ReWear QR',
} as const;

/**
 * Bước timeline đang diễn ra theo từng trạng thái đơn.
 * Mọi bước có `index` nhỏ hơn `currentIndex` đều được coi là đã hoàn tất.
 * `completed` dùng `currentIndex = 6` (bước cuối) nên cả 6 bước đều đã xong.
 */
export const ORDER_STATUS_TIMELINE: Record<
  BuyerOrder['status'],
  { currentIndex: number }
> = {
  'pending-payment': { currentIndex: 2 },
  processing: { currentIndex: 3 },
  'awaiting-seller': { currentIndex: 4 },
  shipping: { currentIndex: 5 },
  completed: { currentIndex: 6 },
};

/**
 * Khối "Mốc hiện tại" dưới timeline — nội dung đổi theo trạng thái từng đơn.
 * `{{amount}}` được page thay bằng tổng tiền của đơn đang xem.
 */
export const ORDER_STATUS_STAGE: Record<
  BuyerOrder['status'],
  { label: string; note: string }
> = {
  'pending-payment': {
    label: 'Đang chờ bạn hoàn tất thanh toán',
    note: 'Đơn hàng chưa được thanh toán nên ReWear AI chưa kích hoạt bảo chứng. Thanh toán qua {{method}} để hệ thống giữ {{amount}} trong tài khoản ký quỹ trung gian và khởi động quy trình bảo chứng.',
  },
  processing: {
    label: 'Hệ thống đang xác nhận thanh toán và khởi tạo hồ sơ bảo chứng',
    note: 'Toàn bộ {{amount}} đã được ghi nhận và đang chờ đối soát. Người bán chỉ được nhận tiền sau khi bạn nhận hàng và duyệt kết quả kiểm định AI.',
  },
  'awaiting-seller': {
    label: 'Người bán đang chuẩn bị đóng gói kiện hàng',
    note: 'Toàn bộ số tiền {{amount}} đang được phong tỏa an toàn trong tài khoản trung gian ký quỹ (Smart-Escrow). Người bán chỉ được nhận tiền khi bạn quét mã kiểm định và duyệt đóng kiệm thành công.',
  },
  shipping: {
    label: 'Kiện hàng đang trên đường vận chuyển',
    note: 'Toàn bộ {{amount}} vẫn được phong tỏa trong Smart-Escrow. Bạn có 48 giờ đồng kiểm khi nhận hàng trước khi hệ thống quyết toán cho người bán.',
  },
  completed: {
    label: 'Đơn hàng đã hoàn tất và đã quyết toán',
    note: '{{amount}} đã được giải ngân cho người bán sau khi bạn xác nhận nhận hàng. Bạn vẫn có thể mở khiếu nại trong 48 giờ nếu phát hiện sai lệch quang học.',
  },
};

/** Nội dung nút bấm trong khối "Mốc hiện tại". */
export const ORDER_CURRENT_STAGE = {
  /** Nhãn nút chính. */
  actionLabel: 'Nhận tin cho Seller',
  /** Nhãn tem niêm phong đi kèm. */
  sealLabel: 'Tem niêm phong QR',
};

/**
 * Hồ sơ người mua & địa chỉ nhận hàng.
 * `fullName` / `phone` / `email` KHÔNG khai báo ở đây — page lấy trực tiếp
 * từ phiên đăng nhập (`rewear_current_user`) để luôn khớp tài khoản thật.
 */
export const ORDER_BUYER_INFO = {
  deliveryLabel: 'HỌ VÀ TÊN NGƯỜI NHẬN',
  addressLabel: 'ĐỊA CHỈ NHẬN HÀNG',
  contactAction: 'Chờ Seller giao',
  address: '12 Nguyễn Huế, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  phoneLabel: 'SỐ ĐIỆN THOẠI',
  emailLabel: 'EMAIL',
  /** Khối vận chuyển. */
  shippingTitle: 'Vận chuyển: Chưa có mã vận đơn',
  shippingNote: 'Đang chờ Seller đóng gói và cập nhật thông tin giao hàng.',
  /** Quy định bảo hành. */
  warranty: 'Được bảo vệ quyền lợi mỗi 1 gói vận đơn kiệm quang học 48h',
} as const;

/**
 * Tóm tắt thanh toán trong cột phải.
 * `{{amount}}` trong `escrowNote` được page thay bằng tổng tiền của đơn đang xem.
 */
export const ORDER_PAY_SUMMARY = {
  /** Tag đơn vị tiền tệ ở góc phải tiêu đề card. */
  currencyLabel: 'VNĐ (₫)',
  /** Nhãn dòng phương thức thanh toán. */
  methodLabel: 'Phương thức thanh toán',
  method: 'VietQR (Đã xác nhận)',
  /** Phí bảo hiểm Escrow & AI luôn miễn phí. */
  freeLabel: '0 ₫ (Miễn phí)',
  /** Dòng trạng thái thanh toán. */
  statusLabel: 'Trạng thái thanh toán',
  statusValue: 'Đã bảo lưu Escrow',
  /** Nhãn dòng tổng cộng. */
  totalLabel: 'TỔNG CỘNG',
  /** Thông báo khi đơn đã thanh toán đủ. */
  paidState: 'Đã thanh toán đủ ({{method}} {{state}})',
  /** Thông báo khi đơn chưa thanh toán. */
  unpaidState: 'Chưa thanh toán — vui lòng hoàn tất qua {{method}}',
  escrowNote:
    'Khoản thanh toán {{amount}} được đưa vào tài khoản bảo lưu Smart-Escrow. Người bán hàng chưa nhận được tiền cho đến khi bạn nhận giày và đồng kiểm với mô quang học trong 48 giờ.',
  /** Đối tác giữ tiền ký quỹ. */
  escrowPartnerLabel: 'Đối tác ký quỹ',
  escrowPartner: 'Vietcombank Escrow Vault',
  /** Nhãn nút theo dõi vận đơn. */
  trackLabel: 'Theo dõi đơn hàng (Chờ vận đơn)',
  /** Nhãn nút theo dõi riêng cho đơn đã hoàn tất. */
  trackDoneLabel: 'Xem lại đơn hàng (Đã hoàn tất)',
  /** Nhãn nút quay lại danh sách. */
  backLabel: 'Quay lại danh sách đơn hàng',
  holdNotice:
    'Đơn hàng được bảo vệ toàn diện theo Quy chế bảo chứng giao dịch ReWear.AI Escrow Engine.',
} as const;

/**
 * Chính sách cam kết hiển thị ở chân trang trang chi tiết.
 * `{{id}}` được page thay bằng mã đơn hàng đang xem.
 */
export const ORDER_ESCROW_POLICY = {
  title: 'Chính sách cam kết đơn hàng ReWear.AI',
  body:
    'Đơn hàng #{{id}} đang được theo dõi tiến độ tự động. Bạn được hỗ trợ đồng kiểm 48 giờ sau khi nhận hàng và yêu cầu hoàn tiền 100% nếu phát hiện sai lệch quang học.',
  /** Nhãn nút quay lại danh sách. */
  backLabel: 'Quay lại đơn hàng',
  /** Nhãn nút theo dõi vận đơn. */
  trackLabel: 'Theo dõi đơn hàng (Chờ vận đơn)',
} as const;

/**
 * Dữ liệu mock cho trang Đơn hàng (/buyer/orders) — 16 đơn, mỗi trang 4 đơn.
 * Dòng đầu khớp 1:1 với phiên Escrow vừa thanh toán (Jordan #RW-20268918-001).
 */
export const BUYER_ORDERS: BuyerOrder[] = [
  {
    id: 'RW-20268918-001',
    dateISO: '2026-09-18',
    dateLabel: '18/09/2026',
    timeLabel: '14:35',
    productTitle: 'Nike Air Jordan 1 Retro High',
    productMeta: 'Nike · Size 42 · Like New',
    productImage: nikeJordan1High,
    aiScore: 92,
    sellerHandle: '@sneaker_vault',
    sellerRating: 4.9,
    sellerOrderCount: 124,
    total: 2935000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'awaiting-seller',
  },
  {
    id: 'RW-20268917-002',
    dateISO: '2026-09-17',
    dateLabel: '17/09/2026',
    timeLabel: '11:20',
    productTitle: 'Coolmate Premium T-Shirt',
    productMeta: 'Coolmate · Size M · Good',
    productImage: coolmateTee,
    aiScore: 89,
    sellerHandle: '@coolmate_store',
    sellerRating: 4.8,
    sellerOrderCount: 86,
    total: 415000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'shipping',
  },
  {
    id: 'RW-20268916-042',
    dateISO: '2026-09-16',
    dateLabel: '16/09/2026',
    timeLabel: '09:42',
    productTitle: 'Uniqlo Oxford Shirt',
    productMeta: 'Uniqlo · Size L · Like New',
    productImage: uniqloOxford,
    aiScore: 91,
    sellerHandle: '@minimalcloset',
    sellerRating: 5.0,
    sellerOrderCount: 41,
    total: 620000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
  {
    id: 'RW-20268915-031',
    dateISO: '2026-09-15',
    dateLabel: '15/09/2026',
    timeLabel: '16:08',
    productTitle: 'Burberry Archive Camera Bag',
    productMeta: 'Burberry · Like New',
    productImage: burberryCrossbody,
    aiScore: 95,
    sellerHandle: '@heritage_archive',
    sellerRating: 4.9,
    sellerOrderCount: 78,
    total: 9200000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'awaiting-seller',
  },
  {
    id: 'RW-20268914-028',
    dateISO: '2026-09-14',
    dateLabel: '14/09/2026',
    timeLabel: '10:05',
    productTitle: 'Nike Dunk Low',
    productMeta: 'Nike · Size 41 · Good',
    productImage: nikeDunkLow,
    aiScore: 89,
    sellerHandle: '@sneaker_house',
    sellerRating: 4.9,
    sellerOrderCount: 98,
    total: 1950000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'processing',
  },
  {
    id: 'RW-20268913-025',
    dateISO: '2026-09-13',
    dateLabel: '13/09/2026',
    timeLabel: '15:47',
    productTitle: "Nike Air Force 1 '07",
    productMeta: 'Nike · Size 42 · Like New',
    productImage: nikeAirForce,
    aiScore: 94,
    sellerHandle: '@urban_kicks',
    sellerRating: 4.9,
    sellerOrderCount: 110,
    total: 2150000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'shipping',
  },
  {
    id: 'RW-20268912-022',
    dateISO: '2026-09-12',
    dateLabel: '12/09/2026',
    timeLabel: '09:12',
    productTitle: "Nike Blazer Mid '77",
    productMeta: 'Nike · Size 42 · Good',
    productImage: nikeBlazerMid,
    aiScore: 91,
    sellerHandle: '@streetarchive',
    sellerRating: 4.8,
    sellerOrderCount: 72,
    total: 1680000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'awaiting-seller',
  },
  {
    id: 'RW-20268911-019',
    dateISO: '2026-09-11',
    dateLabel: '11/09/2026',
    timeLabel: '17:30',
    productTitle: 'Coolmate Essentials Polo',
    productMeta: 'Coolmate · Size L · Good',
    productImage: coolmatePolo,
    aiScore: 90,
    sellerHandle: '@coolmate_store',
    sellerRating: 4.9,
    sellerOrderCount: 82,
    total: 420000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
  {
    id: 'RW-20268910-017',
    dateISO: '2026-09-10',
    dateLabel: '10/09/2026',
    timeLabel: '08:58',
    productTitle: 'Coolmate Premium Hoodie',
    productMeta: 'Coolmate · Size L · Like New',
    productImage: coolmateHoodie,
    aiScore: 88,
    sellerHandle: '@streetwear_vn',
    sellerRating: 4.8,
    sellerOrderCount: 64,
    total: 680000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'shipping',
  },
  {
    id: 'RW-20268909-015',
    dateISO: '2026-09-09',
    dateLabel: '09/09/2026',
    timeLabel: '13:21',
    productTitle: 'Coolmate Jogger Pants',
    productMeta: 'Coolmate · Size M · Good',
    productImage: coolmateJogger,
    aiScore: 87,
    sellerHandle: '@dailywear',
    sellerRating: 4.8,
    sellerOrderCount: 56,
    total: 450000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
  {
    id: 'RW-20268908-013',
    dateISO: '2026-09-08',
    dateLabel: '08/09/2026',
    timeLabel: '11:44',
    productTitle: 'Uniqlo U Crew Neck T-Shirt',
    productMeta: 'Uniqlo · Size M · Good',
    productImage: uniqloTee,
    aiScore: 90,
    sellerHandle: '@basicwear',
    sellerRating: 4.9,
    sellerOrderCount: 88,
    total: 280000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
  {
    id: 'RW-20268907-011',
    dateISO: '2026-09-07',
    dateLabel: '07/09/2026',
    timeLabel: '16:02',
    productTitle: 'Uniqlo Lightweight Down Vest',
    productMeta: 'Uniqlo · Size L · Good',
    productImage: uniqloDown,
    aiScore: 89,
    sellerHandle: '@outerwear_vn',
    sellerRating: 4.8,
    sellerOrderCount: 58,
    total: 1250000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'shipping',
  },
  {
    id: 'RW-20268906-009',
    dateISO: '2026-09-06',
    dateLabel: '06/09/2026',
    timeLabel: '10:37',
    productTitle: 'Uniqlo Wide Straight Jeans',
    productMeta: 'Uniqlo · Size M · Like New',
    productImage: uniqloJeans,
    aiScore: 91,
    sellerHandle: '@minimalcloset',
    sellerRating: 4.9,
    sellerOrderCount: 96,
    total: 590000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
  {
    id: 'RW-20268905-007',
    dateISO: '2026-09-05',
    dateLabel: '05/09/2026',
    timeLabel: '14:19',
    productTitle: 'Burberry Check Cashmere Scarf',
    productMeta: 'Burberry · One size · Like New',
    productImage: burberryScarf,
    aiScore: 96,
    sellerHandle: '@luxury_archive',
    sellerRating: 5.0,
    sellerOrderCount: 64,
    total: 8900000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'processing',
  },
  {
    id: 'RW-20268904-005',
    dateISO: '2026-09-04',
    dateLabel: '04/09/2026',
    timeLabel: '09:55',
    productTitle: 'Burberry Kensington Trench Coat',
    productMeta: 'Burberry · Size M · Good',
    productImage: burberryKensington,
    aiScore: 94,
    sellerHandle: '@heritage_archive',
    sellerRating: 5.0,
    sellerOrderCount: 82,
    total: 14500000,
    payMethod: 'VietQR',
    payState: 'Chờ thanh toán',
    status: 'pending-payment',
  },
  {
    id: 'RW-20268903-003',
    dateISO: '2026-09-03',
    dateLabel: '03/09/2026',
    timeLabel: '18:26',
    productTitle: 'Burberry Check Shirt',
    productMeta: 'Burberry · Size L · Good',
    productImage: burberryCheckShirt,
    aiScore: 93,
    sellerHandle: '@heritage_archive',
    sellerRating: 4.9,
    sellerOrderCount: 52,
    total: 6800000,
    payMethod: 'VietQR',
    payState: 'Đã xác nhận',
    status: 'completed',
  },
];

/** Nhãn trạng thái + class pill tương ứng trong bảng đơn hàng. */
export const ORDER_STATUS_META: Record<
  BuyerOrder['status'],
  { label: string; className: string; detailLabel: string }
> = {
  'pending-payment': { label: 'Chờ thanh toán', className: 'is-pending', detailLabel: 'Chờ thanh toán' },
  processing: { label: 'Đang xử lý', className: 'is-processing', detailLabel: 'Đang xử lý' },
  'awaiting-seller': { label: 'Chờ Seller giao', className: 'is-awaiting', detailLabel: 'Chờ Seller giao hàng' },
  shipping: { label: 'Đang vận chuyển', className: 'is-shipping', detailLabel: 'Đang vận chuyển' },
  completed: { label: 'Đã hoàn tất', className: 'is-completed', detailLabel: 'Đã hoàn tất' },
};

export const ORDER_STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả trạng thái' },
  { key: 'pending-payment', label: 'Chờ thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'awaiting-seller', label: 'Chờ Seller giao' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Đã hoàn tất' },
] as const;

export const ORDER_SORT_OPTIONS = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'total-desc', label: 'Tổng tiền cao nhất' },
  { key: 'total-asc', label: 'Tổng tiền thấp nhất' },
] as const;

/**
 * Số liệu trên mỗi thẻ thống kê được tính trực tiếp từ BUYER_ORDERS
 * nên luôn khớp với số đơn thật đang ở từng trạng thái (pad số 0 ở đầu).
 */
export const ORDER_STAT_CARDS: OrderStatCard[] = ORDER_STAT_LAYOUT.map((card) => {
  const count =
    card.key === 'all'
      ? BUYER_ORDERS.length
      : BUYER_ORDERS.filter((order) => order.status === card.key).length;
  return { ...card, value: String(count).padStart(2, '0') };
});


