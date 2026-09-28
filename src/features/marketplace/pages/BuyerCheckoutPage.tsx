import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  ChevronRight,
  CircleCheck,
  Clock,
  CreditCard,
  Fingerprint,
  Info,
  LockKeyhole,
  MapPin,
  Pencil,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Video,
  X,
  Zap,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import { BUYER_PRODUCTS } from '../data/marketplace.data';
import { ESCROW_SESSION_CODE, ESCROW_SHIPPING_FEE } from '../data/escrow.data';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/CheckoutPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

/** Thời gian giữ hàng khởi điểm theo tham chiếu (09:41). */
const HOLD_SECONDS = 9 * 60 + 41;

const formatCountdown = (total: number) => {
  const safe = Math.max(0, total);
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * Trang Xác nhận đơn hàng & Giữ hàng — mở từ nút "Đặt hàng ngay" trong Hộp thư.
 * Thiết kế giao diện Escrow FinTech hiện đại, uy tín và bảo mật cao.
 */
const BuyerCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = storage.getItem<{ name?: string }>('rewear_current_user');

  const [remaining, setRemaining] = useState(HOLD_SECONDS);
  const [voucher, setVoucher] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [payTab, setPayTab] = useState<'vietqr' | 'vnd'>('vietqr');
  const [toast, setToast] = useState<string | null>(null);

  // Address edit modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState<DeliveryAddress>({
    fullName: user?.name?.trim() || 'Nguyễn Văn A',
    phone: '0908 123 456',
    address: 'Căn hộ 14.02, Tháp B, Chung cư Sài Gòn Pearl, 92 Nguyễn Hữu Cảnh, Phường 22',
    city: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
  });
  const [tempAddress, setTempAddress] = useState<DeliveryAddress>(addressData);

  const product = useMemo(() => {
    const jordan = BUYER_PRODUCTS.find((item) => item.id === 'BP-1002');
    return jordan ?? BUYER_PRODUCTS[0];
  }, []);

  const total = Math.max(0, product.price + ESCROW_SHIPPING_FEE - appliedDiscount);

  /** Mã phiên đối soát Escrow dùng chung với trang Thanh toán VietQR. */
  const orderCode = ESCROW_SESSION_CODE;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucher.trim().toUpperCase();
    if (!code) {
      setToast('Vui lòng nhập mã giảm giá.');
      return;
    }
    if (code === 'REWEAR_WELCOME' || code === 'REWEAR10') {
      setAppliedDiscount(45000);
      setToast(`Áp dụng thành công mã ${code}: Miễn phí vận chuyển -45.000 đ!`);
    } else if (code === 'VIP50') {
      setAppliedDiscount(50000);
      setToast(`Áp dụng thành công mã VIP50: Giảm -50.000 đ!`);
    } else {
      setToast(`Mã ưu đãi "${code}" không hợp lệ hoặc đã hết lượt.`);
    }
  };

  const handleRenewHold = () => {
    setRemaining(HOLD_SECONDS);
    setToast('Đã gia hạn thời gian khóa sản phẩm thêm 10 phút.');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressData(tempAddress);
    setIsAddressModalOpen(false);
    setToast('Đã cập nhật địa chỉ giao nhận bảo chứng.');
  };

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const isHoldExpired = remaining <= 0;
  const isHoldUrgent = remaining > 0 && remaining <= 120; // Dưới 2 phút

  /** Mở cổng thanh toán VietQR Smart-Escrow (/escrow/payment) và truyền dữ liệu phiên ký quỹ. */
  const handleGoToPayment = () => {
    if (isHoldExpired) {
      setToast('Đơn hàng đã hết thời gian giữ chỗ. Vui lòng gia hạn để tiếp tục.');
      return;
    }
    navigate(ROUTES.ESCROW.PAYMENT, { state: { total, remaining } });
  };

  return (
    <div className="rw-mkt-app rw-checkout-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="orders"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-co-main">
        <nav className="rw-co-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.MARKETPLACE.ROOT}>SẢN PHẨM</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <Link to={`${ROUTES.MARKETPLACE.ROOT}/product/${product.id}`}>
            NIKE AIR JORDAN 1 RETRO
          </Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">XÁC NHẬN ĐƠN HÀNG</span>
        </nav>

        <header className="rw-co-head">
          <div className="rw-co-head-copy">
            <p className="rw-co-eyebrow">
              <span className="rw-co-pulse-dot" aria-hidden="true" /> GIAO THỨC BẢO CHỨNG REWEAR AI SMART-ESCROW
            </p>
            <h1>Xác nhận đơn hàng &amp; Giữ hàng</h1>
            <p className="rw-co-sub">
              Sản phẩm được khóa tạm thời độc quyền cho bạn. Khoản thanh toán sẽ được ủy thác ký
              quỹ an toàn 100%, bảo đảm người bán chỉ nhận tiền sau khi bạn đối chiếu chuẩn xác.
            </p>
          </div>
          <div className="rw-co-vietqr-badge">
            <span className="rw-co-vietqr-icon"><ShieldCheck size={18} aria-hidden="true" /></span>
            <div className="rw-co-vietqr-badge-text">
              <div className="rw-co-vietqr-tag">
                <b>VietQR Smart-Escrow</b>
                <span className="rw-co-pill-secure">Live 256-bit</span>
              </div>
              <small>Bảo toàn tiền nạp trong tài khoản ký quỹ 48h</small>
            </div>
          </div>
        </header>

        {/* ── Banner Giữ Hàng Tương Tác ── */}
        <section
          className={`rw-co-hold ${isHoldExpired ? 'is-expired' : ''} ${
            isHoldUrgent ? 'is-urgent' : ''
          }`}
          aria-label="Trạng thái giữ hàng"
        >
          <div className="rw-co-hold-icon-wrap">
            <span className="rw-co-hold-icon">
              {isHoldExpired ? (
                <RotateCcw size={22} aria-hidden="true" />
              ) : (
                <LockKeyhole size={22} aria-hidden="true" />
              )}
            </span>
          </div>

          <div className="rw-co-hold-copy">
            <div className="rw-co-hold-title">
              <b>
                {isHoldExpired
                  ? 'Thời gian giữ hàng đã hết hiệu lực'
                  : 'Đang khóa sản phẩm độc quyền cho bạn'}
              </b>
              <span className="rw-co-hold-badge">
                <Sparkles size={11} aria-hidden="true" />
                {isHoldExpired ? 'CẦN GIA HẠN ĐỂ GIỮ CHỖ' : 'ƯU TIÊN THANH TOÁN 10 PHÚT'}
              </span>
            </div>
            <p>
              {isHoldExpired
                ? 'Sản phẩm đã được mở lại cho người mua khác trên sàn giao dịch. Hãy bấm "Gia hạn thêm" ngay để tiếp tục khóa sản phẩm độc quyền.'
                : 'Sản phẩm được bảo vệ trong két ký quỹ AI. Không ai có thể đặt mua kiện hàng này trong thời gian bạn tiến hành thanh toán.'}
            </p>
          </div>

          <div className="rw-co-hold-timer-card">
            <div className="rw-co-hold-timer-head">
              <Clock size={12} aria-hidden="true" />
              <span>THỜI GIAN CÒN LẠI</span>
            </div>
            <strong className="rw-co-hold-digits">{formatCountdown(remaining)}</strong>
            {isHoldExpired ? (
              <button
                type="button"
                className="rw-co-btn-renew"
                onClick={handleRenewHold}
              >
                <RotateCcw size={12} aria-hidden="true" /> Gia hạn lại 10:00
              </button>
            ) : (
              <small>Tự động nhả khóa khi về 00:00</small>
            )}
          </div>
        </section>

        <div
          className={`rw-co-hold-progress ${isHoldExpired ? 'is-expired' : ''} ${
            isHoldUrgent ? 'is-urgent' : ''
          }`}
          role="progressbar"
          aria-valuenow={Math.round((remaining / HOLD_SECONDS) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Thời gian giữ hàng"
        >
          <i style={{ width: `${(remaining / HOLD_SECONDS) * 100}%` }} />
        </div>

        <div className="rw-co-grid">
          {/* ════════ Cột trái: Kiện hàng + Giao nhận + Anti-swap ════════ */}
          <div className="rw-co-col">
            {/* Thẻ chi tiết kiện hàng */}
            <section className="rw-co-card">
              <div className="rw-co-card-head">
                <div className="rw-co-card-title-group">
                  <span className="rw-co-card-icon-bullet" aria-hidden="true" />
                  <h2>Chi tiết kiện hàng lưu trữ</h2>
                </div>
                <div className="rw-co-card-action-tags">
                  <span className="rw-co-sku-chip">SKU: {product.sku ?? product.id}</span>
                  <span className="rw-co-status-chip">Đã niêm phong kho</span>
                </div>
              </div>

              <div className="rw-co-product">
                <div className="rw-co-product-media">
                  <img src={product.image} alt={product.title} />
                  <span className="rw-co-ai-watermark">
                    <Fingerprint size={10} aria-hidden="true" /> AI SCAN #AJ1
                  </span>
                </div>

                <div className="rw-co-product-info">
                  <div className="rw-co-product-brand-row">
                    <span className="rw-co-product-brand">NIKE ARCHIVE COLLECTION</span>
                    <span className="rw-co-tag-rarity">Bản sưu tầm chọn lọc</span>
                  </div>
                  <h3>{product.title}</h3>

                  <div className="rw-co-specs">
                    <span className="rw-co-spec-badge">
                      <b>Size:</b> {product.size} EU
                    </span>
                    <span className="rw-co-spec-badge">
                      <b>Màu sắc:</b> Black / White / Red
                    </span>
                    <span className="rw-co-spec-badge rw-co-spec-condition">
                      <b>Tình trạng:</b> Like New (9.8/10)
                    </span>
                  </div>

                  <div className="rw-co-product-highlights">
                    <div className="rw-co-ai-score-badge">
                      <Sparkles size={13} aria-hidden="true" />
                      <span>Độ tin cậy AI: <b>{product.aiScore}% Chuẩn hãng</b></span>
                    </div>
                    <span className="rw-co-optical-badge">
                      <CircleCheck size={12} aria-hidden="true" /> Optical Match 9.8
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin người bán & Cấp bậc tín nhiệm */}
              <div className="rw-co-seller-row">
                <div className="rw-co-seller-info">
                  <div className="rw-co-seller-avatar">
                    <img src={buyerAvatar} alt={product.sellerHandle} />
                  </div>
                  <div>
                    <div className="rw-co-seller-title">
                      <span>Người bán:</span> <b>{product.sellerHandle}</b>
                    </div>
                    <small>Tham gia ReWear 18 tháng • 142 giao dịch an toàn</small>
                  </div>
                </div>
                <div className="rw-co-tier-tag">
                  <Award size={14} aria-hidden="true" />
                  <span>Hiệu uy tín Cấp 2 • Đã xác thực CCCD</span>
                </div>
              </div>
            </section>

            {/* Thẻ thông tin giao nhận bảo chứng */}
            <section className="rw-co-card">
              <div className="rw-co-card-head">
                <div className="rw-co-card-title-group">
                  <span className="rw-co-card-icon-bullet" aria-hidden="true" />
                  <h2>Thông tin giao nhận bảo chứng</h2>
                </div>
                <button
                  type="button"
                  className="rw-co-edit-link"
                  onClick={() => {
                    setTempAddress(addressData);
                    setIsAddressModalOpen(true);
                  }}
                >
                  <Pencil size={12} aria-hidden="true" /> Thay đổi địa chỉ
                </button>
              </div>

              <div className="rw-co-fields">
                <div className="rw-co-field">
                  <span className="rw-co-field-label">NGƯỜI NHẬN HÀNG</span>
                  <b className="rw-co-field-value">{addressData.fullName}</b>
                  <small className="rw-co-field-note rw-co-note-ok">
                    <CircleCheck size={11} aria-hidden="true" /> Đã liên kết tài khoản ReWear ID
                  </small>
                </div>

                <div className="rw-co-field">
                  <span className="rw-co-field-label">SỐ ĐIỆN THOẠI LIÊN LẠC</span>
                  <b className="rw-co-field-value">{addressData.phone}</b>
                  <small className="rw-co-field-note rw-co-note-flash">
                    <Zap size={11} aria-hidden="true" /> Xác nhận OTP khi giao tận tay
                  </small>
                </div>

                <div className="rw-co-field rw-co-field-wide">
                  <span className="rw-co-field-label">ĐỊA CHỈ NHẬN HÀNG BẢO ĐẢM</span>
                  <div className="rw-co-address-content">
                    <MapPin size={16} className="rw-co-pin-icon" aria-hidden="true" />
                    <div>
                      <b className="rw-co-field-value">{addressData.address}</b>
                      <span className="rw-co-city-text">{addressData.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rw-co-delivery-box">
                <div className="rw-co-delivery-icon">
                  <Truck size={18} aria-hidden="true" />
                </div>
                <div className="rw-co-delivery-copy">
                  <div className="rw-co-delivery-title">
                    <b>Vận chuyển bảo đảm ReWear Security Express</b>
                    <span className="rw-co-free-pill">Bảo hiểm 100% giá trị kiện</span>
                  </div>
                  <p>Nhân viên đeo camera kép giám sát suốt quá trình bàn giao tem niêm phong seal.</p>
                </div>
                <div className="rw-co-delivery-eta">
                  <span>Dự kiến phát hàng:</span>
                  <strong>24h – 48h</strong>
                </div>
              </div>
            </section>

            {/* Thẻ quy chuẩn chống tráo hàng (Anti-Swap Protocol) */}
            <section className="rw-co-card rw-co-antiswap-card">
              <div className="rw-co-card-head">
                <div className="rw-co-card-title-group">
                  <span className="rw-co-card-icon-bullet" aria-hidden="true" />
                  <h2>Quy chuẩn chống tráo hàng (Anti-Swap Protocol)</h2>
                </div>
                <span className="rw-co-sha-tag">
                  <Fingerprint size={12} aria-hidden="true" /> SHA-256 DIGITAL LOCK
                </span>
              </div>

              <p className="rw-co-anti-desc">
                Mỗi kiện hàng rời kho đều được niêm phong bằng tem QR số hóa và thẻ cảm biến NFC
                duy nhất. Người mua quét tem để đối chiếu mã bưu phẩm và kiểm tra video kiểm định gốc
                trước khi ký biên bản tiếp nhận.
              </p>

              <div className="rw-co-anti-grid">
                <div className="rw-co-anti-item">
                  <div className="rw-co-anti-badge">
                    <Fingerprint size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <b>Seal &amp; Khóa NFC nguyên vẹn</b>
                    <small>Mã hóa chuỗi khối không thể làm giả</small>
                  </div>
                </div>

                <div className="rw-co-anti-item">
                  <div className="rw-co-anti-badge">
                    <Video size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <b>Video đóng gói đối chứng</b>
                    <small>Lưu trữ trên máy chủ kiểm định 30 ngày</small>
                  </div>
                </div>

                <div className="rw-co-anti-item">
                  <div className="rw-co-anti-badge">
                    <Clock size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <b>48 giờ thử và đối chiếu</b>
                    <small>Hoàn tiền ngay nếu hàng sai lệch mô tả</small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ════════ Cột phải: Chi tiết thanh toán & Ký quỹ ════════ */}
          <aside className="rw-co-col" aria-label="Chi tiết thanh toán">
            <section className="rw-co-card rw-co-pay">
              <div className="rw-co-card-head">
                <div className="rw-co-card-title-group">
                  <span className="rw-co-card-icon-bullet" aria-hidden="true" />
                  <h2>Phương thức thanh toán</h2>
                </div>
                <span className="rw-co-order-code">Mã: {orderCode}</span>
              </div>

              {/* Tabs chọn phương thức */}
              <div className="rw-co-tabs" role="tablist" aria-label="Phương thức thanh toán">
                <button
                  type="button"
                  role="tab"
                  aria-selected={payTab === 'vietqr'}
                  className={payTab === 'vietqr' ? 'active' : ''}
                  onClick={() => setPayTab('vietqr')}
                >
                  <QrCode size={14} aria-hidden="true" />
                  <span>VIETQR SMART-ESCROW</span>
                  <em className="rw-co-tab-badge">Khuyên dùng</em>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={payTab === 'vnd'}
                  className={payTab === 'vnd' ? 'active' : ''}
                  onClick={() => setPayTab('vnd')}
                >
                  <CreditCard size={14} aria-hidden="true" />
                  <span>VÍ REWEAR / TIỀN MẶT</span>
                </button>
              </div>

              {/* Bảng chi tiết giá */}
              <div className="rw-co-price-breakdown">
                <div className="rw-co-price-row">
                  <span className="rw-co-price-label">Giá niêm yết sản phẩm</span>
                  <span className="rw-co-price-value">{formatPrice(product.price)} đ</span>
                </div>

                <div className="rw-co-price-row">
                  <span className="rw-co-price-label">Phí vận chuyển bảo đảm</span>
                  <span className="rw-co-price-value">{formatPrice(ESCROW_SHIPPING_FEE)} đ</span>
                </div>

                <div className="rw-co-price-row">
                  <span className="rw-co-price-label">
                    Bảo hiểm Escrow &amp; Kiểm định AI quang học
                    <Info size={13} className="rw-co-info-icon" aria-hidden="true" />
                  </span>
                  <span className="rw-co-price-free">
                    <span className="rw-co-free-pill">Hệ thống đài thọ 100%</span>
                    <b>0 đ</b>
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="rw-co-price-row rw-co-discount-row">
                    <span className="rw-co-price-label">Ưu đãi giảm giá đã áp dụng</span>
                    <span className="rw-co-discount-val">-{formatPrice(appliedDiscount)} đ</span>
                  </div>
                )}
              </div>

              {/* Form mã voucher */}
              <div className="rw-co-voucher-section">
                <label htmlFor="checkout-voucher" className="rw-co-voucher-label">
                  MÃ GIẢM GIÁ / VOUCHER BẢO LƯU
                </label>
                <form className="rw-co-voucher" onSubmit={handleApplyVoucher}>
                  <input
                    id="checkout-voucher"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    placeholder="Nhập REWEAR_WELCOME hoặc VIP50..."
                    aria-label="Mã giảm giá"
                  />
                  <button type="submit">Áp dụng</button>
                </form>

                <div className="rw-co-voucher-tags">
                  <span className="rw-co-quick-code-hint">Gợi ý:</span>
                  <button
                    type="button"
                    className="rw-co-code-pill"
                    onClick={() => {
                      setVoucher('REWEAR_WELCOME');
                      setAppliedDiscount(45000);
                      setToast('Đã áp dụng mã REWEAR_WELCOME (-45.000 đ freeship)');
                    }}
                  >
                    REWEAR_WELCOME (-45K)
                  </button>
                  <button
                    type="button"
                    className="rw-co-code-pill"
                    onClick={() => {
                      setVoucher('VIP50');
                      setAppliedDiscount(50000);
                      setToast('Đã áp dụng mã VIP50 (-50.000 đ)');
                    }}
                  >
                    VIP50 (-50K)
                  </button>
                </div>
              </div>

              {/* Khối tổng số tiền */}
              <div className="rw-co-total">
                <div className="rw-co-total-copy">
                  <b>Tổng thanh toán ký quỹ</b>
                  <small>Đã bao gồm VAT &amp; bảo hiểm toàn diện bưu kiện</small>
                </div>
                <div className="rw-co-total-amount">
                  <strong>{formatPrice(total)} đ</strong>
                </div>
              </div>

              {/* Hộp giải thích ký quỹ Escrow */}
              <div className="rw-co-escrow-box">
                <div className="rw-co-escrow-box-head">
                  <ShieldCheck size={17} aria-hidden="true" />
                  <b>Cam kết Bảo vệ Ký quỹ ReWear Escrow</b>
                </div>
                <p>
                  Toàn bộ số tiền <b>{formatPrice(total)} đ</b> được giữ an toàn tại tài khoản ủy thác
                  ngân hàng liên kết ReWear AI. Người bán hoàn toàn <b>không thể rút tiền</b> cho đến khi
                  bạn nhận hàng, quét tem kiểm định và xác nhận hài lòng trong vòng 48 giờ.
                </p>
              </div>

              {/* Nút thanh toán CTA → mở cổng thanh toán VietQR Smart-Escrow */}
              <button
                type="button"
                className={`rw-co-pay-btn ${isHoldExpired ? 'is-disabled' : ''}`}
                disabled={isHoldExpired}
                onClick={handleGoToPayment}
              >
                <QrCode size={18} aria-hidden="true" />
                <span>
                  {payTab === 'vietqr'
                    ? `Thanh toán VietQR Ký quỹ ngay (${formatPrice(total)} đ)`
                    : `Xác nhận đặt hàng ký quỹ (${formatPrice(total)} đ)`}
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>

              {/* Dẫn về trang sản phẩm */}
              <button
                type="button"
                className="rw-co-back"
                onClick={() => navigate(`${ROUTES.MARKETPLACE.ROOT}/product/${product.id}`)}
              >
                ← Quay lại trang chi tiết sản phẩm
              </button>

              <div className="rw-co-ssl-badges">
                <span>
                  <LockKeyhole size={11} aria-hidden="true" /> 256-Bit SSL Encryption
                </span>
                <span className="rw-co-bullet-dot" />
                <span>PCI-DSS Level 1</span>
                <span className="rw-co-bullet-dot" />
                <span>Napas 247 Supported</span>
              </div>
            </section>
          </aside>
        </div>

        {/* ── Disclaimer chân trang ── */}
        <p className="rw-co-disclaimer">
          Khi nhấn &ldquo;Thanh toán VietQR Ký quỹ ngay&rdquo;, bạn đồng ý với Điều khoản Dịch vụ Ký
          quỹ và Quy chế giải quyết tranh chấp thông minh qua đối chiếu ảnh kiểm định AI của ReWear AI.
          Số tiền được giữ tại ngân hàng bảo lãnh và tự động hoàn trả nếu đơn hàng gặp sự cố.
        </p>
      </main>

      {/* ════════ MODAL THAY ĐỔI ĐỊA CHỈ GIAO NHẬN ════════ */}
      {isAddressModalOpen && (
        <div
          className="rw-co-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rw-co-addr-title"
        >
          <div className="rw-co-modal-card">
            <div className="rw-co-modal-header">
              <div className="rw-co-modal-title-wrap">
                <MapPin size={18} className="rw-co-modal-icon" aria-hidden="true" />
                <h3 id="rw-co-addr-title">Thay đổi thông tin giao nhận</h3>
              </div>
              <button
                type="button"
                className="rw-co-modal-close"
                onClick={() => setIsAddressModalOpen(false)}
                aria-label="Đóng cửa sổ"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="rw-co-modal-body">
              <div className="rw-co-form-group">
                <label htmlFor="addr-fullname">Họ tên người nhận *</label>
                <input
                  id="addr-fullname"
                  required
                  value={tempAddress.fullName}
                  onChange={(e) =>
                    setTempAddress((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="rw-co-form-group">
                <label htmlFor="addr-phone">Số điện thoại nhận mã OTP *</label>
                <input
                  id="addr-phone"
                  required
                  value={tempAddress.phone}
                  onChange={(e) =>
                    setTempAddress((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Ví dụ: 0908 123 456"
                />
              </div>

              <div className="rw-co-form-group">
                <label htmlFor="addr-detail">Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) *</label>
                <input
                  id="addr-detail"
                  required
                  value={tempAddress.address}
                  onChange={(e) =>
                    setTempAddress((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Ví dụ: Căn hộ 14.02, Tháp B, Chung cư Sài Gòn Pearl, 92 Nguyễn Hữu Cảnh"
                />
              </div>

              <div className="rw-co-form-group">
                <label htmlFor="addr-city">Quận/Huyện, Tỉnh/Thành phố *</label>
                <input
                  id="addr-city"
                  required
                  value={tempAddress.city}
                  onChange={(e) =>
                    setTempAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Ví dụ: Quận Bình Thạnh, TP. Hồ Chí Minh"
                />
              </div>

              <div className="rw-co-modal-footer">
                <button
                  type="button"
                  className="rw-co-btn-secondary"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="rw-co-btn-primary">
                  Lưu &amp; Áp dụng địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast thông báo nhanh */}
      {toast && (
        <div className="rw-co-toast" role="status" aria-live="polite">
          <Sparkles size={14} aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <MarketplaceFooter />
    </div>
  );
};

export default BuyerCheckoutPage;
