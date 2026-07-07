import { startSmtp } from './smtp/server.js';
import { createApiServer } from './api/server.js';
import { cleanupScheduler } from './services/scheduler.js';

console.log('Starting temp-mail backend...');

const smtpEnabled = process.env.ENABLE_SMTP !== 'false';
if (smtpEnabled) {
  startSmtp();
} else {
  console.log('SMTP server disabled (set ENABLE_SMTP=true to enable)');
}

const api = createApiServer();
const apiPort = Number(process.env.PORT || process.env.API_PORT || 3001);

api.listen(apiPort, () => {
  console.log(`API listening on :${apiPort}`);
  console.log('Backend ready!');
});

const cleanupEnabled = (process.env.CLEANUP_ENABLED ?? 'true') !== 'false';
const leaderOk =
  process.env.CLEANUP_LEADER === undefined ||
  process.env.CLEANUP_LEADER === '1' ||
  process.env.CLEANUP_LEADER === 'true';

if (cleanupEnabled && leaderOk) {
  console.log('🧹 Cleanup scheduler enabled');
  cleanupScheduler.start();
} else {
  console.log('🧹 Cleanup scheduler disabled (set CLEANUP_ENABLED=true to enable)');
}

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down servers...');
  cleanupScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down servers...');
  cleanupScheduler.stop();
  process.exit(0);
}); 