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
    MESSAGES: '/buyer/messages',
    WISHLIST: '/buyer/wishlist',
  },
  LISTING: {
    CREATE: '/listing/create',
    REVIEW: '/listing/review',
  },
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    LISTINGS: '/seller/listings',
    ORDERS: '/seller/orders',
    VERIFICATION_DOCS: '/seller/verification-docs',
  },
  ESCROW: {
    CHECKOUT: '/escrow/checkout',
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
