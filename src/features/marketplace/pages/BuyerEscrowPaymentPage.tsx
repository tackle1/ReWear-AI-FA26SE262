import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock,
  Copy,
  Info,
  Landmark,
  Lock,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Truck,
  WalletCards,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import {
  ESCROW_BENEFICIARY,
  ESCROW_DEFAULT_TOTAL,
  ESCROW_HOLD_SECONDS,
  ESCROW_PRODUCT,
  ESCROW_SESSION_CODE,
  ESCROW_SHIPPING_FEE,
  ESCROW_TRANSFER_CONTENT,
} from '../data/escrow.data';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/EscrowPaymentPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

const formatCountdown = (total: number) => {
  const safe = Math.max(0, total);
  const mm = String(Math.floor(safe / 60)).padStart(2, '0');
  const ss = String(safe % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const nowTime = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const nowDateLabel = () => {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

/** Trạng thái đối soát hiển thị ở khu vực webhook thời gian thực. */
type ReportTab = 'waiting' | 'confirming' | 'received';

const REPORT_TABS: { key: ReportTab; label: string }[] = [
  { key: 'waiting', label: 'Đang chờ quét' },
  { key: 'confirming', label: 'Đang xác nhận' },
  { key: 'received', label: 'Chưa nhận được' },
];

const REPORT_COPY: Record<ReportTab, { title: string; desc: string }> = {
  waiting: {
    title: 'Đang chờ quét mã VietQR...',
    desc: 'Hệ thống đang lắng nghe webhook ngân hàng Napas 24/7.',
  },
  confirming: {
    title: 'Đã ghi nhận xác nhận thanh toán...',
    desc: `Hệ thống đang đối soát giao dịch với cổng ${ESCROW_BENEFICIARY.bankShortName} Bank.`,
  },
  received: {
    title: 'Chưa nhận được khoản ký quỹ...',
    desc: 'Kiểm tra lại giao dịch trong App ngân hàng hoặc gọi hotline Escrow 1900-8888.',
  },
};

/**
 * Trang Thanh toán Escrow qua VietQR (/escrow/payment) — mở từ nút
 * "Thanh toán VietQR Ký quỹ ngay" ở trang Xác nhận đơn hàng & Giữ hàng.
 */
const BuyerEscrowPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = storage.getItem<{ name?: string }>('rewear_current_user');
  const routeState = (location.state ?? {}) as EscrowPaymentRouteState;

  const product = ESCROW_PRODUCT;
  const sessionCode = ESCROW_SESSION_CODE;

  const [total] = useState<number>(routeState.total ?? ESCROW_DEFAULT_TOTAL);
  const [remaining, setRemaining] = useState<number>(routeState.remaining ?? ESCROW_HOLD_SECONDS);
  const [activeTab, setActiveTab] = useState<ReportTab>('waiting');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isQrFailed, setIsQrFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const isExpired = remaining <= 0;
  const report = REPORT_COPY[activeTab];

  /** VietQR động: tự điền số tiền + nội dung chuyển khoản bắt buộc. */
  const vietQrDynamicUrl = useMemo(
    () =>
      `https://img.vietqr.io/image/970422-090812345678-compact2.png?amount=${total}&addInfo=${encodeURIComponent(
        ESCROW_TRANSFER_CONTENT
      )}&accountName=REWEAR%20AI%20ESCROW%20ACCOUNT`,
    [total]
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Đồng hồ đếm ngược thời gian tạm khóa đơn ký quỹ
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Mốc thời gian cổng đối soát (cập nhật mỗi 30 giây)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const gatewayTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setToast(`Đã sao chép: ${text}`);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRenewSession = () => {
    setRemaining(ESCROW_HOLD_SECONDS);
    setIsPaid(false);
    setActiveTab('waiting');
    setToast('Đã gia hạn phiên thanh toán ký quỹ thêm 10 phút.');
  };

  /** Xác nhận đã thanh toán: giữ vết đối soát rồi chuyển sang màn hình thành công. */
  const handleConfirmPaid = () => {
    setIsPaid(true);
    setActiveTab('confirming');
    setToast('Đã ghi nhận xác nhận! Hệ thống đang đối soát giao dịch ký quỹ.');
    const paidAt = `${nowTime()} – ${nowDateLabel()}`;
    window.setTimeout(() => navigate(ROUTES.ESCROW.SUCCESS, { state: { total, paidAt } }), 2400);
  };

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const copyIcon = (key: string) =>
    copiedKey === key ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />;

  return (
    <div className="rw-mkt-app rw-ep-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="orders"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-ep-main">
        <nav className="rw-ep-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.BUYER.ORDERS}>Đơn hàng</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="rw-ep-breadcrumb-code">#{sessionCode}</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">Thanh toán VietQR Escrow</span>
        </nav>

        <header className="rw-ep-head">
          <div className="rw-ep-head-copy">
            <p className="rw-ep-eyebrow">
              <span className="rw-ep-eyebrow-dot" aria-hidden="true" />
              CỔNG THANH TOÁN KÝ QUỸ TỪ ĐỒNG VIỆT
            </p>
            <h1>Thanh toán Escrow qua VietQR</h1>
            <p className="rw-ep-sub">
              Quét mã VietQR bằng bất kỳ ứng dụng ngân hàng nào để chuyển tiền vào tài khoản ký quỹ
              ReWear AI Escrow an toàn.
            </p>
          </div>

          <div className="rw-ep-session-card">
            <span className="rw-ep-session-icon" aria-hidden="true">
              <Landmark size={18} />
            </span>
            <span className="rw-ep-session-text">
              <small>MÃ PHIÊN ĐỐI SOÁT</small>
              <b>{sessionCode}</b>
            </span>
          </div>
        </header>

        <div className="rw-ep-grid">
          {/* ════════ Cột trái: tóm tắt đơn ký quỹ · quy trình · cam kết ════════ */}
          <div className="rw-ep-col">
            {/* Tóm tắt đơn hàng ký quỹ */}
            <section className="rw-ep-card">
              <div className="rw-ep-card-head">
                <h2 className="rw-ep-card-title">Tóm tắt đơn hàng ký quỹ</h2>
                <span className="rw-ep-lock-badge">TẠM KHÓA 10 PHÚT</span>
              </div>

              <div className="rw-ep-prod">
                <div className="rw-ep-prod-media">
                  <img src={product.image} alt={product.title} />
                </div>
                <div className="rw-ep-prod-info">
                  <span className="rw-ep-prod-verified">
                    <BadgeCheck size={12} aria-hidden="true" /> ĐÃ KIỂM ĐỊNH AI
                  </span>
                  <b className="rw-ep-prod-title">{product.title}</b>
                  <span className="rw-ep-prod-meta">Phối màu gốc 1985 Chicago • Độ mới 98%</span>
                  <span className="rw-ep-prod-sku">SKU: {product.sku ?? product.id}</span>
                </div>
                <div className="rw-ep-prod-price">{formatPrice(product.price)} đ</div>
              </div>

              <div className="rw-ep-lines">
                <div className="rw-ep-line">
                  <span className="rw-ep-line-label">Giá sản phẩm niêm yết</span>
                  <span className="rw-ep-line-value">{formatPrice(product.price)} đ</span>
                </div>
                <div className="rw-ep-line">
                  <span className="rw-ep-line-label">
                    <Truck size={12} aria-hidden="true" /> Vận chuyển có bảo hiểm 100%
                  </span>
                  <span className="rw-ep-line-value">{formatPrice(ESCROW_SHIPPING_FEE)} đ</span>
                </div>
                <div className="rw-ep-line">
                  <span className="rw-ep-line-label">
                    <CircleHelp size={12} aria-hidden="true" /> Phí bảo chứng ký quỹ (Escrow Fee)
                  </span>
                  <span className="rw-ep-line-free">Miễn phí</span>
                </div>
              </div>

              <div className="rw-ep-total">
                <span>Tổng thanh toán:</span>
                <strong>{formatPrice(total)} đ</strong>
              </div>
            </section>

            {/* Quy trình 4 bước đơn giản */}
            <section className="rw-ep-card">
              <h2 className="rw-ep-card-title">Quy trình 4 bước đơn giản</h2>
              <ol className="rw-ep-steps">
                <li className="rw-ep-step">
                  <span className="rw-ep-step-num">1</span>
                  <div className="rw-ep-step-body">
                    <b>Mở App Ngân hàng hoặc Ví điện tử</b>
                    <p>
                      Hỗ trợ 40+ ngân hàng: Vietcombank, MB, Techcombank, VPBank, MoMo, ZaloPay...
                    </p>
                  </div>
                </li>
                <li className="rw-ep-step">
                  <span className="rw-ep-step-num">2</span>
                  <div className="rw-ep-step-body">
                    <b>Quét mã VietQR bên phải</b>
                    <p>
                      Hệ thống tự động điền chính xác số tiền và mã đơn đối soát mà không cần nhập
                      tay.
                    </p>
                  </div>
                </li>
                <li className="rw-ep-step">
                  <span className="rw-ep-step-num">3</span>
                  <div className="rw-ep-step-body">
                    <b>Kiểm tra thông tin thụ hưởng</b>
                    <p>
                      Tên người nhận phải là <b>REWEAR AI ESCROW</b> với đúng số tiền{' '}
                      {formatPrice(total)} đ và bấm xác nhận bên dưới giao dịch.
                    </p>
                  </div>
                </li>
                <li className="rw-ep-step">
                  <span className="rw-ep-step-num">4</span>
                  <div className="rw-ep-step-body">
                    <b>Xác nhận chuyển khoản &amp; Hoàn tất</b>
                    <p>
                      Sau khi giao dịch thành công tại App ngân hàng, nhấn nút “Tôi đã thanh toán
                      thành công”.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* Cơ chế bảo lưu Escrow */}
            <section className="rw-ep-lock-card">
              <span className="rw-ep-lock-icon" aria-hidden="true">
                <Lock size={16} />
              </span>
              <div>
                <b>Cơ chế bảo lưu Escrow 100%</b>
                <p>
                  Khoản thanh toán của bạn được giữ an toàn tại tài khoản trung gian ký quỹ của đối
                  tác. Người bán chưa nhận được tiền cho tới khi bạn nhận đúng hàng, kiểm tra khớp
                  ảnh kiểm định quang học AI và bấm “Xác nhận nhận hàng”.
                </p>
              </div>
            </section>
          </div>

          {/* ════════ Cột phải: mã VietQR động · đối soát thời gian thực ════════ */}
          <div className="rw-ep-col">
            <section className="rw-ep-card rw-ep-qr-card">
              <div className="rw-ep-qr-head">
                <div className="rw-ep-qr-title-wrap">
                  <span className="rw-ep-qr-icon" aria-hidden="true">
                    <QrCode size={18} />
                  </span>
                  <div>
                    <b>Mã VietQR động tự động điền</b>
                    <small>Tương thích chuẩn Napas247 Quốc gia</small>
                  </div>
                </div>

                <div className="rw-ep-expiry">
                  <span className="rw-ep-expiry-row">
                    <Clock size={13} aria-hidden="true" />
                    <span>Hết hạn sau:</span>
                    <strong>{formatCountdown(remaining)}</strong>
                  </span>
                  <span
                    className="rw-ep-expiry-bar"
                    role="progressbar"
                    aria-valuenow={Math.round((remaining / ESCROW_HOLD_SECONDS) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Thời gian hiệu lực của mã VietQR"
                  >
                    <i style={{ width: `${(remaining / ESCROW_HOLD_SECONDS) * 100}%` }} />
                  </span>
                </div>
              </div>

              <div className="rw-ep-qr-body">
                {/* Cột mã QR */}
                <div className="rw-ep-qr-left">
                  <div className="rw-ep-qr-frame">
                    <div className="rw-ep-qr-frame-head">
                      <span className="rw-ep-vietqr-label">VietQR</span>
                      <span className="rw-ep-napas-pill">NAPAS 247</span>
                    </div>
                    {isQrFailed ? (
                      <span className="rw-ep-qr-fallback">
                        <QrCode size={56} aria-hidden="true" />
                      </span>
                    ) : (
                      <img
                        src={vietQrDynamicUrl}
                        alt="Mã QR thanh toán VietQR Escrow"
                        onError={() => setIsQrFailed(true)}
                      />
                    )}
                  </div>
                  <span className="rw-ep-qr-hint">
                    <i className="rw-ep-dot" aria-hidden="true" /> Tự động điền số tiền &amp; nội dung
                  </span>
                </div>

                {/* Cột chi tiết tài khoản thụ hưởng */}
                <div className="rw-ep-qr-right">
                  <span className="rw-ep-detail-label">CHI TIẾT TÀI KHOẢN KÝ QUỸ THỤ HƯỞNG</span>

                  <div className="rw-ep-detail-row">
                    <div className="rw-ep-detail-copy">
                      <span className="rw-ep-detail-label">Ngân hàng thụ hưởng</span>
                      <b className="rw-ep-detail-value">{ESCROW_BENEFICIARY.bankName}</b>
                      <small className="rw-ep-detail-sub">{ESCROW_BENEFICIARY.gatewayNote}</small>
                    </div>
                    <button
                      type="button"
                      className="rw-ep-icon-btn"
                      aria-label="Sao chép tên ngân hàng"
                      onClick={() => handleCopy(ESCROW_BENEFICIARY.bankName, 'bank')}
                    >
                      {copyIcon('bank')}
                    </button>
                  </div>

                  <div className="rw-ep-detail-row">
                    <div className="rw-ep-detail-copy">
                      <span className="rw-ep-detail-label">Tên chủ tài khoản</span>
                      <b className="rw-ep-detail-value">{ESCROW_BENEFICIARY.accountName}</b>
                    </div>
                    <button
                      type="button"
                      className="rw-ep-icon-btn"
                      aria-label="Sao chép tên chủ tài khoản"
                      onClick={() => handleCopy(ESCROW_BENEFICIARY.accountName, 'name')}
                    >
                      {copyIcon('name')}
                    </button>
                  </div>

                  <div className="rw-ep-detail-row rw-ep-detail-block">
                    <span className="rw-ep-detail-label">Số tài khoản Escrow</span>
                    <div className="rw-ep-copy-field">
                      <b>{ESCROW_BENEFICIARY.accountNumber}</b>
                      <button
                        type="button"
                        className="rw-ep-copy-btn"
                        onClick={() => handleCopy(ESCROW_BENEFICIARY.accountNumberRaw, 'acc')}
                      >
                        {copyIcon('acc')} Sao chép
                      </button>
                    </div>
                  </div>

                  <div className="rw-ep-detail-row rw-ep-detail-block">
                    <span className="rw-ep-detail-label">Số tiền chính xác</span>
                    <div className="rw-ep-copy-field">
                      <b>{formatPrice(total)} đ</b>
                      <button
                        type="button"
                        className="rw-ep-copy-btn"
                        onClick={() => handleCopy(formatPrice(total), 'amount')}
                      >
                        {copyIcon('amount')} Sao chép
                      </button>
                    </div>
                  </div>

                  <div className="rw-ep-required">
                    <div className="rw-ep-required-copy">
                      <span className="rw-ep-required-label">
                        <AlertTriangle size={12} aria-hidden="true" /> Nội dung chuyển khoản bắt buộc
                      </span>
                      <b>{ESCROW_TRANSFER_CONTENT}</b>
                    </div>
                    <button
                      type="button"
                      className="rw-ep-copy-code-btn"
                      onClick={() => handleCopy(ESCROW_TRANSFER_CONTENT, 'code')}
                    >
                      {copiedKey === 'code' ? (
                        <Check size={12} aria-hidden="true" />
                      ) : (
                        <Copy size={12} aria-hidden="true" />
                      )}
                      <span>Sao chép mã</span>
                    </button>
                  </div>
                </div>
              </div>

              <p className="rw-ep-note">
                <Info size={13} aria-hidden="true" />
                <span>
                  Lưu ý: Vui lòng giữ nguyên nội dung chuyển khoản{' '}
                  <b>{ESCROW_TRANSFER_CONTENT}</b> để hệ thống AI tự động khớp giao dịch và kích hoạt
                  đơn bảo chứng giao hàng.
                </span>
              </p>

              <div className="rw-ep-qr-foot">
                {isPaid ? (
                  <span className="rw-ep-paid" role="status">
                    <CircleCheck size={16} aria-hidden="true" />
                    Đã ghi nhận xác nhận ký quỹ — đang đối soát giao dịch...
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`rw-ep-pay-btn ${isExpired ? 'is-expired' : ''}`}
                      onClick={isExpired ? handleRenewSession : handleConfirmPaid}
                    >
                      {isExpired ? (
                        <>
                          <RefreshCw size={16} aria-hidden="true" />
                          <span>Phiên đã hết hạn — Gia hạn lại 10:00</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} aria-hidden="true" />
                          <span>Tôi đã thanh toán thành công</span>
                          <ArrowRight size={16} aria-hidden="true" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="rw-ep-cancel"
                      onClick={() => navigate(ROUTES.ESCROW.CHECKOUT)}
                    >
                      Hủy đơn giao dịch
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="rw-ep-status" aria-label="Trạng thái đối soát">
              <div className="rw-ep-status-head">
                <span className="rw-ep-status-title">
                  <ScanLine size={14} aria-hidden="true" /> Trạng thái đối soát thời gian thực
                </span>
                <div className="rw-ep-status-tabs" role="tablist" aria-label="Trạng thái đối soát">
                  {REPORT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      className={activeTab === tab.key ? 'active' : ''}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rw-ep-status-row">
                <span className="rw-ep-status-icon" aria-hidden="true">
                  <WalletCards size={15} />
                </span>
                <div className="rw-ep-status-copy">
                  <b>{report.title}</b>
                  <small>{report.desc}</small>
                </div>
                <span className="rw-ep-gateway">
                  Cổng: {ESCROW_BENEFICIARY.bankShortName} • {gatewayTime}
                </span>
              </div>
            </section>
          </div>
        </div>

        <p className="rw-ep-legal">
          <Info size={12} aria-hidden="true" />
          <span>
            Khoản tiền ký quỹ thuộc giao dịch thương mại trên hệ thống ReWear AI. Số tiền được bảo
            hiểm toàn phần cho đơn kiện nếu người mua xác nhận chất lượng thực tế. Mọi tranh cãi vui
            lòng liên hệ trung tâm hỗ trợ Escrow 24/7 (Hotline: 1900 - 8888).
          </span>
        </p>
      </main>

      {toast && (
        <div className="rw-ep-toast" role="status" aria-live="polite">
          <ShieldCheck size={14} aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      <MarketplaceFooter />
    </div>
  );
};

export default BuyerEscrowPaymentPage;


/** Dữ liệu truyền từ trang Xác nhận đơn hàng sang trang thanh toán. */
interface EscrowPaymentRouteState {
  total?: number;
  remaining?: number;
}
