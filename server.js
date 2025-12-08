const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Create necessary directories
const dirs = [
  path.join(__dirname, 'data'),
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/images'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads/images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Data file paths
const getDataPath = (filename) => path.join(__dirname, 'data', `${filename}.json`);

// Read data
const readData = (filename) => {
  const filePath = getDataPath(filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

// Write data
const writeData = (filename, data) => {
  const filePath = getDataPath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize data structure
const initializeData = () => {
  const users = readData('users') || [
    {
      id: '1',
      username: 'admin',
      password: bcryptjs.hashSync('admin123', 10),
      email: 'admin@isteamahead.com',
      role: 'admin',
      createdAt: new Date()
    }
  ];

  const content = readData('content') || {
    hero: {
      title: 'Welcome to iSTEAM AHEAD',
      subtitle: 'Early Learning Centre',
      description: 'Nurturing young minds through innovative STEAM education'
    },
    about: {
      title: 'About Us',
      description: 'We provide high-quality early childhood education...',
      vision: 'To develop curious, confident learners'
    },
    rooms: [
      { id: 1, name: 'Room 1', ageGroup: '6 weeks - 12 months', capacity: 10 },
      { id: 2, name: 'Room 2', ageGroup: '12 months - 2 years', capacity: 12 }
    ],
    steam: [
      { id: 1, title: 'Science', description: 'Exploring the natural world' },
      { id: 2, title: 'Technology', description: 'Digital innovation' },
      { id: 3, title: 'Engineering', description: 'Building and design' },
      { id: 4, title: 'Arts', description: 'Creative expression' },
      { id: 5, title: 'Mathematics', description: 'Numerical literacy' }
    ],
    testimonials: [],
    contact: {
      address: '123 Main Street',
      phone: '+61 2 1234 5678',
      email: 'info@isteamahead.com',
      hours: 'Monday - Friday, 7:00 AM - 6:00 PM'
    },
    navigation: []
  };

  writeData('users', users);
  writeData('content', content);

  return { users, content };
};

// Initialize on startup
initializeData();

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    const users = readData('users') || [];

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: String(Date.now()),
      username,
      email,
      password: bcryptjs.hashSync(password, 10),
      role: 'editor',
      createdAt: new Date()
    };

    users.push(newUser);
    writeData('users', users);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: newUser.id, username, email, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const users = readData('users') || [];
    const user = users.find(u => u.username === username);

    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Content Routes
app.get('/api/content', (req, res) => {
  try {
    const content = readData('content');
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/content', authMiddleware, (req, res) => {
  try {
    const content = req.body;
    writeData('content', content);
    res.json({ success: true, message: 'Content saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image Upload
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Image
app.delete('/api/uploads/:filename', authMiddleware, (req, res) => {
  try {
    const filePath = path.join(__dirname, 'uploads/images', req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish Changes (git commit & push)
app.post('/api/publish', authMiddleware, (req, res) => {
  try {
    const { message } = req.body;
    // TODO: Integrate with git when needed
    res.json({ success: true, message: 'Changes published' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get users (admin only)
app.get('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  const users = readData('users') || [];
  res.json(users.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })));
});

// 404 Handler
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CMS Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`Default login: admin / admin123`);
});
