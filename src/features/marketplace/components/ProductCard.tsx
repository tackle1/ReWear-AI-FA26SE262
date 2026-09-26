import React from 'react';
import type { BuyerProduct } from '../types/marketplace.type';
import '../../../styles/marketplace/ProductCard.css';

export interface ProductCardProps {
  product: BuyerProduct;
  layout?: 'grid' | 'list';
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  /** Mở trang chi tiết sản phẩm (thay cho Mua ngay / Thêm vào giỏ). */
  onViewDetails?: (product: BuyerProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  layout = 'grid',
  isSaved = false,
  onToggleSave,
  onViewDetails,
}) => {
  const priceText = product.price.toLocaleString('vi-VN');
  const brandTier = product.brandTier ?? 'LUXURY / MAJOR BRAND';
  const conditionTag = product.conditionTag ?? product.condition;
  const sellerHandle = product.sellerHandle ?? `@${product.sellerName.toLowerCase().replace(/\s+/g, '_')}`;
  const sellerAvatar = product.sellerAvatar ?? product.sellerName.charAt(0).toUpperCase();

  return (
    <article className={`rw-mkt-card${layout === 'list' ? ' rw-mkt-card--list' : ''}`}>
      <div className="rw-mkt-card-media">
        <img className="rw-mkt-card-img" src={product.image} alt={product.title} loading="lazy" />
        <div className="rw-mkt-card-badges">
          <span className="rw-mkt-card-ai">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" strokeDasharray="3 2" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            AI Confidence {product.aiScore}%
          </span>
          {conditionTag && <span className="rw-mkt-card-cond">{conditionTag}</span>}
        </div>
        <button
          type="button"
          className={`rw-mkt-card-heart${isSaved ? ' active' : ''}`}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Bỏ lưu ${product.title}` : `Lưu ${product.title}`}
          onClick={() => onToggleSave?.(product.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.4 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
          </svg>
        </button>
        {product.escrowReady && (
          <span className="rw-mkt-card-lock" aria-label="Sẵn sàng ký quỹ">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
              <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
        )}
      </div>

      <div className="rw-mkt-card-body">
        <span className="rw-mkt-card-tier">{brandTier}</span>
        <p className="rw-mkt-card-sku-line">
          <span>{product.brand.toUpperCase()} • {product.category === 'Phụ kiện' ? 'PHỤ KIỆN' : product.category === 'Túi xách' ? 'TÚI XÁCH' : `SIZE ${product.size}`}</span>
          {product.sku ? (
            <span className="rw-mkt-card-sku">{product.sku}</span>
          ) : product.sizeNote ? (
            <span className="rw-mkt-card-sku">{product.sizeNote}</span>
          ) : null}
        </p>
        <h3 className="rw-mkt-card-title">{product.title}</h3>

        <div className="rw-mkt-card-price">
          <b>{priceText} <small>₫</small></b>
        </div>

        <div className="rw-mkt-card-seller rw-mkt-card-seller--new">
          <span className="rw-mkt-seller-avatar" aria-hidden="true">
            {sellerAvatar}
          </span>
          <span className="rw-mkt-seller-name">{sellerHandle}</span>
          {typeof product.sellerRating === 'number' && (
            <span className="rw-mkt-seller-rating">
              <span className="rw-mkt-star" aria-hidden="true">★</span>
              <b>{product.sellerRating.toFixed(1)}</b>
              {typeof product.sellerReviewCount === 'number' && (
                <em>({product.sellerReviewCount})</em>
              )}
            </span>
          )}
        </div>

        <div className="rw-mkt-card-actions">
          <button
            type="button"
            className="rw-mkt-detail-btn"
            onClick={() => onViewDetails?.(product)}
            aria-label={`Xem chi tiết ${product.title}`}
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
