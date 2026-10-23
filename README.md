# Study Planner Backend

REST API cho ứng dụng Study Planner dùng Node.js, Express 5, TypeScript, MongoDB/Mongoose và Zod.

## 1. Yêu cầu

- Node.js 20+
- npm
- MongoDB local hoặc MongoDB Atlas

## 2. Cài đặt và chạy

```bash
npm install
```

Tạo file `.env` từ `.env.example`, rồi sửa `MONGODB_URI` và `JWT_SECRET`.

```bash
npm run dev
```

Mặc định API chạy tại `http://localhost:4000`. Kiểm tra `GET /api/health`.

Kiểm tra TypeScript:

```bash
npm run typecheck
npm run build
```

## 3. Cấu trúc thư mục

```text
src/
  app.ts
  server.ts
  config/db.ts
  controllers/
  middleware/
  models/
  routes/
  services/
  types/
  utils/
  validators/
```

Luồng request: `route -> middleware/validator -> controller -> service -> model -> MongoDB`.

## 4. API endpoints

Tất cả endpoint bên dưới có tiền tố `/api`.

### Auth

| Method | Path | Auth | Mục đích |
|---|---|---|---|
| POST | `/auth/register` | Không | Tạo tài khoản |
| POST | `/auth/login` | Không | Đăng nhập, nhận JWT |
| GET | `/auth/me` | Có | Thông tin tài khoản hiện tại |
| POST | `/auth/logout` | Có | Endpoint logout; mobile phải xóa token cục bộ |

### Courses

| Method | Path | Auth | Mục đích |
|---|---|---|---|
| GET | `/courses` | Có | Danh sách học phần |
| POST | `/courses` | Có | Tạo học phần |
| GET | `/courses/:courseId` | Có | Chi tiết học phần |
| PATCH | `/courses/:courseId` | Có | Cập nhật học phần |
| DELETE | `/courses/:courseId` | Có | Xóa học phần và các bài tập thuộc học phần |

### Assignments

| Method | Path | Auth | Mục đích |
|---|---|---|---|
| GET | `/assignments` | Có | Danh sách + lọc + phân trang |
| POST | `/assignments` | Có | Tạo bài tập |
| GET | `/assignments/:assignmentId` | Có | Chi tiết bài tập |
| PATCH | `/assignments/:assignmentId` | Có | Cập nhật bài tập |
| DELETE | `/assignments/:assignmentId` | Có | Xóa bài tập |
| GET | `/assignments/progress` | Có | Thống kê theo học phần |

Query hỗ trợ cho `GET /assignments`:
- `courseId`: lọc theo học phần
- `status`: `pending` hoặc `completed`
- `from`, `to`: lọc `dueAt` theo khoảng thời gian ISO-8601
- `page`, `limit`: phân trang

Ví dụ: `/api/assignments?status=pending&from=2026-10-01T00:00:00.000Z&to=2026-11-01T00:00:00.000Z&page=1&limit=20`

## 5. Ví dụ request

Đăng ký:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "StrongPassword123"
}
```

Tạo học phần (gửi `Authorization: Bearer <token>`):

```json
{
  "code": "MOB101",
  "name": "Lap trinh Mobile",
  "color": "#4F46E5"
}
```

Tạo bài tập:

```json
{
  "courseId": "REPLACE_WITH_COURSE_OBJECT_ID",
  "title": "Study Planner",
  "dueAt": "2026-10-28T09:00:00.000Z",
  "status": "pending",
  "notes": "Hoan thanh man hinh lich tuan",
  "attachments": []
}
```

## 6. Quy tắc thiết kế

- User chỉ truy cập Course thuộc `userId` của mình.
- User chỉ thao tác Assignment nếu Course cha thuộc về user đó.
- `dueAt` được truyền dạng ISO-8601 và lưu dưới dạng BSON Date.
- Tiến độ được aggregate từ Assignments, không lưu phần trăm cố định.
- `attachments[].uri` chỉ là URI/đường dẫn. Backend hiện chưa upload file; cần bổ sung storage service nếu muốn ảnh truy cập được trên nhiều thiết bị.
- JWT API này là stateless. `/auth/logout` xác nhận thao tác nhưng không thu hồi token đã phát hành ở server. Ứng dụng Expo phải xóa token trong SecureStore khi logout. Nếu cần thu hồi token ngay lập tức, cần bổ sung refresh token/session store hoặc token denylist.
- Offline cache và local notifications thuộc phía Expo app; backend này chưa tự tạo local notification trên điện thoại.
- Đảm bảo dùng HTTPS khi deploy và đặt `JWT_SECRET` an toàn.

## 7. Automated tests

`npm test` chạy unit test cho logic thuần. Bộ test HTTP/database integration có thể bổ sung khi có môi trường MongoDB test; bài mobile yêu cầu component test và critical-path test cũng phải được triển khai ở repository Expo.
