# Study Planner Mobile

Expo SDK 58 / React Native app cho Study Planner.

## Chạy

```bash
npm install
npx expo start
```

Copy `.env.example` thành `.env` và đặt `EXPO_PUBLIC_API_URL` tới backend. Khi chạy Expo Go trên thiết bị thật, có thể để `localhost` trong `.env`: ứng dụng sẽ tự thay `localhost` bằng IP LAN của máy đang chạy Expo. Nếu bạn muốn cố định URL, hãy đặt IP LAN của máy chạy backend.

## Auth

Màn hình `/login` và `/register` gọi API thật (`/api/auth/login`, `/api/auth/register`) và lưu JWT bằng Expo SecureStore. Các route `/tabs/*` được bảo vệ bằng Expo Router protected routes.

## Data

Home, Calendar, Assignments và Courses không còn dùng số liệu mẫu. Tất cả dữ liệu đọc từ API; khi database không có bản ghi tương ứng, màn hình hiển thị trạng thái rỗng.

## Study Planner implementation notes

Implemented against the supplied reference UI and functional requirements:

- 5-tab navigation: Home, Courses, Assignments, Weekly Calendar, Profile.
- Remote API CRUD for courses and assignments.
- Course + status filtering on assignments.
- Assignment detail route and create/edit modal.
- Local deadline notifications with notification -> assignment detail navigation.
- Local persistent cache with offline banner and queued mutations for later sync.
- Optimistic completion updates with rollback on server errors; offline mutations are queued instead of being dropped.
- Image attachment picker stores selected local image URIs with assignment data.
- Light/dark theme persisted locally.
- A 48-hour upcoming-deadline summary is shown inside the app. Native home-screen widgets require native widget extensions/development builds and are intentionally not claimed as implemented in Expo Go.

For SDK 58, install the added packages with:

`npx expo install expo-notifications expo-image-picker @react-native-async-storage/async-storage @react-native-community/netinfo`

Use `npm install` (not `npm ci`) after pulling these changes so npm can refresh the lockfile if needed.
