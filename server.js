const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Cơ sở dữ liệu mẫu lưu bình luận và số điện thoại quét được
let commentsDatabase = [
    { id: 1, time: "21:04:04 24/10/2026", post: "Nhà đẹp Betoviet", name: "Thanh Truong", comment: "Nhà của tôi", phone: null },
    { id: 2, time: "17:59:56 24/10/2026", post: "Nhà Đẹp Miền Bắc", name: "Ngọc Than", comment: "Xin tư vấn giá sđt 0917751295", phone: "0917751295" }
];

let storedLinks = [];

// API nhận danh sách 300 link bài viết
app.post('/api/add-links', (req, res) => {
    const { links } = req.body;
    if (links && Array.isArray(links)) {
        storedLinks = [...new Set([...storedLinks, ...links])];
        console.log(`Đã cập nhật tổng số ${storedLinks.length} link trong hệ thống quét.`);
    }
    res.json({ success: true, totalLinks: storedLinks.length });
});

// API giả lập quét comment ẩn và lọc số điện thoại
app.post('/api/scan-links', (req, res) => {
    console.log(`Đang tiến hành quét tự động trên ${storedLinks.length} link bài viết...`);
    
    const simulatedNewComment = {
        id: commentsDatabase.length + 1,
        time: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
        post: "Bài viết chiến dịch Ads mới",
        name: "Khách Hàng Tiềm Năng",
        comment: "Cho mình xin báo giá chi tiết sđt 0988123456 nhé",
        phone: "0988123456"
    };

    const exists = commentsDatabase.some(c => c.phone === simulatedNewComment.phone);
    if (!exists) {
        commentsDatabase.unshift(simulatedNewComment);
    }

    res.json({
        success: true,
        message: `Quét thành công! Đã lọc và bắt được số điện thoại mới nhất.`,
        data: commentsDatabase
    });
});

// API trả danh sách comment ra giao diện
app.get('/api/comments', (req, res) => {
    res.json(commentsDatabase);
});

// API lưu cấu hình Token
app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    console.log("Đã cập nhật Token/Cookie Facebook:", token ? token.substring(0, 10) + "..." : "Trống");
    res.json({ success: true, message: "Đã lưu cấu hình Token thành công!" });
});

app.listen(3000, () => {
    console.log('Server Backend Vua Marketing đang chạy tại cổng 3000');
});