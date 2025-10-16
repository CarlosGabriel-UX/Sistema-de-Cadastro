// forms/fieldEnhancements.js
// Aplica máscaras e auto-preenchimento em campos de formulários

window.initFieldEnhancements = function() {
  initMoneyMask();
  initCepMaskAndAutoFill();
}

function initMoneyMask() {
  const moneyInputs = document.querySelectorAll('.money-input');
  moneyInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const onlyDigits = e.target.value.replace(/\D/g, '');
      if (!onlyDigits) {
        e.target.value = '';
        return;
      }
      const number = parseFloat(onlyDigits) / 100;
      const formatted = number.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      // remove espaço após R$ para consistência visual
      e.target.value = formatted.replace('R$', 'R$ ');
    });
  });
}

function initCepMaskAndAutoFill() {
  const cepInputs = document.querySelectorAll('.cep-input');
  cepInputs.forEach(input => {
    // Verificar se já tem o serviço avançado de CEP inicializado
    if (input.id === 'cep' && input.hasAttribute('data-cep-service-init')) {
      return; // Pular se o serviço avançado já foi inicializado
    }
    
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      if (v.length > 5) {
        v = v.replace(/(\d{5})(\d+)/, '$1-$2');
      }
      e.target.value = v;
    });

    input.addEventListener('blur', async (e) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length !== 8) return;
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (!res.ok) throw new Error('Erro na consulta CEP');
        const data = await res.json();
        if (data.erro) throw new Error('CEP não encontrado');

        const cidade = document.getElementById('cidade');
        const endereco = document.getElementById('endereco');
        const estado = document.getElementById('estado');
        if (cidade) cidade.value = data.localidade || '';
        if (endereco) endereco.value = `${data.logradouro || ''} ${data.bairro || ''}`.trim();
        if (estado) estado.value = data.uf || '';
      } catch (err) {
        if (window.showToast) {
          window.showToast(err.message || 'Erro ao buscar CEP', 'error');
        } else {
          alert(err.message);
        }
      }
    });
  });
}
