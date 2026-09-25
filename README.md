# ReWear-AI-FA26SE262
ReWear AI (FA26SE262) là nền tảng mua bán thời trang secondhand uy tín tại Việt Nam. Hệ thống tích hợp AI Computer Vision để tự động thẩm định hàng thật/giả và chấm điểm tình trạng sản phẩm qua ảnh chụp hướng dẫn. Kết hợp thanh toán ký quỹ VietQR Escrow và quy trình phân xử tranh chấp minh bạch, bảo vệ tối đa người mua và người bán.
Quy ước Git (cả team tuân theo)
Nhánh (Branch)
main — Code sản phẩm ổn định, sẵn sàng deploy/demo. Tuyệt đối không commit trực tiếp.
dev — Nhánh tích hợp chung. Mọi tính năng sau khi hoàn thành phải tạo Pull Request (PR) về đây.
Nhánh làm việc cá nhân đặt theo dạng <loại>/<mô-tả-ngắn> (viết chữ thường, phân cách bằng dấu -):
Tiền tố	Dùng khi	Ví dụ
feature/	Phát triển tính năng/giao diện mới	feature/guided-camera, feature/vietqr-escrow
fix/	Sửa lỗi giao diện hoặc logic	fix/token-refresh-401, fix/dispute-upload-modal
refactor/	Dọn dẹp code, tối ưu component	refactor/axios-client, refactor/auth-slice
chore/	Cấu hình dự án, cài package, env	chore/setup-tailwind, chore/eslint-config
docs/	Viết tài liệu, cập nhật README	docs/update-readme
📌 Lưu ý: Xác định thành viên qua git log (Author Email), không nhét tên người vào tên nhánh.
