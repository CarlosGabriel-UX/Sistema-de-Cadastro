// popups.js - Sistema de pop-ups para notificações e modais

window.initPopupSystem = function() {
    initNotificationsPopup();
    initQuickAddPopup();
}

function initNotificationsPopup() {
    const btnShowNotifications = document.getElementById('btn-show-notifications');
    const notificationsModal = document.getElementById('notifications-modal');
    const closeNotifications = document.getElementById('close-notifications');
    const markAllRead = document.getElementById('mark-all-read');

    if (!btnShowNotifications || !notificationsModal) return;

    // Abrir/fechar modal de notificações via classes
    btnShowNotifications.addEventListener('click', () => {
        if (notificationsModal.classList.contains('show')) {
            if (window.accessibilityManager) {
                window.accessibilityManager.closeModal(notificationsModal);
            } else {
                notificationsModal.classList.remove('show');
                notificationsModal.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    notificationsModal.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 300);
            }
        } else {
            if (window.accessibilityManager && typeof window.accessibilityManager.openModal === 'function') {
                window.accessibilityManager.openModal(notificationsModal, ['#close-notifications']);
            } else {
                notificationsModal.classList.remove('hidden');
                notificationsModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    notificationsModal.classList.add('show');
                    try {
                        const focusableSelectors = [
                            'button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1")]'
                        ];
                        const focusable = notificationsModal.querySelectorAll(focusableSelectors.join(','));
                        for (const el of focusable) {
                            if (!el.disabled && el.offsetParent !== null) { el.focus(); break; }
                        }
                        if (document.activeElement === document.body) {
                            if (!notificationsModal.hasAttribute('tabindex')) notificationsModal.setAttribute('tabindex', '-1');
                            notificationsModal.focus();
                        }
                    } catch (_) {}
                }, 10);
            }
        }
    });

    // Fechar modal de notificações
    function closeNotificationsModal() {
        if (window.accessibilityManager) {
            window.accessibilityManager.closeModal(notificationsModal);
        } else {
            notificationsModal.classList.remove('show');
            notificationsModal.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
                notificationsModal.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        }
    }

    if (closeNotifications) {
        closeNotifications.addEventListener('click', closeNotificationsModal);
    }

    // Fechar ao clicar fora do modal
    notificationsModal.addEventListener('click', (e) => {
        if (e.target === notificationsModal) {
            closeNotificationsModal();
        }
    });

    // Marcar todas como lidas
    if (markAllRead) {
        markAllRead.addEventListener('click', () => {
            const notificationItems = document.querySelectorAll('.notification-item');
            notificationItems.forEach(item => {
                item.classList.add('read');
                item.setAttribute('aria-read', 'true');
            });
            if (window.showToast) window.showToast('Todas as notificações foram marcadas como lidas', 'success');
        });
    }

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && notificationsModal.classList.contains('show')) {
            if (window.accessibilityManager) {
                // Gerenciador de acessibilidade fecha modais com Escape; evitar duplicidade
                return;
            }
            closeNotificationsModal();
        }
    });
}

function initQuickAddPopup() {
    const btnQuickAdd = document.getElementById('btn-quick-add');
    const btnOpenModal = document.getElementById('btn-open-ocorrencia-modal');
    const modal = document.getElementById('modal-ocorrencia');

    if (!btnQuickAdd || !modal) return;

    // Conectar botão rápido ao modal existente
    btnQuickAdd.addEventListener('click', () => {
        // Simular clique no botão "Novo Cadastro" da página de cadastros
        if (btnOpenModal) {
            btnOpenModal.click();
        }
    });
}

// Função para mostrar notificação pop-up
window.showNotificationPopup = function(title, message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    
    notification.innerHTML = `
        <div class="notification-popup-icon">
            <i class="bx ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-popup-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-popup-close">
            <i class="bx bx-x"></i>
        </button>
    `;

    // Adicionar ao container
    let container = document.getElementById('notification-popup-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-popup-container';
        container.className = 'notification-popup-container';
        document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Animação de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);

    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            removeNotification(notification);
        });
    }
}

function removeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'bx-check-circle';
        case 'error':
            return 'bx-error-circle';
        case 'warning':
            return 'bx-error-alt';
        case 'info':
        default:
            return 'bx-info-circle';
    }
}

// Função para adicionar nova notificação ao modal
window.addNotificationToModal = function(title, message, type = 'info') {
    const modalBody = document.querySelector('#notifications-modal .modal-body');
    if (!modalBody) return;

    const notificationItem = document.createElement('div');
    notificationItem.className = 'notification-item';
    
    notificationItem.innerHTML = `
        <div class="notification-icon ${type}">
            <i class="bx ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
            <span class="notification-time">agora</span>
        </div>
    `;

    // Adicionar no início da lista
    modalBody.insertBefore(notificationItem, modalBody.firstChild);

    // Remover excesso de notificações (máximo 10)
    const notifications = modalBody.querySelectorAll('.notification-item');
    if (notifications.length > 10) {
        notifications[notifications.length - 1].remove();
    }
}
