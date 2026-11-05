;(function () {
  try {
    var stored = localStorage.getItem('cs-pathway:theme')
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored
      return
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.dataset.theme = 'dark'
    }
  } catch (error) {
    /* keep the default theme */
  }
})()
