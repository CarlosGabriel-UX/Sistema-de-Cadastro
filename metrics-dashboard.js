/**
 * Painel Visual de Métricas do Dashboard
 * Cria uma interface visual para exibir métricas em tempo real
 */

class MetricsDashboard {
    constructor() {
        this.isVisible = false;
        this.metricsPanel = null;
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.createMetricsPanel();
        this.setupEventListeners();
        this.addToggleButton();
        
        console.log('📊 Painel Visual de Métricas iniciado');
    }

    createMetricsPanel() {
        // Criar o painel de métricas
        this.metricsPanel = document.createElement('div');
        this.metricsPanel.id = 'metrics-dashboard-panel';
        this.metricsPanel.className = 'metrics-panel hidden';
        
        this.metricsPanel.innerHTML = `
            <div class="metrics-header">
                <h3>📊 Métricas em Tempo Real</h3>
                <button class="metrics-close-btn" title="Fechar Painel">
                    <i class="bx bx-x"></i>
                </button>
            </div>
            
            <div class="metrics-content">
                <div class="metrics-summary">
                    <div class="metric-card">
                        <div class="metric-icon">🎯</div>
                        <div class="metric-info">
                            <span class="metric-label">Total de Cliques</span>
                            <span class="metric-value" id="total-clicks">0</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">🔥</div>
                        <div class="metric-info">
                            <span class="metric-label">Campos Únicos</span>
                            <span class="metric-value" id="unique-fields">0</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">⏱️</div>
                        <div class="metric-info">
                            <span class="metric-label">Tempo de Sessão</span>
                            <span class="metric-value" id="session-time">0s</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">⚡</div>
                        <div class="metric-info">
                            <span class="metric-label">Cliques/Min</span>
                            <span class="metric-value" id="click-frequency">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-details">
                    <div class="metrics-section">
                        <h4>🎯 Campo Mais Clicado</h4>
                        <div id="most-clicked-field" class="highlight-text">Nenhum ainda</div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>📈 Interações por Campo</h4>
                        <div id="field-interactions" class="interactions-list"></div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>💡 Recomendações</h4>
                        <div id="recommendations" class="recommendations-list"></div>
                    </div>
                    
                    <div class="metrics-section">
                        <h4>🔥 Últimos Cliques</h4>
                        <div id="recent-clicks" class="recent-clicks-list"></div>
                    </div>
                </div>
                
                <div class="metrics-actions">
                    <button class="metrics-btn export-btn" onclick="window.exportMetrics()">
                        <i class="bx bx-download"></i> Exportar Dados
                    </button>
                    <button class="metrics-btn reset-btn" onclick="window.resetMetrics()">
                        <i class="bx bx-refresh"></i> Resetar Métricas
                    </button>
                    <button class="metrics-btn console-btn" onclick="window.showMetricsDashboard()">
                        <i class="bx bx-terminal"></i> Ver no Console
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.metricsPanel);
        this.addStyles();
    }

    addToggleButton() {
        // Adicionar botão para abrir/fechar o painel no dashboard
        const dashboardActions = document.querySelector('.action-buttons-dashboard');
        if (dashboardActions) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'btn-toggle-metrics';
            toggleBtn.className = 'form-button btn-info';
            toggleBtn.innerHTML = `
                <i class='bx bx-bar-chart-alt-2'></i>
                Métricas
            `;
            
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
            
            dashboardActions.appendChild(toggleBtn);
        }
    }

    setupEventListeners() {
        // Escutar eventos de métricas
        document.addEventListener('dashboardMetricGenerated', (event) => {
            this.updateDisplay(event.detail.currentMetrics);
        });
        
        document.addEventListener('metricsReport', (event) => {
            this.updateDisplay(event.detail);
        });
        
        // Botão de fechar
        this.metricsPanel.querySelector('.metrics-close-btn').addEventListener('click', () => {
            this.hide();
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    updateDisplay(metrics) {
        if (!this.isVisible) return;
        
        // Atualizar resumo
        document.getElementById('total-clicks').textContent = metrics.summary.totalClicks;
        document.getElementById('unique-fields').textContent = metrics.summary.uniqueFields;
        document.getElementById('session-time').textContent = this.formatTime(metrics.summary.sessionDuration);
        document.getElementById('click-frequency').textContent = metrics.summary.clicksPerMinute;
        
        // Campo mais clicado
        const mostClickedElement = document.getElementById('most-clicked-field');
        if (metrics.userBehavior.mostClickedField) {
            const fieldData = metrics.fieldInteractions[metrics.userBehavior.mostClickedField];
            mostClickedElement.textContent = `${fieldData?.fieldText || metrics.userBehavior.mostClickedField} (${fieldData?.clicks || 0} cliques)`;
        } else {
            mostClickedElement.textContent = 'Nenhum ainda';
        }
        
        // Interações por campo
        this.updateFieldInteractions(metrics.fieldInteractions);
        
        // Recomendações
        this.updateRecommendations(metrics.recommendations);
        
        // Últimos cliques
        this.updateRecentClicks(metrics.recentClicks);
    }

    updateFieldInteractions(interactions) {
        const container = document.getElementById('field-interactions');
        container.innerHTML = '';
        
        const sortedFields = Object.entries(interactions)
            .sort(([,a], [,b]) => b.clicks - a.clicks)
            .slice(0, 5); // Top 5
        
        if (sortedFields.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhuma interação ainda</div>';
            return;
        }
        
        sortedFields.forEach(([fieldId, data]) => {
            const item = document.createElement('div');
            item.className = 'interaction-item';
            item.innerHTML = `
                <div class="field-name">${data.fieldText || fieldId}</div>
                <div class="field-stats">
                    <span class="stat">👆 ${data.clicks}</span>
                    <span class="stat">👀 ${data.hovers}</span>
                    <span class="stat">🎯 ${data.focuses}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    updateRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        container.innerHTML = '';
        
        if (recommendations.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhuma recomendação ainda</div>';
            return;
        }
        
        recommendations.forEach(rec => {
            const item = document.createElement('div');
            item.className = 'recommendation-item';
            item.innerHTML = `<i class="bx bx-bulb"></i> ${rec}`;
            container.appendChild(item);
        });
    }

    updateRecentClicks(recentClicks) {
        const container = document.getElementById('recent-clicks');
        container.innerHTML = '';
        
        if (recentClicks.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum clique ainda</div>';
            return;
        }
        
        recentClicks.slice(-5).reverse().forEach(click => {
            const item = document.createElement('div');
            item.className = 'click-item';
            const timeAgo = this.getTimeAgo(click.timestamp);
            item.innerHTML = `
                <div class="click-field">${click.fieldText}</div>
                <div class="click-time">${timeAgo}</div>
            `;
            container.appendChild(item);
        });
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        
        if (seconds < 60) return `${seconds}s atrás`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m atrás`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h atrás`;
    }

    show() {
        this.metricsPanel.classList.remove('hidden');
        this.metricsPanel.classList.add('visible');
        this.isVisible = true;
        
        // Atualizar dados imediatamente
        if (window.dashboardMetrics) {
            this.updateDisplay(window.dashboardMetrics.getMetrics());
        }
        
        // Iniciar atualizações automáticas
        this.startAutoUpdate();
        
        console.log('📊 Painel de métricas aberto');
    }

    hide() {
        this.metricsPanel.classList.remove('visible');
        this.metricsPanel.classList.add('hidden');
        this.isVisible = false;
        
        // Parar atualizações automáticas
        this.stopAutoUpdate();
        
        console.log('📊 Painel de métricas fechado');
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    startAutoUpdate() {
        this.stopAutoUpdate(); // Limpar interval anterior
        
        this.updateInterval = setInterval(() => {
            if (window.dashboardMetrics && this.isVisible) {
                this.updateDisplay(window.dashboardMetrics.getMetrics());
            }
        }, 2000); // Atualizar a cada 2 segundos
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .metrics-panel {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: var(--card-bg, #ffffff);
                border: 1px solid var(--border-color, #e5e7eb);
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                z-index: 1000;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .metrics-panel.hidden {
                opacity: 0;
                transform: translateX(100%) scale(0.95);
                pointer-events: none;
            }
            
            .metrics-panel.visible {
                opacity: 1;
                transform: translateX(0) scale(1);
                pointer-events: all;
            }
            
            .metrics-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .metrics-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .metrics-close-btn {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .metrics-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .metrics-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }
            
            .metrics-summary {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 24px;
            }
            
            .metric-card {
                background: var(--card-bg, #f8fafc);
                border: 1px solid var(--border-color, #e2e8f0);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: transform 0.2s;
            }
            
            .metric-card:hover {
                transform: translateY(-2px);
            }
            
            .metric-icon {
                font-size: 24px;
            }
            
            .metric-info {
                flex: 1;
            }
            
            .metric-label {
                display: block;
                font-size: 12px;
                color: var(--text-secondary, #64748b);
                margin-bottom: 4px;
            }
            
            .metric-value {
                display: block;
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary, #1e293b);
            }
            
            .metrics-section {
                margin-bottom: 20px;
            }
            
            .metrics-section h4 {
                margin: 0 0 12px 0;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-primary, #1e293b);
            }
            
            .highlight-text {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: 600;
            }
            
            .interaction-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: var(--card-bg, #f8fafc);
                border-radius: 6px;
                margin-bottom: 6px;
                border-left: 3px solid #667eea;
            }
            
            .field-name {
                font-weight: 500;
                color: var(--text-primary, #1e293b);
                font-size: 13px;
            }
            
            .field-stats {
                display: flex;
                gap: 8px;
            }
            
            .stat {
                font-size: 11px;
                background: rgba(102, 126, 234, 0.1);
                padding: 2px 6px;
                border-radius: 4px;
                color: #667eea;
            }
            
            .recommendation-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(245, 158, 11, 0.1);
                border-radius: 6px;
                margin-bottom: 6px;
                font-size: 13px;
                color: #92400e;
            }
            
            .click-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 12px;
                background: var(--card-bg, #f8fafc);
                border-radius: 6px;
                margin-bottom: 4px;
                font-size: 12px;
            }
            
            .click-field {
                font-weight: 500;
                color: var(--text-primary, #1e293b);
            }
            
            .click-time {
                color: var(--text-secondary, #64748b);
            }
            
            .no-data {
                text-align: center;
                color: var(--text-secondary, #64748b);
                font-style: italic;
                padding: 20px;
            }
            
            .metrics-actions {
                display: flex;
                gap: 8px;
                margin-top: 20px;
                padding-top: 16px;
                border-top: 1px solid var(--border-color, #e2e8f0);
            }
            
            .metrics-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
            }
            
            .export-btn {
                background: #10b981;
                color: white;
            }
            
            .export-btn:hover {
                background: #059669;
            }
            
            .reset-btn {
                background: #ef4444;
                color: white;
            }
            
            .reset-btn:hover {
                background: #dc2626;
            }
            
            .console-btn {
                background: #6366f1;
                color: white;
            }
            
            .console-btn:hover {
                background: #4f46e5;
            }
            
            @media (max-width: 768px) {
                .metrics-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                    left: 20px;
                }
                
                .metrics-summary {
                    grid-template-columns: 1fr;
                }
                
                .metrics-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Inicializar o painel quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MetricsDashboard();
    });
} else {
    new MetricsDashboard();
}

console.log('📊 Painel Visual de Métricas carregado!');