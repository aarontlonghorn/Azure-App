import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'employees.json');

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ employees: [
      { id: 1, firstName: 'Ada', lastName: 'Lovelace', title: 'Engineer' },
      { id: 2, firstName: 'Grace', lastName: 'Hopper', title: 'Rear Admiral' }
    ] }, null, 2));
  }
}
function readDB() {
  ensureData();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => res.json({ ok: true, msg: 'Employee API running' }));

// READ all
app.get('/api/employees', (req, res) => {
  try {
    const db = readDB();
    res.json(db.employees);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE
app.post('/api/employees', (req, res) => {
  try {
    const { firstName, lastName, title } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName are required' });
    const db = readDB();
    const nextId = db.employees.length ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;
    const emp = { id: nextId, firstName, lastName, title: title || '' };
    db.employees.push(emp);
    writeDB(db);
    res.status(201).json(emp);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE
app.put('/api/employees/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { firstName, lastName, title = '' } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ error: 'firstName and lastName are required' });
    const db = readDB();
    const idx = db.employees.findIndex(e => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.employees[idx] = { id, firstName, lastName, title };
    writeDB(db);
    res.json(db.employees[idx]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE
app.delete('/api/employees/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = readDB();
    const before = db.employees.length;
    db.employees = db.employees.filter(e => e.id !== id);
    if (db.employees.length === before) return res.status(404).json({ error: 'Not found' });
    writeDB(db);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
