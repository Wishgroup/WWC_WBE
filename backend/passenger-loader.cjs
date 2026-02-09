/**
 * Passenger loader - must be pure CommonJS
 * This file is loaded by Passenger which uses require()
 * 
 * CommonJS wrapper to load ES module server.js
 */

// Use dynamic import to load ES module
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to load server:', err);
    process.exit(1);
  }
})();
