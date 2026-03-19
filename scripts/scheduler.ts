/**
 * Cron job scheduler for automatic homework parsing
 * 
 * This script runs periodically to check for new homework on nsbonline.ru
 * and updates the local data file.
 * 
 * Usage:
 *   npm run parse:watch
 */

import { parseHomework } from './parse-homework.js';

const CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function runScheduler() {
  console.log('Starting homework parser scheduler...');
  console.log(`Checking for updates every ${CHECK_INTERVAL / (60 * 60 * 1000)} hours`);
  
  // Initial run
  await parseHomework();
  
  // Schedule periodic checks
  setInterval(async () => {
    console.log(`\n[${new Date().toISOString()}] Checking for new homework...`);
    await parseHomework();
  }, CHECK_INTERVAL);
}

runScheduler().catch(console.error);
