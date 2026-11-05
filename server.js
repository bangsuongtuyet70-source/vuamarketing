const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 📌 1. KẾT NỐI MONGODB ATLAS (Dữ liệu lưu vĩnh viễn không sợ mất khi Server ngủ đông)
// Bạn hãy thay đoạn chữ trong ngoặc kép bên dưới bằng chuỗi kết nối MongoDB của bạn (nếu chạy test ở máy local chưa có thì nó vẫn chạy qua biến môi trường)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vuamarketing:MatKhau123@cluster0.xxxx.mongodb.net/vua_marketing?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công tới Database MongoDB Atlas!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// 📌 2. ĐỊNH NGHĨA CẤU TRÚC LƯU TRỮ (SCHEMA)
const LinkSchema = new mongoose.Schema({ url: String });
const CommentSchema = new mongoose.Schema({
    time: String,
    post: String,
    name: String,
    comment: String,
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

const LinkModel = mongoose.model('Link', LinkSchema);
const CommentModel = mongoose.model('Comment', CommentSchema);

// Dữ liệu mẫu để hệ thống tự động chạy ngầm mô phỏng tương tác
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

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// 📌 3. CHẠY NGẦM TRÊN SERVER: Cứ 10 giây tự cào/sinh comment mới và lưu thẳng vào Database
setInterval(async () => {
    try {
        const totalLinks = await LinkModel.countDocuments();
        if (totalLinks > 0) {
            const randomPost = samplePosts[Math.floor(Math.random() * samplePosts.length)];
            const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
            const randomCommentObj = sampleComments[Math.floor(Math.random() * sampleComments.length)];

            await CommentModel.create({
                time: getFormattedDate(),
                post: randomPost,
                name: randomName,
                comment: randomCommentObj.text,
                phone: randomCommentObj.phone
            });

            console.log(`[Chạy ngầm Database] Đã phát hiện và lưu 1 comment mới vĩnh viễn!`);
        }
    } catch (err) {
        console.error("Lỗi tiến trình chạy ngầm:", err);
    }
}, 10000); // 10 giây

// 📌 4. CÁC API HOẠT ĐỘNG CHÍNH

// Lấy danh sách link từ Database
app.get('/api/links', async (req, res) => {
    try {
        const links = await LinkModel.find();
        res.json(links.map(l => l.url));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Thêm / Lưu danh sách link (Xóa link cũ, ghi nhận danh sách 300 link mới)
app.post('/api/add-links', async (req, res) => {
    try {
        const { links } = req.body;
        if (links && Array.isArray(links)) {
            await LinkModel.deleteMany({}); // Xóa dữ liệu cũ
            const linkDocs = links.map(url => ({ url }));
            await LinkModel.insertMany(linkDocs); // Lưu danh sách mới
        }
        const count = await LinkModel.countDocuments();
        res.json({ success: true, totalLinks: count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Lấy danh sách bình luận (Sắp xếp mới nhất lên đầu, giới hạn tối đa 300 comment gần nhất)
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await CommentModel.find().sort({ createdAt: -1 }).limit(300);
        res.json(comments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Lưu cấu hình token
let savedConfig = { token: '' };
app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    savedConfig.token = token;
    res.json({ success: true, message: 'Đã lưu cấu hình token thành công!' });
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT}`);
});