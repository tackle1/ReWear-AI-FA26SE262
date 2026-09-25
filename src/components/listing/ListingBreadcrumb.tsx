import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from '../../routes/routes.config';
import '../../styles/listing/ListingBreadcrumb.css';

export interface ListingBreadcrumbItem {
  label: string;
  /** Không truyền `to` cho mục cuối (trang hiện tại) */
  to?: string;
}

export interface ListingBreadcrumbProps {
  items?: ListingBreadcrumbItem[];
}

export const DEFAULT_LISTING_BREADCRUMB: ListingBreadcrumbItem[] = [
  { label: 'Tin đăng của tôi', to: ROUTES.SELLER.LISTINGS },
  { label: 'Quy trình kiểm định AI & Niêm yết' },
];

export const ListingBreadcrumb: React.FC<ListingBreadcrumbProps> = ({ items = DEFAULT_LISTING_BREADCRUMB }) => {
  return (
    <nav className="rw-lc-breadcrumb" aria-label="Breadcrumb">
      <div className="rw-lc-breadcrumb-inner">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <span className="rw-lc-crumb-sep" aria-hidden="true">
                  ›
                </span>
              )}
              {item.to && !isLast ? (
                <Link className="rw-lc-crumb-link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span className="rw-lc-crumb-current" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default ListingBreadcrumb;
