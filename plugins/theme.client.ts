// Theme detection plugin that runs on client-side
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Create a debug logging function that logs to both console and localStorage
    const debugLog = (msg: string) => {
      console.log(msg);
      try {
        const logs = JSON.parse(localStorage.getItem('theme_debug_logs') || '[]');
        logs.push({
          timestamp: new Date().toISOString(),
          message: msg
        });
        localStorage.setItem('theme_debug_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('[theme.client] Failed to write to localStorage:', e);
      }
    };

    // Run as soon as client is available
    const updateTheme = async () => {
      try {
        await debugLog('[theme.client] Checking system theme preference...');
        
        // Verify window object exists
        if (typeof window === 'undefined') {
          throw new Error('Window object not available');
        }
        
        // Check if matchMedia is supported
        if (!window.matchMedia) {
          throw new Error('matchMedia API not supported');
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const isDark = mediaQuery.matches;
        await debugLog(`[theme.client] System theme detected: ${isDark ? 'dark' : 'light'}`);
        
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        await debugLog(`[theme.client] Theme attribute set to: ${document.documentElement.getAttribute('data-theme')}`);
        
        // Verify the attribute was set correctly
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme !== (isDark ? 'dark' : 'light')) {
          throw new Error(`Theme attribute mismatch. Expected: ${isDark ? 'dark' : 'light'}, Got: ${currentTheme}`);
        }
      } catch (error) {
        const errorMsg = `[theme.client] Error in updateTheme: ${error.message}\nStack: ${error.stack}`;
        console.error(errorMsg);
        await debugLog(errorMsg);
      }
    };

    // Initialize theme detection
    (async () => {
      await debugLog('[theme.client] Plugin initializing...');
      
      // Set initial theme
      await updateTheme();
      
      // Watch for system theme changes
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const changeHandler = () => {
          debugLog('[theme.client] System theme change detected');
          updateTheme();
        };
        
        // Try both addEventListener and addListener for broader browser support
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', changeHandler);
          await debugLog('[theme.client] Added event listener using addEventListener');
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(changeHandler);
          await debugLog('[theme.client] Added event listener using addListener');
        } else {
          await debugLog('[theme.client] Warning: Could not add change listener');
        }
        
        await debugLog('[theme.client] Plugin setup completed successfully');
      } catch (error) {
        const errorMsg = `[theme.client] Error setting up theme listener: ${error.message}\nStack: ${error.stack}`;
        console.error(errorMsg);
        await debugLog(errorMsg);
      }
    })();
  } else {
    console.log('[theme.client] Plugin skipped - not in client context');
  }
});
