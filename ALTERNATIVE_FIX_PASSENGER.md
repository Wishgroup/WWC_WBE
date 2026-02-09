# Alternative Fixes for Passenger ES Module Error

## If passenger-loader.cjs Still Doesn't Work

### Option 1: Try Different Loader Format

Create/update `passenger-loader.cjs` with this content:

```javascript
// Passenger loader - must be CommonJS
(async () => {
  try {
    const server = await import('./server.js');
    // Server should auto-start when imported
  } catch (err) {
    console.error('Loader error:', err);
    process.exit(1);
  }
})();
```

### Option 2: Use run.cjs Instead

Some cPanel setups work better with `run.cjs`. Create this file:

**File: `run.cjs`**
```javascript
// Alternative loader for Passenger
import('./server.js').catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
```

Then set startup file to: `run.cjs`

### Option 3: Convert server.js to CommonJS (NOT RECOMMENDED)

This would require changing all imports/exports - too much work.

### Option 4: Contact Hosting Support

Ask them:
- "My Node.js app uses ES modules but Passenger requires CommonJS. How do I configure Passenger to load ES modules?"

They may need to:
- Enable a different Passenger configuration
- Use a different Node.js handler
- Configure Passenger to support ES modules

### Option 5: Check Package.json Type

Make sure `package.json` has:
```json
{
  "type": "module"
}
```

This tells Node.js to treat .js files as ES modules.

### Option 6: Try Different Startup File Names

Try these in order:
1. `passenger-loader.cjs` (current)
2. `run.cjs`
3. `loader.cjs`
4. `start.cjs`

### Option 7: Check File Permissions

```bash
# If SSH available
chmod 644 ~/Wishwaveclubbackend/passenger-loader.cjs
```

### Option 8: Verify File Extension

- Must be `.cjs` (not `.js`)
- Passenger looks for `.cjs` for CommonJS files

## Debug Steps

1. **Check if file exists on server:**
   - File Manager → `Wishwaveclubbackend/passenger-loader.cjs`
   - Must exist and have content

2. **Check startup file setting:**
   - Must be exactly: `passenger-loader.cjs`
   - No path, no extension variations

3. **Check logs for different error:**
   - Maybe file isn't being found
   - Maybe syntax error in loader

4. **Try destroying and recreating app:**
   - Sometimes cPanel caches the startup file
   - Destroy app
   - Recreate with `passenger-loader.cjs` from the start

## Most Likely Issue

The startup file in cPanel is still set to `server.js` instead of `passenger-loader.cjs`.

**Double-check:**
- Go to Node.js App settings
- Look at "Application startup file" field
- It MUST say: `passenger-loader.cjs`
- NOT: `server.js`
- NOT: `./passenger-loader.cjs`
- NOT: `/passenger-loader.cjs`

## If Nothing Works

Contact hosting support (tashjeel.ae) and tell them:
- "Passenger cannot load ES modules. Need help configuring Passenger to work with ES modules or alternative Node.js handler."

They may have a specific configuration for ES modules.

