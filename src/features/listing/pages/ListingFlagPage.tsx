import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Flag } from 'lucide-react';
import ROUTES from '../../../routes/routes.config';
import ListingTopbar from '../../../components/listing/ListingTopbar';
import ListingFlagReview from '../../../components/listing/ListingFlagReview';
import ListingCreateActionBar from '../../../components/listing/ListingCreateActionBar';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useVerificationThresholds from '../hooks/useVerificationThresholds';
import useSubmitListing from '../hooks/useSubmitListing';
import { clearPendingDraft, readPendingDraft } from '../services/listingPayload';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/listing/ListingCreate.css';
/*
 * `.rw-flag-empty`, `.rw-flag-review`, `.rw-flag-done`, `.rw-flag-note` nằm
 * trong `ListingCreate.css` vì dùng chung bộ khung trang `rw-lc-*` của cả hai
 * trang Đăng tin và Gắn cờ — không tách CSS riêng để tránh lặp phần khai báo.
 */

/*
 * Chỉ số bước hiển thị trên thanh hành động.
 *
 * Trang này nằm NGOÀI thanh tiến trình 5 bước, nhưng `ListingCreateActionBar`
 * vẫn hiện "Bước x/y" nên phải có con số. 5/5 vì đây là bước cuối luồng
 * (ngay sau Bước 05).
 */
const STEP_INDEX = 4;
const STEP_TOTAL = 5;

/**
 * TRANG GẮN CỜ — nhánh giữa của luồng sau Bước 05.
 *
 * Điểm confidence nằm trong khoảng `[autoRejectThreshold,
 * autoPublishThreshold)` — 50% đến dưới 75% — thì luồng rẽ sang đây thay vì
 * đăng thẳng. Tin vẫn được TẠO (backend tự gắn trạng thái `FLAGGED`) nhưng
 * chưa hiện công khai, chờ Admin đối soát thủ công rồi mới phát hành.
 *
 * Không dùng chung component với trang Đăng tin: hai trang khác nhau ở
 * THÔNG ĐIỆP và hành động chính (chờ duyệt vs phát hành ngay). Nhồi `if`
 * vào một component sẽ khó đọc hơn là tách.
 */
export const ListingFlagPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useCurrentUser();
  /** Ngưỡng backend — dùng để giải thích vùng điểm 50–75 trên thẻ gắn cờ. */
  const { thresholds } = useVerificationThresholds();
  /** Đọc một lần khi vào trang — hồ sơ không đổi giữa các lần render. */
  const draft = useMemo(() => readPendingDraft(), []);

  /*
   * Backend quyết định trạng thái lúc tạo tin nên trang này ĐỢI `FLAGGED`.
   * Nếu backend trả trạng thái khác (điểm vừa rơi khác vùng giữa lúc chuyển
   * trang) thì hiện cảnh báo thay vì im lặng — người bán cần biết tin rơi
   * vào nhánh nào.
   */
  const { status, result, error, isUnexpectedStatus, submit } = useSubmitListing(
    userId,
    draft,
    'FLAGGED',
  );

  const isSubmitting = status === 'submitting';
  const isSubmitted = status === 'success';

  const handleSubmit = () => {
    if (isSubmitting) return;
    /*
     * Đã gửi xong thì nút chính đóng vai trò "Xong" — đưa thẳng về
     * Dashboard bán hàng để seller theo dõi hồ sơ đang chờ đối soát,
     * không bắt họ tự tìm đường về từ menu.
     */
    if (isSubmitted) {
      navigate(ROUTES.SELLER.DASHBOARD);
      return;
    }
    /* Xoá hồ sơ chờ để F5 không tạo trùng tin đã gửi. */
    clearPendingDraft();
    void submit();
  };

  return (
    <div className="rw-lc-page rw-dashboard-theme">
      <ListingTopbar onBack={() => navigate(ROUTES.LISTING.CREATE)} />

      <main className="rw-lc-main">
        {/*
          Vào được trang này chỉ khi đã có điểm ở Bước 05. Không có hồ sơ nghĩa
          là mở thẳng URL — đưa về Bước 01 thay vì hiện trang rỗng.
        */}
        {!draft ? (
          <section className="rw-flag-empty" role="alert">
            <Flag width={30} height={30} aria-hidden="true" />
            <h1>Không tìm thấy hồ sơ chờ gắn cờ</h1>
            <p>
              Trang này chỉ mở sau khi Bước 05 có điểm trong khoảng 50% – 75%.
              Phiên làm việc đã hết hạn hoặc bạn mở thẳng đường dẫn này.
            </p>
            <button type="button" onClick={() => navigate(ROUTES.LISTING.CREATE)}>
              Quay lại Bước 01
            </button>
          </section>
        ) : (
          <>
            <ListingFlagReview
            image={draft.thumbnail}
            name={draft.name}
            brand={draft.brand}
            sku={draft.sku}
            price={draft.price}
            /* Điểm THẬT Bước 05 — component hiển thị nguyên vẹn, không làm tròn. */
            confidence={draft.confidence}
            /*
             * Ngưỡng từ backend để giải thích vì sao hồ sơ rơi vào vùng phải
             * gắn cờ (đủ ngưỡng xét nhưng chưa đủ ngưỡng đăng).
             */
            autoRejectThreshold={thresholds.autoRejectThreshold}
            autoPublishThreshold={thresholds.autoPublishThreshold}
            billPenaltyApplied={draft.billPenaltyApplied ?? false}
            /* true khi backend đã tạo tin và xác nhận trạng thái FLAGGED. */
            isFlagged={isSubmitted && result?.status === 'FLAGGED'}
            listingId={result?.listingId}
            actualStatus={result?.status}
          />
          </>
        )}
      </main>
      {/* Thông báo trạng thái gửi hồ sơ */}
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
              “FLAGGED”. Vui lòng kiểm tra lại trạng thái tin đăng.
            </span>
          ) : (
            <span className="rw-flag-done">
              <CircleCheck width={16} height={16} aria-hidden="true" />
              Đã gửi hồ sơ
              {result?.listingId ? ` (mã: ${result.listingId})` : ''} — đang chờ
              chuyên viên đối soát.
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
            ? 'Đang gửi hồ sơ...'
            : isSubmitted
              ? 'Về Dashboard bán hàng'
              : 'Gửi hồ sơ chờ Admin'
        }
        nextDisabled={!draft || isSubmitting}
        note={
          isSubmitted
            ? 'Hồ sơ đã chuyển chờ đối soát thủ công'
            : 'Tin chưa hiện công khai cho tới khi chuyên viên phát hành'
        }
        onBack={() => navigate(`${ROUTES.LISTING.CREATE}?step=5`)}
        onNext={handleSubmit}
      />
    </div>
  );
};

export default ListingFlagPage;