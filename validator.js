/**
 * =============================================================================
 * SISTEMA DE VALIDAÇÃO ROBUSTO
 * Sistema completo para validação de dados e formulários
 * =============================================================================
 */

import { ERROR_MESSAGES } from './js/core/config.js';
import { getErrorHandler } from './js/core/errorHandler.js';

/**
 * Classe principal para validação
 */
export class Validator {
  constructor() {
    this.rules = new Map();
    this.customValidators = new Map();
    this.errorHandler = getErrorHandler();
    
    this.initializeDefaultRules();
  }
  
  /**
   * Inicializa regras de validação padrão
   */
  initializeDefaultRules() {
    // Regras básicas
    this.addRule('required', (value, params) => {
      if (value === null || value === undefined || value === '') {
        return { valid: false, message: 'Este campo é obrigatório' };
      }
      return { valid: true };
    });
    
    this.addRule('minLength', (value, params) => {
      const minLength = params.value || params;
      if (value && value.length < minLength) {
        return { 
          valid: false, 
          message: `Deve ter pelo menos ${minLength} caracteres` 
        };
      }
      return { valid: true };
    });
    
    this.addRule('maxLength', (value, params) => {
      const maxLength = params.value || params;
      if (value && value.length > maxLength) {
        return { 
          valid: false, 
          message: `Deve ter no máximo ${maxLength} caracteres` 
        };
      }
      return { valid: true };
    });
    
    this.addRule('email', (value) => {
      if (!value) return { valid: true }; // Opcional se não required
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: 'Email inválido' };
      }
      return { valid: true };
    });
    
    this.addRule('phone', (value) => {
      if (!value) return { valid: true };
      
      // Remove formatação
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return { valid: false, message: 'Telefone inválido' };
      }
      return { valid: true };
    });
    
    this.addRule('cpf', (value) => {
      if (!value) return { valid: true };
      
      const cpf = value.replace(/\D/g, '');
      
      if (cpf.length !== 11) {
        return { valid: false, message: 'CPF deve ter 11 dígitos' };
      }
      
      // Verificar se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) {
        return { valid: false, message: 'CPF inválido' };
      }
      
      // Validar dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let digit1 = 11 - (sum % 11);
      if (digit1 > 9) digit1 = 0;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      let digit2 = 11 - (sum % 11);
      if (digit2 > 9) digit2 = 0;
      
      if (parseInt(cpf.charAt(9)) !== digit1 || parseInt(cpf.charAt(10)) !== digit2) {
        return { valid: false, message: 'CPF inválido' };
      }
      
      return { valid: true };
    });
    
    this.addRule('cnpj', (value) => {
      if (!value) return { valid: true };
      
      const cnpj = value.replace(/\D/g, '');
      
      if (cnpj.length !== 14) {
        return { valid: false, message: 'CNPJ deve ter 14 dígitos' };
      }
      
      // Verificar se todos os dígitos são iguais
      if (/^(\d)\1{13}$/.test(cnpj)) {
        return { valid: false, message: 'CNPJ inválido' };
      }
      
      // Validar dígitos verificadores
      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights1[i];
      }
      let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      
      sum = 0;
      for (let i = 0; i < 13; i++) {
        sum += parseInt(cnpj.charAt(i)) * weights2[i];
      }
      let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
      
      if (parseInt(cnpj.charAt(12)) !== digit1 || parseInt(cnpj.charAt(13)) !== digit2) {
        return { valid: false, message: 'CNPJ inválido' };
      }
      
      return { valid: true };
    });
    
    this.addRule('cep', (value) => {
      if (!value) return { valid: true };
      
      const cep = value.replace(/\D/g, '');
      if (cep.length !== 8) {
        return { valid: false, message: 'CEP deve ter 8 dígitos' };
      }
      return { valid: true };
    });
    
    this.addRule('date', (value) => {
      if (!value) return { valid: true };
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, message: 'Data inválida' };
      }
      return { valid: true };
    });
    
    this.addRule('minDate', (value, params) => {
      if (!value) return { valid: true };
      
      const date = new Date(value);
      const minDate = new Date(params.value || params);
      
      if (date < minDate) {
        return { 
          valid: false, 
          message: `Data deve ser posterior a ${minDate.toLocaleDateString()}` 
        };
      }
      return { valid: true };
    });
    
    this.addRule('maxDate', (value, params) => {
      if (!value) return { valid: true };
      
      const date = new Date(value);
      const maxDate = new Date(params.value || params);
      
      if (date > maxDate) {
        return { 
          valid: false, 
          message: `Data deve ser anterior a ${maxDate.toLocaleDateString()}` 
        };
      }
      return { valid: true };
    });
    
    this.addRule('numeric', (value) => {
      if (!value) return { valid: true };
      
      if (isNaN(value) || isNaN(parseFloat(value))) {
        return { valid: false, message: 'Deve ser um número válido' };
      }
      return { valid: true };
    });
    
    this.addRule('min', (value, params) => {
      if (!value) return { valid: true };
      
      const num = parseFloat(value);
      const min = parseFloat(params.value || params);
      
      if (num < min) {
        return { valid: false, message: `Valor deve ser maior ou igual a ${min}` };
      }
      return { valid: true };
    });
    
    this.addRule('max', (value, params) => {
      if (!value) return { valid: true };
      
      const num = parseFloat(value);
      const max = parseFloat(params.value || params);
      
      if (num > max) {
        return { valid: false, message: `Valor deve ser menor ou igual a ${max}` };
      }
      return { valid: true };
    });
    
    this.addRule('pattern', (value, params) => {
      if (!value) return { valid: true };
      
      const pattern = new RegExp(params.value || params);
      if (!pattern.test(value)) {
        return { 
          valid: false, 
          message: params.message || 'Formato inválido' 
        };
      }
      return { valid: true };
    });
    
    this.addRule('url', (value) => {
      if (!value) return { valid: true };
      
      try {
        new URL(value);
        return { valid: true };
      } catch {
        return { valid: false, message: 'URL inválida' };
      }
    });
    
    this.addRule('strongPassword', (value) => {
      if (!value) return { valid: true };
      
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const hasMinLength = value.length >= 8;
      
      if (!hasMinLength) {
        return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
      }
      
      if (!hasLower) {
        return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
      }
      
      if (!hasUpper) {
        return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
      }
      
      if (!hasNumber) {
        return { valid: false, message: 'Senha deve conter pelo menos um número' };
      }
      
      if (!hasSpecial) {
        return { valid: false, message: 'Senha deve conter pelo menos um caractere especial' };
      }
      
      return { valid: true };
    });
    
    this.addRule('confirmPassword', (value, params, allValues) => {
      if (!value) return { valid: true };
      
      const passwordField = params.field || 'password';
      const originalPassword = allValues[passwordField];
      
      if (value !== originalPassword) {
        return { valid: false, message: 'Senhas não coincidem' };
      }
      return { valid: true };
    });
  }
  
  /**
   * Adiciona uma regra de validação customizada
   * @param {string} name - Nome da regra
   * @param {Function} validator - Função validadora
   */
  addRule(name, validator) {
    this.rules.set(name, validator);
  }
  
  /**
   * Remove uma regra de validação
   * @param {string} name - Nome da regra
   */
  removeRule(name) {
    this.rules.delete(name);
  }
  
  /**
   * Valida um valor único
   * @param {*} value - Valor a ser validado
   * @param {Array|Object} rules - Regras de validação
   * @param {Object} allValues - Todos os valores (para validações cruzadas)
   * @returns {Object} Resultado da validação
   */
  validateValue(value, rules, allValues = {}) {
    const errors = [];
    
    // Normalizar regras para array
    const rulesArray = Array.isArray(rules) ? rules : [rules];
    
    for (const rule of rulesArray) {
      let ruleName, ruleParams;
      
      if (typeof rule === 'string') {
        ruleName = rule;
        ruleParams = null;
      } else if (typeof rule === 'object') {
        ruleName = rule.rule || rule.name;
        ruleParams = rule.params || rule.value;
      }
      
      if (!this.rules.has(ruleName)) {
        this.errorHandler.handleError({
          type: 'validation',
          message: `Regra de validação '${ruleName}' não encontrada`,
          context: { rule: ruleName, value }
        });
        continue;
      }
      
      try {
        const validator = this.rules.get(ruleName);
        const result = validator(value, ruleParams, allValues);
        
        if (!result.valid) {
          errors.push({
            rule: ruleName,
            message: result.message,
            params: ruleParams
          });
        }
      } catch (error) {
        this.errorHandler.handleError({
          type: 'validation',
          message: `Erro ao executar validação '${ruleName}': ${error.message}`,
          error,
          context: { rule: ruleName, value, params: ruleParams }
        });
        
        errors.push({
          rule: ruleName,
          message: 'Erro interno de validação',
          params: ruleParams
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valida um objeto completo
   * @param {Object} data - Dados a serem validados
   * @param {Object} schema - Schema de validação
   * @returns {Object} Resultado da validação
   */
  validate(data, schema) {
    const errors = {};
    let isValid = true;
    
    // Validar cada campo do schema
    for (const [fieldName, fieldRules] of Object.entries(schema)) {
      const fieldValue = this.getNestedValue(data, fieldName);
      const result = this.validateValue(fieldValue, fieldRules, data);
      
      if (!result.valid) {
        errors[fieldName] = result.errors;
        isValid = false;
      }
    }
    
    return {
      valid: isValid,
      errors
    };
  }
  
  /**
   * Valida um formulário HTML
   * @param {HTMLFormElement} form - Elemento do formulário
   * @param {Object} schema - Schema de validação (opcional)
   * @returns {Object} Resultado da validação
   */
  validateForm(form, schema = null) {
    const formData = new FormData(form);
    const data = {};
    
    // Converter FormData para objeto
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Campo com múltiplos valores (checkbox, select multiple)
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
    
    // Incluir campos não capturados pelo FormData (checkboxes desmarcados)
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' && !input.checked && !data.hasOwnProperty(input.name)) {
        data[input.name] = false;
      }
    });
    
    // Usar schema fornecido ou extrair do HTML
    const validationSchema = schema || this.extractSchemaFromForm(form);
    
    return this.validate(data, validationSchema);
  }
  
  /**
   * Extrai schema de validação dos atributos HTML
   * @param {HTMLFormElement} form - Elemento do formulário
   * @returns {Object} Schema de validação
   */
  extractSchemaFromForm(form) {
    const schema = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const rules = [];
      const { name, type, required, minLength, maxLength, min, max, pattern } = input;
      
      if (!name) return;
      
      // Required
      if (required) {
        rules.push('required');
      }
      
      // Tipo específico
      if (type === 'email') {
        rules.push('email');
      } else if (type === 'url') {
        rules.push('url');
      } else if (type === 'number') {
        rules.push('numeric');
      } else if (type === 'date') {
        rules.push('date');
      }
      
      // Comprimento
      if (minLength) {
        rules.push({ rule: 'minLength', params: parseInt(minLength) });
      }
      if (maxLength) {
        rules.push({ rule: 'maxLength', params: parseInt(maxLength) });
      }
      
      // Valores numéricos
      if (min !== '') {
        rules.push({ rule: 'min', params: parseFloat(min) });
      }
      if (max !== '') {
        rules.push({ rule: 'max', params: parseFloat(max) });
      }
      
      // Pattern
      if (pattern) {
        rules.push({ rule: 'pattern', params: pattern });
      }
      
      // Atributos customizados
      const customRules = input.getAttribute('data-validation');
      if (customRules) {
        try {
          const parsed = JSON.parse(customRules);
          rules.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        } catch (error) {
          this.errorHandler.handleError({
            type: 'validation',
            message: `Erro ao parsear regras customizadas para campo '${name}': ${error.message}`,
            error,
            context: { field: name, rules: customRules }
          });
        }
      }
      
      if (rules.length > 0) {
        schema[name] = rules;
      }
    });
    
    return schema;
  }
  
  /**
   * Obtém valor aninhado de um objeto
   * @param {Object} obj - Objeto
   * @param {string} path - Caminho do valor (ex: 'user.address.street')
   * @returns {*} Valor encontrado
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  /**
   * Aplica validação em tempo real a um formulário
   * @param {HTMLFormElement} form - Elemento do formulário
   * @param {Object} options - Opções de configuração
   */
  enableRealTimeValidation(form, options = {}) {
    const {
      schema = null,
      debounceDelay = 300,
      validateOnBlur = true,
      validateOnInput = true,
      showErrors = true
    } = options;
    
    const validationSchema = schema || this.extractSchemaFromForm(form);
    const debounceTimers = new Map();
    
    // Função para validar campo individual
    const validateField = (input) => {
      const fieldName = input.name;
      if (!fieldName || !validationSchema[fieldName]) return;
      
      const formData = new FormData(form);
      const allValues = Object.fromEntries(formData.entries());
      const fieldValue = allValues[fieldName];
      
      const result = this.validateValue(fieldValue, validationSchema[fieldName], allValues);
      
      if (showErrors) {
        this.displayFieldErrors(input, result.errors);
      }
      
      // Emitir evento customizado
      input.dispatchEvent(new CustomEvent('fieldValidated', {
        detail: { valid: result.valid, errors: result.errors }
      }));
      
      return result;
    };
    
    // Função debounced para validação
    const debouncedValidate = (input) => {
      const fieldName = input.name;
      
      if (debounceTimers.has(fieldName)) {
        clearTimeout(debounceTimers.get(fieldName));
      }
      
      const timer = setTimeout(() => {
        validateField(input);
        debounceTimers.delete(fieldName);
      }, debounceDelay);
      
      debounceTimers.set(fieldName, timer);
    };
    
    // Adicionar event listeners
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (validateOnInput) {
        input.addEventListener('input', () => debouncedValidate(input));
      }
      
      if (validateOnBlur) {
        input.addEventListener('blur', () => validateField(input));
      }
    });
    
    // Validação no submit
    form.addEventListener('submit', (event) => {
      const result = this.validateForm(form, validationSchema);
      
      if (!result.valid) {
        event.preventDefault();
        
        if (showErrors) {
          this.displayFormErrors(form, result.errors);
        }
        
        // Focar no primeiro campo com erro
        const firstErrorField = form.querySelector('.field--error input, .field--error select, .field--error textarea');
        if (firstErrorField) {
          firstErrorField.focus();
        }
      }
      
      // Emitir evento customizado
      form.dispatchEvent(new CustomEvent('formValidated', {
        detail: { valid: result.valid, errors: result.errors }
      }));
    });
  }
  
  /**
   * Exibe erros de um campo específico
   * @param {HTMLElement} input - Elemento do campo
   * @param {Array} errors - Lista de erros
   */
  displayFieldErrors(input, errors) {
    const fieldContainer = input.closest('.field') || input.parentNode;
    
    // Remover erros anteriores
    fieldContainer.classList.remove('field--error');
    const existingErrors = fieldContainer.querySelectorAll('.field-message--error');
    existingErrors.forEach(error => error.remove());
    
    if (errors.length > 0) {
      fieldContainer.classList.add('field--error');
      
      // Adicionar mensagem de erro
      const errorElement = document.createElement('div');
      errorElement.className = 'field-message field-message--error';
      errorElement.textContent = errors[0].message; // Mostrar apenas o primeiro erro
      
      fieldContainer.appendChild(errorElement);
    }
  }
  
  /**
   * Exibe erros de todo o formulário
   * @param {HTMLFormElement} form - Elemento do formulário
   * @param {Object} errors - Objeto com erros por campo
   */
  displayFormErrors(form, errors) {
    Object.keys(errors).forEach(fieldName => {
      const input = form.querySelector(`[name="${fieldName}"]`);
      if (input) {
        this.displayFieldErrors(input, errors[fieldName]);
      }
    });
  }
  
  /**
   * Limpa todos os erros de validação do formulário
   * @param {HTMLFormElement} form - Elemento do formulário
   */
  clearFormErrors(form) {
    const errorFields = form.querySelectorAll('.field--error');
    errorFields.forEach(field => {
      field.classList.remove('field--error');
    });
    
    const errorMessages = form.querySelectorAll('.field-message--error');
    errorMessages.forEach(message => message.remove());
  }
}

/**
 * Instância global do validador
 */
let globalValidator = null;

/**
 * Obtém instância global do validador
 * @returns {Validator} Instância do validador
 */
export function getValidator() {
  if (!globalValidator) {
    globalValidator = new Validator();
    
    // Disponibilizar globalmente para debug
    if (typeof window !== 'undefined') {
      window.validator = globalValidator;
    }
  }
  
  return globalValidator;
}

/**
 * Funções utilitárias para validação
 */
export const ValidationUtils = {
  /**
   * Sanitiza string removendo caracteres perigosos
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/[<>"'&]/g, (match) => {
        const entities = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match];
      })
      .trim();
  },
  
  /**
   * Normaliza telefone removendo formatação
   * @param {string} phone - Telefone formatado
   * @returns {string} Telefone limpo
   */
  normalizePhone(phone) {
    return phone ? phone.replace(/\D/g, '') : '';
  },
  
  /**
   * Normaliza CPF/CNPJ removendo formatação
   * @param {string} document - Documento formatado
   * @returns {string} Documento limpo
   */
  normalizeDocument(document) {
    return document ? document.replace(/\D/g, '') : '';
  },
  
  /**
   * Normaliza CEP removendo formatação
   * @param {string} cep - CEP formatado
   * @returns {string} CEP limpo
   */
  normalizeCep(cep) {
    return cep ? cep.replace(/\D/g, '') : '';
  },
  
  /**
   * Verifica se uma data está no futuro
   * @param {string|Date} date - Data a ser verificada
   * @returns {boolean} True se estiver no futuro
   */
  isFutureDate(date) {
    const inputDate = new Date(date);
    const now = new Date();
    return inputDate > now;
  },
  
  /**
   * Verifica se uma data está no passado
   * @param {string|Date} date - Data a ser verificada
   * @returns {boolean} True se estiver no passado
   */
  isPastDate(date) {
    const inputDate = new Date(date);
    const now = new Date();
    return inputDate < now;
  },
  
  /**
   * Calcula idade baseada na data de nascimento
   * @param {string|Date} birthDate - Data de nascimento
   * @returns {number} Idade em anos
   */
  calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
};

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  getValidator();
}

export default Validator;