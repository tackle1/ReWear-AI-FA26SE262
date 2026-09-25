import React, { useState } from 'react';
import '../../styles/dashboard/RecentListingsTable.css';
import burberryThumb from '../../assets/images/Burberry-Vintage-Trench-Coat.png';
import nikeThumb from '../../assets/images/Nike-Dunk-Low-Retro-White-Black.png';
import gucciThumb from '../../assets/images/Gucci-Dionysus-GG-Shoulder-Bag.png';
import acneThumb from '../../assets/images/Acne-Studios-Oversized-Wool-Scarf.png';

export type ListingFilter = 'all' | 'verified' | 'review' | 'draft';
export interface ListingRow {
  id: string; name: string; sku: string; date: string;
  thumbnail?: string;
  category: string; price: string; priceSub: string;
  score: string; scoreWarn?: boolean;
  condition: string; escrow: string; escrowTone: 'blue' | 'gray';
  action: string; actionIcon: 'eye' | 'tag' | 'receipt';
}

export const LISTING_ROWS: ListingRow[] = [
  { id: '1', name: 'Burberry Vintage Trench Coat', sku: 'SKU-BBR-88219', date: 'Nov 12, 2024', thumbnail: burberryThumb, category: 'Áo khoác & Măng tô', price: '8.500.000 ₫', priceSub: 'Giá ước tính 11.2M ₫', score: '98.4% Độ tin cậy', condition: 'Tình trạng Hoàn hảo • Khớp đường may tuyệt đối', escrow: 'Active & Escrow Ready', escrowTone: 'blue', action: 'AI Evidence', actionIcon: 'eye' },
  { id: '2', name: 'Nike Dunk Low Retro White Black', sku: 'SKU-NK-94021', date: 'Nov 10, 2024', thumbnail: nikeThumb, category: 'Giày dép', price: '2.400.000 ₫', priceSub: 'Giá thị trường: 2.55M ₫', score: '94.1% Độ tin cậy', condition: 'Tình trạng Tuyệt vời • Nhẵn nhẹ bề mặt', escrow: 'Active', escrowTone: 'blue', action: 'AI Evidence', actionIcon: 'eye' },
  { id: '3', name: 'Gucci Dionysus GG Shoulder Bag', sku: 'SKU-GC-11928', date: 'Today, 11:32 AM', thumbnail: gucciThumb, category: 'Túi xách', price: '22.000.000 ₫', priceSub: 'Giá gốc: 48.0M ₫', score: '72.4% (Cần duyệt thủ công)', scoreWarn: true, condition: 'Dưới ngưỡng 75% — Chuyển chuyên viên thẩm định thủ công', escrow: 'Pending Admin Review', escrowTone: 'blue', action: 'Provide Label Shot', actionIcon: 'tag' },
  { id: '4', name: 'Acne Studios Oversized Wool Scarf', sku: 'SKU-ACN-00384', date: 'Oct 28, 2024', thumbnail: acneThumb, category: 'Phụ kiện', price: '3.200.000 ₫', priceSub: 'Đã thanh toán qua Ký quỹ', score: '96.8% Độ tin cậy', condition: 'Tình trạng Hoàn hảo • Vân thớ sợi đạt chuẩn', escrow: 'Sold & Cleared', escrowTone: 'gray', action: 'Escrow Receipt', actionIcon: 'receipt' },
];

export const LISTING_FILTERS = [
  { key: 'all', label: 'Tất cả (24)' },
  { key: 'verified', label: 'Đã xác thực AI (21)' },
  { key: 'review', label: 'Cần kiểm tra (2)' },
  { key: 'draft', label: 'Bản nháp (1)' },
] as const;
function ActionIcon({ kind }: { kind: 'eye' | 'tag' | 'receipt' }) {
  if (kind === 'tag') return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 0-8 8" /><circle cx="12" cy="12" r="1.6" /><path d="M12 10V4M10 6l2-2 2 2" /></svg>);
  if (kind === 'receipt') return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4L10 21l-2-1.4L6 21V3Z" /><path d="M9 8h6M9 12h6" /></svg>);
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
}

function ScoreIcon({ warn }: { warn?: boolean }) {
  if (warn) return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.5" /></svg>);
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.8 13.7 4l2.1-.5 1 1.9 2.1.6-.2 2.1 1.4 1.6-1.4 1.6.2 2.1-2.1.6-1 1.9-2.1-.5L12 16.6 10.3 15.4l-2.1.5-1-1.9-2.1-.6.2-2.1L3.9 9.7l1.4-1.6-.2-2.1 2.1-.6 1-1.9 2.1.5L12 2.8Z" /><path d="m9.3 9.7 2 2 3.4-3.8" /></svg>);
}

export const RecentListingsTable: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  return (
    <section className="rw-list-card">
      <div className="rw-list-head">
        <div>
          <h2 className="rw-list-title">Tin đăng gần đây &amp; Trạng thái xác thực</h2>
          <p className="rw-list-sub">Quản lý kho hàng, theo dõi điểm số giám định và gửi duyệt các sản phẩm chờ xử lý.</p>
        </div>
        <div className="rw-list-tabs" role="tablist">
          {LISTING_FILTERS.map((f) => (
            <button key={f.key} role="tab" aria-selected={filter === f.key} className={`rw-tab${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="rw-table-wrap">
        <table className="rw-table">
          <thead>
            <tr><th>SẢN PHẨM &amp; PHÂN LOẠI</th><th>DANH MỤC</th><th>GIÁ NIÊM YẾT</th><th>ĐIỂM TIN CẬY &amp; TÌNH TRẠNG AI</th><th>TRẠNG THÁI KÝ QUỸ</th><th className="rw-th-right">HÀNH ĐỘNG</th></tr>
          </thead>
          <tbody>
            {LISTING_ROWS.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="rw-prod">
                    {r.thumbnail ? (
                      <img className="rw-thumb-img" src={r.thumbnail} alt={r.name} />
                    ) : (
                      <span className="rw-thumb" aria-hidden="true">{r.name.charAt(0)}</span>
                    )}
                    <div><div className="rw-prod-name">{r.name}</div><div className="rw-prod-sku">{r.sku} &nbsp;•&nbsp; {r.date}</div></div>
                  </div>
                </td>
                <td><span className="rw-cat">{r.category}</span></td>
                <td><div className="rw-price">{r.price}</div><div className="rw-price-sub">{r.priceSub}</div></td>
                <td>
                  <div className={`rw-score${r.scoreWarn ? ' warn' : ''}`}><ScoreIcon warn={r.scoreWarn} /><span>{r.score}</span></div>
                  <span className="rw-cond">{r.condition}</span>
                </td>
                <td><span className={`rw-escrow ${r.escrowTone}`}><i />{r.escrow}</span></td>
                <td>
                  <div className="rw-actions">
                    <button type="button" className="rw-act-btn"><ActionIcon kind={r.actionIcon} />{r.action}</button>
                    <button type="button" className="rw-kebab" aria-label="Tùy chọn">⋮</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rw-list-foot">
        <span>Hiển thị 4 trên tổng số 24 hồ sơ ký gửi đã xác thực</span>
        <div className="rw-pager">
          <button type="button" className="rw-page-btn" disabled>Trước</button>
          <span className="rw-page-cur">1</span>
          <button type="button" className="rw-page-btn">Sau</button>
        </div>
      </div>
    </section>
  );
};

export default RecentListingsTable;
