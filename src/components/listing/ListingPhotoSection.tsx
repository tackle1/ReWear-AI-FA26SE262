import React, { useEffect, useRef, useState } from 'react';
import '../../styles/listing/ListingForm.css';

export interface ListingPhotoSectionProps {
  variant?: 'clearance' | 'secondhand';
  title?: string;
  sub?: string;
  maxFiles?: number;
  initialThumbnail?: string;
  initialCaption?: string;
  initialCaptionSub?: string;
  onValidityChange?: (isValid: boolean) => void;
  onPhotoChange?: (photo?: string) => void;
}

export const ListingPhotoSection: React.FC<ListingPhotoSectionProps> = ({
  variant = 'secondhand',
  title = 'Tải ảnh sản phẩm chính chủ',
  sub = 'Ảnh rõ nét, đủ sáng và chụp trực tiếp tại nhà giúp AI đối soát vi cấu trúc chính xác hơn.',
  maxFiles = 5,
  initialThumbnail,
  initialCaption = 'Ảnh chính chủ • đã tải lên',
  initialCaptionSub = 'Đủ độ phân giải để AI đối soát chi tiết vải và đường may.',
  onValidityChange,
  onPhotoChange,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>(initialThumbnail ? [initialThumbnail] : []);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const uploadedCount = thumbnails.length;

  useEffect(() => () => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    onValidityChange?.(thumbnails.length > 0);
    onPhotoChange?.(thumbnails[0]);
  }, [onPhotoChange, onValidityChange, thumbnails]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = Math.max(maxFiles - uploadedCount, 0);
    const validFiles = files.filter((file) =>
      ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 10 * 1024 * 1024,
    );
    const additions = validFiles.slice(0, remaining).map((file) => URL.createObjectURL(file));
    objectUrlsRef.current.push(...additions);
    setError(validFiles.length !== files.length
      ? 'Chỉ nhận ảnh JPG hoặc PNG, dung lượng tối đa 10MB mỗi ảnh.'
      : files.length > remaining ? `Bạn chỉ có thể tải thêm ${remaining} ảnh.` : null);
    setThumbnails((current) => [...current, ...additions]);
    onValidityChange?.(uploadedCount > 0 || additions.length > 0);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const photo = thumbnails[index];
    if (objectUrlsRef.current.includes(photo)) {
      URL.revokeObjectURL(photo);
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== photo);
    }
    setThumbnails((current) => current.filter((_, photoIndex) => photoIndex !== index));
    setError(null);
    onValidityChange?.(thumbnails.length > 1);
  };

  if (variant === 'clearance') {
    const primaryThumbnail = thumbnails[0];

    return (
      <section className="rw-lc-card rw-lc-clearance-photos">
        <div className="rw-lc-card-head">
          <div>
            <h2 className="rw-lc-card-title">Ảnh sản phẩm tham chiếu ban đầu</h2>
            <p className="rw-lc-card-sub">Tải lên ảnh đại diện tổng quát để hồ sơ kích hoạt chỉ dẫn quang học.</p>
          </div>
          <span className="rw-lc-head-pill" style={{ cursor: 'default' }}>{uploadedCount} / {maxFiles} Ảnh</span>
        </div>
        <div className="rw-lc-clearance-photo-row">
          {primaryThumbnail ? (
            <button type="button" className="rw-lc-clearance-thumb" onClick={() => inputRef.current?.click()} aria-label="Đổi ảnh đại diện">
              <img src={primaryThumbnail} alt="Ảnh đại diện" />
              <span>Ảnh đại diện</span>
            </button>
          ) : (
            <button type="button" className="rw-lc-clearance-thumb rw-lc-clearance-thumb-empty" onClick={() => inputRef.current?.click()} aria-label="Thêm ảnh đại diện">
              <span>+<small>Thêm ảnh</small></span>
            </button>
          )}
          <div className="rw-lc-clearance-photo-copy">
            <strong>Ảnh đại diện chính chủ đã sẵn sàng</strong>
            <span>Định dạng: JPG, PNG tối đa 10MB.</span>
            <button type="button" onClick={() => inputRef.current?.click()}>
              Ảnh chụp 5 góc quang học chuyên sâu phục vụ AI sẽ được hướng dẫn tại Bước 02.
            </button>
          </div>
        </div>
        {thumbnails.length > 1 && (
          <div className="rw-lc-clearance-secondary-row">
            {thumbnails.slice(1).map((thumbnail, offset) => {
              const index = offset + 1;
              return (
                <div className="rw-lc-clearance-secondary-thumb" key={thumbnail}>
                  <img src={thumbnail} alt={`Ảnh sản phẩm phụ ${index}`} />
                  <span>Ảnh phụ {index}</span>
                  <button type="button" onClick={() => removePhoto(index)} aria-label={`Xóa ảnh phụ ${index}`}>×</button>
                </div>
              );
            })}
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFiles} style={{ display: 'none' }} />
        <div className="rw-lc-clearance-gallery-footer">
          <span>JPG, PNG • tối đa 10MB mỗi ảnh</span>
          {uploadedCount < maxFiles && (
            <button type="button" onClick={() => inputRef.current?.click()}>+ Thêm ảnh</button>
          )}
        </div>
        {error && <p className="rw-lc-field-error" role="alert">{error}</p>}
      </section>
    );
  }

  return (
    <section className="rw-lc-card">
      <div className="rw-lc-card-head">
        <div>
          <h2 className="rw-lc-card-title">{title}</h2>
          <p className="rw-lc-card-sub">{sub}</p>
        </div>
        <span className="rw-lc-head-pill" style={{ cursor: 'default' }}>
          {uploadedCount}/{maxFiles} ảnh
        </span>
      </div>

      <div className="rw-lc-uploads">
        {thumbnails.map((thumbnail, index) => (
          <div className="rw-lc-upload filled" key={thumbnail}>
            <img className="rw-lc-upload-thumb" src={thumbnail} alt={`Ảnh sản phẩm chính chủ ${index + 1}`} />
            <button type="button" className="rw-lc-upload-remove" onClick={() => removePhoto(index)} aria-label={`Xóa ảnh ${index + 1}`}>×</button>
            <div className="rw-lc-upload-caption">
              <b>{index === 0 ? initialCaption : `Ảnh chính chủ ${index + 1}`}</b>
              <span>{initialCaptionSub}</span>
            </div>
          </div>
        ))}

        {uploadedCount < maxFiles && (
          <div className="rw-lc-upload">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFiles} style={{ display: 'none' }} />
            <button type="button" className="rw-lc-upload-add" onClick={() => inputRef.current?.click()}>
              <span className="rw-lc-upload-add-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 6.5v11M6.5 12h11" />
                </svg>
              </span>
              <span>Thêm ảnh chính chủ</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <span className="rw-lc-helper">
          Ảnh mờ hoặc thiếu góc chụp theo hướng dẫn sẽ được AI gắn cờ cảnh báo để bạn bổ sung trước khi gửi duyệt.
        </span>
      </div>
      {error && <p className="rw-lc-field-error" role="alert">{error}</p>}
    </section>
  );
};

export default ListingPhotoSection;
