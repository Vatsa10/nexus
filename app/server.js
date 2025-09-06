const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Server from socket.io
require('dotenv').config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Changed from smtp.example.com
  port: 587, // or 465 for SSL
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express();
const port = 3001;

const httpServer = http.createServer(app); // Create HTTP server
const io = new Server(httpServer, { // Initialize Socket.IO with HTTP server
  cors: {
    origin: "http://localhost:3000", // Allow your frontend origin
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'synergysphere',
  password: 'vatsa10',
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the synergysphere database.');
  client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      summary TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assignee TEXT[],
      dueDate TEXT,
      status TEXT,
      projectId INTEGER,
      FOREIGN KEY (projectId) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      taskId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      message TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (taskId) REFERENCES tasks(id),
      FOREIGN KEY (senderId) REFERENCES users(id)
    );
  `, (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
  });
});

app.post('/api/signup', async (req, res) => {
  console.log('Signup request body:', req.body);
  const { name, email, password } = req.body;
  const sql = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`;
  try {
    const result = await pool.query(sql, [name, email, password]);
    res.json({
      message: 'User created successfully',
      userId: result.rows[0].id,
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = $1 AND password = $2`;
  try {
    const result = await pool.query(sql, [email, password]);
    if (result.rows.length > 0) {
      res.json({ message: 'Login successful', user: result.rows[0] });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  const { email } = req.query;
  const sql = `SELECT id, name, email FROM users WHERE email LIKE $1`;
  try {
    const result = await pool.query(sql, [`%${email}%`]);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const sql = `SELECT id, name, email FROM users WHERE id = $1`;
  try {
    const result = await pool.query(sql, [userId]);
    res.json(result.rows[0]);
  }  catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name, email } = req.body;
  const sql = `UPDATE users SET name = $1, email = $2 WHERE id = $3`;
  try {
    await pool.query(sql, [name, email, userId]);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  const sql = `SELECT id, name, email FROM users`;
  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects', async (req, res) => {
  const sql = `SELECT * FROM projects`;
  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, summary } = req.body;
  const sql = `INSERT INTO projects (name, summary) VALUES ($1, $2) RETURNING id`;
  try {
    const result = await pool.query(sql, [name, summary]);
    res.json({
      message: 'Project created successfully',
      projectId: result.rows[0].id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const sql = `SELECT * FROM projects WHERE id = $1`;
  try {
    const result = await pool.query(sql, [projectId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/projects/:projectId/tasks', async (req, res) => {
  const { projectId } = req.params;
  const sql = `SELECT * FROM tasks WHERE projectId = $1`;
  try {
    const result = await pool.query(sql, [projectId]);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const sql = `SELECT * FROM tasks WHERE id = $1`;
  try {
    const result = await pool.query(sql, [taskId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, assignee, dueDate, status, projectId } = req.body;
  const sql = `INSERT INTO tasks (title, description, assignee, dueDate, status, projectId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  try {
    const result = await pool.query(sql, [title, description, assignee, dueDate, status, projectId]);
    const newTask = result.rows[0];
    io.emit('taskCreated', newTask); // Emit event

    // Send email to assignees
    if (assignee && assignee.length > 0) {
      const assigneeEmails = assignee; // assignee is already an array of emails
      const mailOptions = {
        from: 'your_email@example.com', // Sender address
        to: assigneeEmails.join(', '), // List of receivers
        subject: `New Task Assigned: ${title}`,
        html: `<p>You have been assigned a new task:</p>
               <p><strong>Title:</strong> ${title}</p>
               <p><strong>Description:</strong> ${description || 'N/A'}</p>
               <p><strong>Due Date:</strong> ${dueDate || 'N/A'}</p>
               <p><strong>Status:</strong> ${status}</p>
               <p>Project ID: ${projectId}</p>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent: New task assigned');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    res.json({
      message: 'Task created successfully',
      taskId: newTask.id,
    });
  } catch (err) {
    console.error('Task creation error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, assignee, dueDate, status } = req.body;
  const sql = `UPDATE tasks SET title = $1, description = $2, assignee = $3, dueDate = $4, status = $5 WHERE id = $6`;
  try {
    await pool.query(sql, [title, description, assignee, dueDate, status, taskId]);
    res.json({ message: 'Task updated successfully' });
    io.emit('taskUpdated', { id: taskId, title, description, assignee, dueDate, status }); // Emit event

    // Send email to assignees on update
    if (assignee && assignee.length > 0) {
      const assigneeEmails = assignee;
      const mailOptions = {
        from: 'your_email@example.com',
        to: assigneeEmails.join(', '),
        subject: `Task Updated: ${title}`,
        html: `<p>A task assigned to you has been updated:</p>
               <p><strong>Title:</strong> ${title}</p>
               <p><strong>Description:</strong> ${description || 'N/A'}</p>
               <p><strong>Due Date:</strong> ${dueDate || 'N/A'}</p>
               <p><strong>Status:</strong> ${status}</p>`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent: Task updated');
      } catch (emailError) {
        console.error('Error sending email on update:', emailError);
      }
    }

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tasks/:taskId/messages', async (req, res) => {
  const { taskId } = req.params;
  const { senderId, message } = req.body;
  const sql = `INSERT INTO chat_messages (taskId, senderId, message) VALUES ($1, $2, $3) RETURNING *`;
  try {
    const result = await pool.query(sql, [taskId, senderId, message]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/tasks/:taskId/messages', async (req, res) => {
  const { taskId } = req.params;
  const sql = `
    SELECT
      cm.id,
    cm.message,
      cm.timestamp,
      u.id AS senderId,
      u.name AS senderName,
      u.email AS senderEmail
    FROM chat_messages cm
    JOIN users u ON cm.senderId = u.id
    WHERE cm.taskId = $1
    ORDER BY cm.timestamp ASC;
  `;
  try {
    const result = await pool.query(sql, [taskId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(400).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Schedule a cron job to run once every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily task deadline check...');
  const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const now = new Date();

  const sql = `
    SELECT id, title, dueDate
    FROM tasks
    WHERE dueDate IS NOT NULL
      AND dueDate::date > $1::date
      AND dueDate::date <= $2::date;
  `;

  try {
    const result = await pool.query(sql, [now.toISOString(), twentyFourHoursFromNow.toISOString()]);
    result.rows.forEach(task => {
      console.log(`Deadline approaching for task: ${task.title} (Due: ${task.dueDate})`);
      io.emit('deadlineApproaching', {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        message: `Task "${task.title}" is due within 24 hours!`,
      });
    });
  } catch (err) {
    console.error('Error checking task deadlines:', err.message);
  }
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});