/* ============================================================
   Dữ liệu riêng cho trang Tài khoản người mua (/buyer/account)
   ============================================================ */

/** Hạng thành viên hiển thị trên thẻ hồ sơ. */
export type BuyerAccountTier = 'basic' | 'trusted' | 'vip';

export interface BuyerAccountTierInfo {
  key: BuyerAccountTier;
  label: string;
  /** Mô tả ngắn quyền lợi đi kèm hạng. */
  benefit: string;
  /** Ngưỡng chi tiêu (VNĐ) để lên hạng kế tiếp. */
  nextTierThreshold: number | null;
}

/** Thông tin hạng thành viên — dùng cho badge và thanh tiến trình lên hạng. */
export const ACCOUNT_TIERS: Record<BuyerAccountTier, BuyerAccountTierInfo> = {
  basic: {
    key: 'basic',
    label: 'Thành viên cơ bản',
    benefit: 'Bảo chứng ký quỹ cho mọi đơn và hỗ trợ khiếu nại trong 48 giờ.',
    nextTierThreshold: 5_000_000,
  },
  trusted: {
    key: 'trusted',
    label: 'Người mua tin cậy',
    benefit: 'Ưu tiên hỗ trợ, miễn phí vận chuyển lần thứ 3 và ưu đãi riêng.',
    nextTierThreshold: 20_000_000,
  },
  vip: {
    key: 'vip',
    label: 'ReWear VIP',
    benefit: 'Giảm thêm 5% mọi đơn, quyền giải ngân nhanh và chuyên gia hỗ trợ riêng.',
    nextTierThreshold: null,
  },
};

/** Tab trong trang tài khoản. */
export type AccountTabKey =
  | 'profile'
  | 'purchases'
  | 'wishlist'
  | 'addresses'
  | 'security'
  | 'notifications';

export interface AccountTab {
  key: AccountTabKey;
  label: string;
  /** Mô tả phụ hiển thị dưới nhãn tab. */
  hint: string;
}

/** Danh sách tab điều hướng trong trang tài khoản. */
export const ACCOUNT_TABS: AccountTab[] = [
  { key: 'profile', label: 'Hồ sơ cá nhân', hint: 'Thông tin định danh' },
  { key: 'purchases', label: 'Đơn mua của tôi', hint: 'Lịch sử & ký quỹ' },
  { key: 'wishlist', label: 'Danh sách yêu thích', hint: 'Sản phẩm đã lưu' },
  { key: 'addresses', label: 'Sổ địa chỉ', hint: 'Nơi nhận hàng' },
  { key: 'security', label: 'Bảo mật', hint: 'Mật khẩu & xác thực' },
  { key: 'notifications', label: 'Thông báo', hint: 'Kênh nhận tin' },
];

/** Nhãn & nút thao tác dùng chung cho card "Đơn mua của tôi" và "Danh sách yêu thích". */
export const ACCOUNT_ACTIVITY_CARDS = {
  purchases: {
    title: 'Đơn mua của tôi',
    subtitle: 'Theo dõi tiến trình ký quỹ, giao hàng và đóng kiệm quang học 48h.',
    actionLabel: 'Xem tất cả đơn hàng',
  },
  wishlist: {
    title: 'Danh sách yêu thích',
    subtitle: 'Những món đồ bạn đã lưu để theo dõi giá và ưu đãi.',
    actionLabel: 'Mở danh sách yêu thích',
  },
} as const;


/** Một mục trong sổ địa chỉ. */
export interface BuyerAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

/** Sổ địa chỉ mẫu của người mua. */
export const ACCOUNT_ADDRESSES: BuyerAddress[] = [
  {
    id: 'addr-home',
    label: 'Nhà',
    fullName: 'Hoàng Nam',
    phone: '0908 123 456',
    address: '12 Nguyễn Huế, Phường Bến Nghé',
    city: 'Quận 1, TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 'addr-office',
    label: 'Văn phòng',
    fullName: 'Hoàng Nam',
    phone: '0908 123 456',
    address: 'Toà nhà Keangnam, 56 phố Mai Dương',
    city: 'Quận Nam Từ Liêm, Hà Nội',
    isDefault: false,
  },
];

/** Quy tắc kiểm tra mật khẩu — dùng chung cho form và thông báo lỗi. */
export const ACCOUNT_PASSWORD_RULES = {
  minLength: 8,
  hint: 'Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.',
} as const;

/** Cặp nhãn / ghi chú dùng ở card "Thông tin liên hệ". */
export const ACCOUNT_CONTACT_ROWS = [
  { key: 'email', label: 'Email', note: 'Dùng để đăng nhập và nhận thông báo đơn hàng.' },
  { key: 'phone', label: 'Số điện thoại', note: 'Dùng để liên hệ khi có khiếu nại đơn hàng.' },
  { key: 'memberSince', label: 'Thành viên từ', note: 'Thời điểm tạo tài khoản ReWear AI.' },
] as const;

/** Bật/tắt kênh thông báo. */
export interface NotificationChannel {
  key: string;
  label: string;
  note: string;
  enabled: boolean;
}

/** Cấu hình kênh thông báo mặc định. */
export const ACCOUNT_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  {
    key: 'orders',
    label: 'Cập nhật đơn hàng',
    note: 'Nhận thông báo khi đơn được xác nhận, giao hoặc hoàn tất kiệm quang học.',
    enabled: true,
  },
  {
    key: 'escrow',
    label: 'Trạng thái ký quỹ',
    note: 'Nhắc bạn trước khi khoản bảo lưu được giải ngân cho người bán.',
    enabled: true,
  },
  {
    key: 'wishlist',
    label: 'Sản phẩm yêu thích giảm giá',
    note: 'Báo khi món đồ đã lưu có ưu đãi hoặc sắp hết hàng.',
    enabled: false,
  },
  {
    key: 'promo',
    label: 'Ưu đãi & chiến dịch',
    note: 'Thông báo chiến dịch giảm giá và quyền lợi hạng thành viên.',
    enabled: false,
  },
];
