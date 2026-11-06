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

function getFormattedDate() {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// API quản lý Link
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

// API quản lý Comment
app.get('/api/comments', (req, res) => {
    const db = readData();
    res.json(db.comments || []);
});

// API nhận comment thật do anh thêm vào
app.post('/api/add-comment', (req, res) => {
    const { post, postUrl, name, profileUrl, comment, phone } = req.body;
    const db = readData();

    const newComment = {
        time: getFormattedDate(),
        post: post || "Bài viết Facebook",
        postUrl: postUrl || "https://www.facebook.com",
        name: name || "Khách hàng",
        profileUrl: profileUrl || "https://www.facebook.com",
        comment: comment || "",
        phone: phone || null,
        createdAt: new Date()
    };

    db.comments.unshift(newComment); // Đẩy comment mới nhất lên đầu tiên tuyệt đối
    if (db.comments.length > 500) db.comments.pop();

    writeData(db);
    res.json({ success: true, message: "Đã thêm comment thành công!" });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});