import type { BuyerProduct } from '../types/marketplace.type';
import { BUYER_PRODUCTS } from './marketplace.data';

/**
 * Dữ liệu dùng chung cho luồng ký quỹ Escrow:
 * trang Xác nhận đơn hàng (/escrow/checkout) và trang Thanh toán VietQR (/escrow/payment).
 */

/** Mã phiên đối soát Escrow hiển thị trên cả hai màn hình ký quỹ. */
export const ESCROW_SESSION_CODE = 'RW-20260917-001';

/** Nội dung chuyển khoản bắt buộc: mã phiên đối soát bỏ dấu gạch ngang. */
export const ESCROW_TRANSFER_CONTENT = ESCROW_SESSION_CODE.replace(/-/g, '');

/** Thời gian tạm khóa đơn hàng ký quỹ mặc định (giây). */
export const ESCROW_HOLD_SECONDS = 10 * 60;

/** Phí vận chuyển bảo đảm của đơn hàng ký quỹ. */
export const ESCROW_SHIPPING_FEE = 45000;

/** Tài khoản ký quỹ thụ hưởng ReWear AI Escrow (thụ hưởng chuẩn Napas 247). */
export const ESCROW_BENEFICIARY = {
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  bankShortName: 'MB',
  gatewayNote: 'Cổng Escrow ReWear AI',
  accountName: 'REWEAR AI ESCROW ACCOUNT',
  accountNumber: '9882 1888 9999',
  accountNumberRaw: '988218889999',
} as const;

/** Sản phẩm mặc định của phiên ký quỹ (dùng khi mở trực tiếp URL thanh toán). */
export const ESCROW_PRODUCT: BuyerProduct =
  BUYER_PRODUCTS.find((item) => item.id === 'BP-1002') ?? BUYER_PRODUCTS[0];

/** Tổng tiền ký quỹ mặc định khi chưa có dữ liệu truyền từ trang xác nhận đơn. */
export const ESCROW_DEFAULT_TOTAL = ESCROW_PRODUCT.price + ESCROW_SHIPPING_FEE;

export default {
  ESCROW_SESSION_CODE,
  ESCROW_TRANSFER_CONTENT,
  ESCROW_HOLD_SECONDS,
  ESCROW_SHIPPING_FEE,
  ESCROW_BENEFICIARY,
  ESCROW_PRODUCT,
  ESCROW_DEFAULT_TOTAL,
};
