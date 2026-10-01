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
    response?: { data?: { error?: { message?: string } } };
  };

  const apiMessage = axiosError?.response?.data?.error?.message;
  if (apiMessage) return apiMessage;

  if (err instanceof Error && err.message) return err.message;

  return fallback;
};

export default readApiErrorMessage;
