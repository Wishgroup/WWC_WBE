/**
 * CommonJS entry point for cPanel/Passenger.
 * Passenger uses require(), but our app is ES modules ("type": "module").
 * This .cjs file is loaded by Passenger; it then loads the real app via dynamic import().
 */

// Use dynamic import() to load the ES module
(async () => {
  try {
    await import('./server.js');
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
