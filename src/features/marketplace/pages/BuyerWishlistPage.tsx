import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Heart,
  LayoutGrid,
  Package,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import ProductCard from '../components/ProductCard';
import WishlistFilterPanel from '../components/WishlistFilterPanel';
import MarketplaceFooter, { MarketplaceAssuranceBanner } from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import useWishlist from '../hooks/useWishlist';
import {
  MARKETPLACE_CATALOG,
  WISHLIST_CATEGORY_GROUPS,
  WISHLIST_SORT_OPTIONS,
  WISHLIST_TABS,
  WISHLIST_VERIFY_CTA,
  isInConditionGroup,
  type WishlistSortKey,
  type WishlistTabKey,
} from '../data/marketplace.data';
import type { BuyerProduct, WishlistFilters } from '../types/marketplace.type';
import '../../../styles/marketplace/BuyerWishlistPage.css';

/** Sản phẩm có giá niêm yết cao hơn giá bán = đang giảm giá. */
const isDiscounted = (product: BuyerProduct) =>
  typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price;

/** Áp dụng tab lọc lên danh sách đã lưu. */
const matchesTab = (product: BuyerProduct, tab: WishlistTabKey) => {
  if (tab === 'discounted') return isDiscounted(product);
  if (tab === 'available') return !product.soldOut;
  if (tab === 'sold-out') return Boolean(product.soldOut);
  return true;
};

/** Bộ lọc mặc định: không áp dụng điều kiện nào. */
const INITIAL_WISHLIST_FILTERS: WishlistFilters = {
  category: 'all',
  brands: [],
  tiers: [],
  conditions: [],
  aiConfidence: 'all',
  minPrice: '',
  maxPrice: '',
};

/** Áp dụng toàn bộ điều kiện của bộ lọc trái lên một sản phẩm. */
const matchesFilters = (product: BuyerProduct, filters: WishlistFilters) => {
  const group = WISHLIST_CATEGORY_GROUPS.find((item) => item.key === filters.category);
  if (group && group.key !== 'all' && !(group.categories as readonly string[]).includes(product.category)) {
    return false;
  }
  if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
  if (filters.tiers.length > 0 && !filters.tiers.includes(product.brandTier ?? '')) return false;
  if (
    filters.conditions.length > 0 &&
    !filters.conditions.some((key) => isInConditionGroup(product.conditionTag, key))
  ) {
    return false;
  }
  if (filters.aiConfidence !== 'all' && product.aiScore < Number(filters.aiConfidence)) {
    return false;
  }
  if (filters.minPrice && product.price < Number(filters.minPrice)) return false;
  if (filters.maxPrice && product.price > Number(filters.maxPrice)) return false;
  return true;
};

/**
 * Danh sách yêu thích: hiển thị đúng các sản phẩm đã bấm tim ở product card
 * trên sàn giao dịch. Dùng chung `useWishlist` nên hai chiều luôn đồng bộ:
 * bấm tim ở đây cũng cập nhật lại badge trên thanh điều hướng.
 */
export const BuyerWishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { savedIds, isSaved, toggleSave } = useWishlist();
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<WishlistTabKey>('all');
  const [sortKey, setSortKey] = useState<WishlistSortKey>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  // Chế độ chọn nhiều: hiện ô tick trên mỗi thẻ để dọn hàng loạt.
  const [isPickMode, setIsPickMode] = useState(false);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<WishlistFilters>(INITIAL_WISHLIST_FILTERS);

  // Tên hiển thị lấy từ phiên đăng nhập, rơi về tên mặc định trên BuyerTopbar.
  const currentUser = storage.getItem<{ name?: string }>('rewear_current_user');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Đóng menu sắp xếp khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!isSortOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('.rw-wish-sort')) setIsSortOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSortOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isSortOpen]);

  /** Sản phẩm đã lưu, giữ đúng thứ tự người dùng bấm tim (mới nhất trước). */
  const savedProducts = useMemo(
    () =>
      savedIds
        .map((id) => MARKETPLACE_CATALOG.find((product) => product.id === id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product)),
    [savedIds],
  );

  /** Sản phẩm đã lưu còn khớp bộ lọc bên trái — nguồn số đếm cho panel lọc. */
  const filteredProducts = useMemo(
    () => savedProducts.filter((product) => matchesFilters(product, filters)),
    [savedProducts, filters],
  );

  const patchFilters = (patch: Partial<WishlistFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_WISHLIST_FILTERS);
  };

  /** Số lượng thực tế của từng tab, luôn khớp với danh sách đã lọc. */
  const tabCounts = useMemo(
    () =>
      WISHLIST_TABS.reduce<Record<string, number>>((acc, item) => {
        acc[item.key] = filteredProducts.filter((product) => matchesTab(product, item.key)).length;
        return acc;
      }, {}),
    [filteredProducts],
  );

  /** Sản phẩm sau khi lọc theo bộ lọc trái, tab và sắp xếp. */
  const visibleProducts = useMemo(() => {
    const filtered = filteredProducts.filter((product) => matchesTab(product, tab));
    return [...filtered].sort((a, b) => {
      if (sortKey === 'price-asc') return a.price - b.price;
      if (sortKey === 'price-desc') return b.price - a.price;
      if (sortKey === 'name-asc') return a.title.localeCompare(b.title, 'vi');
      return 0;
    });
  }, [filteredProducts, sortKey, tab]);

  const activeSortLabel =
    WISHLIST_SORT_OPTIONS.find((option) => option.key === sortKey)?.label ?? 'Mới nhất';

  const handleToggleSave = (id: string) => {
    const wasSaved = isSaved(id);
    toggleSave(id);
    setPickedIds((prev) => prev.filter((item) => item !== id));
    setToast(wasSaved ? 'Đã bỏ khỏi danh sách yêu thích.' : 'Đã lưu vào danh sách yêu thích.');
  };

  const handleTogglePick = (id: string) => {
    setPickedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTogglePickAll = () => {
    setPickedIds((prev) =>
      prev.length === visibleProducts.length ? [] : visibleProducts.map((product) => product.id),
    );
  };

  const handleRemovePicked = () => {
    if (pickedIds.length === 0) return;
    pickedIds.forEach(toggleSave);
    setToast(`Đã xoá ${pickedIds.length} sản phẩm khỏi danh sách yêu thích.`);
    setPickedIds([]);
  };

  const handleClearAll = () => {
    savedIds.forEach(toggleSave);
    setPickedIds([]);
    setToast('Đã xoá toàn bộ danh sách yêu thích.');
  };

  /** Bật/tắt chế độ chọn nhiều và bỏ chọn cũ cho khỏi lệch danh sách. */
  const handleTogglePickMode = () => {
    setIsPickMode((prev) => !prev);
    setPickedIds([]);
  };

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="rw-mkt-app rw-wish-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={currentUser?.name?.trim() || undefined}
        onWishlistClick={() => setToast('Bạn đang ở trang Danh sách yêu thích.')}
        onLogout={handleLogout}
      />

      <main className="rw-mkt-main">
        <nav className="rw-wish-breadcrumb" aria-label="Đường dẫn">
          <button type="button" onClick={() => navigate(ROUTES.MARKETPLACE.ROOT)}>
            Khám phá
          </button>
          <span aria-hidden="true">›</span>
          <button type="button" onClick={() => navigate(ROUTES.BUYER.ACCOUNT)}>
            Tài khoản người mua
          </button>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Sản phẩm yêu thích</span>
        </nav>

        {/* ── Header: tên trang + số lượng + thao tác nhanh ── */}
        <header className="rw-wish-head">
          <div className="rw-wish-head-main">
            <span className="rw-wish-head-icon" aria-hidden="true">
              <Heart size={18} fill="currentColor" />
            </span>
            <div className="rw-wish-head-copy">
              <div className="rw-wish-head-title">
                <h1>Yêu thích</h1>
                <span className="rw-wish-head-count">{savedIds.length} sản phẩm</span>
              </div>
              <p>Lưu lại những sản phẩm bạn quan tâm và quay lại mua khi sẵn sàng.</p>
            </div>
          </div>

          <div className="rw-wish-head-actions">
            <button
              type="button"
              className={`rw-wish-btn${isPickMode ? ' is-active' : ''}`}
              aria-pressed={isPickMode}
              onClick={handleTogglePickMode}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              Chọn nhiều
            </button>
            <button
              type="button"
              className="rw-wish-btn"
              onClick={() => navigate(ROUTES.BUYER.ORDERS)}
            >
              <Package size={14} aria-hidden="true" />
              Đơn đặp mua đã bán
            </button>
            <button
              type="button"
              className="rw-wish-btn rw-wish-btn--icon is-danger"
              aria-label="Xoá toàn bộ danh sách yêu thích"
              title="Xoá toàn bộ danh sách yêu thích"
              disabled={savedIds.length === 0}
              onClick={handleClearAll}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ── Thanh tab lọc + sắp xếp ── */}
        {savedIds.length > 0 && (
          <div className="rw-wish-toolbar">
            <div className="rw-wish-tabs" role="tablist" aria-label="Lọc danh sách yêu thích">
              {WISHLIST_TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.key}
                  className={`rw-wish-tab${tab === item.key ? ' is-active' : ''}`}
                  onClick={() => setTab(item.key)}
                >
                  {item.label} ({tabCounts[item.key]})
                </button>
              ))}
            </div>

            <div className="rw-wish-sort">
              <ArrowUpDown size={13} aria-hidden="true" />
              <span>Sắp xếp:</span>
              <button
                type="button"
                className="rw-wish-sort-btn"
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                onClick={() => setIsSortOpen((open) => !open)}
              >
                {activeSortLabel}
                <ChevronDown
                  size={13}
                  className={isSortOpen ? 'rw-wish-sort-caret is-open' : 'rw-wish-sort-caret'}
                  aria-hidden="true"
                />
              </button>
              {isSortOpen && (
                <ul className="rw-wish-sort-menu" role="listbox" aria-label="Sắp xếp">
                  {WISHLIST_SORT_OPTIONS.map((option) => (
                    <li key={option.key} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={sortKey === option.key}
                        className={sortKey === option.key ? 'is-active' : undefined}
                        onClick={() => {
                          setSortKey(option.key);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                        {sortKey === option.key && <Check size={13} aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Thanh thao tác khi đang chọn nhiều ── */}
        {isPickMode && visibleProducts.length > 0 && (
          <div className="rw-wish-pickbar">
            <label className="rw-wish-pickall">
              <input
                type="checkbox"
                checked={pickedIds.length > 0 && pickedIds.length === visibleProducts.length}
                onChange={handleTogglePickAll}
              />
              <span>
                {pickedIds.length === visibleProducts.length && pickedIds.length > 0
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </span>
            </label>
            <b>{pickedIds.length} đã chọn</b>
            <button
              type="button"
              className="rw-wish-pick-remove"
              disabled={pickedIds.length === 0}
              onClick={handleRemovePicked}
            >
              <Trash2 size={13} aria-hidden="true" />
              Bỏ lưu đã chọn
            </button>
          </div>
        )}

        {/* ── Bộ lọc bên trái kèm lưới sản phẩm ── */}
        <div className="rw-wish-layout">
          <WishlistFilterPanel
            filters={filters}
            onChange={patchFilters}
            onClear={handleClearFilters}
            products={savedProducts}
            resultCount={visibleProducts.length}
          />

          <div className="rw-wish-results">

        {visibleProducts.length > 0 ? (
          <section className="rw-wish-grid" aria-label="Sản phẩm đã lưu yêu thích">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className={`rw-wish-cell${pickedIds.includes(product.id) ? ' is-picked' : ''}`}
              >
                {isPickMode && (
                  <label className="rw-wish-check">
                    <input
                      type="checkbox"
                      checked={pickedIds.includes(product.id)}
                      onChange={() => handleTogglePick(product.id)}
                    />
                    <span className="rw-wish-check-box" aria-hidden="true">
                      <Check size={12} />
                    </span>
                    <span className="rw-wish-check-text">Chọn {product.title}</span>
                  </label>
                )}
                <ProductCard
                  product={product}
                  isSaved
                  onToggleSave={handleToggleSave}
                  onViewDetails={(item) =>
                    navigate(
                      ROUTES.MARKETPLACE.PRODUCT_DETAIL.replace(
                        ':id',
                        encodeURIComponent(item.id),
                      ),
                    )
                  }
                />
              </div>
            ))}
          </section>
        ) : (
          <div className="rw-mkt-empty">
            {savedIds.length > 0 ? (
              <>
                <LayoutGrid size={22} aria-hidden="true" />
                <b>Không có sản phẩm nào trong tab này</b>
                <p>Chọn tab khác để xem thêm sản phẩm đã lưu.</p>
                <button type="button" onClick={() => setTab('all')}>
                  Xem tất cả
                </button>
              </>
            ) : (
              <>
                <Heart size={22} aria-hidden="true" />
                <b>Danh sách yêu thích đang trống</b>
                <p>Bấm biểu tượng trái tim trên thẻ sản phẩm để lưu lại món đồ bạn quan tâm.</p>
                <button type="button" onClick={() => navigate(ROUTES.MARKETPLACE.ROOT)}>
                  Khám phá sản phẩm
                </button>
              </>
            )}
          </div>
        )}
          </div>
        </div>

        <MarketplaceAssuranceBanner
          title={WISHLIST_VERIFY_CTA.title}
          description={WISHLIST_VERIFY_CTA.description}
          actionLabel={WISHLIST_VERIFY_CTA.actionLabel}
          onAction={() => setToast('Bộ quy chuẩn giảm định AI quang học gồm 3 bước: chụp ảnh, đối chiếu báo cáo, xác nhận kết quả.')}
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

export default BuyerWishlistPage;