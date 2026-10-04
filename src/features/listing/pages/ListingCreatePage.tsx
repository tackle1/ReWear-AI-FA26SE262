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
import { buildListingPayload, findMissingAngles } from '../services/listingPayload';
import usePhotoQualityCheck from '../hooks/usePhotoQualityCheck';
import useAiVerification from '../hooks/useAiVerification';
import useVerificationThresholds from '../hooks/useVerificationThresholds';
import ListingCaptureStep, { ListingCaptureHeader } from '../../../components/listing/ListingCaptureStep';
import ListingPhotoReviewStep from '../../../components/listing/ListingPhotoReviewStep';
import ListingAiVerificationStep from '../../../components/listing/ListingAiVerificationStep';
import ListingAiResultStep from '../../../components/listing/ListingAiResultStep';
import { savePendingDraft } from '../services/listingPayload';
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
  /**
   * Điểm cuối do Bước 05 chốt lại (đã trừ theo cấu hình ngưỡng).
   * `null` khi chưa qua Bước 05 — dùng để rẽ 3 nhánh sau Bước 05.
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
   * Thông báo lỗi chặn người bán ở lại bước hiện tại (thiếu góc ảnh, thiếu điểm
   * thẩm định, hồ sơ bị từ chối…). Việc gửi API đăng tin đã chuyển sang hai
   * trang riêng nên trang này không còn trạng thái "đang gửi / đã đăng".
   */
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Gom dữ liệu Bước 01 + ảnh Bước 02 thành body đúng schema backend. */
  const buildCurrentPayload = () =>
    buildListingPayload({
      productInfo: {
        sku: productInfo.sku,
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
   * RẼ NHÁNH sau Bước 05 theo điểm confidence cuối cùng.
   *
   * Bước "Đăng tin" cũ (Bước 06) nay là HAI TRANG RIÊNG ngoài thanh tiến trình:
   *   • >= `autoPublishThreshold` (75) → `ROUTES.LISTING.PUBLISH`
   *   • >= `autoRejectThreshold`  (50) → `ROUTES.LISTING.FLAG` (chờ Admin)
   *   • < 50                          → từ chối, đưa về Bước 01
   *
   * Trước khi chuyển trang, lưu hồ sơ vào kho phiên (`savePendingDraft`) vì
   * state của trang này sẽ mất khi rời đi — trang đích cần payload đó để gọi
   * API và hiển thị đúng điểm/ảnh.
   */
  const routeByConfidence = () => {
    /*
     * Chưa có điểm = Bước 05 chưa chạy xong (hoặc endpoint lỗi). Không đoán
     * nhánh khi không có dữ liệu — báo lỗi và giữ người bán lại Bước 05.
     */
    if (!resultRoute) {
      setSubmitError(
        'Chưa có kết quả thẩm định. Vui lòng chạy lại xác thực AI ở Bước 04.',
      );
      return;
    }

    /*
     * Chốt chặn cuối: backend trả 400 kèm `missingAngles` nếu thiếu góc ảnh nào.
     * Kiểm tra lại ở đây vì hai trang đích sẽ gọi API đăng tin.
     */
    const missingAnglesMessage = buildMissingAnglesMessage();
    if (missingAnglesMessage) {
      setSubmitError(missingAnglesMessage);
      return;
    }

    // Dưới ngưỡng tối thiểu → hệ thống từ chối, cho người bán về lại Bước 01.
    if (resultRoute === 'reject') {
      setSubmitError(
        `Hồ sơ bị từ chối: điểm ${verifiedScore!.toFixed(1)}% thấp hơn ngưỡng tối thiểu ` +
          `${thresholds.autoRejectThreshold}%. Vui lòng quay lại Bước 01 chỉnh thông tin ` +
          'hoặc chụp lại ảnh rồi thực hiện lại.',
      );
      setStepIndex(0);
      return;
    }

    savePendingDraft({
      payload: buildCurrentPayload(),
      confidence: verifiedScore!,
      billPenaltyApplied: aiVerify.decision?.missingBillPenaltyApplied ?? false,
      brandSegment: aiVerify.decision?.brandSegment,
      thumbnail: referencePhoto,
      name: productInfo.name,
      brand: productInfo.brand,
      category: productInfo.category,
      size: productInfo.size,
      pattern: productInfo.pattern,
      price: productInfo.price,
      sku: productInfo.sku,
      savedAt: new Date().toISOString(),
    });

    navigate(
      resultRoute === 'publish' ? ROUTES.LISTING.PUBLISH : ROUTES.LISTING.FLAG,
    );
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
   *
   * Truyền kèm `hasBill` để `verify-and-decide` áp (hoặc không áp) trừ điểm
   * thiếu hoá đơn. Các endpoint này có `[Authorize]` — token và số dư token được
   * axiosClient tự gửi kèm và backend tự lấy từ claim, không truyền từ đây.
   */
  const aiVerify = useAiVerification(capturedPhotos, productInfo.brand, hasBill, condition, stepIndex === 3);

  /**
   * Ngưỡng đánh giá + phí token mỗi lần phân tích.
   *
   * Cần cho Bước 04 để hiện ngưỡng đăng tin và giải thích vì sao số dư token
   * tụt mỗi lần xác thực lại.
   */
  const { thresholds } = useVerificationThresholds();
  const isAiQuotaExceeded =
    aiVerify.quotaExceeded ||
    (typeof aiVerify.remainingTokens === 'number' &&
      (aiVerify.remainingTokens <= 0 ||
        (typeof thresholds.aiAnalysisTokenCost === 'number' &&
          thresholds.aiAnalysisTokenCost > 0 &&
          aiVerify.remainingTokens < thresholds.aiAnalysisTokenCost)));

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

    if (stepIndex === 3 && isAiQuotaExceeded) {
      setSubmitError(
        'Quota token AI không đủ để xem kết quả thẩm định. ' +
          'Vui lòng nạp thêm token rồi thực hiện lại xác thực.',
      );
      return;
    }

    /*
     * Bước 05 là bước CUỐI của thanh tiến trình: bấm nút ở đây sẽ RẼ NHÁNH
     * theo điểm confidence, không sang bước kế tiếp nữa.
     *   • >= ngưỡng đăng (75) → trang Đăng tin
     *   • 50 – <75            → trang Gắn cờ (chờ Admin)
     *   • < 50                → từ chối, đưa người bán về Bước 01
     */
    if (stepIndex === 4) {
      routeByConfidence();
      return;
    }

    setStepIndex((prev) => Math.min(prev + 1, LISTING_STEPS.length - 1));
  };

  const handleDownloadReport = () => {
    setPdfState('preparing');
    window.setTimeout(() => setPdfState('ready'), 1200);
  };

  /**
   * Nhánh rẽ của Bước 05, tính một lần để nhãn nút và ghi chú cùng dùng chung
   * — tránh hai chỗ so ngưỡng lệch nhau khi ngưỡng backend đổi.
   *
   * `null` = chưa có điểm thẩm định thì chưa rẽ được.
   */
  const resultRoute = useMemo(() => {
    if (typeof verifiedScore !== 'number') return null;
    if (verifiedScore < thresholds.autoRejectThreshold) return 'reject' as const;
    if (verifiedScore < thresholds.autoPublishThreshold) return 'flag' as const;
    return 'publish' as const;
  }, [verifiedScore, thresholds]);

  /** Nhãn nút cuối ở Bước 05 — nói rõ sẽ đi đâu vì bước sau là TRANG RIÊNG. */
  const RESULT_ACTION_LABEL: Record<'reject' | 'flag' | 'publish', string> = {
    reject: 'Từ chối & quay lại Bước 01',
    flag: 'Tiếp tục — Gắn cờ chờ Admin',
    publish: 'Tiếp tục — Đăng tin',
  };

  /** Ghi chú dưới thanh hành động, mô tả đích đến của nhánh hiện tại. */
  const RESULT_ACTION_NOTE: Record<'reject' | 'flag' | 'publish', string> = {
    reject: 'Hồ sơ bị từ chối — bấm để quay lại Bước 01 chỉnh lại hồ sơ',
    flag: `Điểm trong khoảng ${thresholds.autoRejectThreshold}% – ${thresholds.autoPublishThreshold}% — sẽ chuyển sang trang Gắn cờ chờ Admin`,
    publish: `Điểm từ ${thresholds.autoPublishThreshold}% trở lên — sẽ chuyển sang trang Đăng tin`,
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

        {stepIndex !== 3 && stepIndex !== 4 && (
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
            datasetMatch={aiVerify.datasetMatch}
            aiImageDetection={aiVerify.aiImageDetection}
            decision={aiVerify.decision}
            signals={aiVerify.signals}
            isVerifying={aiVerify.isLoading}
            /**
             * Số dư token AI và phí mỗi lần — để seller thấy mình còn bao nhiêu
             * lượt kiểm định và hiểu vì sao số dư tụt mỗi lần bấm xác thực lại.
             */
            remainingTokens={aiVerify.remainingTokens}
            tokenCost={thresholds.aiAnalysisTokenCost}
            tokenQuota={thresholds.sellerDefaultAiTokenQuota}
            quotaExceeded={aiVerify.quotaExceeded}
            thresholds={thresholds}
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
              brand: productInfo.brand || undefined,
              sku: productInfo.sku ? `SKU: ${productInfo.sku}` : undefined,
              /* Giá người bán nhập ở Bước 01 — nguồn thật cho thẻ tóm tắt. */
              price: productInfo.price || undefined,
            }}
            hasBill={hasBill}
            /**
             * Điểm Bước 04 đã áp trừ thiếu hoá đơn rồi (finalScore), và biết
             * phân khúc có bắt buộc hoá đơn hay không. Truyền cả hai xuống để
             * Bước 05 hiển thị đúng điểm, không trừ lần thứ hai.
             */
            decision={aiVerify.decision}
            aiImageDetection={aiVerify.aiImageDetection}
            signals={aiVerify.signals}
            onConfidenceChange={setVerifiedScore}
            onBack={handleBack}
            onApprove={handleNext}
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

      {/* Lỗi chặn ở bước hiện tại (thiếu góc ảnh, hết quota, hồ sơ bị từ chối...). */}
      {submitError && (
        <div className="rw-lc-submit-toast is-error" role="alert">
          <span>{submitError}</span>
          <button type="button" onClick={() => setSubmitError(null)} aria-label="Đóng cảnh báo">×</button>
        </div>
      )}

      {stepIndex <= LISTING_STEPS.length - 1 && (
        <ListingCreateActionBar
          stepIndex={stepIndex}
          totalSteps={LISTING_STEPS.length}
          backLabel={
            stepIndex === 4
              ? 'Quay lại Bước 04 (Xác thực AI)'
              : undefined
          }
          nextLabel={
            stepIndex === 4
              ? /*
                * Nút cuối của thanh tiến trình. Bước kế tiếp KHÔNG còn là một
                * bước nữa mà là trang riêng, tuỳ điểm — nên nhãn nói rõ đi đâu.
                */
                resultRoute
                  ? RESULT_ACTION_LABEL[resultRoute]
                  : 'Chờ kết quả thẩm định'
              : stepIndex === 2
                  ? 'Xác thực AI'
                  : stepIndex === 3
                  ? isAiQuotaExceeded
                    ? 'Hết quota AI — không thể xem kết quả'
                    : aiVerify.isLoading
                      ? 'Đang xác thực...'
                      : 'Xem kết quả thẩm định'
                  : undefined
          }
          nextDisabled={
            // Bước 03: chưa đo xong hoặc ảnh chưa đạt thì chưa sang Bước 04.
            (stepIndex === 2 && (!photoCheck.result || !photosAllPassed)) ||
            // Bước 04: ảnh chưa đạt thì không sang Bước 05.
            (stepIndex === 3 && (!photosAllPassed || isAiQuotaExceeded || aiVerify.isLoading)) ||
            /*
             * Bước 05: chưa có điểm thẩm định thì chưa rẽ được nhánh nào.
             * KHÔNG khoá khi bị từ chối — nút "Từ chối & quay lại Bước 01"
             * vẫn phải bấm được để người bán thoát luồng.
             */
            (stepIndex === 4 && resultRoute === null)
          }
          note={
            stepIndex === 2
              ? photoCheck.isLoading
                ? 'Đang đo chất lượng ảnh...'
                : photosAllPassed
                  ? 'Ảnh đã đạt — sẵn sàng chuyển sang xác thực AI'
                  : 'Cần đủ ảnh đạt chất lượng để sang Bước 04'
              : stepIndex === 3
                ? isAiQuotaExceeded
                  ? 'Quota token AI không đủ — nút xem kết quả đã khóa. Nạp token để tiếp tục.'
                  : aiVerify.isLoading
                    ? 'Đang chờ kết quả xác thực từ AI...'
                  : photosAllPassed
                  ? 'Bằng chứng ảnh hợp lệ — sẵn sàng xem kết quả thẩm định'
                  : 'Bằng chứng ảnh chưa đạt — quay lại Bước 02 để chụp lại'
                : stepIndex === 4
                  ? resultRoute
                    ? RESULT_ACTION_NOTE[resultRoute]
                    : 'Chờ kết quả thẩm định để chuyển sang bước tiếp theo'
                  : stepIndex === 1
                    ? 'Bước này chỉ thu thập ảnh — tin đăng được tạo sau Bước 05'
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
