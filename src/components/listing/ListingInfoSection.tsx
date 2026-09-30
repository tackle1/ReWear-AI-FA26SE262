
import React, { useEffect, useState } from 'react';
import '../../styles/listing/ListingInfoSection.css';

import {
  SlidersHorizontal,
  Shirt,
  BriefcaseBusiness,
  Gem,
  Footprints,
  Sparkles,
  Store,
  CircleHelp,
  Palette,
  ArrowRight,
  Truck,
  CircleDollarSign,
  List,
  X,
} from 'lucide-react';
import { usePremiumBrands } from '../../features/listing/hooks/usePremiumBrands';

export interface ListingInfoSectionProps {
  variant?: 'clearance' | 'secondhand';
  title?: string;
  sub?: string;
  sizes?: string[];
  maxNameLength?: number;
  feeLabel?: string;
  feeValue?: string;
  shippingLabel?: string;
  shippingValue?: string;
  totalLabel?: string;
  totalValue?: string;
  showValidation?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  onLuxuryBrandChange?: (isLuxury: boolean) => void;
  onFormChange?: (form: typeof DEFAULT_FORM) => void;
}

type BrandSegment = 'luxury' | 'popular' | 'local';

const DEFAULT_FORM = {
  category: 'Áo khoác & Măng tô',
  brand: 'Burberry',
  name: 'Áo măng tô Burberry Vintage hai hàng cúc (Nova Check Lining) - New full tag',
  size: 'M (IT 48)',
  pattern: 'Beige / Họa tiết kẻ Nova',
  price: '8.500.000',
  currency: 'VND',
  sku: 'BUR-84729-LIQ',
  description:
    'Áo măng tô dáng dài Burberry mới 100% chưa qua sử dụng, đầy đủ tem mác hãng, chất liệu cotton gabardine chống thấm nước kinh điển. Lớp lót kẻ Nova Check hoàn hảo.',
};

const SECONDHAND_CATEGORIES = [
  {
    label: 'Áo khoác & Măng tô',
    icon: Shirt,
  },
  {
    label: 'Túi xách & Đồ da',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Lụa & Phụ kiện',
    icon: Gem,
  },
  {
    label: 'Giày dép',
    icon: Footprints,
  },
];

const SECONDHAND_BRAND_GROUPS: Record<
  BrandSegment,
  {
    name: string;
    sub: string;
    value: string;
  }[]
> = {
  /**
   * Nhóm "luxury" không khai báo ở đây: danh sách thương hiệu bảo chứng được
   * lấy động từ API `GET /api/ListingsExample/premium-brands`.
   * Xem `usePremiumBrands` và phần render nhánh secondhand.
   */
  luxury: [],

  popular: [
    {
      name: 'NIKE',
      sub: 'Sportswear',
      value: 'Nike',
    },
    {
      name: 'ADIDAS',
      sub: 'Sportswear',
      value: 'Adidas',
    },
    {
      name: 'UNIQLO',
      sub: 'Japan',
      value: 'Uniqlo',
    },
    {
      name: 'ZARA',
      sub: 'Spain',
      value: 'Zara',
    },
    {
      name: 'H&M',
      sub: 'Sweden',
      value: 'H&M',
    },
    {
      name: 'COOLMATE',
      sub: 'Vietnam',
      value: 'Coolmate',
    },
    {
      name: 'CONVERSE',
      sub: 'USA',
      value: 'Converse',
    },
    {
      name: 'LEVI’S',
      sub: 'Denim',
      value: 'Levi’s',
    },
    {
      name: 'Khác...',
      sub: 'Nhập tay',
      value: '',
    },
  ],

  local: [
    {
      name: 'ROUTINE',
      sub: 'Vietnam',
      value: 'Routine',
    },
    {
      name: 'DEGREY',
      sub: 'Vietnam',
      value: 'Degrey',
    },
    {
      name: 'DIRTYCOINS',
      sub: 'Vietnam',
      value: 'DirtyCoins',
    },
    {
      name: '5THEWAY',
      sub: 'Vietnam',
      value: '5TheWay',
    },
    {
      name: 'YODY',
      sub: 'Vietnam',
      value: 'Yody',
    },
    {
      name: 'HADES',
      sub: 'Vietnam',
      value: 'Hades',
    },
    {
      name: 'LOCAL BRAND',
      sub: 'Khác',
      value: 'Local Brand',
    },
    {
      name: 'Không brand',
      sub: 'No-brand',
      value: 'No-brand',
    },
    {
      name: 'Khác...',
      sub: 'Nhập tay',
      value: '',
    },
  ],
};

const SECONDHAND_SEGMENTS = [
  {
    key: 'luxury' as const,
    label: 'Luxury / Major Brand',
    icon: Gem,
  },
  {
    key: 'popular' as const,
    label: 'Popular / Mass-market',
    icon: Store,
  },
  {
    key: 'local' as const,
    label: 'Local / No-brand',
    icon: Sparkles,
  },
];

export const ListingInfoSection: React.FC<ListingInfoSectionProps> = ({
  variant = 'clearance',
  title = 'Thông tin sản phẩm',
  sub = 'Các thông tin này hiển thị trên tin đăng và giúp AI đối chiếu chính xác hơn.',
  sizes = ['XS', 'S', 'M (IT 48)', 'L', 'XL'],
  maxNameLength = 120,
  feeLabel = 'Phí kiểm định & ký quỹ (3,5%):',
  feeValue = '-297.500 đ',
  shippingLabel = 'Bảo hiểm vận chuyển chuyên biệt:',
  shippingValue = 'Miễn phí (Ưu đãi Cấp 1)',
  totalLabel = 'Bạn nhận:',
  totalValue = '8.202.500 đ',
  showValidation = false,
  onValidityChange,
  onLuxuryBrandChange,
  onFormChange,
}) => {
  /*
   * =========================================================
   * ALL HOOKS MUST STAY AT THE TOP LEVEL
   * Không đặt useState/useEffect bên trong if/switch/map...
   * =========================================================
   */

  const [form, setForm] = useState(DEFAULT_FORM);

  const [selectedSegment, setSelectedSegment] =
    useState<BrandSegment>('luxury');

  /**
   * Ô nhập thương hiệu thủ công mở ra khi chọn "Khác..." — dùng cho trường hợp
   * sản phẩm không thuộc danh sách gợi ý (kể cả danh sách lấy từ API).
   */
  const [isCustomBrandOpen, setIsCustomBrandOpen] = useState(false);

  /** Danh sách thương hiệu bảo chứng lấy từ API, dùng cho nhóm "luxury". */
  const {
    brands: premiumBrands,
    status: premiumBrandsStatus,
    error: premiumBrandsError,
    reload: reloadPremiumBrands,
  } = usePremiumBrands();

  /** Lựa chọn "thương hiệu khác" luôn có sẵn ở cuối mỗi nhóm. */
  const OTHER_BRAND_OPTION = {
    name: 'Khác...',
    sub: 'Nhập tay',
    value: '',
  };

  /**
   * Nhóm "luxury" lấy động từ API; "popular" và "local" vẫn dùng danh sách khai báo.
   * Danh sách API đã ở dạng tên hiển thị nên `name` và `value` dùng chung giá trị.
   */
  const premiumBrandOptions = premiumBrands.map((brand) => ({
    name: brand,
    sub: 'Thương hiệu bảo chứng',
    value: brand,
  }));

  const brandGroups: Record<BrandSegment, typeof SECONDHAND_BRAND_GROUPS[BrandSegment]> =
    {
      ...SECONDHAND_BRAND_GROUPS,
      luxury: [...premiumBrandOptions, OTHER_BRAND_OPTION],
    };

  const price = Number(form.price.replace(/\D/g, ''));

  const errors = {
    category:
      form.category.trim().length < 2
        ? 'Vui lòng nhập danh mục sản phẩm.'
        : '',

    brand:
      form.brand.trim().length < 2
        ? 'Thương hiệu cần ít nhất 2 ký tự.'
        : '',

    name:
      form.name.trim().length < 10
        ? 'Tên sản phẩm cần từ 10 ký tự.'
        : '',

    size: !form.size ? 'Vui lòng chọn kích cỡ.' : '',

    pattern:
      form.pattern.length > 80
        ? 'Màu sắc và họa tiết tối đa 80 ký tự.'
        : '',

    price:
      !Number.isFinite(price) || price < 10000
        ? 'Giá niêm yết phải từ 10.000 VND.'
        : '',

    sku:
      form.sku &&
        !/^[A-Za-z0-9-]{3,64}$/.test(form.sku)
        ? 'SKU chỉ gồm chữ, số và dấu gạch ngang.'
        : '',

    description:
      form.description.length > 1000
        ? 'Mô tả tối đa 1.000 ký tự.'
        : '',
  };

  const isValid = !Object.values(errors).some(Boolean);

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useEffect(() => {
    onLuxuryBrandChange?.(selectedSegment === 'luxury');
  }, [onLuxuryBrandChange, selectedSegment]);

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const update =
    (key: keyof typeof DEFAULT_FORM) =>
      (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        setForm((prev) => ({
          ...prev,
          [key]: e.target.value,
        }));
      };

  /*
   * =========================================================
   * SECONDHAND
   * =========================================================
   */

  if (variant === 'secondhand') {
    const brands = brandGroups[selectedSegment];

    const selectedCategory = SECONDHAND_CATEGORIES.some(
      (category) => category.label === form.category
    )
      ? form.category
      : SECONDHAND_CATEGORIES[0].label;

    const selectedBrand =
      brands.find((brand) => brand.value === form.brand)?.name ?? '';

    const displayName = form.name;

    return (
      <section className="rw-lc-card rw-lc-secondhand-info">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="rw-lc-sh-title">
          <div className="rw-lc-sh-title-main">
            <SlidersHorizontal
              className="rw-lc-sh-title-icon"
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <h2>1. Thông tin danh mục &amp; Thương hiệu</h2>
          </div>

          <span className="rw-lc-sh-priority">
            Độ ưu tiên: Bắt buộc
          </span>
        </div>

        {/* =========================================================
            1. CATEGORY
        ========================================================= */}
        <div className="rw-lc-sh-block">
          <label className="rw-lc-sh-field-label">
            Danh mục trang phục lưu trữ
          </label>

          <div className="rw-lc-sh-options">
            {SECONDHAND_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive =
                selectedCategory === category.label;

              return (
                <button
                  key={category.label}
                  type="button"
                  className={isActive ? 'active' : ''}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      category: category.label,
                    }))
                  }
                >
                  <Icon
                    className="rw-lc-sh-category-icon"
                    size={11}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            2. BRAND
        ========================================================= */}
        <div className="rw-lc-sh-block">
          <div className="rw-lc-sh-label-row">
            <label className="rw-lc-sh-field-label">
              {selectedSegment === 'luxury'
                ? 'Thương hiệu bảo chứng'
                : 'Thương hiệu theo phân khúc'}
            </label>

            <span className="rw-lc-sh-status">
              <span className="rw-lc-sh-status-dot">
                •
              </span>
              {selectedSegment === 'luxury'
                ? premiumBrandsStatus === 'loading'
                  ? 'Đang tải danh sách...'
                  : `${premiumBrands.length} thương hiệu`
                : 'Kho lưu trữ v4.2 đang kích hoạt'}
            </span>
          </div>

          {/* Trạng thái tải / lỗi chỉ áp dụng cho nhóm lấy từ API */}
          {selectedSegment === 'luxury' &&
            (premiumBrandsStatus === 'loading' ||
              premiumBrandsStatus === 'error') && (
              <p
                className="rw-lc-sh-brand-feedback"
                role={premiumBrandsStatus === 'error' ? 'alert' : 'status'}
              >
                {premiumBrandsStatus === 'loading'
                  ? 'Đang tải danh sách thương hiệu bảo chứng...'
                  : premiumBrandsError}

                {premiumBrandsStatus === 'error' && (
                  <button
                    type="button"
                    onClick={reloadPremiumBrands}
                  >
                    Thử lại
                  </button>
                )}
              </p>
            )}

          <div className="rw-lc-sh-options brands">
            {brands.map((brand) => {
              const isOther = brand.name === 'Khác...';
              const isActive = selectedBrand === brand.name;

              return (
                <button
                  key={`${selectedSegment}-${brand.name}`}
                  type="button"
                  className={isActive ? 'active' : ''}
                  disabled={
                    selectedSegment === 'luxury' &&
                    premiumBrandsStatus === 'loading'
                  }
                  onClick={() => {
                    if (isOther) {
                      // Mở ô nhập tay và xoá giá trị cũ để tránh
                      // bị hiểu nhầm là đã chọn đúng thương hiệu.
                      setForm((prev) => ({
                        ...prev,
                        brand: '',
                      }));
                      setIsCustomBrandOpen(true);
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      brand: brand.value,
                    }));
                    // Chọn thương hiệu có sẵn thì đóng ô nhập tay.
                    setIsCustomBrandOpen(false);
                  }}
                >
                  <span className="rw-lc-sh-brand-name">
                    {brand.name}
                  </span>

                  <span className="rw-lc-sh-brand-sub">
                    {brand.sub}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô nhập tay: mở khi chọn "Khác..." */}
          {isCustomBrandOpen && (
            <div className="rw-lc-sh-brand-custom">
              <label
                className="rw-lc-sh-brand-custom-label"
                htmlFor="rw-li-custom-brand"
              >
                Nhập tên thương hiệu
                <span className="rw-lc-sh-required">*</span>
              </label>

              <div className="rw-lc-sh-brand-custom-wrap">
                <input
                  id="rw-li-custom-brand"
                  className={`rw-lc-sh-brand-custom-input${
                    showValidation && errors.brand ? ' is-invalid' : ''
                  }`}
                  value={form.brand}
                  onChange={update('brand')}
                  maxLength={60}
                  placeholder="VD: Hermes, Kenzo, Uniqlo..."
                  aria-invalid={Boolean(
                    showValidation && errors.brand
                  )}
                  autoFocus
                />

                <button
                  type="button"
                  className="rw-lc-sh-brand-custom-close"
                  aria-label="Đóng ô nhập thương hiệu thủ công"
                  onClick={() => {
                    setIsCustomBrandOpen(false);
                    setForm((prev) => ({
                      ...prev,
                      brand: '',
                    }));
                  }}
                >
                  <X
                    className="rw-lc-sh-brand-custom-close-icon"
                    size={12}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </button>
              </div>

              <p className="rw-lc-sh-brand-custom-hint">
                Thương hiệu không có trong danh sách gợi ý? Nhập tay tại
                đây, tối đa 60 ký tự.
              </p>

              {showValidation && errors.brand && (
                <p className="rw-lc-sh-brand-custom-error" role="alert">
                  {errors.brand}
                </p>
              )}
            </div>
          )}
        </div>

        {/* =========================================================
            3. BRAND SEGMENT
        ========================================================= */}
        <div className="rw-lc-sh-block">
          <div className="rw-lc-sh-label-row">
            <label className="rw-lc-sh-field-label">
              Phân loại phân khúc thương hiệu
            </label>

            <span className="rw-lc-sh-segment-hint">
              Quyết định yêu cầu hóa đơn nguồn gốc
            </span>
          </div>

          <div className="rw-lc-sh-options segments">
            {SECONDHAND_SEGMENTS.map((segment) => {
              const Icon = segment.icon;
              const isActive =
                selectedSegment === segment.key;

              return (
                <button
                  key={segment.key}
                  type="button"
                  className={isActive ? 'active' : ''}
                  onClick={() => {
                    setSelectedSegment(segment.key);

                    /*
                     * Chọn thương hiệu đầu tiên của nhóm mới.
                     * Nhóm "luxury" đến từ API nên có thể đang rỗng lúc
                     * đang tải hoặc khi API lỗi — khi đó để người dùng
                     * tự nhập ở ô "Thương hiệu" phía dưới.
                     */
                    const firstBrand =
                      brandGroups[segment.key][0];

                    setForm((prev) => ({
                      ...prev,
                      brand: firstBrand?.value ?? '',
                    }));

                    // Đổi phân khúc thì đóng ô nhập tay cho gọn.
                    setIsCustomBrandOpen(false);
                  }}
                >
                  <Icon
                    className="rw-lc-sh-segment-icon"
                    size={11}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>{segment.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rw-lc-sh-note">
            <CircleHelp
              className="rw-lc-sh-note-icon"
              size={11}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <div>
              <strong>
                Khuyến nghị bằng chứng (Luxury Tier):
              </strong>{' '}
              Phân loại thương hiệu Luxury kích hoạt trường tải
              Hóa đơn &amp; Bằng chứng mua hàng ở Mục 4.
            </div>
          </div>
        </div>

        {/* =========================================================
            4. PRODUCT NAME + COLOR
        ========================================================= */}
        <div className="rw-lc-sh-form-grid">
          <label className="rw-lc-sh-input-field">
            <div className="rw-lc-sh-input-label-row">
              <span>Tên hiển thị sản phẩm</span>

              <span className="rw-lc-sh-counter">
                {displayName.length}/{maxNameLength} ký tự
              </span>
            </div>

            <div className="rw-lc-sh-input-wrap">
              <input
                value={form.name}
                maxLength={maxNameLength}
                onChange={update('name')}
              />

              {/* React/Lucide icon thay cho ký tự ≡ */}
              <List
                className="rw-lc-sh-input-icon"
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
          </label>

          <label className="rw-lc-sh-input-field">
            <div className="rw-lc-sh-input-label-row">
              <span>Màu sắc nhận diện</span>
            </div>

            <div className="rw-lc-sh-input-wrap">
              <input
                value={form.pattern}
                maxLength={80}
                onChange={update('pattern')}
              />

              <Palette
                className="rw-lc-sh-input-icon"
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>
          </label>
        </div>

        {/* =========================================================
            5. SIZE
        ========================================================= */}
        <div className="rw-lc-sh-block rw-lc-sh-size-block">
          <div className="rw-lc-sh-label-row">
            <label className="rw-lc-sh-field-label">
              Kích cỡ theo chuẩn nhãn mác
            </label>

            <button
              type="button"
              className="rw-lc-sh-size-link"
            >
              <span>
                Bảng quy đổi kích thước đã sẵn
              </span>

              <ArrowRight
                size={10}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="rw-lc-sh-options sizes">
            {sizes.concat('Tùy chỉnh').map((item) => {
              const isActive = form.size === item;

              return (
                <button
                  key={item}
                  type="button"
                  className={isActive ? 'active' : ''}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      size: item,
                    }))
                  }
                >
                  {item === 'M (IT 48)' ? (
                    <>
                      <span>M</span>
                      <small>IT 48 / UK 38</small>
                    </>
                  ) : (
                    item
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            6. PRICE
        ========================================================= */}
        <div className="rw-lc-sh-block rw-lc-sh-price-block">
          <label className="rw-lc-sh-field-label">
            Giá niêm yết bán buôn &amp; Ký quỹ (VND)
          </label>

          <div className="rw-lc-sh-price-input-wrap">
            <input
              className="rw-lc-sh-price"
              value={form.price}
              inputMode="numeric"
              onChange={update('price')}
            />

            <span className="rw-lc-sh-price-currency">
              ₫
            </span>
          </div>

          <div className="rw-lc-sh-summary">
            <div className="rw-lc-sh-summary-row">
              <span>
                <CircleDollarSign
                  className="rw-lc-sh-summary-icon"
                  size={10}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Phí giám định quang học AI &amp; Ký quỹ hợp đồng
                (3.5%)
              </span>

              <b>-297,500 ₫</b>
            </div>

            <div className="rw-lc-sh-summary-row">
              <span>
                <Truck
                  className="rw-lc-sh-summary-icon"
                  size={10}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                Bảo hiểm vận chuyển chuyên biệt
                (Smart-Escrow Freight)
              </span>

              <b className="is-blue">
                Miễn phí cho Cấp 1
              </b>
            </div>

            <div className="rw-lc-sh-summary-total">
              <div>
                <strong>
                  Khoản thực nhận ước tính
                </strong>

                <small>
                  Giải ngân tự động sau khi người mua quét NFC
                  xác thực
                </small>
              </div>

              <em>8,202,500 ₫</em>
            </div>
          </div>
        </div>

        {/* =========================================================
            7. DESCRIPTION
        ========================================================= */}
        <div className="rw-lc-sh-block rw-lc-sh-description-block">
          <label className="rw-lc-sh-field-label">
            Mô tả tổng quát sản phẩm
          </label>

          <textarea
            value={form.description}
            maxLength={1000}
            onChange={update('description')}
          />
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * CLEARANCE
   * =========================================================
   */

  return (
    <section className="rw-lc-card rw-lc-info">
      <h2 className="rw-lc-info-title">
        {title}
      </h2>

      <p className="rw-lc-info-sub">
        {sub}
      </p>

      <div className="rw-lc-info-grid">
        {/* CATEGORY */}
        <div className="rw-lc-info-field">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-category"
          >
            Danh mục sản phẩm{' '}
            <span className="rw-lc-req">*</span>
          </label>

          <input
            id="rw-li-category"
            className={`rw-lc-input${showValidation && errors.category
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Áo khoác & Măng tô"
            value={form.category}
            onChange={update('category')}
            aria-invalid={Boolean(
              showValidation && errors.category
            )}
          />

          {showValidation && errors.category && (
            <span className="rw-lc-field-error">
              {errors.category}
            </span>
          )}
        </div>

        {/* BRAND */}
        <div className="rw-lc-info-field">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-brand"
          >
            Thương hiệu{' '}
            <span className="rw-lc-req">*</span>
          </label>

          <input
            id="rw-li-brand"
            className={`rw-lc-input${showValidation && errors.brand
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Burberry"
            value={form.brand}
            onChange={update('brand')}
            aria-invalid={Boolean(
              showValidation && errors.brand
            )}
          />

          {showValidation && errors.brand && (
            <span className="rw-lc-field-error">
              {errors.brand}
            </span>
          )}
        </div>

        {/* PRODUCT NAME */}
        <div className="rw-lc-info-field span-2">
          <div className="rw-lc-info-label-row">
            <label
              className="rw-lc-label"
              htmlFor="rw-li-name"
            >
              Tên sản phẩm niêm yết{' '}
              <span className="rw-lc-req">*</span>
            </label>

            <span className="rw-lc-info-counter">
              {form.name.length}/{maxNameLength} ký tự
            </span>
          </div>

          <input
            id="rw-li-name"
            className={`rw-lc-input${showValidation && errors.name
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Áo măng tô Burberry hai hàng cực, lót Nova Check"
            value={form.name}
            maxLength={maxNameLength}
            onChange={update('name')}
          />

          {showValidation && errors.name && (
            <span className="rw-lc-field-error">
              {errors.name}
            </span>
          )}
        </div>

        {/* SIZE */}
        <div className="rw-lc-info-field">
          <span className="rw-lc-label">
            Kích cỡ (Size){' '}
            <span className="rw-lc-req">*</span>
          </span>

          <div
            className="rw-lc-size-row"
            role="radiogroup"
            aria-label="Kích cỡ (Size)"
          >
            {sizes.map((size) => {
              const isActive = form.size === size;

              return (
                <label
                  key={size}
                  className={`rw-lc-size-chip${isActive ? ' active' : ''
                    }`}
                >
                  <input
                    type="radio"
                    className="rw-lc-size-input"
                    name="rw-listing-size"
                    value={size}
                    checked={isActive}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        size,
                      }))
                    }
                  />

                  <span>{size}</span>
                </label>
              );
            })}
          </div>

          {showValidation && errors.size && (
            <span className="rw-lc-field-error">
              {errors.size}
            </span>
          )}
        </div>

        {/* PATTERN */}
        <div className="rw-lc-info-field">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-pattern"
          >
            Màu sắc &amp; Họa tiết
          </label>

          <input
            id="rw-li-pattern"
            className={`rw-lc-input${showValidation && errors.pattern
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Beige / Họa tiết kẻ Nova"
            value={form.pattern}
            onChange={update('pattern')}
            maxLength={80}
          />

          {showValidation && errors.pattern && (
            <span className="rw-lc-field-error">
              {errors.pattern}
            </span>
          )}
        </div>

        {/* PRICE */}
        <div className="rw-lc-info-field span-2">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-price"
          >
            Giá bán (VND){' '}
            <span className="rw-lc-req">*</span>
          </label>

          <div className="rw-lc-price-wrap">
            <input
              id="rw-li-price"
              className={`rw-lc-input rw-lc-price-input${showValidation && errors.price
                  ? ' is-invalid'
                  : ''
                }`}
              placeholder="VD: 8500000"
              value={form.price}
              inputMode="numeric"
              onChange={update('price')}
            />

            {showValidation && errors.price && (
              <span className="rw-lc-field-error">
                {errors.price}
              </span>
            )}

            <span className="rw-lc-price-suffix">
              {form.currency}
            </span>
          </div>

          <div className="rw-lc-fee-summary">
            <div className="rw-lc-fee-box">
              <div className="rw-lc-fee-row">
                <span>{feeLabel}</span>

                <span className="rw-lc-fee-value">
                  {feeValue}
                </span>
              </div>

              <div className="rw-lc-fee-row">
                <span>{shippingLabel}</span>

                <span className="rw-lc-fee-value is-blue">
                  {shippingValue}
                </span>
              </div>
            </div>

            <div className="rw-lc-fee-total">
              <span>{totalLabel}</span>

              <span className="rw-lc-fee-total-value">
                {totalValue}
              </span>
            </div>
          </div>
        </div>

        {/* SKU */}
        <div className="rw-lc-info-field">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-sku"
          >
            Mã SKU hệ thống{' '}
            <span className="rw-lc-info-label-opt">
              (Tùy chọn)
            </span>
          </label>

          <input
            id="rw-li-sku"
            className={`rw-lc-input${showValidation && errors.sku
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: BUR-84729-LIQ"
            value={form.sku}
            onChange={update('sku')}
            maxLength={64}
          />

          {showValidation && errors.sku && (
            <span className="rw-lc-field-error">
              {errors.sku}
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="rw-lc-info-field span-2">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-desc"
          >
            Mô tả sản phẩm chi tiết
          </label>

          <textarea
            id="rw-li-desc"
            className={`rw-lc-textarea${showValidation && errors.description
                ? ' is-invalid'
                : ''
              }`}
            value={form.description}
            onChange={update('description')}
            maxLength={1000}
          />

          {showValidation && errors.description && (
            <span className="rw-lc-field-error">
              {errors.description}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default ListingInfoSection;