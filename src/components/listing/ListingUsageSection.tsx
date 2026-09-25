import React, { useMemo, useState } from 'react';
import '../../styles/listing/ListingUsageSection.css';

export type UsageConditionKey = 'like-new' | 'good' | 'fair' | 'worn';
export type UsageFrequencyKey = 'rare' | 'occasional' | 'frequent';
export interface ListingUsageValue {
  usageTime: string;
  frequency: UsageFrequencyKey;
  condition: UsageConditionKey;
  wearSigns: string[];
  repair: 'none' | 'repaired';
  careHistory: string;
}
export interface ListingUsageSectionProps {
  value?: Partial<ListingUsageValue>;
  onChange?: (v: ListingUsageValue) => void;
  minCondition?: UsageConditionKey;
}

export const CONDITION_LABEL: Record<UsageConditionKey, string> = {
  'like-new': 'Like New',
  good: 'Good (Tốt)',
  fair: 'Fair (Khá)',
  worn: 'Worn (Đã SD)',
};
export const CONDITION_RANK: Record<UsageConditionKey, number> = {
  worn: 1,
  fair: 2,
  good: 3,
  'like-new': 4,
};
const FREQS = ['Ít sử dụng', 'Thỉnh thoảng', 'Thường xuyên'];
const CONDDESC: Record<string, string> = { 'like-new': 'Còn tag hoặc không nếp gấp', good: 'Bề mặt ít nguyên vẹn, sờn nhẹ', fair: 'Có vết mòn tự nhiên, đủ khuyết góc', worn: 'Có dấu phục hồi, sờn rõ rệt' };
const WEARALL: string[] = ['Hơi mòn đường may nhẹ', 'Sờn vải', 'Mờ logo tem mác', 'Vết ố nhỏ', 'Trầy xước phụ kiện', 'Không có dấu hiệu đáng kể'];
const DEF: ListingUsageValue = {
  usageTime: '1 – 2 năm',
  frequency: 'rare',
  condition: 'good',
  wearSigns: ['Hơi mòn đường may nhẹ'],
  repair: 'none',
  careHistory: 'Mua lại từ nhà sưu tầm vintage tại Ginza, Tokyo. Đã qua làm sạch bảo quản bằng khí ozone tại Studio ReWear tháng 10/2023. Nguyên khuy sừng nguyên bản.',
};
export const ListingUsageSection: React.FC<ListingUsageSectionProps> = (props) => {
  const minC = props.minCondition ?? 'good';
  const [inner, setInner] = useState<ListingUsageValue>({ ...DEF, ...props.value });
  const m = useMemo(() => ({ ...DEF, ...inner, ...props.value }), [inner, props.value]);
  const patch = (p: Partial<ListingUsageValue>) => {
    const n = { ...m, ...p };
    setInner(n);
    props.onChange?.(n);
  };
  const passed = CONDITION_RANK[m.condition] >= CONDITION_RANK[minC];
  const toggleWear = (w: string) => {
    const NONE = 'Không có dấu hiệu đáng kể';
    if (w === NONE) {
      patch({ wearSigns: m.wearSigns.includes(NONE) ? [] : [NONE] });
      return;
    }
    const withoutNone = m.wearSigns.filter((x) => x !== NONE);
    const has = withoutNone.includes(w);
    patch({ wearSigns: has ? withoutNone.filter((x) => x !== w) : [...withoutNone, w] });
  };
  return (
    <section className="rw-lc-card rw-lc-usage">
      <div className="rw-lc-usage-head">
        <span className="rw-lc-usage-head-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" /><path d="M4 7.5 12 12l8-4.5" /><path d="M12 12v9" /></svg>
        </span>
        <div className="rw-lc-usage-head-text">
          <h2 className="rw-lc-usage-title">2. Thông tin sử dụng &amp; tình trạng</h2>
          <p className="rw-lc-usage-sub">Vui lòng cung cấp thông tin thực tế về quá trình sử dụng sản phẩm.</p>
        </div>
        <span className="rw-lc-usage-pill">DÀNH CHO HÀNG 2HAND</span>
      </div>
      <div className="rw-lc-usage-grid-2">
        <div className="rw-lc-usage-field">
          <label className="rw-lc-usage-label" htmlFor="rw-usage-time">Thời gian đã sử dụng</label>
          <input id="rw-usage-time" className="rw-lc-usage-input" value={m.usageTime} onChange={(e) => patch({ usageTime: e.target.value })} />
        </div>
        <div className="rw-lc-usage-field">
          <span className="rw-lc-usage-label">Tần suất sử dụng</span>
          <div className="rw-lc-usage-freq">
            {( ['rare', 'occasional', 'frequent'] as const).map((k, i) => (
              <button key={k} type="button" className={m.frequency === k ? 'rw-lc-usage-freq-btn active' : 'rw-lc-usage-freq-btn'} onClick={() => patch({ frequency: k })}>{FREQS[i]}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="rw-lc-usage-cond-head">
        <span className="rw-lc-usage-label">Tình trạng sản phẩm</span>
        <span className="rw-lc-usage-cond-note">Tình trạng tối thiểu được kiểm soát theo cấu hình MF-04.</span>
      </div>
      <div className="rw-lc-usage-cond-grid">
        {( ['like-new', 'good', 'fair', 'worn'] as const).map((k) => (
          <label key={k} className={m.condition === k ? 'rw-lc-usage-cond active' : 'rw-lc-usage-cond'}>
            <input type="radio" name="rw-usage-cond" checked={m.condition === k} onChange={() => patch({ condition: k })} />
            <span className="rw-lc-usage-cond-top">
              <span className="rw-lc-usage-cond-title">{CONDITION_LABEL[k]}</span>
              <span className={m.condition === k ? 'rw-lc-usage-dot active' : 'rw-lc-usage-dot'} />
            </span>
            <span className="rw-lc-usage-cond-desc">{CONDDESC[k]}</span>
          </label>
        ))}
      </div>
      <p className="rw-lc-usage-hierarchy">Thứ bậc tình trạng: Like New &gt; Good (Tốt) &gt; Fair (Khá) &gt; Worn (Đã SD).</p>
      <div className="rw-lc-usage-threshold">
        <div className="rw-lc-usage-threshold-head">
          <span className="rw-lc-usage-threshold-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 2.6v5.3c0 4.3-2.9 8-7 9.1-4.1-1.1-7-4.8-7-9.1V5.6L12 3Z" /><path d="m9.2 12 2.1 2.1 3.9-4.3" /></svg>
            Ngưỡng tình trạng tối thiểu
          </span>
          <span className="rw-lc-usage-admin-pill">Quy định bởi Admin</span>
        </div>
        <div className="rw-lc-usage-threshold-row">
          <span>Ngưỡng tối thiểu:&nbsp;<b>{CONDITION_LABEL[minC]}</b><span className="rw-lc-usage-readonly">&nbsp;&nbsp;(Chỉ đọc - Cấu hình hệ thống)</span></span>
          <span className="rw-lc-usage-threshold-current">Tình trạng hiện tại:&nbsp;&nbsp;<span className="rw-lc-usage-current-pill">{CONDITION_LABEL[m.condition]}</span></span>
        </div>
        <div className={`rw-lc-usage-verdict${passed ? ' pass' : ' fail'}`} role="status">
          <span className="rw-lc-usage-verdict-icon" aria-hidden="true">
            {passed
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="m5.5 12.6 4 4L18.5 7.4" /></svg>
              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18" /></svg>}
          </span>
          <div>
            <p className="rw-lc-usage-verdict-title">{passed ? 'Đạt ngưỡng tình trạng tối thiểu' : 'Chưa đạt ngưỡng tình trạng tối thiểu'}</p>
            <p className="rw-lc-usage-verdict-desc">{passed ? 'Đạt yêu cầu Hàng 2hand theo tiêu chuẩn hiện hành. Tình trạng này đủ điều kiện chuyển sang quy trình thẩm định ảnh vi mô ở Bước 02.' : 'Tình trạng hiện tại thấp hơn ngưỡng tối thiểu. Vui lòng phục hồi / nâng cấp trước khi sang Bước 02.'}</p>
          </div>
        </div>
        <p className="rw-lc-usage-rule">Quy tắc hợp lệ: Tình trạng sản phẩm chỉ HỢP LỆ khi bằng hoặc cao hơn ngưỡng tình trạng tối thiểu theo quy định hiện hành. Ví dụ: Good = Hợp lệ; Fair, Worn = Không hợp lệ.</p>
      </div>
      <div className="rw-lc-usage-block">
        <span className="rw-lc-usage-label">Dấu hiệu sử dụng cụ thể (Chọn các mục phù hợp)</span>
        <div className="rw-lc-usage-chips">
          {WEARALL.map((w) => (
            <button key={w} type="button" onClick={() => toggleWear(w)} className={m.wearSigns.includes(w) ? 'rw-lc-usage-chip active' : 'rw-lc-usage-chip'}>{w}</button>
          ))}
        </div>
      </div>
      <div className="rw-lc-usage-block">
        <span className="rw-lc-usage-label">Lịch sử sửa chữa &amp; phục hồi</span>
        <div className="rw-lc-usage-radio-row">
          <label className="rw-lc-usage-radio">
            <input type="radio" name="rw-usage-repair" checked={m.repair === 'none'} onChange={() => patch({ repair: 'none' })} />
            <span className="rw-lc-usage-radio-dot" />
            <span>Chưa từng sửa chữa</span>
          </label>
          <label className="rw-lc-usage-radio">
            <input type="radio" name="rw-usage-repair" checked={m.repair === 'repaired'} onChange={() => patch({ repair: 'repaired' })} />
            <span className="rw-lc-usage-radio-dot" />
            <span>Đã từng sửa chữa</span>
          </label>
        </div>
      </div>
      <div className="rw-lc-usage-block">
        <div className="rw-lc-usage-label-row">
          <span className="rw-lc-usage-label">Lịch sử bảo quản &amp; Vệ sinh đồ hiệu</span>
          <button type="button" className="rw-lc-usage-voice">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="2.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" /><path d="M12 18v3.5" /></svg>
            Ghi âm giọng nói
          </button>
        </div>
        <textarea className="rw-lc-usage-textarea" value={m.careHistory} onChange={(e) => patch({ careHistory: e.target.value })} rows={3} />
      </div>
    </section>
  );
};
export default ListingUsageSection;
