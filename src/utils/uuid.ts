/**
 * Sinh GUID (UUID v4) chuẩn 8-4-4-4-12.
 *
 * Backend khai báo tham số `userId` kiểu `string($guid)`, nên giá trị gửi lên
 * BẮT BUỘC phải là GUID hợp lệ — chuỗi tự do kiểu `mock-user-1758234...` sẽ bị
 * .NET từ chối khi bind tham số.
 */

/** 8-4-4-4-12, chấp nhận cả dạng có ngoặc nhọn `{...}` mà .NET hay trả về. */
const GUID_PATTERN =
  /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;

/** Kiểm tra chuỗi có phải GUID hợp lệ hay không. */
export const isGuid = (value: unknown): value is string =>
  typeof value === 'string' && GUID_PATTERN.test(value.trim());

/**
 * Chuẩn hoá GUID về dạng lowercase, bỏ ngoặc nhọn và khoảng trắng thừa.
 * Trả về `null` nếu không phải GUID hợp lệ.
 */
export const normalizeGuid = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim().replace(/^\{|\}$/g, '').toLowerCase();

  return GUID_PATTERN.test(trimmed) ? trimmed : null;
};

/**
 * Sinh một GUID v4 mới.
 *
 * Ưu tiên `crypto.randomUUID()` (có sẵn trên localhost/HTTPS). Trường hợp trình
 * duyệt cũ hoặc chạy ngoài secure context thì rơi về `crypto.getRandomValues()`,
 * và cuối cùng mới dùng `Math.random()` để vẫn luôn có kết quả hợp lệ.
 */
export const createUuid = (): string => {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  // Ép version 4 (bit cao của byte 6) và variant RFC 4122 (byte 8).
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
};