import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  WISHLIST_AI_OPTIONS,
  WISHLIST_CATEGORY_GROUPS,
  WISHLIST_CONDITION_GROUPS,
  WISHLIST_TIER_GROUPS,
  isInConditionGroup,
} from '../data/marketplace.data';
import type { BuyerProduct, WishlistAiKey, WishlistFilters } from '../types/marketplace.type';

export interface WishlistFilterPanelProps {
  filters: WishlistFilters;
  onChange: (patch: Partial<WishlistFilters>) => void;
  onClear: () => void;
  /** Sản phẩm đang lọc — mọi số đếm đều tính trên danh sách này. */
  products: BuyerProduct[];
  /** Số kết quả sau khi áp dụng, hiển thị trên nút "Áp dụng bộ lọc". */
  resultCount: number;
}

const formatVND = (value: string) => {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits).toLocaleString('vi-VN') : '';
};

const parseVND = (value: string) => value.replace(/[^\d]/g, '');

/** Bật/tắt một giá trị trong danh sách bộ lọc. */
const toggleIn = (list: string[], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

/**
 * Bộ lọc của trang Danh sách yêu thích, đặt bên trái cạnh lưới sản phẩm.
 * Mọi số lượng đều đếm trên danh sách đã lưu nên không bao giờ lệch với thực tế.
 */
export const WishlistFilterPanel: React.FC<WishlistFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  products,
  resultCount,
}) => {
  /** Danh mục "Tất cả" luôn bằng tổng số sản phẩm đang lọc. */
  const categoryOptions = WISHLIST_CATEGORY_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    count:
      group.key === 'all'
        ? products.length
        : products.filter((product) =>
            (group.categories as readonly string[]).includes(product.category),
          ).length,
  })).filter((option) => option.key === 'all' || option.count > 0);

  /** Chỉ hiện thương hiệu thực sự có trong danh sách đã lưu. */
  const brandOptions = Array.from(new Set(products.map((product) => product.brand)))
    .map((brand) => ({
      key: brand,
      count: products.filter((product) => product.brand === brand).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Nhóm phân khúc và tình trạng phẩm cấp là danh sách cố định nên luôn hiện
  // đủ, kể cả khi hiện tại chưa có sản phẩm nào khớp (số đếm sẽ là 0).
  const tierOptions = WISHLIST_TIER_GROUPS.map((tier) => ({
    key: tier.key,
    label: tier.label,
    count: products.filter((product) => product.brandTier === tier.key).length,
  }));

  const conditionOptions = WISHLIST_CONDITION_GROUPS.map((condition) => ({
    key: condition.key,
    label: condition.label,
    count: products.filter((product) =>
      isInConditionGroup(product.conditionTag, condition.key),
    ).length,
  }));

  const aiOptions = WISHLIST_AI_OPTIONS.map((option) => {
    if (option.key === 'all') return { ...option, count: products.length };
    const min = Number(option.key);
    return { ...option, count: products.filter((product) => product.aiScore >= min).length };
  });

  return (
    <aside className="rw-wish-filters" aria-label="Bộ lọc yêu thích">
      <div className="rw-wish-filters-head">
        <h2>
          <SlidersHorizontal size={15} aria-hidden="true" />
          Bộ lọc yêu thích
        </h2>
        <button type="button" className="rw-wish-filters-clear" onClick={onClear}>
          Xóa bộ lọc
        </button>
      </div>

      <section className="rw-wish-filter-group">
        <h3>Danh mục</h3>
        <ul>
          {categoryOptions.map((option) => {
            const active = filters.category === option.key;
            return (
              <li key={option.key}>
                <label className={`rw-wish-check-row${active ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="rw-wish-category"
                    checked={active}
                    onChange={() => onChange({ category: option.key })}
                  />
                  <span className="rw-wish-filter-box" aria-hidden="true" />
                  <span className="rw-wish-check-label">{option.label}</span>
                  <em>{option.count}</em>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-wish-filter-group">
        <h3>Thương hiệu</h3>
        <ul>
          {brandOptions.map((option) => {
            const checked = filters.brands.includes(option.key);
            return (
              <li key={option.key}>
                <label className={`rw-wish-check-row${checked ? ' is-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({ brands: toggleIn(filters.brands, option.key) })}
                  />
                  <span className="rw-wish-filter-box" aria-hidden="true" />
                  <span className="rw-wish-check-label">{option.key}</span>
                  <em>{option.count}</em>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-wish-filter-group">
        <h3>Nhóm phân khúc</h3>
        <ul>
          {tierOptions.map((option) => {
            const checked = filters.tiers.includes(option.key);
            return (
              <li key={option.key}>
                <label className={`rw-wish-check-row${checked ? ' is-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange({ tiers: toggleIn(filters.tiers, option.key) })}
                  />
                  <span className="rw-wish-filter-box" aria-hidden="true" />
                  <span className="rw-wish-check-label">{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-wish-filter-group">
        <h3>Tình trạng phẩm cấp</h3>
        <ul>
          {conditionOptions.map((option) => {
            const checked = filters.conditions.includes(option.key);
            return (
              <li key={option.key}>
                <label className={`rw-wish-check-row${checked ? ' is-active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      onChange({ conditions: toggleIn(filters.conditions, option.key) })
                    }
                  />
                  <span className="rw-wish-filter-box" aria-hidden="true" />
                  <span className="rw-wish-check-label">{option.label}</span>
                  <em>{option.count}</em>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-wish-filter-group">
        <h3>AI Confidence (bỏ tin cấy)</h3>
        <ul>
          {aiOptions.map((option) => {
            const active = filters.aiConfidence === option.key;
            return (
              <li key={option.key}>
                <label className={`rw-wish-radio-row${active ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="rw-wish-ai"
                    checked={active}
                    onChange={() => onChange({ aiConfidence: option.key as WishlistAiKey })}
                  />
                  <span className="rw-wish-radio-dot" aria-hidden="true" />
                  <span className="rw-wish-check-label">{option.label}</span>
                  <em>{option.count}</em>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-wish-filter-group">
        <h3>Khoảng giá (VNĐ)</h3>
        <div className="rw-wish-price-inputs">
          <label>
            <span>Từ</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatVND(filters.minPrice)}
              placeholder="Nhập giá"
              aria-label="Giá thấp nhất"
              onChange={(event) => onChange({ minPrice: parseVND(event.target.value) })}
            />
          </label>
          <label>
            <span>Đến</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatVND(filters.maxPrice)}
              placeholder="Nhập giá"
              aria-label="Giá cao nhất"
              onChange={(event) => onChange({ maxPrice: parseVND(event.target.value) })}
            />
          </label>
        </div>
      </section>

      <div className="rw-wish-filters-foot">
        <button type="button" onClick={onClear}>
          Áp dụng bộ lọc ({resultCount})
        </button>
      </div>
    </aside>
  );
};

export default WishlistFilterPanel;

