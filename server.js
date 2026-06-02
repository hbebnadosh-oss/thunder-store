const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const appServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

let storeDatabase = {
    categories: ["الكل", "هواتف", "أحذية", "عطور"],
    products: [
        {
            category: "هواتف",
            name: "هاتف الرعد الذكي برو X",
            price: 2999,
            discount: 15,
            color: "أسود ملكي",
            specs: "ذاكرة 512 جيجا، رام 16، شاشة ثنائية 120Hz",
            img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
        },
        {
            category: "عطور",
            name: "عطر الملكي ليميتد إديشن",
            price: 520,
            discount: 10,
            color: "ذهبي فاخر",
            specs: "رائحة بخور وعود ملكي ثبات 72 ساعة",
            img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500"
        }
    ],
    orders: [],
    users: []
};

app.get('/api/data', (req, res) => {
    res.json(storeDatabase);
});

app.post('/api/signup', (req, res) => {
    const { username, pass, email } = req.body;
    storeDatabase.users.push({ username, pass, email });
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    const { username, pass, email } = req.body;
    if (username === 'admin' && email === 'alradi@admin.com' && pass === 'Alradi@2026') {
        return res.json({ success: true });
    }
    res.json({ success: true });
});

app.post('/api/order', (req, res) => {
    const { user, items, total } = req.body;
    storeDatabase.orders.push({
        user: user || 'زبون متميز',
        items: items || 'مشتريات متنوعة',
        total: total || '0',
        id: Date.now().toString()
    });
    res.json({ success: true });
});

app.post('/api/add-category', (req, res) => {
    const { name } = req.body;
    if (name && !storeDatabase.categories.includes(name)) {
        storeDatabase.categories.push(name);
    }
    res.json({ success: true });
});

app.post('/api/add-product', (req, res) => {
    const { category, name, price, discount, color, specs, img } = req.body;
    storeDatabase.products.push({
        category,
        name,
        price: parseFloat(price) || 0,
        discount: parseFloat(discount) || 0,
        color: color || 'حسب الإختيار',
        specs: specs || 'مواصفات قياسية فاخرة',
        img: img || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'
    });
    res.json({ success: true });
});

app.post('/api/edit-product', (req, res) => {
    const { index, name, price, discount, color, specs, img } = req.body;
    if (storeDatabase.products[index]) {
        storeDatabase.products[index] = { ...storeDatabase.products[index], name, price, discount, color, specs, img };
    }
    res.json({ success: true });
});

app.post('/api/delete-product', (req, res) => {
    const { index } = req.body;
    if (storeDatabase.products[index]) storeDatabase.products.splice(index, 1);
    res.json({ success: true });
});

app.post('/api/edit-category', (req, res) => {
    const { oldName, newName } = req.body;
    const idx = storeDatabase.categories.indexOf(oldName);
    if (idx !== -1) {
        storeDatabase.categories[idx] = newName;
        storeDatabase.products.forEach(p => { if (p.category === oldName) p.category = newName; });
    }
    res.json({ success: true });
});

app.post('/api/delete-category', (req, res) => {
    const { name } = req.body;
    storeDatabase.categories = storeDatabase.categories.filter(c => c !== name);
    storeDatabase.products = storeDatabase.products.filter(p => p.category !== name);
    res.json({ success: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
appServer.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ: ${PORT}`);
});
