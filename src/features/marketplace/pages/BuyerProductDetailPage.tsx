import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Circle,
  CircleCheck,
  Eye,
  Focus,
  FolderOpen,
  Heart,
  Info,
  LockKeyhole,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  SquareCheckBig,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import { MARKETPLACE_CATALOG } from '../data/marketplace.data';
import { isListingPublic } from '../../../types/listing.type';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import '../../../styles/marketplace/ProductDetailPage.css';

const AUTHENTICITY_CHECKS = [
  { title: 'Brand Label (Tem & Tag)', detail: 'Đối chiếu font chữ, vị trí nhãn và chất liệu tem với mẫu chính hãng.', score: 98 },
  { title: 'Stitching (Đường chỉ & Mũi giày)', detail: 'Phân tích độ đều của mũi khâu, mật độ chỉ và đường ráp thân giày.', score: 96 },
  { title: 'Hardware / Logo (Logo & Phụ kiện)', detail: 'Kiểm tra hình dáng logo, lớp phủ và các chi tiết phần cứng.', score: 95 },
  { title: 'Material Texture (Cấu trúc & Độ đàn hồi)', detail: 'Đánh giá vân bề mặt, cấu trúc vật liệu và độ đàn hồi.', score: 93 },
  { title: 'Overall Construction (Tỷ lệ form dáng & thân)', detail: 'So sánh tỷ lệ tổng thể và kết cấu với dữ liệu tham chiếu.', score: 97 },
];

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

/**
 * Bộ 10 góc ảnh chuẩn giám định — thứ tự này là thứ tự hiển thị trên gallery.
 * Nếu sản phẩm có khai báo `angles` trong data thì lấy ảnh thật theo đúng index,
 * ngược lại dùng ảnh gốc + crop khác nhau để mô phỏng đủ 10 góc.
 */
const PHOTO_ANGLES = [
  { label: 'Tổng thể', position: '50% 50%' },
  { label: 'Mặt trong', position: '28% 52%' },
  { label: 'Mặt ngoài', position: '72% 52%' },
  { label: 'Gót giày', position: '50% 80%' },
  { label: 'Mặt trên', position: '50% 20%' },
  { label: 'Đế giày', position: '50% 94%' },
  { label: 'Cổ giày', position: '50% 6%' },
  { label: 'May', position: '16% 32%' },
  { label: 'Logo', position: '64% 26%' },
  { label: 'Da', position: '84% 72%' },
] as const;

const BuyerProductDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedCheck, setExpandedCheck] = useState<number | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const user = storage.getItem<{ name?: string }>('rewear_current_user');

  /*
   * Tìm trong CATALOG (bản đã gắn `listingStatus`) chứ không phải
   * `BUYER_PRODUCTS` — để áp được quy tắc "chỉ tin đã phát hành mới xem
   * được". Tin gắn cờ (FLAGGED, đang chờ chuyên viên đối soát) bị loại ở đây
   * luôn, kể cả khi người mua gõ thẳng URL chi tiết.
   */
  const product = useMemo(() => {
    const found = MARKETPLACE_CATALOG.find(
      (item) => item.id === id || id.startsWith(`${item.id}-`)
    );

    return found && isListingPublic(found.listingStatus) ? found : undefined;
  }, [id])

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isZoomOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsZoomOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isZoomOpen]);

  if (!product) {
    return (
      <div className="rw-mkt-app rw-product-detail-app">
        <BuyerTopbar
          avatarSrc={buyerAvatar}
          userName={user?.name?.trim() || undefined}
          onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
          onLogout={() => {
            storage.removeItem('rewear_current_user');
            tokenStorage.clearTokens();
            dispatch(logout());
            navigate(ROUTES.AUTH.LOGIN, { replace: true });
          }}
        />
        <main className="rw-product-not-found">
          <h1>Không tìm thấy sản phẩm</h1>
          <p>Sản phẩm có thể đã được gỡ khỏi ReWear AI.</p>
          <Link to={ROUTES.MARKETPLACE.ROOT}>Quay lại khám phá</Link>
        </main>
        <MarketplaceFooter />
      </div>
    );
  }

  const comparePrice = product.compareAtPrice ?? product.price;
  const discount = Math.max(
    0,
    Math.round(((comparePrice - product.price) / comparePrice) * 100)
  );
  const categoryLabel = product.category === 'Giày sneaker' ? 'Giày dép' : product.category;
  const detailCategory = product.category === 'Giày sneaker'
    ? 'ARCHIVAL FOOTWEAR'
    : product.category.toUpperCase();
  const condition = product.conditionTag ?? product.condition;
  const conditionLabel = condition.split('/')[0].trim();
  const photos = PHOTO_ANGLES.map((angle, index) => {
    const realPhoto = product.angles?.[index];
    return {
      label: angle.label,
      // Ảnh thật đã chụp trọn khung nên không crop; ảnh dùng chung thì crop theo góc.
      position: realPhoto ? '50% 50%' : angle.position,
      src: realPhoto ?? product.image,
    };
  });
  const currentPhoto = photos[selectedPhoto] ?? photos[0];
  const sellerHandle =
    product.sellerHandle ??
    `@${product.sellerName.toLowerCase().replace(/\s+/g, '_')}`;
  const sellerAvatar = product.sellerAvatar ?? product.sellerName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  return (
    <div className="rw-mkt-app rw-product-detail-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-product-detail-main">
        <nav className="rw-product-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.MARKETPLACE.ROOT}>Khám phá</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={ROUTES.MARKETPLACE.ROOT}>{categoryLabel}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={ROUTES.MARKETPLACE.ROOT}>{product.brand}</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{product.title}</span>
        </nav>

        <div className="rw-product-detail-layout">
          <section className="rw-product-gallery" aria-label="Ảnh sản phẩm">
            <div className="rw-product-gallery-main">
              <img
                src={currentPhoto.src}
                alt={`${product.title} — ${currentPhoto.label}`}
                style={{ objectPosition: currentPhoto.position }}
              />
              <span className="rw-product-gallery-protection">
                <Circle size={13} aria-hidden="true" />
                ĐÃ PHÂN TÍCH {photos.length} GÓC QUANG HỌC • LIVE AI ESCROW PROTECTED
              </span>
              <span className="rw-product-gallery-count">
                {String(selectedPhoto + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                className="rw-product-gallery-caption"
                onClick={() => setToast('Ảnh chụp gốc do người bán cung cấp.')}
              >
                <Focus size={15} aria-hidden="true" />
                <span>
                  <em>CHẾ ĐỘ PHÂN GIẢI CAO</em>
                  <b>Góc chụp chuẩn giám định</b>
                </span>
              </button>
              <button
                type="button"
                className="rw-product-zoom"
                aria-label="Phóng to ảnh sản phẩm"
                onClick={() => setIsZoomOpen(true)}
              >
                <Search size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="rw-product-gallery-thumbnails" aria-label="Chọn ảnh">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  className={`rw-product-thumbnail${selectedPhoto === index ? ' active' : ''}`}
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-pressed={selectedPhoto === index}
                  onClick={() => setSelectedPhoto(index)}
                >
                  <img src={photo.src} alt="" style={{ objectPosition: photo.position }} />
                  <span>{String(index + 1).padStart(2, '0')}: {photo.label}</span>
                </button>
              ))}
            </div>

            <section className="rw-product-deepcheck">
              <span className="rw-product-deepcheck-icon">5V</span>
              <div>
                <b>Quy chuẩn thẩm định quang học ReWear DeepCheck™</b>
                <p>
                  Mỗi sản phẩm trải qua thuật toán đối chiếu quang học {photos.length} góc chuẩn với hơn 14.000
                  mẫu vật đối chứng từ kho lưu trữ giấy tệ thảo chính hàng toàn cầu. Kết quả điểm số tin cậy được
                  neo trực tiếp vào hợp đồng ký quỹ Escrow bảo vệ người mua.
                </p>
              </div>
            </section>
          </section>

          <section className="rw-product-detail-info" aria-label="Thông tin sản phẩm">
            <div className="rw-product-kicker">
              <span>
                {product.brand.toUpperCase()} • {detailCategory} • SKU: {product.sku ?? product.id}
              </span>
              <span className="rw-product-verification-status">
                <CircleCheck size={12} aria-hidden="true" />
                Kiểm định hoàn tất
              </span>
            </div>
            <div className="rw-product-heading">
              <h1>{product.title}</h1>
            </div>

            <div className="rw-product-price-block">
              <strong>{formatPrice(product.price)} ₫</strong>
              {comparePrice > product.price && (
                <>
                  <del>{formatPrice(comparePrice)} ₫</del>
                  <span>Tiết kiệm {discount}%</span>
                </>
              )}
            </div>

            <div className="rw-product-attributes">
              <div>
                <span>KÍCH CỠ</span>
                <b>
                  {product.size}{product.category === 'Giày sneaker' ? ' EU' : ''}
                  {product.sizeUs ? ` / ${product.sizeUs}` : ''}
                </b>
              </div>
              <div><span>PHỐI MÀU</span><b>{product.color ?? 'Đang cập nhật'}</b></div>
              <div>
                <span>TÌNH TRẠNG</span>
                <b className="rw-product-condition">
                  {conditionLabel}
                  {conditionLabel.toLowerCase().includes('like new') && (
                    <CircleCheck size={13} aria-label="Đã xác thực tình trạng" />
                  )}
                </b>
              </div>
            </div>
            {product.conditionNote && (
              <p className="rw-product-condition-note">
                <LockKeyhole size={14} aria-hidden="true" />
                {product.conditionNote}
              </p>
            )}

            <section className="rw-product-ai-card">
              <div className="rw-product-ai-heading">
                <div className="rw-product-ai-label">
                  <span><Sparkles size={15} aria-hidden="true" /></span>
                  <div><b>AI Verification</b><small>Thẩm định quang học nền-rõ ra diệm</small></div>
                </div>
                <span className="rw-product-ai-status">ĐẠT CHUẨN</span>
              </div>
              <div className="rw-product-ai-scoreline">
                <div><small>AI AUTHENTICITY CONFIDENCE</small><b>Độ tin cậy xác thực thuật toán</b></div>
                <strong>{product.aiScore}%<small>/ 100</small></strong>
              </div>
              <div className="rw-product-ai-progress" aria-label={`Độ tin cậy ${product.aiScore}%`}>
                <span style={{ width: `${product.aiScore}%` }} />
              </div>
              <p className="rw-product-ai-description">
                Điểm tin cậy được tổng hợp từ phân tích hình ảnh đa góc độ, độ tương phản sợi vải và mật độ mũi khâu;
                phóng chú tâm nhiệt và tỷ lệ hình học mũi khẩu so sánh với 14.280 mẫu chuẩn {product.brand}.
              </p>
              <button
                type="button"
                className="rw-product-ai-report"
                onClick={() => setToast('Báo cáo thẩm định AI đang được cập nhật.')}
              >
                <SquareCheckBig size={14} aria-hidden="true" />
                Tình trạng thẩm định: {conditionLabel} • Đạt chuẩn niêm yết chứng nhận <b>MF-06</b>
                <ChevronRight size={14} aria-hidden="true" />
              </button>
              <p className="rw-product-ai-footnote">
                <Info size={12} aria-hidden="true" />
                Lưu ý: Kết quả AI mang tính thẩm chứng bằng chứng định lượng, bảo đảm ký quỹ tự động và không thay thế chứng thư tư pháp độc lập.
              </p>
            </section>

            <section className="rw-product-authenticity">
              <div className="rw-product-section-heading">
                <h2><FolderOpen size={16} aria-hidden="true" /> BẰNG CHỨNG PHÂN TÍCH VÌ MÔ (5 VÙNG)</h2>
                <span>5/5 ĐẠT</span>
              </div>
              <div className="rw-product-check-list">
                {AUTHENTICITY_CHECKS.map((check, index) => (
                  <div className="rw-product-check" key={check.title}>
                    <button
                      type="button"
                      aria-expanded={expandedCheck === index}
                      onClick={() => setExpandedCheck(expandedCheck === index ? null : index)}
                    >
                      <span className="rw-product-check-mark"><Check size={13} aria-hidden="true" /></span>
                      <span className="rw-product-check-copy">
                        <b>{index + 1}. {check.title}</b>
                        <small className="rw-product-check-metric">Độ xác thực: {check.score}%</small>
                        {expandedCheck === index && <small className="rw-product-check-detail">{check.detail}</small>}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rw-product-check-compare"
                      onClick={() => setToast(`Đang mở bằng chứng "${check.title}".`)}
                    >
                      Đối chiếu
                      <Eye size={13} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rw-product-seller">
              <div className="rw-product-seller-heading">
                <span>THÔNG TIN NGƯỜI BÁN</span>
                {product.sellerVerified && <b><ShieldCheck size={12} /> Danh tính CCCD & VneID Xác thực</b>}
              </div>
              <div className="rw-product-seller-profile">
                <span className="rw-product-seller-avatar">
                  {sellerAvatar}
                </span>
                <div className="rw-product-seller-name">
                  <b>
                    {sellerHandle}
                    <em className="rw-product-seller-tier">Cấp 2</em>
                  </b>
                  <span><ShieldCheck size={11} /> Người bán uy tín • Tham gia từ 18 tháng</span>
                </div>
                <button type="button" onClick={() => setToast(`Đang mở hồ sơ ${sellerHandle}.`)}>
                  Xem hồ sơ <ChevronRight size={13} />
                </button>
              </div>
              <div className="rw-product-seller-stats">
                <div>
                  <b><i>★</i> {product.sellerRating?.toFixed(1) ?? '5.0'} <small>({product.sellerReviewCount ?? 0})</small></b>
                  <span>Đánh giá từ người mua</span>
                </div>
                <div>
                  <b>124 <small>đơn</small></b>
                  <span>Giao dịch thành công</span>
                </div>
                <div>
                  <b>98%</b>
                  <span>Phản hồi trong 1 giờ</span>
                </div>
              </div>
              <div className="rw-product-seller-foot">
                <span>Lịch sử tranh chấp: <b>2 vụ</b> (Đã giải quyết hòa giải qua Escrow)</span>
                <button type="button" onClick={() => setToast('Báo lãnh 100% được ReWear hoàn trả khi tranh chấp xong.')}>
                  Báo lãnh 100%
                </button>
              </div>
            </section>

            <div className="rw-product-actions">
              <button
                type="button"
                className="rw-product-buy"
                onClick={() => navigate(ROUTES.ESCROW.CHECKOUT)}
              >
                <LockKeyhole size={15} aria-hidden="true" />
                Mua ngay — {formatPrice(product.price)} ₫
                <ChevronRight size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="rw-product-message"
                aria-label="Nhắn tin người bán"
                onClick={() =>
                  navigate(ROUTES.BUYER.MESSAGES, {
                    state: { productId: product.id, sellerHandle },
                  })
                }
              >
                <MessageSquareText size={17} aria-hidden="true" />
                Nhắn tin
              </button>
              <button
                type="button"
                className={`rw-product-save${isSaved ? ' active' : ''}`}
                aria-pressed={isSaved}
                aria-label={isSaved ? 'Bỏ lưu sản phẩm' : 'Lưu sản phẩm'}
                onClick={() => {
                  setIsSaved((saved) => !saved);
                  setToast(isSaved ? 'Đã bỏ khỏi danh sách yêu thích.' : 'Đã lưu vào danh sách yêu thích.');
                }}
              >
                <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            </div>

            <div className="rw-product-escrow-note">
              <ShieldCheck size={13} aria-hidden="true" />
              <span>
                <b>ReWear Smart-Escrow:</b> Khoản tiền {formatPrice(product.price)} ₫ được giữ phong tỏa tại tài
                khoản trung tâm an toàn và chỉ giải ngân cho chủ sở hữu khi bạn xác nhận hàng. Khoản tiền được
                bảo chứng 100% bằng chứng AI đã cam kết.
              </span>
            </div>
          </section>
        </div>

        <Link className="rw-product-back-link" to={ROUTES.MARKETPLACE.ROOT}>
          <ArrowLeft size={14} aria-hidden="true" /> Tiếp tục khám phá
        </Link>
      </main>

      <MarketplaceFooter />

      {toast && <div className="rw-mkt-toast" role="status">{toast}</div>}

      {isZoomOpen && (
        <div
          className="rw-product-zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh sản phẩm: ${product.title}`}
          onClick={() => setIsZoomOpen(false)}
        >
          <button type="button" aria-label="Đóng ảnh phóng to" onClick={() => setIsZoomOpen(false)}>×</button>
          <img
            src={currentPhoto.src}
            alt={product.title}
            style={{ objectPosition: currentPhoto.position }}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BuyerProductDetailPage;
