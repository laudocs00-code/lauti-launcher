const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar DB
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
}

const MIME_TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg'
};

/**
 * Verifica Mojang (Bloqueo Premium) usando modulo nativo
 */
function isPremium(username) {
    return new Promise((resolve) => {
        https.get(`https://api.mojang.com/users/profiles/minecraft/${username}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        resolve(!!json.id);
                    } catch (e) { resolve(false); }
                } else { resolve(false); }
            });
        }).on('error', () => resolve(false));
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // CORS (Indispensable para web y launcher)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- RUTA: /api/register ---
    if (parsedUrl.pathname === '/api/register' || parsedUrl.pathname === '/register') {
        let name, pass;
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            await new Promise(r => req.on('end', () => {
                try {
                    const d = JSON.parse(body);
                    name = d.name; pass = d.pass;
                } catch(e) {}
                r();
            }));
        } else {
            name = parsedUrl.query.name;
            pass = parsedUrl.query.pass;
        }

        if (!name || !pass) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Faltan datos' }));
        }

        name = name.trim().toLowerCase();
        if (await isPremium(name)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Nombre PREMIUM detectado.' }));
        }

        const db = JSON.parse(fs.readFileSync(DB_FILE));
        if (db.users.find(u => u.name === name)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Ya registrado' }));
        }

        db.users.push({ name, pass, date: new Date().toISOString() });
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', message: 'Exito' }));
    }

    // --- RUTA: /api/login ---
    if (parsedUrl.pathname === '/api/login' || parsedUrl.pathname === '/login') {
        const name = (parsedUrl.query.name || "").trim().toLowerCase();
        const pass = parsedUrl.query.pass;

        const db = JSON.parse(fs.readFileSync(DB_FILE));
        const user = db.users.find(u => u.name === name && u.pass === pass);

        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'ok', message: 'Ok' }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ status: 'error', message: 'Error' }));
        }
    }

    // --- ESTATICOS ---
    let pathname = parsedUrl.pathname === '/' ? '/index.html' : parsedUrl.pathname;
    let filePath = path.join(__dirname, pathname);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
        } else {
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor ONLINE en puerto ${PORT}`);
});
