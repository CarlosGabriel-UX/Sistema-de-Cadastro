// formEnhancements.js - Melhorias para formulários

window.initFormEnhancements = function() {
    initCharCounter();
    initDateDefaults();
    initFormValidation();
}

function initCharCounter() {
    const textarea = document.getElementById('relatorio');
    const charCount = document.getElementById('char-count');
    
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            const currentLength = textarea.value.length;
            const maxLength = 500;
            
            charCount.textContent = currentLength;
            
            // Mudança de cor baseada na quantidade de caracteres
            if (currentLength > maxLength * 0.8) {
                charCount.style.color = 'var(--warning-color)';
            } else if (currentLength > maxLength * 0.9) {
                charCount.style.color = 'var(--danger-color)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
            
            // Limitar caracteres
            if (currentLength > maxLength) {
                textarea.value = textarea.value.substring(0, maxLength);
                charCount.textContent = maxLength;
                charCount.style.color = 'var(--danger-color)';
            }
        });
    }
}

function initDateDefaults() {
    const dateInput = document.getElementById('data');
    if (dateInput) {
        // Definir data atual como padrão
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
    }
}

function initFormValidation() {
    const form = document.getElementById('form-ocorrencia');
    if (!form) return;
    
    // Validação em tempo real
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        field.addEventListener('input', () => {
            // Remover erro quando o usuário começar a digitar
            if (field.classList.contains('error')) {
                field.classList.remove('error');
                const errorMsg = field.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remover mensagens de erro anteriores
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Validações específicas
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Digite um email válido';
    } else if (field.name === 'relatorio' && value && value.length < 10) {
        isValid = false;
        errorMessage = 'Descrição deve ter pelo menos 10 caracteres';
    } else if ((field.id === 'cep' || field.classList.contains('cep-input')) && value && !isValidCEP(value)) {
        isValid = false;
        errorMessage = 'CEP inválido. Use o formato 00000-000';
    } else if (field.id === 'endereco' && value && value.length < 5) {
        isValid = false;
        errorMessage = 'Endereço deve ter pelo menos 5 caracteres';
    } else if (field.id === 'cidade' && value && value.length < 2) {
        isValid = false;
        errorMessage = 'Nome da cidade deve ter pelo menos 2 caracteres';
    } else if (field.id === 'numero' && value && !/^\d+[a-zA-Z]?$/.test(value)) {
        isValid = false;
        errorMessage = 'Número deve conter apenas dígitos (ex: 123, 123A)';
    }
    
    // Aplicar estilos de erro ou sucesso
    if (!isValid) {
        field.classList.add('error');
        field.classList.remove('success', 'valid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="bx bx-error-circle"></i> ${errorMessage}`;
        field.parentNode.appendChild(errorDiv);
        
        // Adicionar shake animation
        field.style.animation = 'shake 0.6s ease-in-out';
        setTimeout(() => field.style.animation = '', 600);
    } else {
        field.classList.remove('error');
        if (value) {
            field.classList.add('success', 'valid');
            
            // Adicionar indicador de sucesso
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = `<i class="bx bx-check-circle"></i> Campo válido`;
            field.parentNode.appendChild(successDiv);
            
            // Remover indicador após 2 segundos
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 2000);
        } else {
            field.classList.remove('success', 'valid');
        }
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidCEP(cep) {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
}

// Função para validar endereço completo
window.validateAddressFields = function() {
    const cepField = document.getElementById('cep');
    const enderecoField = document.getElementById('endereco');
    const cidadeField = document.getElementById('cidade');
    const estadoField = document.getElementById('estado');
    const numeroField = document.getElementById('numero');
    
    const fields = [cepField, enderecoField, cidadeField, estadoField, numeroField].filter(f => f);
    let allValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    // Mostrar feedback geral do endereço
    const addressFieldset = document.querySelector('fieldset.nested-fieldset');
    if (addressFieldset) {
        if (allValid && fields.every(f => f.value.trim())) {
            addressFieldset.classList.add('address-complete');
            addressFieldset.classList.remove('address-incomplete');
        } else {
            addressFieldset.classList.remove('address-complete');
            if (fields.some(f => f.value.trim())) {
                addressFieldset.classList.add('address-incomplete');
            }
        }
    }
    
    return allValid;
}

// Adicionar estilos CSS dinamicamente
function addValidationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: #f04141;
            font-size: 0.8em;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: slideDown 0.3s ease;
        }
        
        .success-message {
            color: #10dc60;
            font-size: 0.8em;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            animation: slideDown 0.3s ease;
        }
        
        .address-complete {
            border-color: #10dc60 !important;
            box-shadow: 0 0 0 2px rgba(16, 220, 96, 0.2) !important;
        }
        
        .address-incomplete {
            border-color: #ffce00 !important;
            box-shadow: 0 0 0 2px rgba(255, 206, 0, 0.2) !important;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Função para validar formulário completo
window.validateForm = function(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Função para limpar formulário
window.clearForm = function(form) {
    form.reset();
    
    // Remover classes de erro
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    // Remover mensagens de erro
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.remove();
    });
    
    // Resetar contador de caracteres
    const charCount = document.getElementById('char-count');
    if (charCount) {
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-muted)';
    }
    
    // Resetar data para hoje
    const dateInput = document.getElementById('data');
    if (dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
    }
}
