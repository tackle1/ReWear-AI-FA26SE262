import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Upload, Info, ScanLine, Sun, Sparkles, X, CameraOff, Image as ImageIcon } from 'lucide-react';
import EvidenceChecklist from '../../features/listing-ai/components/EvidenceChecklist';
import { EvidenceChecklistItem } from '../../features/listing-ai/types/evidence-checklist.type';
import '../../styles/listing/ListingCaptureStep.css';

export interface ListingCaptureStepProps {
  /**
   * Báo ảnh đã chụp theo từng góc (id góc → data URL).
   * Bước 03–06 dùng ảnh thật này cho kiểm định và hiển thị.
   */
  onPhotosChange?: (photos: Record<string, string>) => void;
}

interface AngleMetadata {
  /**
   * Mã góc ảnh theo quy ước của backend (`POST /api/ListingsExample/create`).
   * Dùng chính giá trị này làm khoá lưu ảnh và để gửi `photos[].angleType`,
   * nhờ đó không phải chuyển đổi id ở nhiều nơi.
   */
  angleType: string;
  id: string;
  number: string;
  title: string;
  subtitle: string;
  /**
   * Hướng dẫn chụp cho góc này. Ứng dụng không đo được độ sắc nét/ánh sáng/
   * khoảng cách thật, nên không hiển thị các chỉ số quang học bịa đặt cứng.
   */
  guidance: string;
}

/**
 * 4 góc ảnh bắt buộc — backend trả về `missingAngles` nếu thiếu, ví dụ:
 * `["OVERALL", "BRAND_TAG", "WASH_TAG", "STITCHING_ZIPPER"]`.
 */
const ANGLES_DATA: Record<string, AngleMetadata> = {
  OVERALL: {
    angleType: 'OVERALL',
    id: '01',
    number: '01',
    title: 'Toàn bộ sản phẩm',
    subtitle: 'Front Silhouette',
    guidance: 'Cần đặt áo phẳng trên bề mặt trung tính, cúc cài ngay ngắn và mở phẳng tà áo theo tỷ lệ khung viền chuẩn xác.',
  },
  BRAND_TAG: {
    angleType: 'BRAND_TAG',
    id: '02',
    number: '02',
    title: 'Nhãn / Tag thương hiệu',
    subtitle: 'Brand Label & Kerning',
    guidance: 'Cần ánh đèn ở Burberrys và đúng khung ngắm minh chính nhất. Đảm bảo độ sắc nét vi cấu trúc thớ dệt, mã sản phẩm phải tỷ lệ khung không bị lớp quang học bởi nếp gấp.',
  },
  WASH_TAG: {
    angleType: 'WASH_TAG',
    id: '03',
    number: '03',
    title: 'Nhãn giặt / Chăm sóc',
    subtitle: 'Care Label & Wash Symbols',
    guidance: 'Chụp rõ nhãn giặt và ký hiệu giặt ủi để đối chiếu đúng cách vệ sinh sản phẩm. Không để nhàu nát hoặc che ký hiệu.',
  },
  STITCHING_ZIPPER: {
    angleType: 'STITCHING_ZIPPER',
    id: '04',
    number: '04',
    title: 'Đường may & Khóa kéo',
    subtitle: 'Stitching Density & Zipper',
    guidance: 'Soi thẳng vào đường chỉ chần viền và khóa kéo. Đảm bảo mật độ mũi may đều đặn, không sờn chỉ, khóa kéo trơn tru và răng khớp.',
  },
};

export const ListingCaptureHeader: React.FC<{ completedCount?: number; totalCount?: number }> = ({
  completedCount = 0,
  totalCount = Object.keys(ANGLES_DATA).length,
}) => {
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="rw-lc-capture-topline">
      <div className="rw-lc-capture-device">
        <span><Camera width={20} height={20} /></span>
        <div>
          <b>
            Tiến độ chụp ảnh góc bằng chứng
          </b>
          <small>Chụp đủ 4 góc để sản phẩm được kiểm định ReWear Escrow</small>
        </div>
      </div>
      <div className="rw-lc-capture-progress">
        <span>Tiến độ góc ảnh:</span>
        <i><b style={{ width: `${percent}%` }} /></i>
        <strong>{completedCount}/{totalCount} hoàn thành</strong>
      </div>
    </div>
  );
};

/** Ảnh chụp của một góc, gồm nguồn gốc để người dùng biết mình vừa làm gì. */
interface CapturedPhoto {
  dataUrl: string;
  source: 'camera' | 'upload';
}

export const ListingCaptureStep: React.FC<ListingCaptureStepProps> = ({
  onPhotosChange,
}) => {
  /**
   * Thứ tự chụp 4 góc. Dùng mảng này cho mọi phép "trước/sau" để thứ tự
   * khớp với số hiển thị (01 → 04) và với `angle.number` bên dưới.
   */
  const ANGLE_IDS = Object.keys(ANGLES_DATA);

  /** Góc đang chọn; dùng chính `angleType` của backend làm khoá. Bắt đầu từ góc 01. */
  const [activeAngleId, setActiveAngleId] = useState<string>(ANGLE_IDS[0]);
  /** id góc → ảnh thật đã chụp. Rỗng nghĩa là góc đó chưa chụp. */
  const [photos, setPhotos] = useState<Record<string, CapturedPhoto>>({});
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const activeAngle = ANGLES_DATA[activeAngleId] || ANGLES_DATA[ANGLE_IDS[0]];
  const activePhoto = photos[activeAngleId];
  const completedIds = Object.keys(photos);

  /**
   * Góc sẽ được chụp tiếp theo: góc chưa chụp đầu tiên nằm *sau* góc đang
   * chọn trong thứ tự 01 → 04. Nếu đã chụp hết phần sau thì quay về góc
   * chưa chụp đầu tiên; nếu không còn góc nào thì `null` (đã đủ 4 góc).
   * Đây là nguồn duy nhất quyết định badge "Tiếp theo" — không hardcode id.
   */
  const nextAngleId =
    ANGLE_IDS.find((id) => ANGLE_IDS.indexOf(id) > ANGLE_IDS.indexOf(activeAngleId) && !photos[id]) ??
    ANGLE_IDS.find((id) => !photos[id]) ??
    null;

  /** Đóng camera và giải phóng thiết bị. */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  }, []);

  // Gắn stream vào thẻ <video> sau khi camera mở, và luôn chỉ lấy 1 luồng.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    video.srcObject = streamRef.current;
    void video.play().catch(() => {
      // Một số trình duyệt chặn autoplay có tiếng; video đã muted nên thường OK.
    });
  }, [isCameraOpen]);

  // Dọn camera khi rời khỏi Bước 02 để không bật đèn LED sau khi đã đi tiếp.
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const showFeedback = (message: string) => {
    setFeedbackToast(message);
    window.setTimeout(() => setFeedbackToast(null), 3500);
  };

  /**
   * Ghi ảnh vào góc hiện tại rồi tự chuyển sang góc chưa chụp kế tiếp để
   * người bán không phải tự bấm lại từng góc. Nếu đã đủ 4 góc thì giữ nguyên
   * góc hiện tại để họ kiểm tra lại ảnh vừa chụp.
   */
  const savePhoto = (dataUrl: string, source: 'camera' | 'upload') => {
    const savedNumber = activeAngle.number;
    const savedTitle = activeAngle.title;

    setPhotos((prev) => {
      const next = { ...prev, [activeAngleId]: { dataUrl, source } };
      onPhotosChange?.(
        Object.fromEntries(Object.entries(next).map(([id, item]) => [id, item.dataUrl])),
      );
      return next;
    });

    setIsFlashActive(true);
    window.setTimeout(() => setIsFlashActive(false), 200);

    /*
     * Tính góc kế tiếp từ ảnh vừa lưu: bỏ góc hiện tại (đã có ảnh) rồi lấy góc
     * chưa chụp kế tiếp theo thứ tự. Không phụ thuộc `nextAngleId` của render
     * trước để tránh trễ một lần do setPhotos bất đồng bộ.
     */
    const upcoming =
      ANGLE_IDS.find(
        (id) => ANGLE_IDS.indexOf(id) > ANGLE_IDS.indexOf(activeAngleId) && id !== activeAngleId && !photos[id],
      ) ??
      ANGLE_IDS.find((id) => id !== activeAngleId && !photos[id]) ??
      null;

    const sourceLabel = source === 'camera' ? 'chụp camera' : 'tải từ máy';
    const nextNumber = upcoming ? ANGLES_DATA[upcoming].number : null;

    if (upcoming) setActiveAngleId(upcoming);

    setFeedbackToast(
      `✓ Đã lưu Góc ${savedNumber}: ${savedTitle} (${sourceLabel}).` +
        (nextNumber ? ` Chuyển sang Góc ${nextNumber}.` : ' Đã đủ 4 góc ảnh.'),
    );

    window.setTimeout(() => setFeedbackToast(null), 3500);
  };

  /** Mở camera thật qua getUserMedia; môi trường chỉ cho phép qua HTTPS/localhost. */
  const handleOpenCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt này không hỗ trợ truy cập camera. Hãy dùng nút "Tải ảnh từ máy".');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 } },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);
      showFeedback('Đã bật camera. Đặt sản phẩm đúng khung rồi nhấn "Chụp khung chuẩn".');
    } catch {
      setCameraError(
        'Không mở được camera. Hãy cấp quyền truy cập camera, hoặc dùng nút "Tải ảnh từ máy".',
      );
    }
  };

  /**
   * Chụp ảnh từ khung hình camera ra canvas.
   * Ưu tiên kích thước thật của video; nếu chưa có metadata thì dùng 1280×720.
   */
  const handleCapture = () => {
    const video = videoRef.current;

    if (!isCameraOpen || !video || !video.videoWidth) {
      showFeedback('Hãy bật camera trước, hoặc tải ảnh từ máy nếu không dùng camera.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('Không xử lý được ảnh trên thiết bị này.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    savePhoto(canvas.toDataURL('image/jpeg', 0.9), 'camera');
  };

  /** Đọc file người dùng chọn rồi đưa vào data URL. */
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Vui lòng chọn đúng định dạng ảnh (JPG, PNG, HEIC).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') savePhoto(reader.result, 'upload');
    };
    reader.readAsDataURL(file);

    // Cho phép chọn lại cùng một file ngay sau đó.
    event.target.value = '';
  };

  // Phím Space chụp ảnh khi camera đang mở.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.code !== 'Space' || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)) return;
      if (!isCameraOpen) return;

      e.preventDefault();
      handleCapture();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraOpen, activeAngleId]);

  // Construct dynamic Evidence Checklist items
  const dynamicItems: EvidenceChecklistItem[] = ANGLE_IDS.map((id) => {
    const angle = ANGLES_DATA[id];
    const isCompleted = completedIds.includes(id);
    const isActive = id === activeAngleId;
    /**
     * Chỉ góc kế tiếp mới được gắn nhãn "Tiếp theo"; góc `nextAngleId` do
     * thứ tự 01 → 04 quyết định nên lúc mới vào Bước 02 sẽ là góc 02,
     * không bao giờ nhảy thẳng lên góc 03.
     */
    const isNext = !isCompleted && !isActive && id === nextAngleId;

    return {
      id: angle.angleType,
      number: angle.number,
      title: angle.title,
      subtitle: angle.subtitle,
      /** Hiện mã góc để đối chiếu với `missingAngles` mà API trả về. */
      angleType: angle.angleType,
      status: isCompleted ? 'completed' : isActive ? 'active' : isNext ? 'next' : 'locked',
      // Chỉ dùng ảnh thật đã chụp; góc chưa chụp thì để trống (UI hiện số góc).
      thumbnailUrl: photos[id]?.dataUrl,
      badge: isCompleted
        ? (photos[id]?.source === 'upload' ? 'Đã tải' : 'Đã chụp')
        : isActive
          ? 'LIVE'
          : isNext
            ? 'Tiếp theo'
            : undefined,
    };
  });

  const completionPercentage = Math.round((completedIds.length / ANGLE_IDS.length) * 100);

  return (
    <section className="rw-lc-capture">
      {/* Toast Notification on Capture */}
      {feedbackToast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #38BDF8',
          }}
        >
          <Sparkles width={18} height={18} color="#38BDF8" />
          {feedbackToast}
        </div>
      )}

      <div className="rw-lc-capture-grid">
        {/* ============================================================
            LEFT COLUMN: High-Tech Forensic Camera Viewport
        ============================================================ */}
        <div className="rw-lc-capture-main">
          {/* Viewport Top Bar */}
          <div className="rw-lc-capture-camera-head">
            <span><ScanLine width={15} height={15} /> {activeAngle.title}</span>
            <span><Sun width={15} height={15} /> {activeAngle.subtitle}</span>
            <span>GÓC {activeAngle.number} / {String(ANGLE_IDS.length).padStart(2, '0')}</span>
          </div>

          {/* Interactive Optical Viewport */}
          <div className="rw-lc-capture-viewport">
            {/*
              Không dùng ảnh mẫu cố định: chỉ hiện khung hình camera hoặc ảnh
              người bán đã chụp. Trước khi có ảnh thì hiện hướng dẫn chụp.
            */}
            {isCameraOpen ? (
              <video
                ref={videoRef}
                className="rw-lc-capture-video"
                autoPlay
                playsInline
                muted
              />
            ) : activePhoto ? (
              <img
                src={activePhoto.dataUrl}
                alt={`Ảnh bạn đã chụp — Góc ${activeAngle.number} ${activeAngle.title}`}
              />
            ) : (
              <div className="rw-lc-capture-placeholder">
                <ImageIcon />
                <b>Chưa có ảnh góc {activeAngle.number}</b>
                <small>
                  {activeAngle.guidance}
                </small>
                <span>
                  Bấm <em>Bật Camera</em> để chụp, hoặc <em>Tải ảnh từ máy</em>
                </span>
              </div>
            )}

            {/* Flash Effect on Capture */}
            <div className={`rw-lc-capture-flash ${isFlashActive ? 'active' : ''}`} />

            {/*
              Lớp phủ định hướng: làm nổi vùng ngắm giữa khung, tăng tương
              phản để người bán đặt sản phẩm đúng vị trí khi camera đang mở.
            */}
            <div className={`rw-lc-capture-guide${isCameraOpen ? ' is-live' : ''}`} aria-hidden="true">
              <span className="rw-lc-capture-guide-ring" />
              <span className="rw-lc-capture-guide-dot" />
            </div>

            {/* 4 Optical Targeting Brackets */}
            <div className="rw-lc-target-bracket tl" />
            <div className="rw-lc-target-bracket tr" />
            <div className="rw-lc-target-bracket bl" />
            <div className="rw-lc-target-bracket br" />

            {/* Center Crosshair Reticle */}
            <div className="rw-lc-center-reticle" />

            {/* Animated Laser Scanning Line */}
            <div className="rw-lc-laser-scan" />

            {/* Trạng thái khung hình */}
            <div className="rw-lc-hud-tag tr">
              {isCameraOpen ? 'CAMERA ĐANG MỞ • LIVE' : activePhoto ? 'ẢNH CỦA BẠN' : 'CHƯA CÓ ẢNH'}
            </div>
          </div>

          {/* Thanh thao tác — gọn, nút chính luôn dùng để chụp góc hiện tại. */}
          <div className="rw-lc-capture-actions">
            <button
              type="button"
              className="primary"
              onClick={handleCapture}
              disabled={!isCameraOpen}
            >
              <Camera width={16} height={16} />
              {activePhoto ? 'Chụp lại góc này' : 'Chụp ảnh'}
            </button>

            {isCameraOpen ? (
              <button type="button" onClick={stopCamera}>
                <CameraOff width={16} height={16} /> Tắt camera
              </button>
            ) : (
              <button type="button" onClick={handleOpenCamera}>
                <Camera width={16} height={16} /> Bật camera
              </button>
            )}

            <button type="button" onClick={() => uploadInputRef.current?.click()}>
              <Upload width={16} height={16} /> Load ảnh
            </button>

            {/* Input ẩn, kích hoạt bằng nút "Load ảnh". */}
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="rw-lc-capture-file-input"
              onChange={handleUpload}
            />
          </div>

          {/* Lỗi quyền camera / định dạng ảnh */}
          {cameraError && (
            <div className="rw-lc-capture-error" role="alert">
              <CameraOff width={15} height={15} />
              <span>{cameraError}</span>
              <button type="button" aria-label="Đóng cảnh báo" onClick={() => setCameraError(null)}>
                <X width={14} height={14} />
              </button>
            </div>
          )}

          {/* AI Criteria Guidance */}
          <div className="rw-lc-capture-warning">
            <b><Info width={16} height={16} /> Tiêu chuẩn đối soát AI:</b>
            <span>{activeAngle.guidance}</span>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: Evidence Checklist Card
        ============================================================ */}
        <aside className="rw-lc-capture-side">
          <EvidenceChecklist
            items={dynamicItems}
            completionPercentage={completionPercentage}
            subtitle={`Đã hoàn thành ${completedIds.length}/${ANGLE_IDS.length} mẫu ảnh`}
            onItemClick={(item) => setActiveAngleId(item.id)}
          />
        </aside>
      </div>
    </section>
  );
};

export default ListingCaptureStep;
