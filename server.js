const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Hiển thị giao diện website khi truy cập trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const DATA_FILE = path.join(__dirname, 'database.json');



function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { links: [], comments: [] };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (err) {
        return { links: [], comments: [] };
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Lỗi ghi file:", err);
    }
}

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

app.get('/api/links', (req, res) => {
    res.json(readData().links || []);
});

app.post('/api/add-link', (req, res) => {
    const { url } = req.body;
    if (!url) return res.json({ success: false });
    
    const db = readData();
    const newLink = {
        time: getFormattedDate(),
        url: url,
        postName: url.includes("betoviet") ? "Nhà đẹp Betoviet" : (url.includes("mienbac") ? "Nhà Đẹp Miền Bắc" : "Bài viết Facebook"),
        contentType: "Reel",
        dataCount: "0 +1mới",
        lastComment: "Vừa xong",
        scan: true
    };

    db.links.unshift(newLink);
    writeData(db);
    res.json({ success: true, links: db.links });
});

app.get('/api/comments', (req, res) => {
    res.json(readData().comments || []);
});

app.post('/api/add-comment', (req, res) => {
    const { post, postUrl, name, profileUrl, comment, phone } = req.body;
    const db = readData();
    
    const newComment = {
        time: getFormattedDate(),
        post: post || "Nhà đẹp Betoviet",
        postUrl: postUrl || "https://www.facebook.com",
        name: name || "Khách hàng",
        profileUrl: profileUrl || "https://www.facebook.com",
        comment: comment || "",
        phone: phone || null
    };

    db.comments.unshift(newComment);
    writeData(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
});
