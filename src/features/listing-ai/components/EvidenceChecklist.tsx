import React from 'react';
import { EvidenceChecklistItem, EvidenceChecklistProps } from '../types/evidence-checklist.type';
import coatImage from '../../../assets/images/Burberry-Vintage-Trench-Coat.png';

export const DEFAULT_EVIDENCE_ITEMS: EvidenceChecklistItem[] = [
  {
    id: '01',
    number: '01',
    title: 'Toàn bộ sản phẩm',
    subtitle: 'Front Silhouette • Đã đạt chuẩn AI',
    status: 'completed',
    thumbnailUrl: coatImage,
  },
  {
    id: '02',
    number: '02',
    title: 'Nhãn / Tag thương hiệu',
    subtitle: 'Brand Label & Kerning',
    status: 'active',
    badge: 'LIVE',
  },
  {
    id: '03',
    number: '03',
    title: 'Đường may ve áo & gấu',
    subtitle: 'Stitching Density & Hemming',
    status: 'next',
    badge: 'Tiếp theo',
  },
  {
    id: '04',
    number: '04',
    title: 'Phụ kiện kim loại & Khuy áo',
    subtitle: 'Engraved Horn Buttons & Buckles',
    status: 'locked',
  },
  {
    id: '05',
    number: '05',
    title: 'Kết cấu vải & Lót Nova Check',
    subtitle: 'Cotton Twill Weave & Plaid Align',
    status: 'locked',
  },
];

export const EvidenceChecklist: React.FC<EvidenceChecklistProps> = ({
  items = DEFAULT_EVIDENCE_ITEMS,
  title = '5 Góc bằng chứng bắt buộc (Evidence Checklist)',
  subtitle = 'Đã hoàn thành 1/5 mẫu ảnh',
  completionPercentage = 20,
  onItemClick,
  className = '',
  style,
}) => {
  return (
    <div
      className={`rw-evidence-checklist-card ${className}`}
      style={{
        width: '100%',
        maxWidth: '430px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '28px 24px 22px 24px',
        boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.06), 0 2px 10px -2px rgba(15, 23, 42, 0.03)',
        border: '1px solid #F1F5F9',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <style>{`
        @keyframes rw-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '17.5px',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              margin: '5px 0 0 0',
              fontWeight: 400,
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* 20% Badge */}
        <div
          style={{
            backgroundColor: '#DBEAFE',
            color: '#1E40AF',
            fontSize: '13.5px',
            fontWeight: 800,
            padding: '5px 12px',
            borderRadius: '8px',
            letterSpacing: '0.01em',
            flexShrink: 0,
          }}
        >
          {completionPercentage}%
        </div>
      </div>

      {/* ── Checklist Items List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, index) => {
          const isCompleted = item.status === 'completed';
          const isActive = item.status === 'active';
          const isNext = item.status === 'next';

          if (isCompleted) {
            return (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item, index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F0F6FE',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  cursor: onItemClick ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                  border: '1px solid transparent',
                }}
              >
                {/* Left group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Thumbnail with overlay checkmark */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#C8BEB2',
                      backgroundImage: `url(${item.thumbnailUrl || coatImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Semi-transparent dark overlay for clarity */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.18)',
                      }}
                    />
                    {/* White tick check inside photo */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  {/* Texts */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                        {item.number}.
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '3px', fontWeight: 400 }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right side check circle icon */}
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '2px' }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="16 10 11 15 8 12" />
                  </svg>
                </div>
              </div>
            );
          }

          if (isActive) {
            return (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item, index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  cursor: onItemClick ? 'pointer' : 'default',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.35)',
                }}
              >
                {/* Left group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Number box 02 */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#052C85',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '17px',
                        fontWeight: 800,
                        color: '#3B82F6',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {item.number}
                    </span>
                  </div>

                  {/* Texts */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* LIVE Badge */}
                      <span
                        style={{
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.04em',
                          lineHeight: '1.2',
                        }}
                      >
                        LIVE
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '3px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right side spinning ring loader */}
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2.5px solid rgba(59, 130, 246, 0.25)',
                      borderTopColor: '#3B82F6',
                      animation: 'rw-spin 0.9s linear infinite',
                    }}
                  />
                </div>
              </div>
            );
          }

          if (isNext) {
            return (
              <div
                key={item.id}
                onClick={() => onItemClick && onItemClick(item, index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  cursor: onItemClick ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* Left group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Number box 03 */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#EDF4FE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#64748B',
                      }}
                    >
                      {item.number}
                    </span>
                  </div>

                  {/* Texts */}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right side "Tiếp theo" pill badge */}
                <div
                  style={{
                    backgroundColor: '#EDF4FE',
                    color: '#475569',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Tiếp theo
                </div>
              </div>
            );
          }

          // Locked items (04, 05)
          return (
            <div
              key={item.id}
              onClick={() => onItemClick && onItemClick(item, index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '10px 14px',
                cursor: onItemClick ? 'pointer' : 'default',
              }}
            >
              {/* Left group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Number box */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: '#EDF4FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#64748B',
                    }}
                  >
                    {item.number}
                  </span>
                </div>

                {/* Texts */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#334155', letterSpacing: '-0.01em' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '3px' }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {/* Right side lock icon */}
              <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px', color: '#94A3B8' }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Note / Footer ── */}
      <div
        style={{
          borderTop: '1px solid #EDF2F7',
          marginTop: '18px',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <span
          style={{
            fontSize: '12.5px',
            color: '#334155',
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        >
          Tự động tối ưu hóa bù trừ sáng bằng AI
        </span>
      </div>
    </div>
  );
};

export default EvidenceChecklist;
