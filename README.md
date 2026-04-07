# Send A Letter

Ứng dụng web nhỏ để:
- gửi lời nhắn hoặc thử thách cho bạn bè
- nhận và quản lý các lời nhắn/thử thách
- ghim thử thách đã chấp nhận để theo dõi

## Cấu trúc hiện tại

Project đã được chuẩn hóa theo kiểu static site để có thể deploy trực tiếp lên Vercel:

```text
/
  index.html
  friends.html
  styles.css
  js/
    app.js
    elements.js
    firebase.js
    friend-form.js
    main.js
    render.js
  image/
    ngoc.jpeg
```

Ngoài ra vẫn còn:
- `public/`
- `src/`

Hai thư mục này là bản nguồn cũ để tham chiếu trong quá trình chỉnh sửa. Khi deploy, dùng bản ở root là đủ.

## Chức năng chính

### Trang chính
- `index.html`
- Quản lý hồ sơ hiện tại
- Xem hộp thư của tôi
- Chấp nhận, ghim, bỏ ghim, xóa thử thách
- Sinh link `friends.html?to=<ten>` để gửi cho bạn bè

### Trang bạn bè
- `friends.html`
- Giao diện dạng nhiều tờ note
- Có form riêng cho:
  - lời nhắn
  - thử thách
- Có nút `+` để thêm tờ note mới
- Có nút xóa từng tờ note
- Có thể để trống tên người gửi, hệ thống sẽ lưu là `Ẩn danh`
- Popup cảm ơn tự tắt sau 3 giây

## Firebase / Firestore

Dữ liệu đang được lưu trên Firestore trong collection:

```text
notes
```

Cấu hình Firebase nằm trong:

- [js/firebase.js](/Users/doanmanh/Documents/Học_tập/SendALetter/js/firebase.js)

Mỗi document ghi chú có dạng gần đúng:

```json
{
  "sender": "Minh",
  "recipient": "Linh",
  "type": "note",
  "title": "Một lời nhắn",
  "content": "Cố lên nhé",
  "status": "pending",
  "pinned": false,
  "createdAt": "Firestore Timestamp"
}
```

### Firestore rules demo

Nếu đang test nhanh, có thể dùng rules tạm thời:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if true;
    }
  }
}
```

Không nên dùng rule này cho production.

## Chạy local

Vì đây là static site có dùng ES modules, nên nên chạy bằng local server thay vì mở file trực tiếp.

Ví dụ:

```bash
npx serve .
```

hoặc:

```bash
python3 -m http.server 3000
```

Sau đó mở:

```text
http://localhost:3000
```

## Deploy Vercel

Có thể deploy trực tiếp từ root project hiện tại.

### Cách đơn giản
1. Push repo lên GitHub
2. Import project vào Vercel
3. Deploy với root mặc định của repo

Không cần build step nếu bạn chỉ dùng static files hiện tại.

## Link gửi cho bạn bè

Trang chính tự sinh link kiểu:

```text
friends.html?to=Linh
```

Có thể thêm ảnh header cho trang bạn bè bằng query:

```text
friends.html?to=Linh&img=https://example.com/image.jpg
```

## Ghi chú

- `profileName` được lưu local trên trình duyệt
- dữ liệu note/thử thách được lưu trên Firestore
- nếu Firebase hoặc Firestore rules sai, app sẽ báo lỗi khi gửi/đọc dữ liệu
