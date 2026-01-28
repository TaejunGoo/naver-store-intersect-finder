# Security Headers Guide

This document explains the security headers configured for this application.

## 📋 Configured Headers

### 1. X-Frame-Options: DENY

**Purpose**: Prevents clickjacking attacks

**What it does**: Blocks the page from being embedded in `<iframe>`, `<frame>`, or `<object>` tags.

**Attack Example (Prevented)**:
```html
<!-- Malicious site trying to trick users -->
<iframe src="https://your-app.vercel.app"></iframe>
```

**Result**: Browser refuses to load the page in iframe ✅

---

### 2. X-Content-Type-Options: nosniff

**Purpose**: Prevents MIME type sniffing

**What it does**: Forces browser to respect the declared Content-Type header.

**Attack Example (Prevented)**:
```html
<!-- Attacker uploads "image.jpg" containing JavaScript -->
<script src="/uploads/image.jpg"></script>
```

**Without header**: Browser might execute it as JavaScript 😱
**With header**: Browser respects Content-Type and refuses execution ✅

---

### 3. Referrer-Policy: strict-origin-when-cross-origin

**Purpose**: Controls referrer information leakage

**What it does**:
- Same-origin requests: Send full URL
- Cross-origin requests: Send only origin (domain)
- HTTPS → HTTP: Send nothing

**Information Protection**:
```
User visits: https://your-app.vercel.app/search?q=secret-keyword
Clicks external link
↓
External site receives: https://your-app.vercel.app (NOT the full URL)
```

---

### 4. Permissions-Policy

**Purpose**: Disables unnecessary browser features

**Configuration**:
```
camera=(), microphone=(), geolocation=()
```

**What it does**: Prevents the page from accessing:
- Camera
- Microphone
- Geolocation

**Why**: Your app doesn't need these features, so block them entirely.

---

### 5. Content-Security-Policy (CSP)

**Purpose**: The ultimate defense against XSS attacks

**Configuration**:
```csp
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' https://shopping-phinf.pstatic.net data: blob:;
font-src 'self' data:;
connect-src 'self' https://va.vercel-scripts.com https://*.vercel-analytics.com https://vercel.live;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

**Breakdown**:

| Directive | Meaning |
|-----------|---------|
| `default-src 'self'` | By default, only load resources from same domain |
| `script-src` | JavaScript sources (Next.js needs `unsafe-eval`/`unsafe-inline`, Vercel Live) |
| `style-src` | CSS sources (Tailwind needs `unsafe-inline`) |
| `img-src` | Images from self + Naver Shopping CDN |
| `font-src` | Fonts from self + data URIs |
| `connect-src` | API calls to self + Vercel Analytics + Vercel Live |
| `frame-ancestors 'none'` | Cannot be embedded in iframes (same as X-Frame-Options) |
| `base-uri 'self'` | Prevent `<base>` tag injection |
| `form-action 'self'` | Forms can only submit to same domain |

**Attack Example (Prevented)**:
```javascript
// Attacker tries to inject malicious script
<script src="https://evil.com/steal-data.js"></script>
```

**Result**: Browser blocks the external script ✅

---

## 🧪 How to Verify

### Method 1: Automated Script (Recommended)

```bash
# Start dev server
npm run dev

# In another terminal, check headers
npm run check:security
```

**Expected Output**:
```
🔒 Security Headers Checker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: http://localhost:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ x-frame-options
   DENY

✅ x-content-type-options
   nosniff

✅ referrer-policy
   strict-origin-when-cross-origin

✅ permissions-policy
   camera=(), microphone=(), geolocation=()

✅ content-security-policy
   default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed: 5
❌ Failed: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 All security headers are properly configured!
```

### Method 2: Browser DevTools

1. Open your app in browser (http://localhost:3000)
2. Press F12 to open DevTools
3. Go to **Network** tab
4. Refresh page
5. Click on the first request (usually the page itself)
6. Go to **Headers** section → **Response Headers**

Look for:
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=()`
- `content-security-policy: default-src 'self'; ...`

### Method 3: Command Line (curl)

```bash
curl -I http://localhost:3000
```

### Method 4: Online Tools

After deploying to Vercel:

1. **Security Headers**: https://securityheaders.com/
2. **Mozilla Observatory**: https://observatory.mozilla.org/

Just enter your Vercel URL and these tools will grade your security headers.

---

## 🚀 Production Verification

After deploying to Vercel:

```bash
npm run check:security:prod
```

Or manually:
```bash
curl -I https://your-app.vercel.app
```

---

## 📊 Security Score

With these headers configured, you should get:

- **Security Headers**: A+ rating
- **Mozilla Observatory**: 90+ score
- Protection against:
  - ✅ Clickjacking
  - ✅ MIME type sniffing
  - ✅ XSS attacks
  - ✅ Information leakage
  - ✅ Unwanted iframe embedding

---

## 🔧 Troubleshooting

### CSP blocking legitimate resources

If you see console errors like:
```
Refused to load script from '...' because it violates CSP directive
```

**Solution**: Add the domain to the appropriate CSP directive in `next.config.ts`

Example:
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-domain.com"
```

### Vercel Analytics not working

Make sure these domains are in `connect-src`:
```typescript
"connect-src 'self' https://va.vercel-scripts.com https://*.vercel-analytics.com"
```

### Vercel Live Feedback not working

If you see errors about `vercel.live` being blocked, add it to both `script-src` and `connect-src`:
```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live"
"connect-src 'self' https://va.vercel-scripts.com https://*.vercel-analytics.com https://vercel.live"
```

### Styles not loading

Tailwind CSS needs `unsafe-inline`:
```typescript
"style-src 'self' 'unsafe-inline'"
```

---

## 📚 Further Reading

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

---

## ✅ Checklist

Before deploying:

- [ ] Run `npm run check:security` locally
- [ ] All 5 headers show ✅
- [ ] App functions normally (no CSP violations)
- [ ] Images from Naver Shopping load correctly
- [ ] Vercel Analytics working (if enabled)

After deploying:

- [ ] Run `npm run check:security:prod`
- [ ] Test on https://securityheaders.com/
- [ ] Check browser console for CSP errors
- [ ] Verify all features work
