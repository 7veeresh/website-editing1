const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

// MIME type mapping
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

// Custom MIME types for files without extensions
const customMimeTypes = {
    'css2(2)': 'text/css',
    'css2(3)': 'text/css',
    'css2(1)': 'text/css',
    'css2': 'text/css',
    'js': 'application/javascript',
    'index-KzK_8K8B.css': 'text/css',
    'index-BMgX3D-v.js.download': 'application/javascript',
    'googleapis.proxy.js.download': 'application/javascript',
    'lazy.min.js.download': 'application/javascript',
    'cb=gapi.loaded_0': 'application/javascript',
    'cb=gapi.loaded_1': 'application/javascript',
    'cb=gapi(1).loaded_0': 'application/javascript'
};

const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Remove leading slash
    const filePath = pathname.substring(1);
    
    // Get file extension
    const ext = path.extname(filePath);
    
    // Determine MIME type
    let contentType = 'text/plain';
    if (ext && mimeTypes[ext]) {
        contentType = mimeTypes[ext];
    } else if (customMimeTypes[filePath]) {
        contentType = customMimeTypes[filePath];
    }
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`404: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 - File Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The file <code>${filePath}</code> was not found.</p>
                        <p><a href="/">Go to main page</a></p>
                    </body>
                </html>
            `);
            return;
        }
        
        console.log(`200: ${filePath} (${contentType})`);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${process.cwd()}`);
    console.log('\n📋 Available pages:');
    console.log(`   - Main page: http://localhost:${PORT}/index.html`);
    console.log(`   - Capra: http://localhost:${PORT}/capra.html`);
    console.log(`   - Message: http://localhost:${PORT}/msg.html`);
    console.log(`   - Proxy: http://localhost:${PORT}/proxy.html`);
    console.log('\n⏹️  Press Ctrl+C to stop the server\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server stopped.');
    process.exit(0);
});
