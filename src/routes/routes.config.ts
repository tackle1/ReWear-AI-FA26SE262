export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  MARKETPLACE: {
    ROOT: '/marketplace',
    CATALOG: '/marketplace/catalog',
    PRODUCT_DETAIL: '/marketplace/product/:id',
  },
  BUYER: {
    PURCHASES: '/buyer/purchases',
    ORDERS: '/buyer/orders',
    /** Chi tiết một đơn (mở từ nút "Xem chi tiết" ở trang Đơn hàng). */
    ORDER_DETAIL: '/buyer/orders/:orderId',
    MESSAGES: '/buyer/messages',
    WISHLIST: '/buyer/wishlist',
    /** Trang tài khoản người mua (mở từ menu tài khoản trên thanh điều hướng). */
    ACCOUNT: '/buyer/account',
  },
  LISTING: {
    CREATE: '/listing/create',
    REVIEW: '/listing/review',
    /**
     * Trang Đăng tin — mở khi confidence Bước 05 đạt ngưỡng (>= 75).
     * Đây là bước cũ "Bước 06" nay tách thành trang riêng.
     */
    PUBLISH: '/listing/publish',
    /**
     * Trang Gắn cờ — mở khi confidence Bước 05 nằm trong khoảng 50 – <75.
     * Hồ sơ được chuyển chờ Admin đối soát thủ công, chưa hiện công khai.
     */
    FLAG: '/listing/flag',
  },
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    LISTINGS: '/seller/listings',
/**
     * Trang CHI TIẾT một hồ sơ của seller.
     *
     * Bảng "Tin đăng gần đây" chỉ hiện đủ để nhận diện tin; mọi giải thích dài
     * (lý do gắn cờ, điểm trừ, hạng AI) nằm ở trang này để bảng không bị chữ
     * dồn làm khó đọc.
     */
    LISTING_DETAIL: '/seller/listings/:listingId',
    ORDERS: '/seller/orders',
    VERIFICATION_DOCS: '/seller/verification-docs',
  },
  ESCROW: {
    CHECKOUT: '/escrow/checkout',
    PAYMENT: '/escrow/payment',
    SUCCESS: '/escrow/success',
    STATUS: '/escrow/status/:orderId',
  },
  DISPUTE: {
    CREATE: '/dispute/create/:orderId',
    DETAIL: '/dispute/:disputeId',
  },
  ADMIN: {
    ROOT: '/admin',
    MODERATION: '/admin/moderation',
    GOVERNANCE: '/admin/governance',
  },
} as const;

export default ROUTES;