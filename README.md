# ReWear AI (FA26SE262) 👕👟

**ReWear AI (FA26SE262)** là nền tảng mua bán thời trang secondhand uy tín tại Việt Nam. Hệ thống tích hợp **AI Computer Vision** để tự động thẩm định hàng thật/giả và chấm điểm tình trạng sản phẩm dựa trên ảnh chụp theo hướng dẫn. Kết hợp thanh toán ký quỹ **VietQR Escrow** và quy trình phân xử tranh chấp minh bạch, bảo vệ tối đa cho người mua và người bán.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### **Frontend**
- **Framework & Language:** React.js / Next.js (TypeScript)
- **Styling & UI Components:** Tailwind CSS, Lucide Icons, Shadcn UI
- **State Management:** Zustand / Redux Toolkit
- **HTTP Client:** Axios (Interceptors, Auto Token Refresh)
- **Realtime & Media:** WebSockets (In-App Chat & Live Notifications), HTML5 Canvas / MediaDevices API (Guided Camera)

### **Backend & AI Engine**
- **Core Backend:** Node.js (NestJS) / TypeScript
- **AI / Machine Learning Service:** Python (FastAPI, PyTorch, OpenCV)
- **Database:** PostgreSQL (Relational DB), Redis (Caching, Session & Token Storage)
- **ORM:** TypeORM / Prisma
- **Storage:** AWS S3 / Cloudinary (Image Storage)

### **Integrations & DevOps**
- **Payment Gateway:** VietQR Dynamic QR API & Escrow Webhook Handler
- **Containerization & CI/CD:** Docker, Docker Compose, GitHub Actions
- **API Documentation:** Swagger / OpenAPI 3.0

---

## 📌 Quy ước Git (Cả team tuân theo)

### **1. Nhánh (Branching Strategy)**
- `main` — Code sản phẩm ổn định, sẵn sàng deploy/demo. **Tuyệt đối không commit trực tiếp**.
- `dev` — Nhánh tích hợp chung. Mọi tính năng sau khi hoàn thành phải tạo **Pull Request (PR)** về đây.
- Nhánh làm việc cá nhân đặt theo dạng `<loại>/<mô-tả-ngắn>`:

| Tiền tố | Dùng khi | Ví dụ |
|---|---|---|
| `feature/` | Phát triển tính năng/giao diện mới | `feature/guided-camera`, `feature/vietqr-escrow` |
| `fix/` | Sửa lỗi giao diện hoặc logic | `fix/token-refresh-401`, `fix/dispute-upload-modal` |
| `refactor/` | Dọn dẹp code, tối ưu component | `refactor/axios-client`, `refactor/auth-slice` |
| `chore/` | Cấu hình dự án, cài package, env | `chore/setup-tailwind`, `chore/eslint-config` |
| `docs/` | Viết tài liệu, cập nhật README | `docs/update-readme` |

> 📌 **Lưu ý:** Xác định thành viên qua `git log` (Author Email), **không** nhét tên người vào tên nhánh.

### **2. Luồng làm việc (Workflow)**

1. **Cập nhật nhánh dev mới nhất:**
    ```bash
git checkout dev && git pull origin dev
```
- Tạo nhánh làm việc mới từ dev:
git checkout -b feature/ten-tinh-nang
- Code, test và commit:
- git add .
- git commit -m "feat(module): mô tả ngắn gọn thay đổi"
- Push nhánh lên GitHub và tạo Pull Request (PR) vào dev:
- git push -u origin feature/ten-tinh-nang




---
