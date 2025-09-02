/**
 * Firebase Studio Website Debug Script
 * Identifies and reports issues with resources
 */

class WebsiteDebugger {
    constructor() {
        this.issues = [];
        this.resources = [];
        this.testResults = {};
    }

    // Test if a resource is accessible
    async testResource(url, expectedType = 'text') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            
            // Check if content is actually HTML redirect
            if (content.includes('<!DOCTYPE html>') && content.includes('window.location')) {
                return {
                    status: 'redirect',
                    url: url,
                    content: content.substring(0, 200) + '...',
                    issue: 'Resource contains redirect HTML instead of actual content'
                };
            }
            
            // Check for empty content
            if (content.trim().length === 0) {
                return {
                    status: 'empty',
                    url: url,
                    issue: 'Resource is empty'
                };
            }
            
            return {
                status: 'ok',
                url: url,
                contentLength: content.length,
                contentType: response.headers.get('content-type')
            };
        } catch (error) {
            return {
                status: 'error',
                url: url,
                error: error.message,
                issue: 'Failed to load resource'
            };
        }
    }

    // Test all resources
    async testAllResources() {
        const resources = [
            // CSS files
            { url: './css2(2)', type: 'css' },
            { url: './css2(3)', type: 'css' },
            { url: './css2(1)', type: 'css' },
            { url: './css2', type: 'css' },
            { url: './index-KzK_8K8B.css', type: 'css' },
            
            // JavaScript files
            { url: './index-BMgX3D-v.js.download', type: 'js' },
            { url: './googleapis.proxy.js.download', type: 'js' },
            { url: './js', type: 'js' },
            { url: './lazy.min.js.download', type: 'js' },
            { url: './cb=gapi.loaded_0', type: 'js' },
            { url: './cb=gapi.loaded_1', type: 'js' },
            { url: './cb=gapi(1).loaded_0', type: 'js' },
            
            // Images
            { url: './192px.svg', type: 'image' },
            { url: './typescript.svg', type: 'image' },
            { url: './firebase.svg', type: 'image' },
            { url: './next.svg', type: 'image' },
            { url: './nodejs.svg', type: 'image' },
            { url: './react_ts.svg', type: 'image' },
            { url: './css.svg', type: 'image' },
            { url: './image.svg', type: 'image' },
            { url: './file.svg', type: 'image' },
            { url: './unnamed.jpg', type: 'image' },
            { url: './unnamed(1).jpg', type: 'image' },
            { url: './icon-192.png', type: 'image' }
        ];

        console.log('Testing all resources...');
        
        for (const resource of resources) {
            const result = await this.testResource(resource.url, resource.type);
            this.testResults[resource.url] = result;
            
            if (result.status !== 'ok') {
                this.issues.push({
                    type: resource.type,
                    url: resource.url,
                    issue: result.issue || result.error,
                    details: result
                });
            }
            
            // Add delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Generate report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalResources: Object.keys(this.testResults).length,
            issues: this.issues,
            summary: {
                css: { total: 0, issues: 0 },
                js: { total: 0, issues: 0 },
                image: { total: 0, issues: 0 }
            }
        };

        // Count issues by type
        this.issues.forEach(issue => {
            if (report.summary[issue.type]) {
                report.summary[issue.type].issues++;
            }
        });

        // Count total resources by type
        Object.values(this.testResults).forEach(result => {
            const resource = Object.keys(this.testResults).find(key => this.testResults[key] === result);
            const type = this.getResourceType(resource);
            if (report.summary[type]) {
                report.summary[type].total++;
            }
        });

        return report;
    }

    getResourceType(url) {
        if (url.includes('css') || url.includes('CSS')) return 'css';
        if (url.includes('js') || url.includes('JS') || url.includes('download')) return 'js';
        if (url.includes('svg') || url.includes('jpg') || url.includes('png')) return 'image';
        return 'unknown';
    }

    // Display report in console
    displayReport() {
        const report = this.generateReport();
        
        console.log('\n=== FIREBASE STUDIO WEBSITE DEBUG REPORT ===');
        console.log(`Generated: ${report.timestamp}`);
        console.log(`Total Resources Tested: ${report.totalResources}`);
        console.log('\n--- SUMMARY ---');
        
        Object.entries(report.summary).forEach(([type, stats]) => {
            console.log(`${type.toUpperCase()}: ${stats.issues}/${stats.total} issues`);
        });
        
        console.log('\n--- DETAILED ISSUES ---');
        this.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.type.toUpperCase()}: ${issue.url}`);
            console.log(`   Issue: ${issue.issue}`);
            if (issue.details.content) {
                console.log(`   Content: ${issue.details.content}`);
            }
            console.log('');
        });
        
        console.log('=== END REPORT ===\n');
        
        return report;
    }

    // Fix common issues
    suggestFixes() {
        const fixes = [];
        
        this.issues.forEach(issue => {
            if (issue.details.status === 'redirect') {
                fixes.push({
                    resource: issue.url,
                    problem: 'Contains redirect HTML instead of actual content',
                    solution: 'Replace with actual CSS/JS content or remove reference'
                });
            } else if (issue.details.status === 'error') {
                fixes.push({
                    resource: issue.url,
                    problem: 'Resource not found or inaccessible',
                    solution: 'Check file exists and is accessible'
                });
            }
        });
        
        return fixes;
    }
}

// Auto-run when script is loaded
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        const siteDebugger = new WebsiteDebugger();
        await siteDebugger.testAllResources();
        const report = siteDebugger.displayReport();
        
        // Display fixes
        const fixes = siteDebugger.suggestFixes();
        if (fixes.length > 0) {
            console.log('\n=== SUGGESTED FIXES ===');
            fixes.forEach((fix, index) => {
                console.log(`${index + 1}. ${fix.resource}`);
                console.log(`   Problem: ${fix.problem}`);
                console.log(`   Solution: ${fix.solution}`);
                console.log('');
            });
        }
        
        // Store results globally for access
        window.debugResults = {
            report: report,
            fixes: fixes,
            testResults: siteDebugger.testResults
        };
    });
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebsiteDebugger;
}
