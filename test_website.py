#!/usr/bin/env python3
"""
Test script for Firebase Studio website
"""

import requests
import time
import sys
import os
from urllib.parse import urljoin

def test_server(base_url="http://localhost:8000"):
    """Test if the server is running and accessible"""
    try:
        response = requests.get(base_url, timeout=5)
        print(f"✅ Server is running at {base_url}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Server is not running at {base_url}")
        print("Please start the server with: python server.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False

def test_file_access(base_url, filename, expected_content_type=None):
    """Test if a specific file is accessible"""
    url = urljoin(base_url, filename)
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            content = response.text[:200]  # First 200 characters
            
            # Check if it's redirect HTML
            if '<!DOCTYPE html>' in content and 'window.location' in content:
                print(f"⚠️  {filename}: Contains redirect HTML (not actual content)")
                return False
            
            # Check if it's empty
            if not content.strip():
                print(f"⚠️  {filename}: Empty content")
                return False
            
            print(f"✅ {filename}: Accessible ({len(response.text)} bytes)")
            return True
        else:
            print(f"❌ {filename}: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {filename}: Error - {e}")
        return False

def test_main_pages(base_url):
    """Test main HTML pages"""
    pages = [
        "index.html",
        "capra.html", 
        "msg.html",
        "proxy.html"
    ]
    
    print("\n=== Testing Main Pages ===")
    results = []
    for page in pages:
        success = test_file_access(base_url, page, "text/html")
        results.append((page, success))
    
    return results

def test_css_files(base_url):
    """Test CSS files"""
    css_files = [
        "css2(2)",
        "css2(3)", 
        "css2(1)",
        "css2",
        "index-KzK_8K8B.css"
    ]
    
    print("\n=== Testing CSS Files ===")
    results = []
    for css in css_files:
        success = test_file_access(base_url, css, "text/css")
        results.append((css, success))
    
    return results

def test_js_files(base_url):
    """Test JavaScript files"""
    js_files = [
        "index-BMgX3D-v.js.download",
        "googleapis.proxy.js.download",
        "js",
        "lazy.min.js.download",
        "cb=gapi.loaded_0",
        "cb=gapi.loaded_1", 
        "cb=gapi(1).loaded_0"
    ]
    
    print("\n=== Testing JavaScript Files ===")
    results = []
    for js in js_files:
        success = test_file_access(base_url, js, "application/javascript")
        results.append((js, success))
    
    return results

def test_images(base_url):
    """Test image files"""
    images = [
        "192px.svg",
        "typescript.svg",
        "firebase.svg", 
        "next.svg",
        "nodejs.svg",
        "react_ts.svg",
        "css.svg",
        "image.svg",
        "file.svg",
        "unnamed.jpg",
        "unnamed(1).jpg",
        "icon-192.png"
    ]
    
    print("\n=== Testing Image Files ===")
    results = []
    for img in images:
        success = test_file_access(base_url, img, "image")
        results.append((img, success))
    
    return results

def generate_report(page_results, css_results, js_results, image_results):
    """Generate a summary report"""
    print("\n" + "="*50)
    print("SUMMARY REPORT")
    print("="*50)
    
    total_tests = len(page_results) + len(css_results) + len(js_results) + len(image_results)
    passed_tests = sum(1 for _, success in page_results + css_results + js_results + image_results if success)
    
    print(f"Total files tested: {total_tests}")
    print(f"Files accessible: {passed_tests}")
    print(f"Files with issues: {total_tests - passed_tests}")
    print(f"Success rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\nIssues found:")
    
    # Check for broken CSS/JS files
    broken_css = [name for name, success in css_results if not success]
    broken_js = [name for name, success in js_results if not success]
    
    if broken_css:
        print(f"  - CSS files with issues: {', '.join(broken_css)}")
    if broken_js:
        print(f"  - JS files with issues: {', '.join(broken_js)}")
    
    print("\nRecommendations:")
    if broken_css or broken_js:
        print("  1. Replace broken CSS/JS files with actual content")
        print("  2. Remove references to broken files from HTML")
        print("  3. Test the website functionality after fixes")
    else:
        print("  All files are accessible! The website should work properly.")
    
    print("="*50)

def main():
    base_url = "http://localhost:8000"
    
    print("Firebase Studio Website Test")
    print("="*30)
    
    # Test if server is running
    if not test_server(base_url):
        sys.exit(1)
    
    # Test all file types
    page_results = test_main_pages(base_url)
    css_results = test_css_files(base_url)
    js_results = test_js_files(base_url)
    image_results = test_images(base_url)
    
    # Generate report
    generate_report(page_results, css_results, js_results, image_results)
    
    print("\nTo view the website:")
    print(f"  Open your browser to: {base_url}/index.html")
    print("  Check the browser console for detailed debug information")

if __name__ == "__main__":
    main()
