
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
  Palette,
  Layers,
  Truck,
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
  shippingLabel?: string;
  shippingValue?: string;
  totalLabel?: string;
  showValidation?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  onLuxuryBrandChange?: (isLuxury: boolean) => void;
  onFormChange?: (form: typeof DEFAULT_FORM) => void;
}

type BrandSegment = 'luxury' | 'popular' | 'local';

/** Kích cỡ giày theo chuẩn Việt Nam (VN). */
const SHOE_SIZE_OPTIONS = ['39', '40', '41', '42', '43', '44', '45'];

/**
 * Bộ kích cỡ theo nhóm sản phẩm.
 *
 * Nhánh "Hàng thanh lý" cho người bán GÕ TAY danh mục, nên không thể so
 * sánh chuỗi chính xác — mỗi nhóm có nhiều cách viết. Vì vậy nhận diện
 * theo TỪ KHOÁ có trong tên danh mục (không phân biệt hoa thường).
 */
const SIZE_GROUPS: {
  /** Từ khoá nhận diện nhóm sản phẩm. */
  keywords: string[];
  /** Bộ kích cỡ ứng với nhóm; `null` nghĩa là không có size chuẩn hoá. */
  sizes: string[] | null;
}[] = [
  {
    keywords: ['giày', 'dép', 'sneaker', 'sandal', 'boot', 'shoe', 'loafer'],
    sizes: SHOE_SIZE_OPTIONS,
  },
  {
    keywords: [
      'túi',
      'đồ da',
      'phụ kiện',
      'lụa',
      'khăn',
      'balo',
      'ví',
      'mũ',
      'kính',
      'đồng hồ',
    ],
    // null = không có size chuẩn hoá, người bán nhập số đo thật (cm).
    sizes: null,
  },
];

/** Khoảng dấu tổ hợp (`\u0300`–`\u036f`) sinh ra khi bỏ dấu tiếng Việt. */
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Chuẩn hoá chuỗi để so khớp: bỏ dấu tiếng Việt + chuyển chữ thường.
 * "Túi Xách" → "tui xach", "Giày dép" → "giay dep".
 */
const normalizeKeyword = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '');

/**
 * Nhận diện nhóm kích cỡ từ tên danh mục.
 * - `string[]`: nhóm có size chuẩn hoá (quần áo, giày)
 * - `null`: nhóm không có size chuẩn hoá (túi, phụ kiện) → nhập số đo thật
 */
const resolveSizeGroup = (category: string): string[] | null => {
  // Chuẩn hoá CẢ danh mục lẫn từ khoá, nếu chỉ bỏ dấu một bên thì
  // "giay dep".includes("giày") luôn sai.
  const normalized = normalizeKeyword(category);

  const matched = SIZE_GROUPS.find((group) =>
    group.keywords.some((keyword) => normalized.includes(normalizeKeyword(keyword))),
  );

  return matched ? matched.sizes : null;
};

/**
 * Chọn bộ kích cỡ theo danh mục.
 * Dùng chung cho cả lúc render lẫn lúc đổi danh mục, để hai nơi không lệch nhau.
 */
const resolveSizeOptions = (
  category: string,
  clothingSizes: string[],
): string[] => resolveSizeGroup(category) ?? clothingSizes;

/**
 * Danh mục không có size chuẩn hoá → hiện ô nhập kích thước thật thay cho
 * chip kích cỡ. Phải phân biệt với "không khớp nhóm nào" (tức quần áo) nên
 * kiểm tra riêng bằng cách xem nhóm có `sizes === null`.
 */
const usesSizeMeasurement = (category: string): boolean =>
  SIZE_GROUPS.some(
    (group) =>
      group.sizes === null &&
      group.keywords.some((keyword) =>
        normalizeKeyword(category).includes(normalizeKeyword(keyword)),
      ),
  );

/**
 * Giới tính sản phẩm — khớp với trường `gender` của API tạo tin đăng.
 */
const GENDER_OPTIONS = [
  { id: 'male', label: 'Nam' },
  { id: 'female', label: 'Nữ' },
] as const;

/**
 * Form khởi tạo rỗng — người bán phải tự nhập. Trước đây các trường này
 * để sẵn dữ liệu của một sản phẩm Burberry mẫu, khiến tin đăng mới vô tình
 * mang thông tin hàng khác. Chỉ `category`/`size`/`gender` giữ giá trị mặc
 * định vì đó là lựa chọn mặc định hợp lý, không phải dữ liệu bịa.
 */
const DEFAULT_FORM = {
  category: 'Quần áo & Áo khoác',
  categoryId: 'apparel',
  gender: 'male',
  brand: '',
  name: '',
  size: 'M',
  /*
   * Số đo thật của túi/phụ kiện (dạng "dài x rộng x cao"). Tách khỏi `size`
   * vì nhãn nhóm kích cỡ ("One size", "Lớn (L)"...) và số đo là hai thông tin
   * khác nhau. Đưa vào form (thay vì `useState` riêng) để được validate và
   * truyền lên bước sau cùng các trường khác.
   */
  sizeMeasurement: '',
  pattern: '',
  /*
   * Chất liệu — khớp với trường `material` mà API tạo tin đăng yêu cầu. Trước
   * đây payload luôn gửi chuỗi rỗng vì form chưa có ô nhập.
   */
  material: '',
  price: '',
  currency: 'VND',
  // Ô nhập SKU đã gỡ khỏi form nên để rỗng, tránh hiện mã giả ở preview
  // và các bước sau.
  sku: '',
};

/**
 * Danh mục sản phẩm — dùng chung cho cả "Hàng Secondhand" và "Hàng thanh lý"
 * để hai nhánh không lệch danh mục (kéo theo cả bộ kích cỡ hiển thị).
 *
 * `id` là mã định danh ổn định để đối chiếu về sau (gửi API, lọc, thống kê,
 * khớp với danh mục của Marketplace). Luôn dùng `id` để so sánh, KHÔNG so
 * sánh `label` vì nhãn tiếng Việt có thể đổi theo thời gian.
 */
const LISTING_CATEGORIES = [
  {
    id: 'apparel',
    label: 'Quần áo & Áo khoác',
    icon: Shirt,
  },
  {
    id: 'bags',
    label: 'Túi xách & Đồ da',
    icon: BriefcaseBusiness,
  },
  {
    id: 'accessories',
    label: 'Lụa & Phụ kiện',
    icon: Gem,
  },
  {
    id: 'shoes',
    label: 'Giày dép',
    icon: Footprints,
  },
] as const;

/** Tra cứu danh mục theo `id`; dùng để đồng bộ `label` khi khởi tạo form. */
const findCategoryById = (id: string) =>
  LISTING_CATEGORIES.find((category) => category.id === id);

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
  title,
  sub = 'Các thông tin này hiển thị trên tin đăng và giúp AI đối chiếu chính xác hơn.',
  sizes = ['S', 'M', 'L', 'XL'],
  maxNameLength = 120,
  shippingLabel = 'Bảo hiểm vận chuyển chuyên biệt:',
  shippingValue = 'Miễn phí',
  totalLabel = 'Bạn nhận:',
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

  /**
   * Số tiền người bán thực nhận. Trước đây đây là chuỗi fix cứng nên dù gõ
   * giá khác, ô "Bạn nhận" vẫn hiện con số cũ. Vận chuyển miễn phí nên tổng
   * bằng đúng giá niêm yết.
   */
  const totalDisplay = price > 0 ? `${price.toLocaleString('vi-VN')} ₫` : '—';

  /**
   * Danh mục "Giày dép" dùng bộ size số (39–45); "Túi xách & Đồ da" và
   * "Lụa & Phụ kiện" dùng nhóm quy mô + ô nhập kích thước thật; các danh mục
   * còn lại giữ bộ size quần áo. `sizes` vẫn là prop để bên ngoài ghi đè khi cần.
   */
  /** Danh mục là giày dép — nhận diện theo từ khoá nên dùng cho cả text tự do. */
  const isShoeCategory = resolveSizeGroup(form.category) === SHOE_SIZE_OPTIONS;

  /** Túi xách & phụ kiện: chọn nhãn nhóm rồi nhập kích thước thật ở ô bên dưới. */
  const isOneSizeCategory = usesSizeMeasurement(form.category);

  const sizeOptions = resolveSizeOptions(form.category, sizes);

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

    /*
     * Màu sắc/họa tiết là trường bắt buộc vì được gửi lên API ở field
     * `color`. Trước đây chỉ kiểm tra độ dài tối đa nên có thể để trống mà
     * form vẫn báo hợp lệ — nhất là khi ta đã xoá dữ liệu mẫu khỏi form.
     */
    pattern:
      form.pattern.trim().length < 2
        ? 'Vui lòng nhập màu sắc & họa tiết.'
        : form.pattern.length > 80
          ? 'Màu sắc và họa tiết tối đa 80 ký tự.'
          : '',

    /*
     * Chất liệu là trường bắt buộc vì được gửi lên API ở field `material`, và
     * cũng là thông tin AI dùng để đối chiếu với ảnh chụp ở các bước sau.
     */
    material:
      form.material.trim().length < 2
        ? 'Vui lòng nhập chất liệu sản phẩm.'
        : form.material.length > 80
          ? 'Chất liệu tối đa 80 ký tự.'
          : '',

    /*
     * Chỉ nhóm không có size chuẩn hoá (túi/phụ kiện) mới cần nhập số đo thật;
     * các nhóm còn lại dùng chip kích cỡ nên không kiểm tra trường này.
     */
    sizeMeasurement:
      isOneSizeCategory && form.sizeMeasurement.trim().length < 3
        ? 'Vui lòng nhập kích thước thật, VD: 23 x 14 x 7 cm.'
        : '',

    price:
      !Number.isFinite(price) || price < 10000
        ? 'Giá niêm yết phải từ 10.000 VND.'
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

    /*
     * Đối chiếu bằng `categoryId` (mã ổn định) thay vì `label` (nhãn tiếng
     * Việt có thể đổi), rồi mới suy ra nhãn để hiển thị.
     */
    const selectedCategory =
      findCategoryById(form.categoryId) ?? LISTING_CATEGORIES[0];

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
            Bắt buộc
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
            {LISTING_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory.id === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={isActive ? 'active' : ''}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      category: category.label,
                      categoryId: category.id,
                      /*
                       * Bộ kích cỡ đổi theo danh mục, nên size đang chọn có
                       * thể không còn hợp lệ (ví dụ "M" khi chuyển sang
                       * "Giày dép"). Reset về size đầu tiên của nhóm mới để
                       * tránh gửi lên giá trị không thuộc danh sách.
                       */
                      size: resolveSizeOptions(category.label, sizes)[0],
                      // Số đo chỉ có ý nghĩa với túi/phụ kiện, bỏ đi khi rời nhóm.
                      sizeMeasurement: usesSizeMeasurement(category.label)
                        ? prev.sizeMeasurement
                        : '',
                    }));
                  }}
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
                : 'Chọn hoặc nhập tay thương hiệu'}
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
        </div>

        {/* =========================================================
            4. PRODUCT NAME + COLOR
        ========================================================= */}
        <div className="rw-lc-sh-form-grid">
          <label className="rw-lc-sh-input-field">
            <div className="rw-lc-sh-input-label-row">
              <span>
                Tên hiển thị sản phẩm{' '}
                <span className="rw-lc-req">*</span>
              </span>

              <span className="rw-lc-sh-counter">
                {displayName.length}/{maxNameLength} ký tự
              </span>
            </div>

            <div className="rw-lc-sh-input-wrap">
              <input
                className={showValidation && errors.name ? 'is-invalid' : ''}
                placeholder="Nhập tên sản phẩm"
                value={form.name}
                maxLength={maxNameLength}
                onChange={update('name')}
                aria-invalid={Boolean(showValidation && errors.name)}
              />

              {/* React/Lucide icon thay cho ký tự ≡ */}
              <List
                className="rw-lc-sh-input-icon"
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
            {showValidation && errors.name && (
              <span className="rw-lc-field-error">{errors.name}</span>
            )}
          </label>

          <label className="rw-lc-sh-input-field">
            <div className="rw-lc-sh-input-label-row">
              <span>
                Màu sắc nhận diện{' '}
                <span className="rw-lc-req">*</span>
              </span>
            </div>

            <div className="rw-lc-sh-input-wrap">
              <input
                className={showValidation && errors.pattern ? 'is-invalid' : ''}
                placeholder="VD: Beige, kẻ sọc"
                value={form.pattern}
                maxLength={80}
                onChange={update('pattern')}
                aria-invalid={Boolean(showValidation && errors.pattern)}
              />

              <Palette
                className="rw-lc-sh-input-icon"
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>
            {showValidation && errors.pattern && (
              <span className="rw-lc-field-error">{errors.pattern}</span>
            )}
          </label>

          <label className="rw-lc-sh-input-field">
            <div className="rw-lc-sh-input-label-row">
              <span>
                Chất liệu{' '}
                <span className="rw-lc-req">*</span>
              </span>
            </div>

            <div className="rw-lc-sh-input-wrap">
              <input
                className={showValidation && errors.material ? 'is-invalid' : ''}
                placeholder="VD: Cotton, Leather"
                value={form.material}
                maxLength={80}
                onChange={update('material')}
                aria-invalid={Boolean(showValidation && errors.material)}
              />

              <Layers
                className="rw-lc-sh-input-icon"
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </div>
            {showValidation && errors.material && (
              <span className="rw-lc-field-error">{errors.material}</span>
            )}
          </label>
        </div>

        {/* =========================================================
            5. SIZE
        ========================================================= */}
        <div className="rw-lc-sh-block rw-lc-sh-size-block">
          {/*
            Túi xách & phụ kiện không có size chuẩn hoá nên không hiện nhóm
            chip "Quy mô sản phẩm" — người bán nhập trực tiếp số đo thật
            (cm) ở khối bên dưới.
          */}
          {!isOneSizeCategory && (
            <>
              <div className="rw-lc-sh-label-row">
                <label className="rw-lc-sh-field-label">
                  {isShoeCategory
                    ? 'Kích cỡ giày theo chuẩn Việt Nam'
                    : 'Kích cỡ theo chuẩn nhãn mác'}
                </label>
              </div>

              <div
                className={`rw-lc-sh-options sizes${isShoeCategory ? ' is-shoes' : ''}`}
              >
                {sizeOptions.map((item) => {
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
                      {item}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {isOneSizeCategory && (
            <label className="rw-lc-sh-size-measure is-first">
              <span>
                Kích thước thật (cm) <span className="rw-lc-req">*</span>
              </span>

              <input
                type="text"
                className={`rw-lc-input${
                  showValidation && errors.sizeMeasurement ? ' is-invalid' : ''
                }`}
                placeholder="VD: 23x14x7cm hoặc 168x30cm"
                value={form.sizeMeasurement}
                maxLength={40}
                onChange={update('sizeMeasurement')}
                aria-invalid={Boolean(showValidation && errors.sizeMeasurement)}
              />

              {showValidation && errors.sizeMeasurement && (
                <span className="rw-lc-field-error">
                  {errors.sizeMeasurement}
                </span>
              )}

              <small>
                Ghi kích thước thật giúp người mua chắc chắn hơn, đồng thời hỗ
                trợ AI đối chiếu với ảnh chụp.
              </small>
            </label>
          )}

          {/* =========================================================
              6. GENDER
          ========================================================= */}
          {/*
            Dùng cùng pattern chip như danh mục/size để thao tác giống nhau,
            và tách thành khối riêng vì kích cỡ (mục 5) ở trên đã chiếm hàng.
          */}
          <div className="rw-lc-sh-block rw-lc-sh-gender-block">
            <div className="rw-lc-sh-label-row">
              <label className="rw-lc-sh-field-label">Giới tính sản phẩm</label>
            </div>

            <div
              className="rw-lc-sh-options genders"
              role="radiogroup"
              aria-label="Giới tính sản phẩm"
            >
              {GENDER_OPTIONS.map((option) => {
                const isActive = form.gender === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={isActive ? 'active' : ''}
                    aria-pressed={isActive}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        gender: option.id,
                      }))
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
            7. PRICE
        ========================================================= */}
        <div className="rw-lc-sh-block rw-lc-sh-price-block">
          <label className="rw-lc-sh-field-label">
            Giá niêm yết bán buôn &amp; Ký quỹ (VND){' '}
            <span className="rw-lc-req">*</span>
          </label>

          <div className="rw-lc-sh-price-input-wrap">
            <input
              className={`rw-lc-sh-price${
                showValidation && errors.price ? ' is-invalid' : ''
              }`}
              placeholder="Nhập giá bán (VND)"
              value={form.price}
              inputMode="numeric"
              onChange={update('price')}
              aria-invalid={Boolean(showValidation && errors.price)}
            />

            <span className="rw-lc-sh-price-currency">
              ₫
            </span>
          </div>

          {showValidation && errors.price && (
            <span className="rw-lc-field-error">
              {errors.price}
            </span>
          )}

          <div className="rw-lc-sh-summary">
            <div className="rw-lc-sh-summary-row">
              <span>
                <Truck
                  className="rw-lc-sh-summary-icon"
                  size={10}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                {shippingLabel}
              </span>

              <b className="is-blue">
                {shippingValue}
              </b>
            </div>

            <div className="rw-lc-sh-summary-total">
              <div>
                <strong>
                  {totalLabel}
                </strong>

                <small>
                  Số tiền tạm tính, chưa trừ phí nền tảng.
                </small>
              </div>

              {/*
                Trước đây khối này hiện chuỗi fix cứng "8,500,000 ₫" nên dù
                người bán gõ giá khác, số tiền vẫn giữ nguyên giá trị cũ. Giờ
                lấy trực tiếp từ giá niêm yết đã nhập.
              */}
              <em>{totalDisplay}</em>
            </div>
          </div>
        </div>

        {/*
          Ô "Mô tả" đã gỡ khỏi nhánh Secondhand: tình trạng sản phẩm được
          thu thập ở khối "2. Thông tin sử dụng & tình trạng" (thời gian sử
          dụng, dấu hiệu sử dụng, lịch sử bảo quản) nên không cần nhập lại.
        */}
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
        {title ?? (variant === 'clearance' ? 'Thông tin sản phẩm' : '1. Thông tin sản phẩm')}
      </h2>

      <p className="rw-lc-info-sub">
        {sub}
      </p>

      {/*
        Các trường chia thành 3 nhóm theo mật độ thông tin để dễ quét:
        phân loại → thông tin mô tả → giá & mô tả chi tiết.
      */}
      <div className="rw-lc-info-grid">
        {/* =========================================================
            NHÓM 1: PHÂN LOẠI SẢN PHẨM
        ========================================================= */}
        <div className="rw-lc-info-group" role="group" aria-label="Phân loại sản phẩm">
          <h3 className="rw-lc-info-group-title">
            Phân loại sản phẩm
          </h3>
          <div className="rw-lc-info-group-body">
            {/* CATEGORY */}
        {/*
          `span-2`: 4 chip danh mục cần hết một hàng, đặt trong 1 cột của
          grid 2 cột sẽ bị bóp và vỡ xuống nhiều dòng khó đọc.
        */}
        <div className="rw-lc-info-field span-2">
          <span className="rw-lc-label">
            Danh mục sản phẩm{' '}
            <span className="rw-lc-req">*</span>
          </span>

          {/*
            Dùng chung danh mục với nhánh "Hàng Secondhand" để hai nhánh không
            lệch nhau — chọn danh mục ở đây cũng quyết định bộ kích cỡ hiển thị.
          */}
          <div
            className="rw-lc-sh-options"
            role="radiogroup"
            aria-label="Danh mục sản phẩm"
          >
            {LISTING_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = form.categoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={isActive ? 'active' : ''}
                  aria-pressed={isActive}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      category: category.label,
                      categoryId: category.id,
                      /*
                       * Bộ kích cỡ đổi theo danh mục nên size đang chọn có thể
                       * không còn hợp lệ (VD: "M" khi chuyển sang giày).
                       * Reset về size đầu tiên của nhóm mới.
                       */
                      size: resolveSizeOptions(category.label, sizes)[0],
                      // Số đo chỉ có ý nghĩa với túi/phụ kiện, bỏ đi khi rời nhóm.
                      sizeMeasurement: usesSizeMeasurement(category.label)
                        ? prev.sizeMeasurement
                        : '',
                    }));
                  }}
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

          {showValidation && errors.category && (
            <span className="rw-lc-field-error">
              {errors.category}
            </span>
          )}
        </div>

        {/* BRAND */}
        <div className="rw-lc-info-field span-2">
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
            placeholder="Nhập thương hiệu"
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
            placeholder="VD: Áo khoác dạng dài, chất liệu cotton"
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
        {/*
          `span-2`: chip kích cỡ có số lượng thay đổi theo danh mục (5 → 7),
          cần hàng riêng để các chip thẳng hàng, không bị ngắt dòng lệch nhau.

          Túi xách & phụ kiện không có size chuẩn hoá nên không hiện chip
          "Quy mô sản phẩm" — chỉ nhập trực tiếp số đo thật (cm).
        */}
        <div className="rw-lc-info-field span-2">
          {!isOneSizeCategory && (
            <>
              <span className="rw-lc-label">
                {isShoeCategory
                  ? 'Kích cỡ giày (VN)'
                  : 'Kích cỡ (Size)'}{' '}
                <span className="rw-lc-req">*</span>
              </span>

              <div
                className="rw-lc-size-row"
                role="radiogroup"
                aria-label="Kích cỡ (Size)"
              >
                {sizeOptions.map((size) => {
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
            </>
          )}

          {isOneSizeCategory && (
            <label className="rw-lc-sh-size-measure is-first">
              <span>
                Kích thước thật (cm){' '}
                <span className="rw-lc-req">*</span>
              </span>

              <input
                type="text"
                className={`rw-lc-input${
                  showValidation && errors.sizeMeasurement ? ' is-invalid' : ''
                }`}
                placeholder="VD: 23x14x7cm hoặc 168x30cm"
                value={form.sizeMeasurement}
                maxLength={40}
                onChange={update('sizeMeasurement')}
                aria-invalid={Boolean(showValidation && errors.sizeMeasurement)}
              />

              {showValidation && errors.sizeMeasurement && (
                <span className="rw-lc-field-error">
                  {errors.sizeMeasurement}
                </span>
              )}
            </label>
          )}
        </div>

        {/* GENDER */}
        <div className="rw-lc-info-field span-2">
          <span className="rw-lc-label">
            Giới tính{' '}
            <span className="rw-lc-req">*</span>
          </span>

          <div
            className="rw-lc-sh-options genders"
            role="radiogroup"
            aria-label="Giới tính"
          >
            {GENDER_OPTIONS.map((option) => {
              const isActive = form.gender === option.id;

              return (
                <label
                  key={option.id}
                  className={`rw-lc-size-chip${isActive ? ' active' : ''}`}
                >
                  <input
                    type="radio"
                    className="rw-lc-size-input"
                    name="rw-listing-gender"
                    value={option.id}
                    checked={isActive}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        gender: option.id,
                      }))
                    }
                  />

                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
          </div>
        </div>

        {/* =========================================================
            NHÓM 2: THÔNG TIN MÔ TẢ
        ========================================================= */}
        <div className="rw-lc-info-group" role="group" aria-label="Thông tin mô tả">
          <h3 className="rw-lc-info-group-title">
            Thông tin mô tả
          </h3>
          <div className="rw-lc-info-group-body">
            {/* PATTERN */}
        <div className="rw-lc-info-field span-2">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-pattern"
          >
            Màu sắc &amp; Họa tiết{' '}
            <span className="rw-lc-req">*</span>
          </label>

          <input
            id="rw-li-pattern"
            className={`rw-lc-input${showValidation && errors.pattern
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Beige, kẻ sọc"
            value={form.pattern}
            onChange={update('pattern')}
            maxLength={80}
            aria-invalid={Boolean(showValidation && errors.pattern)}
          />

          {showValidation && errors.pattern && (
            <span className="rw-lc-field-error">
              {errors.pattern}
            </span>
          )}
        </div>

        {/* MATERIAL */}
        <div className="rw-lc-info-field span-2">
          <label
            className="rw-lc-label"
            htmlFor="rw-li-material"
          >
            Chất liệu{' '}
            <span className="rw-lc-req">*</span>
          </label>

          <input
            id="rw-li-material"
            className={`rw-lc-input${showValidation && errors.material
                ? ' is-invalid'
                : ''
              }`}
            placeholder="VD: Cotton, Leather"
            value={form.material}
            onChange={update('material')}
            maxLength={80}
            aria-invalid={Boolean(showValidation && errors.material)}
          />

          {showValidation && errors.material && (
            <span className="rw-lc-field-error">
              {errors.material}
            </span>
          )}
        </div>
          </div>
        </div>

        {/* =========================================================
            NHÓM 3: GIÁ & MÔ TẢ CHI TIẾT
        ========================================================= */}
        <div
          className="rw-lc-info-group"
          role="group"
          aria-label={variant === 'clearance' ? 'Giá bán' : 'Giá & Mô tả chi tiết'}
        >
          <h3 className="rw-lc-info-group-title">
            {variant === 'clearance' ? 'Giá bán' : 'Giá & Mô tả chi tiết'}
          </h3>
          <div className="rw-lc-info-group-body">
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
              aria-invalid={Boolean(showValidation && errors.price)}
            />

            <span className="rw-lc-price-suffix">
              {form.currency}
            </span>
          </div>

          {showValidation && errors.price && (
            <span className="rw-lc-field-error">
              {errors.price}
            </span>
          )}

          <div className="rw-lc-fee-summary">
            <div className="rw-lc-fee-box">
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
                {totalDisplay}
              </span>
            </div>
          </div>
        </div>

        {/*
          Ô "Mô tả sản phẩm chi tiết" đã gỡ khỏi cả hai nhánh: nhánh Secondhand
          đã bỏ ở trên, còn nhánh thanh lý là hàng mới nên vốn không cần mô tả
          tình trạng — và khối này trước đây vốn đã không bao giờ hiển thị vì bị
          điều kiện `variant !== 'clearance'` chặn trong chính nhánh clearance.
        */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListingInfoSection;