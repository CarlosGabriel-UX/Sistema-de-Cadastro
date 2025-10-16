// grid.js – dados e funções de grid/permissão compartilhadas
// As funções globais serão acessadas via window

// --- Estado interno ------------------------------------------------------
let currentUserRole = 'viewer'; // valor padrão até ser definido externamente

window.setCurrentUserRole = function(role) {
  currentUserRole = role;
}

// -------------------- 1. Dados de exemplo -------------------------------
window.patrimonialData = [
  { 
    id: 'PAT001', 
    nome: 'Computador Desktop', 
    tipo: 'Eletrônicos', 
    localizacao: 'Sala 101, Edifício Principal',
    responsavel: 'João Silva',
    valor: 'R$ 2.500,00',
    descricao: 'Computador Desktop Dell Inspiron 3000 com processador Intel Core i5, 8GB RAM, SSD 256GB, Windows 11 Pro. Equipamento em excelente estado de conservação.',
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: 'Av. Paulista, 1000, Bela Vista'
  },
  { 
    id: 'PAT002', 
    nome: 'Cadeira Ergonômica', 
    tipo: 'Móveis', 
    localizacao: 'Sala 102, Edifício Principal',
    responsavel: 'Maria Santos',
    valor: 'R$ 850,00',
    descricao: 'Cadeira ergonômica President com apoio lombar, regulagem de altura, braços ajustáveis e rodízios. Cor preta, tecido mesh respirável.',
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: 'Av. Paulista, 1000, Bela Vista'
  },
  { 
    id: 'PAT003', 
    nome: 'Impressora Laser', 
    tipo: 'Eletrônicos', 
    localizacao: 'Recepção, Térreo',
    responsavel: 'Carlos Oliveira',
    valor: 'R$ 1.200,00',
    descricao: 'Impressora multifuncional laser HP LaserJet Pro M404dn, com impressão duplex automática, conectividade USB e Ethernet. Inclui toner original.',
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: 'Av. Paulista, 1000, Bela Vista'
  }
];

// Dados unificados de ocorrências (patrimoniais e veiculares)
window.ocorrenciasData = [
  // Ocorrências Patrimoniais
  { 
    id: 'PAT001', 
    titulo: 'Computador Desktop', 
    tipo: 'patrimonial',
    subtipo: 'Eletrônicos', 
    status: 'ativo',
    localizacao: 'Sala 101, Edifício Principal',
    responsavel: 'João Silva',
    valor: 'R$ 2.500,00',
    descricao: 'Computador Desktop Dell Inspiron 3000 com processador Intel Core i5, 8GB RAM, SSD 256GB, Windows 11 Pro.',
    lat: -23.55052, 
    lng: -46.633308
  },
  { 
    id: 'PAT002', 
    titulo: 'Cadeira Ergonômica', 
    tipo: 'patrimonial',
    subtipo: 'Móveis', 
    status: 'ativo',
    localizacao: 'Sala 102, Edifício Principal',
    responsavel: 'Maria Santos',
    valor: 'R$ 850,00',
    descricao: 'Cadeira ergonômica President com apoio lombar, regulagem de altura, braços ajustáveis.',
    lat: -23.55152, 
    lng: -46.633408
  },
  { 
    id: 'PAT003', 
    titulo: 'Impressora Laser', 
    tipo: 'patrimonial',
    subtipo: 'Eletrônicos', 
    status: 'manutenção',
    localizacao: 'Recepção, Térreo',
    responsavel: 'Carlos Oliveira',
    valor: 'R$ 1.200,00',
    descricao: 'Impressora multifuncional laser HP LaserJet Pro M404dn, com impressão duplex automática.',
    lat: -23.54952, 
    lng: -46.633208
  },
  // Ocorrências Veiculares
  { 
    id: 'VEI001', 
    titulo: 'Fiat Cronos - ABC-1234', 
    tipo: 'veicular',
    subtipo: 'Frota Corporativa',
    status: 'ativo',
    marca: 'Fiat', 
    modelo: 'Cronos', 
    placa: 'ABC-1234', 
    ano: 2020,
    cor: 'Branco',
    localizacao: 'Garagem Principal',
    observacoes: 'Veículo da frota corporativa. Possui seguro total e rastreamento GPS.',
    lat: -23.55252, 
    lng: -46.633508
  },
  { 
    id: 'VEI002', 
    titulo: 'Chevrolet Onix - DEF-5678', 
    tipo: 'veicular',
    subtipo: 'Executivo',
    status: 'ativo',
    marca: 'Chevrolet', 
    modelo: 'Onix', 
    placa: 'DEF-5678', 
    ano: 2022,
    cor: 'Prata',
    localizacao: 'Vaga Executiva',
    observacoes: 'Carro executivo para diretoria. Equipado com ar condicionado digital.',
    lat: -23.54852, 
    lng: -46.633108
  },
  { 
    id: 'VEI003', 
    titulo: 'Ford Ranger - GHI-9012', 
    tipo: 'veicular',
    subtipo: 'Utilitário',
    status: 'manutenção',
    marca: 'Ford', 
    modelo: 'Ranger', 
    placa: 'GHI-9012', 
    ano: 2021,
    cor: 'Azul',
    localizacao: 'Oficina Externa',
    observacoes: 'Caminhonete para trabalhos externos. Carroceria dupla, tração 4x4, diesel.',
    lat: -23.55352, 
    lng: -46.633608
  }
];

// Variável para controlar o filtro atual
window.currentFilter = 'todos';

window.veicularData = [
  { 
    id: 'VEI001', 
    marca: 'Fiat', 
    modelo: 'Cronos', 
    placa: 'ABC-1234', 
    ano: 2020,
    cor: 'Branco',
    observacoes: 'Veículo da frota corporativa. Possui seguro total e rastreamento GPS. Última manutenção em 15/11/2023.'
  },
  { 
    id: 'VEI002', 
    marca: 'Chevrolet', 
    modelo: 'Onix', 
    placa: 'DEF-5678', 
    ano: 2022,
    cor: 'Prata',
    observacoes: 'Carro executivo para diretoria. Equipado com ar condicionado digital, central multimídia e bancos de couro.'
  },
  { 
    id: 'VEI003', 
    marca: 'Ford', 
    modelo: 'Ranger', 
    placa: 'GHI-9012', 
    ano: 2021,
    cor: 'Azul',
    observacoes: 'Caminhonete para trabalhos externos e transporte de equipamentos. Carroceria dupla, tração 4x4, diesel.'
  }
];

// -------------------- 2. Permissões --------------------------------------
window.hasPermission = function(action) {
  if (currentUserRole === 'admin') return true;
  if (currentUserRole === 'editor') return action === 'edit' || action === 'view';
  if (currentUserRole === 'viewer') return action === 'view';
  return false;
}

// -------------------- 3. Funções utilitárias para itens ------------------
function openSimpleModal(html) {
  let overlay = document.getElementById('simple-view-modal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'simple-view-modal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;z-index:950;';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
  }
  overlay.innerHTML = `<div style="background:#fff;border-radius:8px;max-width:500px;width:90%;padding:20px;position:relative;">${html}<button style="position:absolute;top:8px;right:12px;font-size:20px;background:none;border:none;cursor:pointer;">&times;</button></div>`;
  overlay.querySelector('button').addEventListener('click', () => overlay.style.display = 'none');
  overlay.style.display = 'flex';
}

window.viewItem = function(type, id) {
  if (!window.hasPermission('view')) {
    window.showToast('Você não tem permissão para visualizar este item.', 'error');
    return;
  }
  
  let item;
  if (type === 'patrimonial') {
    item = window.patrimonialData.find(p => p.id === id);
  } else if (type === 'veicular') {
    item = window.veicularData.find(v => v.id === id);
  } else if (type === 'ocorrencia') {
    item = window.ocorrenciasData.find(o => o.id === id);
  }
  
  if (!item) {
    window.showToast('Item não encontrado', 'error');
    return;
  }
  
  openFormModal(item, type, 'view');
}

function openFormModal(item, type, mode = 'view') {
  const modal = document.getElementById('modal-ocorrencia');
  const modalContent = document.getElementById('modal-content-ocorrencia');
  
  if (!modal || !modalContent) return;

  // Limpar conteúdo anterior, exceto botão fechar
  Array.from(modalContent.children).forEach(child => {
    if (!child.classList.contains('close-modal')) child.remove();
  });

  let originalForm;
  if (type === 'veicular') {
    originalForm = createVeicularForm();
  } else {
    originalForm = document.getElementById('form-ocorrencia');
  }

  if (!originalForm) return;

  const cloned = originalForm.cloneNode(true);
  cloned.style.display = 'block';
  
  // Configurar modo de visualização
  if (mode === 'view') {
    configureViewMode(cloned, item, type);
  } else if (mode === 'edit') {
    configureEditMode(cloned, item, type);
  }

  modalContent.appendChild(cloned);
  // Abrir modal via AccessibilityManager com fallback
  if (window.accessibilityManager && typeof window.accessibilityManager.openModal === 'function') {
    window.accessibilityManager.openModal(modal);
  } else {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      modal.classList.add('show');
      try {
        const focusableSelectors = [
          'button', '[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
        ];
        const focusable = modal.querySelectorAll(focusableSelectors.join(','));
        for (const el of focusable) {
          if (!el.disabled && el.offsetParent !== null) { el.focus(); break; }
        }
        if (document.activeElement === document.body) {
          if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
          modal.focus();
        }
      } catch (_) {}
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function configureViewMode(form, item, type) {
  // Alterar título
  const header = form.querySelector('.form-header h3');
  if (header) {
    header.textContent = `Visualizar ${type === 'patrimonial' ? 'Item Patrimonial' : 'Veículo'}`;
  }
  
  const description = form.querySelector('.form-header p');
  if (description) {
    description.textContent = 'Informações detalhadas do registro';
  }

  // Preencher campos com dados do item
  if (type === 'patrimonial') {
    fillPatrimonialForm(form, item);
  } else if (type === 'veicular') {
    fillVeicularForm(form, item);
  }

  // Tornar campos somente leitura
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.readOnly = true;
    input.disabled = true;
    input.classList.add('readonly');
  });

  // Desabilitar upload de fotos
  const photoUpload = form.querySelector('.photo-upload-container');
  if (photoUpload) {
    photoUpload.style.display = 'none';
  }

  // Adicionar classe para modo visualização
  form.classList.add('view-mode');

  // Alterar botões
  const actions = form.querySelector('.form-actions');
  if (actions) {
    actions.innerHTML = `
      <button type="button" class="form-button btn-secondary btn-close-ocorrencia-modal">
        <i class="bx bx-x"></i> Fechar
      </button>
      <button type="button" class="form-button btn-primary btn-edit-from-view" data-type="${type}" data-id="${item.id}">
        <i class="bx bx-edit"></i> Editar
      </button>
    `;
    const closeBtn = actions.querySelector('.btn-close-ocorrencia-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const overlay = document.getElementById('modal-ocorrencia');
        if (overlay) {
          if (window.accessibilityManager) {
            window.accessibilityManager.closeModal(overlay);
          } else {
            overlay.classList.remove('show');
            overlay.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
              overlay.classList.add('hidden');
              document.body.style.overflow = '';
            }, 300);
          }
        }
      });
    }
    const editBtn = actions.querySelector('.btn-edit-from-view');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.editItemFromView(type, item.id);
      });
    }
  }
}

function configureEditMode(form, item, type) {
  // Configurar modo de edição (implementar se necessário)
  // Por enquanto, apenas preencher os campos
  if (type === 'patrimonial') {
    fillPatrimonialForm(form, item);
  } else if (type === 'veicular') {
    fillVeicularForm(form, item);
  }
}

function fillPatrimonialForm(form, item) {
  const mappings = {
    'solicitante': item.responsavel || '',
    'motivo': item.tipo || '',
    'valor': item.valor || '',
    'data': new Date().toISOString().split('T')[0],
    'cliente': item.nome || '',
    'relatorio': item.descricao || `Item: ${item.nome}\nTipo: ${item.tipo}\nLocalização: ${item.localizacao}`,
    'endereco': item.endereco || item.localizacao || '',
    'cidade': item.cidade || '',
    'estado': item.estado || ''
  };

  Object.entries(mappings).forEach(([fieldName, value]) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.value = value;
    }
  });
}

function fillVeicularForm(form, item) {
  const mappings = {
    'veicular-marca': item.marca || '',
    'veicular-modelo': item.modelo || '',
    'veicular-placa': item.placa || '',
    'veicular-ano': item.ano || '',
    'veicular-cor': item.cor || '',
    'veicular-observacoes': item.observacoes || `Veículo: ${item.marca} ${item.modelo}\nPlaca: ${item.placa}\nAno: ${item.ano}`
  };

  Object.entries(mappings).forEach(([fieldName, value]) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.value = value;
    }
  });
}

// Função para criar formulário veicular dinamicamente
function createVeicularForm() {
  const form = document.createElement('form');
  form.className = 'form-ocorrencia modern-form';
  form.innerHTML = `
    <div class="form-header">
      <h3>Novo Cadastro Veicular</h3>
      <p>Preencha os dados abaixo para registrar um novo veículo</p>
    </div>
    
    <div class="form-section">
      <div class="section-header">
        <h4><i class="bx bx-car"></i> Informações do Veículo</h4>
      </div>
      <div class="form-grid">
        <div class="input-group">
          <label for="veicular-marca">Marca*</label>
          <input type="text" name="veicular-marca" required placeholder="Ex: Fiat, Ford, Chevrolet">
        </div>
        <div class="input-group">
          <label for="veicular-modelo">Modelo*</label>
          <input type="text" name="veicular-modelo" required placeholder="Ex: Uno, Fiesta, Onix">
        </div>
        <div class="input-group">
          <label for="veicular-placa">Placa*</label>
          <input type="text" name="veicular-placa" required placeholder="ABC-1234" maxlength="8">
        </div>
        <div class="input-group">
          <label for="veicular-ano">Ano*</label>
          <input type="number" name="veicular-ano" required min="1990" max="2024" placeholder="2023">
        </div>
        <div class="input-group">
          <label for="veicular-cor">Cor</label>
          <input type="text" name="veicular-cor" placeholder="Ex: Branco, Preto, Prata">
        </div>
        <div class="input-group span-full">
          <label for="veicular-observacoes">Observações</label>
          <textarea name="veicular-observacoes" rows="3" placeholder="Observações adicionais sobre o veículo..."></textarea>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="form-button btn-secondary">
        <i class="bx bx-x"></i> Cancelar
      </button>
      <button type="submit" class="form-button btn-primary">
        <i class="bx bx-check"></i> Salvar Cadastro
      </button>
    </div>
  `;
  // cancelar fecha modal via classes
  const cancelBtn = form.querySelector('.btn-secondary');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const overlay = document.getElementById('modal-ocorrencia');
      if (overlay) {
        if (window.accessibilityManager) {
          window.accessibilityManager.closeModal(overlay);
        } else {
          overlay.classList.remove('show');
          overlay.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
          }, 300);
        }
      }
    });
  }
  return form;
}

// Função global para editar item a partir da visualização
window.editItemFromView = function(type, id) {
  let item;
  if (type === 'patrimonial') {
    item = window.patrimonialData.find(p => p.id === id);
  } else if (type === 'veicular') {
    item = window.veicularData.find(v => v.id === id);
  }
  
  if (item) {
    openFormModal(item, type, 'edit');
  }
};

window.editItem = function(type, id) {
  if (!window.hasPermission('edit')) {
    window.showToast('Você não tem permissão para editar este item.', 'error');
    return;
  }
  window.showToast(`Editando item ${type} ${id}`);
}

// -------------------- 4. Renderização de Grids ---------------------------
window.renderPatrimonialGrid = function() {
  const gridBody = document.querySelector('#grid-patrimonial tbody');
  if (!gridBody) return;
  gridBody.innerHTML = '';
  
  // Dados estáticos patrimoniais
  const patrimonialEstatico = [
    {
      id: 1,
      nome: 'Computador Desktop Dell',
      tipo: 'Equipamento de TI',
      localizacao: 'Sala 101 - Administrativo'
    },
    {
      id: 2,
      nome: 'Mesa de Escritório',
      tipo: 'Mobiliário',
      localizacao: 'Sala 205 - Recursos Humanos'
    },
    {
      id: 3,
      nome: 'Impressora Multifuncional',
      tipo: 'Equipamento de TI',
      localizacao: 'Corredor Principal'
    }
  ];
  
  patrimonialEstatico.forEach(item => {
    const row = gridBody.insertRow();
    
    // ID com estilo especial
    const idCell = row.insertCell();
    idCell.innerHTML = `<span class="grid-id">${item.id}</span>`;
    
    row.insertCell().textContent = item.nome;
    row.insertCell().textContent = item.tipo;
    row.insertCell().textContent = item.localizacao;

    const actionsCell = row.insertCell();
    actionsCell.classList.add('action-buttons');
    const viewBtn = document.createElement('button');
    viewBtn.innerHTML = '<i class="bx bx-eye"></i> Ver';
    viewBtn.classList.add('btn-view');
    actionsCell.appendChild(viewBtn);
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="bx bx-edit"></i> Editar';
    editBtn.classList.add('btn-edit');
    actionsCell.appendChild(editBtn);
  });
}



// Função para filtrar dados por tipo
window.filterOcorrencias = function(filterType) {
  window.currentFilter = filterType;
  let filteredData = window.ocorrenciasData;
  
  if (filterType === 'patrimonial') {
    filteredData = window.ocorrenciasData.filter(item => item.tipo === 'patrimonial');
  } else if (filterType === 'veicular') {
    filteredData = window.ocorrenciasData.filter(item => item.tipo === 'veicular');
  }
  
  window.renderOcorrenciasGrid(filteredData);
  
  // Atualizar botões de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
}

window.renderOcorrenciasGrid = function() {
  const gridBody = document.querySelector('#grid-ocorrencias tbody');
  if (!gridBody) return;
  gridBody.innerHTML = '';
  
  // Dados estáticos de ocorrências
  const ocorrenciasEstaticas = [
    {
      id: 1,
      titulo: 'Furto de equipamento',
      tipo: 'patrimonial',
      subtipo: 'Furto',
      status: 'Em Andamento',
      localizacao: 'Sala 101 - Administrativo',
      data: '15/01/2024'
    },
    {
      id: 2,
      titulo: 'Acidente de trânsito',
      tipo: 'veicular',
      subtipo: 'Colisão',
      status: 'Pendente',
      localizacao: 'Rua Principal, 456',
      data: '14/01/2024'
    },
    {
      id: 3,
      titulo: 'Vandalismo',
      tipo: 'geral',
      subtipo: 'Dano ao patrimônio',
      status: 'Concluída',
      localizacao: 'Estacionamento',
      data: '13/01/2024'
    }
  ];
  
  ocorrenciasEstaticas.forEach(item => {
    const row = gridBody.insertRow();
    
    // ID com estilo especial
    const idCell = row.insertCell();
    idCell.innerHTML = `<span class="grid-id">${item.id}</span>`;
    
    // Título
    row.insertCell().textContent = item.titulo;
    
    // Tipo com badge colorido
    const tipoCell = row.insertCell();
    const tipoClass = item.tipo === 'patrimonial' ? 'tipo-patrimonial' : 'tipo-veicular';
    tipoCell.innerHTML = `<span class="tipo-badge ${tipoClass}">${item.tipo}</span>`;
    
    // Subtipo
    row.insertCell().textContent = item.subtipo;
    
    // Status com cor
    const statusCell = row.insertCell();
    const statusClass = item.status === 'ativo' ? 'status-active' : 
                       item.status === 'manutenção' ? 'status-maintenance' : 'status-inactive';
    statusCell.innerHTML = `<span class="status-badge ${statusClass}">${item.status}</span>`;
    
    // Localização
    row.insertCell().textContent = item.localizacao;

    const actionsCell = row.insertCell();
    actionsCell.classList.add('action-buttons');
    
    const viewBtn = document.createElement('button');
    viewBtn.innerHTML = '<i class="bx bx-eye"></i> Ver';
    viewBtn.classList.add('btn-view');
    viewBtn.addEventListener('click', () => window.viewItem(item.tipo, item.id));
    actionsCell.appendChild(viewBtn);
    
    const mapBtn = document.createElement('button');
    mapBtn.innerHTML = '<i class="bx bx-map"></i> Localizar';
    mapBtn.classList.add('btn-map');
    mapBtn.addEventListener('click', () => window.focusOnMap(item.lat, item.lng));
    actionsCell.appendChild(mapBtn);
    
    if (window.hasPermission('edit')) {
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '<i class="bx bx-edit"></i> Editar';
      editBtn.classList.add('btn-edit');
      editBtn.addEventListener('click', () => window.editItem(item.tipo, item.id));
      actionsCell.appendChild(editBtn);
    }
  });
}

window.renderVeicularGrid = function() {
  const gridBody = document.querySelector('#grid-veicular tbody');
  if (!gridBody) return;
  gridBody.innerHTML = '';
  
  // Dados estáticos veiculares
  const veicularEstatico = [
    {
      id: 1,
      marca: 'Toyota',
      modelo: 'Corolla',
      placa: 'ABC-1234',
      ano: '2022'
    },
    {
      id: 2,
      marca: 'Honda',
      modelo: 'Civic',
      placa: 'DEF-5678',
      ano: '2021'
    },
    {
      id: 3,
      marca: 'Volkswagen',
      modelo: 'Jetta',
      placa: 'GHI-9012',
      ano: '2023'
    }
  ];
  
  veicularEstatico.forEach(item => {
    const row = gridBody.insertRow();
    
    // ID com estilo especial
    const idCell = row.insertCell();
    idCell.innerHTML = `<span class="grid-id">${item.id}</span>`;
    
    row.insertCell().textContent = item.marca;
    row.insertCell().textContent = item.modelo;
    
    // Placa com destaque
    const placaCell = row.insertCell();
    placaCell.innerHTML = `<span class="vehicle-plate">${item.placa}</span>`;
    
    // Ano com destaque
    const anoCell = row.insertCell();
    anoCell.innerHTML = `<span class="vehicle-year">${item.ano}</span>`;

    const actionsCell = row.insertCell();
    actionsCell.classList.add('action-buttons');
    const viewBtn = document.createElement('button');
    viewBtn.innerHTML = '<i class="bx bx-eye"></i> Ver';
    viewBtn.classList.add('btn-view');
    actionsCell.appendChild(viewBtn);
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="bx bx-edit"></i> Editar';
    editBtn.classList.add('btn-edit');
    actionsCell.appendChild(editBtn);
  });
}

// -------------------- 5. Dashboard / Notificações -----------------------
window.updateDashboardStats = function() {
  const pending = window.ocorrenciasData.filter(o => o.status === 'pendente').length;
  const finalized = window.ocorrenciasData.filter(o => o.status === 'finalizada').length;
  const total = window.ocorrenciasData.length;
  
  // Métricas baseadas em ocorrências cadastradas
  const patrimonialCount = window.patrimonialData ? window.patrimonialData.length : 0;
  const veicularCount = window.veicularData ? window.veicularData.length : 0;
  const totalRegistered = patrimonialCount + veicularCount;
  
  // Métricas da sessão atual (se disponível)
  let sessionStats = null;
  if (window.dashboardMetrics) {
    sessionStats = window.dashboardMetrics.getOccurrenceStats();
  }
  
  // Atualizar elementos do dashboard
  const pendingEl = document.getElementById('count-pending');
  const finalizedEl = document.getElementById('count-finalized');
  const totalEl = document.getElementById('count-total');
  
  if (pendingEl) pendingEl.textContent = pending;
  if (finalizedEl) finalizedEl.textContent = finalized;
  if (totalEl) totalEl.textContent = total;
  
  // Atualizar métricas de cadastros (se elementos existirem)
  const patrimonialCountEl = document.getElementById('count-patrimonial');
  const veicularCountEl = document.getElementById('count-veicular');
  const totalRegisteredEl = document.getElementById('count-total-registered');
  const sessionRegisteredEl = document.getElementById('count-session-registered');
  
  if (patrimonialCountEl) patrimonialCountEl.textContent = patrimonialCount;
  if (veicularCountEl) veicularCountEl.textContent = veicularCount;
  if (totalRegisteredEl) totalRegisteredEl.textContent = totalRegistered;
  
  if (sessionStats && sessionRegisteredEl) {
    sessionRegisteredEl.textContent = sessionStats.thisSession;
  }
  
  // Log das métricas para debug
  console.log('📊 Dashboard Stats:', {
    pending,
    finalized,
    total,
    patrimonialCount,
    veicularCount,
    totalRegistered,
    sessionStats
  });
}

window.renderNotifications = function() {
  const list = document.querySelector('.dashboard-notifications ul');
  if (!list) return;
  list.innerHTML = '';
  window.ocorrenciasData.filter(o => o.status === 'pendente').forEach(o => {
    const li = document.createElement('li');
    li.innerHTML = `<i class='bx bxs-bell-ring'></i> Ocorrência pendente: #${o.id} - ${o.titulo}`;
    list.appendChild(li);
  });
}
