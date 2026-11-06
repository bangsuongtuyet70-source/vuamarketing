const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://bangsuongtuyet70_db_user:Abc123456@cluster0.et2wb6o.mongodb.net/vua_marketing?retryWrites=true&w=majority";

// 📌 1. KẾT NỐI MONGODB ATLAS VỚI CẤU HÌNH AN TOÀN
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // Timeout sau 10 giây nếu không kết nối được
})
.then(() => {
    console.log('✅ Đã kết nối thành công tới Database MongoDB Atlas!');
})
.catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
});