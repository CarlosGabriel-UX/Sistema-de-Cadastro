/**
 * Sistema de Acessibilidade
 * Implementa melhorias de acessibilidade seguindo WCAG 2.1
 */

// Classe principal de acessibilidade
class AccessibilityManager {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        this.announcements = [];
        this.init();
    }
    
    init() {
        this.createAriaLiveRegion();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupColorContrastMonitoring();
        this.setupScreenReaderSupport();
        this.setupReducedMotionSupport();
    }
    
    // Criar região ARIA Live para anúncios
    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }
    
    // Anunciar mensagem para leitores de tela
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;
        
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;
        
        // Limpar após anúncio
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
        
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
    }
    
    // Configurar navegação por teclado
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navegação por Tab melhorada
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
            
            // Escape para fechar modais/dropdowns
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
            
            // Enter/Space para ativar elementos
            if (e.key === 'Enter' || e.key === ' ') {
                this.handleActivationKeys(e);
            }
            
            // Setas para navegação em listas/menus
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                this.handleArrowNavigation(e);
            }
        });
    }
    
    handleTabNavigation(e) {
        const focusableElements = Array.from(document.querySelectorAll(this.focusableElements));
        const currentIndex = focusableElements.indexOf(document.activeElement);
        
        // Trap focus em modais
        const modal = document.activeElement.closest('[role="dialog"], .modal');
        if (modal) {
            const modalFocusable = Array.from(modal.querySelectorAll(this.focusableElements));
            const modalCurrentIndex = modalFocusable.indexOf(document.activeElement);
            
            if (e.shiftKey && modalCurrentIndex === 0) {
                e.preventDefault();
                modalFocusable[modalFocusable.length - 1].focus();
            } else if (!e.shiftKey && modalCurrentIndex === modalFocusable.length - 1) {
                e.preventDefault();
                modalFocusable[0].focus();
            }
        }
    }
    
    handleEscapeKey(e) {
        // Fechar modal aberto
        const modal = document.querySelector('.modal.show, [role="dialog"][aria-hidden="false"]');
        if (modal) {
            this.closeModal(modal);
            return;
        }
        
        // Fechar dropdown aberto
        const dropdown = document.querySelector('.dropdown.show, [aria-expanded="true"]');
        if (dropdown) {
            this.closeDropdown(dropdown);
            return;
        }
        
        // Limpar seleções
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    }
    
    handleActivationKeys(e) {
        const target = e.target;
        
        // Ativar elementos customizados com role="button"
        if (target.getAttribute('role') === 'button' && !target.disabled) {
            e.preventDefault();
            target.click();
        }
        
        // Expandir/colapsar elementos
        if (target.hasAttribute('aria-expanded')) {
            e.preventDefault();
            const expanded = target.getAttribute('aria-expanded') === 'true';
            target.setAttribute('aria-expanded', !expanded);
            this.announce(expanded ? 'Colapsado' : 'Expandido');
        }
    }
    
    handleArrowNavigation(e) {
        const target = e.target;
        const parent = target.closest('[role="menu"], [role="listbox"], [role="tablist"]');
        
        if (!parent) return;
        
        const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="option"], [role="tab"]'));
        const currentIndex = items.indexOf(target);
        
        let nextIndex;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                break;
        }
        
        if (nextIndex !== undefined) {
            e.preventDefault();
            items[nextIndex].focus();
        }
    }
    
    // Gerenciamento de foco
    setupFocusManagement() {
        // Indicador visual de foco melhorado
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid var(--focus-color, #4f46e5) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
            }
            
            .focus-visible:focus {
                outline: 2px solid var(--focus-color, #4f46e5) !important;
                outline-offset: 2px !important;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary-color, #4f46e5);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
        
        // Adicionar skip links
        this.addSkipLinks();
        
        // Monitorar mudanças de foco
        document.addEventListener('focusin', (e) => {
            this.handleFocusIn(e);
        });
        
        document.addEventListener('focusout', (e) => {
            this.handleFocusOut(e);
        });
    }
    
    addSkipLinks() {
        const skipLinks = [
            { href: '#main-content', text: 'Pular para conteúdo principal' },
            { href: '#navigation', text: 'Pular para navegação' },
            { href: '#footer', text: 'Pular para rodapé' }
        ];
        
        const skipContainer = document.createElement('div');
        skipContainer.className = 'skip-links';
        
        skipLinks.forEach(link => {
            const skipLink = document.createElement('a');
            skipLink.href = link.href;
            skipLink.className = 'skip-link';
            skipLink.textContent = link.text;
            skipContainer.appendChild(skipLink);
        });
        
        document.body.insertBefore(skipContainer, document.body.firstChild);
    }
    
    handleFocusIn(e) {
        const target = e.target;
        
        // Anunciar contexto do elemento focado
        if (target.hasAttribute('aria-label')) {
            this.announce(target.getAttribute('aria-label'));
        } else if (target.hasAttribute('aria-labelledby')) {
            const labelId = target.getAttribute('aria-labelledby');
            const label = document.getElementById(labelId);
            if (label) {
                this.announce(label.textContent);
            }
        }
        
        // Scroll para elemento focado se necessário
        if (!this.isElementInViewport(target)) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    handleFocusOut(e) {
        // Limpar estados temporários
    }
    
    // Monitoramento de contraste de cores
    setupColorContrastMonitoring() {
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.checkColorContrast(entry.target);
                    }
                });
            });
            
            // Observar elementos de texto
            document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label').forEach(el => {
                observer.observe(el);
            });
        }
    }
    
    checkColorContrast(element) {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Implementar verificação de contraste (simplificada)
        const contrast = this.calculateContrast(color, backgroundColor);
        
        if (contrast < 4.5) {
            console.warn('Contraste insuficiente detectado:', {
                element,
                contrast,
                color,
                backgroundColor
            });
        }
    }
    
    calculateContrast(color1, color2) {
        // Implementação simplificada do cálculo de contraste WCAG
        // Em produção, usar biblioteca especializada
        return 4.5; // Placeholder
    }
    
    // Suporte a leitores de tela
    setupScreenReaderSupport() {
        // Adicionar landmarks ARIA automaticamente
        this.addAriaLandmarks();
        
        // Melhorar descrições de elementos
        this.enhanceElementDescriptions();
        
        // Configurar live regions para conteúdo dinâmico
        this.setupLiveRegions();
    }
    
    addAriaLandmarks() {
        // Header
        const header = document.querySelector('header, .header');
        if (header && !header.hasAttribute('role')) {
            header.setAttribute('role', 'banner');
        }
        
        // Navigation
        const nav = document.querySelector('nav, .navigation');
        if (nav && !nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
        
        // Main content
        const main = document.querySelector('main, .main-content');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
            main.id = main.id || 'main-content';
        }
        
        // Footer
        const footer = document.querySelector('footer, .footer');
        if (footer && !footer.hasAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    }
    
    enhanceElementDescriptions() {
        // Melhorar formulários
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) {
                    field.setAttribute('aria-labelledby', label.id || this.generateId('label'));
                    if (!label.id) label.id = field.getAttribute('aria-labelledby');
                }
            }
            
            // Adicionar descrições de erro
            if (field.hasAttribute('required')) {
                field.setAttribute('aria-required', 'true');
            }
        });
        
        // Melhorar botões
        document.querySelectorAll('button').forEach(button => {
            if (!button.hasAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('i, svg');
                if (icon) {
                    button.setAttribute('aria-label', this.getButtonLabel(button));
                }
            }
        });
    }
    
    setupLiveRegions() {
        // Configurar regiões para notificações
        const notificationArea = document.querySelector('.notifications, .alerts');
        if (notificationArea) {
            notificationArea.setAttribute('aria-live', 'polite');
            notificationArea.setAttribute('aria-atomic', 'false');
        }
        
        // Configurar regiões para status
        const statusArea = document.querySelector('.status, .loading');
        if (statusArea) {
            statusArea.setAttribute('aria-live', 'polite');
            statusArea.setAttribute('aria-atomic', 'true');
        }
    }
    
    // Suporte a movimento reduzido
    setupReducedMotionSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduce-motion');
                this.announce('Movimento reduzido ativado');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        };
        
        prefersReducedMotion.addListener(handleReducedMotion);
        handleReducedMotion(prefersReducedMotion);
        
        // Adicionar estilos para movimento reduzido
        const style = document.createElement('style');
        style.textContent = `
            .reduce-motion *,
            .reduce-motion *::before,
            .reduce-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Utilitários
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    generateId(prefix = 'element') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getButtonLabel(button) {
        const classList = Array.from(button.classList);
        
        if (classList.includes('close')) return 'Fechar';
        if (classList.includes('edit')) return 'Editar';
        if (classList.includes('delete')) return 'Excluir';
        if (classList.includes('save')) return 'Salvar';
        if (classList.includes('cancel')) return 'Cancelar';
        if (classList.includes('submit')) return 'Enviar';
        
        return 'Botão';
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        this.announce('Modal fechado');

        // Aplicar ocultação após transição e restaurar overflow
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
        
        // Retornar foco para elemento que abriu o modal
        const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
        if (trigger) {
            trigger.focus();
        }
    }

    /**
     * Abre um modal aplicando classes/atributos e define foco inicial.
     * @param {HTMLElement} modal Elemento do modal (overlay/container com role="dialog")
     * @param {string[]} [preferredSelectors] Seletores preferenciais para foco inicial
     * @returns {boolean} true se abriu sem erros
     */
    openModal(modal, preferredSelectors = []) {
        if (!modal) return false;
        try {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                modal.classList.add('show');
                this.setInitialFocus(modal, preferredSelectors);
                this.announce('Modal aberto');
            }, 10);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    closeDropdown(dropdown) {
        dropdown.classList.remove('show');
        dropdown.setAttribute('aria-expanded', 'false');
        this.announce('Menu fechado');
    }
    
    /**
     * Define o foco inicial ao abrir um modal, com suporte a seletor preferencial.
     * @param {HTMLElement} modal Elemento do modal (overlay ou container com role="dialog")
     * @param {string[]} [preferredSelectors] Lista de seletores preferenciais em ordem de prioridade
     */
    setInitialFocus(modal, preferredSelectors = []) {
        if (!modal) return;
        try {
            // Tentar focar itens preferenciais explícitos
            for (const selector of preferredSelectors) {
                const el = modal.querySelector(selector);
                if (el && !el.disabled && el.offsetParent !== null) {
                    el.focus();
                    return true;
                }
            }

            // Focar primeiro elemento interativo visível
            const focusable = modal.querySelectorAll(this.focusableElements);
            for (const el of focusable) {
                if (!el.disabled && el.offsetParent !== null) {
                    el.focus();
                    return true;
                }
            }

            // Fallback: focar o próprio modal
            if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
            modal.focus();
            return true;
        } catch (_) {
            // Silenciar erros de foco
            return false;
        }
    }
    
    // API pública
    setFocusToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            return true;
        }
        return false;
    }
    
    addAriaLabel(selector, label) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute('aria-label', label);
        });
    }
    
    updateLiveRegion(message, priority = 'polite') {
        this.announce(message, priority);
    }
    
    getAccessibilityReport() {
        return {
            announcements: this.announcements,
            focusableElements: document.querySelectorAll(this.focusableElements).length,
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            landmarks: {
                banner: document.querySelectorAll('[role="banner"]').length,
                navigation: document.querySelectorAll('[role="navigation"]').length,
                main: document.querySelectorAll('[role="main"]').length,
                contentinfo: document.querySelectorAll('[role="contentinfo"]').length
            }
        };
    }
}

// Instância global
let accessibilityManager = null;

export function getAccessibilityManager() {
    if (!accessibilityManager) {
        accessibilityManager = new AccessibilityManager();
    }
    return accessibilityManager;
}

export { AccessibilityManager };