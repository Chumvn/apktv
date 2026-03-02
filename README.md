# KHO APP CHUM

Kho ứng dụng Android TV — giao diện 10-foot UI thân thiện với điều khiển từ xa (D-pad).

## Tính năng

- Tải dữ liệu JSON động, tự động làm mới mỗi 60 giây
- Điều hướng D-pad (Arrow / Enter / Back) tối ưu cho Android TV
- Tìm kiếm tức thì theo tên, mô tả, danh mục, nhà phát triển
- Lọc theo danh mục qua tab
- Giao diện tối mặc định + chuyển sáng/tối (lưu localStorage)
- Sao chép link với Clipboard API
- Responsive: 5 / 4 / 3 / 2 / 1 cột tùy màn hình
- Roving tabindex, focus ring rõ ràng, không mất focus

## Triển khai

1. Push toàn bộ repo lên GitHub
2. Vào Settings → Pages → chọn branch `main` → Save
3. Truy cập `https://<username>.github.io/<repo>/`

## Cấu trúc

```
├── index.html
├── style.css
├── app.js
├── manifest.webmanifest
└── README.md
```

## Điều khiển (Remote / Bàn phím)

| Phím | Hành động |
|------|-----------|
| ←→↑↓ | Di chuyển focus |
| Enter | Mở link / Kích hoạt nút |
| Escape / Back | Đóng toast → Xóa tìm kiếm → Về đầu trang |
| PageUp / PageDown | Cuộn trang |
