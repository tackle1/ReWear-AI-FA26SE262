import { RequiredAngleType } from '../../../types/listing.type';

/**
 * Metadata của 4 góc ảnh bắt buộc.
 *
 * Nguồn duy nhất cho cả Bước 02 (màn hình chụp) và Bước 03 (rà soát ảnh) —
 * trước đây Bước 03 tự định nghĩa id `'01'…'05'` riêng, lệch với `angleType`
 * mà Bước 02 gửi lên nên ảnh thật không bao giờ khớp.
 */
export interface ListingAngle {
  /** Mã góc theo quy ước backend (`photos[].angleType`). */
  angleType: RequiredAngleType;
  /** Khoá góc trong state của Bước 02 (trùng `angleType`). */
  id: RequiredAngleType;
  /** Số thứ tự hiển thị, ví dụ '01'. */
  number: string;
  title: string;
  subtitle: string;
  /** Hướng dẫn chụp cho góc này. */
  guidance: string;
}

export const LISTING_ANGLES: ListingAngle[] = [
  {
    angleType: 'OVERALL',
    id: 'OVERALL',
    number: '01',
    title: 'Toàn bộ sản phẩm',
    subtitle: 'Front Silhouette',
    guidance:
      'Cần đặt áo phẳng trên bề mặt trung tính, cúc cài ngay ngắn và mở phẳng tà áo theo tỷ lệ khung viền chuẩn xác.',
  },
  {
    angleType: 'BRAND_TAG',
    id: 'BRAND_TAG',
    number: '02',
    title: 'Nhãn / Tag thương hiệu',
    subtitle: 'Brand Label & Kerning',
    guidance:
      'Cần ánh đèn ở Burberrys và đúng khung ngắm minh chính nhất. Đảm bảo độ sắc nét vi cấu trúc thớ dệt, mã sản phẩm phải tỷ lệ khung không bị lớp quang học bởi nếp gấp.',
  },
  {
    angleType: 'WASH_TAG',
    id: 'WASH_TAG',
    number: '03',
    title: 'Nhãn giặt / Chăm sóc',
    subtitle: 'Care Label & Wash Symbols',
    guidance:
      'Chụp rõ nhãn giặt và ký hiệu giặt ủi để đối chiếu đúng cách vệ sinh sản phẩm. Không để nhàu nát hoặc che ký hiệu.',
  },
  {
    angleType: 'STITCHING_ZIPPER',
    id: 'STITCHING_ZIPPER',
    number: '04',
    title: 'Đường may & Khóa kéo',
    subtitle: 'Stitching Density & Zipper',
    guidance:
      'Soi thẳng vào đường chỉ chần viền và khóa kéo. Đảm bảo mật độ mũi may đều đặn, không sờn chỉ, khóa kéo trơn tru và răng khớp.',
  },
];

/**
 * KHÔNG còn ngưỡng kích thước ảnh ở Bước 03.
 *
 * Trước đây hằng `MIN_IMAGE_EDGE` chặn cảnh báo "ảnh quá nhỏ" dựa trên cạnh
 * ngắn. Backend đã bỏ hẳn kiểm tra kích thước (chỉ đo độ rõ nét và độ
 * sáng — nghiệp vụ chỉ quan tâm ảnh có rõ nét không), nên giữ ngưỡng ở UI sẽ
 * báo "ảnh quá nhỏ" cho những ảnh mà server vẫn chấp nhận — UI và backend
 * trái ý nhau. Chiều rộng/cao vẫn được trả về, nhưng chỉ để hiển thị.
 */
