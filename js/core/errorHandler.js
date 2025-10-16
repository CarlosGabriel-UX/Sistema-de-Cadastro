/**
 * =============================================================================
 * SISTEMA DE TRATAMENTO DE ERROS E LOGGING
 * Sistema robusto para captura, tratamento e logging de erros
 * =============================================================================
 */

import { APP_CONFIG, CONSTANTS, ERROR_MESSAGES } from './config.js';
import { EventEmitter } from './eventEmitter.js';

/**
 * Classe principal para tratamento de erros
 */
export class ErrorHandler extends EventEmitter {
  constructor() {
    super();
    this.errors = [];
    this.maxErrors = APP_CONFIG.logging.maxLogSize || 1000;
    this.isInitialized = false;
    
    this.init();
  }
  
  /**
   * Inicializa o sistema de tratamento de erros
   */
  init() {
    if (this.isInitialized) return;
    
    // Capturar erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });
    });
    
    // Capturar promises rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || 'Promise rejeitada',
        error: event.reason,
        stack: event.reason?.stack
      });
    });
    
    // Capturar erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: 'resource',
          message: `Falha ao carregar recurso: ${event.target.src || event.target.href}`,
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
    
    this.isInitialized = true;
    this.log('info', 'Sistema de tratamento de erros inicializado');
  }
  
  /**
   * Trata um erro
   * @param {Object|Error} error - Erro a ser tratado
   * @param {Object} context - Contexto adicional
   */
  handleError(error, context = {}) {
    const errorInfo = this.normalizeError(error, context);
    
    // Adicionar à lista de erros
    this.addError(errorInfo);
    
    // Log do erro
    this.log('error', errorInfo.message, errorInfo);
    
    // Emitir evento de erro
    this.emit(CONSTANTS.EVENTS.ERROR_OCCURRED, errorInfo);
    
    // Notificar usuário se necessário
    if (errorInfo.severity === 'high' || errorInfo.userFacing) {
      this.notifyUser(errorInfo);
    }
    
    // Enviar para servidor se configurado
    if (APP_CONFIG.logging.remote) {
      this.sendToServer(errorInfo);
    }
    
    return errorInfo;
  }
  
  /**
   * Normaliza diferentes tipos de erro para um formato padrão
   * @param {*} error - Erro original
   * @param {Object} context - Contexto adicional
   * @returns {Object} Erro normalizado
   */
  normalizeError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const id = this.generateErrorId();
    
    let errorInfo = {
      id,
      timestamp,
      type: 'unknown',
      message: 'Erro desconhecido',
      severity: 'medium',
      userFacing: false,
      context: { ...context },
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: null
    };
    
    if (error instanceof Error) {
      errorInfo = {
        ...errorInfo,
        type: 'javascript',
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    } else if (typeof error === 'object' && error !== null) {
      errorInfo = { ...errorInfo, ...error };
    } else if (typeof error === 'string') {
      errorInfo.message = error;
    }
    
    // Determinar severidade baseada no tipo e contexto
    errorInfo.severity = this.determineSeverity(errorInfo);
    
    return errorInfo;
  }
  
  /**
   * Determina a severidade do erro
   * @param {Object} errorInfo - Informações do erro
   * @returns {string} Nível de severidade
   */
  determineSeverity(errorInfo) {
    // Erros críticos
    if (errorInfo.type === 'security' || 
        errorInfo.message.includes('Permission denied') ||
        errorInfo.message.includes('Unauthorized')) {
      return 'critical';
    }
    
    // Erros altos
    if (errorInfo.type === 'network' ||
        errorInfo.type === 'api' ||
        errorInfo.message.includes('Failed to fetch') ||
        errorInfo.message.includes('Network error')) {
      return 'high';
    }
    
    // Erros médios
    if (errorInfo.type === 'validation' ||
        errorInfo.type === 'form' ||
        errorInfo.type === 'user_input') {
      return 'medium';
    }
    
    // Erros baixos
    if (errorInfo.type === 'ui' ||
        errorInfo.type === 'cosmetic') {
      return 'low';
    }
    
    return 'medium';
  }
  
  /**
   * Adiciona erro à lista
   * @param {Object} errorInfo - Informações do erro
   */
  addError(errorInfo) {
    this.errors.unshift(errorInfo);
    
    // Manter apenas os últimos N erros
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }
  
  /**
   * Gera ID único para o erro
   * @returns {string} ID do erro
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Notifica o usuário sobre o erro
   * @param {Object} errorInfo - Informações do erro
   */
  notifyUser(errorInfo) {
    const message = this.getUserFriendlyMessage(errorInfo);
    
    // Usar sistema de notificações se disponível
    if (window.NotificationSystem) {
      window.NotificationSystem.show({
        type: 'error',
        title: 'Erro',
        message,
        duration: 5000
      });
    } else {
      // Fallback para alert
      console.error('Erro:', message);
    }
  }
  
  /**
   * Converte erro técnico em mensagem amigável
   * @param {Object} errorInfo - Informações do erro
   * @returns {string} Mensagem amigável
   */
  getUserFriendlyMessage(errorInfo) {
    const { type, message } = errorInfo;
    
    // Mapeamento de erros técnicos para mensagens amigáveis
    const messageMap = {
      'network': ERROR_MESSAGES.NETWORK_ERROR,
      'api': ERROR_MESSAGES.SERVER_ERROR,
      'validation': ERROR_MESSAGES.VALIDATION_ERROR,
      'permission': ERROR_MESSAGES.PERMISSION_DENIED,
      'session': ERROR_MESSAGES.SESSION_EXPIRED
    };
    
    // Verificar padrões na mensagem
    if (message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (message.includes('401') || message.includes('Unauthorized')) {
      return ERROR_MESSAGES.SESSION_EXPIRED;
    }
    
    if (message.includes('403') || message.includes('Forbidden')) {
      return ERROR_MESSAGES.PERMISSION_DENIED;
    }
    
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    
    return messageMap[type] || 'Ocorreu um erro inesperado. Tente novamente.';
  }
  
  /**
   * Envia erro para o servidor
   * @param {Object} errorInfo - Informações do erro
   */
  async sendToServer(errorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...errorInfo,
          // Remover informações sensíveis
          userAgent: undefined,
          stack: errorInfo.stack ? errorInfo.stack.substring(0, 1000) : undefined
        })
      });
    } catch (error) {
      // Falha silenciosa para evitar loop de erros
      console.warn('Falha ao enviar erro para servidor:', error);
    }
  }
  
  /**
   * Registra log
   * @param {string} level - Nível do log
   * @param {string} message - Mensagem
   * @param {Object} data - Dados adicionais
   */
  log(level, message, data = {}) {
    const logLevel = CONSTANTS.LOG_LEVELS[level.toUpperCase()] || CONSTANTS.LOG_LEVELS.INFO;
    const configLevel = CONSTANTS.LOG_LEVELS[APP_CONFIG.logging.level.toUpperCase()] || CONSTANTS.LOG_LEVELS.INFO;
    
    // Verificar se deve fazer log baseado no nível configurado
    if (logLevel < configLevel) {
      return;
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data
    };
    
    // Log no console se habilitado
    if (APP_CONFIG.logging.console) {
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${logEntry.timestamp}] ${logEntry.level}: ${message}`, data);
    }
    
    // Emitir evento de log
    this.emit('log', logEntry);
  }
  
  /**
   * Obtém lista de erros
   * @param {Object} filters - Filtros opcionais
   * @returns {Array} Lista de erros
   */
  getErrors(filters = {}) {
    let filteredErrors = [...this.errors];
    
    if (filters.type) {
      filteredErrors = filteredErrors.filter(error => error.type === filters.type);
    }
    
    if (filters.severity) {
      filteredErrors = filteredErrors.filter(error => error.severity === filters.severity);
    }
    
    if (filters.since) {
      const sinceDate = new Date(filters.since);
      filteredErrors = filteredErrors.filter(error => new Date(error.timestamp) >= sinceDate);
    }
    
    if (filters.limit) {
      filteredErrors = filteredErrors.slice(0, filters.limit);
    }
    
    return filteredErrors;
  }
  
  /**
   * Limpa lista de erros
   * @param {Object} filters - Filtros opcionais
   */
  clearErrors(filters = {}) {
    if (Object.keys(filters).length === 0) {
      this.errors = [];
    } else {
      const errorsToKeep = this.errors.filter(error => {
        if (filters.type && error.type === filters.type) return false;
        if (filters.severity && error.severity === filters.severity) return false;
        if (filters.before) {
          const beforeDate = new Date(filters.before);
          if (new Date(error.timestamp) < beforeDate) return false;
        }
        return true;
      });
      
      this.errors = errorsToKeep;
    }
    
    this.log('info', 'Erros limpos', filters);
  }
  
  /**
   * Obtém estatísticas de erros
   * @returns {Object} Estatísticas
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: 0 // últimas 24 horas
    };
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    this.errors.forEach(error => {
      // Por tipo
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Por severidade
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Recentes
      if (new Date(error.timestamp) >= oneDayAgo) {
        stats.recent++;
      }
    });
    
    return stats;
  }
}

/**
 * Funções utilitárias para tratamento de erros específicos
 */
export class ErrorUtils {
  /**
   * Trata erros de validação de formulário
   * @param {Object} validationErrors - Erros de validação
   * @param {HTMLFormElement} form - Elemento do formulário
   */
  static handleValidationErrors(validationErrors, form) {
    Object.keys(validationErrors).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      const error = validationErrors[fieldName];
      
      if (field) {
        field.classList.add('error');
        
        // Remover mensagem de erro anterior
        const existingError = field.parentNode.querySelector('.field-message--error');
        if (existingError) {
          existingError.remove();
        }
        
        // Adicionar nova mensagem de erro
        const errorElement = document.createElement('div');
        errorElement.className = 'field-message field-message--error';
        errorElement.textContent = error.message || error;
        field.parentNode.appendChild(errorElement);
      }
    });
  }
  
  /**
   * Trata erros de rede/API
   * @param {Error} error - Erro de rede
   * @param {Object} context - Contexto da requisição
   */
  static handleNetworkError(error, context = {}) {
    const errorHandler = window.errorHandler || new ErrorHandler();
    
    errorHandler.handleError({
      type: 'network',
      message: error.message,
      error,
      context: {
        url: context.url,
        method: context.method,
        status: context.status
      },
      userFacing: true
    });
  }
  
  /**
   * Wrapper para funções assíncronas com tratamento de erro
   * @param {Function} asyncFn - Função assíncrona
   * @param {Object} context - Contexto adicional
   * @returns {Function} Função com tratamento de erro
   */
  static withErrorHandling(asyncFn, context = {}) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        const errorHandler = window.errorHandler || new ErrorHandler();
        errorHandler.handleError(error, context);
        throw error; // Re-throw para permitir tratamento específico
      }
    };
  }
  
  /**
   * Retry com backoff exponencial
   * @param {Function} fn - Função a ser executada
   * @param {number} maxRetries - Número máximo de tentativas
   * @param {number} baseDelay - Delay base em ms
   * @returns {Promise} Resultado da função
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Calcular delay com backoff exponencial
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// Instância global do tratador de erros
let globalErrorHandler = null;

/**
 * Obtém instância global do tratador de erros
 * @returns {ErrorHandler} Instância do tratador
 */
export function getErrorHandler() {
  if (!globalErrorHandler) {
    globalErrorHandler = new ErrorHandler();
    
    // Disponibilizar globalmente para debug
    if (typeof window !== 'undefined') {
      window.errorHandler = globalErrorHandler;
    }
  }
  
  return globalErrorHandler;
}

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  getErrorHandler();
}

export default ErrorHandler;