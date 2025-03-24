const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Handle the redirect for strategicdependencyreport with any trailing path
  server.get(['/strategicdependencyreport', '/strategicdependencyreport/*'], (req, res) => {
    console.log('DEBUG: Redirecting to Strategic Dependency Report PDF');
    console.log('  Request URL:', req.url);
    console.log('  Redirecting to: https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf');
    return res.redirect(301, 'https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf');
  });

  // Add a test route to verify Express is handling requests
  server.get('/express-test', (req, res) => {
    console.log('DEBUG: Express test route hit');
    return res.json({ 
      message: 'Express is correctly handling routes',
      timestamp: new Date().toISOString()
    });
  });

  // Serve static files from the 'public' directory
  server.use(express.static(path.join(__dirname, 'public')));

  // For all other routes, use Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 