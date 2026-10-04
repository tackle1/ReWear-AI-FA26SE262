import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  Eye,
  Focus,
  Globe,
  Image as ImageIcon,
  Info,
  LockKeyhole,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Zap,
} from 'lucide-react';
import BuyerTopbar from '../components/BuyerTopbar';
import MarketplaceFooter from '../components/MarketplaceFooter';
import buyerAvatar from '../../../assets/images/seller-avatar.png';
import ROUTES from '../../../routes/routes.config';
import { logout } from '../../../store/slices/authSlice';
import storage, { tokenStorage } from '../../../utils/storage';
import { BUYER_PRODUCTS } from '../data/marketplace.data';
import {
  AI_ASSISTANT_INTRO,
  AI_FACTS,
  AI_SUMMARY_POINTS,
  ARCHIVED_LABEL_COUNT,
  DEAL_LIST_PRICE,
  DEAL_PIN_BADGE,
  ESCROW_META,
  MESSAGE_THREAD_GROUPS,
  QUICK_ACTIONS,
  THREAD_IMAGES,
} from '../data/messages.data';
import type { ChatMessage, MessageThread } from '../types/messages.type';
import '../../../styles/marketplace/MessagesPage.css';

const formatPrice = (price: number) => price.toLocaleString('vi-VN');

const ESCROW_META_ICON = {
  zap: Zap,
  globe: Globe,
  refresh: RefreshCw,
} as const;

const nowTime = () => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Dữ liệu điều hướng từ nút "Nhắn tin" ở trang chi tiết sản phẩm sang hộp thư. */
interface MessagesRouteState {
  productId?: string;
  sellerHandle?: string;
  threadId?: string;
}

const ALL_MESSAGE_THREADS = MESSAGE_THREAD_GROUPS.flatMap((group) =>
  group.threads.map((thread) => ({ thread, groupKey: group.key }))
);

const normalizeSellerHandle = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/^@/, '') ?? '';

/**
 * Tìm hội thoại phù hợp khi mở hộp thư từ trang sản phẩm:
 * ưu tiên threadId, rồi productId, rồi sellerHandle; không khớp thì về hội thoại đầu tiên.
 */
const resolveLinkedConversation = (request: MessagesRouteState) => {
  const fallback = { ...ALL_MESSAGE_THREADS[0], matched: false };
  const threadId = request.threadId?.trim().toLowerCase() ?? '';
  const requestedThread = threadId
    ? ALL_MESSAGE_THREADS.find((item) => item.thread.id.toLowerCase() === threadId)
    : undefined;
  if (requestedThread) return { ...requestedThread, matched: true };
  const productId = request.productId?.trim().toLowerCase() ?? '';
  const requestedProduct = productId
    ? ALL_MESSAGE_THREADS.find((item) => item.thread.productId.toLowerCase() === productId)
    : undefined;
  if (requestedProduct) return { ...requestedProduct, matched: true };
  const sellerHandle = normalizeSellerHandle(request.sellerHandle);
  const requestedSeller = sellerHandle
    ? ALL_MESSAGE_THREADS.find((item) => normalizeSellerHandle(item.thread.sellerHandle) === sellerHandle)
    : undefined;
  if (requestedSeller) return { ...requestedSeller, matched: true };
  return fallback;
};

/**
 * Hộp thư giao dịch: danh sách hội thoại | khung chat | panel ký quỹ + AI Assistant.
 * Bố cục 3 cột khớp thiết kế tham chiếu.
 */
const BuyerMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const user = storage.getItem<{ name?: string }>('rewear_current_user');
  const routeState = (location.state ?? {}) as MessagesRouteState;

  /** Hội thoại được trỏ tới khi mở từ nút "Nhắn tin" ở trang chi tiết sản phẩm. */
  const linkedConversation = resolveLinkedConversation({
    productId: routeState.productId ?? searchParams.get('product') ?? undefined,
    sellerHandle: routeState.sellerHandle ?? searchParams.get('seller') ?? undefined,
    threadId: routeState.threadId ?? searchParams.get('thread') ?? undefined,
  });

  const [tabKey, setTabKey] = useState<'active' | 'archived'>(() => linkedConversation.groupKey);
  const [search, setSearch] = useState('');
  const [activeThreadId, setActiveThreadId] = useState(() => linkedConversation.thread.id);
  const [draft, setDraft] = useState('');
  const [extraMessages, setExtraMessages] = useState<Record<string, ChatMessage[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const handledLocationKey = useRef('');

  const activeGroup = MESSAGE_THREAD_GROUPS.find((group) => group.key === tabKey) ?? MESSAGE_THREAD_GROUPS[0];

  const visibleThreads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeGroup.threads;
    return activeGroup.threads.filter(
      (item) =>
        item.sellerHandle.toLowerCase().includes(query) ||
        item.productSummary.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query)
    );
  }, [activeGroup, search]);

  const thread: MessageThread =
    MESSAGE_THREAD_GROUPS.flatMap((group) => group.threads).find((item) => item.id === activeThreadId) ??
    MESSAGE_THREAD_GROUPS[0].threads[0];

  const product = useMemo(
    () => BUYER_PRODUCTS.find((item) => item.id === thread.productId) ?? BUYER_PRODUCTS[0],
    [thread.productId]
  );
  const productImage = THREAD_IMAGES[thread.productId] ?? product.image;
  const messages = [...thread.messages, ...(extraMessages[thread.id] ?? [])];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.id, messages.length]);

  useEffect(() => {
    if (handledLocationKey.current === location.key) return;
    handledLocationKey.current = location.key;
    setTabKey((prev) => (prev === linkedConversation.groupKey ? prev : linkedConversation.groupKey));
    setActiveThreadId((prev) => (prev === linkedConversation.thread.id ? prev : linkedConversation.thread.id));
    if (linkedConversation.matched) {
      setToast(`Đã mở hội thoại với ${linkedConversation.thread.sellerHandle}.`);
    } else if (routeState.productId ?? searchParams.get('product')) {
      setToast('Chưa có hội thoại cho sản phẩm này. Đang hiển thị hội thoại gần nhất.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const handleLogout = () => {
    storage.removeItem('rewear_current_user');
    tokenStorage.clearTokens();
    dispatch(logout());
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };

  const sendMessage = (text: string) => {
    const value = text.trim();
    if (!value) return;
    setExtraMessages((prev) => ({
      ...prev,
      [thread.id]: [
        ...(prev[thread.id] ?? []),
        { id: `local-${Date.now()}`, author: 'buyer', text: value, time: nowTime() },
      ],
    }));
    setDraft('');
  };

  return (
    <div className="rw-mkt-app rw-messages-app">
      <BuyerTopbar
        avatarSrc={buyerAvatar}
        userName={user?.name?.trim() || undefined}
        activeNavKey="messages"
        onWishlistClick={() => navigate(ROUTES.BUYER.WISHLIST)}
        onLogout={handleLogout}
      />

      <main className="rw-msg-main">
        <nav className="rw-msg-breadcrumb" aria-label="Đường dẫn">
          <Link to={ROUTES.MARKETPLACE.ROOT}>Trang chủ</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link to={ROUTES.BUYER.MESSAGES}>Hộp thư giao dịch</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">Phiên tư vấn &amp; Kiểm định Escrow #{thread.id.replace('TH-', 'RW-')}</span>
        </nav>

        <div className="rw-msg-layout">
          {/* ── Cột 1: danh sách hội thoại ── */}
          <aside className="rw-msg-list" aria-label="Danh sách tin nhắn">
            <div className="rw-msg-tabs" role="tablist" aria-label="Bộ lọc hội thoại">
              <button
                type="button"
                role="tab"
                aria-selected={tabKey === 'active'}
                className={tabKey === 'active' ? 'active' : ''}
                onClick={() => setTabKey('active')}
              >
                Đang trao đổi <i>3</i>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tabKey === 'archived'}
                className={tabKey === 'archived' ? 'active' : ''}
                onClick={() => setTabKey('archived')}
              >
                Lưu trữ <i>({ARCHIVED_LABEL_COUNT})</i>
              </button>
            </div>

            <label className="rw-msg-search">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                placeholder="Lọc tin nhắn..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Lọc tin nhắn"
              />
            </label>

            <div className="rw-msg-threads">
              {visibleThreads.length === 0 && (
                <p className="rw-msg-empty">Không tìm thấy hội thoại phù hợp.</p>
              )}
              {visibleThreads.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rw-msg-thread${item.id === thread.id ? ' active' : ''}`}
                  aria-current={item.id === thread.id ? 'true' : undefined}
                  onClick={() => setActiveThreadId(item.id)}
                >
                  <span className="rw-msg-thread-avatar">
                    <img src={buyerAvatar} alt="" />
                  </span>
                  <span className="rw-msg-thread-body">
                    <span className="rw-msg-thread-top">
                      <b>{item.sellerHandle}</b>
                      <small>{item.time}</small>
                    </span>
                    <span className="rw-msg-thread-title">{item.productSummary}</span>
                    <span className="rw-msg-thread-preview">{item.preview}</span>
                    <span className="rw-msg-thread-tags">
                      <span className="rw-msg-thread-tag-left">
                        {item.aiTag && <i className="rw-msg-tag ai">{item.aiTag}</i>}
                        {item.statusLabel && item.status !== 'seen' && (
                          <i className={`rw-msg-tag status ${item.status}`}>
                            {item.statusLabel}
                          </i>
                        )}
                      </span>
                      <span className="rw-msg-thread-marker">
                        {item.unread ? (
                          <i className="rw-msg-unread" aria-label="Có tin nhắn chưa đọc" />
                        ) : item.status === 'seen' ? (
                          <span className="rw-msg-thread-read">{item.statusLabel}</span>
                        ) : item.status === 'done' ? (
                          <CheckCheck size={13} aria-hidden="true" />
                        ) : null}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="rw-msg-escrow-card">
              <b>
                <span className="rw-msg-escrow-icon"><ShieldCheck size={15} aria-hidden="true" /></span>
                Ký quỹ Escrow an toàn
              </b>
              <p>Tiền chỉ hoàn khi bạn kiểm tra hàng.</p>
            </div>
          </aside>

          {/* ── Cột 2: khung hội thoại ── */}
          <section className="rw-msg-chat" aria-label={`Hội thoại với ${thread.sellerHandle}`}>
            <header className="rw-msg-chat-head">
              <span className="rw-msg-chat-avatar"><img src={buyerAvatar} alt="" /></span>
              <div className="rw-msg-chat-who">
                <b>{thread.sellerHandle}</b>
                <span>
                  <i className={`rw-msg-online${thread.online ? '' : ' off'}`} aria-hidden="true" />
                  {thread.online ? 'Online' : 'Offline'} • {thread.responseNote}
                </span>
              </div>
              <div className="rw-msg-chat-tools">
                <button
                  type="button"
                  aria-label="Đánh dấu hội thoại"
                  onClick={() => setToast('Đã đánh dấu hội thoại quan trọng.')}
                >
                  <Bookmark size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Tuỳ chọn hội thoại"
                  onClick={() => setToast('Tuỳ chọn hội thoại đang được cập nhật.')}
                >
                  <MoreHorizontal size={17} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="rw-msg-product-strip">
              <img src={productImage} alt={product.title} />
              <div className="rw-msg-product-copy">
                <b>{product.title} - Size {product.size}</b>
                <span className="rw-msg-product-price">{formatPrice(product.price)} ₫</span>
                <span className="rw-msg-product-meta">
                  AI {product.aiScore}% | {product.conditionTag ?? product.condition}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.MARKETPLACE.ROOT}/product/${product.id}`)}
              >
                Chi tiết
              </button>
            </div>

            <p className="rw-msg-notice">
              <LockKeyhole size={13} aria-hidden="true" />
              Cuộc hội thoại được bảo vệ bởi ReWear AI. Vui lòng không giao dịch ngoài nền tảng để đảm
              bảo quyền lợi cho sản phẩm và ký quỹ Escrow 100%.
            </p>

            <div className="rw-msg-stream">
              {messages.map((message) =>
                message.author === 'system' ? (
                  <p key={message.id} className="rw-msg-system">{message.text}</p>
                ) : (
                  <div
                    key={message.id}
                    className={`rw-msg-bubble-row ${message.author === 'buyer' ? 'mine' : 'theirs'}`}
                  >
                    {message.author === 'seller' && (
                      <span className="rw-msg-bubble-avatar"><img src={buyerAvatar} alt="" /></span>
                    )}
                    <div className="rw-msg-bubble">
                      <p>{message.text}</p>
                      <time>
                        {message.time}
                        {message.author === 'buyer' && <CheckCheck size={12} aria-hidden="true" />}
                      </time>
                    </div>
                  </div>
                )
              )}
              <div ref={threadEndRef} />
            </div>

            <div className="rw-msg-quick">
              {QUICK_ACTIONS.map((action) => (
                <button key={action} type="button" onClick={() => sendMessage(action)}>
                  {action}
                </button>
              ))}
            </div>

            <form
              className="rw-msg-composer"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(draft);
              }}
            >
              <button
                type="button"
                aria-label="Đính kèm tệp"
                onClick={() => setToast('Đính kèm tệp sẽ hỗ trợ ở bản cập nhật tới.')}
              >
                <Paperclip size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Biểu tượng cảm xúc"
                onClick={() => setToast('Chọn biểu tượng cảm xúc.')}
              >
                <Smile size={16} aria-hidden="true" />
              </button>
              <input
                type="text"
                placeholder="Nhập tin nhắn trao đổi với người bán..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Nội dung tin nhắn"
              />
              <button type="submit" className="rw-msg-send">
                Gửi <Send size={13} aria-hidden="true" />
              </button>
            </form>
          </section>

          {/* ── Cột 3: ký quỹ + AI Assistant ── */}
          <aside className="rw-msg-side" aria-label="Ký quỹ và trợ lý AI">
            <div className="rw-msg-lock-bar">
              <b><i className="rw-msg-lock-dot" aria-hidden="true" /> SMART-ESCROW LOCK SẴN SÀNG</b>
              <span><ShieldCheck size={13} aria-hidden="true" /> Bảo mật cấp độ tài chính</span>
            </div>

            <div className="rw-msg-deal-panel">
            <div className="rw-msg-side-label">
              <span>SẢN PHẨM ĐANG ĐÀM PHÁN</span>
              <span className="rw-msg-sku">SKU #{product.sku ?? product.id}</span>
            </div>

            <div className="rw-msg-deal-card">
              <div className="rw-msg-deal-media">
                <img src={productImage} alt={product.title} />
                <i className="rw-msg-deal-pin">{DEAL_PIN_BADGE}</i>
              </div>
              <b>{product.title}</b>
              <span className="rw-msg-deal-color">Chicago Lost &amp; Found OG</span>
              <div className="rw-msg-deal-price">
                <strong>{formatPrice(product.price)} đ</strong>
                <del>{formatPrice(DEAL_LIST_PRICE)} đ</del>
              </div>
              <div className="rw-msg-deal-tags">
                <i><CircleCheck size={11} aria-hidden="true" /> AI Confidence {product.aiScore}%</i>
                <i>{product.conditionTag?.split('/')[0].trim() ?? product.condition}</i>
              </div>
            </div>

            <button
              type="button"
              className="rw-msg-buy"
              onClick={() => navigate(ROUTES.ESCROW.CHECKOUT)}
            >
              <LockKeyhole size={14} aria-hidden="true" />
              Đặt hàng ngay (Khóa sản phẩm 10 phút)
              <ChevronRight size={15} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="rw-msg-deal-link"
              onClick={() => navigate(`${ROUTES.MARKETPLACE.ROOT}/product/${product.id}`)}
            >
              <Eye size={15} aria-hidden="true" />
              Xem chi tiết bài đăng
            </button>

            <div className="rw-msg-meta-row">
              {ESCROW_META.map((item, index) => {
                const Icon = ESCROW_META_ICON[item.icon];
                return (
                  <React.Fragment key={item.key}>
                    {index > 0 && <i className="rw-msg-meta-dot" aria-hidden="true" />}
                    <span>
                      <Icon size={13} aria-hidden="true" />
                      {item.label}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
            </div>

            <section className="rw-msg-ai-card">
              <header>
                <span className="rw-msg-ai-icon"><Sparkles size={16} aria-hidden="true" /></span>
                <div>
                  <b>AI Product Assistant</b>
                  <small>Trợ lý dữ liệu sản phẩm khách quan</small>
                </div>
                <i className="rw-msg-live">Live AI</i>
              </header>

              <p className="rw-msg-ai-intro">{AI_ASSISTANT_INTRO}</p>

              <div className="rw-msg-ai-score">
                <div>
                  <small>CHỈ SỐ MÔ HỌC</small>
                  <strong>92.4%</strong>
                  <em>High Pass</em>
                  <span>Vận tốc 6 vùng quang học</span>
                </div>
                <span className="rw-msg-ai-score-ring" aria-hidden="true">
                  <Focus size={20} />
                </span>
              </div>

              <div className="rw-msg-ai-facts">
                {AI_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <span>{fact.label}</span>
                    <b className={fact.tone ? `tone-${fact.tone}` : ''}>{fact.value}</b>
                  </div>
                ))}
              </div>

              <div className="rw-msg-ai-links">
                <button
                  type="button"
                  onClick={() => setToast('Đang mở bộ bằng chứng thị giác.')}
                >
                  <ImageIcon size={13} aria-hidden="true" /> Bằng chứng thị giác
                </button>
                <i className="rw-msg-meta-dot" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setToast('Đã đối chiếu 6 vùng quang học.')}
                >
                  <Check size={13} aria-hidden="true" /> Đã đối chiếu 6 vùng quang học
                </button>
              </div>
            </section>

            <section className="rw-msg-ai-summary">
              <h2><Sparkles size={14} aria-hidden="true" /> Tổng hợp giám định tự động</h2>
              <p>
                Xin chào! Tôi là trợ lý kiểm định ReWear. Dựa trên hồ sơ kiểm định chuyên sâu và liệu chứng
                mô mỏ.
              </p>
              <div className="rw-msg-ai-highlights">
                {AI_SUMMARY_POINTS.map((point) => (
                  <p key={point.title}>
                    <b>{point.title}</b> {point.text}
                  </p>
                ))}
              </div>
              <p>
                Bạn có thể nhấn <b>“Đặt hàng ngay”</b> để tạm giữ sản phẩm độc quyền trong 10 phút trước khi
                chuyển khoản qua Escrow.
              </p>
              <p className="rw-msg-ai-footnote">
                <Info size={12} aria-hidden="true" />
                Trợ lý AI chỉ triển khai xuất thông tin khách quan từ hồ sơ dữ liệu tin đăng và kết quả
                thẩm định máy học.
              </p>
            </section>
          </aside>
        </div>
      </main>

      <MarketplaceFooter />

      {toast && <div className="rw-mkt-toast" role="status">{toast}</div>}
    </div>
  );
};

export default BuyerMessagesPage;



