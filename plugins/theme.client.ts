// Theme detection plugin that runs on client-side
export default defineNuxtPlugin(() => {
  if (process.client) {
    // Initialize theme logs in localStorage
    if (!localStorage.getItem('theme_detection_logs')) {
      localStorage.setItem('theme_detection_logs', JSON.stringify([]));
    }
    
    const debugLog = (msg: string) => {
      console.log(msg);
      try {
        // Store logs in localStorage
        const logs = JSON.parse(localStorage.getItem('theme_detection_logs') || '[]');
        logs.push({
          timestamp: new Date().toISOString(),
          message: msg,
          userAgent: navigator.userAgent,
          theme: document.documentElement.getAttribute('data-theme')
        });
        localStorage.setItem('theme_detection_logs', JSON.stringify(logs));
        
        // Store current theme state in localStorage
        localStorage.setItem('current_theme', document.documentElement.getAttribute('data-theme') || 'not set');
        
        // Store system preference in localStorage
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        localStorage.setItem('system_preference', systemPreference);
      } catch (e) {
        console.error('[theme.client] Failed to log:', e);
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
