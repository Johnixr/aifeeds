const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Create a virtual DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: 'http://localhost:3456',
    pretendToBeVisual: true,
    runScripts: 'dangerously'
});

// Mock matchMedia API
dom.window.matchMedia = (query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
});

// Mock localStorage
dom.window.localStorage = {
    data: {},
    setItem(key, value) {
        this.data[key] = value;
        console.log(`localStorage.setItem('${key}', '${value}')`);
    },
    getItem(key) {
        return this.data[key];
    }
};

// Mock console.log
const originalLog = console.log;
console.log = (...args) => {
    originalLog(`[${new Date().toISOString()}]`, ...args);
};

// Load and execute our theme detection code
const fs = require('fs');
const themeTestHtml = fs.readFileSync('theme-test.html', 'utf8');
const scriptContent = themeTestHtml.match(/<script>([\s\S]*?)<\/script>/)[1];

console.log('Starting theme detection test...');
console.log('System dark mode:', dom.window.matchMedia('(prefers-color-scheme: dark)').matches);

try {
    // Execute the theme detection code
    dom.window.eval(scriptContent);
    
    // Check results
    const themeData = JSON.parse(dom.window.localStorage.getItem('theme_detection_test'));
    console.log('Theme detection results:', themeData);
    
    // Check document theme attribute
    console.log('Document theme attribute:', dom.window.document.documentElement.getAttribute('data-theme'));
    
} catch (error) {
    console.error('Error during theme detection:', error);
}
