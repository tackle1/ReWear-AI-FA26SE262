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
import ListingNotesSection from '../../../components/listing/ListingNotesSection';
import ListingEvidenceSection from '../../../components/listing/ListingEvidenceSection';
import ListingPhotoSection from '../../../components/listing/ListingPhotoSection';
import ListingReferencePhotoSection from '../../../components/listing/ListingReferencePhotoSection';
import ListingSidePanel from '../../../components/listing/ListingSidePanel';
import ListingCreateActionBar from '../../../components/listing/ListingCreateActionBar';
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
  brand: string;
  name: string;
  size: string;
  pattern: string;
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
  const [referencePhoto, setReferencePhoto] = useState<string | undefined>();
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    category: '',
    brand: '',
    name: '',
    size: '',
    pattern: '',
    price: '',
    sku: '',
  });
  const [infoValid, setInfoValid] = useState(true);
  const [photoValid, setPhotoValid] = useState(true);
  const [isLuxuryBrand, setIsLuxuryBrand] = useState(true);
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

  const handleNext = () => {
    if (stepIndex === 0 && (!infoValid || !photoValid)) {
      setShowInfoValidation(true);
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
      message: 'Thiếu Bill hãng lớn có thể bị trừ điểm xác thực. Hãy bổ sung hóa đơn Luxury để giữ điểm tin cậy cao.',
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
            {stepIndex === 1 && <ListingCaptureHeader />}
            <ListingHeroHeader
              stepNumber={stepNumber}
              stepTitle={step.title}
              description={step.description}
              showModel={stepIndex !== 1 && stepIndex !== 2}
            />
          </>
        )}

        {stepIndex === 1 ? (
          <ListingCaptureStep
            referenceImage={referencePhoto}
            productName={productInfo.name}
            brand={productInfo.brand}
          />
        ) : stepIndex === 2 ? (
          <ListingPhotoReviewStep />
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
                brand: form.brand,
                name: form.name,
                size: form.size,
                pattern: form.pattern,
                price: form.price,
                sku: form.sku,
              })}
            />
            
            {condition === 'clearance' ? (
              <ListingNotesSection />
            ) : (
              <ListingUsageSection />
            )}
            {condition === 'secondhand' ? (
              <>
                <ListingReferencePhotoSection
                  onPhotoChange={setReferencePhoto}
                  onValidityChange={setPhotoValid}
                />
              </>
            ) : (
              <>
                <ListingEvidenceSection
                  variant="clearance"
                  isLuxuryBrand={isLuxuryBrand}
                  onNoInvoice={showMissingBillWarning}
                />
                <ListingPhotoSection
                  variant="clearance"
                  onValidityChange={setPhotoValid}
                  onPhotoChange={setReferencePhoto}
                />
              </>
            )}
            {condition === 'secondhand' && (
              <ListingEvidenceSection
                variant="secondhand"
                isLuxuryBrand={isLuxuryBrand}
                onNoInvoice={showMissingBillWarning}
              />
            )}
          </div>
          <aside className="rw-lc-col-right">
            <ListingSidePanel
              previewImage={referencePhoto}
              preview={{
                title: productInfo.name,
                brand: productInfo.brand,
                sku: productInfo.sku,
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
          note={
            stepIndex === 4
              ? 'Kết quả kiểm định đã sẵn sàng để phê duyệt'
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
