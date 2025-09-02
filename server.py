#!/usr/bin/env python3
"""
Simple HTTP server for testing the Firebase Studio website
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse, unquote

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Handle special file types
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # Map file extensions to MIME types
        mime_types = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.svg': 'image/svg+xml',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.html': 'text/html',
            '.htm': 'text/html'
        }
        
        # Get file extension
        _, ext = os.path.splitext(path)
        
        # Set content type if known
        if ext in mime_types:
            self.send_header('Content-Type', mime_types[ext])
        
        # Handle files without extensions (like css2(2), js, etc.)
        if not ext and path != '/':
            # Check if it's a CSS file
            if any(css_pattern in path for css_pattern in ['css2', 'css']):
                self.send_header('Content-Type', 'text/css')
            # Check if it's a JS file
            elif any(js_pattern in path for js_pattern in ['js', 'download']):
                self.send_header('Content-Type', 'application/javascript')
        
        return super().do_GET()

def main():
    PORT = 8000
    
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"Server started at http://localhost:{PORT}")
            print(f"Serving files from: {os.getcwd()}")
            print("Press Ctrl+C to stop the server")
            print("\nAvailable pages:")
            print(f"  - Main page: http://localhost:{PORT}/index.html")
            print(f"  - Capra: http://localhost:{PORT}/capra.html")
            print(f"  - Message: http://localhost:{PORT}/msg.html")
            print(f"  - Proxy: http://localhost:{PORT}/proxy.html")
            print("\nStarting server...")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {PORT} is already in use. Try a different port.")
            print("Usage: python server.py [port]")
        else:
            print(f"Error starting server: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
