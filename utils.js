// utils.js - utilidades compartilhadas para o sistema

window.MAX_FILE_SIZE_MB = 5;

let _stylesInjected = false;

window.addValidationStyles = function() {
  if (_stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = `
    .invalid { border-color: var(--danger-color); }
    .field-error { color: var(--danger-color); font-size: 0.8rem; display: none; }
  `;
  document.head.appendChild(style);
  _stylesInjected = true;
}

window.showToast = function(message, type = 'info') {
  const containerId = 'toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = '10000';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'success') {
    toast.style.background = getComputedStyle(document.documentElement).getPropertyValue('--success-color');
  } else if (type === 'error') {
    toast.style.background = getComputedStyle(document.documentElement).getPropertyValue('--danger-color');
  }
  toast.textContent = message;
  toast.style.padding = '0.5rem 1rem';
  toast.style.marginTop = '0.5rem';
  toast.style.borderRadius = '4px';
  toast.style.color = '#fff';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  container.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = '1'));
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Disponibilizar showToast globalmente para uso em outros módulos
// Função já exposta globalmente acima

window.handleError = function(err, context = '') {
  // eslint-disable-next-line no-console
  console.error('Erro:', context, err);
  showToast(`Erro: ${context || err.message || err}`, 'error');
}

/**
 * Valida campos de um formulário.
 * @param {HTMLFormElement} form       Form onde os campos residem
 * @param {Array<{name:string, validate:(value:string,input:HTMLElement)=>boolean, message:string}>} rules  Regras
 * @returns {boolean} True se válido
 */
window.validateFormBasic = function(form, rules = []) {
  let isValid = true;
  rules.forEach(rule => {
    const input = form.querySelector(`[name="${rule.name}"]`);
    if (!input) return;
    let msgElem = input.nextElementSibling && input.nextElementSibling.classList.contains('field-error')
      ? input.nextElementSibling
      : null;
    if (!msgElem) {
      msgElem = document.createElement('span');
      msgElem.className = 'field-error';
      input.parentNode.insertBefore(msgElem, input.nextSibling);
    }
    const failed = !rule.validate(input.value, input);
    if (failed) {
      isValid = false;
      input.classList.add('invalid');
      msgElem.textContent = rule.message;
      msgElem.style.display = 'block';
    } else {
      input.classList.remove('invalid');
      msgElem.style.display = 'none';
    }
  });
  return isValid;
}
