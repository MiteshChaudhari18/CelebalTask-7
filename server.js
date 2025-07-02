const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

const JWT_SECRET = 'YOUR_SECRET_KEY';
const USERS_FILE = './users.json';
const EMPLOYEES_FILE = './employees.json';

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Needed for JSON body (PUT!)
app.use(cookieParser());

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  try {
    jwt.verify(token, JWT_SECRET);
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } catch {
    res.redirect('/');
  }
});

// Register new user
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).send('Missing fields');

  const hashed = await bcrypt.hash(password, 10);

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).send('User already exists');
  }

  users.push({ username, password: hashed, role });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.sendStatus(200);
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.send('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('Invalid credentials');

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  res.redirect('/dashboard');
});

// Get user details
app.get('/api/user', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json(user);
  } catch {
    res.status(401).send('Invalid token');
  }
});

// Get employees
app.get('/api/employees', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).send('Forbidden');

    const employees = fs.existsSync(EMPLOYEES_FILE)
      ? JSON.parse(fs.readFileSync(EMPLOYEES_FILE))
      : [];

    res.json(employees);
  } catch {
    res.status(401).send('Invalid token');
  }
});

// Add employee
app.post('/api/employees', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).send('Forbidden');

    const { name, position } = req.body;

    let employees = fs.existsSync(EMPLOYEES_FILE)
      ? JSON.parse(fs.readFileSync(EMPLOYEES_FILE))
      : [];

    const newEmp = { id: Date.now(), name, position };
    employees.push(newEmp);
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));

    res.sendStatus(200);
  } catch {
    res.status(401).send('Invalid token');
  }
});

// ✅ UPDATE employee (PUT)
app.put('/api/employees/:id', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).send('Forbidden');

    const id = parseInt(req.params.id);
    const { name, position } = req.body;

    let employees = fs.existsSync(EMPLOYEES_FILE)
      ? JSON.parse(fs.readFileSync(EMPLOYEES_FILE))
      : [];

    employees = employees.map(emp =>
      emp.id === id ? { ...emp, name, position } : emp
    );

    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));

    res.sendStatus(200);
  } catch {
    res.status(401).send('Invalid token');
  }
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).send('Forbidden');

    const id = parseInt(req.params.id);
    let employees = fs.existsSync(EMPLOYEES_FILE)
      ? JSON.parse(fs.readFileSync(EMPLOYEES_FILE))
      : [];

    employees = employees.filter(e => e.id !== id);
    fs.writeFileSync(EMPLOYEES_FILE, JSON.stringify(employees, null, 2));

    res.sendStatus(200);
  } catch {
    res.status(401).send('Invalid token');
  }
});

app.listen(PORT, () => console.log(`✅ Server running → http://localhost:${PORT}`));
