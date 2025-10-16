/**
 * =============================================================================
 * MÓDULO DE CONFIGURAÇÃO CENTRAL
 * Sistema centralizado de configurações e constantes da aplicação
 * =============================================================================
 */

/**
 * Configurações principais da aplicação
 */
export const APP_CONFIG = {
  // Informações da aplicação
  name: 'Sistema de Cadastro',
  version: '2.0.0',
  environment: 'production',
  
  // Configurações de API
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Configurações de UI
  ui: {
    theme: 'light',
    language: 'pt-BR',
    animations: true,
    reducedMotion: false,
    autoSave: true,
    autoSaveInterval: 30000
  },
  
  // Configurações de validação
  validation: {
    realTimeValidation: true,
    showValidationOnBlur: true,
    showValidationOnSubmit: true,
    debounceDelay: 300
  },
  
  // Configurações de performance
  performance: {
    lazyLoading: true,
    imageOptimization: true,
    cacheEnabled: true,
    cacheExpiration: 3600000, // 1 hora
    maxCacheSize: 50 // MB
  },
  
  // Configurações de acessibilidade
  accessibility: {
    highContrast: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true
  },
  
  // Configurações de logging
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    console: true,
    remote: false,
    maxLogSize: 1000
  }
};

/**
 * Constantes da aplicação
 */
export const CONSTANTS = {
  // Tipos de eventos
  EVENTS: {
    FORM_SUBMIT: 'form:submit',
    FORM_VALIDATE: 'form:validate',
    FORM_RESET: 'form:reset',
    FIELD_CHANGE: 'field:change',
    FIELD_FOCUS: 'field:focus',
    FIELD_BLUR: 'field:blur',
    THEME_CHANGE: 'theme:change',
    MODAL_OPEN: 'modal:open',
    MODAL_CLOSE: 'modal:close',
    NOTIFICATION_SHOW: 'notification:show',
    NOTIFICATION_HIDE: 'notification:hide',
    DATA_LOAD: 'data:load',
    DATA_SAVE: 'data:save',
    ERROR_OCCURRED: 'error:occurred'
  },
  
  // Tipos de validação
  VALIDATION_TYPES: {
    REQUIRED: 'required',
    EMAIL: 'email',
    PHONE: 'phone',
    CPF: 'cpf',
    CNPJ: 'cnpj',
    CEP: 'cep',
    DATE: 'date',
    NUMBER: 'number',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    CUSTOM: 'custom'
  },
  
  // Estados de formulário
  FORM_STATES: {
    IDLE: 'idle',
    VALIDATING: 'validating',
    SUBMITTING: 'submitting',
    SUCCESS: 'success',
    ERROR: 'error'
  },
  
  // Tipos de notificação
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  
  // Níveis de log
  LOG_LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  // Códigos de status HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  
  // Tamanhos de arquivo
  FILE_SIZES: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
    CHUNK_SIZE: 1024 * 1024 // 1MB
  },
  
  // Formatos de arquivo permitidos
  ALLOWED_FILE_TYPES: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    SPREADSHEETS: ['xls', 'xlsx', 'csv']
  },
  
  // Expressões regulares
  REGEX: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    CEP: /^\d{5}-?\d{3}$/,
    ONLY_NUMBERS: /^\d+$/,
    ONLY_LETTERS: /^[a-zA-ZÀ-ÿ\s]+$/,
    ALPHANUMERIC: /^[a-zA-Z0-9À-ÿ\s]+$/
  },
  
  // Máscaras de entrada
  MASKS: {
    CPF: '000.000.000-00',
    CNPJ: '00.000.000/0000-00',
    PHONE: '(00) 00000-0000',
    CEP: '00000-000',
    DATE: '00/00/0000',
    TIME: '00:00',
    CURRENCY: 'R$ 0.000,00'
  },
  
  // Configurações de mapa
  MAP_CONFIG: {
    DEFAULT_ZOOM: 13,
    MIN_ZOOM: 3,
    MAX_ZOOM: 18,
    DEFAULT_CENTER: [-23.5505, -46.6333], // São Paulo
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '© OpenStreetMap contributors'
  },
  
  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
  },
  
  // Timeouts e delays
  TIMEOUTS: {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 100,
    NOTIFICATION_DURATION: 5000,
    TOOLTIP_DELAY: 500,
    ANIMATION_DURATION: 300,
    LOADING_DELAY: 200
  }
};

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Digite um email válido',
  INVALID_PHONE: 'Digite um telefone válido',
  INVALID_CPF: 'Digite um CPF válido',
  INVALID_CNPJ: 'Digite um CNPJ válido',
  INVALID_CEP: 'Digite um CEP válido',
  INVALID_DATE: 'Digite uma data válida',
  MIN_LENGTH: 'Mínimo de {min} caracteres',
  MAX_LENGTH: 'Máximo de {max} caracteres',
  NETWORK_ERROR: 'Erro de conexão. Tente novamente.',
  SERVER_ERROR: 'Erro interno do servidor',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: {size}',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  UPLOAD_FAILED: 'Falha no upload do arquivo',
  SAVE_ERROR: 'Erro ao salvar dados',
  LOAD_ERROR: 'Erro ao carregar dados',
  DELETE_ERROR: 'Erro ao excluir dados',
  PERMISSION_DENIED: 'Acesso negado',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.'
};

/**
 * Mensagens de sucesso padrão
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Dados salvos com sucesso!',
  UPDATE_SUCCESS: 'Dados atualizados com sucesso!',
  DELETE_SUCCESS: 'Dados excluídos com sucesso!',
  UPLOAD_SUCCESS: 'Arquivo enviado com sucesso!',
  EMAIL_SENT: 'Email enviado com sucesso!',
  FORM_SUBMITTED: 'Formulário enviado com sucesso!',
  VALIDATION_SUCCESS: 'Todos os campos são válidos',
  OPERATION_COMPLETED: 'Operação concluída com sucesso!'
};

/**
 * Configurações específicas por ambiente
 */
const ENVIRONMENT_CONFIGS = {
  development: {
    logging: {
      level: 'debug',
      console: true,
      remote: false
    },
    api: {
      timeout: 60000
    },
    performance: {
      cacheEnabled: false
    }
  },
  
  staging: {
    logging: {
      level: 'info',
      console: true,
      remote: true
    },
    api: {
      timeout: 45000
    }
  },
  
  production: {
    logging: {
      level: 'warn',
      console: false,
      remote: true
    },
    ui: {
      animations: true
    }
  }
};

/**
 * Função para obter configuração baseada no ambiente
 * @param {string} environment - Ambiente atual
 * @returns {Object} Configuração mesclada
 */
export function getEnvironmentConfig(environment = APP_CONFIG.environment) {
  const envConfig = ENVIRONMENT_CONFIGS[environment] || {};
  return mergeDeep(APP_CONFIG, envConfig);
}

/**
 * Função para mesclar objetos profundamente
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} Objeto mesclado
 */
function mergeDeep(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Função para validar configuração
 * @param {Object} config - Configuração a ser validada
 * @returns {boolean} True se válida
 */
export function validateConfig(config) {
  const requiredKeys = ['name', 'version', 'api', 'ui'];
  
  for (const key of requiredKeys) {
    if (!config[key]) {
      console.error(`Configuração inválida: chave '${key}' é obrigatória`);
      return false;
    }
  }
  
  return true;
}

/**
 * Função para atualizar configuração em tempo de execução
 * @param {string} path - Caminho da configuração (ex: 'ui.theme')
 * @param {*} value - Novo valor
 */
export function updateConfig(path, value) {
  const keys = path.split('.');
  let current = APP_CONFIG;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  
  // Disparar evento de mudança de configuração
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('config:changed', {
      detail: { path, value }
    }));
  }
}

/**
 * Função para obter valor de configuração
 * @param {string} path - Caminho da configuração
 * @param {*} defaultValue - Valor padrão se não encontrado
 * @returns {*} Valor da configuração
 */
export function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let current = APP_CONFIG;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current;
}

// Exportar configuração atual como padrão
export default getEnvironmentConfig();