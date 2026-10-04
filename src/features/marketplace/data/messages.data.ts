import type { MessageThreadGroup, AiFactItem, EscrowMetaItem } from '../types/messages.type';
import nikeJordan1High from '../../../assets/images/products/Nike-Air-Jordan-1-Retro-High.png';
import burberryTrench from '../../../assets/images/Burberry-Trench-Coat-Folded.png';
import nikeDunkLow from '../../../assets/images/products/Nike-Dunk-Low.png';

/**
 * Dữ liệu mock cho Hộp thư giao dịch (/buyer/messages).
 * Hội thoại đầu tiên khớp 1:1 với thiết kế tham chiếu (phiên tư vấn Jordan #RW-8821).
 */
export const MESSAGE_THREAD_GROUPS: MessageThreadGroup[] = [
  {
    key: 'active',
    label: 'Đang trao đổi',
    threads: [
      {
        id: 'TH-8821',
        productId: 'BP-1002',
        sellerHandle: '@sneaker_vault_vn',
        sellerInitials: 'SV',
        time: '2 phút',
        productSummary: 'Nike Air Jordan 1 Retro',
        preview: 'Like New, gần như chưa dùng...',
        status: 'active',
        aiTag: 'AI 92%',
        unread: true,
        online: true,
        responseNote: 'Phản hồi trong 5 phút',
        messages: [
          {
            id: 'm1',
            author: 'buyer',
            text: 'Chào shop, giày này form chuẩn size 42 hay cần lên nửa size không? Có thích hợp người dùng không?',
            time: '10:14',
          },
          {
            id: 'm2',
            author: 'seller',
            text: 'Chào bạn! Giày form chuẩn true to size 42 nhé. Hộp original box và dây giày có còn nguyên vẹn 100% không cần móc.',
            time: '10:16',
          },
          {
            id: 'm3',
            author: 'buyer',
            text: 'Tình trạng giày thực tế như thế nào vậy shop?',
            time: '10:18',
          },
          {
            id: 'm4',
            author: 'seller',
            text: 'Giày Like New, chỉ xử lý thử trong nhà 1 lần để chụp lookbook rồi treo túi chống ẩm, đế và lót trong còn như mới nguyên bản bạn ạ.',
            time: '10:19',
          },
          {
            id: 'm5',
            author: 'system',
            text: 'Người bán đã cung cấp giấy tờ chính hãng giám định AI quang học',
            time: '10:19',
          },
        ],
      },
      {
        id: 'TH-8810',
        productId: 'BP-1014',
        sellerHandle: '@mailinh_vintage',
        sellerInitials: 'MV',
        time: '1 giờ',
        productSummary: 'Áo măng tô Burberry',
        preview: 'Đã check này có đế tag giày bị...',
        statusLabel: 'Đã xem',
        status: 'seen',
        aiTag: 'AI 98% Pass',
        online: true,
        responseNote: 'Phản hồi trong 15 phút',
        messages: [
          {
            id: 'm1',
            author: 'buyer',
            text: 'Shop cho mình xem thêm ảnh cổ áo và nhãn size được không ạ?',
            time: '09:02',
          },
          {
            id: 'm2',
            author: 'seller',
            text: 'Dạ mình vừa thêm 3 ảnh chi tiết vào tin đăng rồi ạ. Tem và nhãn size còn rõ nét 100%.',
            time: '09:07',
          },
          {
            id: 'm3',
            author: 'system',
            text: 'Hồ sơ thẩm định AI đã được cập nhật cho sản phẩm này',
            time: '09:07',
          },
        ],
      },
      {
        id: 'TH-8794',
        productId: 'BP-1001',
        sellerHandle: '@streetwear_sg',
        sellerInitials: 'SW',
        time: 'Hôm qua',
        productSummary: 'Giày New Balance 990v5',
        preview: 'Đã giao qua Viettel Post r...',
        statusLabel: 'Hoàn tất',
        status: 'done',
        online: false,
        responseNote: 'Đã đóng phiên',
        messages: [
          {
            id: 'm1',
            author: 'seller',
            text: 'Đơn đã được bàn giao cho Viettel Post, mã vận đơn mình gửi bạn nhé.',
            time: '16:20',
          },
          {
            id: 'm2',
            author: 'buyer',
            text: 'Mình xác nhận nhận hàng, hàng đúng mô tả ạ. Cảm ơn shop.',
            time: '17:45',
          },
          {
            id: 'm3',
            author: 'system',
            text: 'Escrow đã giải ngân thành công cho người bán',
            time: '17:46',
          },
        ],
      },
    ],
  },
  {
    key: 'archived',
    label: 'Lưu trữ',
    threads: [
      {
        id: 'TH-8712',
        productId: 'BP-1013',
        sellerHandle: '@luxury_archive',
        sellerInitials: 'LA',
        time: '12/06',
        productSummary: 'Khăn Burberry Check',
        preview: 'Khiếu nại đã được giải quyết xong.',
        statusLabel: 'Đã lưu',
        status: 'done',
        aiTag: 'AI 96% Pass',
        online: false,
        responseNote: 'Phiên đã lưu trữ',
        messages: [
          {
            id: 'm1',
            author: 'system',
            text: 'Phiên giao dịch đã được lưu trữ vào hồ sơ của bạn',
            time: '11:30',
          },
        ],
      },
    ],
  },
];
/** Tổng số hội thoại hiển thị trên nhãn tab "Lưu trữ (12)". */
export const ARCHIVED_LABEL_COUNT = 12;

/** Ảnh sản phẩm minh họa cho từng hội thoại (dùng lại ảnh có sẵn trong dự án). */
export const THREAD_IMAGES: Record<string, string> = {
  'BP-1002': nikeJordan1High,
  'BP-1014': burberryTrench,
  'BP-1001': nikeDunkLow,
  'BP-1013': burberryTrench,
};

/** Nội dung hàng ngang thông tin ký quỹ phía phải. */
export const ESCROW_META: EscrowMetaItem[] = [
  { key: 'hold', icon: 'zap', label: 'Giữ chỗ 10:00' },
  { key: 'view', icon: 'globe', label: 'VietQR Escrow' },
  { key: 'return', icon: 'refresh', label: 'Đổi trả 48h' },
];

/** Các chỉ số AI hiển thị trong thẻ "AI Product Assistant". */
export const AI_FACTS: AiFactItem[] = [
  { label: 'Độ tin cậy AI', value: '92% (High Confidence)', tone: 'blue' },
  { label: 'Tình trạng vật lý', value: 'Like New', tone: 'green' },
  { label: 'Kích cỡ niêm yết', value: '42 EU / 8.5 US' },
  { label: 'Trạng thái kho', value: 'Còn 01 đôi duy nhất' },
];

/** Các hành động gợi ý dưới khung nhập tin nhắn. */
export const QUICK_ACTIONS = [
  'Hỏi về vận chuyển',
  'Hỏi chi tiết về tình trạng',
  'Đề xuất giá qua Escrow',
] as const;

/** Các gạch đầu dòng trong khối "Tổng hợp giám định tự động". */
export const AI_SUMMARY_POINTS: { title: string; text: string }[] = [
  {
    title: 'Phần hàn quay (Stitching) và tem nhãn (Brand Label)',
    text: 'đạt đối soát đúng 92 – 94% với kho mẫu chuẩn Nike OG.',
  },
  {
    title: 'Tình trạng mã đế dưới gắn chắc chân với dòng Like New',
    text: 'không ghi nhận dấu hiệu trầy xước hoặc giày bị mòn (Vamp Crease Score: 0.1/5).',
  },
];

/** Badge tối góc trên-ảnh sản phẩm đang đàm phán. */
export const DEAL_PIN_BADGE = '10 Phút Ghim';

/** Giá niêm yết (gạch ngang) hiển thị trong thẻ sản phẩm đàm phán. */
export const DEAL_LIST_PRICE = 4500000;

/** Dòng mô tả mở đầu của thẻ AI Product Assistant. */
export const AI_ASSISTANT_INTRO =
  'Hỏi đáp tự động giữa trader với chuyên gia kiểm định & dữ liệu niêm yết và chứng thư của hệ thống.';

