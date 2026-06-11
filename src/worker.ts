import dotenv from 'dotenv';
import { authService } from './services/auth.service';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `Error: Missing required environment variables: ${missingEnvVars.join(', ')}`,
  );
  process.exit(1);
}

const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

const runSessionCleanup = async () => {
  try {
    await authService.cleanupExpiredSessions();
    console.log('Expired sessions cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

console.log('Session cleanup worker started');

// Run cleanup immediately on startup
runSessionCleanup();

// Schedule cleanup every 24 hours
setInterval(runSessionCleanup, CLEANUP_INTERVAL);
