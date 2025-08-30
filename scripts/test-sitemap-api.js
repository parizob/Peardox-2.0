/**
 * Test script for the sitemap API route
 * Run with: node scripts/test-sitemap-api.js
 */

const path = require('path');

// Mock Next.js request/response objects
const mockReq = {};
const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log(`✅ Response Status: ${code}`);
      console.log(`📄 Response Data:`, JSON.stringify(data, null, 2));
      return mockRes;
    },
    send: (data) => {
      console.log(`✅ Response Status: ${code}`);
      console.log(`📄 Response Data:`, data);
      return mockRes;
    }
  })
};

async function testSitemapAPI() {
  console.log('🚀 Testing sitemap API route...\n');
  
  try {
    // Import and execute the API handler
    const handler = require('../api/sitemap.js').default;
    await handler(mockReq, mockRes);
    
    console.log('\n✅ Sitemap API test completed successfully!');
    
    // Check if sitemap.xml was created
    const fs = require('fs');
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    
    if (fs.existsSync(sitemapPath)) {
      const sitemapSize = fs.statSync(sitemapPath).size;
      console.log(`📁 Sitemap file created: ${sitemapPath}`);
      console.log(`📊 File size: ${(sitemapSize / 1024).toFixed(2)} KB`);
      
      // Show first few lines of sitemap
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
      const lines = sitemapContent.split('\n').slice(0, 10);
      console.log('\n📄 Sitemap preview (first 10 lines):');
      lines.forEach((line, i) => console.log(`${i + 1}: ${line}`));
      
      if (lines.length < sitemapContent.split('\n').length) {
        console.log('...');
      }
    } else {
      console.log('❌ Sitemap file was not created');
    }
    
  } catch (error) {
    console.error('❌ Sitemap API test failed:', error);
    process.exit(1);
  }
}

testSitemapAPI();
