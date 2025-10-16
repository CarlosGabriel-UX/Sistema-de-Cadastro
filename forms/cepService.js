console.log('🔧 cepService.js carregado com sucesso!');
const cepCache = new Map();
const recentCeps = JSON.parse(localStorage.getItem('recentCeps') || '[]');
let searchTimeout = null;

window.initCepService = function() {
    console.log('🚀 initCepService chamada!');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const cidadeInput = document.getElementById('cidade');
    const estadoSelect = document.getElementById('estado');
    const statusDiv = document.getElementById('status');

    console.log('initCepService - Elementos encontrados:', {
        cepInput: !!cepInput,
        enderecoInput: !!enderecoInput,
        cidadeInput: !!cidadeInput,
        estadoSelect: !!estadoSelect,
        statusDiv: !!statusDiv
    });

    if (!cepInput || !enderecoInput || !cidadeInput || !estadoSelect) {
        console.log('initCepService - Elementos do formulário não encontrados na página atual. Serviço será inicializado quando necessário.');
        return;
    }
    
    // Marcar como inicializado para evitar conflitos
    cepInput.setAttribute('data-cep-service-init', 'true');

    const loadingIndicator = createLoadingIndicator();
    const statusIndicator = createStatusIndicator();
    cepInput.parentElement.appendChild(loadingIndicator);
    cepInput.parentElement.appendChild(statusIndicator);

    addHelpTooltip(cepInput);
    addRecentCepsDropdown(cepInput);

    cepInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;

        if (searchTimeout) clearTimeout(searchTimeout);
        clearFieldStates();

        if (value.length === 9) {
            const cleanCep = value.replace('-', '');
            searchTimeout = setTimeout(() => buscarEnderecoPorCep(cleanCep), 500);
        } else if (value.length > 0 && value.length < 9) {
            showFieldStatus('Insira o CEP completo', 'warning');
        }
    });

    cepInput.addEventListener('keydown', () => {
        if (cepInput.value.length === 9) {
            limparCampoEndereco();
        }
    });

    function createLoadingIndicator() {
        const el = document.createElement('div');
        el.className = 'cep-loading';
        el.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
        el.style.display = 'none';
        el.style.animation = 'spin 1s linear infinite';
        return el;
    }

    function createStatusIndicator() {
        const el = document.createElement('div');
        el.className = 'cep-status';
        el.style.display = 'none';
        el.style.position = 'absolute';
        el.style.top = '100%';
        el.style.left = '0';
        el.style.right = '0';
        el.style.padding = '10px 15px';
        el.style.fontSize = '0.85rem';
        el.style.fontWeight = '600';
        el.style.borderRadius = '0 0 12px 12px';
        el.style.zIndex = '5';
        el.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        el.style.backdropFilter = 'blur(10px)';
        return el;
    }

    function addHelpTooltip(input) {
        const tooltip = document.createElement('div');
        tooltip.className = 'cep-help-tooltip';
        tooltip.innerHTML = `<i class="bx bx-info-circle"></i><span>Digite o CEP para preencher automaticamente</span>`;
        input.parentElement.appendChild(tooltip);

        input.addEventListener('focus', () => tooltip.classList.add('show'));
        input.addEventListener('blur', () => setTimeout(() => tooltip.classList.remove('show'), 200));
    }

    function addRecentCepsDropdown(input) {
        if (recentCeps.length === 0) return;
        const dropdown = document.createElement('div');
        dropdown.className = 'cep-recent-dropdown';
        dropdown.innerHTML = `
            <div class="recent-header"><i class="bx bx-history"></i><span>CEPs recentes</span></div>
            ${recentCeps.slice(0, 5).map(item => `
                <div class="recent-item" data-cep="${item.cep}"><strong>${formatCep(item.cep)}</strong><span>${item.cidade}/${item.uf}</span></div>
            `).join('')}`;
        input.parentElement.appendChild(dropdown);

        input.addEventListener('focus', () => dropdown.classList.add('show'));
        input.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('show'), 200));

        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.recent-item');
            if (item) {
                const cep = item.dataset.cep;
                input.value = formatCep(cep);
                dropdown.classList.remove('show');
                buscarEnderecoPorCep(cep);
            }
        });
    }

    function showLoading() {
        loadingIndicator.style.display = 'block';
        cepInput.classList.add('loading');
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
        cepInput.classList.remove('loading');
    }

    function showError(msg = 'CEP não encontrado') {
        cepInput.classList.add('error');
        showFieldStatus(msg, 'error');
        setTimeout(() => cepInput.classList.remove('error'), 4000);
    }

    function showSuccess() {
        cepInput.classList.add('success');
        showFieldStatus('Endereço preenchido automaticamente!', 'success');
        setTimeout(() => {
            cepInput.classList.remove('success');
            hideFieldStatus();
        }, 3000);
    }

    function showFieldStatus(msg, type) {
        statusIndicator.className = `cep-status ${type}`;
        statusIndicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="bx ${getStatusIcon(type)}" style="font-size: 1.1em;"></i>
                <span style="flex: 1;">${msg}</span>
                ${type === 'success' ? '<i class="bx bx-check" style="color: #10dc60;"></i>' : ''}
            </div>
        `;
        statusIndicator.style.display = 'block';
        
        // Aplicar cores baseadas no tipo
        const colors = {
            success: { bg: 'rgba(16, 220, 96, 0.1)', border: '#10dc60', text: '#0d7f47' },
            error: { bg: 'rgba(240, 65, 65, 0.1)', border: '#f04141', text: '#c53030' },
            warning: { bg: 'rgba(255, 206, 0, 0.1)', border: '#ffce00', text: '#d69e2e' },
            info: { bg: 'rgba(54, 209, 220, 0.1)', border: '#36d1dc', text: '#0891b2' }
        };
        
        const color = colors[type] || colors.info;
        statusIndicator.style.background = color.bg;
        statusIndicator.style.borderTop = `2px solid ${color.border}`;
        statusIndicator.style.color = color.text;
    }

    function hideFieldStatus() {
        statusIndicator.style.display = 'none';
    }

    function getStatusIcon(type) {
        const icons = {
            success: 'bx-check-circle',
            error: 'bx-error-circle',
            warning: 'bx-info-circle',
            info: 'bx-info-circle'
        };
        return icons[type] || 'bx-info-circle';
    }

    function clearFieldStates() {
        cepInput.classList.remove('loading', 'error', 'success');
        hideFieldStatus();
    }

    function limparCampoEndereco() {
        enderecoInput.value = '';
        cidadeInput.value = '';
        estadoSelect.value = '';
    }

    async function buscarEnderecoPorCep(cep) {
        console.log('buscarEnderecoPorCep chamada com CEP:', cep);
        const cepRegex = /^[0-9]{8}$/;
        if (!cepRegex.test(cep)) {
            console.log('CEP inválido:', cep);
            showError('CEP inválido. Use o formato 00000-000');
            return;
        }

        if (cepCache.has(cep)) {
            const data = cepCache.get(cep);
            preencherCamposEndereco(data);
            showSuccess();
            return;
        }

        showLoading();
        showFieldStatus('Buscando endereço...', 'info');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Erro na consulta do CEP');
            const data = await response.json();

            if (data.erro) throw new Error('CEP não encontrado na base de dados');

            cepCache.set(cep, data);
            salvarCepRecente(cep, data);
            preencherCamposEndereco(data);
            showSuccess();
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showError(error.message.includes('Timeout') ? 'Tempo limite excedido' : error.message);
        } finally {
            hideLoading();
        }
    }

    function salvarCepRecente(cep, data) {
        const newItem = { cep, cidade: data.localidade, uf: data.uf, timestamp: Date.now() };
        const existing = recentCeps.findIndex(c => c.cep === cep);
        if (existing !== -1) recentCeps.splice(existing, 1);
        recentCeps.unshift(newItem);
        if (recentCeps.length > 10) recentCeps.splice(10);
        localStorage.setItem('recentCeps', JSON.stringify(recentCeps));
    }

    function preencherCamposEndereco(data) {
        console.log('preencherCamposEndereco chamada com dados:', data);
        let endereco = '';
        if (data.logradouro) endereco += data.logradouro;
        if (data.bairro) endereco += endereco ? `, ${data.bairro}` : data.bairro;
        if (data.complemento) endereco += endereco ? `, ${data.complemento}` : data.complemento;

        console.log('Endereco montado:', endereco);
        if (endereco) {
            enderecoInput.value = endereco;
            enderecoInput.classList.add('auto-filled');
            setTimeout(() => enderecoInput.classList.remove('auto-filled'), 2000);
            console.log('Campo endereco preenchido:', enderecoInput.value);
        }

        if (data.localidade) {
            cidadeInput.value = data.localidade;
            console.log('Campo cidade preenchido:', cidadeInput.value);
        }
        if (data.uf) {
            estadoSelect.value = data.uf;
            console.log('Campo estado preenchido:', estadoSelect.value);
        }
    }
}

window.formatCep = function(cep) {
    const clean = cep.replace(/\D/g, '');
    return clean.length === 8 ? clean.replace(/(\d{5})(\d{3})/, '$1-$2') : cep;
}