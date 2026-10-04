export type MessageAuthor = 'buyer' | 'seller' | 'system';

/** Trạng thái hội thoại hiển thị ở danh sách bên trái. */
export type ThreadStatus = 'active' | 'seen' | 'done';

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  /** Giờ gửi kiểuu 24h (VD: 10:14). */
  time: string;
}

export interface MessageThread {
  id: string;
  /** id sản phẩm trong BUYER_PRODUCTS dùng cho panel Escrow bên phải. */
  productId: string;
  sellerHandle: string;
  sellerInitials: string;
  /** Nhãn thời gian ở danh sách (VD: 2 phút, Hôm qua). */
  time: string;
  /** Tiêu đề rút gọn của sản phẩm trong danh sách. */
  productSummary: string;
  /** Tin nhắn xem trước. */
  preview: string;
  /** Nhãn trạng thái góc phải (VD: Đã xem, Hoàn tất). */
  statusLabel?: string;
  status: ThreadStatus;
  /** Tag AI hiển thị dưới tên (VD: AI 92%, AI 98% Pass). Bỏ trống = không hiển thị. */
  aiTag?: string;
  /** Có tin nhắn chưa đọc hay không. */
  unread?: boolean;
  online?: boolean;
  /** Phụ đề phản hồi ở header hội thoại (VD: Phản hồi trong 5 phút). */
  responseNote?: string;
  messages: ChatMessage[];
}

/** Một nhóm hội thoại theo tab: đang trao đổi / lưu trữ. */
export interface MessageThreadGroup {
  key: 'active' | 'archived';
  label: string;
  threads: MessageThread[];
}

export interface EscrowMetaItem {
  key: string;
  icon: 'zap' | 'globe' | 'refresh';
  label: string;
}

export interface AiFactItem {
  label: string;
  value: string;
  tone?: 'default' | 'blue' | 'green';
}
