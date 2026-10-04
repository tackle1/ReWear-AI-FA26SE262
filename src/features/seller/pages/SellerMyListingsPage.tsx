import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, PackageSearch, Plus, Search, TriangleAlert } from 'lucide-react';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import DashboardSidebar from '../../../components/layout/DashboardSidebar';
import DashboardTopbar from '../../../components/layout/DashboardTopbar';
import DashboardFooterNote from '../../../components/layout/DashboardFooterNote';
import useSellerDashboard, {
  type SellerListingRow,
  type SellerListingStage,
} from '../hooks/useSellerDashboard';
import { clearSellerListings } from '../services/sellerListingsStore';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/dashboard/SellerMyListings.css';

type StageFilter = 'all' | SellerListingStage;
type SortKey = 'newest' | 'score' | 'price-desc' | 'price-asc';

const STAGE_FILTERS: Array<{ key: StageFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'verified', label: 'Đã xác thực' },
  { key: 'review', label: 'Chờ duyệt' },
  { key: 'rejected', label: 'Bị từ chối' },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Mới nhất' },
  { key: 'score', label: 'Điểm AI cao' },
  { key: 'price-desc', label: 'Giá cao đến thấp' },
  { key: 'price-asc', label: 'Giá thấp đến cao' },
];

const formatPrice = (price: number): string =>
  Number.isFinite(price) ? `${price.toLocaleString('vi-VN')} d` : '--';

const scoreTone = (score: number | null): string => {
  if (score === null) return 'none';
  if (score >= 75) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
};

const ListingCard: React.FC<{ row: SellerListingRow; onOpen: (id: string) => void }> = ({
  row,
  onOpen,
}) => {
  const tone = scoreTone(row.score);
  return (
    <article className={`rw-mylist-card is-${row.stage}`}>
      <div className="rw-mylist-media">
        {row.thumbnail ? (
          <img src={row.thumbnail} alt={row.name} loading="lazy" />
        ) : (
          <span className="rw-mylist-media-fallback" aria-hidden="true">
            {row.name.charAt(0)}
          </span>
        )}
        <span className={`rw-mylist-stage is-${row.stage}`}>
          {row.isFlagged ? 'Chưa hiển thị trên sàn' : row.statusLabel}
        </span>
      </div>
      <div className="rw-mylist-body">
        <p className="rw-mylist-cat">{row.category}</p>
        <button type="button" className="rw-mylist-name" onClick={() => onOpen(row.id)} title={row.name}>
          {row.name}
        </button>
        <p className="rw-mylist-sku">
          {row.sku ? `SKU ${row.sku}` : 'Chưa có SKU'} - {row.createdAt}
        </p>
        <div className="rw-mylist-score">
          <div className="rw-mylist-score-top">
            <span>Điểm AI</span>
            <strong className={`tone-${tone}`}>
              {row.score === null ? 'Chưa chấm' : `${row.score}%`}
            </strong>
          </div>
          <div className="rw-mylist-bar" aria-hidden="true">
            <span className={`fill tone-${tone}`} style={{ width: `${row.score ?? 0}%` }} />
          </div>
          <p className="rw-mylist-grade">{row.gradeLabel}</p>
        </div>
        <div className="rw-mylist-foot">
          <span className="rw-mylist-price">{formatPrice(row.price)}</span>
          <button type="button" className="rw-mylist-open" onClick={() => onOpen(row.id)}>
            <Eye width={14} height={14} aria-hidden="true" />
            Xem hồ sơ
          </button>
        </div>
      </div>
    </article>
  );
};

export const SellerMyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rows, overview, isLoading, sourceError, autoPublishThreshold, autoRejectThreshold } =
    useSellerDashboard();
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<StageFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');

  const openDetail = useCallback(
    (listingId: string) => {
      navigate(ROUTES.SELLER.LISTING_DETAIL.replace(':listingId', encodeURIComponent(listingId)));
    },
    [navigate],
  );

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (stage !== 'all' && row.stage !== stage) return false;
      if (!q) return true;
      return [row.name, row.sku, row.category]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(q));
    });
    const sorted = [...filtered];
    if (sort === 'score') sorted.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    return sorted;
  }, [rows, query, stage, sort]);

  const stageCount = useCallback(
    (key: StageFilter) =>
      key === 'all' ? rows.length : rows.filter((row) => row.stage === key).length,
    [rows],
  );

  const handleLogout = useCallback(() => {
    const currentUserId = storage.getItem<{ userId?: string }>('rewear_current_user')?.userId;
    clearSellerListings(currentUserId ?? null);
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  return (
    <div className="seller-app rw-dashboard-theme">
      <DashboardSidebar activeKey="listings" onSelect={(_, item) => navigate(item.path)} />
      <section className="seller-shell">
        <DashboardTopbar onLogout={handleLogout} />
        <main className="seller-main">
          <section className="rw-mylist-hero">
            <div className="rw-mylist-hero-text">
              <p className="rw-mylist-eyebrow">Kho hàng - {overview.total} tin đăng</p>
              <h1 className="rw-mylist-title">Tin đăng của tôi</h1>
              <p className="rw-mylist-sub">Quản lý toàn bộ tin bán, theo dõi điểm AI và trạng thái duyệt theo thời gian thực.</p>
              <div className="rw-mylist-summary">
                <span className="rw-mylist-pill is-ok">{overview.verified} đã xác thực</span>
                <span className="rw-mylist-pill is-wait">{overview.review} chờ duyệt</span>
                <span className="rw-mylist-pill is-bad">{overview.rejected} bị từ chối</span>
              </div>
            </div>
            <button type="button" className="rw-mylist-create" onClick={() => navigate(ROUTES.LISTING.CREATE)}>
              <Plus width={16} height={16} aria-hidden="true" />
              Tạo tin đăng mới
            </button>
          </section>
          {sourceError && (
            <div className="rw-dash-warn" role="alert">
              <TriangleAlert width={16} height={16} aria-hidden="true" />
              {sourceError}
            </div>
          )}
          <section className="rw-mylist-controls">
            <div className="rw-mylist-search">
              <Search width={16} height={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên, SKU, danh mục..."
                aria-label="Tìm tin đăng"
              />
            </div>
            <div className="rw-mylist-filters" role="tablist" aria-label="Lọc theo giai đoạn">
              {STAGE_FILTERS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={stage === option.key}
                  className={`rw-mylist-chip${stage === option.key ? ' active' : ''}`}
                  onClick={() => setStage(option.key)}
                >
                  {option.label}
                  <span className="rw-mylist-chip-count">{stageCount(option.key)}</span>
                </button>
              ))}
            </div>
            <label className="rw-mylist-sort">
              Sắp xếp
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
          {isLoading ? (
            <p className="rw-mylist-status">Đang tải tin đăng...</p>
          ) : visibleRows.length === 0 ? (
            <div className="rw-mylist-empty">
              <PackageSearch width={36} height={36} aria-hidden="true" />
              <p className="rw-mylist-empty-title">Không tìm thấy tin nào khớp</p>
              <p className="rw-mylist-empty-desc">Thử đổi từ khóa hoặc giai đoạn lọc khác.</p>
            </div>
          ) : (
            <>
              <p className="rw-mylist-count">
                Hiển thị {visibleRows.length} trên tổng số {rows.length} tin đăng
              </p>
              <section className="rw-mylist-grid">
                {visibleRows.map((row) => (
                  <ListingCard key={row.id} row={row} onOpen={openDetail} />
                ))}
              </section>
            </>
          )}
          <DashboardFooterNote
            autoPublishThreshold={autoPublishThreshold}
            autoRejectThreshold={autoRejectThreshold}
          />
        </main>
      </section>
    </div>
  );
};

export default SellerMyListingsPage;