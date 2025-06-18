
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'gizi123', resave: false, saveUninitialized: true }));

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, sekolah TEXT, pesan TEXT)");
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function(err) {
    if (err) return res.send('Gagal mendaftar.');
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.send("Email tidak ditemukan.");
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.send("Password salah.");
    }
  });
});

app.post('/submit-feedback', (req, res) => {
  const { nama, sekolah, pesan } = req.body;
  db.run("INSERT INTO feedback (nama, sekolah, pesan) VALUES (?, ?, ?)", [nama, sekolah, pesan]);
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
