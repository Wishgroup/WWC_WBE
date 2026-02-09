# Quick Diagnostic - Copy These Commands

## If You Have SSH/Terminal Access

Run these commands and share the output:

```bash
# Check if app process is running
ps aux | grep node | grep Wishwaveclubbackend

# Check if port 3001 is listening
netstat -tuln | grep 3001

# Check recent logs
tail -50 ~/logs/passenger.log

# Check if files exist
ls -la ~/Wishwaveclubbackend/passenger-loader.cjs
ls -la ~/Wishwaveclubbackend/server.js
ls -la ~/Wishwaveclubbackend/routes/events.js

# Check environment variables are loaded
cd ~/Wishwaveclubbackend
echo $PORT
echo $NODE_ENV
echo $DB_HOST
```

## If No SSH - Use cPanel

1. **Check logs** - Copy last 20-30 lines
2. **Check app status** - What does it show?
3. **Check startup file** - What does it say exactly?
4. **Test /api/health** - What error do you get?

## Most Likely Remaining Issues

1. **App crashed after starting** - Check logs for crash reason
2. **Port conflict** - Another app using 3001
3. **Database connection failed** - App starts but crashes on DB connect
4. **Passenger configuration issue** - Need hosting support help
5. **.htaccess proxy not working** - Frontend can't reach backend

## Share This Info

1. Latest error from logs
2. App status (Running/Stopped)
3. Startup file value
4. /api/health response

Then I can fix it!

