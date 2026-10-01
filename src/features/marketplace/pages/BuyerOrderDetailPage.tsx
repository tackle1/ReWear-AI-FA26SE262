import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  Headset,
  Lock,
  MessageSquare,
  Package,
  PackageCheck,
  Pencil,
  QrCode,
  Receipt,
  Route,
  ScanEye,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  Store,
  Truck,
  User,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import {
  BUYER_ORDERS,
  ORDER_BUYER_INFO,
  ORDER_CURRENT_STAGE,
  ORDER_ESCROW_POLICY,
  ORDER_PAY_SUMMARY,
  ORDER_PRODUCT_INFO,
  ORDER_SELLER_INFO,
  ORDER_STATUS_META,
  ORDER_STATUS_STAGE,
  ORDER_STATUS_TIMELINE,
  ORDER_TIMELINE_LAYOUT,
} from '../data/orders.data';
import { ESCROW_SHIPPING_FEE } from '../data/escrow.data';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/OrderDetailPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

/** Dữ liệu người dùng đang đăng nhập, lưu ở localStorage sau khi login thành công. */
interface CurrentUser {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Ẩn phần giữa của số điện thoại: `0909123456` -> `09xxxxxxx`,
 * `0909 123 456` -> `09xxxxxxx`. Giữ nguyên chuỗi nếu không phải số Việt Nam.
 */
const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return phone || 'Chưa cập nhật';
  const prefix = digits.slice(0, 2);
  return `${prefix}${'x'.repeat(Math.max(digits.length - 2, 6))}`;
};

const BuyerOrderDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderId } = useParams<{ orderId: string }>();
  const user = storage.getItem<CurrentUser>('rewear_current_user');
  const [toast, setToast] = useState<string | null>(null);

  /* Thông tin người nhận lấy thẳng từ phiên đăng nhập — backend trả đủ
     fullName/phone/email nên không cần tra kho tài khoản giả lập nữa. */
  const buyerName = user?.name?.trim() || 'Chưa cập nhật';
  const buyerPhone = user?.phone?.trim() || '';
  const buyerEmail = user?.email?.trim() || '';

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const order = useMemo(
    () => BUYER_ORDERS.find((item) => item.id === orderId) ?? BUYER_ORDERS[0],
    [orderId],
  );

  const status = ORDER_STATUS_META[order.status];
  const listingPrice = Math.max(0, order.total - ESCROW_SHIPPING_FEE);
  const totalLabel = `${formatPrice(order.total)} ₫`;

  /** Khối "Mốc hiện tại": nội dung lấy theo trạng thái thật của đơn. */
  const stage = ORDER_STATUS_STAGE[order.status];
  const currentStageLabel = stage.label;
  const currentStageNote = stage.note
    .replace('{{amount}}', totalLabel)
    .replace('{{method}}', order.payMethod);

  /**
   * Timeline 6 bước. Bước đã qua dùng cờ `done`, bước đang diễn ra dùng `current`;
   * cả hai cờ suy ra từ `currentIndex` theo trạng thái đơn nên mỗi đơn hiện
   * đúng tiến độ của mình. Placeholder `{{date}}` / `{{time}}` được thay bằng dữ liệu thật.
   */
  const { currentIndex } = ORDER_STATUS_TIMELINE[order.status];
  /** `completed` đã qua cả 6 bước nên không còn bước nào "đang diễn ra". */
  const isTimelineFinished = order.status === 'completed';
  const timeline = ORDER_TIMELINE_LAYOUT.map((step) => {
    const done = step.index < currentIndex || isTimelineFinished;
    const current = step.index === currentIndex && !isTimelineFinished;
    return {
      ...step,
      done,
      current,
      // Bước đang diễn ra hiện nhãn "Hiện tại" đúng như hình tham chiếu.
      badge: current ? 'Hiện tại' : step.badge,
      time: step.time.replace('{{date}}', order.dateLabel).replace('{{time}}', order.timeLabel),
    };
  });

  /** Đơn chưa thanh toán thì không được coi là đã bảo lưu Escrow. */
  const isPaid = order.payState === 'Đã xác nhận';
  /** Thanh trạng thái thanh toán đổi theo `payState` thật của đơn. */
  const payStateText = isPaid
    ? ORDER_PAY_SUMMARY.paidState
        .replace('{{method}}', order.payMethod)
        .replace('{{state}}', order.payState.toLowerCase())
    : ORDER_PAY_SUMMARY.unpaidState.replace('{{method}}', order.payMethod);
  /** Nhãn trạng thái lưu ký quỹ theo từng đơn. */
  const escrowStateText = isPaid
    ? ORDER_PAY_SUMMARY.statusValue
    : 'Chờ thanh toán';
  /** Nhãn nút theo dõi: đơn đã xong thì hiện nút xem lại. */
  const trackButtonLabel = isTimelineFinished
    ? ORDER_PAY_SUMMARY.trackDoneLabel
    : ORDER_PAY_SUMMARY.trackLabel;

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const handleCopyCode = async () => {
    const code = order.id.replace(/-/g, '');
    try {
      await navigator.clipboard.writeText(code);
      setToast(`Đã sao chép mã đối soát: ${code}`);
    } catch {
      setToast(`Mã đối soát: ${code}`);
    }
  };

  return (
    <div className="rw-mkt-app rw-od-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="orders"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-od-main">
        <nav className="rw-od-breadcrumb" aria-label="Đường dẫn">
          <PackageCheck size={12} aria-hidden="true" />
          <Link to={ROUTES.BUYER.ORDERS}>ĐƠN HÀNG</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{order.id}</span>
        </nav>

        {/* ── Tiêu đề ── */}
        <header className="rw-od-head">
          <div className="rw-od-head-copy">
            <div className="rw-od-head-title-row">
              <h1>Chi tiết đơn hàng</h1>
              <span className={`rw-od-status-pill ${status.className}`}>
                <i aria-hidden="true" />
                <ShieldCheck size={11} aria-hidden="true" />
                {status.detailLabel}
              </span>
              <span className="rw-od-escrow-pill">
                <ShieldCheck size={11} aria-hidden="true" />
                Bảo chứng Escrow 100%
              </span>
            </div>
            <p>
              Bảo chứng giao dịch an toàn bởi ReWear Escrow — Thanh toán bị khóa 100% cho đến
              khi bạn xác nhận hàng.
            </p>
          </div>
          <div className="rw-od-head-actions">
            <button type="button" className="rw-od-back-btn" onClick={() => navigate(ROUTES.BUYER.ORDERS)}>
              <ArrowLeft size={13} aria-hidden="true" />
              Quay lại danh sách đơn
            </button>
            <button
              type="button"
              className="rw-od-share-btn"
              onClick={() => setToast('Đã sao chép liên kết chi tiết đơn hàng.')}
            >
              <Share2 size={13} aria-hidden="true" />
              Chia sẻ
            </button>
            <button
              type="button"
              className="rw-od-icon-btn"
              aria-label="Sao chép mã đơn hàng"
              onClick={handleCopyCode}
            >
              <Copy size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* ── Dải thông tin nhanh ── */}
        <section className="rw-od-infobar" aria-label="Thông tin tổng quan đơn hàng">
          <div className="rw-od-infobar-item">
            <small>MÃ ĐƠN HÀNG</small>
            <b>{order.id}</b>
          </div>
          <div className="rw-od-infobar-item">
            <small>NGÀY ĐẶT</small>
            <b>
              {order.dateLabel} - {order.timeLabel}
            </b>
          </div>
          <div className="rw-od-infobar-item">
            <small>PHƯƠNG THỨC</small>
            <b>{order.payMethod} / Ngân hàng MB</b>
          </div>
          <div className="rw-od-infobar-item">
            <small>TRẠNG THÁI</small>
            <b className={status.className}>{status.label} (Escrow)</b>
          </div>
        </section>

        <div className="rw-od-layout">
          {/* ════════ Cột trái ════════ */}
          <div className="rw-od-col rw-od-col-main">
            {/* ── Tiến trình vòng đời đơn hàng ── */}
            <section className="rw-od-card rw-od-track" aria-label="Tiến trình vòng đời đơn hàng">
              <div className="rw-od-card-head">
                <div className="rw-od-card-title-group">
                  <Route size={16} aria-hidden="true" />
                  <h2>Tiến trình vòng đời đơn hàng</h2>
                  <span className="rw-od-tag-blue">TRỰC TIẾP</span>
                </div>
                <div className="rw-od-card-head-tags">
                  <span className="rw-od-tag-green">
                    <i className="rw-od-tag-dot" aria-hidden="true" />
                    <ShieldCheck size={10} aria-hidden="true" />
                    Bảo đảm Escrow 100%
                  </span>
                </div>
              </div>
              <p className="rw-od-card-sub">
                Giám sát tự động &amp; bảo chứng 100% bằng cơ chế ReWear Smart-Escrow
              </p>

              <ol className="rw-od-timeline">
                {timeline.map((step) => (
                  <li
                    key={step.key}
                    className={`rw-od-timeline-step${step.done ? ' is-done' : ''}${
                      step.current ? ' is-current' : ''
                    }`}
                  >
                    <span className="rw-od-timeline-dot" aria-hidden="true">
                      {step.done ? (
                        <Check size={14} />
                      ) : step.key === 'escrow' ? (
                        <Lock size={13} />
                      ) : step.key === 'shipping' ? (
                        <Truck size={13} />
                      ) : step.key === 'completed' ? (
                        <ScanEye size={13} />
                      ) : (
                        <Package size={13} />
                      )}
                    </span>
                    <b className="rw-od-timeline-title">
                      {step.index}. {step.title}
                    </b>
                    <small className="rw-od-timeline-time">{step.time}</small>
                    <em className="rw-od-timeline-badge">{step.badge}</em>
                  </li>
                ))}
              </ol>

              <div className="rw-od-stage">
                <span className="rw-od-stage-icon" aria-hidden="true">
                  <BellRing size={15} />
                </span>
                <div className="rw-od-stage-text">
                  <b>Mốc hiện tại: {currentStageLabel}</b>
                  <p>{currentStageNote}</p>
                </div>
                <div className="rw-od-stage-actions">
                  <span className="rw-od-seal">
                    <QrCode size={10} aria-hidden="true" />
                    {ORDER_CURRENT_STAGE.sealLabel}
                  </span>
                  <button
                    type="button"
                    className="rw-od-stage-btn"
                    onClick={() =>
                      setToast(`Đã gửi yêu cầu cập nhật tới ${order.sellerHandle}.`)
                    }
                  >
                    <MessageSquare size={12} aria-hidden="true" />
                    {ORDER_CURRENT_STAGE.actionLabel}
                  </button>
                </div>
              </div>
            </section>
            {/* ── Sản phẩm ── */}
            <section className="rw-od-card rw-od-product" aria-label="Sản phẩm trong đơn hàng">
              <div className="rw-od-card-head">
                <div className="rw-od-card-title-group">
                  <ScanEye size={16} aria-hidden="true" />
                  <h2>{ORDER_PRODUCT_INFO.cardTitle}</h2>
                </div>
                <span className="rw-od-tag-blue">
                  <ShieldCheck size={10} aria-hidden="true" />
                  {ORDER_PRODUCT_INFO.cardBadge}
                </span>
              </div>
              <p className="rw-od-card-sub">{ORDER_PRODUCT_INFO.cardSubtitle}</p>

              <div className="rw-od-product-body">
                <div className="rw-od-product-media">
                  <img src={order.productImage} alt={order.productTitle} />
                  <span className="rw-od-product-badge">LIKE NEW (99%)</span>
                </div>
                <div className="rw-od-product-info">
                  <b className="rw-od-product-name">{order.productTitle} Chicago</b>
                  <span className="rw-od-product-sku">SKU: {ORDER_PRODUCT_INFO.sku}</span>
                  <p className="rw-od-product-meta">
                    Colorway: {ORDER_PRODUCT_INFO.colorway}
                    <i aria-hidden="true" />
                    Size: {ORDER_PRODUCT_INFO.sizeEu} / {ORDER_PRODUCT_INFO.sizeUs}
                    <br />
                    Tình trạng: {ORDER_PRODUCT_INFO.condition}
                  </p>
                  <span className="rw-od-product-ai">
                    <CheckCircle2 size={11} aria-hidden="true" />
                    Đạt tin cậy AI: {order.aiScore}% ({ORDER_PRODUCT_INFO.aiValidZones}/5 Vùng
                    quang học hợp lệ)
                  </span>
                  <button
                    type="button"
                    className="rw-od-product-link"
                    onClick={() => setToast('Đang mở trang sản phẩm...')}
                  >
                    <Eye size={11} aria-hidden="true" />
                    {ORDER_PRODUCT_INFO.detailLink}
                  </button>
                </div>
                <div className="rw-od-product-price">
                  <small>Số lượng: {ORDER_PRODUCT_INFO.quantity}</small>
                  <b>{formatPrice(listingPrice)} đ</b>
                </div>
              </div>
            </section>
            {/* ── Người mua & người bán ── */}
            <div className="rw-od-duo">
              <section className="rw-od-card rw-od-buyer" aria-label="Người nhận và vận chuyển">
                <div className="rw-od-card-head">
                  <div className="rw-od-card-title-group">
                    <Package size={16} aria-hidden="true" />
                    <h2>NGƯỜI NHẬN &amp; VẬN CHUYỂN</h2>
                  </div>
                  <span className="rw-od-tag-blue">
                    <Pencil size={10} aria-hidden="true" />
                    Thay đổi địa chỉ
                  </span>
                </div>

                <div className="rw-od-recipient">
                  <div className="rw-od-recipient-head">
                    <div>
                      <small className="rw-od-block-label">{ORDER_BUYER_INFO.deliveryLabel}</small>
                      <b>{buyerName}</b>
                    </div>
                    <span className="rw-od-recipient-status">
                      {ORDER_BUYER_INFO.contactAction}
                    </span>
                  </div>

                  <div className="rw-od-recipient-field">
                    <small className="rw-od-block-label">{ORDER_BUYER_INFO.phoneLabel}</small>
                    <b>{maskPhone(buyerPhone)}</b>
                  </div>

                  <div className="rw-od-recipient-field">
                    <small className="rw-od-block-label">{ORDER_BUYER_INFO.emailLabel}</small>
                    <b>{buyerEmail}</b>
                  </div>

                  <div className="rw-od-recipient-field">
                    <small className="rw-od-block-label">{ORDER_BUYER_INFO.addressLabel}</small>
                    <p>{ORDER_BUYER_INFO.address}</p>
                  </div>
                </div>

                <div className="rw-od-ship">
                  <b>
                    <Truck size={12} aria-hidden="true" />
                    {ORDER_BUYER_INFO.shippingTitle}
                  </b>
                  <p>{ORDER_BUYER_INFO.shippingNote}</p>
                </div>

                <div className="rw-od-warranty">
                  <ShieldCheck size={13} aria-hidden="true" />
                  <span>{ORDER_BUYER_INFO.warranty}</span>
                </div>
              </section>

              <section className="rw-od-card rw-od-seller" aria-label="Thông tin người bán">
                <div className="rw-od-card-head">
                  <div className="rw-od-card-title-group">
                    <Store size={16} aria-hidden="true" />
                    <h2>THÔNG TIN NGƯỜI BÁN</h2>
                  </div>
                  <span className="rw-od-tag-neutral">{ORDER_SELLER_INFO.tier}</span>
                </div>

                <div className="rw-od-block">
                  <div className="rw-od-seller-row">
                    <span className="rw-od-seller-avatar" aria-hidden="true">
                      <img src={buyerAvatar} alt="" />
                    </span>
                    <div className="rw-od-seller-meta">
                      <b>
                        {order.sellerHandle}
                        <BadgeCheck
                          size={12}
                          className="rw-od-seller-verified"
                          aria-label="Tài khoản đã xác thực"
                        />
                      </b>
                      <small>
                        <Star size={10} aria-hidden="true" />
                        {order.sellerRating.toFixed(1)} · {order.sellerOrderCount} đơn hàng
                        thành công
                      </small>
                    </div>
                  </div>
                </div>

                <div className="rw-od-block">
                  <div className="rw-od-block-row">
                    <small className="rw-od-block-label">{ORDER_SELLER_INFO.rateLabel}</small>
                    <b className="rw-od-block-value">{ORDER_SELLER_INFO.successRate}%</b>
                  </div>
                  <div
                    className="rw-od-progress"
                    role="img"
                    aria-label={`${ORDER_SELLER_INFO.rateLabel} ${ORDER_SELLER_INFO.successRate}%`}
                  >
                    <i style={{ width: `${ORDER_SELLER_INFO.successRate}%` }} />
                  </div>
                </div>

                <div className="rw-od-block">
                  <div className="rw-od-seller-actions">
                    <button
                      type="button"
                      className="rw-od-seller-btn is-primary"
                      onClick={() =>
                        setToast(`Đã gửi yêu cầu cập nhật tới ${order.sellerHandle}.`)
                      }
                    >
                      <MessageSquare size={12} aria-hidden="true" />
                      Nhận tin cho Seller
                    </button>
                    <button
                      type="button"
                      className="rw-od-seller-btn"
                      onClick={() => setToast('Đang mở hồ sơ người bán.')}
                    >
                      <User size={12} aria-hidden="true" />
                      Xem hồ sơ
                    </button>
                  </div>
                </div>

                <div className="rw-od-block">
                  <p className="rw-od-block-desc">
                    <QrCode size={12} aria-hidden="true" />
                    {ORDER_SELLER_INFO.commitment}
                  </p>
                </div>
              </section>
            </div>
          </div>
          {/* ════════ Cột phải: Tóm tắt thanh toán ════════ */}
          <aside className="rw-od-col rw-od-col-side" aria-label="Tóm tắt thanh toán">
            <section className="rw-od-card rw-od-pay">
              <div className="rw-od-card-head">
                <div className="rw-od-card-title-group">
                  <Receipt size={16} aria-hidden="true" />
                  <h2>Tóm tắt thanh toán</h2>
                </div>
                <span className="rw-od-tag-blue">{ORDER_PAY_SUMMARY.currencyLabel}</span>
              </div>

              <div className="rw-od-pay-lines">
                <div className="rw-od-pay-line">
                  <span>Giá sản phẩm (01 món)</span>
                  <b>{formatPrice(listingPrice)} ₫</b>
                </div>
                <div className="rw-od-pay-line">
                  <span>Phí vận chuyển tiêu chuẩn</span>
                  <b>{formatPrice(ESCROW_SHIPPING_FEE)} ₫</b>
                </div>
                <div className="rw-od-pay-line">
                  <span>Bảo hiểm Escrow &amp; AI</span>
                  <b className="is-free">{ORDER_PAY_SUMMARY.freeLabel}</b>
                </div>
                <div className="rw-od-pay-line">
                  <span>{ORDER_PAY_SUMMARY.methodLabel}</span>
                  <b className="is-blue">{ORDER_PAY_SUMMARY.method}</b>
                </div>
                <div className="rw-od-pay-line">
                  <span>{ORDER_PAY_SUMMARY.statusLabel}</span>
                  <b className="rw-od-pay-line-pill">{escrowStateText}</b>
                </div>
              </div>

              <div className="rw-od-pay-total">
                <span>{ORDER_PAY_SUMMARY.totalLabel}</span>
                <b>{formatPrice(order.total)} ₫</b>
              </div>

              <p className={`rw-od-pay-state${isPaid ? '' : ' is-unpaid'}`}>
                {isPaid ? (
                  <CheckCircle2 size={12} aria-hidden="true" />
                ) : (
                  <Clock size={12} aria-hidden="true" />
                )}
                {payStateText}
              </p>

              <div className="rw-od-escrow-note">
                <div className="rw-od-escrow-head">
                  <b>
                    <ShieldCheck size={13} aria-hidden="true" />
                    Bảo vệ Smart-Escrow
                  </b>
                  <span className="rw-od-tag-blue">An toàn 100%</span>
                </div>
                <p>
                  {ORDER_PAY_SUMMARY.escrowNote.replace(
                    '{{amount}}',
                    `${formatPrice(order.total)} ₫`,
                  )}
                </p>
                <div className="rw-od-receipt">
                  <span>{ORDER_PAY_SUMMARY.escrowPartnerLabel}</span>
                  <b>{ORDER_PAY_SUMMARY.escrowPartner}</b>
                </div>
              </div>

              <div className="rw-od-pay-actions">
                <button
                  type="button"
                  className="rw-od-pay-primary"
                  onClick={() =>
                    navigate(ROUTES.ESCROW.STATUS.replace(':orderId', order.id), {
                      state: { orderId: order.id },
                    })
                  }
                >
                  <Truck size={13} aria-hidden="true" />
                  {trackButtonLabel}
                </button>
                <button
                  type="button"
                  className="rw-od-pay-secondary"
                  onClick={() => navigate(ROUTES.BUYER.ORDERS)}
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  {ORDER_PAY_SUMMARY.backLabel}
                </button>
              </div>

              <p className="rw-od-pay-hold">{ORDER_PAY_SUMMARY.holdNotice}</p>
            </section>
          </aside>
        </div>
        {/* ── Chính sách cam kết đơn hàng ── */}
        <section className="rw-od-policy" aria-label="Chính sách cam kết đơn hàng ReWear.AI">
          <div className="rw-od-policy-copy">
            <b>
              <Shield size={14} aria-hidden="true" />
              {ORDER_ESCROW_POLICY.title}
            </b>
            <p>{ORDER_ESCROW_POLICY.body.replace('{{id}}', order.id)}</p>
          </div>
          <div className="rw-od-policy-actions">
            <button
              type="button"
              className="rw-od-back-btn"
              onClick={() => navigate(ROUTES.BUYER.ORDERS)}
            >
              <ArrowLeft size={13} aria-hidden="true" />
              {ORDER_ESCROW_POLICY.backLabel}
            </button>
            <button
              type="button"
              className="rw-od-pay-primary"
              onClick={() =>
                navigate(ROUTES.ESCROW.STATUS.replace(':orderId', order.id), {
                  state: { orderId: order.id },
                })
              }
            >
              <Package size={13} aria-hidden="true" />
              {ORDER_ESCROW_POLICY.trackLabel}
            </button>
          </div>
        </section>
      </main>

      {toast && (
        <div className="rw-od-toast" role="status" aria-live="polite">
          <Headset size={14} aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <MarketplaceFooter />
    </div>
  );
};

export default BuyerOrderDetailPage;
