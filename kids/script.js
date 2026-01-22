document.addEventListener('DOMContentLoaded', () => {
    /* 1. INITIALIZE ICONS */
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    /* 2. THEME LOGIC */
    const themeToggle = document.getElementById('themeToggle');
    // Check localStorage or default to 'light' for Kids section (Bright & Clean)
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Apply immediate
    applyTheme(savedTheme);

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }

    function updateThemeIcon(theme) {
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark'
                ? '<i data-feather="sun"></i>'
                : '<i data-feather="moon"></i>';
            if (typeof feather !== 'undefined') feather.replace();
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
        });
    }

    /* 3. SIDEBAR LOGIC */
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menuToggle');

    function toggleMenu() {
        if (sidebar) sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Close sidebar when clicking a link (improvement for mobile)
    if (sidebar) {
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024) toggleMenu();
            });
        });
    }

    /* 4. FOOTER YEAR */
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
