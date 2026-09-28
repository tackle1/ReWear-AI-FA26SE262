import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownWideNarrow,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  ListFilter,
  PackageCheck,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import {
  BUYER_ORDERS,
  ORDER_SORT_OPTIONS,
  ORDER_STAT_CARDS,
  ORDER_STATUS_FILTERS,
  ORDER_STATUS_META,
} from '../data/orders.data';
import type { BuyerOrder } from '../types/orders.type';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/BuyerOrdersPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

const STAT_ICONS = {
  all: ListFilter,
  clock: CalendarDays,
  refresh: RefreshCw,
  truck: Truck,
  box: PackageCheck,
  check: BadgeCheck,
} as const;

type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number]['key'];
type OrderSortKey = (typeof ORDER_SORT_OPTIONS)[number]['key'];

const ORDERS_PER_PAGE = 4;

const BuyerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = storage.getItem<{ name?: string }>('rewear_current_user');

  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [draftStatus, setDraftStatus] = useState<OrderStatusFilter>('all');
  const [fromDate, setFromDate] = useState('2026-09-01');
  const [toDate, setToDate] = useState('2026-09-18');
  const [draftFrom, setDraftFrom] = useState('2026-09-01');
  const [draftTo, setDraftTo] = useState('2026-09-18');
  const [sortKey, setSortKey] = useState<OrderSortKey>('newest');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = BUYER_ORDERS.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (fromDate && order.dateISO < fromDate) return false;
      if (toDate && order.dateISO > toDate) return false;
      if (!query) return true;
      return (
        order.id.toLowerCase().includes(query) ||
        order.productTitle.toLowerCase().includes(query) ||
        order.sellerHandle.toLowerCase().includes(query)
      );
    });
    const sorted = [...list];
    if (sortKey === 'total-desc') sorted.sort((a, b) => b.total - a.total);
    else if (sortKey === 'total-asc') sorted.sort((a, b) => a.total - b.total);
    else sorted.sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return sorted;
  }, [search, statusFilter, fromDate, toDate, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageOrders = filteredOrders.slice((safePage - 1) * ORDERS_PER_PAGE, safePage * ORDERS_PER_PAGE);
  const rangeFrom = filteredOrders.length === 0 ? 0 : (safePage - 1) * ORDERS_PER_PAGE + 1;
  const rangeTo = Math.min(safePage * ORDERS_PER_PAGE, filteredOrders.length);

  /* ── Nhãn bộ lọc đang áp dụng (lấy từ chính data, không hard-code) ── */
  const activeStatusLabel =
    statusFilter === 'all'
      ? 'Tất cả trạng thái'
      : ORDER_STATUS_FILTERS.find((option) => option.key === statusFilter)?.label ??
        ORDER_STATUS_META[statusFilter].label;
  const activeSortLabel =
    ORDER_SORT_OPTIONS.find((option) => option.key === sortKey)?.label ?? 'Mới nhất';

  const hasDateFilter = Boolean(fromDate || toDate);
  const hasSearch = search.trim().length > 0;
  const hasSort = sortKey !== 'newest';
  const hasActiveFilters = hasDateFilter || hasSearch || hasSort || statusFilter !== 'all';

  const handleApplyFilters = () => {
    setSearch(draftSearch.trim());
    setStatusFilter(draftStatus);
    setFromDate(draftFrom);
    setToDate(draftTo);
    setPage(1);
  };

  const handleResetFilters = () => {
    setDraftSearch('');
    setDraftStatus('all');
    setDraftFrom('');
    setDraftTo('');
    setSearch('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setSortKey('newest');
    setPage(1);
  };

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const formatDateInput = (value: string) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="rw-mkt-app rw-orders-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="orders"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-orders-main">
        <nav className="rw-orders-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.MARKETPLACE.ROOT}>TRANG CHỦ</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link to={ROUTES.BUYER.ACCOUNT}>TÀI KHOẢN</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">ĐƠN HÀNG</span>
          <span className="rw-orders-vault">
            <ShieldCheck size={11} aria-hidden="true" />
            ESCROW VAULT: ACTIVE PROTECTION
          </span>
        </nav>
        <section className="rw-orders-head" aria-label="Tiêu đề trang đơn hàng">
          <div>
            <h1>
              Đơn hàng
              <span className="rw-orders-count">{BUYER_ORDERS.length} đơn hàng</span>
            </h1>
            <p>Theo dõi đơn hàng, thanh toán, giao hàng và trạng thái Escrow.</p>
          </div>
          <div className="rw-orders-head-actions">
            <button
              type="button"
              className="rw-orders-export"
              onClick={() => setToast('Đã xuất danh sách đơn (CSV) cho kỳ lọc hiện tại.')}
            >
              <Download size={14} aria-hidden="true" />
              Xuất danh sách đơn
            </button>
            <button
              type="button"
              className="rw-orders-escrow-check"
              onClick={() => setToast(`Escrow Vault: toàn bộ ${BUYER_ORDERS.length} đơn đang được bảo hộ Active Protection.`)}
            >
              <QrCode size={14} aria-hidden="true" />
              Đối soát ví Escrow
            </button>
          </div>
        </section>

        <section className="rw-orders-stats" aria-label="Tổng quan trạng thái đơn hàng">
          {ORDER_STAT_CARDS.map((card) => {
            const Icon = STAT_ICONS[card.icon];
            return (
              <button
                key={card.key}
                type="button"
                className={`rw-orders-stat${card.highlight ? ' is-highlight' : ''}${statusFilter === card.key ? ' is-active' : ''}`}
                onClick={() => {
                  const next = (card.key === 'all' ? 'all' : card.key) as OrderStatusFilter;
                  setStatusFilter(next);
                  setDraftStatus(next);
                  setPage(1);
                }}
                aria-pressed={statusFilter === card.key}
              >
                <span className="rw-orders-stat-top">
                  <small>{card.label}</small>
                  <span className="rw-orders-stat-icon" aria-hidden="true"><Icon size={13} /></span>
                </span>
                <b>{card.value}</b>
                <span className="rw-orders-stat-note">
                  <i className="rw-orders-stat-dot" aria-hidden="true" />
                  {card.note}
                </span>
              </button>
            );
          })}
        </section>
        <section className="rw-orders-filters" aria-label="Bộ lọc đơn hàng">
          <label className="rw-orders-search">
            <Search size={14} aria-hidden="true" />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleApplyFilters();
              }}
              placeholder="Tìm mã đơn hàng, sản phẩm hoặc người"
              aria-label="Tìm mã đơn hàng, sản phẩm hoặc người bán"
            />
          </label>
          <label className="rw-orders-select">
            <ListFilter size={13} aria-hidden="true" />
            <select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value as OrderStatusFilter)}
              aria-label="Lọc theo trạng thái"
            >
              {ORDER_STATUS_FILTERS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="rw-orders-dates" aria-label="Lọc theo khoảng ngày">
            <CalendarDays size={13} aria-hidden="true" />
            <input
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(event) => setDraftFrom(event.target.value)}
              aria-label="Từ ngày"
            />
            <span aria-hidden="true">–</span>
            <input
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(event) => setDraftTo(event.target.value)}
              aria-label="Đến ngày"
            />
          </label>
          <label className="rw-orders-select rw-orders-sort">
            <ArrowDownWideNarrow size={13} aria-hidden="true" />
            <select
              value={sortKey}
              onChange={(event) => {
                setSortKey(event.target.value as OrderSortKey);
                setPage(1);
              }}
              aria-label="Sắp xếp đơn hàng"
            >
              {ORDER_SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className="rw-orders-apply" onClick={handleApplyFilters}>
            <BadgeCheck size={13} aria-hidden="true" />
            Áp dụng
          </button>
        </section>

        <p className="rw-orders-active-filters" aria-live="polite">
          <span className="rw-orders-active-label">ĐANG ÁP DỤNG:</span>
          {hasDateFilter && (
            <span className="rw-orders-chip">
              Kỳ thanh toán: {formatDateInput(fromDate) || '…'} - {formatDateInput(toDate) || '…'}
              <button
                type="button"
                aria-label="Xóa lọc ngày"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setDraftFrom('');
                  setDraftTo('');
                  setPage(1);
                }}
              >
                ×
              </button>
            </span>
          )}
          <span className="rw-orders-chip">
            Trạng thái: {activeStatusLabel}
            <button
              type="button"
              aria-label="Xóa lọc trạng thái"
              onClick={() => {
                setStatusFilter('all');
                setDraftStatus('all');
                setPage(1);
              }}
            >
              ×
            </button>
          </span>
          {hasSearch && (
            <span className="rw-orders-chip">
              Từ khóa: {search}
              <button
                type="button"
                aria-label="Xóa từ khóa"
                onClick={() => {
                  setSearch('');
                  setDraftSearch('');
                  setPage(1);
                }}
              >
                ×
              </button>
            </span>
          )}
          {hasSort && (
            <span className="rw-orders-chip">
              Sắp xếp: {activeSortLabel}
              <button
                type="button"
                aria-label="Xóa sắp xếp"
                onClick={() => {
                  setSortKey('newest');
                  setPage(1);
                }}
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            className="rw-orders-reset"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
          >
            <RotateCcw size={11} aria-hidden="true" />
            Đặt lại bộ lọc
          </button>
        </p>
        <section className="rw-orders-table-card" aria-label="Danh sách đơn hàng">
          <div className="rw-orders-table-wrap">
            <table className="rw-orders-table">
              <thead>
                <tr>
                  <th scope="col">MÃ ĐƠN HÀNG</th>
                  <th scope="col">SẢN PHẨM</th>
                  <th scope="col">NGƯỜI BÁN</th>
                  <th scope="col">NGÀY ĐẶT</th>
                  <th scope="col">TỔNG TIỀN</th>
                  <th scope="col">THANH TOÁN</th>
                  <th scope="col">TRẠNG THÁI</th>
                  <th scope="col">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((order: BuyerOrder) => {
                  const status = ORDER_STATUS_META[order.status];
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="rw-orders-id" title={order.id}>{order.id}</span>
                        <span className="rw-orders-date">{order.dateLabel}</span>
                      </td>
                      <td>
                        <span className="rw-orders-product">
                          <img src={order.productImage} alt={order.productTitle} />
                          <span>
                            <b title={order.productTitle}>{order.productTitle}</b>
                            <small title={order.productMeta}>{order.productMeta}</small>
                            <span className="rw-orders-ai">AI {order.aiScore}%</span>
                          </span>
                        </span>
                      </td>
                      <td>
                        <span className="rw-orders-seller">
                          <b title={order.sellerHandle}>{order.sellerHandle}</b>
                          <small>
                            <Star size={10} aria-hidden="true" />
                            {order.sellerRating.toFixed(1)} · {order.sellerOrderCount} đơn
                          </small>
                        </span>
                      </td>
                      <td>
                        <span className="rw-orders-placed">
                          <b>{order.dateLabel}</b>
                          <small>{order.timeLabel}</small>
                        </span>
                      </td>
                      <td><b className="rw-orders-total">{formatPrice(order.total)} đ</b></td>
                      <td>
                        <span className="rw-orders-pay">
                          <span className="rw-orders-pay-method">
                            <QrCode size={12} aria-hidden="true" />
                            {order.payMethod}
                          </span>
                          <small>{order.payState}</small>
                        </span>
                      </td>
                      <td>
                        <span className={`rw-orders-status ${status.className}`} title={status.label}>
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="rw-orders-detail"
                          onClick={() =>
                            navigate(ROUTES.BUYER.ORDER_DETAIL.replace(':orderId', order.id))
                          }
                        >
                          <Eye size={12} aria-hidden="true" />
                          <span>Xem chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {pageOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="rw-orders-empty">
                      Không tìm thấy đơn hàng nào khớp bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="rw-orders-pagination">
            <span>Hiển thị {rangeFrom}–{rangeTo} trong {filteredOrders.length} đơn hàng</span>
            <div className="rw-orders-pages" role="navigation" aria-label="Phân trang đơn hàng">
              <button
                type="button"
                aria-label="Trang trước"
                disabled={safePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={13} aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === safePage ? 'is-current' : ''}
                  aria-current={pageNumber === safePage ? 'page' : undefined}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                aria-label="Trang sau"
                disabled={safePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <p className="rw-orders-assurance">
          Tất cả các đơn giao dịch được ReWear AI bảo lưu mã hoá bất biến trên cơ sở dữ liệu từ bảo mật chuẩn ISO/IEC 27001.
          Hỗ trợ khiếu nại tài chính hoặc đối soát giao ngân:
          <Link to={ROUTES.BUYER.MESSAGES}> Trung tâm Hỗ trợ Thanh toán</Link>
        </p>
        {/* __ORDERS_PAGE_PART3D__ */}
      </main>

      {toast && (
        <div className="rw-orders-toast" role="status" aria-live="polite">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <MarketplaceFooter />
    </div>
  );
};

export default BuyerOrdersPage;

