// photoUpload.js - Gerenciamento de upload de fotos

let selectedFiles = [];

window.initPhotoUpload = function() {
    const fileInput = document.getElementById('fotos');
    const uploadArea = document.querySelector('.photo-upload-area');
    const previewContainer = document.getElementById('photo-preview');
    
    if (!fileInput || !uploadArea || !previewContainer) return;

    // Clique na área de upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Mudança no input de arquivo
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                if (selectedFiles.length < 5) { // Limite de 5 fotos
                    selectedFiles.push(file);
                    addPhotoPreview(file);
                } else {
                    alert('Limite máximo de 5 fotos atingido.');
                }
            } else {
                alert('Apenas arquivos de imagem são permitidos.');
            }
        });
    }

    function addPhotoPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'photo-preview-item';
            previewItem.dataset.filename = file.name;
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-photo" type="button">×</button>
                <div class="photo-name">${file.name}</div>
            `;
            
            // Botão de remover foto
            const removeBtn = previewItem.querySelector('.remove-photo');
            removeBtn.addEventListener('click', () => {
                removePhoto(file.name, previewItem);
            });
            
            previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }

    function removePhoto(filename, element) {
        selectedFiles = selectedFiles.filter(file => file.name !== filename);
        element.remove();
        
        // Atualizar o input de arquivo
        const dt = new DataTransfer();
        selectedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }

    // Função para obter arquivos selecionados
    window.getSelectedPhotos = function() {
        return selectedFiles;
    };

    // Função para limpar fotos
    window.clearPhotos = function() {
        selectedFiles = [];
        previewContainer.innerHTML = '';
        fileInput.value = '';
    };
}

// Validação de fotos
window.validatePhotos = function() {
    if (selectedFiles.length === 0) {
        return { valid: true, message: '' };
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB por foto
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        return { 
            valid: false, 
            message: `As seguintes fotos excedem o tamanho máximo de 5MB: ${oversizedFiles.map(f => f.name).join(', ')}` 
        };
    }
    
    return { valid: true, message: '' };
}

// Função para comprimir imagem se necessário
window.compressImage = function(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calcular novas dimensões
            let { width, height } = img;
            
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar e comprimir
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: file.lastModified
                });
                resolve(compressedFile);
            }, file.type, quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}
