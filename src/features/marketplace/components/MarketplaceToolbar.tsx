import React from 'react';
import { CATEGORY_CHIPS, SORT_OPTIONS } from '../data/marketplace.data';
import type { MarketplaceViewMode } from '../types/marketplace.type';
import '../../../styles/marketplace/MarketplaceToolbar.css';

export interface MarketplaceToolbarProps {
  activeChip: string;
  onChipChange: (key: string) => void;
  sortKey: string;
  onSortChange: (key: string) => void;
  viewMode: MarketplaceViewMode;
  onViewModeChange: (mode: MarketplaceViewMode) => void;
  resultCount: number;
  activeFilterCount: number;
  onOpenFilters: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  onSaveSearch?: () => void;
}

export const MarketplaceToolbar: React.FC<MarketplaceToolbarProps> = ({
  activeChip,
  onChipChange,
  sortKey,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  activeFilterCount,
  onOpenFilters,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSaveSearch,
}) => {
  return (
    <div className="rw-mkt-toolbar">
      <div className="rw-mkt-toolbar-row rw-mkt-toolbar-row--top">
        <form
          className="rw-mkt-searchbar"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.(searchValue);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="rw-mkt-searchbar-icon">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            className="rw-mkt-searchbar-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Tìm kiếm sản phẩm"
          />
          <button type="button" className="rw-mkt-save-btn" onClick={onSaveSearch}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" />
              <path d="m9 7 6 6M15 7l-6 6" />
            </svg>
            <span>Lưu tìm kiếm</span>
          </button>
        </form>

        <div className="rw-mkt-toolbar-count-group">
          <span className="rw-mkt-result-count">
            <b>{resultCount}</b> tin đăng đã xác thực
          </span>

          <button type="button" className="rw-mkt-filter-btn" onClick={onOpenFilters}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            <span>Bộ lọc</span>
            {activeFilterCount > 0 && <em className="rw-mkt-filter-badge">{activeFilterCount}</em>}
          </button>
        </div>
      </div>

      <div className="rw-mkt-toolbar-row rw-mkt-toolbar-row--chips">
        <div className="rw-mkt-quick">
          <span className="rw-mkt-chips-label">Tìm nhanh:</span>
          <div className="rw-mkt-chips" role="tablist" aria-label="Tìm kiếm nhanh">
            {CATEGORY_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                role="tab"
                aria-selected={activeChip === chip.key}
                className={`rw-mkt-chip${activeChip === chip.key ? ' active' : ''}`}
                onClick={() => onChipChange(chip.key)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rw-mkt-toolbar-tools">
          <label className="rw-mkt-sort">
            <span>Sắp xếp:</span>
            <select value={sortKey} onChange={(e) => onSortChange(e.target.value)} aria-label="Sắp xếp kết quả">
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>

          <div className="rw-mkt-view-toggle" role="group" aria-label="Chế độ xem">
            <button
              type="button"
              className={`rw-mkt-view-btn${viewMode === 'grid' ? ' active' : ''}`}
              aria-pressed={viewMode === 'grid'}
              aria-label="Xem dạng lưới"
              onClick={() => onViewModeChange('grid')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true">
                <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
                <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
                <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
                <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
              </svg>
            </button>
            <button
              type="button"
              className={`rw-mkt-view-btn${viewMode === 'list' ? ' active' : ''}`}
              aria-pressed={viewMode === 'list'}
              aria-label="Xem dạng danh sách"
              onClick={() => onViewModeChange('list')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MarketplaceToolbar;
