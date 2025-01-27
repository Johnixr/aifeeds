// Simple script to check theme detection
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Create a virtual DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: 'http://localhost:3456',
    pretendToBeVisual: true,
    runScripts: 'dangerously'
});

// Mock localStorage
dom.window.localStorage = {
    data: {},
    setItem(key, value) {
        this.data[key] = value;
        console.log(`[localStorage] ${key}:`, value);
    },
    getItem(key) {
        return this.data[key];
    }
};

// Mock matchMedia API
dom.window.matchMedia = (query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    media: query
});

// Mock console.log
const originalLog = console.log;
console.log = (...args) => {
    originalLog(`[${new Date().toISOString()}]`, ...args);
};

// Load and execute our theme detection code
console.log('Starting theme detection test...');
console.log('System dark mode:', dom.window.matchMedia('(prefers-color-scheme: dark)').matches);

try {
    // Initialize theme logs
    dom.window.localStorage.setItem('theme_detection_logs', JSON.stringify([]));
    
    // Mock document for theme attribute
    const documentElement = dom.window.document.documentElement;
    const mediaQuery = dom.window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set theme based on system preference
    const theme = mediaQuery.matches ? 'dark' : 'light';
    documentElement.setAttribute('data-theme', theme);
    console.log('Theme set to:', theme);
    
    // Store logs
    const logs = JSON.parse(dom.window.localStorage.getItem('theme_detection_logs') || '[]');
    logs.push({
        timestamp: new Date().toISOString(),
        message: 'Theme detection test complete',
        theme: documentElement.getAttribute('data-theme'),
        systemPreference: mediaQuery.matches ? 'dark' : 'light'
    });
    dom.window.localStorage.setItem('theme_detection_logs', JSON.stringify(logs));
    
    // Output final state
    console.log('Final theme:', documentElement.getAttribute('data-theme'));
    console.log('Logs:', JSON.stringify(logs, null, 2));
    
} catch (error) {
    console.error('Error during theme detection:', error);
}
