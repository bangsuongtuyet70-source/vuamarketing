const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Chuỗi kết nối chuẩn của bạn
const MONGO_URI = "mongodb+srv://bangsuongtuyet70_db_user:Abc123456@cluster0.et2wb6o.mongodb.net/vua_marketing?retryWrites=true&w=majority";

let isConnected = false;

// Kết nối MongoDB với cờ kiểm soát an toàn
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
})
.then(() => {
    isConnected = true;
    console.log('✅ Đã kết nối thành công tới Database MongoDB Atlas!');
})
.catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
});

// Định nghĩa Schema
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

// Chạy ngầm an toàn: Chỉ chạy khi biến isConnected = true
setInterval(async () => {
    if (!isConnected) return; // Chưa kết nối thì bỏ qua, không gây lỗi timeout
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
}, 10000);

// Các API chính
app.get('/api/links', async (req, res) => {
    try {
        const links = await LinkModel.find();
        res.json(links.map(l => l.url));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/add-links', async (req, res) => {
    try {
        const { links } = req.body;
        if (links && Array.isArray(links)) {
            await LinkModel.deleteMany({});
            const linkDocs = links.map(url => ({ url }));
            await LinkModel.insertMany(linkDocs);
        }
        const count = await LinkModel.countDocuments();
        res.json({ success: true, totalLinks: count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/comments', async (req, res) => {
    try {
        const comments = await CommentModel.find().sort({ createdAt: -1 }).limit(300);
        res.json(comments);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

let savedConfig = { token: '' };
app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    savedConfig.token = token;
    res.json({ success: true, message: 'Đã lưu cấu hình token thành công!' });
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT}`);
});