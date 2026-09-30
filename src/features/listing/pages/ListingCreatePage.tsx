import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTES from '../../../routes/routes.config';
import sellerAvatar from '../../../assets/images/seller-avatar.png';
import ListingTopbar from '../../../components/listing/ListingTopbar';
import ListingBreadcrumb from '../../../components/listing/ListingBreadcrumb';
import ListingHeroHeader from '../../../components/listing/ListingHeroHeader';
import ListingStepProgress, { LISTING_STEPS } from '../../../components/listing/ListingStepProgress';
import ListingConditionSection from '../../../components/listing/ListingConditionSection';
import ListingInfoSection from '../../../components/listing/ListingInfoSection';
import ListingUsageSection from '../../../components/listing/ListingUsageSection';
import ListingEvidenceSection from '../../../components/listing/ListingEvidenceSection';
import ListingSidePanel from '../../../components/listing/ListingSidePanel';
import ListingCreateActionBar from '../../../components/listing/ListingCreateActionBar';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { buildListingPayload, findMissingAngles } from '../services/listingPayload';
import listingApi from '../../../services/api/listing.api';
import ListingCaptureStep, { ListingCaptureHeader } from '../../../components/listing/ListingCaptureStep';
import ListingPhotoReviewStep from '../../../components/listing/ListingPhotoReviewStep';
import ListingAiVerificationStep from '../../../components/listing/ListingAiVerificationStep';
import ListingAiResultStep from '../../../components/listing/ListingAiResultStep';
import ListingPublishStep from '../../../components/listing/ListingPublishStep';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/listing/ListingCreate.css';

type WarningToast = { id: number; message: string };
type ProductInfo = {
  category: string;
  /** Mã danh mục ổn định để đối chiếu với backend/bộ lọc, không phụ thuộc nhãn. */
  categoryId: string;
  /** Giới tính: 'male' | 'female'. */
  gender: string;
  brand: string;
  name: string;
  /**
   * Kích cỡ hiển thị. Với nhóm không có size chuẩn hoá (túi/phụ kiện) thì đây
   * là số đo thật do người bán nhập, vì backend chỉ có một trường `size`.
   */
  size: string;
  pattern: string;
  /** Chất liệu, gửi lên API ở field `material`. */
  material: string;
  price: string;
  sku: string;
};

/** Chuẩn hoá giá người bán nhập thành dạng hiển thị "8.500.000 đ" cho hồ sơ thẩm định. */
const formatFormPrice = (rawPrice: string): string | undefined => {
  const digits = rawPrice.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return `${amount.toLocaleString('vi-VN')} đ`;
};

export const ListingCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStepParam = searchParams.get('step');
  const initialStep = initialStepParam ? Math.max(0, parseInt(initialStepParam, 10) - 1) : 0;
  const [stepIndex, setStepIndex] = useState(initialStep);
  /** Key của hình thức sản phẩm đang chọn trong "Phân loại hình thức sản phẩm" */
  const [condition, setCondition] = useState('clearance');
  /**
   * Ảnh thật đã chụp ở Bước 02 (id góc → data URL). Dùng cho preview bên phải
   * và làm ảnh đại diện cho Bước 03–06. Ảnh chính là ảnh toàn cảnh (góc 01).
   */
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({});

  /** Ảnh đại diện: ưu tiên góc toàn cảnh (OVERALL), không có thì lấy góc đầu tiên. */
  const referencePhoto =
    capturedPhotos.OVERALL ?? Object.values(capturedPhotos)[0];
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '',
    categoryId: '',
    gender: '',
    brand: '',
    name: '',
    size: '',
    pattern: '',
    material: '',
    price: '',
    sku: '',
  });
  const [infoValid, setInfoValid] = useState(true);
  const [usageValid, setUsageValid] = useState(true);
  const [photoValid, setPhotoValid] = useState(true);
  const [isLuxuryBrand, setIsLuxuryBrand] = useState(true);
  /** Người bán đã tải hóa đơn ở Bước 01 hay chưa — quyết định có bị trừ điểm ở Bước 05. */
  const [hasBill, setHasBill] = useState(false);
  /** Ảnh hóa đơn dạng data URL, dùng cho trường `billPhotoUrl` khi tạo tin đăng. */
  const [billPhoto, setBillPhoto] = useState('');
  /** Bước Kết quả báo lại: hồ sơ có được phép đăng tin hay đã bị từ chối tự động. */
  const [canPublishResult, setCanPublishResult] = useState(true);
  /**
   * Điểm cuối do Bước 05 chốt lại (đã trừ theo cấu hình ngưỡng).
   * Bước 06 hiển thị đúng con số này; `null` khi chưa qua Bước 05.
   */
  const [verifiedScore, setVerifiedScore] = useState<number | null>(null);
  const [warningToast, setWarningToast] = useState<WarningToast | null>(null);
  const [showInfoValidation, setShowInfoValidation] = useState(false);
  const [pdfState, setPdfState] = useState<'idle' | 'preparing' | 'ready'>('idle');
  const step = LISTING_STEPS[Math.min(stepIndex, LISTING_STEPS.length - 1)];
  const stepNumber = String(stepIndex + 1).padStart(2, '0');

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return;
    }
    navigate(ROUTES.SELLER.DASHBOARD);
  };

  /**
   * Tạo tin đăng ở Bước 02 (dữ liệu Bước 01 + ảnh vừa chụp đã đủ).
   * Trạng thái hiển thị: đang gửi / thành công / lỗi.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const { userId } = useCurrentUser();

  /** Gom dữ liệu Bước 01 + ảnh Bước 02 thành body đúng schema backend. */
  const buildCurrentPayload = () =>
    buildListingPayload({
      productInfo: {
        name: productInfo.name,
        categoryId: productInfo.categoryId,
        brand: productInfo.brand,
        size: productInfo.size,
        pattern: productInfo.pattern,
        material: productInfo.material,
        price: productInfo.price,
        gender: productInfo.gender,
      },
      photos: capturedPhotos,
      billPhoto,
      condition,
    });

  const handleCreateListing = async () => {
    if (isSubmitting) return;

    if (!userId) {
      setSubmitError('Bạn chưa đăng nhập nên không thể tạo tin đăng.');
      return;
    }

    // Backend yêu cầu đủ 4 góc, thiếu sẽ trả lỗi `missingAngles`. Chặn trước
    // ở giao diện để không mất dữ liệu đã nhập vì một request thất bại.
    const missing = findMissingAngles(capturedPhotos);
    if (missing.length > 0) {
      setSubmitError(
        `Còn ${missing.length} góc ảnh chưa chụp: ${missing.join(', ')}. ` +
          'Vui lòng chụp đủ trước khi tiếp tục.',
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await listingApi.createListing(userId, buildCurrentPayload());
      const data = response?.data;

      setCreatedListingId(data?.id ?? data?.listingId ?? null);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Không tạo được tin đăng. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (stepIndex === 0 && (!infoValid || !usageValid || !photoValid)) {
      setShowInfoValidation(true);
      return;
    }

    // Bước 02 đủ dữ liệu để tạo hồ sơ trên backend trước khi sang Bước 03.
    if (stepIndex === 1) {
      void handleCreateListing();
    }

    setStepIndex((prev) => Math.min(prev + 1, LISTING_STEPS.length - 1));
  };

  const handleDownloadReport = () => {
    setPdfState('preparing');
    window.setTimeout(() => setPdfState('ready'), 1200);
  };

  const showMissingBillWarning = () => {
    setWarningToast({
      id: Date.now(),
      message:
        'Thiếu Bill hãng lớn có thể bị trừ điểm tin cậy. ' +
        'Hãy bổ sung hóa đơn Luxury để giữ điểm ở mức cao.',
    });
    window.setTimeout(() => setWarningToast(null), 5000);
  };

  return (
    <div className="rw-lc-page rw-dashboard-theme">
      <ListingTopbar avatarSrc={sellerAvatar} onBack={() => navigate(ROUTES.SELLER.DASHBOARD)} />

      <ListingBreadcrumb />

      <main className="rw-lc-main">
        <ListingStepProgress activeIndex={stepIndex} />

        {stepIndex !== 3 && stepIndex !== 4 && stepIndex !== 5 && (
          <>
            {stepIndex === 1 && (
              <ListingCaptureHeader
                completedCount={Object.keys(capturedPhotos).length}
              />
            )}
            <ListingHeroHeader
              stepNumber={stepNumber}
              stepTitle={step.title}
              description={step.description}
            />
          </>
        )}

        {stepIndex === 1 ? (
          <ListingCaptureStep onPhotosChange={setCapturedPhotos} />
        ) : stepIndex === 2 ? (
          <ListingPhotoReviewStep photos={capturedPhotos} />
        ) : stepIndex === 3 ? (
          <ListingAiVerificationStep
            stepNumber={stepNumber}
            stepTitle={step.title}
            product={{
              image: referencePhoto,
              name: productInfo.name || undefined,
              meta: productInfo.pattern ? `${productInfo.pattern} • Made in England` : undefined,
              price: formatFormPrice(productInfo.price),
              sku: productInfo.sku ? `SKU: ${productInfo.sku}` : undefined,
            }}
            onCancel={handleBack}
          />
        ) : stepIndex === 4 ? (
          <ListingAiResultStep
            product={{
              image: referencePhoto,
              name: productInfo.name || undefined,
              sku: productInfo.sku ? `SKU: ${productInfo.sku}` : undefined,
            }}
            hasBill={hasBill}
            onCanPublishChange={setCanPublishResult}
            onConfidenceChange={setVerifiedScore}
            onBack={handleBack}
            onApprove={handleNext}
          />
        ) : stepIndex === 5 ? (
          <ListingPublishStep
            image={referencePhoto}
            name={productInfo.name || undefined}
            brand={productInfo.brand || undefined}
            category={productInfo.category || undefined}
            size={productInfo.size || undefined}
            pattern={productInfo.pattern || undefined}
            price={productInfo.price || undefined}
            sku={productInfo.sku || undefined}
            confidence={verifiedScore ?? 94}
          />
        ) : <div className="rw-lc-columns">
          <div className="rw-lc-col-left">
            <ListingConditionSection
              value={condition}
              onChange={(nextCondition) => {
                setCondition(nextCondition);
                setPhotoValid(true);
              }}
            />
            <ListingInfoSection
              variant={condition === 'clearance' ? 'clearance' : 'secondhand'}
              showValidation={showInfoValidation}
              onValidityChange={setInfoValid}
              onLuxuryBrandChange={setIsLuxuryBrand}
              onFormChange={(form) => setProductInfo({
                category: form.category,
                categoryId: form.categoryId,
                gender: form.gender,
                brand: form.brand,
                name: form.name,
                /*
                 * Nhóm túi/phụ kiện không có size chuẩn hoá nên `form.size` vẫn
                 * là giá trị mặc định không liên quan; khi đó lấy số đo thật do
                 * người bán nhập để trường `size` gửi lên API có ý nghĩa.
                 */
                size: form.sizeMeasurement.trim() || form.size,
                pattern: form.pattern,
                material: form.material,
                price: form.price,
                sku: form.sku,
              })}
            />
            
            {/*
              Hàng thanh lý không cần khai báo tình trạng (đã cố định là
              "Like New — Chưa qua sử dụng"), nên chỉ nhánh Secondhand mới
              có khối thông tin sử dụng.
            */}
            {condition === 'secondhand' && (
              <ListingUsageSection
                showValidation={showInfoValidation}
                onValidityChange={setUsageValid}
              />
            )}
            {/*
              Ảnh sản phẩm / ảnh tham chiếu đã được gỡ khỏi Bước 01 — ảnh được
              chụp ở Bước 02 (Chụp & Thu thập) nên không cần chỗ tải trước.
              Khối hóa đơn vẫn giữ vì quyết định việc trừ điểm ở Bước 05.
            */}
            {condition === 'clearance' ? (
              <ListingEvidenceSection
                variant="clearance"
                onBillChange={setHasBill}
                onBillPhotoChange={setBillPhoto}
              />
            ) : (
              <ListingEvidenceSection
                variant="secondhand"
                isLuxuryBrand={isLuxuryBrand}
                onNoInvoice={showMissingBillWarning}
                onBillChange={setHasBill}
                onBillPhotoChange={setBillPhoto}
              />
            )}
          </div>
          <aside className="rw-lc-col-right">
            <ListingSidePanel
              previewImage={referencePhoto}
              preview={{
                title: productInfo.name,
                brand: productInfo.brand,
                category: productInfo.category,
                size: productInfo.size,
                pattern: productInfo.pattern,
                price: productInfo.price,
              }}
              variant={condition === 'clearance' ? 'clearance' : 'secondhand'}
            />
          </aside>
        </div>}
      </main>

      {warningToast && (
        <div className="rw-lc-warning-toast" role="alert">
          <span className="rw-lc-warning-toast-icon" aria-hidden="true">!</span>
          <span>{warningToast.message}</span>
          <button type="button" aria-label="Đóng cảnh báo" onClick={() => setWarningToast(null)}>×</button>
        </div>
      )}

      {/* Trạng thái tạo tin đăng ở Bước 02 */}
      {(isSubmitting || submitError || createdListingId) && (
        <div
          className={`rw-lc-submit-toast${submitError ? ' is-error' : ''}`}
          role={submitError ? 'alert' : 'status'}
        >
          {submitError ? (
            <>
              <span>{submitError}</span>
              <button type="button" onClick={() => setSubmitError(null)} aria-label="Đóng cảnh báo">×</button>
            </>
          ) : isSubmitting ? (
            <span>Đang tạo tin đăng trên hệ thống...</span>
          ) : (
            <span>
              Đã tạo tin đăng
              {createdListingId ? ` (mã: ${createdListingId})` : ''}.
            </span>
          )}
        </div>
      )}

      {stepIndex <= LISTING_STEPS.length - 1 && (
        <ListingCreateActionBar
          stepIndex={stepIndex}
          totalSteps={LISTING_STEPS.length}
          backLabel={
            stepIndex === 4
              ? 'Quay lại Bước 04 (Xác thực AI)'
              : stepIndex === 5
                ? 'Quay lại Bước 05 (Kết quả)'
                : undefined
          }
          nextLabel={
            stepIndex === 4
              ? 'Phê duyệt và Đăng tin'
              : stepIndex === 5
                ? 'Đăng tin'
                : undefined
          }
          nextDisabled={stepIndex === 4 && !canPublishResult}
          note={
            stepIndex === 4
              ? canPublishResult
                ? 'Kết quả kiểm định đã sẵn sàng để phê duyệt'
                : 'Hồ sơ bị từ chối tự động — không thể đăng tin'
              : stepIndex === 5
                ? 'Kiểm tra lần cuối trước khi phát hành tin đăng'
                : undefined
          }
          secondaryLabel={
            stepIndex === 4
              ? pdfState === 'preparing'
                ? 'Đang tạo hồ sơ PDF...'
                : pdfState === 'ready'
                  ? 'Đã tạo hồ sơ PDF'
                  : 'Tải hồ sơ PDF'
              : undefined
          }
          secondaryDisabled={stepIndex === 4 ? pdfState === 'preparing' : false}
          onBack={handleBack}
          onSecondary={stepIndex === 4 ? handleDownloadReport : undefined}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default ListingCreatePage;
