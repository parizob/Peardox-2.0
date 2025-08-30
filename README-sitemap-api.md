# Sitemap API Route Documentation

## Overview

The `/api/sitemap` route automatically generates and updates the `sitemap.xml` file for your Pearadox application. This route is designed to work with Vercel cron jobs for automated daily updates.

## Features

- ✅ **Automated Generation**: Fetches latest articles from Supabase
- ✅ **SEO-Friendly URLs**: Creates clean article URLs with titles
- ✅ **Fallback Support**: Uses v_arxiv_papers if summaries unavailable
- ✅ **Performance Optimized**: Limits to 1000 most recent articles
- ✅ **Vercel Cron Compatible**: Scheduled daily updates at 3 AM UTC
- ✅ **Error Handling**: Comprehensive logging and error responses

## Files Created

1. **`pages/api/sitemap.js`** - Main API route handler
2. **`vercel.json`** - Vercel configuration with cron job
3. **`scripts/test-sitemap-api.js`** - Local testing script

## Usage

### Manual Generation
```bash
# Test locally
node scripts/test-sitemap-api.js

# Or make HTTP request
curl https://yourdomain.com/api/sitemap
```

### Automated Generation (Vercel)
The cron job runs automatically every day at 3 AM UTC:
```json
{
  "crons": [{
    "path": "/api/sitemap",
    "schedule": "0 3 * * *"
  }]
}
```

## API Response

### Success Response (200)
```json
{
  "success": true,
  "message": "Sitemap updated successfully ✅",
  "stats": {
    "totalUrls": 1003,
    "articleUrls": 1000,
    "staticUrls": 3,
    "generatedAt": "2025-08-30T02:16:59.672Z"
  }
}
```

### Error Response (500)
```json
{
  "success": false,
  "error": "Failed to fetch summaries",
  "details": "Database connection error"
}
```

## Generated Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>https://pearadox.app/</loc>
    <lastmod>2025-08-30T02:16:59.665Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Dynamic article pages -->
  <url>
    <loc>https://pearadox.app/article/2508.20325v1-testing-ai-rules</loc>
    <lastmod>2024-08-25T12:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## URL Generation Logic

Articles URLs are generated using this pattern:
```
/article/{arxiv_id}-{seo-friendly-title}
```

For example:
- arXiv ID: `2508.20325v1`
- Title: "Testing AI to Make Sure It Follows the Rules"
- Generated URL: `/article/2508.20325v1-testing-ai-to-make-sure-it-follows-the-rules`

## Environment Variables

The API route uses these environment variables (with fallbacks):
```bash
VITE_SUPABASE_URL=https://ullqyuvcyvaaiihmntnw.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Deployment

1. **Push to Vercel**: The `vercel.json` configuration will automatically set up the cron job
2. **Verify Cron**: Check Vercel dashboard → Functions → Crons
3. **Test Manually**: Visit `https://yourdomain.com/api/sitemap` to test

## Monitoring

- **Vercel Logs**: Check function logs in Vercel dashboard
- **Sitemap Size**: Monitor `/public/sitemap.xml` file size
- **Google Search Console**: Submit sitemap URL for indexing

## Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check Supabase credentials in environment variables
   - Ensure the key hasn't expired

2. **"Column does not exist"**
   - Verify database table structure matches the query
   - Check if tables have been modified

3. **Cron job not running**
   - Verify `vercel.json` syntax
   - Check Vercel dashboard for cron job status
   - Ensure project is deployed to Vercel

### Debug Commands

```bash
# Test API route locally
node scripts/test-sitemap-api.js

# Check generated sitemap
head -20 public/sitemap.xml

# Verify file size
ls -la public/sitemap.xml
```

## Performance Notes

- **Article Limit**: Currently set to 1000 articles for performance
- **Execution Time**: Typically completes in 5-10 seconds
- **File Size**: Generated sitemap is ~233KB for 1000 articles
- **Vercel Timeout**: Set to 30 seconds maximum

## Future Enhancements

- [ ] Multiple sitemap files for 50,000+ articles
- [ ] Sitemap index file generation
- [ ] Delta updates (only changed articles)
- [ ] Compression support (gzip)
- [ ] Webhook integration for real-time updates
