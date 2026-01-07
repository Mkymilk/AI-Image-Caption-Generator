import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import captionRouter from './routes/caption.route';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// Configuration
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/caption', captionRouter);

// Root route - serve the frontend
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'AI Image Caption Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/caption': 'Generate caption for uploaded image',
      'POST /api/caption/custom': 'Generate caption with custom prompt',
      'GET /api/caption/health': 'Health check endpoint',
    },
    documentation: 'See README.md for full documentation',
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         AI Image Caption Generator Server                 ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}              ║
║  📡 API endpoint: http://localhost:${PORT}/api/caption       ║
║  🏥 Health check: http://localhost:${PORT}/api/caption/health║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Validate environment variables
  const requiredEnvVars = [
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_MODEL_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`
    );
    console.warn('   Please check your .env file configuration.');
  } else {
    console.log('✅ All required environment variables are configured.');
  }
});

export default app;
