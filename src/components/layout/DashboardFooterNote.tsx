import React from 'react';
import '../../styles/dashboard/DashboardFooterNote.css';

export interface DashboardFooterNoteProps {
  title?: string;
  /**
   * Mô tả chính sách. Nếu không truyền, component tự dựng từ ngưỡng thật của
   * hệ thống — trước đây "75%" và "TP. Hồ Chí Minh" bị ghi cứng dù backend đã có
   * endpoint cấu hình ngưỡng, nên mọi seller đều thấy cùng một con số.
   */
  description?: string;
  /** Ngưỡng đăng tự động (%) từ API thresholds. */
  autoPublishThreshold?: number;
  /** Ngưỡng từ chối tự động (%) từ API thresholds. */
  autoRejectThreshold?: number;
}

export const DashboardFooterNote: React.FC<DashboardFooterNoteProps> = ({
  title = 'Chính sách Ký quỹ An toàn & Thẩm định Độc lập',
  description,
  autoPublishThreshold,
  autoRejectThreshold,
}) => {
  const hasThresholds =
    typeof autoPublishThreshold === 'number' &&
    typeof autoRejectThreshold === 'number';

  const text =
    description ??
    (hasThresholds
      ? `Quy trình xác thực có sự hỗ trợ của AI đối soát ảnh với kho mẫu lưu trữ. ` +
        `Tin đạt từ ${autoPublishThreshold} điểm được đăng tự động; dưới ${autoRejectThreshold} điểm bị từ chối tự động; ` +
        `khoảng giữa chuyển chuyên viên thẩm định. Tiền được giữ trong tài khoản ký quỹ tới khi người mua xác nhận.`
      : 'Quy trình xác thực có sự hỗ trợ của AI đối soát ảnh với kho mẫu lưu trữ. Tiền được giữ trong tài khoản ký quỹ tới khi người mua xác nhận.');

  return (
    <div className="rw-footer-note">
      <span className="rw-footer-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5 4.5 5v6c0 5 3.2 8.6 7.5 10.5 4.3-1.9 7.5-5.5 7.5-10.5V5L12 2.5Z" />
          <path d="M12 8v4" />
          <circle cx="12" cy="15.2" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <div className="rw-footer-text">
        <b className="rw-footer-title">{title}</b>
        <p className="rw-footer-desc">{text}</p>
      </div>
    </div>
  );
};

export default DashboardFooterNote;
