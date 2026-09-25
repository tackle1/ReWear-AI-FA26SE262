import React, { useState, useEffect } from 'react';
import { Camera, RotateCcw, Upload, Info, ScanLine, Sun, Gauge, Ruler, ShieldCheck, Scan, FileSignature, Check, Sparkles } from 'lucide-react';
import labelReferenceImage from '../../assets/images/Burberry-Brand-Label.png';
import fabricReferenceImage from '../../assets/images/Burberry-Fabric-Texture.png';
import buttonReferenceImage from '../../assets/images/Burberry-Button-Detail.png';
import fullProductReferenceImage from '../../assets/images/Burberry-Vintage-Trench-Coat.png';
import stitchReferenceImage from '../../assets/images/machine-vision-inspection.png';
import EvidenceChecklist from '../../features/listing-ai/components/EvidenceChecklist';
import { EvidenceChecklistItem } from '../../features/listing-ai/types/evidence-checklist.type';
import '../../styles/listing/ListingCaptureStep.css';

export interface ListingCaptureStepProps {
  referenceImage?: string;
  productName?: string;
  brand?: string;
}

interface AngleMetadata {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  image: string;
  lens: string;
  distance: string;
  sharpness: string;
  guidance: string;
  metrics: {
    illuminance: string;
    contrast: string;
    tilt: string;
    coverage: string;
  };
}

const ANGLES_DATA: Record<string, AngleMetadata> = {
  '01': {
    id: '01',
    number: '01',
    title: 'Toàn bộ sản phẩm',
    subtitle: 'Front Silhouette • Đã đạt chuẩn AI',
    image: fullProductReferenceImage,
    lens: 'Ống kính Phổ quát 50mm',
    distance: '120.0 cm',
    sharpness: '99.6%',
    guidance: 'Cần đặt áo phẳng trên bề mặt trung tính, cúc cài ngay ngắn và mở phẳng tà áo theo tỷ lệ khung viền chuẩn xác.',
    metrics: {
      illuminance: '5410K',
      contrast: '0.94 MTF',
      tilt: '0.0° Trục diện',
      coverage: '100% Khung',
    },
  },
  '02': {
    id: '02',
    number: '02',
    title: 'Nhãn / Tag thương hiệu',
    subtitle: 'Brand Label & Kerning',
    image: labelReferenceImage,
    lens: 'Ống kính Macro 4K Micro-Laser',
    distance: '14.8 cm',
    sharpness: '99.1%',
    guidance: 'Cần ánh đèn ở Burberrys và đúng khung ngắm minh chính nhất. Đảm bảo độ sắc nét vi cấu trúc thớ dệt, mã sản phẩm phải tỷ lệ khung không bị lớp quang học bởi nếp gấp.',
    metrics: {
      illuminance: '5420K',
      contrast: '0.89 MTF',
      tilt: '89.9° Trục diện',
      coverage: '100% Khung',
    },
  },
  '03': {
    id: '03',
    number: '03',
    title: 'Đường may ve áo & gấu',
    subtitle: 'Stitching Density & Hemming',
    image: stitchReferenceImage,
    lens: 'Ống kính Vi cự ly 100mm',
    distance: '8.5 cm',
    sharpness: '99.4%',
    guidance: 'Soi thẳng vào đường chỉ chần viền cổ áo và gấu áo. Đảm bảo mật độ mũi may đều đặn 3.4mm/mũi, không sờn chỉ hay gián đoạn sợi.',
    metrics: {
      illuminance: '5430K',
      contrast: '0.92 MTF',
      tilt: '90.0° Trục diện',
      coverage: '98% Khung',
    },
  },
  '04': {
    id: '04',
    number: '04',
    title: 'Phụ kiện kim loại & Khuy áo',
    subtitle: 'Engraved Horn Buttons & Buckles',
    image: buttonReferenceImage,
    lens: 'Ống kính Phản xạ đa phổ',
    distance: '10.2 cm',
    sharpness: '98.9%',
    guidance: 'Căn nét logo khắc laser sắc cạnh trên khuy sừng tự nhiên hoặc bề mặt kim loại khóa đai, tránh ánh lóa phản xạ ngược.',
    metrics: {
      illuminance: '5400K',
      contrast: '0.88 MTF',
      tilt: '89.8° Trục diện',
      coverage: '100% Khung',
    },
  },
  '05': {
    id: '05',
    number: '05',
    title: 'Kết cấu vải & Lót Nova Check',
    subtitle: 'Cotton Twill Weave & Plaid Align',
    image: fabricReferenceImage,
    lens: 'Ống kính Phân tích thớ sợi Gabardine',
    distance: '6.0 cm',
    sharpness: '99.5%',
    guidance: 'Kiểm tra hoa văn kẻ sọc Nova Check chính tông, đối soát góc nghiêng dệt chéo dệt đôi cotton gabardine bảo chứng nguyên bản.',
    metrics: {
      illuminance: '5425K',
      contrast: '0.95 MTF',
      tilt: '90.1° Trục diện',
      coverage: '100% Khung',
    },
  },
};

export const ListingCaptureHeader: React.FC = () => (
  <div className="rw-lc-capture-topline">
    <div className="rw-lc-capture-device">
      <span><Camera width={20} height={20} /></span>
      <div>
        <b>
          Tiến độ chụp ảnh góc bằng chứng <em>ISO-CALIBRATED</em>
        </b>
        <small>Hệ thống Forensic Machine Vision 4K chuẩn giám định ReWear Escrow</small>
      </div>
    </div>
    <div className="rw-lc-capture-progress">
      <span>Tiến độ góc ảnh:</span>
      <i><b style={{ width: '20%' }} /></i>
      <strong>1/5 hoàn thành</strong>
    </div>
  </div>
);

export const ListingCaptureStep: React.FC<ListingCaptureStepProps> = ({
  brand = 'Burberry',
}) => {
  const [activeAngleId, setActiveAngleId] = useState<string>('02');
  const [completedIds, setCompletedIds] = useState<string[]>(['01']);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const activeAngle = ANGLES_DATA[activeAngleId] || ANGLES_DATA['02'];

  // Handle capture action (simulated forensic shutter)
  const handleCapture = () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    setFeedbackToast(`✓ Đã phân tích quang học thành công Góc ${activeAngle.number}: ${activeAngle.title}`);
    setTimeout(() => setFeedbackToast(null), 3500);

    if (!completedIds.includes(activeAngleId)) {
      setCompletedIds((prev) => [...prev, activeAngleId]);
    }
  };

  // Listen to keyboard Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAngleId, completedIds]);

  // Construct dynamic Evidence Checklist items
  const dynamicItems: EvidenceChecklistItem[] = Object.keys(ANGLES_DATA).map((id) => {
    const angle = ANGLES_DATA[id];
    const isCompleted = completedIds.includes(id);
    const isActive = id === activeAngleId;
    const isNext = !isCompleted && !isActive && id === '03';

    return {
      id: angle.id,
      number: angle.number,
      title: angle.title,
      subtitle: angle.subtitle,
      status: isCompleted ? 'completed' : isActive ? 'active' : isNext ? 'next' : 'locked',
      thumbnailUrl: id === '01' ? fullProductReferenceImage : angle.image,
      badge: isActive ? 'LIVE' : isNext ? 'Tiếp theo' : undefined,
    };
  });

  const completionPercentage = Math.round((completedIds.length / 5) * 100);

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
            <span><ScanLine width={15} height={15} /> {activeAngle.lens}</span>
            <span><Sun width={15} height={15} /> Chiếu sáng chuẩn 5400K D50</span>
            <span><Gauge width={15} height={15} /> Độ nghiêng: 0.1° (Tối ưu)</span>
            <span>GÓC {activeAngle.number} / 05</span>
          </div>

          {/* Interactive Optical Viewport */}
          <div className="rw-lc-capture-viewport">
            <img
              src={activeAngle.image}
              alt={`Ảnh góc ${activeAngle.number} - ${activeAngle.title}`}
            />

            {/* Flash Effect on Capture */}
            <div className={`rw-lc-capture-flash ${isFlashActive ? 'active' : ''}`} />

            {/* 4 Optical Targeting Brackets */}
            <div className="rw-lc-target-bracket tl" />
            <div className="rw-lc-target-bracket tr" />
            <div className="rw-lc-target-bracket bl" />
            <div className="rw-lc-target-bracket br" />

            {/* Center Crosshair Reticle */}
            <div className="rw-lc-center-reticle" />

            {/* Animated Laser Scanning Line */}
            <div className="rw-lc-laser-scan" />

            {/* High-Tech HUD Badges */}
            <div className="rw-lc-hud-tag tl">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              Độ sắc nét: {activeAngle.sharpness}
            </div>

            <div className="rw-lc-hud-tag tr">
              RES: 3840 × 2160 • RAW MODE
            </div>

            <div className="rw-lc-hud-tag bl">
              <Ruler width={13} height={13} /> Khoảng cách: {activeAngle.distance}
            </div>

            <div className="rw-lc-hud-tag br">
              TỰ ĐỘNG KHÓA NÉT (AF-LOCK)
            </div>
          </div>

          {/* Camera Metadata Strip */}
          <div className="rw-lc-capture-camera-meta">
            <span>● SPECTRAL COMPLIANT (5400K D50)</span>
            <span>ISO 160 &nbsp; ƒ/8.0 &nbsp; 1/160 sec</span>
            <span>FPS: 60 • EV: ±0.0 • ISO: 100</span>
          </div>

          {/* Action Buttons */}
          <div className="rw-lc-capture-actions">
            <button type="button" onClick={() => setCompletedIds(['01'])}>
              <RotateCcw width={15} height={15} /> Chụp lại
            </button>
            <button type="button" onClick={() => handleCapture()}>
              <Camera width={15} height={15} /> Bật Camera
            </button>
            <button type="button">
              <Upload width={15} height={15} /> Tải ảnh RAW/DNG
            </button>
            <button type="button" className="primary" onClick={handleCapture}>
              <kbd>Space</kbd>
              <span>Chụp khung chuẩn</span>
            </button>
          </div>

          {/* AI Criteria Guidance */}
          <div className="rw-lc-capture-warning">
            <b><Info width={16} height={16} /> Tiêu chuẩn đối soát AI:</b>
            <span>{activeAngle.guidance}</span>
          </div>

          {/* Live AI Pre-Check Metrics Wrap */}
          <div className="rw-lc-capture-metrics-wrap">
            <div className="rw-lc-capture-metrics-head">
              <strong>Chỉ số quang học tức thời (Live AI Pre-Check)</strong>
              <span>ĐẠT CHUẨN 4/4 TIÊU CHÍ</span>
            </div>
            <div className="rw-lc-capture-metrics">
              <div>
                <span>Chiếu sáng D50</span>
                <b>{activeAngle.metrics.illuminance} <Check width={14} height={14} /></b>
              </div>
              <div>
                <span>Độ tương phản vi mô</span>
                <b>{activeAngle.metrics.contrast} <Check width={14} height={14} /></b>
              </div>
              <div>
                <span>Góc trục ống kính</span>
                <b>{activeAngle.metrics.tilt} <Check width={14} height={14} /></b>
              </div>
              <div>
                <span>Độ phủ chi tiết nhận</span>
                <b>{activeAngle.metrics.coverage} <Check width={14} height={14} /></b>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: 5 Góc bằng chứng (100% Matching Card) & Proofs
        ============================================================ */}
        <aside className="rw-lc-capture-side">
          {/* The 100% Matching Evidence Checklist Card */}
          <EvidenceChecklist
            items={dynamicItems}
            completionPercentage={completionPercentage}
            subtitle={`Đã hoàn thành ${completedIds.length}/5 mẫu ảnh`}
            onItemClick={(item) => setActiveAngleId(item.id)}
          />

          {/* Escrow Protection Certificate Card */}
          <section className="rw-lc-capture-protection">
            <h3><ShieldCheck width={18} height={18} /> Cam kết bảo vệ tranh chấp người bán</h3>
            <p>
              Tất cả 5 góc ảnh được đảm bảo mã hóa (SHA-256) và gắn dấu thời gian (Timestamp) ngay sau khi chụp. Dữ liệu này trở thành bằng chứng pháp lý bất biến bảo vệ bạn trước mọi khiếu nại hàng nhái hoặc hoàn đổi hàng từ người mua qua hợp đồng ký quỹ ReWear Escrow.
            </p>
            <span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileSignature width={14} height={14} color="#2563EB" />
                Mã phiên: 0x9f4a8b2c...e12d
              </span>
              <b>ĐÃ KÝ SỐ MÃ HÓA</b>
            </span>
          </section>

          {/* Standard Archive Reference Cards */}
          <section className="rw-lc-capture-reference">
            <b>
              <span>Mẫu tiêu chuẩn {brand} đối soát song song</span>
              <Scan width={16} height={16} color="#64748B" />
            </b>
            <div className="rw-lc-capture-reference-grid">
              <figure>
                <img src={fabricReferenceImage} alt="Vải dệt chuẩn Burberry Archive" />
                <figcaption>Vải dệt Gabardine chuẩn</figcaption>
              </figure>
              <figure>
                <img src={buttonReferenceImage} alt="Khuy áo đối soát chuẩn Haute Couture" />
                <figcaption>Khuy sừng khắc chuẩn</figcaption>
              </figure>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default ListingCaptureStep;
