const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8000';

// Test configuration
const testFiles = {
    pages: [
        'index.html',
        'capra.html',
        'msg.html',
        'proxy.html'
    ],
    css: [
        'css2(2)',
        'css2(3)',
        'css2(1)',
        'css2',
        'index-KzK_8K8B.css'
    ],
    js: [
        'index-BMgX3D-v.js.download',
        'googleapis.proxy.js.download',
        'js',
        'lazy.min.js.download',
        'cb=gapi.loaded_0',
        'cb=gapi.loaded_1',
        'cb=gapi(1).loaded_0'
    ],
    images: [
        '192px.svg',
        'typescript.svg',
        'firebase.svg',
        'next.svg',
        'nodejs.svg',
        'react_ts.svg',
        'css.svg',
        'image.svg',
        'file.svg',
        'unnamed.jpg',
        'unnamed(1).jpg',
        'icon-192.png'
    ]
};

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    contentType: res.headers['content-type'],
                    data: data,
                    size: data.length
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

function checkRedirectHTML(content) {
    return content.includes('<!DOCTYPE html>') && content.includes('window.location');
}

async function testFile(filename, category) {
    const url = `${BASE_URL}/${filename}`;
    
    try {
        const response = await makeRequest(url);
        
        if (response.statusCode === 200) {
            if (checkRedirectHTML(response.data)) {
                console.log(`⚠️  ${filename}: Contains redirect HTML (not actual ${category})`);
                return { success: false, issue: 'redirect_html' };
            }
            
            if (response.data.trim().length === 0) {
                console.log(`⚠️  ${filename}: Empty content`);
                return { success: false, issue: 'empty' };
            }
            
            console.log(`✅ ${filename}: Accessible (${response.size} bytes)`);
            return { success: true };
        } else {
            console.log(`❌ ${filename}: HTTP ${response.statusCode}`);
            return { success: false, issue: `http_${response.statusCode}` };
        }
    } catch (error) {
        console.log(`❌ ${filename}: Error - ${error.message}`);
        return { success: false, issue: 'connection_error' };
    }
}

async function testCategory(files, category) {
    console.log(`\n=== Testing ${category.toUpperCase()} Files ===`);
    const results = [];
    
    for (const file of files) {
        const result = await testFile(file, category);
        results.push({ file, ...result });
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}

function generateReport(allResults) {
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY REPORT');
    console.log('='.repeat(50));
    
    console.log(`Total files tested: ${totalTests}`);
    console.log(`Files accessible: ${passedTests}`);
    console.log(`Files with issues: ${failedTests}`);
    console.log(`Success rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
    
    // Group issues by type
    const issuesByType = {};
    allResults.filter(r => !r.success).forEach(result => {
        if (!issuesByType[result.issue]) {
            issuesByType[result.issue] = [];
        }
        issuesByType[result.issue].push(result.file);
    });
    
    if (Object.keys(issuesByType).length > 0) {
        console.log('\nIssues found:');
        Object.entries(issuesByType).forEach(([issue, files]) => {
            console.log(`  - ${issue}: ${files.join(', ')}`);
        });
    }
    
    console.log('\nRecommendations:');
    if (issuesByType.redirect_html) {
        console.log('  1. Replace files with redirect HTML with actual content');
        console.log('  2. These files were likely downloaded from a protected environment');
    }
    if (issuesByType.connection_error) {
        console.log('  3. Check if the server is running on port 8000');
    }
    if (failedTests === 0) {
        console.log('  All files are accessible! The website should work properly.');
    }
    
    console.log('='.repeat(50));
}

async function main() {
    console.log('Firebase Studio Website Test');
    console.log('='.repeat(30));
    
    // Test if server is running
    try {
        await makeRequest(BASE_URL);
        console.log('✅ Server is running');
    } catch (error) {
        console.log('❌ Server is not running');
        console.log('Please start the server with: node server.js');
        process.exit(1);
    }
    
    // Test all categories
    const allResults = [];
    
    for (const [category, files] of Object.entries(testFiles)) {
        const results = await testCategory(files, category);
        allResults.push(...results);
    }
    
    // Generate report
    generateReport(allResults);
    
    console.log('\nTo view the website:');
    console.log(`  Open your browser to: ${BASE_URL}/index.html`);
    console.log('  Check the browser console for detailed debug information');
}

// Run the test
main().catch(console.error);
