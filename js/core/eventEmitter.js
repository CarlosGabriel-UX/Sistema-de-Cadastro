/**
 * =============================================================================
 * SISTEMA DE EVENTOS (EVENT EMITTER)
 * Sistema robusto para gerenciamento de eventos customizados
 * =============================================================================
 */

/**
 * Classe EventEmitter para gerenciamento de eventos
 */
export class EventEmitter {
  constructor() {
    this.events = new Map();
    this.maxListeners = 10;
    this.onceListeners = new WeakSet();
  }
  
  /**
   * Adiciona um listener para um evento
   * @param {string} event - Nome do evento
   * @param {Function} listener - Função callback
   * @param {Object} options - Opções do listener
   * @returns {EventEmitter} Instância para chaining
   */
  on(event, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener deve ser uma função');
    }
    
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    
    // Verificar limite de listeners
    if (listeners.length >= this.maxListeners) {
      console.warn(`Muitos listeners para o evento '${event}'. Limite: ${this.maxListeners}`);
    }
    
    // Adicionar metadados ao listener
    const listenerData = {
      fn: listener,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null,
      id: options.id || this.generateListenerId()
    };
    
    listeners.push(listenerData);
    
    // Ordenar por prioridade (maior prioridade primeiro)
    listeners.sort((a, b) => b.priority - a.priority);
    
    return this;
  }
  
  /**
   * Adiciona um listener que será executado apenas uma vez
   * @param {string} event - Nome do evento
   * @param {Function} listener - Função callback
   * @param {Object} options - Opções do listener
   * @returns {EventEmitter} Instância para chaining
   */
  once(event, listener, options = {}) {
    return this.on(event, listener, { ...options, once: true });
  }
  
  /**
   * Remove um listener específico
   * @param {string} event - Nome do evento
   * @param {Function|string} listener - Função ou ID do listener
   * @returns {EventEmitter} Instância para chaining
   */
  off(event, listener) {
    if (!this.events.has(event)) {
      return this;
    }
    
    const listeners = this.events.get(event);
    
    if (typeof listener === 'string') {
      // Remover por ID
      const index = listeners.findIndex(l => l.id === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    } else if (typeof listener === 'function') {
      // Remover por função
      const index = listeners.findIndex(l => l.fn === listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
    
    // Remover evento se não há mais listeners
    if (listeners.length === 0) {
      this.events.delete(event);
    }
    
    return this;
  }
  
  /**
   * Remove todos os listeners de um evento
   * @param {string} event - Nome do evento (opcional)
   * @returns {EventEmitter} Instância para chaining
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    
    return this;
  }
  
  /**
   * Emite um evento
   * @param {string} event - Nome do evento
   * @param {...any} args - Argumentos para os listeners
   * @returns {boolean} True se havia listeners
   */
  emit(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }
    
    const listeners = this.events.get(event).slice(); // Cópia para evitar modificações durante iteração
    let hasListeners = false;
    
    for (const listenerData of listeners) {
      hasListeners = true;
      
      try {
        // Executar listener com contexto se especificado
        if (listenerData.context) {
          listenerData.fn.call(listenerData.context, ...args);
        } else {
          listenerData.fn(...args);
        }
        
        // Remover listener 'once' após execução
        if (listenerData.once) {
          this.off(event, listenerData.fn);
        }
      } catch (error) {
        console.error(`Erro ao executar listener para evento '${event}':`, error);
        
        // Emitir evento de erro se não for o próprio evento de erro
        if (event !== 'error') {
          this.emit('error', error, { event, listener: listenerData });
        }
      }
    }
    
    return hasListeners;
  }
  
  /**
   * Emite um evento de forma assíncrona
   * @param {string} event - Nome do evento
   * @param {...any} args - Argumentos para os listeners
   * @returns {Promise<boolean>} Promise que resolve com true se havia listeners
   */
  async emitAsync(event, ...args) {
    if (!this.events.has(event)) {
      return false;
    }
    
    const listeners = this.events.get(event).slice();
    let hasListeners = false;
    
    for (const listenerData of listeners) {
      hasListeners = true;
      
      try {
        let result;
        
        if (listenerData.context) {
          result = listenerData.fn.call(listenerData.context, ...args);
        } else {
          result = listenerData.fn(...args);
        }
        
        // Aguardar se for uma Promise
        if (result && typeof result.then === 'function') {
          await result;
        }
        
        // Remover listener 'once' após execução
        if (listenerData.once) {
          this.off(event, listenerData.fn);
        }
      } catch (error) {
        console.error(`Erro ao executar listener assíncrono para evento '${event}':`, error);
        
        if (event !== 'error') {
          this.emit('error', error, { event, listener: listenerData });
        }
      }
    }
    
    return hasListeners;
  }
  
  /**
   * Obtém lista de eventos registrados
   * @returns {Array<string>} Lista de eventos
   */
  eventNames() {
    return Array.from(this.events.keys());
  }
  
  /**
   * Obtém número de listeners para um evento
   * @param {string} event - Nome do evento
   * @returns {number} Número de listeners
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
  
  /**
   * Obtém listeners de um evento
   * @param {string} event - Nome do evento
   * @returns {Array<Function>} Array de listeners
   */
  listeners(event) {
    if (!this.events.has(event)) {
      return [];
    }
    
    return this.events.get(event).map(listenerData => listenerData.fn);
  }
  
  /**
   * Define o número máximo de listeners por evento
   * @param {number} n - Número máximo
   * @returns {EventEmitter} Instância para chaining
   */
  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0) {
      throw new TypeError('Número máximo deve ser um número não negativo');
    }
    
    this.maxListeners = n;
    return this;
  }
  
  /**
   * Obtém o número máximo de listeners
   * @returns {number} Número máximo de listeners
   */
  getMaxListeners() {
    return this.maxListeners;
  }
  
  /**
   * Gera ID único para listener
   * @returns {string} ID do listener
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Adiciona listener com debounce
   * @param {string} event - Nome do evento
   * @param {Function} listener - Função callback
   * @param {number} delay - Delay em ms
   * @param {Object} options - Opções adicionais
   * @returns {EventEmitter} Instância para chaining
   */
  onDebounced(event, listener, delay = 300, options = {}) {
    let timeoutId;
    
    const debouncedListener = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        listener(...args);
      }, delay);
    };
    
    return this.on(event, debouncedListener, options);
  }
  
  /**
   * Adiciona listener com throttle
   * @param {string} event - Nome do evento
   * @param {Function} listener - Função callback
   * @param {number} limit - Limite em ms
   * @param {Object} options - Opções adicionais
   * @returns {EventEmitter} Instância para chaining
   */
  onThrottled(event, listener, limit = 100, options = {}) {
    let inThrottle;
    
    const throttledListener = (...args) => {
      if (!inThrottle) {
        listener(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
    
    return this.on(event, throttledListener, options);
  }
  
  /**
   * Cria um proxy para eventos com namespace
   * @param {string} namespace - Namespace dos eventos
   * @returns {Object} Proxy com métodos do EventEmitter
   */
  namespace(namespace) {
    const self = this;
    
    return {
      on(event, listener, options) {
        return self.on(`${namespace}:${event}`, listener, options);
      },
      
      once(event, listener, options) {
        return self.once(`${namespace}:${event}`, listener, options);
      },
      
      off(event, listener) {
        return self.off(`${namespace}:${event}`, listener);
      },
      
      emit(event, ...args) {
        return self.emit(`${namespace}:${event}`, ...args);
      },
      
      emitAsync(event, ...args) {
        return self.emitAsync(`${namespace}:${event}`, ...args);
      }
    };
  }
  
  /**
   * Pipe eventos de um EventEmitter para outro
   * @param {EventEmitter} target - EventEmitter de destino
   * @param {Array<string>} events - Eventos para fazer pipe (opcional)
   * @returns {Function} Função para desfazer o pipe
   */
  pipe(target, events = null) {
    if (!(target instanceof EventEmitter)) {
      throw new TypeError('Target deve ser uma instância de EventEmitter');
    }
    
    const eventsToWatch = events || this.eventNames();
    const listeners = [];
    
    eventsToWatch.forEach(event => {
      const listener = (...args) => {
        target.emit(event, ...args);
      };
      
      this.on(event, listener);
      listeners.push({ event, listener });
    });
    
    // Retornar função para desfazer o pipe
    return () => {
      listeners.forEach(({ event, listener }) => {
        this.off(event, listener);
      });
    };
  }
  
  /**
   * Aguarda por um evento específico
   * @param {string} event - Nome do evento
   * @param {number} timeout - Timeout em ms (opcional)
   * @returns {Promise} Promise que resolve com os argumentos do evento
   */
  waitFor(event, timeout = null) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const listener = (...args) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.off(event, listener);
        resolve(args);
      };
      
      this.once(event, listener);
      
      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`Timeout aguardando evento '${event}'`));
        }, timeout);
      }
    });
  }
  
  /**
   * Obtém estatísticas do EventEmitter
   * @returns {Object} Estatísticas
   */
  getStats() {
    const stats = {
      totalEvents: this.events.size,
      totalListeners: 0,
      eventDetails: {},
      maxListeners: this.maxListeners
    };
    
    this.events.forEach((listeners, event) => {
      stats.totalListeners += listeners.length;
      stats.eventDetails[event] = {
        listenerCount: listeners.length,
        hasOnceListeners: listeners.some(l => l.once),
        priorities: listeners.map(l => l.priority)
      };
    });
    
    return stats;
  }
}

/**
 * EventEmitter global para comunicação entre módulos
 */
let globalEventBus = null;

/**
 * Obtém instância global do event bus
 * @returns {EventEmitter} Instância global
 */
export function getGlobalEventBus() {
  if (!globalEventBus) {
    globalEventBus = new EventEmitter();
    globalEventBus.setMaxListeners(50); // Limite maior para uso global
    
    // Disponibilizar globalmente para debug
    if (typeof window !== 'undefined') {
      window.eventBus = globalEventBus;
    }
  }
  
  return globalEventBus;
}

/**
 * Mixin para adicionar capacidades de EventEmitter a uma classe
 * @param {Function} BaseClass - Classe base
 * @returns {Function} Classe com capacidades de EventEmitter
 */
export function withEventEmitter(BaseClass) {
  return class extends BaseClass {
    constructor(...args) {
      super(...args);
      this._eventEmitter = new EventEmitter();
    }
    
    on(event, listener, options) {
      return this._eventEmitter.on(event, listener, options);
    }
    
    once(event, listener, options) {
      return this._eventEmitter.once(event, listener, options);
    }
    
    off(event, listener) {
      return this._eventEmitter.off(event, listener);
    }
    
    emit(event, ...args) {
      return this._eventEmitter.emit(event, ...args);
    }
    
    emitAsync(event, ...args) {
      return this._eventEmitter.emitAsync(event, ...args);
    }
    
    removeAllListeners(event) {
      return this._eventEmitter.removeAllListeners(event);
    }
    
    listenerCount(event) {
      return this._eventEmitter.listenerCount(event);
    }
    
    eventNames() {
      return this._eventEmitter.eventNames();
    }
  };
}

export default EventEmitter;