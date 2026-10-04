import React from 'react';
import '../../styles/listing/ListingSidePanel.css';

export interface ListingPreviewData {
  title: string;
  brand: string;
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
  paymentTitle?: string;
  paymentDesc?: string;
  paymentSecureNote?: string;
  paymentBadges?: string[];
}

const PREVIEW_DEFAULT: ListingPreviewData = {
  title: 'Burberry Vintage Trench Coat',
  brand: 'BURBERRY',
  category: 'Áo khoác ngoài',
  size: 'M',
  pattern: 'Beige',
  price: '8.500.000 ₫',
  marketPrice: '8.202.000 ₫',
  status: 'Chưa xác thực',
};

const DEFAULT_PAYMENT_BADGES = ['VISA', 'MASTERCARD', 'JCB', 'MOMO', 'VNPAY'];

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.8 12s3.2-5 9.2-5 9.2 5 9.2 5-3.2 5-9.2 5-9.2-5-9.2-5Z" />
    <circle cx="12" cy="12" r="2.3" />
  </svg>
);

const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.8" />
    <circle cx="8.6" cy="9.4" r="1.4" />
    <path d="m4.6 17.2 4.7-4.4 3.1 2.8 2.4-2.2 4.6 4.3" />
  </svg>
);

export const ListingSidePanel: React.FC<ListingSidePanelProps> = ({
  variant = 'default',
  previewImage,
  preview,
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
              <span>Xem trước thông tin đăng</span>
              <strong>Like New / Chưa qua SD</strong>
            </div>
            <div className="rw-lc-clearance-divider" />
            {previewImage && <div className="rw-lc-clearance-media">
              <img src={previewImage} alt={data.title || 'Ảnh sản phẩm'} />
              <span>HÀNG THANH LÝ</span>
            </div>}
            <div
              className={`rw-lc-clearance-content${previewImage ? '' : ' is-no-media'}`}
            >
              <b className="rw-lc-clearance-brand">{data.brand || 'Chưa chọn thương hiệu'}</b>
              <h3>{data.title || 'Chưa nhập tên sản phẩm'}</h3>
              <div className="rw-lc-clearance-specs">
                <div><span>Danh mục:</span><b>{data.category || 'Chưa chọn danh mục'}</b></div>
                <div><span>Kích cỡ:</span><b>{data.size || 'Chưa chọn kích cỡ'}</b></div>
                <div><span>Màu sắc / họa tiết:</span><b>{data.pattern || 'Chưa nhập'}</b></div>
              </div>
              <div className="rw-lc-clearance-condition"><span>Tình trạng:</span><b>Like New / Chưa qua SD</b></div>
              <div className="rw-lc-clearance-prices">
                <div><span>Giá niêm yết:</span><b>{data.price ? `${data.price} ₫` : 'Chưa nhập giá'}</b></div>
              </div>
            </div>
          </div>
        ) : <>
        <div className="rw-lc-search-head">
          <span className="rw-lc-search-title"><EyeIcon /> Xem trước tin đăng</span>
        </div>

        <div className="rw-lc-search-card">
          <div
            className={`rw-lc-preview-media${previewImage ? '' : ' is-empty'}`}
          >
            {previewImage ? (
              <img src={previewImage} alt="Toàn cảnh mặt trước" />
            ) : (
              /*
                Bước 01 đã gỡ phần tải ảnh (ảnh chụp ở Bước 02), nên khi chưa có
                ảnh thì hiện nút giả ở kích thước gọn thay vì khối vuông 1/1 rỗng.
              */
              <div className="rw-lc-preview-empty">
                <ImageIcon />
                <b>Chưa có ảnh sản phẩm</b>
                <small>Ảnh sẽ hiển thị ở các bước kiểm định sau khi chụp ở Bước 02</small>
              </div>
            )}
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
              {previewImage && <span>Ảnh: Toàn cảnh mặt trước</span>}
            </div>
          </div>
        </div>
        </>}
      </section>

      {/*
        Đã bỏ thẻ "Bảo vệ khoản Ký quỹ Ban đầu" cho hàng thanh lý và hàng
        Secondhand: nội dung trùng lặp với các bước kiểm định/ký quỹ về sau
        và là nội dung tĩnh không phản ánh dữ liệu thật của tin đăng.
      */}
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
