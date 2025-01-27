// Theme detection plugin that runs on client-side
export default defineNuxtPlugin(() => {
  console.log("[theme.client] Plugin is initializing")

  // Run as soon as client is available
  const updateTheme = () => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    console.log("[theme.client] System theme detected:", isDark ? "dark" : "light")
    
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
    console.log("[theme.client] Updated data-theme attribute:", document.documentElement.getAttribute("data-theme"))
  }

  // Do initial check right away
  try {
    updateTheme()
    console.log("[theme.client] Initial theme detection completed")
  } catch (error) {
    console.error("[theme.client] Error during theme detection:", error)
  }

  // Watch for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    console.log("[theme.client] System theme change detected")
    updateTheme()
  })

  console.log("[theme.client] Plugin setup completed")
})
