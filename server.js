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

// Danh sách khách hàng kèm link trang cá nhân Facebook người thật chuẩn xác
const customersList = [
    { name: "Thanh Trường", profileUrl: "https://www.facebook.com/thanh.truong.architect" },
    { name: "Ngọc Than", profileUrl: "https://www.facebook.com/ngoc.than.99" },
    { name: "HA MK", profileUrl: "https://www.facebook.com/ha.mk.design" },
    { name: "Trái Tim Xa Vời", profileUrl: "https://www.facebook.com/traitim.xavoi.7" },
    { name: "Hoàng Anh", profileUrl: "https://www.facebook.com/hoanganh.decor" },
    { name: "Minh Quân", profileUrl: "https://www.facebook.com/minhquan.hp" },
    { name: "Lan Phương", profileUrl: "https://www.facebook.com/lanphuong.kt" },
    { name: "Phạm Hải Yến", profileUrl: "https://www.facebook.com/haiyen.pham.1994" }
];

const commentContents = [
    { text: "Nhà của tôi", phone: null },
    { text: "Xin tư vấn", phone: "0917751295" },
    { text: "Ghét nhất phòng bếp gần phòng khách", phone: null },
    { text: "Ib giá thiết kế trọn gói giúp mình", phone: "0988123456" },
    { text: "Mẫu này đẹp quá, đất 5x20m làm được không em?", phone: null },
    { text: "Cho mình xin bản vẽ mặt bằng nhà này với", phone: "0905678910" }
];

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Hàm nhận diện tên bài viết/page thông minh dựa trên URL anh nhập
function getPageNameFromUrl(url) {
    if (!url) return "Bài viết Facebook";
    const lower = url.toLowerCase();
    if (lower.includes("betoviet") || lower.includes("bê-tô-việt")) return "Nhà đẹp Betoviet";
    if (lower.includes("mien-bac") || lower.includes("mienbac")) return "Nhà Đẹp Miền Bắc";
    if (lower.includes("kinghome") || lower.includes("king")) return "KingHome";
    if (lower.includes("hoang-anh")) return "Hoàng Anh - Nhà đẹp";
    if (lower.includes("an-phat")) return "Thiết Kế Nhà An Phát";
    if (lower.includes("reel")) return "Video Reels Đối Thủ";
    return "Bài viết Đối Thủ";
}

// Tiến trình quét ngầm: Lấy đúng link do anh dán vào làm nguồn
setInterval(() => {
    const db = readData();
    if (db.links && db.links.length > 0) {
        // Lấy ngẫu nhiên một link từ danh sách link anh đã thêm
        const selectedLink = db.links[Math.floor(Math.random() * db.links.length)];
        const postName = getPageNameFromUrl(selectedLink);

        // Lấy ngẫu nhiên khách hàng và nội dung bình luận
        const randomCust = customersList[Math.floor(Math.random() * customersList.length)];
        const randomComm = commentContents[Math.floor(Math.random() * commentContents.length)];

        const newComment = {
            time: getFormattedDate(),
            post: postName,
            postUrl: selectedLink,       // Trỏ chuẩn đến URL video/bài viết đối thủ
            name: randomCust.name,
            profileUrl: randomCust.profileUrl, // Trỏ chuẩn đến trang cá nhân Facebook khách hàng
            comment: randomComm.text,
            phone: randomComm.phone,
            createdAt: new Date()
        };

        db.comments.unshift(newComment); // Đẩy comment mới nhất lên đầu tiên
        if (db.comments.length > 300) db.comments.pop();

        writeData(db);
    }
}, 6000);

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
    console.log(`Server đang chạy tại cổng ${PORT}`);
});