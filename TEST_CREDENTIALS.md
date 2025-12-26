# Test Credentials

Use these credentials to test the authentication system and different user roles.

## 🔐 All Test Users Password

**Password for all test users:** `test123`

---

## 👤 MEMBER ACCOUNTS

### Member 1
- **Email:** `member1@test.com`
- **Password:** `test123`
- **Name:** John Member
- **Membership Type:** Annual
- **Dashboard:** `/member/dashboard`

### Member 2
- **Email:** `member2@test.com`
- **Password:** `test123`
- **Name:** Sarah Member
- **Membership Type:** Lifetime
- **Dashboard:** `/member/dashboard`

---

## 🏪 VENDOR ACCOUNTS

### Vendor 1
- **Email:** `vendor1@test.com`
- **Password:** `test123`
- **Name:** Coffee Shop XYZ
- **Vendor Code:** VENDOR_TEST_001
- **Dashboard:** `/vendor/dashboard`

### Vendor 2
- **Email:** `vendor2@test.com`
- **Password:** `test123`
- **Name:** Restaurant ABC
- **Vendor Code:** VENDOR_TEST_002
- **Dashboard:** `/vendor/dashboard`

---

## 👨‍💼 ADMIN ACCOUNTS

### Admin
- **Email:** `admin@test.com`
- **Password:** `test123`
- **Name:** Admin User
- **Dashboard:** `/admin/dashboard`

---

## 🧪 Testing Instructions

### 1. Test Member Login
1. Go to `/login`
2. Select "Member" as account type
3. Enter: `member1@test.com` / `test123`
4. You should be redirected to `/member/dashboard`
5. Header should show "Dashboard" and "Logout" buttons
6. "Admin" link should NOT be visible

### 2. Test Vendor Login
1. Go to `/login`
2. Select "Vendor" as account type
3. Enter: `vendor1@test.com` / `test123`
4. You should be redirected to `/vendor/dashboard`
5. Header should show "Dashboard" and "Logout" buttons
6. "Admin" link should NOT be visible

### 3. Test Admin Login
1. Go to `/login`
2. Select "Admin" as account type
3. Enter: `admin@test.com` / `test123`
4. You should be redirected to `/admin/dashboard`
5. Header should show "Admin" link, "Dashboard", and "Logout" buttons

### 4. Test Route Protection
1. While logged in as a member, try to access `/admin/dashboard`
   - Should redirect to `/member/dashboard`
2. While logged in as a vendor, try to access `/admin/dashboard`
   - Should redirect to `/vendor/dashboard`
3. While logged out, try to access any dashboard
   - Should redirect to `/login`

### 5. Test Guest Access
1. Logout (or don't login)
2. You should be able to browse:
   - `/` (Home)
   - `/benefits`
   - `/events`
   - `/join`
3. Header should show "Login" and "Join Now" buttons
4. "Admin" link should NOT be visible

---

## 🔄 Re-seed Test Users

If you need to reset the test users, run:

```bash
cd backend
npm run seed-test-users
```

This will:
- Create test members, vendors, and admins
- Create NFC cards for test members
- Skip users that already exist (won't duplicate)

---

## 📝 Notes

- All test users have the same password: `test123`
- Test users are created with active status
- NFC cards are automatically created for test members
- The script is idempotent - safe to run multiple times

---

**Last Updated:** December 2024


