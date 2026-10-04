import React from 'react';
import '../../styles/listing/ListingHeroHeader.css';

export interface ListingHeroHeaderProps {
  /** Số bước đã pad, ví dụ "01" */
  stepNumber?: string;
  /** Tiêu đề bước, ví dụ "Thông tin sản phẩm" */
  stepTitle?: string;
  description?: string;
}

export const ListingHeroHeader: React.FC<ListingHeroHeaderProps> = ({
  stepNumber = '01',
  stepTitle = 'Thông tin sản phẩm',
  description = 'Nhập thông tin sản phẩm và tải ảnh chính. Hệ thống dùng dữ liệu này để đối chiếu ở Bước 02.',
}) => {
  return (
    <header className={`rw-lc-herohead${stepNumber === '02' ? ' rw-lc-herohead-capture' : ''}`}>
      <div className="rw-lc-herohead-left">
        <h1 className="rw-lc-herohead-title">
          Bước {stepNumber}: {stepTitle}
        </h1>
        <p className="rw-lc-herohead-desc">{description}</p>
      </div>
    </header>
  );
};

export default ListingHeroHeader;
