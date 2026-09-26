import React, { useMemo, useState } from 'react';
import {
  AI_CONFIDENCE_OPTIONS,
  BRAND_GROUPS,
  BRAND_OPTIONS,
  CONDITION_OPTIONS,
  PRICE_BOUNDS,
  PRODUCT_CATEGORIES,
  SIZE_OPTIONS,
} from '../data/marketplace.data';
import type { AiConfidenceKey, MarketplaceFilters } from '../types/marketplace.type';
import '../../../styles/marketplace/MarketplaceFilterPanel.css';

export interface MarketplaceFilterPanelProps {
  filters: MarketplaceFilters;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onApply: () => void;
  onClear: () => void;
  activeCount: number;
  resultCount?: number;
}

const formatVND = (value: string) => {
  if (!value) return '';
  const digits = value.replace(/[^\d]/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
};

const parseVND = (value: string) => value.replace(/[^\d]/g, '');

export const MarketplaceFilterPanel: React.FC<MarketplaceFilterPanelProps> = ({
  filters,
  onChange,
  onApply,
  onClear,
  activeCount,
  resultCount,
}) => {
  const [brandQuery, setBrandQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const toggleList = (
    key: 'brands' | 'sizes' | 'conditions',
    value: string
  ) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ [key]: next } as Partial<MarketplaceFilters>);
  };

  const selectCategory = (key: string) => {
    if (key === 'all') {
      onChange({ categories: [] });
      return;
    }
    onChange({ categories: [key] });
  };

  const isCategoryActive = (key: string) => {
    if (key === 'all') return filters.categories.length === 0;
    return filters.categories.includes(key);
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(groupKey) ? prev.filter((g) => g !== groupKey) : [...prev, groupKey]
    );
  };

  const minNum = filters.minPrice ? Number(filters.minPrice) : PRICE_BOUNDS.min;
  const maxNum = filters.maxPrice ? Number(filters.maxPrice) : PRICE_BOUNDS.max;

  const filteredGroups = useMemo(
    () =>
      BRAND_GROUPS.map((group) => ({
        ...group,
        options: BRAND_OPTIONS.filter(
          (b) =>
            b.group === group.key &&
            (brandQuery.trim() === '' ||
              b.label.toLowerCase().includes(brandQuery.trim().toLowerCase()))
        ),
      })).filter((g) => g.options.length > 0),
    [brandQuery]
  );

  const aiBadge =
    filters.aiConfidence === '90' ? '> 90%' : filters.aiConfidence === '80' ? '> 80%' : 'Tất cả';

  /** Người dùng chưa nhập/kéo giá nào -> hiển thị trạng thái trống, không khoá sẵn giá nào. */
  const hasPriceInput = Boolean(filters.minPrice || filters.maxPrice);

  return (
    <aside className="rw-mkt-filters rw-mkt-filters--new" aria-label="Bộ lọc sản phẩm">
      <div className="rw-mkt-filters-head">
        <h2 className="rw-mkt-filters-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Bộ lọc
        </h2>
        <button type="button" className="rw-mkt-clear-link" onClick={onClear}>
          Xóa bộ lọc
        </button>
      </div>

      <section className="rw-mkt-ai-card" aria-label="Mức độ AI Confidence">
        <div className="rw-mkt-ai-head">
          <b>
            <span className="rw-mkt-ai-icon" aria-hidden="true">◉</span>
            Mức độ AI Confidence
          </b>
          <em className="rw-mkt-ai-badge">{aiBadge}</em>
        </div>
        <div className="rw-mkt-ai-btns" role="group" aria-label="Chọn mức AI Confidence">
          {AI_CONFIDENCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`rw-mkt-ai-btn${filters.aiConfidence === opt.key ? ' active' : ''}`}
              aria-pressed={filters.aiConfidence === opt.key}
              onClick={() => onChange({ aiConfidence: opt.key as AiConfidenceKey })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="rw-mkt-ai-note">Hệ thống lọc quang học loại trừ sai lệch đường may &gt; 10%.</p>
      </section>

      <section className="rw-mkt-filter-group rw-mkt-cat-group">
        <h3>Danh mục</h3>
        <ul className="rw-mkt-cat-list">
          {PRODUCT_CATEGORIES.map((category) => (
            <li key={category.key}>
              <button
                type="button"
                className={`rw-mkt-cat${isCategoryActive(category.key) ? ' active' : ''}`}
                aria-pressed={isCategoryActive(category.key)}
                onClick={() => selectCategory(category.key)}
              >
                <span>{category.label}</span>
                <em>{category.count}</em>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rw-mkt-filter-group">
        <div className="rw-mkt-brand-head">
          <h3>Thương hiệu</h3>
          {filters.brands.length > 0 && (
            <em className="rw-mkt-brand-count">Đã chọn {filters.brands.length}</em>
          )}
        </div>
        <label className="rw-mkt-brand-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Tìm thương hiệu..."
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            aria-label="Tìm thương hiệu"
          />
        </label>
        <div className="rw-mkt-brand-groups">
          {filteredGroups.map((group) => {
            const collapsed = collapsedGroups.includes(group.key);
            return (
              <div key={group.key} className="rw-mkt-brand-group">
                <button
                  type="button"
                  className="rw-mkt-brand-group-title"
                  aria-expanded={!collapsed}
                  onClick={() => toggleGroup(group.key)}
                >
                  <span>{group.title}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={collapsed ? 'is-collapsed' : ''}>
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                </button>
                {!collapsed && (
                  <ul className="rw-mkt-brand-list">
                    {group.options.map((brand) => {
                      const checked = filters.brands.includes(brand.key);
                      return (
                        <li key={brand.key}>
                          <label className={`rw-mkt-brand${checked ? ' checked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleList('brands', brand.key)}
                            />
                            <span className="rw-mkt-brand-box" aria-hidden="true" />
                            <span className="rw-mkt-brand-label">{brand.label}</span>
                            <em>{brand.count}</em>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rw-mkt-filter-group">
        <h3>Kích cỡ (Size)</h3>
        <div className="rw-mkt-size-grid">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              className={`rw-mkt-size${filters.sizes.includes(size) ? ' active' : ''}`}
              aria-pressed={filters.sizes.includes(size)}
              onClick={() => toggleList('sizes', size)}
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="rw-mkt-filter-group">
        <h3>Tình trạng vật lý</h3>
        <ul className="rw-mkt-cond-list">
          {CONDITION_OPTIONS.map((condition) => {
            const checked = filters.conditions.includes(condition.key);
            return (
              <li key={condition.key}>
                <button
                  type="button"
                  className={`rw-mkt-cond${checked ? ' active' : ''}`}
                  aria-pressed={checked}
                  onClick={() => toggleList('conditions', condition.key)}
                >
                  <span className="rw-mkt-cond-dot" aria-hidden="true" />
                  <span className="rw-mkt-cond-label">{condition.label}</span>
                  <span className="rw-mkt-cond-check" aria-hidden="true">
                    {checked ? '✓' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rw-mkt-filter-group">
        <h3>Khoảng giá (VND)</h3>
        <div className="rw-mkt-price-labels">
          <span>Giá từ (đ)</span>
          <span>Giá đến (đ)</span>
        </div>
        <div className="rw-mkt-price-inputs rw-mkt-price-inputs--new">
          <input
            type="text"
            inputMode="numeric"
            value={formatVND(filters.minPrice)}
            placeholder="Nhập giá"
            aria-label="Giá thấp nhất"
            onChange={(e) => onChange({ minPrice: parseVND(e.target.value) })}
          />
          <input
            type="text"
            inputMode="numeric"
            value={formatVND(filters.maxPrice)}
            placeholder="Nhập giá"
            aria-label="Giá cao nhất"
            onChange={(e) => onChange({ maxPrice: parseVND(e.target.value) })}
          />
        </div>
        <div className={`rw-mkt-range-slider${hasPriceInput ? ' is-active' : ''}`}>
          <div className="rw-mkt-range-track" />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100000}
            value={Math.min(minNum, maxNum)}
            aria-label="Giá thấp nhất (thanh trượt)"
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange({ minPrice: String(Math.min(v, maxNum)) });
            }}
          />
          <input
            type="range"
            min={PRICE_BOUNDS.min}
            max={PRICE_BOUNDS.max}
            step={100000}
            value={Math.max(minNum, maxNum)}
            aria-label="Giá cao nhất (thanh trượt)"
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange({ maxPrice: String(Math.max(v, minNum)) });
            }}
          />
        </div>
      </section>

      <div className="rw-mkt-filters-foot rw-mkt-filters-foot--new">
        <button type="button" className="rw-mkt-apply-btn" onClick={onApply}>
          Áp dụng bộ lọc
          <span className="rw-mkt-apply-count">
            ({typeof resultCount === 'number' ? resultCount : activeCount})
          </span>
        </button>
      </div>

    </aside>
  );
};

export default MarketplaceFilterPanel;
