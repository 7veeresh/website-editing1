/**
 * Firebase Studio - Fallback JavaScript
 * This file replaces broken JS files that contain redirect HTML
 */

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showError('A JavaScript error occurred: ' + e.message);
});

// Utility functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = `<strong>Error:</strong> ${message}`;
    document.body.insertBefore(errorDiv, document.body.firstChild);
}

function showWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'alert alert-warning';
    warningDiv.innerHTML = `<strong>Warning:</strong> ${message}`;
    document.body.insertBefore(warningDiv, document.body.firstChild);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.innerHTML = `<strong>Success:</strong> ${message}`;
    document.body.insertBefore(successDiv, document.body.firstChild);
}

// Resource loader with fallbacks
class ResourceLoader {
    constructor() {
        this.loadedResources = new Set();
        this.failedResources = new Set();
    }

    async loadCSS(url, fallbackUrl = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const content = await response.text();
            if (content.includes('<!DOCTYPE html>') && content.includes('window.location')) {
                throw new Error('Resource contains redirect HTML');
            }
            
            this.injectCSS(content);
            this.loadedResources.add(url);
            console.log(`✅ CSS loaded: ${url}`);
            return true;
        } catch (error) {
            console.warn(`⚠️ Failed to load CSS: ${url}`, error.message);
            this.failedResources.add(url);
            
            if (fallbackUrl) {
                return this.loadCSS(fallbackUrl);
            }
            
            return false;
        }
    }

    async loadJS(url, fallbackUrl = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const content = await response.text();
            if (content.includes('<!DOCTYPE html>') && content.includes('window.location')) {
                throw new Error('Resource contains redirect HTML');
            }
            
            this.injectJS(content);
            this.loadedResources.add(url);
            console.log(`✅ JS loaded: ${url}`);
            return true;
        } catch (error) {
            console.warn(`⚠️ Failed to load JS: ${url}`, error.message);
            this.failedResources.add(url);
            
            if (fallbackUrl) {
                return this.loadJS(fallbackUrl);
            }
            
            return false;
        }
    }

    injectCSS(content) {
        const style = document.createElement('style');
        style.textContent = content;
        document.head.appendChild(style);
    }

    injectJS(content) {
        const script = document.createElement('script');
        script.textContent = content;
        document.head.appendChild(script);
    }

    getStatus() {
        return {
            loaded: Array.from(this.loadedResources),
            failed: Array.from(this.failedResources),
            total: this.loadedResources.size + this.failedResources.size
        };
    }
}

// Initialize resource loader
const resourceLoader = new ResourceLoader();

// Mock Firebase functionality
window.firebase = window.firebase || {
    initializeApp: function(config) {
        console.log('Firebase mock initialized with config:', config);
        return {
            auth: function() {
                return {
                    signInAnonymously: function() {
                        return Promise.resolve({ user: { uid: 'mock-user-id' } });
                    },
                    onAuthStateChanged: function(callback) {
                        callback({ uid: 'mock-user-id' });
                    }
                };
            },
            firestore: function() {
                return {
                    collection: function(name) {
                        return {
                            add: function(data) {
                                return Promise.resolve({ id: 'mock-doc-id' });
                            },
                            get: function() {
                                return Promise.resolve({ docs: [] });
                            }
                        };
                    }
                };
            }
        };
    }
};

// Mock Monaco Editor
window.monaco = window.monaco || {
    editor: {
        create: function(container, options) {
            console.log('Monaco editor mock created');
            const textarea = document.createElement('textarea');
            textarea.style.width = '100%';
            textarea.style.height = '300px';
            textarea.style.fontFamily = 'monospace';
            textarea.style.backgroundColor = '#1e1e1e';
            textarea.style.color = '#d4d4d4';
            textarea.style.border = '1px solid #3e3e3e';
            textarea.style.padding = '10px';
            textarea.placeholder = 'Monaco Editor (Mock) - Type your code here...';
            container.appendChild(textarea);
            
            return {
                getValue: function() { return textarea.value; },
                setValue: function(value) { textarea.value = value; },
                onDidChangeModelContent: function(callback) {
                    textarea.addEventListener('input', callback);
                }
            };
        }
    }
};

// Mock Google APIs
window.gapi = window.gapi || {
    load: function(api, callback) {
        console.log('Google API mock loaded:', api);
        if (callback) callback();
    },
    auth2: {
        init: function(config) {
            console.log('Google Auth2 mock initialized');
            return Promise.resolve({
                signIn: function() {
                    return Promise.resolve({
                        getBasicProfile: function() {
                            return {
                                getName: function() { return 'Mock User'; },
                                getEmail: function() { return 'mock@example.com'; }
                            };
                        }
                    });
                }
            });
        }
    }
};

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Firebase Studio - Fallback JavaScript loaded');
    
    // Load fallback CSS if needed
    if (!document.querySelector('link[href*="fixes.css"]')) {
        resourceLoader.loadCSS('./fixes.css');
    }
    
    // Initialize any page-specific functionality
    initializePage();
});

function initializePage() {
    // Add loading indicators
    const loadingElements = document.querySelectorAll('[data-loading]');
    loadingElements.forEach(element => {
        element.innerHTML = '<span class="spinner"></span>Loading...';
    });
    
    // Handle navigation
    const navLinks = document.querySelectorAll('a[href^="./"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                console.log('Navigating to:', href);
                // Let the browser handle the navigation
            }
        });
    });
    
    // Handle form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted:', this.action);
            showWarning('Form submission is mocked in this debug version');
        });
    });
    
    // Handle buttons
    const buttons = document.querySelectorAll('button[data-action]');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const action = this.getAttribute('data-action');
            console.log('Button action:', action);
            showInfo(`Action "${action}" is mocked in this debug version`);
        });
    });
}

// Debug utilities
window.debugUtils = {
    showResourceStatus: function() {
        const status = resourceLoader.getStatus();
        console.log('Resource Status:', status);
        return status;
    },
    
    reloadResources: function() {
        console.log('Reloading resources...');
        location.reload();
    },
    
    showPageInfo: function() {
        const info = {
            url: window.location.href,
            title: document.title,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
        console.log('Page Info:', info);
        return info;
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ResourceLoader,
        showError,
        showWarning,
        showSuccess,
        debugUtils
    };
}
