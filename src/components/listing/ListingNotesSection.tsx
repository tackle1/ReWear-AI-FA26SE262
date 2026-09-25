import React from 'react';
import '../../styles/listing/ListingNotesSection.css';

export interface ListingNotesSectionProps {
  title?: string;
  statusTitle?: string;
  statusDesc?: string;
}

export const ListingNotesSection: React.FC<ListingNotesSectionProps> = ({
  title = 'Tình trạng sản phẩm (Hàng thanh lý)',
  statusTitle = 'Like New / Chưa qua sử dụng (Full Tag)',
  statusDesc = 'Vì đây là hàng thanh lý chưa qua sử dụng, tình trạng sản phẩm được mặc định là Like New. Hệ thống tự động bỏ qua khai báo lịch sử sử dụng, tần suất và hao mòn cơ học.',
}) => {
  return (
    <section className="rw-lc-card rw-lc-notes">
      <h2 className="rw-lc-notes-title">{title}</h2>

      <div className="rw-lc-notes-box" role="status">
        <span className="rw-lc-notes-check" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m5.5 12.6 4 4L18.5 7.4" />
          </svg>
        </span>
        <div className="rw-lc-notes-body">
          <p className="rw-lc-notes-status">{statusTitle}</p>
          <p className="rw-lc-notes-desc">{statusDesc}</p>
        </div>
      </div>
    </section>
  );
};

export default ListingNotesSection;
