import React from 'react';
import '../../styles/listing/ListingStepProgress.css';

export interface ListingStep {
  id: number;
  /** Nhãn ngắn hiển thị dưới vòng tròn, ví dụ "Thông tin SP" */
  short: string;
  /** Tiêu đề đầy đủ hiển thị ở hero, ví dụ "Thông tin sản phẩm" */
  title: string;
  /** Mô tả hiển thị dưới tiêu đề ở header */
  description?: string;
}

/**
 * 5 bước của quy trình kiểm định AI & niêm yết.
 *
 * Bước "Đăng tin" cũ (Bước 06) đã tách thành HAI TRANG RIÊNG ngoài thanh tiến
 * trình: sau Bước 05, luồng rẽ theo điểm confidence —
 *   • >= ngưỡng đăng (75) → trang Đăng tin   (`ROUTES.LISTING.PUBLISH`)
 *   • 50 – <75            → trang Gắn cờ   (`ROUTES.LISTING.FLAG`)
 *   • < 50                → từ chối, quay lại Bước 01
 * Nên bước cuối trong thanh tiến trình là Bước 05.
 */
export const LISTING_STEPS: ListingStep[] = [
  {
    id: 1,
    short: 'Thông tin SP',
    title: 'Thông tin sản phẩm',
    description:
      'Nhập thông tin sản phẩm và tải ảnh chính. Hệ thống dùng dữ liệu này để đối chiếu ở Bước 02.',
  },
  {
    id: 2,
    short: 'Chụp ảnh',
    title: 'Chụp ảnh sản phẩm theo hướng dẫn',
    description:
      'Chụp đủ 4 góc theo khung ngắm hướng dẫn để AI trích xuất đặc trưng vi cấu trúc của sản phẩm trước khi thẩm định.',
  },
  {
    id: 3,
    short: 'Kiểm tra ảnh',
    title: 'Kiểm tra ảnh & Bằng chứng',
    description:
      'Hệ thống đối soát ảnh với kho dữ liệu chính hãng, gắn cờ các chi tiết mờ hoặc thiếu góc chụp để bạn bổ sung.',
  },
  {
    id: 4,
    short: 'Xác thực AI',
    title: 'Xác thực AI & Đối soát chính hãng',
    description:
      'Chuyên viên cùng AI xác thực độ chính hãng, tem mác, hoá đơn và bằng chứng đi kèm hồ sơ ký gửi của bạn.',
  },
  {
    id: 5,
    short: 'Kết quả',
    title: 'Kết quả thẩm định',
    description:
      'Xem chỉ số tin cậy, kết luận thẩm định và các khuyến nghị điều chỉnh trước khi tin đăng được niêm yết.',
  },
];

export interface ListingStepProgressProps {
  steps?: ListingStep[];
  activeIndex?: number;
  activeLabel?: string;
  pendingLabel?: string;
  doneLabel?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const CheckIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const ListingStepProgress: React.FC<ListingStepProgressProps> = ({
  steps = LISTING_STEPS,
  activeIndex = 0,
  activeLabel = 'Đang thực hiện',
  pendingLabel = 'Chờ xử lý',
  doneLabel = 'Hoàn tất',
}) => {
  return (
    <div className="rw-lc-flow" role="list" aria-label="Quy trình kiểm định AI & niêm yết">
      {steps.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        const state = isDone ? 'done' : isActive ? 'active' : '';
        const status = isDone ? doneLabel : isActive ? activeLabel : pendingLabel;

        return (
          <div
            key={step.id}
            role="listitem"
            className={`rw-lc-flow-step${state ? ` ${state}` : ''}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="rw-lc-flow-dot">{isDone ? <CheckIcon /> : pad(step.id)}</span>
            <span className="rw-lc-flow-label">
              {pad(step.id)} {step.short}
            </span>
            <span className="rw-lc-flow-status">{status}</span>

            {index < steps.length - 1 && (
              <span className={`rw-lc-flow-line${state ? ` ${state}` : ''}`} aria-hidden="true">
                <i />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListingStepProgress;
