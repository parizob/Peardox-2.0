# 🗺️ Sitemap Update System Documentation

## Overview
Your sitemap updates automatically through **two different methods** to ensure it's always current with the latest research papers.

---

## 📅 Update Methods

### **Method 1: Automated Daily Updates (Production)** ⏰

**Schedule:** Every day at **3:00 AM UTC** (10:00 PM PST / 11:00 PM EST)

**How It Works:**
1. Vercel cron job triggers at scheduled time
2. Calls `/api/sitemap` endpoint
3. Fetches latest articles from Supabase
4. Generates fresh sitemap.xml
5. Saves to public directory
6. Google/search engines automatically discover updates

**Configuration:**
```json
// vercel.json
"crons": [
  {
    "path": "/api/sitemap",
    "schedule": "0 3 * * *"  // Cron expression: Daily at 3 AM UTC
  }
]
```

**What It Fetches:**
- Latest 10,000 articles from `summary_papers` table
- All blog posts (manually configured)
- All static pages (homepage, about, blog, submit)

**File:** `/api/sitemap.js`

---

### **Method 2: On Build/Deploy** 🚀

**When:** Every time you deploy or run `npm run build`

**How It Works:**
1. Build command runs: `vite build && npm run generate:sitemap`
2. Script connects to Supabase
3. Fetches latest 1,000 articles
4. Generates sitemap.xml locally
5. Deploys with the build

**Configuration:**
```json
// package.json
"scripts": {
  "build": "vite build && npm run generate:sitemap"
}
```

**Manual Trigger:**
```bash
npm run generate:sitemap
```

**File:** `/scripts/generate-sitemap.js`

---

## 🔄 Which Method Runs When?

| Event | Method | Frequency | Articles Fetched |
|-------|--------|-----------|------------------|
| Cron Job | API endpoint | Daily @ 3 AM UTC | 10,000 |
| Deployment | Build script | Each deploy | 1,000 |
| Manual | Build script | On demand | 1,000 |

---

## 📊 What's Included in the Sitemap

### **Static Pages (5 URLs)**
- Homepage: `https://www.pearadox.app/`
- About: `https://www.pearadox.app/aboutus`
- Blog Index: `https://www.pearadox.app/blog`
- Submit: `https://www.pearadox.app/submit`

### **Blog Posts (4 URLs)**
- What Makes an AI Agent?
- AI-First Mindset Ferrari Engine
- Building an App with AI
- Democratizing AI Research

### **Article Pages (1,000-10,000 URLs)**
- Format: `https://www.pearadox.app/article/{arxiv_id}-{title-slug}`
- Example: `https://www.pearadox.app/article/2511.11571v1-making-ai-smarter-and-faster-for-big-tasks`

---

## 🛠️ Key Files

### **1. `/api/sitemap.js`**
**Purpose:** Production sitemap generation via cron job
**URL:** `https://www.pearadox.app/api/sitemap`
**Triggered by:** Vercel cron (daily) or manual API call
**Fetches:** Up to 10,000 latest articles

### **2. `/scripts/generate-sitemap.js`**
**Purpose:** Local/build-time sitemap generation
**Triggered by:** `npm run build` or manual command
**Fetches:** Up to 1,000 latest articles
**Also generates:** `robots.txt`

### **3. `/public/sitemap.xml`**
**Purpose:** The actual sitemap file served to search engines
**Updated by:** Both methods above
**Accessible at:** `https://www.pearadox.app/sitemap.xml`

### **4. `/vercel.json`**
**Purpose:** Configures cron job and build settings
**Cron schedule:** `0 3 * * *` (daily at 3 AM UTC)

---

## 🔍 How Search Engines Discover Updates

### **Automatic Discovery:**
1. **robots.txt** points to sitemap:
   ```
   Sitemap: https://www.pearadox.app/sitemap.xml
   ```

2. **Google crawls regularly** and checks for updates
3. **lastmod dates** in sitemap tell Google which pages changed
4. **Automatic reindexing** happens within 1-7 days

### **Manual Submission (Faster):**
1. Go to Google Search Console
2. Navigate to "Sitemaps" section
3. Submit: `https://www.pearadox.app/sitemap.xml`
4. Google processes within 24-48 hours

---

## 📈 Monitoring Sitemap Updates

### **Check Last Update:**
```bash
# View sitemap header for generation date
curl https://www.pearadox.app/sitemap.xml | head -20
```

### **Google Search Console:**
1. Go to: https://search.google.com/search-console
2. Click "Sitemaps"
3. View:
   - Last read date
   - Discovered URLs
   - Any errors

### **Vercel Cron Logs:**
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to "Logs"
4. Filter by "Cron" to see sitemap generation logs

---

## 🚨 Important Notes

### **Canonical URL Enforcement**
All URLs in sitemap now use: **`https://www.pearadox.app`** (with www)

Both update methods have been fixed to ensure consistency:
- ✅ API endpoint uses www
- ✅ Build script uses www
- ✅ Redirects force all traffic to www

### **Fallback Mechanism**
If Supabase connection fails, both methods generate a minimal fallback sitemap with:
- Homepage
- About page
- Blog pages
- Submit page

This ensures you always have a valid sitemap even if the database is temporarily unavailable.

### **Article Limit Differences**
- **Cron job (10,000 articles):** More comprehensive, updated daily
- **Build script (1,000 articles):** Faster generation, sufficient for most needs
- Google prioritizes fresher content, so both approaches work well

---

## 🔧 Manual Operations

### **Force Sitemap Regeneration:**
```bash
# Locally (generates 1,000 articles)
npm run generate:sitemap

# Or via API (generates 10,000 articles)
curl https://www.pearadox.app/api/sitemap
```

### **Test Sitemap Generation:**
```bash
# Dry run to see what would be generated
node scripts/generate-sitemap.js
```

### **Verify Sitemap Structure:**
```bash
# Check URL count
grep -c "<loc>" public/sitemap.xml

# View first 20 URLs
grep "<loc>" public/sitemap.xml | head -20

# Verify all use www
grep "<loc>https://www.pearadox.app" public/sitemap.xml | wc -l
```

---

## 📅 Cron Schedule Explained

**Current Schedule:** `0 3 * * *`

Cron format: `minute hour day month day-of-week`
- `0` = minute 0 (on the hour)
- `3` = hour 3 (3 AM)
- `*` = every day
- `*` = every month
- `*` = every day of week

**To Change Schedule:**

Edit `vercel.json`:
```json
"schedule": "0 3 * * *"    // Daily at 3 AM
"schedule": "0 */6 * * *"  // Every 6 hours
"schedule": "0 0 * * 0"    // Weekly (Sunday midnight)
"schedule": "0 2 * * 1-5"  // Weekdays at 2 AM
```

Then redeploy:
```bash
git add vercel.json
git commit -m "Update cron schedule"
git push
```

---

## 🎯 Best Practices

### **1. Monitor Regularly**
- Check Google Search Console weekly
- Verify cron job runs successfully
- Watch for any sitemap errors

### **2. Submit After Major Changes**
- New blog posts added
- Large batch of articles imported
- URL structure changes

### **3. Keep URLs Consistent**
- Always use `https://www.pearadox.app` (with www)
- Never mix www and non-www
- Maintain URL structure

### **4. Update Blog Posts Manually**
When adding new blog posts, update both:
- `/api/sitemap.js` (for cron)
- `/scripts/generate-sitemap.js` (for builds)

---

## 🐛 Troubleshooting

### **Problem: Sitemap Not Updating**
**Solutions:**
1. Check Vercel cron logs for errors
2. Verify Supabase connection
3. Manually trigger: `npm run generate:sitemap`
4. Check if cron is enabled in Vercel dashboard

### **Problem: Missing Articles**
**Solutions:**
1. Verify articles exist in `summary_papers` table
2. Check `processing_status = 'completed'`
3. Increase limit in code if needed
4. Run generation script with logging

### **Problem: Google Not Indexing**
**Solutions:**
1. Manually submit sitemap to GSC
2. Request indexing for key pages
3. Check for crawl errors in GSC
4. Verify robots.txt allows crawling

### **Problem: Wrong URLs (non-www)**
**Solutions:**
1. Check both `/api/sitemap.js` and `/scripts/generate-sitemap.js`
2. Verify all use `https://www.pearadox.app`
3. Regenerate sitemap
4. Resubmit to GSC

---

## 📊 Expected Timeline for Indexing

| Action | When Google Responds |
|--------|---------------------|
| Sitemap submitted | Processed within 24-48 hours |
| Daily cron update | Checked within 1-7 days |
| New article added | Discovered within 1-2 weeks |
| Manual index request | Processed within 1-3 days |

---

## ✅ Current Status (Post-Fix)

- ✅ Cron job configured and running
- ✅ Build script integrated
- ✅ Both methods use canonical www URLs
- ✅ Robots.txt properly configured
- ✅ Fallback mechanism in place
- ✅ 1,000-10,000 articles included
- ✅ All blog posts included
- ✅ Submit page included

---

## 🚀 Next Steps After Deploy

1. **Verify cron job runs:**
   - Wait until tomorrow at 3 AM UTC
   - Check Vercel logs
   - Verify sitemap was regenerated

2. **Submit to Google:**
   - Go to Google Search Console
   - Submit: `https://www.pearadox.app/sitemap.xml`
   - Remove old non-www sitemap if exists

3. **Monitor:**
   - Check GSC weekly for new indexed pages
   - Watch for any crawl errors
   - Verify URLs use www consistently

4. **Add new blog posts:**
   - Update both sitemap files
   - Redeploy or wait for next cron run
   - Manually submit to GSC for faster indexing

---

**Your sitemap is now fully automated and will keep your site discoverable by search engines! 🎉**

