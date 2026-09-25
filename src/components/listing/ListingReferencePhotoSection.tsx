import React, { useEffect, useRef, useState } from 'react';
import '../../styles/listing/ListingReferencePhotoSection.css';

export interface ListingReferencePhotoSectionProps {
  title?: string;
  sub?: string;
  maxFiles?: number;
  initialThumbnail?: string;
  onPhotoChange?: (photo?: string) => void;
  onValidityChange?: (isValid: boolean) => void;
}

const referenceSlots = [
  { title: 'Toàn cảnh mặt trước (Overall)', icon: 'image' },
  { title: 'Chi tiết cổ áo & Tag', caption: 'Đã trích xuất đặc trưng', icon: 'tag' },
  { title: 'Mặt lưng & Vạt sau', caption: 'Đã lưu trữ SHA-256', icon: 'hanger' },
];

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <circle cx="8.5" cy="9" r="1.4" />
    <path d="m4.5 17 4.8-4.5 3.2 2.8 2.4-2.2 4.6 4.3" />
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 16V5m0 0L8 9m4-4 4 4" />
    <path d="M6 15.5v1.2A2.3 2.3 0 0 0 8.3 19h7.4a2.3 2.3 0 0 0 2.3-2.3v-1.2" />
  </svg>
);

const SlotIcon = ({ type }: { type: string }) => (
  <span className={`rw-lc-ref-slot-icon is-${type}`} aria-hidden="true">
    {type === 'image' ? <ImageIcon /> : type === 'tag' ? '◈' : '♧'}
  </span>
);

export const ListingReferencePhotoSection: React.FC<ListingReferencePhotoSectionProps> = ({
  title = '3. Hình ảnh sản phẩm tham chiếu',
  sub = 'Dữ liệu đối chiếu ban đầu trước khi kiểm định chi tiết ở Bước 03–05',
  maxFiles = 3,
  initialThumbnail,
  onPhotoChange,
  onValidityChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const [photos, setPhotos] = useState<string[]>(initialThumbnail ? [initialThumbnail] : []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    objectUrlsRef.current.forEach((photo) => URL.revokeObjectURL(photo));
  }, []);

  useEffect(() => {
    onValidityChange?.(photos.length > 0);
    onPhotoChange?.(photos[0]);
  }, [onPhotoChange, onValidityChange, photos]);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const remaining = Math.max(maxFiles - photos.length, 0);
    const validFiles = files.filter((file) =>
      ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 10 * 1024 * 1024,
    );
    setError(validFiles.length !== files.length
      ? 'Chỉ nhận ảnh JPG hoặc PNG, dung lượng tối đa 10MB mỗi ảnh.'
      : files.length > remaining ? `Bạn chỉ có thể tải thêm ${remaining} ảnh.` : null);
    onValidityChange?.(validFiles.length > 0 || photos.length > 0);
    const additions = validFiles.slice(0, remaining).map((file) => URL.createObjectURL(file));
    objectUrlsRef.current.push(...additions);
    setPhotos((current) => {
      const next = [...current, ...additions];
      onPhotoChange?.(next[0]);
      return next;
    });
    event.target.value = '';
  };

  const loadedCount = photos.length;

  return (
    <section className="rw-lc-card rw-lc-ref">
      <div className="rw-lc-ref-head">
        <div className="rw-lc-ref-heading">
          <ImageIcon />
          <div>
            <h2 className="rw-lc-ref-title">{title}</h2>
            <p className="rw-lc-ref-sub">{sub}</p>
          </div>
        </div>
        <span className="rw-lc-ref-count">{loadedCount} ảnh đã tải</span>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handleFiles} className="rw-lc-ref-file-input" />
      <button type="button" className="rw-lc-ref-dropzone" onClick={() => inputRef.current?.click()}>
        <span className="rw-lc-ref-upload-icon"><UploadIcon /></span>
        <strong>Kéo &amp; thả hoặc bấm để tải lên ảnh có sẵn từ thiết bị</strong>
        <span>Đây là ảnh thông tin sản phẩm ban đầu phục vụ hồ sơ tin đăng. Quy trình chụp 5 góc chuyên sâu theo chỉ dẫn thị giác AI sẽ diễn ra ở Bước 02 (Chụp ảnh).</span>
      </button>

      <div className="rw-lc-ref-grid">
        {referenceSlots.slice(0, maxFiles).map((slot, index) => (
          <div className={`rw-lc-ref-slot${photos[index] ? ' has-photo' : ''}`} key={slot.title}>
            {photos[index] ? (
              <img src={photos[index]} alt={slot.title} />
            ) : (
              <SlotIcon type={slot.icon} />
            )}
            <span className="rw-lc-ref-check" aria-hidden="true">✓</span>
            <span className="rw-lc-ref-slot-label">
              <strong>{slot.title}</strong>
              {slot.caption && <small>{slot.caption}</small>}
            </span>
          </div>
        ))}
      </div>
      {error && <p className="rw-lc-ref-error" role="alert">{error}</p>}
    </section>
  );
};

export default ListingReferencePhotoSection;
