/**
 * Lấy thông báo lỗi thật từ backend.
 *
 * `axiosClient` reject bằng `AxiosError`, nên `err.message` chỉ là câu chung
 * chung kiểu "Request failed with status code 500" — vô dụng với người bán.
 * Backend trả `{ success: false, error: { code, message } }` (xem
 * `GlobalExceptionHandlerMiddleware`), nên ưu tiên đọc message ở đó.
 */
export const readApiErrorMessage = (err: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string => {
  const axiosError = err as {
    response?: { status?: number; data?: { error?: { message?: string } } };
  };

  const apiMessage = axiosError?.response?.data?.error?.message;
  if (apiMessage) return apiMessage;

  /*
   * 401 không có body lỗi có ích, nên `err.message` rơi về câu tiếng Anh của
   * axios ("Request failed with status code 401") — người bán đọc không hiểu
   * phải làm gì. Thay bằng hướng dẫn cụ thể.
   */
  if (axiosError?.response?.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi xác thực AI.';
  }

  // `Network Error` của axios nghĩa là không gọi được server (backend chưa chạy
  // hoặc sai cổng) — nói rõ để seller biết đó không phải lỗi dữ liệu của họ.
  if (err instanceof Error && /network error/i.test(err.message)) {
    return 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy ở cổng 7289 chưa.';
  }

  if (err instanceof Error && err.message) return err.message;

  return fallback;
};

/**
 * Gộp nhiều lỗi của các endpoint chạy song song thành MỘT câu.
 *
 * Bước 04 gọi 3 endpoint cùng lúc; khi token hết hạn cả 3 đều 401 và câu thô
 * hiện thành "…401 • Network Error • Network Error" — lặp lại vô nghĩa, seller
 * đọc rối. Chỉ giữ lỗi khác nhau và đánh số thứ tự.
 */
export const summarizeFailures = (messages: string[]): string | null => {
  const unique = Array.from(new Set(messages.filter(Boolean)));
  if (unique.length === 0) return null;
  if (unique.length === 1) return unique[0];
  return unique.map((m, i) => `${i + 1}. ${m}`).join(' ');
};

export const isTokenQuotaError = (err: unknown): boolean => {
  const axiosError = err as {
    response?: { data?: { error?: { code?: string; message?: string } } };
  };
  const code = axiosError?.response?.data?.error?.code ?? '';
  const message = axiosError?.response?.data?.error?.message ?? '';
  const quotaTerms =
    /quota|insufficient|not enough|exhaust|exceed|run out|depleted|(?:không đủ|hết|cạn|số dư)/i;

  return (
    (/(?:token|quota)/i.test(code) && quotaTerms.test(code)) ||
    (/token|quota/i.test(message) && quotaTerms.test(message))
  );
};

export default readApiErrorMessage;
