const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const appServer = http.createServer(app);

// إعدادات قراءة البيانات القادمة من المتصفح (لوحة التحكم والطلبات)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تشغيل الملفات الثابتة (مثل صفحة index.html والصور) من نفس المجلد
app.use(express.static(path.join(__dirname)));

// مسار قاعدة البيانات الوهمية لحفظ المنتجات والأقسام والفواتير
const DATA_FILE = path.join(__dirname, 'database.json');

// دالة مساعدة لقراءة البيانات
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { categories: [], products: [], invoices: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '{}');
}

// دالة مساعدة لحفظ البيانات
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// --- المسارات (Routes) الخاصة بالمتجر ---

// 1. جلب البيانات بالكامل للمتصفح
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// 2. إضافة قسم جديد من لوحة التحكم
app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    const data = readData();
    if (name && !data.categories.includes(name)) {
        data.categories.push(name);
        writeData(data);
    }
    res.redirect('/');
});

// 3. إضافة منتج جديد من لوحة التحكم
app.post('/api/products', (req, res) => {
    const { category, name, price, discount, color, features, image } = req.body;
    const data = readData();
    
    const newProduct = {
        id: Date.now().toString(),
        category,
        name,
        price: parseFloat(price) || 0,
        discount: parseFloat(discount) || 0,
        color,
        features,
        image: image || 'https://via.placeholder.com/150'
    };

    data.products.push(newProduct);
    writeData(data);
    res.redirect('/');
});

// 4. استقبال الفواتير والطلبات من المشترين
app.post('/api/invoices', (req, res) => {
    const invoice = req.body;
    invoice.id = Date.now().toString();
    invoice.date = new Date().toLocaleString('ar-YE');
    
    const data = readData();
    data.invoices.push(invoice);
    writeData(data);
    
    res.json({ success: true, message: 'تم استلام طلبك بنجاح يا غالي!' });
});

// المسار الرئيسي لفتح واجهة المتجر
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- إعداد المنفذ وتشغيل السيرفر ذكياً ---
// يقرأ المنفذ تلقائياً من السيرفر السحابي أونلاين، أو يستخدم 3000 محلياً
const PORT = process.env.PORT || 3000;

appServer.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 تم تشغيل وإطلاق سيرفر متجر الرعدي الإبداعي بنجاح تام!`);
    console.log(`🌍 السيرفر يعمل الآن على المنفذ المفتوح: ${PORT}`);
    console.log(`==================================================\n`);
});
