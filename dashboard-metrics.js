/**
 * Sistema de Métricas do Dashboard
 * Captura cliques em campos do dashboard e gera métricas em tempo real
 */

class DashboardMetrics {
    constructor() {
        this.metrics = {
            clicks: [],
            fieldInteractions: {},
            sessionStart: Date.now(),
            totalClicks: 0,
            uniqueFields: new Set(),
            heatmap: {},
            userBehavior: {
                mostClickedField: null,
                averageTimeOnDashboard: 0,
                clickFrequency: 0
            },
            // Métricas de ocorrências
            occurrences: {
                totalRegistered: 0,
                patrimonialRegistered: 0,
                veicularRegistered: 0,
                registrationTimes: [],
                averageRegistrationTime: 0,
                registrationsThisSession: 0,
                lastRegistrationTime: null
            }
        };
        
        this.init();
    }

    init() {
        console.log('🎯 Sistema de Métricas do Dashboard iniciado');
        this.setupEventListeners();
        this.startPeriodicReporting();
        
        // Expor funções globais para debug
        window.dashboardMetrics = this;
        window.getMetrics = () => this.getMetrics();
        window.exportMetrics = () => this.exportMetrics();
    }

    setupEventListeners() {
        // Capturar cliques em todos os elementos do dashboard
        const dashboardSection = document.getElementById('dashboard-section');
        
        if (dashboardSection) {
            // Event delegation para capturar todos os cliques no dashboard
            dashboardSection.addEventListener('click', (event) => {
                this.recordClick(event);
            });

            // Capturar hover para análise de interesse
            dashboardSection.addEventListener('mouseover', (event) => {
                this.recordHover(event);
            });

            // Capturar foco em campos
            dashboardSection.addEventListener('focusin', (event) => {
                this.recordFocus(event);
            });
        }

        // Capturar cliques nos cards do dashboard especificamente
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', (event) => {
                this.recordCardClick(event, card);
            });
        });

        // Capturar cliques nos botões de ação
        document.querySelectorAll('.action-buttons-dashboard button').forEach(button => {
            button.addEventListener('click', (event) => {
                this.recordActionClick(event, button);
            });
        });
    }

    recordClick(event) {
        const timestamp = Date.now();
        const target = event.target;
        const fieldInfo = this.getFieldInfo(target);
        
        const clickData = {
            timestamp,
            fieldId: fieldInfo.id,
            fieldType: fieldInfo.type,
            fieldText: fieldInfo.text,
            coordinates: {
                x: event.clientX,
                y: event.clientY
            },
            sessionTime: timestamp - this.metrics.sessionStart
        };

        // Armazenar o clique
        this.metrics.clicks.push(clickData);
        this.metrics.totalClicks++;
        this.metrics.uniqueFields.add(fieldInfo.id);

        // Atualizar contadores por campo
        if (!this.metrics.fieldInteractions[fieldInfo.id]) {
            this.metrics.fieldInteractions[fieldInfo.id] = {
                clicks: 0,
                hovers: 0,
                focuses: 0,
                firstInteraction: timestamp,
                lastInteraction: timestamp,
                fieldType: fieldInfo.type,
                fieldText: fieldInfo.text
            };
        }
        
        this.metrics.fieldInteractions[fieldInfo.id].clicks++;
        this.metrics.fieldInteractions[fieldInfo.id].lastInteraction = timestamp;

        // Atualizar heatmap
        const heatmapKey = `${Math.floor(event.clientX / 50)}-${Math.floor(event.clientY / 50)}`;
        this.metrics.heatmap[heatmapKey] = (this.metrics.heatmap[heatmapKey] || 0) + 1;

        // Gerar métrica em tempo real
        this.generateRealTimeMetric(clickData);
        
        console.log('📊 Clique registrado:', clickData);
    }

    recordCardClick(event, card) {
        const cardTitle = card.querySelector('h3')?.textContent || 'Card sem título';
        const cardValue = card.querySelector('p')?.textContent || '0';
        
        const cardMetric = {
            type: 'card_click',
            timestamp: Date.now(),
            cardTitle,
            cardValue,
            cardId: card.id || `card-${cardTitle.toLowerCase().replace(/\s+/g, '-')}`
        };

        console.log('🎯 Card clicado:', cardMetric);
        this.sendMetricToAnalytics(cardMetric);
    }

    recordActionClick(event, button) {
        const actionMetric = {
            type: 'action_click',
            timestamp: Date.now(),
            buttonId: button.id,
            buttonText: button.textContent.trim(),
            buttonClass: button.className
        };

        console.log('⚡ Ação executada:', actionMetric);
        this.sendMetricToAnalytics(actionMetric);
    }

    recordHover(event) {
        const target = event.target;
        const fieldInfo = this.getFieldInfo(target);
        
        if (fieldInfo.id && this.metrics.fieldInteractions[fieldInfo.id]) {
            this.metrics.fieldInteractions[fieldInfo.id].hovers++;
        }
    }

    recordFocus(event) {
        const target = event.target;
        const fieldInfo = this.getFieldInfo(target);
        
        if (fieldInfo.id && this.metrics.fieldInteractions[fieldInfo.id]) {
            this.metrics.fieldInteractions[fieldInfo.id].focuses++;
        }
    }

    getFieldInfo(element) {
        return {
            id: element.id || element.closest('[id]')?.id || `element-${Date.now()}`,
            type: element.tagName.toLowerCase(),
            text: element.textContent?.trim() || element.value || element.alt || 'Sem texto',
            className: element.className
        };
    }

    generateRealTimeMetric(clickData) {
        // Calcular métricas em tempo real
        this.updateUserBehaviorMetrics();
        
        // Emitir evento customizado para outros sistemas
        const metricEvent = new CustomEvent('dashboardMetricGenerated', {
            detail: {
                clickData,
                currentMetrics: this.getMetrics(),
                recommendations: this.generateRecommendations()
            }
        });
        
        document.dispatchEvent(metricEvent);
    }

    updateUserBehaviorMetrics() {
        // Campo mais clicado
        let maxClicks = 0;
        let mostClickedField = null;
        
        Object.entries(this.metrics.fieldInteractions).forEach(([fieldId, data]) => {
            if (data.clicks > maxClicks) {
                maxClicks = data.clicks;
                mostClickedField = fieldId;
            }
        });
        
        this.metrics.userBehavior.mostClickedField = mostClickedField;
        
        // Tempo médio no dashboard
        const currentTime = Date.now();
        this.metrics.userBehavior.averageTimeOnDashboard = currentTime - this.metrics.sessionStart;
        
        // Frequência de cliques (cliques por minuto)
        const timeInMinutes = (currentTime - this.metrics.sessionStart) / 60000;
        this.metrics.userBehavior.clickFrequency = timeInMinutes > 0 ? this.metrics.totalClicks / timeInMinutes : 0;
    }

    // Métodos para rastrear ocorrências
    recordOccurrenceRegistration(type, registrationTime = null) {
        const timestamp = registrationTime || Date.now();
        
        this.metrics.occurrences.totalRegistered++;
        this.metrics.occurrences.registrationsThisSession++;
        this.metrics.occurrences.lastRegistrationTime = timestamp;
        
        if (type === 'patrimonial') {
            this.metrics.occurrences.patrimonialRegistered++;
        } else if (type === 'veicular') {
            this.metrics.occurrences.veicularRegistered++;
        }
        
        // Calcular tempo de registro se houver registro anterior
        if (this.metrics.occurrences.registrationTimes.length > 0) {
            const lastTime = this.metrics.occurrences.registrationTimes[this.metrics.occurrences.registrationTimes.length - 1];
            const timeDiff = timestamp - lastTime;
            this.updateAverageRegistrationTime(timeDiff);
        }
        
        this.metrics.occurrences.registrationTimes.push(timestamp);
        
        // Gerar métrica em tempo real
        this.generateOccurrenceMetric(type, timestamp);
        
        console.log(`📊 Nova ocorrência ${type} registrada. Total: ${this.metrics.occurrences.totalRegistered}`);
    }
    
    updateAverageRegistrationTime(newTime) {
        const times = this.metrics.occurrences.registrationTimes;
        if (times.length <= 1) {
            this.metrics.occurrences.averageRegistrationTime = 0;
            return;
        }
        
        let totalTime = 0;
        for (let i = 1; i < times.length; i++) {
            totalTime += times[i] - times[i-1];
        }
        
        this.metrics.occurrences.averageRegistrationTime = totalTime / (times.length - 1);
    }
    
    generateOccurrenceMetric(type, timestamp) {
        const metric = {
            type: 'occurrence_registered',
            occurrenceType: type,
            timestamp: timestamp,
            sessionTotal: this.metrics.occurrences.registrationsThisSession,
            totalRegistered: this.metrics.occurrences.totalRegistered,
            averageTime: this.metrics.occurrences.averageRegistrationTime
        };
        
        this.sendMetricToAnalytics(metric);
    }
    
    getOccurrenceStats() {
        const sessionDuration = Date.now() - this.metrics.sessionStart;
        const registrationsPerHour = (this.metrics.occurrences.registrationsThisSession / (sessionDuration / 1000 / 60 / 60));
        
        return {
            total: this.metrics.occurrences.totalRegistered,
            patrimonial: this.metrics.occurrences.patrimonialRegistered,
            veicular: this.metrics.occurrences.veicularRegistered,
            thisSession: this.metrics.occurrences.registrationsThisSession,
            averageRegistrationTime: this.metrics.occurrences.averageRegistrationTime,
            registrationsPerHour: registrationsPerHour || 0,
            lastRegistration: this.metrics.occurrences.lastRegistrationTime
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Recomendações baseadas no comportamento
        if (this.metrics.totalClicks > 10) {
            recommendations.push('Usuário muito ativo - considere adicionar atalhos');
        }
        
        if (this.metrics.uniqueFields.size < 3) {
            recommendations.push('Usuário focado em poucos campos - otimizar layout');
        }
        
        if (this.metrics.userBehavior.clickFrequency > 5) {
            recommendations.push('Alta frequência de cliques - verificar usabilidade');
        }
        
        return recommendations;
    }

    sendMetricToAnalytics(metric) {
        // Simular envio para sistema de analytics
        console.log('📈 Métrica enviada para analytics:', metric);
        
        // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
        // gtag('event', metric.type, metric);
        // mixpanel.track(metric.type, metric);
    }

    getMetrics() {
        return {
            summary: {
                totalClicks: this.metrics.totalClicks,
                uniqueFields: this.metrics.uniqueFields.size,
                sessionDuration: Date.now() - this.metrics.sessionStart,
                clicksPerMinute: this.metrics.userBehavior.clickFrequency.toFixed(2)
            },
            fieldInteractions: this.metrics.fieldInteractions,
            userBehavior: this.metrics.userBehavior,
            heatmap: this.metrics.heatmap,
            recentClicks: this.metrics.clicks.slice(-10),
            recommendations: this.generateRecommendations()
        };
    }

    exportMetrics() {
        const metrics = this.getMetrics();
        const dataStr = JSON.stringify(metrics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `dashboard-metrics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📊 Métricas exportadas:', metrics);
        return metrics;
    }

    startPeriodicReporting() {
        // Relatório a cada 30 segundos
        setInterval(() => {
            const metrics = this.getMetrics();
            console.log('📊 Relatório Periódico de Métricas:', metrics.summary);
            
            // Emitir evento para dashboard de métricas
            document.dispatchEvent(new CustomEvent('metricsReport', {
                detail: metrics
            }));
        }, 30000);
    }

    reset() {
        this.metrics = {
            clicks: [],
            fieldInteractions: {},
            sessionStart: Date.now(),
            totalClicks: 0,
            uniqueFields: new Set(),
            heatmap: {},
            userBehavior: {
                mostClickedField: null,
                averageTimeOnDashboard: 0,
                clickFrequency: 0
            }
        };
        console.log('🔄 Métricas resetadas');
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardMetrics = new DashboardMetrics();
        console.log('📊 Sistema de métricas inicializado!');
    });
} else {
    window.dashboardMetrics = new DashboardMetrics();
    console.log('📊 Sistema de métricas inicializado!');
}

// Funções globais de debug
window.showMetricsDashboard = function() {
    const metrics = window.dashboardMetrics?.getMetrics();
    if (metrics) {
        console.clear();
        console.log('=== DASHBOARD DE MÉTRICAS ===');
        console.table(metrics.summary);
        console.log('\n📊 Interações por Campo:');
        console.table(metrics.fieldInteractions);
        console.log('\n🎯 Comportamento do Usuário:');
        console.table(metrics.userBehavior);
        console.log('\n💡 Recomendações:', metrics.recommendations);
    }
};

window.resetMetrics = function() {
    window.dashboardMetrics?.reset();
};

console.log('🎯 Sistema de Métricas do Dashboard carregado!');
console.log('💡 Funções disponíveis:');
console.log('  - getMetrics() - Obter métricas atuais');
console.log('  - exportMetrics() - Exportar métricas para JSON');
console.log('  - showMetricsDashboard() - Mostrar dashboard no console');
console.log('  - resetMetrics() - Resetar todas as métricas');