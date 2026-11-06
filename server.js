const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Đường dẫn file lưu dữ liệu trên server
const DATA_FILE = path.join(__dirname, 'database.json');

// Hàm đọc/ghi dữ liệu an toàn
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { links: [], comments: [] };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { links: [], comments: [] };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Lỗi ghi file dữ liệu:", err);
    }
}

// Dữ liệu mẫu tự động chạy ngầm
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

// 📌 Tiến trình chạy ngầm mỗi 10 giây sinh comment tự động
setInterval(() => {
    const db = readData();
    if (db.links && db.links.length > 0) {
        const randomPost = samplePosts[Math.floor(Math.random() * samplePosts.length)];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const randomCommentObj = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        const newComment = {
            time: getFormattedDate(),
            post: randomPost,
            name: randomName,
            comment: randomCommentObj.text,
            phone: randomCommentObj.phone,
            createdAt: new Date()
        };

        db.comments.unshift(newComment); // Thêm lên đầu
        if (db.comments.length > 300) db.comments.pop(); // Giới hạn 300 comment

        writeData(db);
        console.log(`[Chạy ngầm] Đã lưu 1 comment mới vào file!`);
    }
}, 10000);

// 📌 Các API chính
app.get('/api/links', (req, res) => {
    const db = readData();
    res.json(db.links || []);
});

app.post('/api/add-links', (req, res) => {
    const { links } = req.body;
    const db = readData();
    if (links && Array.isArray(links)) {
        db.links = links; // Cập nhật danh sách link mới
        writeData(db);
    }
    res.json({ success: true, totalLinks: db.links.length });
});

app.get('/api/comments', (req, res) => {
    const db = readData();
    res.json(db.comments || []);
});

let savedConfig = { token: '' };
app.post('/api/save-config', (req, res) => {
    const { token } = req.body;
    savedConfig.token = token;
    res.json({ success: true, message: 'Đã lưu cấu hình token thành công!' });
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT} (Sử dụng Local Storage)`);
});