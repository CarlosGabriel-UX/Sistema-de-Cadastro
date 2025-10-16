// Funções acessadas via window object

/**
 * Modal genérico para "Novo Cadastro". Exibe o formulário adequado (patrimonial ou veicular)
 * conforme o botão ativo em .tipo-selector. O formulário original permanece oculto na página
 * e é clonado para dentro do modal a cada abertura.
 */
window.initCadastroModal = function() {
  const openBtn = document.getElementById('btn-open-ocorrencia-modal'); // botão azul no header
  const modal = document.getElementById('modal-ocorrencia');
  const modalContent = document.getElementById('modal-content-ocorrencia');
  const closeHeaderBtn = document.getElementById('close-ocorrencia-modal');

  if (!(openBtn && modal && modalContent)) return;

  // Utilitário local de foco (fallback se o accessibilityManager não estiver disponível)
  function localInitialFocus(targetModal, preferredSelectors = []) {
    try {
      for (const selector of preferredSelectors) {
        const el = targetModal.querySelector(selector);
        if (el && !el.disabled && el.offsetParent !== null) { el.focus(); return; }
      }
      const focusableSelectors = [
        'button','[href]','input','select','textarea','[tabindex]:not([tabindex="-1"])'
      ];
      const focusable = targetModal.querySelectorAll(focusableSelectors.join(','));
      for (const el of focusable) {
        if (!el.disabled && el.offsetParent !== null) { el.focus(); return; }
      }
      if (!targetModal.hasAttribute('tabindex')) targetModal.setAttribute('tabindex', '-1');
      targetModal.focus();
    } catch (_) {}
  }

  // Mantém formulário original invisível na página
  const formPatrimonial = document.getElementById('form-ocorrencia');
  if (formPatrimonial) formPatrimonial.style.display = 'none';

  if (closeHeaderBtn && modal) {
    closeHeaderBtn.addEventListener('click', () => {
      if (window.accessibilityManager && modal) {
        window.accessibilityManager.closeModal(modal);
      } else {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    });
  }

  openBtn.addEventListener('click', () => {
    // Qual tipo está ativo?
    const activeTipoBtn = document.querySelector('.tipo-btn.active');
    const tipo = activeTipoBtn?.dataset.tipo || 'patrimonial';

    // Limpa conteúdo anterior do modal
    Array.from(modalContent.children).forEach(child => {
      child.remove();
    });

    let originalForm;
    if (tipo === 'veicular') {
      originalForm = createVeicularForm();
    } else {
      originalForm = formPatrimonial;
    }

    if (!originalForm) return;

    const cloned = originalForm.cloneNode(true);
    cloned.style.display = 'block';
    
    // Inicializar cepService para o formulário clonado
    setTimeout(() => {
      if (window.initCepService) {
        window.initCepService();
      }
    }, 100);
    
    // Configurar botão cancelar do formulário clonado
    const cancelBtn = cloned.querySelector('#btn-cancelar');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja cancelar? Todos os dados serão perdidos.')) {
          if (window.accessibilityManager && modal) {
            window.accessibilityManager.closeModal(modal);
          } else {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            setTimeout(() => {
              modal.classList.add('hidden');
              document.body.style.overflow = '';
            }, 300);
          }
        }
      });
    }

    // --- Submit handler específico por tipo -------------------------
    cloned.addEventListener('submit', (e) => {
      e.preventDefault();
      if (tipo === 'veicular') {
        const anoAtual = new Date().getFullYear();
        const placaRegex = /^[A-Z]{3}-?\d{4}$/i;
        const rules = [
          { name: 'veicular-marca', validate: v => v.trim().length > 1, message: 'Marca obrigatória.' },
          { name: 'veicular-modelo', validate: v => v.trim().length > 1, message: 'Modelo obrigatório.' },
          { name: 'veicular-placa', validate: v => placaRegex.test(v), message: 'Placa inválida.' },
          { name: 'veicular-ano', validate: v => Number(v) >= 1990 && Number(v) <= anoAtual, message: `Ano deve estar entre 1990 e ${anoAtual}.` }
        ];
        if (!window.validateForm || !window.validateForm(cloned, rules)) return;
        const newItem = {
          id: 'VEI' + String(veicularData.length + 1).padStart(3, '0'),
          marca: cloned.querySelector('[name="veicular-marca"]').value,
          modelo: cloned.querySelector('[name="veicular-modelo"]').value,
          placa: cloned.querySelector('[name="veicular-placa"]').value,
          ano: cloned.querySelector('[name="veicular-ano"]').value,
          cor: cloned.querySelector('[name="veicular-cor"]').value,
          observacoes: cloned.querySelector('[name="veicular-observacoes"]').value
        };
        if (window.veicularData) window.veicularData.push(newItem);
        
        // Registrar métrica de ocorrência
        if (window.dashboardMetrics) {
            window.dashboardMetrics.recordOccurrenceRegistration('veicular');
        }
        
        if (window.renderVeicularGrid) window.renderVeicularGrid();
        if (window.showToast) window.showToast('Veículo cadastrado!', 'success');
      } else {
        // patrimonial
        const photoValidation = window.validatePhotos ? window.validatePhotos() : { valid: true };
        if (!photoValidation.valid) {
          if (window.showToast) window.showToast(photoValidation.message, 'error');
          return;
        }
        
        const rules = [
          { name: 'solicitante', validate: v => v.trim() !== '', message: 'Solicitante obrigatório.' },
          { name: 'motivo', validate: v => v.trim() !== '', message: 'Motivo obrigatório.' },
          { name: 'data', validate: v => v.trim() !== '', message: 'Data obrigatória.' },
          { name: 'relatorio', validate: v => v.trim().length >= 10, message: 'Relatório muito curto.' }
        ];
        if (!window.validateForm || !window.validateForm(cloned, rules)) return;
        const newItem = {
          id: 'PAT' + String(patrimonialData.length + 1).padStart(3, '0'),
          nome: cloned.querySelector('[name="solicitante"]').value,
          tipo: cloned.querySelector('[name="motivo"]').value,
          localizacao: cloned.querySelector('[name="cliente"]').value || 'Não informado',
          valor: cloned.querySelector('[name="valor"]').value,
          data: cloned.querySelector('[name="data"]').value,
          relatorio: cloned.querySelector('[name="relatorio"]').value
        };
        if (window.patrimonialData) window.patrimonialData.push(newItem);
        
        // Registrar métrica de ocorrência
        if (window.dashboardMetrics) {
            window.dashboardMetrics.recordOccurrenceRegistration('patrimonial');
        }
        
        if (window.renderPatrimonialGrid) window.renderPatrimonialGrid();
        if (window.showToast) window.showToast('Ocorrência Patrimonial registrada!', 'success');
      }
      if (window.accessibilityManager && modal) {
        window.accessibilityManager.closeModal(modal);
      } else {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    });

    modalContent.appendChild(cloned);
    
    // Abrir via AccessibilityManager (com prioridade de foco por tipo)
    const preferred = tipo === 'veicular' ? ['[name="veicular-marca"]'] : ['[name="motivo"]'];
    if (window.accessibilityManager && typeof window.accessibilityManager.openModal === 'function') {
      window.accessibilityManager.openModal(modal, preferred);
    } else {
      // Fallback manual
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        modal.classList.add('show');
        localInitialFocus(modal, preferred);
      }, 10);
      document.body.style.overflow = 'hidden';
    }
  });

  // Função para fechar modal removida - botão X foi removido
  
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      if (window.accessibilityManager && modal) {
        window.accessibilityManager.closeModal(modal);
      } else {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
      if (window.accessibilityManager && modal) {
        // Gerenciador de acessibilidade trata Escape globalmente; evitar duplicidade
        return;
      } else {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    }
  });
}

function createVeicularForm() {
  const form = document.createElement('form');
  form.id = 'form-veicular-add';
  form.className = 'form-ocorrencia modern-form';
  form.innerHTML = `
    <div class="form-header">
      <h3>Novo Cadastro Veicular</h3>
      <p>Preencha os dados do veículo</p>
    </div>
    
    <div class="form-section">
      <div class="section-header">
        <h4><i class="bx bx-car"></i> Dados do Veículo</h4>
      </div>
      <div class="form-grid">
        <div class="input-group">
          <label>Marca*</label>
          <input type="text" name="veicular-marca" required placeholder="Ex: Fiat, Ford, Chevrolet">
        </div>
        <div class="input-group">
          <label>Modelo*</label>
          <input type="text" name="veicular-modelo" required placeholder="Ex: Civic, Corolla, Onix">
        </div>
        <div class="input-group">
          <label>Placa*</label>
          <input type="text" name="veicular-placa" required placeholder="ABC-1234">
        </div>
        <div class="input-group">
          <label>Ano*</label>
          <input type="number" name="veicular-ano" required placeholder="2020" min="1990" max="2025">
        </div>
        <div class="input-group">
          <label>Cor</label>
          <input type="text" name="veicular-cor" placeholder="Ex: Branco, Prata, Preto">
        </div>
        <div class="input-group span-full">
          <label>Observações</label>
          <textarea name="veicular-observacoes" rows="3" placeholder="Informações adicionais sobre o veículo..."></textarea>
        </div>
      </div>
    </div>
    
    <div class="form-actions">
      <button type="button" class="form-button btn-secondary">
        <i class="bx bx-x"></i> Cancelar
      </button>
      <button type="submit" class="form-button btn-primary">
        <i class="bx bx-check"></i> Salvar Veículo
      </button>
    </div>`;
  
  // cancelar fecha modal
  form.querySelector('.btn-secondary').addEventListener('click', () => {
    const modal = document.getElementById('modal-ocorrencia');
    if (modal) {
      if (window.accessibilityManager) {
        window.accessibilityManager.closeModal(modal);
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      } else {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    }
  });
  return form;
}
