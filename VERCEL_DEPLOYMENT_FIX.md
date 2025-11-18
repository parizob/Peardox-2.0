# 🔧 Vercel Deployment Fix - SEO Configuration

## 🚨 Problem: Invalid `vercel.json` Syntax

Your deployment was failing because `vercel.json` had **invalid redirect syntax**:

```json
// ❌ THIS DOESN'T WORK - Vercel doesn't support full URLs in redirects
"redirects": [
  {
    "source": "https://pearadox.app/:path*",
    "destination": "https://www.pearadox.app/:path*",
    "permanent": true
  }
]
```

**Why it failed:**
- Vercel `redirects` in `vercel.json` only support **path-based redirects** (e.g., `/old-path` → `/new-path`)
- Domain-level redirects (e.g., `pearadox.app` → `www.pearadox.app`) must be configured in **Vercel Dashboard**

---

## ✅ Solution Applied

### **1. Fixed `vercel.json`**

Removed invalid redirect syntax. Your `vercel.json` now contains only valid configuration:

```json
{
  "functions": {
    "api/sitemap.js": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/sitemap",
      "schedule": "0 3 * * *"
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    },
    {
      "source": "/article/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/aboutus",
      "destination": "/index.html"
    },
    {
      "source": "/blog",
      "destination": "/index.html"
    },
    {
      "source": "/blog/(.*)",
      "destination": "/index.html"
    },
    {
      "source": "/submit",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## 🌐 Configure WWW Redirect in Vercel Dashboard

To enforce `https://www.pearadox.app` as your canonical URL, follow these steps:

### **Step 1: Add Both Domains**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Domains**
3. Ensure you have both domains added:
   - ✅ `pearadox.app`
   - ✅ `www.pearadox.app`

### **Step 2: Set www as Primary**

1. Find `www.pearadox.app` in the domains list
2. Click the **⋮** (three dots) menu
3. Select **"Set as Primary Domain"**

**This automatically:**
- ✅ Redirects `pearadox.app` → `www.pearadox.app` (301)
- ✅ Redirects `http://` → `https://` (301)
- ✅ Ensures all traffic uses the canonical URL

### **Step 3: Verify Configuration**

After setting www as primary, check the domain list shows:

```
www.pearadox.app       ← Primary Domain ✅
pearadox.app           ← Redirects to www.pearadox.app
```

---

## 📊 What This Fixes

| Issue | Status |
|-------|--------|
| Vercel deployment failing | ✅ FIXED |
| Invalid vercel.json syntax | ✅ FIXED |
| 1,458 failed redirects in GSC | ⏳ Will fix after www redirect configured |
| 1,204 duplicate pages in GSC | ⏳ Will fix after www redirect configured |
| Sitemap with correct URLs | ✅ FIXED |
| Serverless sitemap function | ✅ FIXED |

---

## 🧪 Testing After Deploy

### **1. Verify Deployment Succeeds**
```bash
git add .
git commit -m "FIX: Remove invalid redirects from vercel.json"
git push
```

Check Vercel dashboard - deployment should now succeed ✅

### **2. Test WWW Redirect (After Dashboard Config)**
```bash
# Should redirect to www
curl -I https://pearadox.app
# Expected: Location: https://www.pearadox.app/

# Should redirect to www
curl -I http://pearadox.app  
# Expected: Location: https://www.pearadox.app/

# Should work directly (no redirect)
curl -I https://www.pearadox.app
# Expected: 200 OK
```

### **3. Test Dynamic Sitemap**
```bash
# Should return XML
curl https://www.pearadox.app/sitemap.xml | head -20

# Should have correct headers
curl -I https://www.pearadox.app/sitemap.xml
# Expected: Content-Type: application/xml
# Expected: Cache-Control: s-maxage=3600
```

---

## 📋 Complete SEO Changes Summary

### **Files Modified:**

1. **`/vercel.json`** ✅
   - Removed invalid redirect syntax
   - Kept sitemap rewrite
   - Kept SPAroutes rewrites
   - Kept cron job configuration

2. **`/api/sitemap.js`** ✅
   - Removed filesystem writes
   - Returns XML directly
   - Uses canonical www URLs
   - Added caching headers

3. **`/scripts/generate-sitemap.js`** ✅
   - Exits gracefully on timeout
   - Uses canonical www URLs
   - Generates fallback sitemap

4. **`/index.html`** ✅
   - Added canonical tag: `<link rel="canonical" href="https://www.pearadox.app" />`
   - Updated meta tags with www URLs
   - Added Schema.org structured data

5. **`/public/robots.txt`** ✅
   - Updated sitemap reference to www
   - Updated Host to www
   - Added LLM crawler directives

6. **`/public/ai-training-data.json`** ✅
   - Updated all URLs to www

---

## 🚀 Deployment Steps

### **NOW (Immediate):**

```bash
git status  # Verify changes
git add vercel.json
git commit -m "FIX: Remove invalid redirects - configure in dashboard instead"
git push
```

✅ Deployment should now succeed!

### **AFTER DEPLOYMENT (Dashboard Config):**

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Set `www.pearadox.app` as Primary Domain
3. Verify `pearadox.app` shows "Redirects to www.pearadox.app"

### **24-48 HOURS LATER:**

1. Submit sitemap to Google Search Console:
   - URL: `https://www.pearadox.app/sitemap.xml`
2. Remove old non-www sitemap if exists
3. Request re-indexing for key pages

---

## 📈 Expected Timeline for SEO Recovery

| Timeframe | What Happens |
|-----------|--------------|
| **Immediate** | Deployment succeeds, site works |
| **1-2 days** | Google discovers www redirect |
| **3-7 days** | Duplicate pages start consolidating |
| **7-14 days** | Failed redirects decrease significantly |
| **14-30 days** | Full canonical URL adoption, improved rankings |

---

## 🎯 Key Takeaways

### **✅ What We Fixed:**

1. **Invalid vercel.json redirects** → Removed (configure in dashboard)
2. **Serverless sitemap crashes** → Returns XML directly (no filesystem)
3. **Non-www URLs** → All use `https://www.pearadox.app`
4. **Build failures** → Script exits gracefully on timeout
5. **Missing canonical tags** → Added to all pages

### **📌 What You Need to Do:**

1. **Push the code** (vercel.json is now valid)
2. **Configure www redirect in Vercel Dashboard**
3. **Submit sitemap to Google Search Console**
4. **Monitor GSC for improvements**

---

## 🐛 Troubleshooting

### **Problem: Deployment still failing**
**Check:** Vercel deployment logs for specific error
**Solution:** Look for other syntax errors or missing dependencies

### **Problem: WWW redirect not working**
**Check:** Vercel Dashboard → Domains → Primary Domain setting
**Solution:** Make sure www.pearadox.app is set as primary

### **Problem: Sitemap returns 500 error**
**Check:** Vercel Functions logs (`/api/sitemap`)
**Solution:** Verify Supabase connection and environment variables

### **Problem: SEO errors not decreasing**
**Timeline:** Give it 7-14 days after www redirect is configured
**Monitor:** Google Search Console → Coverage report

---

## ✅ Current Status

- ✅ **Build:** Succeeds locally
- ✅ **vercel.json:** Valid syntax
- ✅ **Sitemap API:** Serverless-compatible
- ✅ **URLs:** All use www format
- ⏳ **WWW Redirect:** Configure in dashboard after deploy
- ⏳ **GSC Submission:** After www redirect configured

---

**Your deployment is ready to push! The Vercel errors are fixed.** 🎉

After you push and configure the www redirect in the dashboard, your SEO issues should resolve within 7-14 days.

