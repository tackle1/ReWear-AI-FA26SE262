import React from 'react';
import '../../styles/dashboard/DashboardFooterNote.css';

export interface DashboardFooterNoteProps {
  title?: string;
  description?: string;
}

export const DashboardFooterNote: React.FC<DashboardFooterNoteProps> = ({
  title = 'Chính sách Ký quỹ An toàn & Thẩm định Độc lập',
  description = 'Quy trình xác thực có sự hỗ trợ của AI vận hành dựa trên các mô hình nơ-ron thị giác đối soát kho mẫu lưu trữ. Các sản phẩm có độ tin cậy dưới 75% sẽ tự động chuyển tiếp tới trung tâm kiểm định thực tế tại TP. Hồ Chí Minh mà không bị phạt. Quyền lợi được bảo hộ theo quy chuẩn bảo vệ người tiêu dùng thời trang xa xỉ.',
}) => {
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
        <p className="rw-footer-desc">{description}</p>
      </div>
    </div>
  );
};

export default DashboardFooterNote;
