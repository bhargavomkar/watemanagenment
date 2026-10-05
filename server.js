const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize database file if it doesn't exist
function initDb() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], bizData: {}, marketplace: [], transactions: [] }, null, 2));
    }
}

// Read database
function readDb() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        return { users: [], bizData: {}, marketplace: [], transactions: [] };
    }
}

// Write database
function writeDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing database:", err);
    }
}

initDb();

// --- API ENDPOINTS ---

// Get all registered users
app.get('/api/users', (req, res) => {
    const db = readDb();
    res.json(db.users);
});

// Save all registered users (used when registering a new user)
app.post('/api/users', (req, res) => {
    const db = readDb();
    db.users = req.body;
    writeDb(db);
    res.json({ success: true, message: 'Users updated' });
});

// Get all business data (used by admin maps)
app.get('/api/bizdata', (req, res) => {
    const db = readDb();
    res.json(db.bizData);
});

// Get business data for a specific user
app.get('/api/bizdata/:username', (req, res) => {
    const db = readDb();
    const username = req.params.username;
    
    // Default structure for new businesses
    const defaults = { revenue:0, co2:0, waste:0, matches:0, imported:0, importSavings:0, importCo2:0, lat:null, lng:null, emissionsTotal: 0, emissionsReduced: 0, carbonCredits: 0 };
    
    const savedData = db.bizData[username] || {};
    const finalData = { ...defaults, ...savedData };
    
    res.json(finalData);
});

// Save business data for a specific user
app.post('/api/bizdata/:username', (req, res) => {
    const db = readDb();
    const username = req.params.username;
    
    db.bizData[username] = req.body;
    writeDb(db);
    res.json({ success: true, message: 'Business data updated' });
});

// Get marketplace listings
app.get('/api/market', (req, res) => {
    const db = readDb();
    if (!db.marketplace) db.marketplace = [];
    res.json(db.marketplace);
});

// Update marketplace listings
app.post('/api/market', (req, res) => {
    const db = readDb();
    db.marketplace = req.body;
    writeDb(db);
    res.json({ success: true, message: 'Marketplace updated' });
});

// Get transactions
app.get('/api/transactions', (req, res) => {
    const db = readDb();
    if (!db.transactions) db.transactions = [];
    res.json(db.transactions);
});

// Update transactions
app.post('/api/transactions', (req, res) => {
    const db = readDb();
    db.transactions = req.body;
    writeDb(db);
    res.json({ success: true, message: 'Transactions updated' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==============================================`);
    console.log(`🚀 WIN Backend Server running successfully!`);
    console.log(`- Local Access: http://localhost:${PORT}`);
    console.log(`- Database file: ${DB_FILE}`);
    console.log(`==============================================\n`);
});
