# Pearadox SEO Implementation

This document outlines the SEO implementation for the Pearadox application, including article URL structure, sitemap generation, and static optimization.

## 🔗 Article URL Structure

### New URL Format
Articles now use SEO-friendly URLs that include both the arXiv ID and title:
```
https://pearadox.app/article/2412.12345-breakthrough-ai-research-paper
https://pearadox.app/article/2411.09876-quantum-machine-learning-advances
```

### Implementation Details
- **URL Generation**: `generateSlug(title, arxivId)` creates clean, readable URLs
- **Character Limit**: Titles are truncated to 60 characters for optimal URL length
- **Special Characters**: Removed and replaced with hyphens for URL safety
- **Modal Integration**: URLs update when articles are opened in modals
- **History Management**: Proper browser history integration with `pushState`

## 🗺️ Sitemap Generation

### Production Sitemap (`scripts/generate-sitemap-production.js`)
- **Database Integration**: Connects to Supabase to fetch real article data
- **Featured Articles**: Main sitemap includes 500 most recent articles
- **Scalable Architecture**: Supports chunked sitemaps for 50,000+ articles
- **Google News Format**: Enhanced with news sitemap tags for better indexing
- **Automatic Generation**: Runs during build process

### Development Sitemap (`scripts/generate-sitemap.js`)
- **Mock Data**: Works without database connection for development
- **Testing**: Allows sitemap testing without production data
- **Fallback**: Provides basic sitemap structure

### Sitemap Features
- **Main Pages**: Homepage, About, Blog included
- **Article Pages**: All articles with proper metadata
- **Last Modified**: Accurate lastmod dates from database
- **Priority**: SEO-optimized priority values
- **Change Frequency**: Appropriate update frequencies
- **Chunked Sitemaps**: Automatically scales to multiple files

### Generated Files
```
public/sitemap.xml              # Main sitemap (500 featured articles)
public/sitemap-1.xml            # Chunk 1 (articles 1-1000)
public/sitemap-2.xml            # Chunk 2 (articles 1001-2000)
public/sitemap-index.xml        # Sitemap index (when needed)
public/robots.txt               # Search engine instructions
```

## ⚡ Performance & Static Generation

### Vite SEO Plugin (`vite-plugins/seo-prerender.js`)
- **Build Integration**: Runs during Vite build process
- **Meta Tag Generation**: Adds essential SEO meta tags
- **Structured Data**: Generates Schema.org JSON-LD
- **File Optimization**: Optimizes built files for SEO

### Build Process
```bash
npm run build                   # Builds app + generates sitemap
npm run generate:sitemap        # Production sitemap generation
npm run generate:sitemap:dev    # Development sitemap testing
```

### Optimization Features
- **Code Splitting**: Vendor, Supabase, and icons chunked separately
- **Manual Chunks**: Optimized loading for better performance
- **Build Time**: Embedded for cache busting
- **Asset Optimization**: Optimized CSS and JS bundling

## 📊 SEO Metadata

### Page-Level SEO
Every article page includes:
- **Title Tags**: Optimized with article title + brand
- **Meta Descriptions**: Clean, truncated summaries
- **Canonical URLs**: Prevents duplicate content issues
- **Open Graph**: Social media optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Schema.org**: Rich snippets for search engines

### Academic SEO
Research-specific metadata:
- **Citation Metadata**: Academic citation format
- **Author Information**: Structured author data
- **Publication Dates**: Proper date formatting
- **arXiv Integration**: Direct arXiv linking
- **Category Classification**: Subject area metadata

## 🤖 Robots.txt

Search engine guidance:
```
User-agent: *
Allow: /

Sitemap: https://pearadox.app/sitemap.xml
Sitemap: https://pearadox.app/sitemap-index.xml

Allow: /article/
Disallow: /admin/
Crawl-delay: 1
```

## 🔧 Implementation Commands

### Development
```bash
npm run dev                     # Start development server
npm run generate:sitemap:dev    # Test sitemap generation
```

### Production Build
```bash
npm run build                   # Build + generate production sitemap
npm run preview                 # Preview production build
```

### Manual Sitemap Generation
```bash
npm run generate:sitemap        # Generate production sitemap
```

## 📈 SEO Best Practices Implemented

### Technical SEO
- ✅ Clean, descriptive URLs
- ✅ Proper canonical URLs
- ✅ XML sitemaps with proper structure
- ✅ Robots.txt optimization
- ✅ Meta robots tags
- ✅ Structured data (Schema.org)

### Content SEO
- ✅ Optimized title tags (under 60 chars)
- ✅ Meta descriptions (under 160 chars)
- ✅ Header structure (H1, H2, H3)
- ✅ Academic citation metadata
- ✅ Author and publication information

### Performance SEO
- ✅ Code splitting for faster loading
- ✅ Optimized asset bundling
- ✅ Proper caching headers
- ✅ Mobile-friendly responsive design

### Social SEO
- ✅ Open Graph meta tags
- ✅ Twitter Card metadata
- ✅ Social sharing optimization
- ✅ Article-specific social previews

## 🚀 Deployment Notes

### Environment Variables
For production sitemap generation, ensure these are set:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Build Process
1. **Vite Build**: Compiles React app
2. **Sitemap Generation**: Fetches articles and generates sitemaps
3. **SEO Plugin**: Adds meta tags and structured data
4. **File Optimization**: Optimizes assets and copies files

### Scaling Considerations
- **50K+ Articles**: Automatically splits into chunked sitemaps
- **Database Performance**: Optimized queries for large datasets
- **Build Time**: Efficient generation even with large article counts
- **CDN Ready**: All files optimized for CDN distribution

## 📝 File Structure

```
scripts/
├── generate-sitemap.js              # Development sitemap generator
└── generate-sitemap-production.js   # Production sitemap generator

vite-plugins/
└── seo-prerender.js                 # Vite SEO optimization plugin

public/
├── sitemap.xml                      # Main sitemap
├── robots.txt                       # Search engine instructions
└── structured-data/                 # Generated structured data

src/
├── App.jsx                          # Updated with URL handling
└── components/
    └── ArticleModal.jsx             # Updated with new sharing URLs
```

This implementation provides a robust, scalable SEO foundation that will grow with your article database while maintaining excellent search engine visibility.
