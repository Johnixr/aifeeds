// Theme detection plugin that runs on client-side
export default defineNuxtPlugin(() => {
  if (process.client) {
    console.log("[theme.client] Plugin is initializing")

    // Run as soon as client is available
    const updateTheme = () => {
      try {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        console.log("[theme.client] System theme detected:", isDark ? "dark" : "light")
        
        document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
        console.log("[theme.client] Updated data-theme attribute:", document.documentElement.getAttribute("data-theme"))
      } catch (error) {
        console.error("[theme.client] Error in updateTheme:", error)
      }
    }

    // Do initial check right away
    updateTheme()

    // Watch for system theme changes
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", () => {
        console.log("[theme.client] System theme change detected")
        updateTheme()
      })
      console.log("[theme.client] Theme change listener added")
    } catch (error) {
      console.error("[theme.client] Error setting up theme listener:", error)
    }

    console.log("[theme.client] Plugin setup completed")
  } else {
    console.log("[theme.client] Plugin skipped - not in client context")
  }
})
