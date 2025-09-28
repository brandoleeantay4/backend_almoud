import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
🚀 Food Cost Server running on http://localhost:${PORT}
📊 Health check: http://localhost:${PORT}/api/health
🗄️  Database: MongoDB
⚡ Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Manejar cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
