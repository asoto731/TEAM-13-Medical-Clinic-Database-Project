/* ── Dark Mode Toggle ── */
(function () {
    // Apply theme before paint (prevents flash)
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    }

    function isDark() {
        return document.documentElement.getAttribute("data-theme") === "dark";
    }

    function updateBtn() {
        const btn = document.getElementById("darkModeToggle");
        if (!btn) return;
        if (isDark()) {
            btn.textContent = "Light Mode";
            btn.title = "Switch to light mode";
        } else {
            btn.textContent = "Dark Mode";
            btn.title = "Switch to dark mode";
        }
        if (typeof syncThemeButtons === "function") syncThemeButtons();
    }

    function toggle() {
        if (isDark()) {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
        updateBtn();
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateBtn();
        const btn = document.getElementById("darkModeToggle");
        if (btn) btn.addEventListener("click", toggle);
    });
})();
