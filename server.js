
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Hiển thị giao diện website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Kiểm tra biến kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('LỖI: Chưa cấu hình MONGO_URI trên Render.');
    process.exit(1);
}

// Model bài viết
const linkSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

// Model bình luận
const commentSchema = new mongoose.Schema({}, {
    strict: false,
    timestamps: true
});

const Link = mongoose.model('Link', linkSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Định dạng thời gian
function getFormattedDate() {
    const d = new Date();
    const pad = n => n.toString().padStart(2, '0');

    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// API kiểm tra server và MongoDB
app.get('/api/health', (req, res) => {
    res.json({
        server: 'running',
        database: mongoose.connection.readyState === 1
            ? 'connected'
            : 'disconnected'
    });
});

// Lấy danh sách bài viết
app.get('/api/links', async (req, res) => {
    try {
        const links = await Link.find()
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        res.json(links);
    } catch (err) {
        console.error('Lỗi lấy bài viết:', err);
        res.status(500).json({
            success: false,
            message: 'Không lấy được danh sách bài viết.'
        });
    }
});

// Thêm bài viết
app.post('/api/add-link', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Link không hợp lệ.'
            });
        }

        const newLink = await Link.create({
            time: getFormattedDate(),
            url: url.trim(),
            postName: url.includes('betoviet')
                ? 'Nhà đẹp Betoviet'
                : (url.includes('mienbac')
                    ? 'Nhà Đẹp Miền Bắc'
                    : 'Bài viết Facebook'),
            contentType: 'Reel',
            dataCount: '0 +1mới',
            lastComment: 'Vừa xong',
            scan: true
        });

        const links = await Link.find()
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        res.json({
            success: true,
            link: newLink,
            links: links
        });

    } catch (err) {
        console.error('Lỗi thêm bài viết:', err);
        res.status(500).json({
            success: false,
            message: 'Không lưu được bài viết.'
        });
    }
});

// Lấy danh sách bình luận
app.get('/api/comments', async (req, res) => {
    try {
        const comments = await Comment.find()
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        res.json(comments);

    } catch (err) {
        console.error('Lỗi lấy bình luận:', err);
        res.status(500).json({
            success: false,
            message: 'Không lấy được bình luận.'
        });
    }
});

// Thêm bình luận
app.post('/api/add-comment', async (req, res) => {
    try {
        const {
            post,
            postUrl,
            name,
            profileUrl,
            comment,
            phone
        } = req.body;

        const newComment = await Comment.create({
            time: getFormattedDate(),
            post: post || 'Nhà đẹp Betoviet',
            postUrl: postUrl || 'https://www.facebook.com',
            name: name || 'Khách hàng',
            profileUrl: profileUrl || 'https://www.facebook.com',
            comment: comment || '',
            phone: phone || null
        });

        res.json({
            success: true,
            comment: newComment
        });

    } catch (err) {
        console.error('Lỗi thêm bình luận:', err);
        res.status(500).json({
            success: false,
            message: 'Không lưu được bình luận.'
        });
    }
});

// Khởi động server sau khi kết nối MongoDB thành công
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000
        });

        console.log('Đã kết nối MongoDB thành công!');
        console.log('Database:', mongoose.connection.name);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server đang chạy tại port ${PORT}`);
        });

    } catch (err) {
        console.error('Không thể kết nối MongoDB:', err.message);
        process.exit(1);
    }
}

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB đã ngắt kết nối.');
});

startServer();
