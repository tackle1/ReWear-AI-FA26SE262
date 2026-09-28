import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Camera,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Headset,
  Info,
  Layers,
  Lock,
  MessageSquareText,
  Package,
  PackageCheck,
  Printer,
  QrCode,
  ShieldCheck,
  Timer,
  Truck,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import { ESCROW_PRODUCT, ESCROW_SESSION_CODE } from '../data/escrow.data';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/EscrowSuccessPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

type EscrowTimelineState = 'done' | 'current' | 'next';

interface EscrowTimelineStep {
  title: string;
  /** Giờ hoàn thành (bước xong) hoặc số thứ tự (bước sắp tới). Bước hiện tại bỏ trống. */
  time: string;
  detail: string;
  state: EscrowTimelineState;
  /** Nhãn nhỏ cạnh marker: "ĐANG XỬ LÝ" (bước hiện tại) hoặc "Dự kiến" (bước sắp tới). */
  badge?: string;
}

const ESCROW_TIMELINE: EscrowTimelineStep[] = [
  { title: 'Đơn hàng đã tạo', time: '09:58', detail: '#RW-20260917-001', state: 'done' },
  { title: 'VietQR xác nhận', time: '10:24', detail: '2.935.000 đ qua Napas', state: 'done' },
  { title: 'Khóa tiền Escrow', time: '10:25', detail: 'Giữ an toàn tại quỹ', state: 'done' },
  { title: 'Báo tin Seller', time: '10:25', detail: '@sneaker_vault_vn', state: 'done' },
  { title: 'Chờ Seller giao hàng', time: '', detail: 'Thời hạn 48 giờ', state: 'current', badge: 'ĐANG XỬ LÝ' },
  { title: 'Đơn vị vận chuyển', time: '6', detail: 'Lấy kiện & Giao hàng', state: 'next', badge: 'Dự kiến' },
  { title: 'Kiểm tra 48h & Nhận', time: '7', detail: 'Giải ngân bảo chứng', state: 'next', badge: 'Dự kiến' },
];

/** Dữ liệu truyền từ trang thanh toán VietQR sang trang thành công. */
interface EscrowSuccessRouteState {
  total?: number;
  paidAt?: string;
}

const BuyerEscrowSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = storage.getItem<{ name?: string }>('rewear_current_user');
  const routeState = (location.state ?? {}) as EscrowSuccessRouteState;
  /** Khi mở từ trang Đơn hàng (/escrow/status/:orderId) thì mã đơn đến từ URL. */
  const { orderId } = useParams<{ orderId: string }>();

  /** Không vào thẳng URL thành công khi chưa đi qua cổng thanh toán (bỏ qua ở trang tra soát). */
  useEffect(() => {
    if (orderId) return;
    if (routeState.total == null && location.key === 'default') {
      navigate(ROUTES.ESCROW.PAYMENT, { replace: true });
    }
  }, [location.key, navigate, orderId, routeState.total]);

  const product = ESCROW_PRODUCT;
  const sessionCode = ESCROW_SESSION_CODE;
  const orderCode = orderId ? `#${orderId}` : '#RW-20260917-001';
  const total = routeState.total ?? 2935000;
  const paidTimeLabel = routeState.paidAt ?? '10:25 – 17/09/2026';

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="rw-mkt-app rw-es-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="orders"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-es-main">
        <nav className="rw-es-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.BUYER.ORDERS}>Đơn hàng</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span className="rw-es-breadcrumb-code">#{sessionCode}</span>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">Thanh toán ký quỹ thành công</span>
        </nav>

        <section className="rw-es-hero" aria-label="Xác nhận thanh toán Escrow thành công">
          <p className="rw-es-vault">
            <ShieldCheck size={11} aria-hidden="true" />
            ESCROW VAULT SESSION #{sessionCode.replace(/-/g, '')}-SECURED
          </p>
          <span className="rw-es-hero-icon" aria-hidden="true">
            <span className="rw-es-hero-check"><Check size={30} strokeWidth={3.2} /></span>
          </span>
          <p className="rw-es-hero-kicker">GIAO DỊCH KÝ QUỸ ĐƯỢC BẢO HỘ 100%</p>
          <h1>Thanh toán Escrow thành công!</h1>
          <p className="rw-es-hero-sub">
            Khoản thanh toán {formatPrice(total)} đ được ghi nhận và đang được giữ an toàn tuyệt đối tại Quỹ ký
            quỹ ReWear AI Escrow.
          </p>

          <dl className="rw-es-hero-meta">
            <div>
              <dt>MÃ ĐƠN HÀNG</dt>
              <dd>{orderCode}</dd>
            </div>
            <div>
              <dt>THỜI GIAN GHI NHẬN</dt>
              <dd>{paidTimeLabel}</dd>
            </div>
            <div>
              <dt>KIỂM BẢO CHỨNG</dt>
              <dd>
                <span className="rw-es-hero-meta-check"><ShieldCheck size={13} aria-hidden="true" /></span>
                VietQR Napas Smart-Vault
              </dd>
            </div>
          </dl>

          <div className="rw-es-hero-actions">
            <button type="button" className="rw-es-receipt-btn" onClick={() => window.print()}>
              <Printer size={14} aria-hidden="true" />
              Tải biên lai ký quỹ Escrow (PDF) (0.8 MB)
            </button>
            <button type="button" className="rw-es-hash-btn" onClick={() => navigate(ROUTES.BUYER.ORDERS)}>
              <QrCode size={13} aria-hidden="true" />
              Kiểm tra chữ ký số SHA-256
            </button>
          </div>
        </section>
        <section className="rw-es-timeline-card" aria-label="Tiến trình bảo chứng và giao vận">
          <div className="rw-es-timeline-head">
            <p className="rw-es-card-eyebrow">QUY TRÌNH GIAO DỊCH MINH BẠCH</p>
            <div className="rw-es-timeline-title-row">
              <h2>Tiến trình bảo chứng &amp; Giao vận</h2>
              <span className="rw-es-timeline-seller-hint">
                Hạn Seller gửi hàng: 47h:58m còn lại
              </span>
            </div>
          </div>

          <ol className="rw-es-timeline">
            {ESCROW_TIMELINE.map((step) => (
              <li key={step.title} className={`rw-es-step is-${step.state}`}>
                <span className="rw-es-step-top" aria-hidden="true">
                  {step.state === 'done' ? (
                    <>
                      <span className="rw-es-step-check"><Check size={11} strokeWidth={3.2} /></span>
                      <span className="rw-es-step-time">{step.time}</span>
                    </>
                  ) : step.state === 'current' ? (
                    <>
                      <span className="rw-es-step-dot" />
                      <span className="rw-es-step-badge">{step.badge}</span>
                    </>
                  ) : (
                    <>
                      <span className="rw-es-step-num">{step.time}</span>
                      <span className="rw-es-step-badge">{step.badge}</span>
                    </>
                  )}
                </span>
                <b>{step.title}</b>
                <small>{step.detail}</small>
              </li>
            ))}
          </ol>
        </section>
        <div className="rw-es-grid">
          <section className="rw-es-mechanism" aria-label="Cơ chế bảo hộ ký quỹ 3 lớp">
            <div className="rw-es-mechanism-head">
              <span className="rw-es-card-eyebrow">
                <span className="rw-es-mechanism-head-icon" aria-hidden="true"><Layers size={11} /></span>
                BẢO HIỂM QUỸ THANH TOÁN
              </span>
              <span className="rw-es-mechanism-head-note">Tiền chưa chuyển cho Seller</span>
            </div>
            <h2>Cơ chế bảo hộ ký quỹ 3 lớp</h2>
            <p className="rw-es-mechanism-intro">
              <Lock size={13} aria-hidden="true" />
              Số tiền {formatPrice(total)} đ của bạn được đóng băng độc lập tại tài khoản tin thác định danh.
              Người bán không thể rút tiền cho đến khi bạn nhận và kiểm chứng kiện hàng.
            </p>

            <ol className="rw-es-mechanism-list">
              <li>
                <span className="rw-es-mechanism-num" aria-hidden="true">1</span>
                <div>
                  <b>Kho tiền kỹ thuật số độc lập</b>
                  <p>
                    Khoản thanh toán {formatPrice(total)} đ được khóa tự động qua hợp đồng được xác thực
                    ReWear Smart-Escrow liên kết hệ thống ngân hàng đối tác, loại trừ 100% rủi ro gian lận
                    trung gian.
                  </p>
                </div>
              </li>
              <li>
                <span className="rw-es-mechanism-num" aria-hidden="true">2</span>
                <div>
                  <b>Quyền đối soát quang học 48 giờ</b>
                  <p>
                    Khi nhận kiện hàng được niêm phong, bạn có trọn vẹn 48 giờ để so khớp mã hash SHA-256
                    in trên tem bảo chứng cùng ảnh phân giải cao đã lưu trữ trong hồ sơ AI giám định.
                  </p>
                </div>
              </li>
              <li>
                <span className="rw-es-mechanism-num" aria-hidden="true">3</span>
                <div>
                  <b>Chỉ giải ngân khi bạn phê duyệt</b>
                  <p>
                    Tiền chỉ chuyển cho Người bán khi bạn nhấn &quot;Xác nhận hài lòng&quot; trên ứng dụng
                    hoặc sau 48h kết thúc mà không phát sinh bất kỳ yêu cầu khiếu nại chất lượng nào.
                  </p>
                </div>
              </li>
            </ol>

            <p className="rw-es-mechanism-foot">
              <Info size={12} aria-hidden="true" />
              ReWear AI Escrow Protection tuân thủ chuẩn ký quỹ thương mại điện tử bảo hộ người mua.
            </p>
          </section>

          <div className="rw-es-side">
            <section className="rw-es-assured" aria-label="Sản phẩm đã bảo chứng">
              <div className="rw-es-assured-head">
                <span className="rw-es-card-eyebrow">SẢN PHẨM ĐÃ BẢO CHỨNG</span>
                <span className="rw-es-trust-pill">Tình trạng: Like New 98%</span>
              </div>
              <div className="rw-es-assured-card">
                <img src={product.image} alt={product.title} />
                <div className="rw-es-assured-copy">
                  <small>{product.brandTier ?? 'NIKE ACCOUNT'}</small>
                  <b>{product.title}</b>
                  <span>Size 42 • Màu {product.color ?? 'Red/Black/White'}</span>
                  <span className="rw-es-assured-ai">
                    <CircleCheck size={11} aria-hidden="true" />
                    AI Auth Score: {product.aiScore}%
                  </span>
                </div>
              </div>
              <div className="rw-es-assured-total">
                <span>Tổng thanh toán khoá</span>
                <b>{formatPrice(total)} đ</b>
              </div>
            </section>

            <section className="rw-es-handover" aria-label="Thông tin người bán và đóng gói">
              <h3>THÔNG TIN NGƯỜI BÁN &amp; ĐÓNG GÓI</h3>
              <ul>
                <li className="rw-es-handover-seller">
                  <img
                    className="rw-es-handover-avatar"
                    src={buyerAvatar}
                    alt={`Ảnh đại diện ${product.sellerHandle ?? '@sneaker_vault_vn'}`}
                  />
                  <div>
                    <b>
                      {product.sellerHandle ?? '@sneaker_vault_vn'}
                      <BadgeCheck size={13} aria-label="Đã xác minh" />
                    </b>
                    <small>Seller Cấp 2 • 98% Giao dịch bảo chứng</small>
                  </div>
                  <Link
                    className="rw-es-handover-chat"
                    to={ROUTES.BUYER.MESSAGES}
                    state={{ productId: product.id, sellerHandle: product.sellerHandle }}
                    aria-label="Nhắn tin với người bán"
                  >
                    <MessageSquareText size={14} aria-hidden="true" />
                  </Link>
                </li>
                <li>
                  <span className="rw-es-handover-icon" aria-hidden="true"><Package size={14} /></span>
                  <div>
                    <p className="rw-es-handover-line">
                      Trạng thái Seller: <b>Đã nhận lệnh đóng gói theo chuẩn niêm phong ReWear</b>
                    </p>
                  </div>
                </li>
                <li>
                  <span className="rw-es-handover-icon" aria-hidden="true"><Truck size={14} /></span>
                  <div>
                    <p className="rw-es-handover-line">
                      Vận chuyển dự kiến: <b>RVN-VN-EXPRESS-09261</b>
                    </p>
                    <small>Giao tới: {user?.name?.trim() || 'Nguyễn Văn A'} • 0908 123 456 • Tháp Ruby 1, Saigon Pearl, Bình Thạnh, TP.HCM</small>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
        <section className="rw-es-support" aria-label="Hỗ trợ đối soát và khiếu nại">
          <div className="rw-es-support-card">
            <span className="rw-es-support-icon" aria-hidden="true"><Headset size={16} /></span>
            <div>
              <b>Hỗ trợ đối soát &amp; Khiếu nại Escrow 24/7</b>
              <p>Đường dây hỗ trợ kỹ thuật liên ngân hàng: 1900 8899 (Bấm phím 1) • Hoặc khiếu nại trực tiếp qua hồ sơ bảo chứng.</p>
            </div>
          </div>
          <div className="rw-es-support-actions">
            <p>Tiếp tục khám phá sản phẩm khác →</p>
            <button type="button" onClick={() => navigate(ROUTES.BUYER.ORDERS)}>
              <Camera size={14} aria-hidden="true" />
              Xem &amp; theo dõi đơn hàng của tôi
            </button>
          </div>
        </section>

        <div className="rw-es-cta-row" aria-label="Hành động tiếp theo">
          <div className="rw-es-cta-card">
            <span className="rw-es-cta-icon is-check" aria-hidden="true">
              <span className="rw-es-cta-check"><Check size={14} strokeWidth={3} /></span>
            </span>
            <div>
              <b>Kích hoạt giao hàng an toàn trong 60 giây</b>
              <small>Đơn vị vận chuyển đang ở trạng thái sẵn sàng lấy hàng từ Seller.</small>
            </div>
            <button type="button" onClick={() => navigate(ROUTES.BUYER.ORDERS)}>
              <PackageCheck size={14} aria-hidden="true" />
              Kích hoạt lấy hàng ngay
            </button>
          </div>
          <div className="rw-es-cta-card">
            <span className="rw-es-cta-icon" aria-hidden="true"><Timer size={15} /></span>
            <div>
              <b>Nhận thông báo khi Seller gửi hàng</b>
              <small>Tự động nhắc kiểm tra 48h và đối soát hình ảnh phóng to khi hàng đến.</small>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate(ROUTES.BUYER.MESSAGES, {
                  state: { productId: product.id, sellerHandle: product.sellerHandle },
                })
              }
            >
              <FileText size={14} aria-hidden="true" />
              Theo dõi phiên tư vấn Escrow
            </button>
          </div>
        </div>
      </main>

      <MarketplaceFooter />
    </div>
  );
};

export default BuyerEscrowSuccessPage;
