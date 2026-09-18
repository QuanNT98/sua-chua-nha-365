# Gửi demo cho khách

**Link Expo Go (iOS + Android):**

```
exp://u.expo.dev/e13e3f5c-5b81-48d9-b45a-b2903b58eb71?channel-name=preview&runtime-version=exposdk:57.0.0
```

QR: `demo/expo-go-qr.png`

## Hướng dẫn cho khách
1. Cài **Expo Go** (App Store / CH Play).
2. iPhone: mở Camera quét QR → bấm banner "Mở trong Expo Go". Android: mở Expo Go → *Scan QR code*.
3. Đăng nhập bằng SĐT bất kỳ, OTP nhập 6 số bất kỳ.

## Cập nhật / thu hồi
- Đẩy bản mới (khách mở lại là thấy):  `eas update --branch preview --environment preview -m "..."`
- Hạn dùng: sửa `DEMO_EXPIRES` trong `src/components/demo-gate.tsx` rồi publish lại (hiện tại: 18/10/2026).
- Thu hồi ngay: đặt `DEMO_EXPIRES` về quá khứ và publish, hoặc `eas update:republish` một bản cũ / `eas branch:delete preview`.
- Dashboard: https://expo.dev/accounts/quannguyen98/projects/tho-viet-demo
