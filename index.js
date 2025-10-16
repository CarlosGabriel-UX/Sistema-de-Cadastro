// Sistema de Cadastro - Versão Simplificada para Debug da Sidebar
console.log('Sistema de cadastro carregado - Versão simplificada');

// As funções serão acessadas via variáveis globais definidas nos outros arquivos

// Adicionar estilos de validação
if (window.addValidationStyles) window.addValidationStyles();

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - Inicializando sistema...');
    
    try {
        // Inicializar módulos essenciais (se as funções existirem)
        if (window.initThemeSystem) window.initThemeSystem();
        if (window.initPopupSystem) window.initPopupSystem();
        if (window.initFormEnhancements) window.initFormEnhancements();
        if (window.initProfileUpload) window.initProfileUpload();
        if (window.initCadastroModal) window.initCadastroModal();
        if (window.initFieldEnhancements) window.initFieldEnhancements();
        if (window.initPhotoUpload) window.initPhotoUpload();
        // initCepService será chamado quando o formulário for exibido
        
        // Sistema de navegação removido - gerenciado pelo HTML inline
        console.log('=== INDEX.JS CARREGADO ===');
        console.log('Navegação gerenciada pelo sistema HTML inline');
        
        // Inicializar dados do dashboard
        if (window.updateDashboardStats) window.updateDashboardStats();
        if (window.renderNotifications) window.renderNotifications();
        
        // Renderizar grids
        if (window.renderPatrimonialGrid) window.renderPatrimonialGrid();
        if (window.renderVeicularGrid) window.renderVeicularGrid();
        if (window.renderOcorrenciasGrid) window.renderOcorrenciasGrid();
        
        // Configurar seletores de tipo
        setupTypeSelectors();
        
        // Configurar observador para o mapa
        const ocorrenciasSection = document.getElementById('section-ocorrencias');
        if (ocorrenciasSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            if (window.initMap) window.initMap();
                            if (window.resizeMap) window.resizeMap();
                        }, 100);
                    }
                });
            });
            observer.observe(ocorrenciasSection);
        }
        
        console.log('Sistema inicializado com sucesso!');
        console.log('Sidebar gerenciada por sistema interno');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showToast('Erro na inicialização do sistema', 'error');
    }
});

// Função para configurar os seletores de tipo
function setupTypeSelectors() {
    const tipoButtons = document.querySelectorAll('.tipo-btn');
    const sectionIdMap = {
        'patrimonial': 'section-patrimonial',
        'veicular': 'section-veicular',
        'ocorrencias': 'section-ocorrencias'
    };

    // Não ativar nenhuma seção por padrão aqui para não conflitar com showSection('dashboard-section')

    tipoButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tipo = btn.dataset.tipo;

            // Remover classe active de todos os botões
            tipoButtons.forEach(b => b.classList.remove('active'));

            // Adicionar classe active ao botão clicado
            btn.classList.add('active');

            // Usar o gerenciador central de seções
            const targetSectionId = sectionIdMap[tipo];
            if (typeof showSection === 'function' && targetSectionId) {
                showSection(targetSectionId);
            }

            // Inicializar/ajustar mapa quando abrir Ocorrências
            if (tipo === 'ocorrencias') {
                setTimeout(() => {
                    if (window.initMap) window.initMap();
                    if (window.resizeMap) window.resizeMap();
                }, 100);
            }
        });
    });
}

console.log('Index.js carregado - Aguardando DOM...');