# Thrift It! — Mobile App (V1)

Expo + React Native + TypeScript mobile app kết nối với backend Express đã deploy tại `https://thriftit-backend.onrender.com`.

## Quick start

```bash
# Install dependencies
npm install

# Run on Android (cần Android Studio + emulator hoặc thiết bị thật qua Expo Go)
npm run android

# Type check
npm run typecheck
```

## Tech stack

- Expo SDK 51 + React Native 0.74
- TypeScript strict
- React Navigation 6 (Native Stack + Bottom Tabs)
- AsyncStorage cho JWT session
- lucide-react-native cho icons
- expo-image cho cached images

## Cấu trúc

```
src/
├── api/         # fetch wrapper + ApiError
├── adapters/    # API → UI model
├── navigation/  # Root/MainTab/Auth navigators
├── screens/     # Tất cả screens (auth, home, cart, ...)
├── components/  # Reusable UI components
├── context/     # AuthContext, CartContext
├── theme/       # Colors, typography, spacing
├── hooks/       # Custom hooks
├── types/       # TypeScript types
└── utils/       # storage.ts, format.ts
```

## Test accounts

| Role  | Email                       | Password |
|-------|-----------------------------|----------|
| Buyer | linh.nguyen@gmail.com       | 123456   |
| Seller| shop.minhtu@thriftit.vn     | shop123  |
| Admin | admin@thriftit.vn           | admin    |

## Build & Deploy

```bash
# Cài eas-cli (chỉ 1 lần)
npm install -g eas-cli

# Login Expo
eas login

# Build APK (internal testing)
eas build --platform android --profile preview

# Build AAB (production cho Google Play)
eas build --platform android --profile production
```

Xem `docs/API_CONTRACT.md` và `docs/API_MATRIX.md` trong root project để biết thông tin API.