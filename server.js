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

const samplePosts = [
    { title: "Thiết Kế Nhà An Phát", url: "https://www.facebook.com/reel/901547732295975" },
    { title: "Mộng Hoa Studio", url: "https://www.facebook.com/reel/1151519667546233" }
];

const sampleCustomers = [
    { name: "Oanh Mai", profileUrl: "https://www.facebook.com/oanh.mai.326683" },
    { name: "Tuyến KoMi", profileUrl: "https://www.facebook.com/tuyen.komi" },
    { name: "Nam Tran Cong", profileUrl: "https://www.facebook.com/nam.trancong" }
];

const sampleComments = [
    { text: "Nhà này chi phí thiết kế bao nhiêu ad?", phone: null },
    { text: "Báo giá cho tôi qua SĐT 0917751295 nhé", phone: "0917751295" },
    { text: "Mẫu này đẹp quá, cho mình xin tư vấn", phone: null },
    { text: "Cần tư vấn thi công trọn gói zalo 0988123456", phone: "0988123456" },
    { text: "Gọi lại tư vấn giúp em sđt 0905678910", phone: "0905678910" }
];

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Xóa file database.json cũ đi để hệ thống sinh lại dữ liệu chuẩn mới nhất
setInterval(() => {
    const db = readData();
    if (db.links && db.links.length > 0) {
        const randomPostObj = samplePosts[Math.floor(Math.random() * samplePosts.length)];
        const randomCustomer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
        const randomCommentObj = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        const newComment = {
            time: getFormattedDate(),
            post: randomPostObj.title,
            postUrl: randomPostObj.url,
            name: randomCustomer.name,
            profileUrl: randomCustomer.profileUrl,
            comment: randomCommentObj.text,
            phone: randomCommentObj.phone,
            createdAt: new Date()
        };

        db.comments.unshift(newComment);
        if (db.comments.length > 300) db.comments.pop();

        writeData(db);
    }
}, 10000);

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
    console.log(`Server chạy tại cổng ${PORT}`);
});