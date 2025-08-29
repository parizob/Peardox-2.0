import fs from 'fs';
import path from 'path';

/**
 * Vite plugin for SEO pre-rendering and static generation
 * This plugin helps with SEO by generating static HTML files for article pages
 */
export function seoPrerender(options = {}) {
  const {
    routes = [],
    generateSitemap = true,
    baseUrl = 'https://pearadox.app'
  } = options;

  return {
    name: 'seo-prerender',
    apply: 'build',
    
    configResolved(config) {
      // Store config for later use
      this.isProduction = config.command === 'build';
      this.outDir = config.build?.outDir || 'dist';
    },

    // Hook into the build process
    closeBundle() {
      if (!this.isProduction) return;

      console.log('🔍 SEO Pre-rendering starting...');
      
      // Generate meta tags for each route
      this.generateMetaTags();
      
      // Generate structured data
      this.generateStructuredData();
      
      // Update sitemap after build
      if (generateSitemap) {
        this.updateSitemap();
      }
      
      console.log('✅ SEO Pre-rendering completed');
    },

    generateMetaTags() {
      try {
        const indexPath = path.join(this.outDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
          console.warn('⚠️ index.html not found, skipping meta tag generation');
          return;
        }

        let html = fs.readFileSync(indexPath, 'utf8');
        
        // Ensure basic SEO meta tags are present
        if (!html.includes('<meta name="description"')) {
          html = html.replace(
            '<title>',
            `<meta name="description" content="Bite-sized breakdowns of the world's most important AI discoveries. Stay ahead without the jargon.">
    <meta name="keywords" content="AI research, machine learning, artificial intelligence, research papers, arxiv, scientific discoveries">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="author" content="Pearadox">
    <meta property="og:site_name" content="Pearadox">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@pearadox_ai">
    <link rel="canonical" href="${baseUrl}">
    <title>`
          );
        }

        // Add structured data for the main site
        if (!html.includes('application/ld+json')) {
          const structuredData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Pearadox",
            "description": "Bite-sized breakdowns of the world's most important AI discoveries",
            "url": baseUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Pearadox",
              "url": baseUrl
            }
          };

          html = html.replace(
            '</head>',
            `    <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
</head>`
          );
        }

        fs.writeFileSync(indexPath, html, 'utf8');
        console.log('📝 Meta tags updated in index.html');
        
      } catch (error) {
        console.error('❌ Error generating meta tags:', error);
      }
    },

    generateStructuredData() {
      try {
        // Generate organization structured data
        const organizationData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Pearadox",
          "url": baseUrl,
          "description": "Making AI research accessible through bite-sized breakdowns",
          "foundingDate": "2024",
          "sameAs": [
            "https://twitter.com/pearadox_ai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "url": `${baseUrl}/contact`
          }
        };

        // Generate website structured data
        const websiteData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Pearadox",
          "url": baseUrl,
          "description": "Bite-sized breakdowns of the world's most important AI discoveries",
          "inLanguage": "en-US",
          "isAccessibleForFree": true,
          "publisher": {
            "@type": "Organization",
            "name": "Pearadox"
          }
        };

        // Write structured data files
        const structuredDataDir = path.join(this.outDir, 'structured-data');
        if (!fs.existsSync(structuredDataDir)) {
          fs.mkdirSync(structuredDataDir, { recursive: true });
        }

        fs.writeFileSync(
          path.join(structuredDataDir, 'organization.json'),
          JSON.stringify(organizationData, null, 2),
          'utf8'
        );

        fs.writeFileSync(
          path.join(structuredDataDir, 'website.json'),
          JSON.stringify(websiteData, null, 2),
          'utf8'
        );

        console.log('📊 Structured data files generated');
        
      } catch (error) {
        console.error('❌ Error generating structured data:', error);
      }
    },

    updateSitemap() {
      try {
        // Copy sitemap from public to dist if it exists
        const publicSitemapPath = path.join('public', 'sitemap.xml');
        const distSitemapPath = path.join(this.outDir, 'sitemap.xml');
        
        if (fs.existsSync(publicSitemapPath)) {
          fs.copyFileSync(publicSitemapPath, distSitemapPath);
          console.log('📄 Sitemap copied to dist folder');
        }

        // Copy robots.txt
        const publicRobotsPath = path.join('public', 'robots.txt');
        const distRobotsPath = path.join(this.outDir, 'robots.txt');
        
        if (fs.existsSync(publicRobotsPath)) {
          fs.copyFileSync(publicRobotsPath, distRobotsPath);
          console.log('🤖 Robots.txt copied to dist folder');
        }
        
      } catch (error) {
        console.error('❌ Error updating sitemap:', error);
      }
    }
  };
}

export default seoPrerender;
