// upload.js – módulo de upload de foto de perfil (front-end)

window.initProfileUpload = function() {
  const uploadInput = document.getElementById('upload-profile-photo');
  const previewImg = document.getElementById('profile-preview');
  const saveBtn = document.getElementById('savePhotoBtn');
  const statusEl = document.querySelector('.upload-status');
  const errorEl = document.querySelector('.upload-error');
  if (!uploadInput || !previewImg || !saveBtn) return; // elemento não existe na página

  let selectedFile = null;

  uploadInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    // validação básica
    if (!file.type.startsWith('image/')) {
      if (window.handleError) window.handleError('Tipo de arquivo não suportado', 'Upload Foto');
      uploadInput.value = '';
      return;
    }
    if (file.size > window.MAX_FILE_SIZE_MB * 1024 * 1024) {
      if (window.handleError) window.handleError(`Imagem excede ${window.MAX_FILE_SIZE_MB}MB`, 'Upload Foto');
      uploadInput.value = '';
      return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
      previewImg.src = ev.target.result;
      saveBtn.style.display = 'block';
      statusEl.style.display = 'none';
      errorEl.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      errorEl.textContent = 'Nenhuma foto selecionada para salvar.';
      errorEl.style.display = 'block';
      return;
    }

    // barra de progresso
    let progress = 0;
    statusEl.innerHTML = 'Salvando foto...';
    const bar = document.createElement('div');
    bar.style.height = '4px';
    bar.style.background = 'var(--primary-color)';
    bar.style.width = '0%';
    statusEl.appendChild(bar);
    const timer = setInterval(() => {
      progress = Math.min(progress + 10, 90);
      bar.style.width = progress + '%';
    }, 150);

    saveBtn.disabled = true;
    errorEl.style.display = 'none';
    statusEl.style.display = 'block';

    try {
      const response = await new Promise(res =>
        setTimeout(() => {
          const ok = Math.random() > 0.1;
          if (ok) res({ ok: true, json: () => Promise.resolve({ newPhotoUrl: previewImg.src }) });
          else res({ ok: false, statusText: 'Erro interno', json: () => Promise.resolve({ message: 'Falha na validação da imagem.' }) });
        }, 1500)
      );

      clearInterval(timer);
      bar.style.width = '100%';
      setTimeout(() => bar.remove(), 500);
      saveBtn.disabled = false;

      if (response.ok) {
        const { newPhotoUrl } = await response.json();
        document.querySelectorAll('.profile-picture-container img, #globalProfilePic, .user-img').forEach(img => (img.src = newPhotoUrl));
        statusEl.textContent = 'Foto atualizada com sucesso!';
        statusEl.style.display = 'block';
        errorEl.style.display = 'none';
        saveBtn.style.display = 'none';
        selectedFile = null;
      } else {
        const errData = await response.json();
        errorEl.textContent = `Erro ao salvar foto: ${errData.message || response.statusText}`;
        errorEl.style.display = 'block';
        statusEl.style.display = 'none';
      }
    } catch (err) {
      console.error('Erro no upload:', err);
      errorEl.textContent = 'Erro de conexão ao tentar salvar a foto.';
      errorEl.style.display = 'block';
      statusEl.style.display = 'none';
    }
  });
}
