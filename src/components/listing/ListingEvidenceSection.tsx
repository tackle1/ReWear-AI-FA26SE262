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
}) => {
  const [brand, setBrand] = useState('luxury');
  const [hasInvoice, setHasInvoice] = useState(true);
  const [file, setFile] = useState<BrandEvidenceFile | null>(initialFile);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (variant === 'clearance') {
    return (
      <section className="rw-lc-card rw-lc-ev rw-lc-ev-clearance">
        <h2 className="rw-lc-ev-title">Phân loại thương hiệu &amp; Bằng chứng mua hàng</h2>
        <p className="rw-lc-ev-sub">Phân loại thương hiệu chỉ quyết định việc yêu cầu bằng chứng mua hàng, không phải loại sản phẩm.</p>
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
        <div className="rw-lc-ev-divider" aria-hidden="true" />
        <div className="rw-lc-ev-label-row">
          <span className="rw-lc-ev-label">Hóa đơn / Bằng chứng mua hàng <span className="rw-lc-ev-requirement">{brand === 'luxury' ? '(Bắt buộc đối với Luxury)' : '(Không bắt buộc)'}</span></span>
          <span className="rw-lc-ev-hint">PDF, JPG, PNG (tối đa 10MB)</span>
        </div>
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
          }}
        />
        {file ? (
          <div className="rw-lc-file-row">
            <span className="rw-lc-file-badge">{file.extension}</span>
            <span className="rw-lc-file-text"><span className="rw-lc-file-name">{file.name}</span><span className="rw-lc-file-meta">{file.meta} • Đã tải lên</span></span>
            <button type="button" className="rw-lc-file-remove" aria-label="Xóa tệp" onClick={() => setFile(null)}>×</button>
          </div>
        ) : (
          <button type="button" className="rw-lc-file-empty rw-lc-file-add" onClick={() => inputRef.current?.click()}>
            <DocumentIcon />
            <span>Chọn file hóa đơn / bằng chứng mua hàng</span>
            <small>PDF, JPG hoặc PNG · tối đa 10MB</small>
          </button>
        )}
        <p className="rw-lc-ev-legal">Ghi chú pháp lý: Bằng chứng mua hàng là tài liệu bổ sung (Supporting Evidence) và không thay thế quá trình kiểm định thị giác quang học AI.</p>
        {error && <p className="rw-lc-ev-error" role="alert">{error}</p>}
      </section>
    );
  }

  const selectInvoice = (value: boolean) => {
    setHasInvoice(value);
    if (!value && isLuxuryBrand) onNoInvoice?.();
    if (!value) {
      setFile(null);
      setError(null);
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
            }}
          />
          {file ? (
            <div className="rw-lc-ev-file">
              <DocumentIcon />
              <button type="button" className="rw-lc-ev-file-name" onClick={() => inputRef.current?.click()}>
                {file.name}
              </button>
              <span>{file.meta}</span>
              <button type="button" className="rw-lc-ev-file-remove" aria-label="Xóa file" onClick={() => setFile(null)}>×</button>
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
