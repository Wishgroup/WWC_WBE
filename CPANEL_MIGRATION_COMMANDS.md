# cPanel Database Migration Commands

## Option 1: Using cPanel Node.js App Terminal (Recommended)

1. **In cPanel → Node.js App settings:**
   - Look for **"Terminal"** or **"Open Terminal"** button
   - Click it to open a terminal

2. **Run these commands:**
   ```bash
   cd ~/Wishwaveclubbackend
   npm run migrate
   ```

## Option 2: Using cPanel Terminal (If Available)

1. **In cPanel, look for "Terminal"** in the main menu
2. **Open Terminal**
3. **Run:**
   ```bash
   cd ~/Wishwaveclubbackend
   npm run migrate
   ```

## Option 3: Using SSH

1. **Connect via SSH:**
   ```bash
   ssh wishhosp@wishwavesclub.com
   ```

2. **Navigate and run:**
   ```bash
   cd ~/Wishwaveclubbackend
   npm run migrate
   ```

## What the Migration Does

The `npm run migrate` command will:
- ✅ Connect to MySQL database
- ✅ Create database if it doesn't exist
- ✅ Create all required tables
- ✅ Set up indexes
- ✅ Run all migration scripts

## Expected Output

You should see:
```
🔄 Starting MySQL database migration...
📡 Connecting to localhost:3306...
✅ Connected to MySQL server
📦 Creating database 'wishhosp_wwcdb_mem' if it doesn't exist...
✅ Database 'wishhosp_wwcdb_mem' is ready
📋 Loading schema from mysql-schema.sql...
✅ Schema loaded successfully
🚀 Executing migration...
✅ Migration completed successfully!
```

## Troubleshooting

### Error: "Cannot find module"
**Fix:** Make sure you're in the correct directory:
```bash
cd ~/Wishwaveclubbackend
pwd  # Should show: /home3/wishhosp/Wishwaveclubbackend
```

### Error: "Database connection failed"
**Fix:** Verify environment variables are set:
```bash
echo $DB_HOST
echo $DB_NAME
echo $DB_USER
```

If empty, environment variables aren't loaded. Set them in cPanel Node.js app settings.

### Error: "Access denied"
**Fix:** Check database credentials in cPanel → MySQL Databases

### Manual Migration (If npm run migrate fails)

You can also run the script directly:
```bash
cd ~/Wishwaveclubbackend
node scripts/migrate-mysql.js
```

## Verify Migration Success

After migration, test the connection:
```bash
cd ~/Wishwaveclubbackend
npm run check-db
```

Or check tables in phpMyAdmin:
- Go to cPanel → phpMyAdmin
- Select database: `wishhosp_wwcdb_mem`
- Check if tables exist (members, nfc_cards, events, etc.)

## Quick Command Reference

```bash
# Navigate to app directory
cd ~/Wishwaveclubbackend

# Run migration
npm run migrate

# Check database connection
npm run check-db

# Seed test data (optional)
npm run seed
```

