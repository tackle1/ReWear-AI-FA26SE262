import React, { useMemo, useState } from 'react';
import '../../styles/dashboard/RecentListingsTable.css';
import { SellerListingRow, SellerListingStage } from '../../features/seller/hooks/useSellerDashboard';

/** Nhóm lọc theo giai đoạn của tin. */
export type ListingFilter = 'all' | SellerListingStage;

export interface ListingFilterOption {
  key: ListingFilter;
  label: string;
  count: number;
}

/** Định dạng giá kiểu Việt Nam, ví dụ `8.500.000 ₫`. */
const formatPrice = (price: number): string =>
  Number.isFinite(price) ? `${price.toLocaleString('vi-VN')} ₫` : '—';

/** Tô màu badge trạng thái theo giai đoạn. */
const STAGE_TONE: Record<SellerListingStage, 'blue' | 'gray'> = {
  verified: 'blue',
  review: 'blue',
  rejected: 'gray',
  draft: 'gray',
};

function ActionIcon({ kind }: { kind: 'eye' | 'tag' | 'receipt' }) {
  if (kind === 'tag') return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 0-8 8" /><circle cx="12" cy="12" r="1.6" /><path d="M12 10V4M10 6l2-2 2 2" /></svg>);
  if (kind === 'receipt') return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4L10 21l-2-1.4L6 21V3Z" /><path d="M9 8h6M9 12h6" /></svg>);
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
}

function ScoreIcon({ warn }: { warn?: boolean }) {
  if (warn) return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 10v4M12 17.5v.5" /></svg>);
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2.8 13.7 4l2.1-.5 1 1.9 2.1.6-.2 2.1 1.4 1.6-1.4 1.6.2 2.1-2.1.6-1 1.9-2.1-.5L12 16.6 10.3 15.4l-2.1.5-1-1.9-2.1-.6.2-2.1L3.9 9.7l1.4-1.6-.2-2.1 2.1-.6 1-1.9 2.1.5L12 2.8Z" /><path d="m9.3 9.7 2 2 3.4-3.8" /></svg>);
}

export interface RecentListingsTableProps {
  /** Dữ liệu thật từ `useSellerDashboard`. */
  rows: SellerListingRow[];
  isLoading: boolean;
  /** Ngưỡng đăng tự động để đánh dấu tin dưới ngưỡng. */
  autoPublishThreshold: number;
}

export const RecentListingsTable: React.FC<RecentListingsTableProps> = ({
  rows,
  isLoading,
  autoPublishThreshold,
}) => {
  const [filter, setFilter] = useState<ListingFilter>('all');

  /*
   * Nhãn và số đếm của các tab lọc được TÍNH TỪ dữ liệu thật, không ghi cứng —
   * trước đây tab luôn hiện "(24)/(21)/(2)/(1)" bất kể seller có bao nhiêu tin.
   */
  const filters = useMemo<ListingFilterOption[]>(() => {
    const countOf = (stage: SellerListingStage) =>
      rows.filter((row) => row.stage === stage).length;

    return [
      { key: 'all', label: 'Tất cả', count: rows.length },
      { key: 'verified', label: 'Đã xác thực AI', count: countOf('verified') },
      { key: 'review', label: 'Cần kiểm tra', count: countOf('review') },
      { key: 'rejected', label: 'Bị từ chối', count: countOf('rejected') },
    ];
  }, [rows]);

  const visibleRows = useMemo(
    () => (filter === 'all' ? rows : rows.filter((row) => row.stage === filter)),
    [rows, filter],
  );

  /** Hành động gợi ý theo giai đoạn — nhãn, không phải số liệu. */
  const actionOf = (stage: SellerListingStage) => {
    if (stage === 'verified') return { label: 'AI Evidence', icon: 'eye' as const };
    if (stage === 'review') return { label: 'Chờ thẩm định', icon: 'tag' as const };
    return { label: 'Xem hồ sơ', icon: 'receipt' as const };
  };

  return (
    <section className="rw-list-card">
      <div className="rw-list-head">
        <div>
          <h2 className="rw-list-title">Tin đăng gần đây &amp; Trạng thái xác thực</h2>
          <p className="rw-list-sub">Quản lý kho hàng, theo dõi điểm số giám định và gửi duyệt các sản phẩm chờ xử lý.</p>
        </div>
        <div className="rw-list-tabs" role="tablist">
          {filters.map((f) => (
            <button
              key={f.key}
              role="tab"
              type="button"
              aria-selected={filter === f.key}
              className={`rw-tab${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>
      <div className="rw-table-wrap">
        <table className="rw-table">
          <thead>
            <tr><th>SẢN PHẨM &amp; PHÂN LOẠI</th><th>DANH MỤC</th><th>GIÁ NIÊM YẾT</th><th>ĐIỂM TIN CẬY &amp; TÌNH TRẠNG AI</th><th>TRẠNG THÁI</th><th className="rw-th-right">HÀNH ĐỘNG</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: '28px 12px', textAlign: 'center', color: '#64748B' }}>Đang tải tin đăng của bạn…</td></tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '28px 12px', textAlign: 'center', color: '#64748B' }}>
                  {rows.length === 0
                    ? 'Bạn chưa có tin đăng nào. Bấm “Tạo tin đăng mới” để bắt đầu.'
                    : 'Không có tin đăng nào ở nhóm lọc này.'}
                </td>
              </tr>
            ) : (
              visibleRows.map((r) => {
                const scoreWarn =
                  r.score !== null && r.score < autoPublishThreshold;
                const action = actionOf(r.stage);

                return (
                  <tr key={r.id}>
                    <td>
                      <div className="rw-prod">
                        {r.thumbnail ? (
                          <img className="rw-thumb-img" src={r.thumbnail} alt={r.name} />
                        ) : (
                          <span className="rw-thumb" aria-hidden="true">{r.name.charAt(0)}</span>
                        )}
                        <div>
                          <div className="rw-prod-name">{r.name}</div>
                          <div className="rw-prod-sku">{r.id} &nbsp;•&nbsp; {r.createdAt}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="rw-cat">{r.category}</span></td>
                    <td><div className="rw-price">{formatPrice(r.price)}</div></td>
                    <td>
                      <div className={`rw-score${scoreWarn ? ' warn' : ''}`}>
                        <ScoreIcon warn={scoreWarn} />
                        <span>{r.score === null ? 'Chưa chấm điểm' : `${r.score}% Độ tin cậy`}</span>
                      </div>
                      <span className="rw-cond">{r.condition}</span>
                    </td>
                    <td>
                      <span className={`rw-escrow ${STAGE_TONE[r.stage]}`}>
                        <i />{r.statusLabel}
                      </span>
                      {r.statusReason && <div className="rw-cond">{r.statusReason}</div>}
                    </td>
                    <td>
                      <div className="rw-actions">
                        <button type="button" className="rw-act-btn">
                          <ActionIcon kind={action.icon} />{action.label}
                        </button>
                        <button type="button" className="rw-kebab" aria-label="Tùy chọn">⋮</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="rw-list-foot">
        <span>
          {isLoading
            ? 'Đang tải dữ liệu…'
            : `Hiển thị ${visibleRows.length} trên tổng số ${rows.length} tin đăng`}
        </span>
        <div className="rw-pager">
          <button type="button" className="rw-page-btn" disabled>Trước</button>
          <span className="rw-page-cur">1</span>
          <button type="button" className="rw-page-btn" disabled>Sau</button>
        </div>
      </div>
    </section>
  );
};

export default RecentListingsTable;
