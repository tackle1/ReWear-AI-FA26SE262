import React from 'react';
import {
  BadgeCheck,
  Check,
  CircleCheck,
  ClipboardCheck,
  FileCheck2,
  Fingerprint,
  Hourglass,
  Landmark,
  LockKeyhole,
  PackageCheck,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Store,
  WalletCards,
} from 'lucide-react';
import trenchCoatImage from '../../assets/images/Burberry-Trench-Coat-Folded.png';
import '../../styles/listing/ListingPublishStep.css';

export interface ListingPublishStepProps {
  image?: string;
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  pattern?: string;
  price?: string;
  sku?: string;
  confidence?: number;
}

const normalizePrice = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return `${amount.toLocaleString('vi-VN')} ₫`;
};

export const ListingPublishStep: React.FC<ListingPublishStepProps> = ({
  image,
  name,
  brand,
  category,
  size,
  pattern,
  price,
  sku,
  confidence = 94,
}) => {
  const safeConfidence = Math.max(0, Math.min(100, Math.round(confidence)));
  const displayImage = image || trenchCoatImage;
  const displayName = name?.trim() || 'Áo măng tô Burberry Vintage hai hàng cực';
  const displayBrand = brand?.trim() || 'BURBERRY LONDON • VINTAGE ARCHIVE';
  const displayCategory = category?.trim() || 'Outerwear';
  const displaySize = size?.trim() || 'M';
  const displayPattern = pattern?.trim() || 'Màu Honey Beige';
  const displayPrice = normalizePrice(price) || '8.500.000 ₫';
  const displaySku = sku?.trim() || 'RW-VN-9428';

  return (
    <section className="rw-publish" aria-label="Bước 06 đăng tin và niêm yết">
      <header className="rw-publish-header">
        <span className="rw-publish-glow rw-publish-glow-one" aria-hidden="true" />
        <span className="rw-publish-glow rw-publish-glow-two" aria-hidden="true" />

        <div className="rw-publish-header-top">
          <div className="rw-publish-kicker">
            <span className="rw-publish-protocol">GIAO THUẬT PHÁT HÀNH MF-01</span>
            <span className="rw-publish-final">BƯỚC CUỐI CÙNG</span>
          </div>
          <span className="rw-publish-reference">
            <ClipboardCheck width={13} height={13} aria-hidden="true" />
            Mã phiên bảo đảo: {displaySku}
          </span>
        </div>

        <div className="rw-publish-header-body">
          <div className="rw-publish-header-copy">
            <h1>Xác nhận đăng tin & Kích hoạt bảo vệ ký quỹ</h1>
            <p>Được cuối cùng để niêm yết sản phẩm lên sàn giao dịch ReWear AI và phát hành mã bảo chứng Smart-Escrow.</p>
            <div className="rw-publish-header-badges" aria-label="Các chứng nhận an toàn">
              <span className="is-verified">
                <BadgeCheck width={15} height={15} aria-hidden="true" />
                AI VERIFIED <b>{safeConfidence}%</b>
              </span>
              <span className="is-secured">
                <ShieldCheck width={15} height={15} aria-hidden="true" />
                SMART-ESCROW SECURED
              </span>
            </div>
          </div>

          <div className="rw-publish-vault" aria-hidden="true">
            <span className="rw-publish-vault-ring" />
            <span className="rw-publish-vault-ring is-small" />
            <span className="rw-publish-vault-icon"><LockKeyhole width={31} height={31} strokeWidth={1.8} /></span>
            <strong>REWEAR</strong>
            <small>SECURE VAULT</small>
          </div>
        </div>

        <div className="rw-publish-header-assurance">
          <span><ScanLine width={14} height={14} aria-hidden="true" /> Quét quang học đạt chuẩn ISO/IEC 17020</span>
          <span><Fingerprint width={14} height={14} aria-hidden="true" /> Mã hóa fingerprint SHA-256 bất biến</span>
        </div>
      </header>

      <div className="rw-publish-status-strip">
        <span className="is-ready">
          <CircleCheck width={19} height={19} aria-hidden="true" />
          <strong>Trạng thái A:</strong> Độ tin cậy cao ({safeConfidence}%) — Sẵn sàng phát sóng
        </span>
        <span className="is-review">
          <Hourglass width={18} height={18} aria-hidden="true" />
          <strong>Trạng thái B:</strong> Cần kiểm tra thêm (71%) — Chờ quản trị viên duyệt
        </span>
      </div>

      <div className="rw-publish-grid">
        <div className="rw-publish-main">
          <div className="rw-publish-ai-banner">
            <span className="rw-publish-ai-icon"><BadgeCheck width={21} height={21} aria-hidden="true" /></span>
            <span className="rw-publish-ai-copy">
              <small>XÁC THỨC TƯỞNG THÀNH CÔNG</small>
              <strong>{safeConfidence}% ĐẠT CHUẨN KIỂM ĐỊNH MÁY QUANG HỌC</strong>
            </span>
            <span className="rw-publish-tier"><Sparkles width={13} height={13} aria-hidden="true" /> CẤP DUYỆT TỨC THÌ</span>
          </div>

          <article className="rw-publish-card">
            <header className="rw-publish-card-head">
              <h2><Store width={19} height={19} aria-hidden="true" /> Thẻ tin đăng hiện thị trên sàn giao dịch (Marketplace Preview)</h2>
              <span>Chờ đội ngũ mua nhìn thấy</span>
            </header>
            <div className="rw-publish-market-card">
              <div className="rw-publish-photo-wrap">
                <img className="rw-publish-photo" src={displayImage} alt={displayName} onError={(event) => { event.currentTarget.src = trenchCoatImage; }} />
                <span className="rw-publish-ai-badge"><BadgeCheck width={13} height={13} aria-hidden="true" /> AI XÁC THỰC: {safeConfidence}%</span>
                <span className="rw-publish-condition">Tình trạng: Tuyệt hảo (9.5/10)</span>
              </div>
              <div className="rw-publish-listing-copy">
                <span className="rw-publish-listing-brand">{displayBrand.toUpperCase()}</span>
                <h3>{displayName}</h3>
                <p>Chi tiết Gabardine Cotton trở thành diệt chạy, {displayPattern.toLowerCase()}, khóa sửng sống nguyên bản. Kích thước {displaySize}, danh mục {displayCategory}.</p>
                <div className="rw-publish-specs">
                  <span><small>Mật độ may</small><b>8.8 SPI</b></span>
                  <span><small>Khấu kim loại</small><b>99.4% Khớp</b></span>
                  <span><small>Trọng lượng vải</small><b>380 GSM</b></span>
                </div>
                <div className="rw-publish-prices">
                  <span><small>Giá niêm yết công khai</small><b>{displayPrice}</b></span>
                  <span><small>Thuộc nhóm vốn vối (Đã trừ phí niêm yết 3.5%)</small><b>8.202.500 ₫</b></span>
                </div>
              </div>
            </div>
          </article>

          <article className="rw-publish-card rw-publish-terms">
            <header className="rw-publish-card-head">
              <h2><FileCheck2 width={19} height={19} aria-hidden="true" /> Cam kết & Điều khoản chống tráo hàng (Anti-Swap)</h2>
            </header>
            <p className="rw-publish-terms-desc">Nhận bảo đảm quyền lợi tài chính tối cao cho nhà bán hàng ký tín và người mua cao cấp, quy trình bảo giao dục khóa bảo một mẫu da lớp thông qua giao thức ReWear Smart-Escrow.</p>
            <div className="rw-publish-term">
              <span><Check width={15} height={15} aria-hidden="true" /></span>
              <p><b>Cam kết giữ đúng sản phẩm nguyên bản</b><small>Tôi cam kết giữ đúng sản phẩm đã chụp ánh kiếm đính và đồng ý kích hoạt hợp đồng ký quỹ ReWear Smart-Escrow cho phiên giao dịch này.</small></p>
            </div>
            <div className="rw-publish-term">
              <span><Check width={15} height={15} aria-hidden="true" /></span>
              <p><b>Khóa hoạt tem niêm phong vật lý & mã băm SHA-256</b><small>Đóng nắm niêm phong tem chống trao hàng NFC / Mã băm SHA-256 chính danh được bán khi giao cho đối tác vận chuyển có bảo hiểm hàng hoàn phân.</small></p>
            </div>
          </article>
        </div>

        <aside className="rw-publish-side">
          <article className="rw-publish-card rw-publish-escrow">
            <h2><Landmark width={19} height={19} aria-hidden="true" /> Cơ chế giải ngân bảo chứng</h2>
            <div className="rw-publish-escrow-step">
              <span><LockKeyhole width={17} height={17} aria-hidden="true" /></span>
              <p><b>Khóa tiền an toàn</b><small>Tiền người mua thanh toán được giữ tự động trong tài khoản ký quỹ an toàn của bảo chứng ReWear Escrow.</small></p>
            </div>
            <div className="rw-publish-escrow-step">
              <span><ShieldCheck width={17} height={17} aria-hidden="true" /></span>
              <p><b>Thời gian kiểm định 48 giờ</b><small>Gian ngân tự động 2.802.500 ₫ về tài khoản người bán sau khi người mua nhận hàng và qua 48 giờ kiểm tra không có khiếu nại.</small></p>
            </div>
            <div className="rw-publish-escrow-step">
              <span><PackageCheck width={17} height={17} aria-hidden="true" /></span>
              <p><b>Trong tài đốc lập</b><small>Nếu phát sinh tranh chấp trờo hàng, bằng chứng mờ quang học và camera quét tem đối tác sẽ tự động phát tới quy trình cưỡng chế.</small></p>
            </div>
            <div className="rw-publish-demand">
              <span>Tiền hiện giải ngân <b>48H Tự động</b></span>
              <i><em style={{ width: '71%' }} /></i>
              <small><span>Đặt hàng</span><span>Giao nhận & Kỹ nhận</span><b>Giải ngân về</b></small>
            </div>
          </article>

          <article className="rw-publish-card rw-publish-session">
            <h2><WalletCards width={19} height={19} aria-hidden="true" /> Thông số phiên giao dịch</h2>
            <dl>
              <div><dt>Mã định danh SKU</dt><dd>{displaySku}</dd></div>
              <div><dt>Khóa phiên Escrow</dt><dd>#SES-88219-VN</dd></div>
              <div><dt>Tiêu chuẩn kiểm định</dt><dd>ISO/IEC 17020</dd></div>
              <div><dt>Địa điểm niêm phong</dt><dd>Kho TP. Hồ Chí Minh</dd></div>
            </dl>
            <p>Xác thực bởi ReWear Machine Vision Core v4.2 • Tất cả dữ liệu hình ảnh đã được lưu trữ vĩnh viễn xác nhận bất biến.</p>
          </article>
        </aside>
      </div>
    </section>
  );
};

export default ListingPublishStep;

