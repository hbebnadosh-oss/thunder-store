const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const appServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const DATA_FILE = path.join(__dirname, 'database.json');

// دالة قراءة البيانات
function readData() {
    if (!fs.existsSync(DATA_FILE)) return { categories: [], products: [], invoices: [], users: [] };
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '{"categories": [], "products": [], "invoices": [], "users": []}');
}

// دالة حفظ البيانات
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// مسار تسجيل الدخول (الذي كان مفقوداً!)
app.post('/api/login', (req, res) => {
    const { username, pass, email } = req.body;
    // التحقق من الأدمن
    if (username === 'admin' && email === 'alradi@admin.com' && pass === 'Alradi@2026') {
        return res.json({ success: true, role: 'admin' });
    }
    // التحقق من المستخدمين في قاعدة البيانات
    const data = readData();
    const user = data.users.find(u => u.username === username && u.pass === pass);
    if (user) return res.json({ success: true, role: 'user' });
    
    res.json({ success: false });
});

// باقي المسارات (المنتجات، الفواتير، إلخ)
app.get('/api/data', (req, res) => { res.json(readData()); });

app.post('/api/invoices', (req, res) => {
    const data = readData();
    data.invoices.push({ ...req.body, id: Date.now().toString() });
    writeData(data);
    res.json({ success: true });
});

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 3000;
appServer.listen(PORT);
