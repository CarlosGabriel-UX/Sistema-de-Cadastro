/**
 * =============================================================================
 * SISTEMA DE OTIMIZAÇÃO DE PERFORMANCE
 * Sistema completo para otimização de performance com lazy loading, cache e debouncing
 * =============================================================================
 */

import { APP_CONFIG } from './config.js';
import { getErrorHandler } from './errorHandler.js';
import { EventEmitter } from './eventEmitter.js';

/**
 * Classe para gerenciamento de cache inteligente
 */
export class CacheManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutos padrão
    this.cache = new Map();
    this.accessTimes = new Map();
    this.errorHandler = getErrorHandler();
    
    // Limpeza automática
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Limpar a cada minuto
  }
  
  /**
   * Armazena um item no cache
   * @param {string} key - Chave do cache
   * @param {*} value - Valor a ser armazenado
   * @param {number} customTtl - TTL customizado em ms
   */
  set(key, value, customTtl = null) {
    try {
      const ttl = customTtl || this.ttl;
      const expiresAt = Date.now() + ttl;
      
      // Verificar limite de tamanho
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictLeastRecentlyUsed();
      }
      
      this.cache.set(key, {
        value,
        expiresAt,
        createdAt: Date.now(),
        accessCount: 0
      });
      
      this.accessTimes.set(key, Date.now());
      
      this.emit('cache:set', { key, value, expiresAt });
    } catch (error) {
      this.errorHandler.handleError({
        type: 'cache',
        message: `Erro ao armazenar no cache: ${error.message}`,
        error,
        context: { key }
      });
    }
  }
  
  /**
   * Recupera um item do cache
   * @param {string} key - Chave do cache
   * @returns {*} Valor armazenado ou null se não encontrado/expirado
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.emit('cache:miss', { key });
        return null;
      }
      
      // Verificar expiração
      if (Date.now() > item.expiresAt) {
        this.delete(key);
        this.emit('cache:expired', { key });
        return null;
      }
      
      // Atualizar estatísticas de acesso
      item.accessCount++;
      this.accessTimes.set(key, Date.now());
      
      this.emit('cache:hit', { key, value: item.value });
      return item.value;
    } catch (error) {
      this.errorHandler.handleError({
        type: 'cache',
        message: `Erro ao recuperar do cache: ${error.message}`,
        error,
        context: { key }
      });
      return null;
    }
  }
  
  /**
   * Remove um item do cache
   * @param {string} key - Chave do cache
   */
  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
    this.emit('cache:delete', { key });
  }
  
  /**
   * Verifica se uma chave existe no cache
   * @param {string} key - Chave do cache
   * @returns {boolean} True se existe e não expirou
   */
  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Limpa itens expirados
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      this.emit('cache:cleanup', { expiredCount: expiredKeys.length });
    }
  }
  
  /**
   * Remove o item menos recentemente usado
   */
  evictLeastRecentlyUsed() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
      this.emit('cache:evicted', { key: oldestKey });
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessTimes.clear();
    this.emit('cache:cleared', { previousSize: size });
  }
  
  /**
   * Obtém estatísticas do cache
   * @returns {Object} Estatísticas
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalAccessCount = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredCount++;
      }
      totalAccessCount += item.accessCount;
    }
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      totalAccessCount,
      hitRate: this.hitRate || 0
    };
  }
  
  /**
   * Destrói o cache e limpa recursos
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    this.removeAllListeners();
  }
}

/**
 * Classe para lazy loading de recursos
 */
export class LazyLoader extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.rootMargin = options.rootMargin || '50px';
    this.threshold = options.threshold || 0.1;
    this.errorHandler = getErrorHandler();
    
    // Verificar suporte ao IntersectionObserver
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.rootMargin,
          threshold: this.threshold
        }
      );
    } else {
      // Fallback para navegadores antigos
      this.observer = null;
      this.setupScrollFallback();
    }
    
    this.loadedElements = new WeakSet();
    this.loadingElements = new WeakSet();
  }
  
  /**
   * Observa um elemento para lazy loading
   * @param {HTMLElement} element - Elemento a ser observado
   * @param {Object} options - Opções de carregamento
   */
  observe(element, options = {}) {
    if (!element || this.loadedElements.has(element)) {
      return;
    }
    
    // Armazenar opções no elemento
    element._lazyOptions = options;
    
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback: verificar se está visível
      if (this.isElementVisible(element)) {
        this.loadElement(element);
      }
    }
  }
  
  /**
   * Para de observar um elemento
   * @param {HTMLElement} element - Elemento
   */
  unobserve(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }
  
  /**
   * Manipula interseções do IntersectionObserver
   * @param {Array} entries - Entradas de interseção
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        this.unobserve(entry.target);
      }
    });
  }
  
  /**
   * Carrega um elemento
   * @param {HTMLElement} element - Elemento a ser carregado
   */
  async loadElement(element) {
    if (this.loadedElements.has(element) || this.loadingElements.has(element)) {
      return;
    }
    
    this.loadingElements.add(element);
    const options = element._lazyOptions || {};
    
    try {
      this.emit('loading:start', { element, options });
      
      // Diferentes tipos de carregamento
      if (element.tagName === 'IMG') {
        await this.loadImage(element, options);
      } else if (element.tagName === 'IFRAME') {
        await this.loadIframe(element, options);
      } else if (options.component) {
        await this.loadComponent(element, options);
      } else if (options.script) {
        await this.loadScript(element, options);
      } else if (options.css) {
        await this.loadCSS(element, options);
      }
      
      this.loadedElements.add(element);
      this.loadingElements.delete(element);
      
      element.classList.add('lazy-loaded');
      this.emit('loading:success', { element, options });
      
    } catch (error) {
      this.loadingElements.delete(element);
      element.classList.add('lazy-error');
      
      this.errorHandler.handleError({
        type: 'lazy_loading',
        message: `Erro ao carregar elemento: ${error.message}`,
        error,
        context: { element: element.tagName, options }
      });
      
      this.emit('loading:error', { element, error, options });
    }
  }
  
  /**
   * Carrega uma imagem
   * @param {HTMLImageElement} img - Elemento de imagem
   * @param {Object} options - Opções
   */
  loadImage(img, options = {}) {
    return new Promise((resolve, reject) => {
      const src = img.dataset.src || options.src;
      if (!src) {
        reject(new Error('Src não encontrado'));
        return;
      }
      
      const newImg = new Image();
      
      newImg.onload = () => {
        img.src = src;
        
        // Carregar srcset se disponível
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        
        resolve();
      };
      
      newImg.onerror = () => {
        reject(new Error('Falha ao carregar imagem'));
      };
      
      newImg.src = src;
    });
  }
  
  /**
   * Carrega um iframe
   * @param {HTMLIFrameElement} iframe - Elemento iframe
   * @param {Object} options - Opções
   */
  loadIframe(iframe, options = {}) {
    return new Promise((resolve, reject) => {
      const src = iframe.dataset.src || options.src;
      if (!src) {
        reject(new Error('Src não encontrado'));
        return;
      }
      
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error('Falha ao carregar iframe'));
      
      iframe.src = src;
    });
  }
  
  /**
   * Carrega um componente JavaScript
   * @param {HTMLElement} element - Elemento
   * @param {Object} options - Opções
   */
  async loadComponent(element, options) {
    const { component, module } = options;
    
    if (module) {
      const moduleExports = await import(module);
      const ComponentClass = moduleExports[component] || moduleExports.default;
      
      if (ComponentClass) {
        new ComponentClass(element, options.props || {});
      } else {
        throw new Error(`Componente '${component}' não encontrado no módulo`);
      }
    } else {
      throw new Error('Módulo não especificado para componente');
    }
  }
  
  /**
   * Carrega um script
   * @param {HTMLElement} element - Elemento
   * @param {Object} options - Opções
   */
  loadScript(element, options) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = options.script;
      script.async = options.async !== false;
      script.defer = options.defer === true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar script'));
      
      document.head.appendChild(script);
    });
  }
  
  /**
   * Carrega CSS
   * @param {HTMLElement} element - Elemento
   * @param {Object} options - Opções
   */
  loadCSS(element, options) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = options.css;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Falha ao carregar CSS'));
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Verifica se elemento está visível (fallback)
   * @param {HTMLElement} element - Elemento
   * @returns {boolean} True se visível
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return rect.top <= windowHeight && rect.bottom >= 0;
  }
  
  /**
   * Configura fallback para scroll (navegadores antigos)
   */
  setupScrollFallback() {
    let ticking = false;
    
    const checkVisibility = () => {
      const elements = document.querySelectorAll('[data-src]:not(.lazy-loaded):not(.lazy-error)');
      
      elements.forEach(element => {
        if (this.isElementVisible(element)) {
          this.loadElement(element);
        }
      });
      
      ticking = false;
    };
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(checkVisibility);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  
  /**
   * Carrega todos os elementos visíveis imediatamente
   */
  loadVisible() {
    const elements = document.querySelectorAll('[data-src]:not(.lazy-loaded):not(.lazy-error)');
    
    elements.forEach(element => {
      if (this.isElementVisible(element)) {
        this.loadElement(element);
      }
    });
  }
  
  /**
   * Destrói o lazy loader
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.removeAllListeners();
  }
}

/**
 * Utilitários para debouncing e throttling
 */
export class PerformanceUtils {
  /**
   * Cria função com debounce
   * @param {Function} func - Função a ser executada
   * @param {number} delay - Delay em ms
   * @param {boolean} immediate - Executar imediatamente na primeira chamada
   * @returns {Function} Função com debounce
   */
  static debounce(func, delay = 300, immediate = false) {
    let timeoutId;
    
    return function executedFunction(...args) {
      const later = () => {
        timeoutId = null;
        if (!immediate) func.apply(this, args);
      };
      
      const callNow = immediate && !timeoutId;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, delay);
      
      if (callNow) func.apply(this, args);
    };
  }
  
  /**
   * Cria função com throttle
   * @param {Function} func - Função a ser executada
   * @param {number} limit - Limite em ms
   * @returns {Function} Função com throttle
   */
  static throttle(func, limit = 100) {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Executa função quando o navegador estiver idle
   * @param {Function} func - Função a ser executada
   * @param {Object} options - Opções
   * @returns {number} ID do callback
   */
  static requestIdleCallback(func, options = {}) {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(func, options);
    } else {
      // Fallback
      return setTimeout(() => {
        const start = Date.now();
        func({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    }
  }
  
  /**
   * Cancela callback idle
   * @param {number} id - ID do callback
   */
  static cancelIdleCallback(id) {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }
  
  /**
   * Mede performance de uma função
   * @param {Function} func - Função a ser medida
   * @param {string} name - Nome da medição
   * @returns {*} Resultado da função
   */
  static async measurePerformance(func, name = 'operation') {
    const startTime = performance.now();
    
    try {
      const result = await func();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      
      // Usar Performance API se disponível
      if ('performance' in window && 'mark' in performance) {
        performance.mark(`${name}-start`);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`Performance [${name}] ERROR after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
  
  /**
   * Otimiza imagens automaticamente
   * @param {HTMLImageElement} img - Elemento de imagem
   * @param {Object} options - Opções de otimização
   */
  static optimizeImage(img, options = {}) {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp'
    } = options;
    
    // Verificar suporte a WebP
    const supportsWebP = (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();
    
    if (supportsWebP && format === 'webp') {
      // Usar WebP se suportado
      const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      const testImg = new Image();
      testImg.onload = () => {
        img.src = webpSrc;
      };
      testImg.onerror = () => {
        // Fallback para formato original
      };
      testImg.src = webpSrc;
    }
    
    // Lazy loading automático
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    }
  }
  
  /**
   * Precarrega recursos críticos
   * @param {Array} resources - Lista de recursos
   */
  static preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      if (resource.type === 'font') {
        link.href = resource.url;
        link.as = 'font';
        link.type = resource.format || 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.type === 'image') {
        link.href = resource.url;
        link.as = 'image';
      } else if (resource.type === 'script') {
        link.href = resource.url;
        link.as = 'script';
      } else if (resource.type === 'style') {
        link.href = resource.url;
        link.as = 'style';
      }
      
      document.head.appendChild(link);
    });
  }
}

/**
 * Gerenciador principal de performance
 */
export class PerformanceManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.cache = new CacheManager(options.cache);
    this.lazyLoader = new LazyLoader(options.lazyLoader);
    this.errorHandler = getErrorHandler();
    
    this.metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0
    };
    
    this.init();
  }
  
  /**
   * Inicializa o gerenciador de performance
   */
  init() {
    // Medir métricas de performance
    this.measureWebVitals();
    
    // Configurar lazy loading automático
    this.setupAutoLazyLoading();
    
    // Otimizar imagens automaticamente
    this.optimizeImages();
    
    // Precarregar recursos críticos
    this.preloadCriticalResources();
  }
  
  /**
   * Mede Web Vitals
   */
  measureWebVitals() {
    // Performance Observer para métricas
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        this.emit('metric:lcp', this.metrics.largestContentfulPaint);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Navegador não suporta
      }
      
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            this.emit('metric:fcp', this.metrics.firstContentfulPaint);
          }
        });
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // Navegador não suporta
      }
      
      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        
        entryList.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.cumulativeLayoutShift = clsValue;
        this.emit('metric:cls', this.metrics.cumulativeLayoutShift);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Navegador não suporta
      }
    }
    
    // Métricas básicas
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now();
      this.emit('metric:load', this.metrics.pageLoadTime);
    });
    
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
      this.emit('metric:dcl', this.metrics.domContentLoaded);
    });
  }
  
  /**
   * Configura lazy loading automático
   */
  setupAutoLazyLoading() {
    // Observar imagens com data-src
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.lazyLoader.observe(img);
    });
    
    // Observar iframes com data-src
    const iframes = document.querySelectorAll('iframe[data-src]');
    iframes.forEach(iframe => {
      this.lazyLoader.observe(iframe);
    });
    
    // Observar componentes lazy
    const lazyComponents = document.querySelectorAll('[data-lazy-component]');
    lazyComponents.forEach(element => {
      const componentName = element.dataset.lazyComponent;
      const modulePath = element.dataset.lazyModule;
      
      this.lazyLoader.observe(element, {
        component: componentName,
        module: modulePath
      });
    });
  }
  
  /**
   * Otimiza imagens automaticamente
   */
  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      PerformanceUtils.optimizeImage(img);
    });
  }
  
  /**
   * Precarrega recursos críticos
   */
  preloadCriticalResources() {
    const criticalResources = [
      { type: 'font', url: '/fonts/main.woff2', format: 'font/woff2' },
      { type: 'style', url: '/css/critical.css' }
    ];
    
    PerformanceUtils.preloadResources(criticalResources);
  }
  
  /**
   * Obtém métricas de performance
   * @returns {Object} Métricas
   */
  getMetrics() {
    return {
      ...this.metrics,
      cache: this.cache.getStats(),
      memory: this.getMemoryInfo()
    };
  }
  
  /**
   * Obtém informações de memória
   * @returns {Object} Informações de memória
   */
  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    
    return null;
  }
  
  /**
   * Destrói o gerenciador de performance
   */
  destroy() {
    this.cache.destroy();
    this.lazyLoader.destroy();
    this.removeAllListeners();
  }
}

// Instância global
let globalPerformanceManager = null;

/**
 * Obtém instância global do gerenciador de performance
 * @returns {PerformanceManager} Instância global
 */
export function getPerformanceManager() {
  if (!globalPerformanceManager) {
    globalPerformanceManager = new PerformanceManager();
    
    // Disponibilizar globalmente para debug
    if (typeof window !== 'undefined') {
      window.performanceManager = globalPerformanceManager;
    }
  }
  
  return globalPerformanceManager;
}

// Inicializar automaticamente
if (typeof window !== 'undefined') {
  getPerformanceManager();
}

export default PerformanceManager;