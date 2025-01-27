// Theme detection plugin that runs on client-side
export default defineNuxtPlugin(() => {
  // Run as soon as client is available
  const updateTheme = () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.setAttribute("data-theme", "light")
    }
  }

  // Do initial check right away
  updateTheme()

  // Watch for system theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateTheme)
})
