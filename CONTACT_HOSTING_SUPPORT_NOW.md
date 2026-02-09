# Contact Hosting Support - Passenger ES Module Issue

## The Problem
Passenger (cPanel's Node.js handler) cannot load ES modules. Even with passenger-loader.cjs, it's still trying to load server.js directly.

This is likely a **server configuration issue** that requires hosting support to fix.

## Support Ticket Message

**Subject:**
```
URGENT: Node.js App Cannot Start - Passenger ES Module Error
```

**Message:**
```
Hello Support Team,

I have a Node.js application deployed in cPanel that uses ES modules (import/export syntax). However, Passenger is trying to use require() to load the application, which doesn't work with ES modules.

ERROR:
Error [ERR_REQUIRE_ESM]: require() of ES Module /home3/wishhosp/Wishwaveclubbackend/server.js not supported.

I've tried:
- Using passenger-loader.cjs as startup file
- Creating a CommonJS loader file with dynamic import()
- Changing startup file to run.cjs

But Passenger still tries to load server.js directly.

APPLICATION DETAILS:
- App Name: Wishwaveclubbackend
- Node.js Version: 18.20.8
- Application Root: /home3/wishhosp/Wishwaveclubbackend
- Startup File: passenger-loader.cjs (but Passenger ignores it)
- Package.json has: "type": "module"

REQUEST:
Please help me configure Passenger to work with ES modules, or provide an alternative Node.js handler that supports ES modules. This is blocking my deployment.

Thank you for your assistance.
```

## Alternative: Try PM2 or Different Process Manager

If hosting support can't fix Passenger, ask them:
- Can I use PM2 instead of Passenger?
- Is there a different Node.js handler available?
- Can you enable ES module support in Passenger?

## Last Resort: Convert to CommonJS (NOT RECOMMENDED)

This would require changing ALL files from import/export to require/module.exports - too much work and not recommended.

## What Hosting Support Needs to Do

1. **Configure Passenger** to support ES modules
2. **Or provide alternative** Node.js handler (PM2, systemd, etc.)
3. **Or enable** a Passenger setting that allows ES modules

This is a server-level configuration issue that only they can fix.

