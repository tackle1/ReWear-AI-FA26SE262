import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceHero from '../components/MarketplaceHero';
import MarketplaceToolbar from '../components/MarketplaceToolbar';
import MarketplaceFilterPanel from '../components/MarketplaceFilterPanel';
import ProductCard from '../components/ProductCard';
import MarketplacePagination from '../components/MarketplacePagination';
import MarketplaceFooter, { MarketplaceAssuranceBanner } from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import {
  BUYER_PRODUCTS,
  CATEGORY_CHIPS,
  FILTER_CATEGORY_MAP,
  FILTER_CONDITION_MAP,
  MARKETPLACE_TOTALS,
} from '../data/marketplace.data';
import type {
  BuyerProduct,
  MarketplaceFilters,
  MarketplaceSortKey,
  MarketplaceViewMode,
} from '../types/marketplace.type';
import '../../../styles/marketplace/MarketplacePage.css';

const PAGE_SIZE = 16;

const INITIAL_FILTERS: MarketplaceFilters = {
  verifiedSellersOnly: false,
  categories: [],
  brands: [],
  sizes: [],
  conditions: [],
  region: 'Toàn quốc',
  minPrice: '',
  maxPrice: '',
  aiConfidence: 'all',
};

/** Mã SKU gốc của sản phẩm (bỏ hậu tố phân trang của dữ liệu mock). */

/**
 * Sàn giao dịch: đúng 16 tin đăng mẫu, không nhân bản.
 * Chờ API `/listings` thật để phân trang server-side.
 */

export const BuyerMarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');
  const [activeChip, setActiveChip] = useState(CATEGORY_CHIPS[0].key);
  const [sortKey, setSortKey] = useState<MarketplaceSortKey>('newest');
  const [viewMode, setViewMode] = useState<MarketplaceViewMode>('grid');
  const [filters, setFilters] = useState<MarketplaceFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  // Danh sách yêu thích luôn bắt đầu rỗng: chỉ cộng khi người dùng bấm tim ở product card.
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  // Tên hiển thị lấy từ phiên đăng nhập, rơi về tên mặc định trên ảnh tham chiếu.
  const currentUser = storage.getItem<{ name?: string }>('rewear_current_user');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const patchFilters = (patch: Partial<MarketplaceFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setActiveChip('');
    setPage(1);
    setToast('Đã xoá toàn bộ bộ lọc.');
  };

  const handleChipChange = (key: string) => {
    setActiveChip(key);
    setPage(1);
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      setToast(isSaved ? 'Đã bỏ khỏi danh sách yêu thích.' : 'Đã lưu vào danh sách yêu thích.');
      return isSaved ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  /** Danh mục của tag "Tìm nhanh" đang chọn (bỏ trống = không lọc danh mục). */
  const activeChipCategory = CATEGORY_CHIPS.find((chip) => chip.key === activeChip)?.category;

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return CATALOG.filter((product) => {
      if (filters.verifiedSellersOnly && !product.sellerVerified) return false;
      if (filters.aiConfidence === '80' && product.aiScore < 80) return false;
      if (filters.aiConfidence === '90' && product.aiScore < 90) return false;
      if (filters.categories.length > 0) {
        const allowed = filters.categories.flatMap((key) => FILTER_CATEGORY_MAP[key] ?? [key]);
        if (!allowed.includes(product.category)) return false;
      }
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
      if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) return false;
      if (filters.conditions.length > 0) {
        const allowed = filters.conditions.flatMap((key) => FILTER_CONDITION_MAP[key] ?? [key]);
        if (!allowed.includes(product.condition)) return false;
      }
      if (filters.region !== 'Toàn quốc' && product.location !== filters.region) return false;
      if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
      if (activeChipCategory && product.category !== activeChipCategory) return false;
      if (
        keyword &&
        !`${product.title} ${product.brand} ${product.category} ${product.id}`
          .toLowerCase()
          .includes(keyword)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortKey === 'price-asc') return a.price - b.price;
      if (sortKey === 'price-desc') return b.price - a.price;
      if (sortKey === 'ai-score') return b.aiScore - a.aiScore;
      if (sortKey === 'savings') {
        const savingOf = (item: BuyerProduct) => (item.compareAtPrice ?? item.price) - item.price;
        return savingOf(b) - savingOf(a);
      }
      return (b.listedAt ?? 0) - (a.listedAt ?? 0);
    });
  }, [activeChip, filters, searchValue, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (currentPage - 1) * PAGE_SIZE + visibleProducts.length;

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    filters.sizes.length +
    filters.conditions.length +
    (filters.aiConfidence !== 'all' ? 1 : 0) +
    (filters.verifiedSellersOnly ? 1 : 0) +
    (filters.region !== 'Toàn quốc' ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0);

  return (
    <div className="rw-mkt-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={currentUser?.name?.trim() || undefined}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={(value) =>
          setToast(value ? `Đang tìm "${value}"...` : 'Nhập từ khoá để tìm kiếm.')
        }
        wishlistCount={savedIds.length}
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-mkt-main">
        <MarketplaceHero />

        <MarketplaceToolbar
          activeChip={activeChip}
          onChipChange={handleChipChange}
          sortKey={sortKey}
          onSortChange={(key) => {
            setSortKey(key as MarketplaceSortKey);
            setPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredProducts.length}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => setToast('Bộ lọc đầy đủ nằm ở cột bên trái.')}
          searchValue={searchValue}
          onSearchChange={(value) => {
            setSearchValue(value);
            setPage(1);
          }}
          onSearchSubmit={(value) =>
            setToast(value ? `Đang tìm "${value}"...` : 'Nhập từ khoá để tìm kiếm.')
          }
          onSaveSearch={() =>
            setToast(
              searchValue.trim()
                ? `Đã lưu tìm kiếm "${searchValue.trim()}".`
                : 'Nhập từ khoá trước khi lưu tìm kiếm.'
            )
          }
        />

        <div className="rw-mkt-layout">
          <MarketplaceFilterPanel
            filters={filters}
            onChange={patchFilters}
            activeCount={activeFilterCount}
            resultCount={filteredProducts.length}
            onApply={() => setToast(`Đã áp dụng ${activeFilterCount} điều kiện lọc.`)}
            onClear={clearFilters}
          />

          <section className="rw-mkt-results" aria-label="Danh sách sản phẩm">
            <div className="rw-mkt-results-head">
              <h2>
                {activeChip ? 'Sản phẩm đã xác thực AI' : 'Tất cả sản phẩm đã xác thực'}
                <em>{filteredProducts.length} kết quả</em>
              </h2>
              <span className="rw-mkt-results-hint">
                {MARKETPLACE_TOTALS.matchRate} Match Rate
              </span>
            </div>

            {visibleProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'rw-mkt-grid' : 'rw-mkt-grid rw-mkt-grid--list'}>
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={viewMode}
                    isSaved={savedIds.includes(product.id)}
                    onToggleSave={handleToggleSave}
                    onViewDetails={(item) =>
                      setToast(`Đang mở chi tiết "${item.title}".`)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="rw-mkt-empty">
                <b>Không tìm thấy sản phẩm phù hợp</b>
                <p>Thử nới rộng khoảng giá hoặc bỏ một vài điều kiện lọc.</p>
                <button type="button" onClick={clearFilters}>
                  Xoá bộ lọc
                </button>
              </div>
            )}

            <MarketplacePagination
              page={currentPage}
              totalPages={totalPages}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              total={filteredProducts.length}
              onPageChange={(next) => {
                setPage(next);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>
        </div>

        <MarketplaceAssuranceBanner
          onAction={() => setToast('Ký quỹ 3 bước, giải ngân sau khi bạn xác nhận hàng.')}
        />
      </main>

      <MarketplaceFooter />

      {toast && (
        <div className="rw-mkt-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );

};

export default BuyerMarketplacePage;

const CATALOG: BuyerProduct[] = Array.from(
  { length: MARKETPLACE_TOTALS.totalResults },
  (_, index) => {
    const source = BUYER_PRODUCTS[index % BUYER_PRODUCTS.length];
    // listedAt giảm dần để chế độ "Mới nhất" trải đều 16 mẫu gốc trên trang đầu tiên.
    return index < BUYER_PRODUCTS.length
      ? { ...source, listedAt: index }
      : { ...source, id: `${source.id}-${index}`, listedAt: index };
  }
);
