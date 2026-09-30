import React, { useRef, useState } from 'react';
import '../../styles/listing/ListingEvidenceSection.css';

export interface BrandClassOption {
  key: string;
  label: string;
}

export interface BrandEvidenceFile {
  extension: string;
  name: string;
  meta: string;
}

export interface ListingEvidenceSectionProps {
  variant?: 'clearance' | 'secondhand';
  title?: string;
  sub?: string;
  initialFile?: BrandEvidenceFile | null;
  isLuxuryBrand?: boolean;
  onNoInvoice?: () => void;
  /** Báo người dùng có tải hóa đơn hay không — dùng để tính điểm ở Bước 05. */
  onBillChange?: (hasBill: boolean) => void;
}

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3.8h8l4 4v12.4H6z" />
    <path d="M14 3.8v4h4M8.7 12h6.6M8.7 15.2h5.2" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 10.8v5M12 7.8v.2" />
  </svg>
);

export const ListingEvidenceSection: React.FC<ListingEvidenceSectionProps> = ({
  variant = 'secondhand',
  title = '4. Hóa đơn & Bằng chứng mua hàng',
  sub = 'Tăng độ tin cậy và hồ sơ truy nguyên nguồn gốc',
  initialFile = null,
  isLuxuryBrand = true,
  onNoInvoice,
  onBillChange,
}) => {
  const [brand, setBrand] = useState('luxury');
  const [hasInvoice, setHasInvoice] = useState(true);
  const [file, setFile] = useState<BrandEvidenceFile | null>(initialFile);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (variant === 'clearance') {
    return (
      <section className="rw-lc-card rw-lc-ev rw-lc-ev-clearance">
        <h2 className="rw-lc-ev-title">Phân khúc thương hiệu</h2>
        <p className="rw-lc-ev-sub">Giúp hệ thống đối chiếu chính xác hơn. Hàng thanh lý không cần hóa đơn.</p>
        <div className="rw-lc-ev-seg" role="tablist" aria-label="Phân loại thương hiệu">
          {[
            ['luxury', 'Luxury / Major Brand'],
            ['popular', 'Popular / Mass-market'],
            ['local', 'Local / No-brand'],
          ].map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={brand === key} className={`rw-lc-ev-seg-item${brand === key ? ' active' : ''}`} onClick={() => setBrand(key)}>
              {label}
            </button>
          ))}
        </div>
      </section>
    );
  }

  const selectInvoice = (value: boolean) => {
    setHasInvoice(value);
    if (!value && isLuxuryBrand) onNoInvoice?.();
    if (!value) {
      setFile(null);
      // Không có hóa đơn thì báo ra ngoài để Bước 05 áp dụng điểm trừ.
      onBillChange?.(false);
    }
  };

  return (
    <section className="rw-lc-card rw-lc-ev">
      <div className="rw-lc-ev-head">
        <div className="rw-lc-ev-heading">
          <DocumentIcon />
          <div>
            <h2 className="rw-lc-ev-title">{title}</h2>
            <p className="rw-lc-ev-sub">{sub}</p>
          </div>
        </div>
        <span className="rw-lc-ev-recommended">Khuyến nghị!</span>
      </div>

      <div className="rw-lc-ev-divider" aria-hidden="true" />

      <fieldset className="rw-lc-ev-question">
        <legend>Bạn có hóa đơn hoặc bằng chứng mua hàng không?</legend>
        <div className="rw-lc-ev-radios">
          <label>
            <input type="radio" name="has-invoice" checked={hasInvoice} onChange={() => selectInvoice(true)} />
            <span className="rw-lc-ev-radio" aria-hidden="true" />
            Có bằng chứng mua hàng
          </label>
          <label>
            <input type="radio" name="has-invoice" checked={!hasInvoice} onChange={() => selectInvoice(false)} />
            <span className="rw-lc-ev-radio" aria-hidden="true" />
            Không có hóa đơn
          </label>
        </div>
      </fieldset>

      <div className="rw-lc-ev-fields">
        <div className="rw-lc-ev-field">
          <label htmlFor="evidence-type">Loại bằng chứng nguồn gốc</label>
          <div id="evidence-type" className="rw-lc-ev-select">Hóa đơn mua hàng (Retail Invoice)</div>
        </div>
        <div className="rw-lc-ev-field">
          <label>File tài liệu đính kèm</label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="rw-lc-ev-file-input"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              if (!picked) return;
              const validType = ['application/pdf', 'image/jpeg', 'image/png'].includes(picked.type)
                || /\.(pdf|jpe?g|png)$/i.test(picked.name);
              if (!validType || picked.size > 10 * 1024 * 1024) {
                setFile(null);
                setError('File phải là PDF, JPG hoặc PNG và dung lượng không vượt quá 10MB.');
                event.target.value = '';
                return;
              }
              setError(null);
              setFile({
                extension: (picked.name.split('.').pop() ?? 'file').toUpperCase().slice(0, 4),
                name: picked.name,
                meta: `${(picked.size / (1024 * 1024)).toFixed(1)} MB`,
              });
              onBillChange?.(true);
            }}
          />
          {file ? (
            <div className="rw-lc-ev-file">
              <DocumentIcon />
              <button type="button" className="rw-lc-ev-file-name" onClick={() => inputRef.current?.click()}>
                {file.name}
              </button>
              <span>{file.meta}</span>
              <button type="button" className="rw-lc-ev-file-remove" aria-label="Xóa file" onClick={() => {
                setFile(null);
                onBillChange?.(false);
              }}>×</button>
            </div>
          ) : (
            <button type="button" className="rw-lc-ev-upload" onClick={() => inputRef.current?.click()}>
              + Tải lên tài liệu
            </button>
          )}
          {error && <p className="rw-lc-ev-error" role="alert">{error}</p>}
        </div>
      </div>

      <div className="rw-lc-ev-note">
        <InfoIcon />
        <span><strong>Ghi chú chuẩn nghiệp vụ:</strong> Hóa đơn là bằng chứng hỗ trợ (Supporting Evidence), không thay thế quy trình kiểm định thị giác đa vùng của AI và không dùng để kết luận tuyệt đối hàng thật/giả.</span>
      </div>
    </section>
  );
};

export default ListingEvidenceSection;
