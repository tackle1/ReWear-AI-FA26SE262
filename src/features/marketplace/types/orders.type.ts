/** Trạng thái đơn hàng hiển thị trên trang Đơn hàng của người mua. */
export type BuyerOrderStatus =
  | 'pending-payment'
  | 'processing'
  | 'awaiting-seller'
  | 'shipping'
  | 'completed';

export interface BuyerOrder {
  /** Mã đơn (VD: RW-20268918-001). */
  id: string;
  /** Ngày đặt ISO (YYYY-MM-DD) dùng để lọc/sắp xếp. */
  dateISO: string;
  /** Ngày đặt hiển thị (VD: 18/09/2026). */
  dateLabel: string;
  /** Giờ đặt hiển thị (VD: 18:31). */
  timeLabel: string;
  productTitle: string;
  /** Dòng mô tả ngắn (VD: Nike · Size 42 · Like New). */
  productMeta: string;
  productImage: string;
  aiScore: number;
  sellerHandle: string;
  sellerRating: number;
  sellerOrderCount: number;
  total: number;
  /** Phương thức thanh toán (VD: VietQR). */
  payMethod: string;
  /** Trạng thái thanh toán (VD: Đã xác nhận). */
  payState: string;
  status: BuyerOrderStatus;
}

export interface OrderStatCard {
  key: string;
  label: string;
  value: string;
  note: string;
  icon: 'all' | 'clock' | 'refresh' | 'truck' | 'box' | 'check';
  highlight?: boolean;
}
