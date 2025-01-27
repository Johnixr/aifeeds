<template>
  <div class="p-4">
    <h1 class="text-2xl mb-4">Theme Detection Test</h1>
    <div class="mb-4">
      <strong>Current Theme:</strong> {{ currentTheme }}
    </div>
    <div class="mb-4">
      <strong>System Preference:</strong> {{ systemPreference }}
    </div>
    <div class="mb-4">
      <strong>Logs:</strong>
      <pre class="bg-gray-100 dark:bg-gray-800 p-4 mt-2 rounded">{{ logs }}</pre>
    </div>
  </div>
</template>

<script setup>
const currentTheme = ref('checking...');
const systemPreference = ref('checking...');
const logs = ref([]);

onMounted(() => {
  // Get theme logs from localStorage
  try {
    const storedLogs = localStorage.getItem('theme_detection_logs');
    if (storedLogs) {
      logs.value = JSON.parse(storedLogs);
    }
    
    // Get current theme
    currentTheme.value = document.documentElement.getAttribute('data-theme') || 'not set';
    
    // Get system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPreference.value = mediaQuery.matches ? 'dark' : 'light';
    
    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          currentTheme.value = document.documentElement.getAttribute('data-theme');
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
  } catch (error) {
    console.error('Error in theme-test page:', error);
    logs.value = [{ timestamp: new Date().toISOString(), message: `Error: ${error.message}` }];
  }
});
</script>
