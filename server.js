// server.js
// Simple Express backend for Outpass Management System
// Save this file as server.js and run with: node server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// To store records in a JSON file (persistent simple DB)
const DATA_FILE = path.join(__dirname, 'records.json');

app.use(cors());
app.use(express.json());

// Ensure records file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf-8');
  }
}
ensureDataFile();

// Utility to read records
function readRecords() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Utility to write records
function writeRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// --- ROUTES ---

// GET all records
app.get('/api/records', (req, res) => {
  const records = readRecords();
  res.json(records);
});

// POST new record (outpass request)
app.post('/api/records', (req, res) => {
  const record = req.body;
  if (
    !record.domain ||
    !record.name ||
    !record.date ||
    !record.reason ||
    !record.authority
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const records = readRecords();
  record.approved = false;
  record.rejected = false;
  records.push(record);
  writeRecords(records);
  res.json({ success: true });
});

// PATCH approve or reject a record by index (admin)
app.patch('/api/records/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  const { approved, rejected } = req.body;

  let records = readRecords();
  if (isNaN(idx) || idx < 0 || idx >= records.length) {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Only update approved/rejected status
  if (typeof approved === 'boolean') records[idx].approved = approved;
  if (typeof rejected === 'boolean') records[idx].rejected = rejected;
  // Unset the opposite status if needed
  if (records[idx].approved) records[idx].rejected = false;
  if (records[idx].rejected) records[idx].approved = false;

  writeRecords(records);
  res.json({ success: true });
});

// ADMIN login (very basic, for demonstration only)
const adminCredentials = {
  hr: 'admin123',
  ceo: 'admin123',
  sectionhead: 'admin123',
  saleshead: 'admin123',
  accountshead: 'admin123',
};

app.post('/api/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (adminCredentials[username] === password) {
    res.json({ success: true, role: username });
  } else {
    res.status(401).json({ success: false });
  }
});

// --- Serve static frontend if needed ---
// Uncomment if you want to serve your HTML via Express
// app.use(express.static(path.join(__dirname, 'public')));

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Outpass Management backend running on http://localhost:${PORT}`);
});