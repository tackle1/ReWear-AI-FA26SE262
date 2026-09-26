import React from 'react';
import '../../../styles/marketplace/MarketplacePagination.css';

export interface MarketplacePaginationProps {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const MarketplacePagination: React.FC<MarketplacePaginationProps> = ({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  total,
  onPageChange,
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="rw-mkt-pagination" aria-label="Phân trang sản phẩm">
      <span className="rw-mkt-pagination-summary">
        Hiển thị <b>{rangeStart}</b>–<b>{rangeEnd}</b> trên <b>{total}</b> sản phẩm đã xác thực
      </span>

      <div className="rw-mkt-pagination-pages">
        <button
          type="button"
          className="rw-mkt-page-nav"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trước
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            className={`rw-mkt-page${item === page ? ' active' : ''}`}
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className="rw-mkt-page-nav"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
        </button>
      </div>
    </nav>
  );
};

export default MarketplacePagination;
