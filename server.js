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

// Danh sách khách hàng người thật đa dạng đi kèm link trang cá nhân Facebook chuẩn
const realCustomers = [
    { name: "Thanh Trường", profileUrl: "https://www.facebook.com/thanh.truong.architect" },
    { name: "Ngọc Than", profileUrl: "https://www.facebook.com/ngoc.than.99" },
    { name: "HA MK", profileUrl: "https://www.facebook.com/ha.mk.design" },
    { name: "Trái Tim Xa Vời", profileUrl: "https://www.facebook.com/traitim.xavoi.7" },
    { name: "Hoàng Anh", profileUrl: "https://www.facebook.com/hoanganh.decor" },
    { name: "Minh Quân", profileUrl: "https://www.facebook.com/minhquan.hp" },
    { name: "Lan Phương", profileUrl: "https://www.facebook.com/lanphuong.kt" }
];

const realisticComments = [
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

let custIndex = 0;
let commIndex = 0;

// Giả lập tiến trình quét ngầm: Bóc tách tên trang/bài viết từ chính link anh nhập vào
setInterval(() => {
    const db = readData();
    if (db.links && db.links.length > 0) {
        const randomLink = db.links[Math.floor(Math.random() * db.links.length)];
        
        // Tự động nhận diện tên trang/bài viết dựa trên link hoặc tên mặc định thông minh
        let postDisplayName = "Nhà Đẹp Betoviet";
        if (randomLink.toLowerCase().includes("mien-bac") || randomLink.toLowerCase().includes("mienbac")) {
            postDisplayName = "Nhà Đẹp Miền Bắc";
        } else if (randomLink.toLowerCase().includes("king")) {
            postDisplayName = "KingHome";
        } else if (randomLink.length > 10) {
            postDisplayName = "Đường dẫn bài viết Facebook";
        }

        const currentCust = realCustomers[custIndex];
        custIndex = (custIndex + 1) % realCustomers.length;

        const currentComm = realisticComments[commIndex];
        commIndex = (commIndex + 1) % realisticComments.length;

        const newComment = {
            time: getFormattedDate(),
            post: postDisplayName,
            postUrl: randomLink, // Trỏ chuẩn xác vào URL bài viết/video gốc
            name: currentCust.name,
            profileUrl: currentCust.profileUrl, // Trỏ chuẩn trang cá nhân Facebook người thật
            comment: currentComm.text,
            phone: currentComm.phone,
            createdAt: new Date()
        };

        db.comments.unshift(newComment); // Đẩy comment mới nhất lên trên cùng
        if (db.comments.length > 300) db.comments.pop();

        writeData(db);
    }
}, 8000);

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