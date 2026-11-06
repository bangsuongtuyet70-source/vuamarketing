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

// Giao diện HTML hiển thị trực tiếp từ server
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vua Marketing - Quản lý Tương tác</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 flex h-screen overflow-hidden">
            <aside class="w-64 bg-white border-r flex flex-col justify-between shrink-0">
                <div>
                    <div class="p-4 font-bold text-lg text-blue-600 border-b flex items-center gap-2">
                        <span>👑</span> VUA MARKETING
                    </div>
                    <nav class="p-2 space-y-1">
                        <div class="px-4 py-2 text-gray-700 font-medium">📌 Cào bài viết Face...</div>
                        <div class="pl-4 space-y-1 text-sm">
                            <button onclick="switchTab('danh-sach')" id="btn-danh-sach" class="w-full text-left py-1.5 px-3 rounded text-gray-600 hover:bg-gray-100 font-medium">Danh sách</button>
                            <button onclick="switchTab('comments')" id="btn-comments" class="w-full text-left py-1.5 px-3 rounded text-blue-600 font-semibold bg-blue-50">Comments</button>
                        </div>
                    </nav>
                </div>
                <div class="p-4 border-t flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">thanhhai</span>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">VIP</span>
                </div>
            </aside>

            <main class="flex-1 flex flex-col overflow-y-auto bg-gray-50">
                <div id="tab-danh-sach" class="tab-content hidden p-6">
                    <header class="border-b pb-4 mb-4 flex justify-between items-center bg-white p-4 rounded shadow-sm">
                        <h1 class="font-semibold text-xl text-gray-800">Quản lý Danh sách Link Bài viết</h1>
                        <button onclick="addLinks()" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">+ Thêm Link Quét</button>
                    </header>
                    <div class="bg-white p-6 rounded shadow-sm border space-y-4">
                        <textarea id="linkInputArea" rows="6" placeholder="Dán link bài viết vào đây..." class="w-full border rounded p-3 text-sm"></textarea>
                    </div>
                </div>

                <div id="tab-comments" class="tab-content flex-1 flex flex-col overflow-y-auto">
                    <header class="bg-white border-b px-6 py-3 flex justify-between items-center shrink-0">
                        <h1 class="font-semibold text-gray-800">Quản lý Comments & Lọc số điện thoại</h1>
                        <span id="commentCount" class="text-sm text-blue-600 font-medium">0 comment</span>
                    </header>
                    <div class="p-6 space-y-4">
                        <div class="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 class="text-sm font-bold text-gray-700 mb-3">➕ Thêm nhanh comment thực tế từ Facebook:</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input type="text" id="inputPostName" placeholder="Tên bài viết (VD: Nhà đẹp Betoviet)" class="border rounded px-3 py-1.5 text-sm">
                                <input type="text" id="inputPostUrl" placeholder="Link bài viết gốc (URL Facebook)" class="border rounded px-3 py-1.5 text-sm">
                                <input type="text" id="inputCustName" placeholder="Tên khách hàng (VD: Huệ Giếng Khoan)" class="border rounded px-3 py-1.5 text-sm">
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" id="inputProfileUrl" placeholder="Link trang cá nhân khách hàng" class="border rounded px-3 py-1.5 text-sm">
                                <input type="text" id="inputCommentText" placeholder="Nội dung bình luận (VD: Đất 8*30, 130m...)" class="border rounded px-3 py-1.5 text-sm">
                                <div class="flex gap-2">
                                    <input type="text" id="inputPhone" placeholder="Số điện thoại (nếu có)" class="border rounded px-3 py-1.5 text-sm flex-1">
                                    <button onclick="submitManualComment()" class="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 shrink-0">Thêm</button>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="border-b bg-gray-50 text-xs text-gray-500 uppercase">
                                        <th class="p-3">STT</th>
                                        <th class="p-3">Thời gian</th>
                                        <th class="p-3">Bài viết</th>
                                        <th class="p-3">Tên</th>
                                        <th class="p-3">Bình luận</th>
                                        <th class="p-3">Số điện thoại</th>
                                        <th class="p-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody id="commentTableBody" class="text-sm divide-y"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <script>
                const API_BASE_URL = 'http://localhost:3000';
                function switchTab(name) {
                    document.getElementById('tab-danh-sach').classList.add('hidden');
                    document.getElementById('tab-comments').classList.add('hidden');
                    document.getElementById('tab-' + name).classList.remove('hidden');
                }
                async function loadComments() {
                    const res = await fetch(`${API_BASE_URL}/api/comments`);
                    const data = await res.json();
                    const tbody = document.getElementById('commentTableBody');
                    document.getElementById('commentCount').innerText = data.length + " comment";
                    tbody.innerHTML = '';
                    data.forEach((item, index) => {
                        tbody.innerHTML += `
                            <tr>
                                <td class="p-3">${index + 1}</td>
                                <td class="p-3 text-xs text-gray-500">${item.time}</td>
                                <td class="p-3"><a href="${item.postUrl}" target="_blank" class="text-blue-600 underline font-semibold">${item.post}</a></td>
                                <td class="p-3"><a href="${item.profileUrl}" target="_blank" class="text-blue-600 underline font-semibold">${item.name} 👤</a></td>
                                <td class="p-3">${item.comment}</td>
                                <td class="p-3 font-bold text-blue-600">${item.phone || '-'}</td>
                                <td class="p-3"><span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Chưa đặt</span></td>
                            </tr>
                        `;
                    });
                }
                async function submitManualComment() {
                    const post = document.getElementById('inputPostName').value;
                    const postUrl = document.getElementById('inputPostUrl').value;
                    const name = document.getElementById('inputCustName').value;
                    const profileUrl = document.getElementById('inputProfileUrl').value;
                    const comment = document.getElementById('inputCommentText').value;
                    const phone = document.getElementById('inputPhone').value;
                    if(!name || !comment) return alert('Nhập tên và nội dung!');
                    await fetch(`${API_BASE_URL}/api/add-comment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ post, postUrl, name, profileUrl, comment, phone })
                    });
                    document.getElementById('inputCustName').value = '';
                    document.getElementById('inputCommentText').value = '';
                    document.getElementById('inputPhone').value = '';
                    loadComments();
                }
                window.onload = loadComments;
            </script>
        </body>
        </html>
    `);
});

app.get('/api/comments', (req, res) => {
    res.json(readData().comments || []);
});

app.post('/api/add-comment', (req, res) => {
    const { post, postUrl, name, profileUrl, comment, phone } = req.body;
    const db = readData();
    
    db.comments.unshift({
        time: getFormattedDate(),
        post: post || "Bài viết Facebook",
        postUrl: postUrl || "https://www.facebook.com",
        name: name || "Khách",
        profileUrl: profileUrl || "https://www.facebook.com",
        comment: comment || "",
        phone: phone || null
    });
    writeData(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});