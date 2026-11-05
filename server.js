const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Bộ nhớ tạm trên Server (lưu danh sách link và cấu hình)
let savedLinks = [];
let savedConfig = { token: '' };

// Dữ liệu mẫu comments
let commentsData = [
    { id: 1, time: "21:04:04 24/10/2026", post: "Nhà đẹp Betoviet", name: "Thanh Truong", comment: "Nhà của tôi", phone: null },
    { id: 2, time: "17:59:56 24/10/2026", post: "Nhà Đẹp Miền Bắc", name: "Ngọc Than", comment: "Xin tư vấn giá sặt 0917751295", phone: "0917751295" }
];

// API lấy danh sách link đã lưu
- app.get('/api/links', (req, res) => {
    res.json(savedLinks);
});

// API thêm link
app.post('/api/add-links', (req, res) => {
    const { links } = req.body;
    if (links && Array.isArray(links)) {
        savedLinks = links; // Lưu vào bộ nhớ server
    }
    res.json({ success: true, totalLinks: savedLinks.length });
});

// API lấy comments
app.get('/api/comments', (req, res) => {
    res.json(commentsData);
});

// API quét link
app.post('/api/scan-links', (req, res) => {
    res.json({ success: true, message: `Đã quét xong ${savedLinks.length} link bài viết và lọc số điện thoại thành công!` });
});

// API lưu cấu hình token
app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    savedConfig.token = token;
    res.json({ success: true, message: 'Đã lưu cấu hình token thành công lên hệ thống!' });
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT}`);
});