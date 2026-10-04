import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Rocket, TriangleAlert } from 'lucide-react';
import ROUTES from '../../../routes/routes.config';
import ListingTopbar from '../../../components/listing/ListingTopbar';
import ListingPublishStep from '../../../components/listing/ListingPublishStep';
import ListingCreateActionBar from '../../../components/listing/ListingCreateActionBar';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useSubmitListing from '../hooks/useSubmitListing';
import { clearPendingDraft, readPendingDraft } from '../services/listingPayload';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/listing/ListingCreate.css';

/*
 * Chỉ số bước hiển thị trên thanh hành động — xem giải thích ở `ListingFlagPage`.
 */
const STEP_INDEX = 4;
const STEP_TOTAL = 5;

/**
 * TRANG ĐĂNG TIN — nhánh trên của luồng sau Bước 05.
 *
 * Điểm confidence từ ngưỡng đăng trở lên (>= 75) thì luồng rẽ sang đây. Đây
 * chính là "Bước 06" cũ, nay là trang riêng nên có URL và nút quay lại rõ
 * ràng thay vì một bước trong thanh tiến trình.
 *
 * Hành vi gọi API giống hệt trang Gắn cờ (dùng chung `useSubmitListing`) —
 * khác nhau ở trạng thái backend ĐỢI: `ACTIVE` (đăng ngay) thay vì `FLAGGED`.
 */
export const ListingPublishPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useCurrentUser();
  const draft = useMemo(() => readPendingDraft(), []);

  const { status, result, error, isUnexpectedStatus, submit } = useSubmitListing(
    userId,
    draft,
    'ACTIVE',
  );

  const isSubmitting = status === 'submitting';
  const isSubmitted = status === 'success';

  const handleSubmit = () => {
    if (isSubmitted) return;
    /* Xoá hồ sơ chờ để F5 không tạo trùng tin đã đăng. */
    clearPendingDraft();
    void submit();
  };

  return (
    <div className="rw-lc-page rw-dashboard-theme">
      <ListingTopbar onBack={() => navigate(ROUTES.LISTING.CREATE)} />

      <main className="rw-lc-main">
        {!draft ? (
          <section className="rw-flag-empty" role="alert">
            <Rocket width={30} height={30} aria-hidden="true" />
            <h1>Không tìm thấy hồ sơ chờ đăng tin</h1>
            <p>
              Trang này chỉ mở sau khi Bước 05 có điểm từ 75% trở lên. Phiên làm
              việc đã hết hạn hoặc bạn mở thẳng đường dẫn này.
            </p>
            <button type="button" onClick={() => navigate(ROUTES.LISTING.CREATE)}>
              Quay lại Bước 01
            </button>
          </section>
        ) : (
          <ListingPublishStep
            image={draft.thumbnail}
            name={draft.name}
            brand={draft.brand}
            category={draft.category}
            size={draft.size}
            pattern={draft.pattern}
            price={draft.price}
            sku={draft.sku}
            /* Điểm THẬT từ Bước 05 — không có thì ẩn badge, không bịa số. */
            confidence={draft.confidence}
            brandSegment={draft.brandSegment}
            billPenaltyApplied={draft.billPenaltyApplied ?? false}
            /* Trạng thái THẬT backend trả về, không đoán trước khi có kết quả. */
            status={result?.status}
            statusReason={result?.statusReason}
          />
        )}
      </main>
      {/* Thông báo trạng thái đăng tin */}
      {(isSubmitted || error || isUnexpectedStatus) && (
        <div
          className={`rw-lc-submit-toast${error || isUnexpectedStatus ? ' is-error' : ''}`}
          role={error ? 'alert' : 'status'}
        >
          {error ? (
            <span>{error}</span>
          ) : isUnexpectedStatus ? (
            <span>
              Lưu ý: hệ thống trả trạng thái “{result?.status}” khác dự kiến
              “ACTIVE”. Vui lòng kiểm tra lại trạng thái tin đăng.
            </span>
          ) : (
            <span className="rw-flag-done">
              <CircleCheck width={16} height={16} aria-hidden="true" />
              Đã đăng tin thành công
              {result?.listingId ? ` (mã: ${result.listingId})` : ''}.
            </span>
          )}
        </div>
      )}

      <ListingCreateActionBar
        stepIndex={STEP_INDEX}
        totalSteps={STEP_TOTAL}
        backLabel="Quay lại Bước 05 (Kết quả)"
        nextLabel={
          isSubmitting
            ? 'Đang đăng tin...'
            : isSubmitted
              ? 'Đã đăng tin'
              : 'Đăng tin ngay'
        }
        nextDisabled={!draft || isSubmitting || isSubmitted}
        note={
          isSubmitted
            ? 'Tin đăng đã được đưa lên sàn ReWear AI'
            : 'Điểm đã đạt ngưỡng — xác nhận để phát hành tin lên sàn'
        }
        secondaryLabel={
          isSubmitted ? 'Về bảng điều khiển' : undefined
        }
        onBack={() => navigate(`${ROUTES.LISTING.CREATE}?step=5`)}
        onSecondary={() => navigate(ROUTES.SELLER.DASHBOARD)}
        onNext={handleSubmit}
      />

      {/*
        Cảnh báo riêng khi backend trả trạng thái lệch — nằm trong main để người
        bán thấy ngay cùng thẻ tin, không bị thanh toast trôi qua mất.
      */}
      {isUnexpectedStatus && (
        <p className="rw-flag-note">
          <TriangleAlert width={16} height={16} aria-hidden="true" />
          Điểm của hồ sơ đã thay đổi so với lúc Bước 05 chốt, nên hệ thống xử
          lý theo trạng thái mới: {result?.status}.
        </p>
      )}
    </div>
  );
};

export default ListingPublishPage;