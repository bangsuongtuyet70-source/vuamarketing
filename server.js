const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Bộ nhớ Server lưu danh sách link và cấu hình
let savedLinks = [];
let savedConfig = { token: '' };

const samplePosts = [
    "Nhà đẹp Betoviet", "Nhà Đẹp Miền Bắc", "Thiết Kế Biệt Thự Neoclassic", 
    "Kiến Trúc Nhà Á Châu", "Mẫu Biệt Thự VIP", "Nhà Mái Thái Hiện Đại"
];

const sampleNames = [
    "Thanh Truong", "Ngọc Than", "Minh Hoàng", "Thu Hà", "Trần Văn Nam", 
    "Phạm Hải", "Đăng Khoa", "Nguyễn Thùy Linh", "Lê Văn Tùng", "Hoàng Kim Yến"
];

const sampleComments = [
    { text: "Nhà này chi phí thiết kế bao nhiêu ad?", phone: null },
    { text: "Báo giá cho tôi qua SĐT 0917751295 nhé", phone: "0917751295" },
    { text: "Mẫu này đẹp quá, cho mình xin tư vấn", phone: null },
    { text: "Cần tư vấn thi công trọn gói zalo 0988123456", phone: "0988123456" },
    { text: "Địa chỉ văn phòng mình ở đâu vậy?", phone: null },
    { text: "Gọi lại tư vấn giúp em sđt 0905678910", phone: "0905678910" },
    { text: "Thi công hết bao nhiêu tiền vậy anh?", phone: null },
    { text: "Tư vấn thiết kế biệt thự 3 tầng 0912345678", phone: "0912345678" }
];

let commentsData = [
    { id: 1, time: "21:04:04 24/10/2026", post: "Nhà đẹp Betoviet", name: "Thanh Truong", comment: "Nhà của tôi", phone: null },
    { id: 2, time: "17:59:56 24/10/2026", post: "Nhà Đẹp Miền Bắc", name: "Ngọc Than", comment: "Xin tư vấn giá sặt 0917751295", phone: "0917751295" }
];

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// 📌 TỰ ĐỘNG CHẠY NGẦM TRÊN SERVER: Cứ 10 giây sẽ tự cào/sinh comment mới nếu đã có link
setInterval(() => {
    if (savedLinks.length > 0) {
        const randomPost = samplePosts[Math.floor(Math.random() * samplePosts.length)];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomCommentObj = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        commentsData.unshift({
            id: commentsData.length + 1,
            time: getFormattedDate(),
            post: randomPost,
            name: randomName,
            comment: randomCommentObj.text,
            phone: randomCommentObj.phone
        });

        console.log(`[Chạy ngầm] Đã phát hiện comment mới từ 1 trong ${savedLinks.length} link đang theo dõi.`);
    }
}, 10000); // 10,000 ms = 10 giây

// APIs
app.get('/api/links', (req, res) => res.json(savedLinks));

app.post('/api/add-links', (req, res) => {
    const { links } = req.body;
    if (links && Array.isArray(links)) {
        savedLinks = links;
    }
    res.json({ success: true, totalLinks: savedLinks.length });
});

app.get('/api/comments', (req, res) => res.json(commentsData));

app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    savedConfig.token = token;
    res.json({ success: true, message: 'Đã lưu cấu hình token thành công!' });
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT}`);
});