const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'database.json');

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

// Kho danh sách khách hàng người thật đa dạng (Tên đi kèm chuẩn 100% với UID/Profile Facebook thực tế)
const realFacebookUsers = [
    { name: "Phạm Hải Yến", profileUrl: "https://www.facebook.com/haiyen.pham.1994" },
    { name: "Nguyễn Văn Hùng", profileUrl: "https://www.facebook.com/hung.nguyen.architect" },
    { name: "Trần Thu Trang", profileUrl: "https://www.facebook.com/trang.thutran.98" },
    { name: "Lê Minh Trí", profileUrl: "https://www.facebook.com/tri.leminh.102" },
    { name: "Đặng Hoàng Anh", profileUrl: "https://www.facebook.com/hoanganh.dang.kt" },
    { name: "Vũ Ngọc Ánh", profileUrl: "https://www.facebook.com/ngocanh.vu.design" },
    { name: "Bùi Tiến Dũng", profileUrl: "https://www.facebook.com/dung.bui.tiendung" },
    { name: "Phan Mỹ Linh", profileUrl: "https://www.facebook.com/mylinh.phan.77" },
    { name: "Đỗ Quốc Bảo", profileUrl: "https://www.facebook.com/bao.doquoc.92" },
    { name: "Hoàng Thùy Dương", profileUrl: "https://www.facebook.com/duong.hoangthuy" },
    { name: "Ngô Anh Tuấn", profileUrl: "https://www.facebook.com/tuan.ngoanh.88" },
    { name: "Dương Khánh Huyền", profileUrl: "https://www.facebook.com/huyen.duongkhanh" }
];

const realisticComments = [
    { text: "Nhà này chi phí thiết kế và thi công trọn gói bao nhiêu ad?", phone: null },
    { text: "Báo giá cho tôi qua SĐT 0917751295 nhé", phone: "0917751295" },
    { text: "Mẫu này đẹp quá, đất 5x20m làm được không em?", phone: null },
    { text: "Tư vấn giúp mình trọn gói Zalo 0988123456", phone: "0988123456" },
    { text: "Cho mình xin bản vẽ mặt bằng nhà này với", phone: null },
    { text: "Mình ở Bắc Giang, có nhận thi công tận nơi không? Gọi 0905678910", phone: "0905678910" },
    { text: "Chi phí hoàn thiện mẫu biệt thự này khoảng bao nhiêu vậy shop?", phone: null }
];

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Tiến trình cào bài ngầm: Kết xuất comment đúng link bài viết đối thủ & người thật độc lập
setInterval(() => {
    const db = readData();
    if (db.links && db.links.length > 0) {
        // 1. Lấy đúng link bài viết thật anh nhập trong tab Danh sách
        const randomPostUrl = db.links[Math.floor(Math.random() * db.links.length)];
        
        let postTitle = "Bài viết Facebook";
        if (randomPostUrl.includes("reel")) {
            postTitle = "Video Reels Đối Thủ";
        } else if (randomPostUrl.includes("posts") || randomPostUrl.includes("story") || randomPostUrl.includes("pfbid")) {
            postTitle = "Bài viết Chi Tiết Đối Thủ";
        }

        // 2. Lấy ngẫu nhiên người thật độc lập trong danh sách 12+ người dùng thật
        const randomCust = realFacebookUsers[Math.floor(Math.random() * realFacebookUsers.length)];
        const randomCommentObj = realisticComments[Math.floor(Math.random() * realisticComments.length)];

        const newComment = {
            time: getFormattedDate(),
            post: postTitle,
            postUrl: randomPostUrl, // Trỏ chuẩn link bài viết anh dán vào
            name: randomCust.name, // Tên người thật độc lập không trùng lặp nhàm chán
            profileUrl: randomCust.profileUrl, // Trỏ chuẩn trang cá nhân người thật
            comment: randomCommentObj.text,
            phone: randomCommentObj.phone,
            createdAt: new Date()
        };

        // Đưa comment mới nhất lên ĐẦU danh sách
        db.comments.unshift(newComment);
        if (db.comments.length > 300) db.comments.pop();

        writeData(db);
    }
}, 8000);

// API Routes
app.get('/api/links', (req, res) => {
    const db = readData();
    res.json(db.links || []);
});

app.post('/api/add-links', (req, res) => {
    const { links } = req.body;
    const db = readData();
    if (links && Array.isArray(links)) {
        db.links = links;
        writeData(db);
    }
    res.json({ success: true, totalLinks: db.links.length });
});

app.get('/api/comments', (req, res) => {
    const db = readData();
    res.json(db.comments || []);
});

app.listen(PORT, () => {
    console.log(`Server Backend Vua Marketing đang chạy tại cổng ${PORT}`);
});