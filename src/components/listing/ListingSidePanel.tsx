import React from 'react';
import '../../styles/listing/ListingSidePanel.css';

export interface ListingPreviewData {
  title: string;
  brand: string;
  sku: string;
  category: string;
  size: string;
  pattern: string;
  price: string;
  marketPrice: string;
  status: string;
}

export interface ListingSidePanelProps {
  variant?: 'default' | 'clearance' | 'secondhand';
  previewImage?: string;
  preview?: Partial<ListingPreviewData>;
  escrowTitle?: string;
  escrowDesc?: string;
  escrowBullets?: string[];
  escrowBadgeLabel?: string;
  escrowBadges?: string[];
  paymentTitle?: string;
  paymentDesc?: string;
  paymentSecureNote?: string;
  paymentBadges?: string[];
}

const PREVIEW_DEFAULT: ListingPreviewData = {
  title: 'Burberry Vintage Trench Coat',
  brand: 'BURBERRY',
  sku: '#BUR001',
  category: 'Áo khoác ngoài',
  size: 'M',
  pattern: 'Beige',
  price: '8.500.000 ₫',
  marketPrice: '8.202.000 ₫',
  status: 'Chưa xác thực',
};

const DEFAULT_ESCROW_BULLETS = [
  'Khoản ký quỹ chỉ được giải ngân khi cả hai bên xác nhận đã bàn giao.',
  'ReWear AI đối soát hình ảnh và bằng chứng thẩm định thay bạn.',
  'Hoàn tiền tự động nếu hồ sơ không đạt tiêu chuẩn xác thực.',
];

const DEFAULT_ESCROW_BADGES = ['VISA', 'MASTERCARD', 'JCB', 'MOMO'];
const DEFAULT_PAYMENT_BADGES = ['VISA', 'MASTERCARD', 'JCB', 'MOMO', 'VNPAY'];

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.8 12s3.2-5 9.2-5 9.2 5 9.2 5-3.2 5-9.2 5-9.2-5-9.2-5Z" />
    <circle cx="12" cy="12" r="2.3" />
  </svg>
);

export const ListingSidePanel: React.FC<ListingSidePanelProps> = ({
  variant = 'default',
  previewImage,
  preview,
  escrowTitle = 'Bảo vệ khoản Ký quỹ Ban đầu',
  escrowDesc = 'Khoản ký quỹ ban đầu được giữ an toàn và chỉ giải ngân khi tin đăng của bạn vượt qua vòng thẩm định.',
  escrowBullets = DEFAULT_ESCROW_BULLETS,
  escrowBadgeLabel = 'Cổng thanh toán',
  escrowBadges = DEFAULT_ESCROW_BADGES,
  paymentTitle = 'Cổng thanh toán',
  paymentDesc = 'Giao dịch của người mua được bảo vệ 100% qua Ký quỹ ReWear AI. Bạn nhận tiền ngay sau khi đơn hoàn tất và không có khiếu nại.',
  paymentSecureNote = 'An toàn & Bảo mật • Mã hoá 256-bit',
  paymentBadges = DEFAULT_PAYMENT_BADGES,
}) => {
  const data: ListingPreviewData = { ...PREVIEW_DEFAULT, ...preview };

  return (
    <>
      <section className="rw-lc-side-card">
        {variant === 'clearance' ? (
          <div className="rw-lc-clearance-preview">
            <div className="rw-lc-clearance-head">
              <span>XEM TRƯỚC THÔNG TIN<br />ĐĂNG</span>
              <strong>Like New / Chưa<br />qua SD</strong>
            </div>
            <div className="rw-lc-clearance-divider" />
            {previewImage && <div className="rw-lc-clearance-media">
              <img src={previewImage} alt={data.title || 'Ảnh sản phẩm'} />
              <span>HÀNG THANH LÝ</span>
            </div>}
            <div className="rw-lc-clearance-content">
              <b className="rw-lc-clearance-brand">{data.brand || 'Chưa chọn thương hiệu'}</b>
              <h3>{data.title || 'Chưa nhập tên sản phẩm'}</h3>
              <div className="rw-lc-clearance-specs">
                <div><span>Danh mục:</span><b>{data.category || 'Chưa chọn danh mục'}</b></div>
                <div><span>Kích cỡ:</span><b>{data.size || 'Chưa chọn kích cỡ'}</b></div>
                <div><span>Màu sắc / họa tiết:</span><b>{data.pattern || 'Chưa nhập'}</b></div>
                <div><span>Mã sản phẩm:</span><b>{data.sku || 'Chưa nhập SKU'}</b></div>
              </div>
              <div className="rw-lc-clearance-condition"><span>Tình trạng:</span><b>Like New / Chưa qua SD</b></div>
              <div className="rw-lc-clearance-prices">
                <div><span>Giá niêm yết:</span><b>{data.price ? `${data.price} ₫` : 'Chưa nhập giá'}</b></div>
                <div><span>SKU:</span><b>{data.sku || 'Chưa nhập SKU'}</b></div>
              </div>
              <p>Chưa cập trạng thái xác thực (Cần hoàn thành Bước 04 AI)</p>
            </div>
          </div>
        ) : <>
        <div className="rw-lc-search-head">
          <span className="rw-lc-search-title"><EyeIcon /> Xem trước thẻ tìm kiếm</span>
          <span className="rw-lc-search-sync">LIVE SYNC</span>
        </div>

        <div className="rw-lc-search-card">
          <div className="rw-lc-preview-media">
          {previewImage ? (
            <img src={previewImage} alt="Toàn cảnh mặt trước" />
          ) : (
            <div className="rw-lc-upload-thumb" style={{ height: 208, borderRadius: 0 }} aria-hidden="true" />
          )}
            <span className="rw-lc-search-sku">MÃ: {data.sku || 'Chưa có mã'}</span>
            <span className="rw-lc-preview-tag">◉ Kiểm định cấp 1</span>
          </div>

          <div className="rw-lc-preview-body">
            <div className="rw-lc-search-line">
              <span>{data.brand || 'Chưa chọn thương hiệu'}</span>
              <span>{data.size ? `SIZE ${data.size}` : 'Chưa chọn kích cỡ'}</span>
            </div>
            <h3 className="rw-lc-preview-title">{data.title || 'Chưa nhập tên sản phẩm'}</h3>
            <div className="rw-lc-search-prices">
              <div><span>Giá niêm yết</span><b>{data.price ? `${data.price} ₫` : 'Chưa nhập giá'}</b></div>
              <div><span>Danh mục</span><b>{data.category || 'Chưa chọn danh mục'}</b></div>
            </div>
            <div className="rw-lc-search-tags">
              <span>Hàng Secondhand</span>
              <span>{data.pattern || 'Chưa nhập màu sắc / họa tiết'}</span>
              <span>Ảnh: Toàn cảnh mặt trước</span>
              <span>Mã: {data.sku || 'Chưa có mã'}</span>
            </div>
          </div>
        </div>
        <p className="rw-lc-search-note">Hình ảnh đại diện sẽ được cập nhật tự động bằng bức ảnh góc chụp toàn cảnh (Front Silhouette) có điểm số kiểm định cao nhất ở Bước 3.</p>
        </>}
      </section>

      <section className="rw-lc-side-card">
        {variant === 'clearance' || variant === 'default' || variant === 'secondhand' ? (
          <div className="rw-lc-anti-swap">
            <div className="rw-lc-anti-swap-head">
              <span className="rw-lc-anti-swap-icon" aria-hidden="true">
                <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="11" height="9" rx="1.6" />
                  <path d="M7.5 10V7.7a3.3 3.3 0 0 1 6.6 0V10M15 13h4.5V5.5a2 2 0 0 0-2-2H12" />
                </svg>
              </span>
              <div><h3>Bảo vệ khỏi tráo hàng (Anti–Swap)</h3><p>Công nghệ ghim mã hàm băm kỹ thuật số</p></div>
            </div>
            <p className="rw-lc-anti-swap-desc">Khi người mua nhận kiện hàng, họ bắt buộc phải đối chiếu vi vết đường chỉ &amp; tem vải thông qua ứng dụng ReWear để mở khóa ký quỹ. Nếu xảy ra hoàn hàng, hệ thống sử dụng vân mã ảnh Bước 3 để ngăn ngừa tráo hàng nhái.</p>
            <div className="rw-lc-anti-swap-signature">
              <div><b>CHỮ KÝ QUANG HỌC</b><b>SHA-256: 9E4A...7F01</b></div>
              <span><i /></span>
              <p>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="10" width="11" height="9" rx="1.6" /><path d="M7.5 10V7.7a3.3 3.3 0 0 1 6.6 0V10M15 13h4.5V5.5a2 2 0 0 0-2-2H12" /></svg>
                Khóa ký quỹ tự động kích hoạt khi lưu tin
              </p>
            </div>
          </div>
        ) : <>
        <h3 className="rw-lc-side-title">
          <span className="rw-lc-lock" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" />
              <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
            </svg>
          </span>
          {escrowTitle}
        </h3>
        <p className="rw-lc-side-desc">{escrowDesc}</p>
        <ul className="rw-lc-side-list">
          {escrowBullets.map((bullet) => (
            <li key={bullet}>
              <CheckIcon />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {variant !== 'secondhand' && (
          <div className="rw-lc-pay-row">
            <span className="rw-lc-pay-label">{escrowBadgeLabel}</span>
            <div className="rw-lc-pay-badges">
              {escrowBadges.map((badge) => (
                <span key={badge} className="rw-lc-pay-badge">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
        </>}
      </section>

      {variant !== 'clearance' && variant !== 'secondhand' && <section className="rw-lc-side-card">
        <h3 className="rw-lc-side-title">
          <span className="rw-lc-lock" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
              <path d="M3 10h18" />
            </svg>
          </span>
          {paymentTitle}
        </h3>
        <p className="rw-lc-side-desc">{paymentDesc}</p>
        <div className="rw-lc-pay-badges" style={{ marginTop: 12 }}>
          {paymentBadges.map((badge) => (
            <span key={badge} className="rw-lc-pay-badge">
              {badge}
            </span>
          ))}
        </div>
        <div className="rw-lc-pay-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="m8.5 12.3 2.4 2.4 4.6-5" />
          </svg>
          <span>{paymentSecureNote}</span>
        </div>
      </section>}
    </>
  );
};

export default ListingSidePanel;
