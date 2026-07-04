import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './utils/prisma.js';
import keysRouter from './routes/keys.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve built frontend in production (Docker)
if (process.env.NODE_ENV === 'production') {
  const staticDir = path.join(__dirname, '..', 'public');
  app.use(express.static(staticDir));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/keys', keysRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA catch-all: serve index.html for non-API routes (production/Docker)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

// Error handler — never leak internals; never log key values
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down gracefully...');
  prisma.$disconnect().then(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});