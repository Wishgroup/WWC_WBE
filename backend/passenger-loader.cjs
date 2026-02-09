/**
 * Passenger/cPanel loader: they use require() but our app is ESM.
 * This CommonJS stub loads server.js via dynamic import().
 * Set "Application startup file" to passenger-loader.cjs in cPanel.
 */
import('./server.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
