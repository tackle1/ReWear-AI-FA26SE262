import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Bell,
  Check,
  ChevronRight,
  CircleCheck,
  Heart,
  KeyRound,
  Lock,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import useWishlist from '../hooks/useWishlist';
import { BUYER_ORDERS } from '../data/orders.data';
import { MARKETPLACE_CATALOG } from '../data/marketplace.data';
import {
  ACCOUNT_ACTIVITY_CARDS,
  ACCOUNT_ADDRESSES,
  ACCOUNT_CONTACT_ROWS,
  ACCOUNT_NOTIFICATION_CHANNELS,
  ACCOUNT_PASSWORD_RULES,
  ACCOUNT_TABS,
  ACCOUNT_TIERS,
  type AccountTabKey,
  type BuyerAddress,
  type BuyerAccountTier,
} from '../data/account.data';
import type { BuyerOrderStatus } from '../types/orders.type';
import '../../../styles/marketplace/BuyerAccountPage.css';

/** Hồ sơ người mua đọc từ phiên đăng nhập (`rewear_current_user`). */
interface CurrentUser {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

/** Key lưu hạng thành viên (mock, chưa có API). */
const TIER_KEY = 'rewear_account_tier';

/** Số dòng tối đa hiển thị trong tab đơn mua / yêu thích trước khi xem thêm. */
const ACCOUNT_ACTIVITY_MAX_ROWS = 4;

/** Nhãn trạng thái đơn dùng ở danh sách rút gọn trong tab "Đơn mua của tôi". */
const ORDER_STATUS_LABELS: Record<BuyerOrderStatus, string> = {
  'pending-payment': 'Chờ thanh toán',
  processing: 'Đang xử lý',
  'awaiting-seller': 'Chờ Seller giao',
  shipping: 'Đang giao hàng',
  completed: 'Đã hoàn tất',
};

/** Form hồ sơ chỉnh sửa được — email bị khoá vì là định danh đăng nhập. */
interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

const formatVND = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

/** Kiểm tra mật khẩu theo `ACCOUNT_PASSWORD_RULES`. */
const isPasswordValid = (value: string) =>
  value.length >= ACCOUNT_PASSWORD_RULES.minLength &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value);


/**
 * Trang Tài khoản người mua (/buyer/account).
 * Gom bốn nhóm thông tin dưới dạng tab: hồ sơ, sổ địa chỉ, bảo mật và thông báo.
 * Dữ liệu người dùng đọc từ phiên đăng nhập nên luôn khớp với tài khoản đang dùng.
 */
export const BuyerAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { savedIds } = useWishlist();
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<AccountTabKey>('profile');
  const [tier, setTier] = useState<BuyerAccountTier>(
    () => storage.getItem<BuyerAccountTier>(TIER_KEY) ?? 'basic',
  );
  const [addresses, setAddresses] = useState<BuyerAddress[]>(ACCOUNT_ADDRESSES);
  const [channels, setChannels] = useState(ACCOUNT_NOTIFICATION_CHANNELS);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const user = storage.getItem<CurrentUser>('rewear_current_user');

  const [form, setForm] = useState<ProfileForm>({
    name: user?.name?.trim() || 'Hoàng Nam',
    email: user?.email?.trim() || 'hoangnam@example.com',
    phone: user?.phone?.trim() || '0908 123 456',
  });
  const [savedForm, setSavedForm] = useState<ProfileForm>(form);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const tierInfo = ACCOUNT_TIERS[tier];

  /** Tổng chi tiêu = tổng các đơn trong `BUYER_ORDERS`. */
  const orderTotal = useMemo(
    () => BUYER_ORDERS.reduce((sum, order) => sum + order.total, 0),
    [],
  );
  const lifetimeSpend = orderTotal;

  /** Đơn mới nhất hiển thị ở tab "Đơn mua của tôi". */
  const recentOrders = useMemo(
    () =>
      [...BUYER_ORDERS]
        .sort((a, b) => b.dateISO.localeCompare(a.dateISO))
        .slice(0, ACCOUNT_ACTIVITY_MAX_ROWS),
    [],
  );

  /** Sản phẩm đã lưu, tra cùng catalog với trang Danh sách yêu thích. */
  const savedProducts = useMemo(
    () =>
      savedIds
        .map((id) => MARKETPLACE_CATALOG.find((product) => product.id === id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product))
        .slice(0, ACCOUNT_ACTIVITY_MAX_ROWS),
    [savedIds],
  );

  /** Phần trăm đã đạt ngưỡng lên hạng tiếp theo (0 - 100). */
  const tierProgress = useMemo(() => {
    if (!tierInfo.nextTierThreshold) return 100;
    return Math.min(100, Math.round((lifetimeSpend / tierInfo.nextTierThreshold) * 100));
  }, [lifetimeSpend, tierInfo]);

  const isProfileDirty =
    form.name.trim() !== savedForm.name || form.phone.trim() !== savedForm.phone;

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const handleSaveProfile = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name) {
      setToast('Vui lòng nhập họ và tên.');
      return;
    }
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) {
      setToast('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.');
      return;
    }
    // Cập nhật luôn phiên đăng nhập để BuyerTopbar và các trang khác đồng bộ tên.
    storage.setItem('rewear_current_user', { ...(user ?? {}), name, phone });
    setSavedForm({ ...form, name, phone });
    setToast('Đã cập nhật hồ sơ cá nhân.');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === id })));
    setToast('Đã đặt địa chỉ này làm mặc định.');
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((item) => item.id !== id);
      // Không để sổ địa chỉ trống hoàn toàn và luôn giữ đúng một mặc định.
      if (next.length > 0 && !next.some((item) => item.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
    setToast('Đã xoá địa chỉ khỏi sổ địa chỉ.');
  };

  const handleToggleChannel = (key: string) => {
    setChannels((prev) =>
      prev.map((item) => (item.key === key ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const handleChangePassword = () => {
    if (!isPasswordValid(password)) {
      setToast(ACCOUNT_PASSWORD_RULES.hint);
      return;
    }
    if (password !== confirmPassword) {
      setToast('Hai mật khẩu không khớp.');
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setToast('Đã cập nhật mật khẩu thành công.');
  };

  /** Ô liên hệ lấy giá trị từ form đã lưu để không lệch với dữ liệu gửi đi. */
  const contactValues: Record<string, string> = {
    email: savedForm.email,
    phone: savedForm.phone,
    memberSince: '12/03/2026',
  };

  return (
    <div className="rw-mkt-app rw-acc-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={savedForm.name || undefined}
        activeNavKey="purchases"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-mkt-main">
        <nav className="rw-acc-breadcrumb" aria-label="Đường dẫn">
          <button type="button" onClick={() => navigate(ROUTES.MARKETPLACE.ROOT)}>
            Khám phá
          </button>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Tài khoản người mua</span>
        </nav>

        {/* ── Thẻ hồ sơ: avatar, hạng thành viên, tiến trình lên hạng ── */}
        <section className="rw-acc-hero" aria-label="Tóm tắt tài khoản">
          <span className="rw-acc-hero-avatar" aria-hidden="true">
            <img src={buyerAvatar} alt="" />
          </span>
          <div className="rw-acc-hero-main">
            <div className="rw-acc-hero-title">
              <h1>{savedForm.name}</h1>
              <span className={`rw-acc-tier is-${tier}`}>
                <ShieldCheck size={11} aria-hidden="true" />
                {tierInfo.label}
              </span>
            </div>
            <p>{savedForm.email}</p>
            <div className="rw-acc-hero-stats">
              <span>
                <b>{BUYER_ORDERS.length}</b> đơn hàng
              </span>
              <span>
                <b>{savedIds.length}</b> yêu thích
              </span>
              <span>
                <b>{addresses.length}</b> địa chỉ
              </span>
              <span>
                <b>{formatVND(lifetimeSpend)}</b> tổng chi tiêu
              </span>
            </div>
          </div>
          <div className="rw-acc-hero-tier">
            <div className="rw-acc-hero-tier-head">
              <Star size={12} aria-hidden="true" />
              <b>{tierInfo.label}</b>
            </div>
            <p>{tierInfo.benefit}</p>
            <div
              className="rw-acc-progress"
              role="progressbar"
              aria-valuenow={tierProgress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tiến trình lên hạng thành viên"
            >
              <i style={{ width: `${tierProgress}%` }} />
            </div>
            <small>
              {tierInfo.nextTierThreshold
                ? `Chi thêm ${formatVND(tierInfo.nextTierThreshold - lifetimeSpend)} để lên hạng tiếp theo`
                : 'Bạn đang ở hạng cao nhất'}
            </small>
            {tier !== 'vip' && (
              <button
                type="button"
                className="rw-acc-hero-upgrade"
                onClick={() => {
                  const next = tier === 'basic' ? 'trusted' : 'vip';
                  setTier(next);
                  storage.setItem(TIER_KEY, next);
                  setToast(`Đã nâng lên hạng ${ACCOUNT_TIERS[next].label}.`);
                }}
              >
                Nâng hạng ngay
              </button>
            )}
          </div>
        </section>

        {/* ── Tabs điều hướng ── */}
        <div className="rw-acc-tabs" role="tablist" aria-label="Nhóm thông tin tài khoản">
          {ACCOUNT_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`rw-acc-tab-${item.key}`}
              aria-selected={tab === item.key}
              aria-controls={`rw-acc-panel-${item.key}`}
              className={`rw-acc-tab${tab === item.key ? ' is-active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <b>{item.label}</b>
              <span>{item.hint}</span>
            </button>
          ))}
        </div>

        {/* ── Hồ sơ cá nhân ── */}
        {tab === 'profile' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-profile" aria-labelledby="rw-acc-tab-profile">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <User size={14} aria-hidden="true" />
                <div>
                  <h2>Thông tin cá nhân</h2>
                  <p>Thông tin dùng cho hồ sơ, hoá đơn và khiếu nại đơn hàng.</p>
                </div>
              </div>
              <div className="rw-acc-field-grid">
                <label className="rw-acc-field">
                  <span>Họ và tên</span>
                  <input type="text" value={form.name} autoComplete="name" onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </label>
                <label className="rw-acc-field">
                  <span>Email đăng nhập</span>
                  <input type="email" value={form.email} readOnly disabled />
                  <small>Email là định danh đăng nhập nên không thể thay đổi.</small>
                </label>
                <label className="rw-acc-field">
                  <span>Số điện thoại</span>
                  <input type="tel" inputMode="numeric" value={form.phone} autoComplete="tel" onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  <small>Dùng để liên hệ khi có khiếu nại đơn hàng.</small>
                </label>
                <div className="rw-acc-field">
                  <span>Phân quyền</span>
                  <input type="text" value="Người mua đã xác thực" readOnly disabled />
                  <small>Quyền được cấp tự động sau khi xác thực số điện thoại.</small>
                </div>
              </div>
              <div className="rw-acc-card-foot">
                <button type="button" className="rw-acc-btn rw-acc-btn--primary" disabled={!isProfileDirty} onClick={handleSaveProfile}>
                  <Check size={13} aria-hidden="true" />
                  Lưu thay đổi
                </button>
                <button type="button" className="rw-acc-btn" disabled={!isProfileDirty} onClick={() => setForm(savedForm)}>
                  Hoàn tác
                </button>
              </div>
            </div>
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <CircleCheck size={14} aria-hidden="true" />
                <div>
                  <h2>Thông tin liên hệ</h2>
                  <p>Giá trị dưới đây luôn khớp với hồ sơ đã lưu.</p>
                </div>
              </div>
              <ul className="rw-acc-contact">
                {ACCOUNT_CONTACT_ROWS.map((row) => (
                  <li key={row.key}>
                    <b>{row.label}</b>
                    <span>{contactValues[row.key]}</span>
                    <small>{row.note}</small>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Đơn mua của tôi ── */}
        {tab === 'purchases' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-purchases" aria-labelledby="rw-acc-tab-purchases">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <Package size={14} aria-hidden="true" />
                <div>
                  <h2>{ACCOUNT_ACTIVITY_CARDS.purchases.title}</h2>
                  <p>{ACCOUNT_ACTIVITY_CARDS.purchases.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="rw-acc-btn rw-acc-btn--primary"
                  onClick={() => navigate(ROUTES.BUYER.ORDERS)}
                >
                  {ACCOUNT_ACTIVITY_CARDS.purchases.actionLabel}
                  <ChevronRight size={13} aria-hidden="true" />
                </button>
              </div>
              {recentOrders.length > 0 ? (
                <ul className="rw-acc-orders">
                  {recentOrders.map((order) => (
                    <li key={order.id}>
                      <button
                        type="button"
                        className="rw-acc-order"
                        onClick={() =>
                          navigate(ROUTES.BUYER.ORDER_DETAIL.replace(':orderId', encodeURIComponent(order.id)))
                        }
                      >
                        <span className="rw-acc-order-thumb" aria-hidden="true">
                          <img src={order.productImage} alt="" />
                        </span>
                        <span className="rw-acc-order-main">
                          <b>{order.productTitle}</b>
                          <small>{order.id} · {order.dateLabel} · {order.productMeta}</small>
                        </span>
                        <span className="rw-acc-order-tail">
                          <b>{formatVND(order.total)}</b>
                          <small>{ORDER_STATUS_LABELS[order.status]}</small>
                        </span>
                        <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rw-acc-empty">Bạn chưa có đơn mua nào trên ReWear AI.</p>
              )}
            </div>
          </section>
        )}

        {/* ── Danh sách yêu thích ── */}
        {tab === 'wishlist' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-wishlist" aria-labelledby="rw-acc-tab-wishlist">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <Heart size={14} aria-hidden="true" />
                <div>
                  <h2>{ACCOUNT_ACTIVITY_CARDS.wishlist.title}</h2>
                  <p>{ACCOUNT_ACTIVITY_CARDS.wishlist.subtitle}</p>
                </div>
                <button
                  type="button"
                  className="rw-acc-btn rw-acc-btn--primary"
                  onClick={() => navigate(ROUTES.BUYER.WISHLIST)}
                >
                  {ACCOUNT_ACTIVITY_CARDS.wishlist.actionLabel}
                  <ChevronRight size={13} aria-hidden="true" />
                </button>
              </div>
              {savedProducts.length > 0 ? (
                <ul className="rw-acc-wishlist">
                  {savedProducts.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="rw-acc-wish"
                        onClick={() =>
                          navigate(
                            ROUTES.MARKETPLACE.PRODUCT_DETAIL.replace(':id', encodeURIComponent(product.id)),
                          )
                        }
                      >
                        <span className="rw-acc-wish-thumb" aria-hidden="true">
                          <img src={product.image} alt="" />
                        </span>
                        <span className="rw-acc-wish-main">
                          <b>{product.title}</b>
                          <small>{product.brand} · {product.condition}</small>
                        </span>
                        <span className="rw-acc-wish-tail">
                          <b>{formatVND(product.price)}</b>
                          <small>AI {product.aiScore}%</small>
                        </span>
                        <ChevronRight size={14} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rw-acc-empty">
                  Chưa có sản phẩm nào được lưu. Bấm biểu tượng tim trên thẻ sản phẩm để thêm vào danh sách.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Sổ địa chỉ ── */}
        {tab === 'addresses' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-addresses" aria-labelledby="rw-acc-tab-addresses">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <MapPin size={14} aria-hidden="true" />
                <div>
                  <h2>Sổ địa chỉ</h2>
                  <p>Địa chỉ mặc định được chọn sẵn khi bạn thanh toán.</p>
                </div>
                <button type="button" className="rw-acc-btn rw-acc-btn--primary" onClick={() => setToast('Chức năng thêm địa chỉ sẽ có ở phiên bản tiếp theo.')}>
                  <Plus size={13} aria-hidden="true" />
                  Thêm địa chỉ
                </button>
              </div>
              <ul className="rw-acc-addresses">
                {addresses.map((item) => (
                  <li key={item.id} className={`rw-acc-address${item.isDefault ? ' is-default' : ''}`}>
                    <div className="rw-acc-address-main">
                      <div className="rw-acc-address-top">
                        <b>{item.label}</b>
                        {item.isDefault && <span className="rw-acc-badge">Mặc định</span>}
                      </div>
                      <p>{item.fullName} · {item.phone}</p>
                      <small>{item.address}, {item.city}</small>
                    </div>
                    <div className="rw-acc-address-actions">
                      <button type="button" className="rw-acc-icon-btn" onClick={() => setEditingAddressId((prev) => (prev === item.id ? null : item.id))}>
                        <Pencil size={12} aria-hidden="true" />
                        Sửa
                      </button>
                      {!item.isDefault && (
                        <button type="button" className="rw-acc-icon-btn" onClick={() => handleSetDefaultAddress(item.id)}>
                          <Star size={12} aria-hidden="true" />
                          Đặt mặc định
                        </button>
                      )}
                      <button type="button" className="rw-acc-icon-btn is-danger" onClick={() => handleRemoveAddress(item.id)}>
                        <Trash2 size={12} aria-hidden="true" />
                        Xoá
                      </button>
                    </div>
                    {editingAddressId === item.id && (
                      <p className="rw-acc-address-note">Chỉnh sửa chi tiết địa chỉ sẽ có ở phiên bản tiếp theo.</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Bảo mật ── */}
        {tab === 'security' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-security" aria-labelledby="rw-acc-tab-security">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <Lock size={14} aria-hidden="true" />
                <div>
                  <h2>Đổi mật khẩu</h2>
                  <p>{ACCOUNT_PASSWORD_RULES.hint}</p>
                </div>
              </div>
              <div className="rw-acc-field-grid">
                <label className="rw-acc-field">
                  <span>Mật khẩu mới</span>
                  <input type="password" value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label className="rw-acc-field">
                  <span>Nhập lại mật khẩu</span>
                  <input type="password" value={confirmPassword} autoComplete="new-password" onChange={(e) => setConfirmPassword(e.target.value)} />
                </label>
              </div>
              <div className="rw-acc-card-foot">
                <button type="button" className="rw-acc-btn rw-acc-btn--primary" onClick={handleChangePassword}>
                  <KeyRound size={13} aria-hidden="true" />
                  Cập nhật mật khẩu
                </button>
              </div>
            </div>
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <ShieldCheck size={14} aria-hidden="true" />
                <div>
                  <h2>Xác thực hai lớp</h2>
                  <p>Tăng bảo mật bằng mã OTP gửi qua ứng dụng xác thực.</p>
                </div>
              </div>
              <ul className="rw-acc-contact">
                <li>
                  <b>Ứng dụng xác thực</b>
                  <span>Đã bật</span>
                  <small>Mã OTP sinh mới sau mỗi 30 giây.</small>
                </li>
                <li>
                  <b>Số điện thoại dự phòng</b>
                  <span>{savedForm.phone}</span>
                  <small>Dùng khi bạn không truy cập được ứng dụng xác thực.</small>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ── Thông báo ── */}
        {tab === 'notifications' && (
          <section className="rw-acc-panel" role="tabpanel" id="rw-acc-panel-notifications" aria-labelledby="rw-acc-tab-notifications">
            <div className="rw-acc-card">
              <div className="rw-acc-card-head">
                <Bell size={14} aria-hidden="true" />
                <div>
                  <h2>Kênh thông báo</h2>
                  <p>Chọn kênh bạn muốn nhận thông báo từ ReWear AI.</p>
                </div>
              </div>
              <ul className="rw-acc-channels">
                {channels.map((item) => (
                  <li key={item.key}>
                    <label className={`rw-acc-switch${item.enabled ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={item.enabled} onChange={() => handleToggleChannel(item.key)} />
                      <span className="rw-acc-switch-track" aria-hidden="true"><i /></span>
                      <span className="rw-acc-switch-copy">
                        <b>{item.label}</b>
                        <small>{item.note}</small>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="rw-acc-card-foot">
                <button type="button" className="rw-acc-btn rw-acc-btn--primary" onClick={() => setToast('Đã lưu cài đặt thông báo.')}>
                  <Check size={13} aria-hidden="true" />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <MarketplaceFooter />

      {toast && (
        <div className="rw-mkt-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
};

export default BuyerAccountPage;
