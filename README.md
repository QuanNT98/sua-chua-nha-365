# Thợ Việt – Demo UI/UX (React Native / Expo)

Bản clone giao diện app **Thợ Việt – Đặt Thợ Nhanh** (bám sát app gốc trên App Store,
xem ảnh tham chiếu trong `reference/`). Không có backend: toàn bộ dữ liệu là mock trong `src/data`.

## Chạy

```bash
npm install
npx expo start
```

- Nhấn `i` để mở iOS Simulator, `a` cho Android.
- Hoặc quét QR bằng app **Expo Go** trên điện thoại thật (cùng Wi-Fi).

## Kịch bản demo

1. **Đăng nhập** SĐT → nhập 6 số OTP bất kỳ
2. **Trang chủ**: chào + điểm thưởng, ô tìm kiếm, lưới 12 dịch vụ, bản đồ khu vực làm việc, tin tức
3. Bấm **Bảng giá** → tab nhóm dịch vụ, giá tham khảo màu xanh, ghi chú
4. Bấm **Điện lạnh** (hoặc tab Dịch vụ) → danh sách 443 dịch vụ, tìm kiếm không dấu
5. Chọn 1 dịch vụ → **Đặt lịch nhanh chóng** (form giống app gốc) → *Đặt lịch ngay*
6. **Thành công** → *Xem lịch hẹn* → tiến trình Đã đặt → Đã xác nhận (tự chuyển sau 6s) → Đã làm
7. Tab **Lịch sử** → *Đã đặt* / *Đã làm* với badge **Còn/Hết bảo hành**
8. Tài khoản → **Chương trình thành viên** (Vàng → Kim Cương), Tin tức

Hỗ trợ **dark mode** theo hệ thống.

## Cấu trúc

```
src/
├── app/                # màn hình (expo-router)
│   ├── (tabs)/         # Trang chủ · Dịch vụ · Lịch sử · Tài khoản
│   ├── pricing/[id]    # Bảng giá theo nhóm
│   ├── booking/        # Đặt lịch, thành công
│   ├── order/[id]      # Chi tiết lịch hẹn / bảo hành
│   ├── member, news, login
├── components/         # ui.tsx (Text, Button, Header…), cards.tsx (CategoryTile, PriceRow, OrderCard, WorkAreaMap)
├── data/               # mock: danh mục, 60+ dịch vụ, bảng giá, tin tức, thành viên
├── store/              # zustand: auth, form đặt lịch, lịch sử đơn
└── theme/              # màu vàng Thợ Việt, font Quicksand, spacing
reference/              # 6 screenshot gốc từ App Store để đối chiếu
```
