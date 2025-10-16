// theme.js - Sistema de alternância de tema claro/escuro

window.initThemeSystem = function() {
    // Elementos do DOM
    const themeButtons = document.querySelectorAll('.theme-btn');
    const lightThemeBtn = document.getElementById('theme-light');
    const darkThemeBtn = document.getElementById('theme-dark');
    
    if (!themeButtons.length) return;

    // Verificar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar tema inicial
    applyTheme(savedTheme);
    updateButtonStates(savedTheme);
    
    // Event listeners para botões de tema
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            applyTheme(theme);
            updateButtonStates(theme);
            saveTheme(theme);
            if (window.showToast) window.showToast(`Tema ${theme === 'light' ? 'claro' : 'escuro'} aplicado!`, 'success');
        });
    });

    // Event listener para detectar mudanças no tema do sistema
    if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            const currentTheme = localStorage.getItem('theme');
            if (!currentTheme) {
                const autoTheme = e.matches ? 'dark' : 'light';
                applyTheme(autoTheme);
                updateButtonStates(autoTheme);
            }
        });
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function updateButtonStates(theme) {
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    
    if (lightBtn && darkBtn) {
        lightBtn.classList.toggle('active', theme === 'light');
        darkBtn.classList.toggle('active', theme === 'dark');
    }
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

// Função para detectar preferência do sistema
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Função para obter tema atual
window.getCurrentTheme = function() {
    return localStorage.getItem('theme') || getSystemTheme();
}

// Função para alternar tema programaticamente
window.toggleTheme = function() {
    const currentTheme = window.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    updateButtonStates(newTheme);
    saveTheme(newTheme);
    return newTheme;
}
