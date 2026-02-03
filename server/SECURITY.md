# 🔐 ระบบป้องกันความปลอดภัย (Security System)

## ✅ ระบบป้องกันที่ติดตั้งแล้ว

### 1. **Rate Limiting** - ป้องกัน DDoS และ Brute Force
```javascript
// API Rate Limiter (ทุก endpoints)
- 100 requests ต่อ 15 นาที ต่อ IP

// Authentication Rate Limiter
- 5 login/register attempts ต่อ 15 นาที
- ไม่นับ successful requests

// Transaction Rate Limiter
- 10 transactions ต่อนาที

// Redemption Rate Limiter
- 3 redemptions ต่อนาที
```

**ไฟล์**: `middleware/rateLimiter.js`

### 2. **Input Validation** - ป้องกัน Invalid Data
```javascript
// Email Validation
- ต้องเป็น email format ที่ถูกต้อง
- Normalize email (lowercase)

// Password Validation
- ขั้นต่ำ 6 ตัวอักษร

// Name Validation
- 2-100 ตัวอักษร
- Trim whitespace

// Phone Validation
- ต้องเป็นตัวเลข 10 หลัก

// Amount Validation
- ต้องเป็นตัวเลขบวก
- มีขีดจำกัดสูงสุด
```

**ไฟล์**: `middleware/validator.js`

### 3. **Security Headers** - ป้องกัน Common Attacks
```javascript
// Helmet.js Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy
```

**ไฟล์**: `server.js` (helmet middleware)

### 4. **Input Sanitization** - ป้องกัน XSS
```javascript
// ลบ patterns อันตราย:
- <script> tags
- javascript: protocol
- on* event handlers (onclick, onerror, etc.)
```

**ไฟล์**: `middleware/security.js`

### 5. **Suspicious Activity Detection** - ตรวจจับการโจมตี
```javascript
// ตรวจจับ patterns:
- SQL Injection (OR, AND, =)
- XSS (<script>)
- Path Traversal (../)
- Code Execution (exec, eval)
```

**ไฟล์**: `middleware/security.js`

### 6. **Parameter Pollution Prevention**
```javascript
// ป้องกัน:
- Array parameters มากกว่า 10 items
- Duplicate parameters
```

**ไฟล์**: `middleware/security.js`

### 7. **Content-Type Checking**
```javascript
// ตรวจสอบ:
- POST/PUT/PATCH ต้องเป็น application/json
- Reject requests ที่ไม่ใช่ JSON
```

**ไฟล์**: `middleware/security.js`

### 8. **Body Size Limiting**
```javascript
// จำกัดขนาด:
- Request body ไม่เกิน 1MB
- ป้องกัน memory overflow
```

**ไฟล์**: `middleware/security.js`

### 9. **Password Security**
```javascript
// bcrypt Hashing
- Salt rounds: 10
- One-way encryption
- Secure password storage
```

**ไฟล์**: `routes/auth.js`

### 10. **JWT Authentication**
```javascript
// Token Security:
- Secret key: 256-bit
- Expiration: configurable
- Bearer token format
- Token verification on protected routes
```

**ไฟล์**: `middleware/auth.js`

### 11. **Request Logging**
```javascript
// Morgan Logger
- Log all requests
- Combined format
- IP, method, path, status, response time
```

**ไฟล์**: `server.js`

## 📊 Protected Endpoints

### Authentication (Rate Limited: 5/15min)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/line-login

### Transactions (Rate Limited: 10/min)
- POST /api/wallet/topup
- POST /api/wallet/payment

### Redemptions (Rate Limited: 3/min)
- POST /api/rewards/redeem

### All API Routes (Rate Limited: 100/15min)
- /api/*

## 🛡️ Security Layers

```
Request Flow:
1. Helmet (Security Headers)
2. Morgan (Logging)
3. CORS
4. Body Size Check (1MB limit)
5. Content-Type Check (JSON only)
6. Input Sanitization (XSS prevention)
7. Suspicious Activity Detection
8. Parameter Pollution Check
9. Rate Limiting
10. Input Validation
11. JWT Authentication (protected routes)
12. Business Logic
```

## 🔒 Best Practices Implemented

### ✅ OWASP Top 10 Protection
1. **Injection** - Input validation & sanitization
2. **Broken Authentication** - JWT + bcrypt + rate limiting
3. **Sensitive Data Exposure** - Password hashing, no sensitive data in logs
4. **XML External Entities** - N/A (JSON only)
5. **Broken Access Control** - JWT authentication middleware
6. **Security Misconfiguration** - Helmet headers, secure defaults
7. **XSS** - Input sanitization, CSP headers
8. **Insecure Deserialization** - JSON parsing with size limits
9. **Using Components with Known Vulnerabilities** - Updated dependencies
10. **Insufficient Logging & Monitoring** - Morgan request logging

### ✅ Additional Security
- CORS configuration
- No SQL injection (using JSON database)
- Rate limiting on sensitive endpoints
- Request body size limiting
- Content-Type enforcement
- Parameter pollution prevention
- Suspicious pattern detection

## 📝 Error Handling

### Safe Error Messages
```javascript
// ❌ Don't expose:
- Stack traces
- Database structure
- Internal paths
- Sensitive data

// ✅ Do return:
- Generic error messages
- HTTP status codes
- User-friendly descriptions
```

## 🧪 Testing Security

### Test Rate Limiting
```bash
# Test auth rate limiter (should block after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Test Input Validation
```bash
# Test invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"123456","name":"Test"}'

# Test short password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123","name":"Test"}'
```

### Test XSS Protection
```bash
# Test script injection
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"<script>alert(1)</script>"}'
```

## 📦 Security Dependencies

```json
{
  "express-rate-limit": "^7.1.5",  // Rate limiting
  "helmet": "^7.1.0",               // Security headers
  "express-validator": "^7.0.1",   // Input validation
  "morgan": "^1.10.0",              // Request logging
  "bcrypt": "^5.1.1",               // Password hashing
  "jsonwebtoken": "^9.0.2"          // JWT authentication
}
```

## ✅ Security Checklist

- ✅ Rate limiting on all endpoints
- ✅ Input validation on all user inputs
- ✅ XSS protection
- ✅ SQL injection prevention (JSON DB)
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Security headers (Helmet)
- ✅ Request logging
- ✅ CORS configuration
- ✅ Body size limiting
- ✅ Content-Type checking
- ✅ Suspicious activity detection
- ✅ Parameter pollution prevention
- ✅ Safe error messages
- ✅ HTTPS ready (production)

## 🚀 Production Recommendations

### Additional Security for Production:
1. Enable HTTPS/TLS
2. Use environment variables for secrets
3. Implement refresh tokens
4. Add IP whitelisting for admin routes
5. Set up monitoring & alerts
6. Regular security audits
7. Keep dependencies updated
8. Implement CSRF protection
9. Add API key authentication for external services
10. Set up WAF (Web Application Firewall)

---

**Status**: ✅ Security System Complete  
**Last Updated**: Feb 2, 2026  
**Security Level**: Production Ready
