// Theme Manager for TaskFlow HTMX
(function () {
  function initTheme() {
    const savedTheme = localStorage.getItem('taskflow-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  initTheme();

  window.toggleTheme = function () {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('taskflow-theme', isDark ? 'dark' : 'light');
  };
})();
