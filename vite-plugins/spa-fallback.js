// Vite plugin for SPA fallback - serves index.html for all routes
export function spaFallback() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Use the fallback middleware to serve index.html for all non-file routes
      server.middlewares.use('/article', (req, res, next) => {
        // For any /article/* route, serve index.html but preserve the original URL
        console.log('🔄 SPA Fallback: Serving index.html for article route:', req.url);
        // Store original URL so React can see it
        req.originalUrl = req.url;
        req.url = '/';
        next();
      });
    }
  };
}

export default spaFallback;
