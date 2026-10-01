import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTES from '../../../routes/routes.config';
import ListingTopbar from '../../../components/listing/ListingTopbar';
import ListingBreadcrumb from '../../../components/listing/ListingBreadcrumb';
import ListingHeroHeader from '../../../components/listing/ListingHeroHeader';
import ListingStepProgress, { LISTING_STEPS } from '../../../components/listing/ListingStepProgress';
import ListingConditionSection from '../../../components/listing/ListingConditionSection';
import ListingInfoSection, {
  type ListingInfoForm,
} from '../../../components/listing/ListingInfoSection';
import ListingUsageSection from '../../../components/listing/ListingUsageSection';
import ListingEvidenceSection from '../../../components/listing/ListingEvidenceSection';
import ListingSidePanel from '../../../components/listing/ListingSidePanel';
import ListingCreateActionBar from '../../../components/listing/ListingCreateActionBar';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { buildListingPayload, findMissingAngles } from '../services/listingPayload';
import { readApiErrorMessage } from '../utils/errorMessage';
import usePhotoQualityCheck from '../hooks/usePhotoQualityCheck';
import useAiVerification from '../hooks/useAiVerification';
import { saveSellerListing } from '../../seller/services/sellerListingsStore';
import listingApi from '../../../services/api/listing.api';
import { CreateListingResult } from '../../../types/listing.type';
import ListingCaptureStep, { ListingCaptureHeader } from '../../../components/listing/ListingCaptureStep';
import ListingPhotoReviewStep from '../../../components/listing/ListingPhotoReviewStep';
import ListingAiVerificationStep from '../../../components/listing/ListingAiVerificationStep';
import ListingAiResultStep from '../../../components/listing/ListingAiResultStep';
import ListingPublishStep from '../../../components/listing/ListingPublishStep';
import '../../../styles/dashboard/DashboardTheme.css';
import '../../../styles/listing/ListingCreate.css';

/**
 * Lấy thông báo lỗi thật từ backend.
 *
 * `axiosClient` reject bằng `AxiosError`, nên `err.message` chỉ là câu chung
 * chung kiểu "Request failed with status code 500" — vô dụng với người bán.
 * Backend trả `{ success: false, error: { code, message } }` (xem
 * `GlobalExceptionHandlerMiddleware`), nên ưu tiên đọc message ở đó.
 */

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

  /**
   * Nhận form từ `ListingInfoSection` và đẩy lên state của trang.
   *
   * Dùng `useCallback` (deps rỗng) để callback có DANH TÍNH ỔN ĐỊNH giữa các
   * lần render — trước đây đây là arrow function inline nên mỗi lần render đều
   * tạo function mới, khiến `useEffect` trong `ListingInfoSection` chạy lại
   * không dừng và React báo "Maximum update depth exceeded".
   *
   * Bên trong dùng updater dạng hàm và trả về `prev` khi không có gì thay đổi,
   * nên setState không tạo object mới vô ích (tránh render thừa).
   */
  const handleInfoFormChange = useCallback((form: ListingInfoForm) => {
    setProductInfo((prev) => {
      const next: ProductInfo = {
        category: form.category,
        categoryId: form.categoryId,
        gender: form.gender,
        brand: form.brand,
        name: form.name,
        /*
         * Nhóm túi/phụ kiện không có size chuẩn hoá nên `form.size` vẫn là giá
         * trị mặc định không liên quan; khi đó lấy số đo thật do người bán
         * nhập để trường `size` gửi lên API có ý nghĩa.
         */
        size: form.sizeMeasurement.trim() || form.size,
        pattern: form.pattern,
        material: form.material,
        price: form.price,
        sku: form.sku,
      };

      const unchanged = (Object.keys(next) as (keyof ProductInfo)[]).every(
        (key) => prev[key] === next[key],
      );

      return unchanged ? prev : next;
    });
  }, []);

  const handleBack = () => {
    // Đổi bước thì bỏ cảnh báo cũ, tránh thông báo của bước trước bám lại.
    setSubmitError(null);

    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return;
    }
    navigate(ROUTES.SELLER.DASHBOARD);
  };

  /**
   * Trạng thái đăng tin ở Bước 06: đang gửi / thành công / lỗi.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  /**
   * Kết quả đầy đủ backend trả về sau khi đăng tin (Bước 06).
   *
   * Giữ lại vì đây là nguồn dữ liệu thật duy nhất về những gì hệ thống đã quyết
   * định — nổi bật là `brandSegment`: phân khúc thương hiệu do BACKEND suy ra,
   * quyết định có bắt buộc hóa đơn hay không. Người bán cần thấy giá trị này
   * để biết vì sao hồ sơ của họ bị áp quy tắc hóa đơn.
   */
  const [createdResult, setCreatedResult] = useState<CreateListingResult | null>(null);
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

  /**
   * Bước 02 chỉ thu thập ảnh, CHƯA đăng tin. Kiểm tra đủ 4 góc ở đây để chặn
   * sớm — nếu đợi tới Bước 06 mới báo, người bán đã đi qua 3 bước kiểm định
   * rồi mới biết là thiếu ảnh.
   *
   * Trả về thông báo lỗi, hoặc `null` khi đã đủ góc ảnh bắt buộc.
   */
  const buildMissingAnglesMessage = (): string | null => {
    const missing = findMissingAngles(capturedPhotos);

    if (missing.length === 0) return null;

    return (
      `Còn ${missing.length} góc ảnh chưa chụp: ${missing.join(', ')}. ` +
      'Vui lòng chụp đủ trước khi tiếp tục.'
    );
  };

  /**
   * Đăng tin ở Bước 06, sau khi đã qua kiểm tra ảnh (03), xác thực AI (04) và
   * kết quả thẩm định (05). Bước 01 + 02 chỉ thu thập dữ liệu, không gọi API.
   * Trạng thái hiển thị: đang gửi / thành công / lỗi.
   */
  const handleCreateListing = async () => {
    if (isSubmitting || createdListingId) return;

    /*
     * `userId` lấy từ phiên đăng nhập và phải là GUID hợp lệ (backend nhận
     * `string($guid)`). `useCurrentUser` đã trả `null` khi thiếu hoặc sai
     * định dạng, nên chặn ở đây trước khi gửi request để không mất dữ liệu
     * đã nhập vì một lỗi 400 không rõ nguyên nhân từ backend.
     */
    if (!userId) {
      setSubmitError(
        'Không xác định được mã người dùng (userId) hợp lệ. ' +
          'Vui lòng đăng xuất rồi đăng nhập lại trước khi đăng tin.',
      );
      return;
    }

    // Chốt chặn cuối: backend trả 400 kèm `missingAngles` nếu thiếu góc nào.
    const missingAnglesMessage = buildMissingAnglesMessage();
    if (missingAnglesMessage) {
      setSubmitError(missingAnglesMessage);
      return;
    }

    // Hồ sơ bị Bước 05 từ chối thì không được đăng, dù UI đã khoá nút.
    if (!canPublishResult) {
      setSubmitError(
        'Hồ sơ không đạt điều kiện thẩm định nên chưa thể đăng tin. ' +
          'Vui lòng xem lại kết quả ở Bước 05.',
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await listingApi.createListing(userId, buildCurrentPayload());
      /*
       * KHÔNG lấy `.data`: interceptor của axiosClient đã `response => response.data`
       * nên giá trị await được CHÍNH LÀ body rồi, và backend trả thẳng DTO
       * (không bọc `{success, data}`). Trước đây dùng `response?.data` khiến
       * `listingId` luôn undefined — sau khi đăng xong không hiện mã tin và nút
       * vẫn bấm được lần nữa (đăng trùng).
       */
      const data = response ?? null;
      const listingId = data?.listingId ?? null;

      setCreatedResult(data);
      setCreatedListingId(listingId);

      /*
       * Lưu lại kết quả backend trả về vào kho của đúng seller này. Đây là
       * nguồn dữ liệu thật cho trang tổng quan người bán (xem
       * `useSellerDashboard`), vì backend chưa có endpoint đọc danh sách tin.
       */
      if (listingId) {
        const payload = buildCurrentPayload();

        saveSellerListing(userId, {
          listingId,
          title: payload.title,
          categoryId: payload.categoryId,
          brand: payload.brand,
          size: payload.size,
          price: payload.price,
          itemType: payload.itemType,
          thumbnail: capturedPhotos.OVERALL,
          createdAt: new Date().toISOString(),
          result: data ?? {},
        });
      }
    } catch (err) {
      setSubmitError(readApiErrorMessage(err, 'Không đăng được tin. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Góc Bước 03 yêu cầu chụp lại. Bước 02 đọc giá trị này để mở đúng góc cần
   * bổ sung, thay vì bắt người bán tự tìm góc còn thiếu.
   */
  const [retakeAngle, setRetakeAngle] = useState<string | undefined>(undefined);

  /**
   * Kết quả đo chất lượng ảnh thật từ Bước 03. Dùng lại ở Bước 04 để hiện
   * chỉ số đo được thay vì số liệu bịa đặt.
   */
  const photoCheck = usePhotoQualityCheck(capturedPhotos);

  /**
   * Bước 04 — Xác thực AI & đối soát chính hãng. Gọi song song 3 endpoint
   * của AiVerificationExample (analyze-photos, verify-and-decide, check-signals).
   */
  const aiVerify = useAiVerification(capturedPhotos, productInfo.brand);

  /** Gom chỉ số đo theo `angleType` để truyền xuống Bước 04. */
  const measuredPhotos = useMemo(() => {
    const map: Record<
      string,
      {
        isAcceptable: boolean;
        issues: string[];
        width: number;
        height: number;
        sharpnessScore: number;
        brightness: number;
      }
    > = {};

    photoCheck.result?.results.forEach((item) => {
      map[item.angleType] = {
        isAcceptable: item.isAcceptable,
        issues: item.issues,
        width: item.width,
        height: item.height,
        sharpnessScore: item.sharpnessScore,
        brightness: item.brightness,
      };
    });

    return map;
  }, [photoCheck.result]);

  /** Bước 04 chỉ mở được khi mọi góc ảnh đều đạt chất lượng. */
  const photosAllPassed = useMemo(() => {
    if (!photoCheck.result) return false;
    return photoCheck.result.isAcceptable && photoCheck.result.missingAngles.length === 0;
  }, [photoCheck.result]);

  /** Quay lại Bước 02 để chụp lại một góc cụ thể từ Bước 03. */
  const handleRetakePhoto = (angleType: string) => {
    setRetakeAngle(angleType);
    setSubmitError(null);
    setStepIndex(1);
  };

  const handleNext = () => {
    if (stepIndex === 0 && (!infoValid || !usageValid || !photoValid)) {
      setShowInfoValidation(true);
      return;
    }

    /*
     * Bước 02 chỉ thu thập ảnh — chưa đăng tin. Chỉ chặn nếu thiếu góc bắt buộc
     * rồi mới sang Bước 03, không gọi API ở đây.
     */
    if (stepIndex === 1) {
      const missingAnglesMessage = buildMissingAnglesMessage();
      if (missingAnglesMessage) {
        setSubmitError(missingAnglesMessage);
        return;
      }
    }

    // Bước 04 chỉ mở khi mọi góc ảnh đã đo và đều đạt chất lượng — đây là
    // điều kiện tiên quyết để sang bước xác thực AI.
    if (stepIndex === 3 && !photosAllPassed) {
      setSubmitError(
        'Ảnh chưa đạt chất lượng kiểm định. ' +
          'Vui lòng quay lại Bước 02 chụp lại góc ảnh được báo lỗi.',
      );
      return;
    }

    // Bước 06 là bước DUY NHẤT được phép gọi API đăng tin.
    if (stepIndex === LISTING_STEPS.length - 1) {
      void handleCreateListing();
      return;
    }

    // Bước 05 cần hồ sơ đạt điều kiện thẩm định mới sang được Bước 06.
    if (stepIndex === 4 && !canPublishResult) {
      setSubmitError(
        'Hồ sơ bị từ chối tự động nên chưa thể đăng tin. ' +
          'Vui lòng xem lại kết quả thẩm định ở Bước 05.',
      );
      return;
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
      {/*
        Không truyền `avatarSrc`: trước đây dùng ảnh `seller-avatar.png` fix cứng
        nên mọi seller đều thấy cùng một khuôn mặt. Bỏ truyền thì `ListingTopbar`
        tự hiển thị chữ cái đầu của tên tài khoản đang đăng nhập.
      */}
      <ListingTopbar onBack={() => navigate(ROUTES.SELLER.DASHBOARD)} />

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
          <ListingCaptureStep
            onPhotosChange={setCapturedPhotos}
            initialAngleType={retakeAngle}
          />
        ) : stepIndex === 2 ? (
          <ListingPhotoReviewStep
            photos={capturedPhotos}
            /* Chỉ truyền những góc server đánh dấu KHÔNG ĐẠT — component dùng
               danh sách này để tô viền đỏ đúng khung ảnh lỗi. */
            serverErrors={photoCheck.result?.results
              .filter((item) => !item.isAcceptable)
              .map((item) => ({
                angleType: item.angleType,
                message: item.issues.join(' · '),
              }))}
            /* Chỉ số đo thật (độ nét, độ sáng) để hiển thị cho từng góc. */
            metrics={photoCheck.result?.results}
            isChecking={photoCheck.isLoading}
            checkError={photoCheck.error}
            recommendation={photoCheck.result?.recommendation}
            onRetake={handleRetakePhoto}
          />
        ) : stepIndex === 3 ? (
          <ListingAiVerificationStep
            stepNumber={stepNumber}
            stepTitle={step.title}
            product={{
              image: referencePhoto,
              name: productInfo.name,
              brand: productInfo.brand,
              size: productInfo.size,
              color: productInfo.pattern,
              price: productInfo.price,
              sku: productInfo.sku,
            }}
            photos={capturedPhotos}
            measuredPhotos={measuredPhotos}
            analysis={aiVerify.analysis}
            decision={aiVerify.decision}
            signals={aiVerify.signals}
            isVerifying={aiVerify.isLoading}
            verifyError={aiVerify.error}
            isChecking={photoCheck.isLoading}
            checkError={photoCheck.error}
            recommendation={photoCheck.result?.recommendation}
            onCancel={handleBack}
            onWaitResult={handleNext}
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
            brandSegment={createdResult?.brandSegment}
            billPenaltyApplied={createdResult?.missingBillPenaltyApplied ?? false}
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
              onFormChange={handleInfoFormChange}
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

      {/* Trạng thái đăng tin ở Bước 06 */}
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
            <span>Đang đăng tin lên hệ thống...</span>
          ) : (
            <span>
              Đã đăng tin thành công
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
              ? 'Phê duyệt và sang Bước 06'
              : stepIndex === 5
                ? isSubmitting
                  ? 'Đang đăng tin...'
                  : createdListingId
                    ? 'Đã đăng tin'
                    : 'Đăng tin ngay'
                : stepIndex === 2
                  ? 'Xác thực AI'
                  : stepIndex === 3
                    ? 'Xem kết quả thẩm định'
                    : undefined
          }
          nextDisabled={
            // Bước 03: chưa đo xong hoặc ảnh chưa đạt thì chưa sang Bước 04.
            (stepIndex === 2 && (!photoCheck.result || !photosAllPassed)) ||
            // Bước 04: ảnh chưa đạt thì không sang Bước 05.
            (stepIndex === 3 && !photosAllPassed) ||
            // Bước 05: bị từ chối thì không sang Bước 06.
            (stepIndex === 4 && !canPublishResult) ||
            // Bước 06: khoá khi đang gửi / bị chặn / đã đăng xong.
            (stepIndex === 5 && (isSubmitting || !canPublishResult || !!createdListingId))
          }
          note={
            stepIndex === 2
              ? photoCheck.isLoading
                ? 'Đang đo chất lượng ảnh...'
                : photosAllPassed
                  ? 'Ảnh đã đạt — sẵn sàng chuyển sang xác thực AI'
                  : 'Cần đủ ảnh đạt chất lượng để sang Bước 04'
              : stepIndex === 3
                ? photosAllPassed
                  ? 'Bằng chứng ảnh hợp lệ — sẵn sàng xem kết quả thẩm định'
                  : 'Bằng chứng ảnh chưa đạt — quay lại Bước 02 để chụp lại'
                : stepIndex === 4
              ? canPublishResult
                ? 'Kết quả kiểm định đã sẵn sàng để phê duyệt'
                : 'Hồ sơ bị từ chối tự động — không thể đăng tin'
              : stepIndex === 5
                ? createdListingId
                  ? 'Tin đăng đã được đưa lên chợ ReWear AI'
                  : canPublishResult
                    ? 'Đủ điều kiện thẩm định — xác nhận để đăng tin lên chợ'
                    : 'Hồ sơ chưa đạt điều kiện — không thể đăng tin'
                : stepIndex === 1
                  ? 'Bước này chỉ thu thập ảnh — tin đăng được tạo ở Bước 06'
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
