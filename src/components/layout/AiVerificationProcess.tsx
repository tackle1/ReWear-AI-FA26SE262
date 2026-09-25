import React from 'react';
import '../../styles/dashboard/AiVerificationProcess.css';

export interface AiProcessStep {
  phase: string;
  title: string;
  desc: string;
  check: string;
  icon: React.ReactNode;
}

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const AI_PROCESS_STEPS: AiProcessStep[] = [
  {
    phase: 'GIAI ĐOẠN 01',
    title: 'Chụp 5 góc theo hướng dẫn',
    desc: 'Khung ngắm quang học tự động chụp nhãn cổ áo, mật độ đường may vi mô, nhãn giặt và chi tiết khắc khóa kéo kim loại.',
    check: 'Hỗ trợ tự động căn chỉnh khung hình',
    icon: (<StepIcon><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3.2" /><path d="m14.5 9.5 1.5-1.5" /></StepIcon>),
  },
  {
    phase: 'GIAI ĐOẠN 02',
    title: 'Quét nơ-ron đối soát tức thì',
    desc: 'Đối chiếu kho dữ liệu nơ-ron lưu trữ trang phục xa xỉ. Trích xuất chỉ số xác suất và phân loại tình trạng cấu trúc.',
    check: 'Phân tích đặc trưng dưới 1 giây',
    icon: (<StepIcon><path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.2 4.2 2.6 5.6L8 19l3-.8c.3.1.7.1 1 .1a7 7 0 0 0 7-7V8l-7-5Z" /><circle cx="12" cy="11" r="1.4" /><path d="M12 12.4V15M9.8 9.6 8.5 8.3M14.2 9.6l1.3-1.3" /></StepIcon>),
  },
  {
    phase: 'GIAI ĐOẠN 03',
    title: 'Giải ngân ký quỹ nhanh chóng',
    desc: 'Tin đăng gắn huy hiệu AI tăng tốc chuyển đổi gấp 3.4 lần. Tiền được bảo chứng an toàn trong tài khoản ký quỹ và giải ngân ngay sau khi nhận hàng.',
    check: 'Triệt tiêu khiếu nại tráo hàng giả',
    icon: (<StepIcon><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><rect x="15.5" y="13" width="3" height="2.4" rx="0.6" /><path d="m7 6 1.2-2.5h7.6L17 6" /></StepIcon>),
  },
];

export interface AiVerificationProcessProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  steps?: AiProcessStep[];
  footLeft?: string;
  footRight?: string;
}

export const AiVerificationProcess: React.FC<AiVerificationProcessProps> = ({
  title = 'Quy trình xác thực AI dành cho người bán',
  subtitle = '3 chốt kiểm soát cấu trúc tự động giúp gia tăng niềm tin người mua và bảo vệ quyền lợi người bán.',
  badge = 'Khiên chống gian lận người bán',
  steps = AI_PROCESS_STEPS,
  footLeft = 'Đánh giá xác thực AI dựa trên bằng chứng • Bảo vệ người bán trước mọi nguy cơ tráo phụ kiện hoặc tráo hàng.',
  footRight = 'Xem tiêu chuẩn quy trình kiểm định',
}) => {
  return (
    <section className="rw-ai-card">
      <div className="rw-ai-head">
        <div className="rw-ai-head-left">
          <span className="rw-ai-head-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15.5 15.5 4.5 4.5" />
              <path d="M8 10.5c.4-1.5 1.4-2.4 2.5-2.4s2.1.9 2.5 2.4" />
              <circle cx="9" cy="11.5" r="0.4" fill="currentColor" />
              <circle cx="12" cy="11.5" r="0.4" fill="currentColor" />
              <path d="M9.3 13.4c.5.5 1.1.7 1.7.7s1.2-.2 1.7-.7" />
            </svg>
          </span>
          <div>
            <h2 className="rw-ai-title">{title}</h2>
            <p className="rw-ai-sub">{subtitle}</p>
          </div>
        </div>
        <span className="rw-ai-badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />
          </svg>
          {badge}
        </span>
      </div>
      <div className="rw-ai-grid">
        {steps.map((s) => (
          <article className="rw-ai-step" key={s.phase}>
            <div className="rw-ai-step-top">
              <span className="rw-ai-phase">{s.phase}</span>
              <span className="rw-ai-step-icon">{s.icon}</span>
            </div>
            <h3 className="rw-ai-step-title">{s.title}</h3>
            <p className="rw-ai-step-desc">{s.desc}</p>
            <p className="rw-ai-step-check">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" />
                <path d="m8.5 12.3 2.4 2.4 4.6-5" />
              </svg>
              <span>{s.check}</span>
            </p>
          </article>
        ))}
      </div>
      <div className="rw-ai-foot">
        <span className="rw-ai-foot-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 17 5-1 9.5-9.5a2.1 2.1 0 0 0-3-3L5 13l-2 4Z" />
            <path d="m12.5 6.5 3 3" />
            <path d="M4 21h16" />
          </svg>
          {footLeft}
        </span>
        <a className="rw-ai-foot-link" href="#" onClick={(e) => e.preventDefault()}>
          {footRight}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default AiVerificationProcess;
