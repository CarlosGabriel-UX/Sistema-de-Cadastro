// mapManager.js - Gerenciamento do mapa Leaflet para ocorrências
// As variáveis globais serão acessadas dos outros arquivos

let map = null;
let markers = [];

/**
 * Inicializa o mapa Leaflet
 */
window.initMap = function() {
  const mapContainer = document.getElementById('map-ocorrencias');
  if (!mapContainer) {
    console.warn('Container do mapa não encontrado');
    return;
  }

  // Verificar se o mapa já foi inicializado
  if (map) {
    map.remove();
  }

  // Criar o mapa centrado no Brasil
  map = L.map('map-ocorrencias').setView([-15.7942, -47.8822], 4);

  // Adicionar camada de tiles do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Renderizar marcadores das ocorrências
  renderOccurrenceMarkers();

  console.log('Mapa inicializado com sucesso');
}

/**
 * Renderiza os marcadores das ocorrências no mapa
 */
function renderOccurrenceMarkers() {
  if (!map) return;

  // Limpar marcadores existentes
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Adicionar marcadores para cada ocorrência
  window.ocorrenciasData.forEach(ocorrencia => {
    const marker = L.marker([ocorrencia.lat, ocorrencia.lng]);
    
    // Definir cor do marcador baseado no status
    const iconColor = ocorrencia.status === 'pendente' ? 'red' : 'green';
    
    // Criar popup com informações da ocorrência
    const popupContent = `
      <div class="map-popup">
        <h4>${ocorrencia.titulo}</h4>
        <p><strong>ID:</strong> ${ocorrencia.id}</p>
        <p><strong>Status:</strong> <span class="status-${ocorrencia.status}">${ocorrencia.status}</span></p>
        <p><strong>Coordenadas:</strong> ${ocorrencia.lat.toFixed(4)}, ${ocorrencia.lng.toFixed(4)}</p>
        <button onclick="viewOccurrenceDetails('${ocorrencia.id}')" class="btn-view-details">
          <i class="bx bx-eye"></i> Ver Detalhes
        </button>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    marker.addTo(map);
    markers.push(marker);
  });

  // Ajustar zoom para mostrar todos os marcadores
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

/**
 * Foca o mapa em uma coordenada específica
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
window.focusOnMap = function(lat, lng) {
  if (!map) {
    console.warn('Mapa não inicializado');
    return;
  }

  // Centralizar o mapa na coordenada
  map.setView([lat, lng], 15);

  // Encontrar e abrir o popup do marcador correspondente
  markers.forEach(marker => {
    const markerLatLng = marker.getLatLng();
    if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001) {
      marker.openPopup();
    }
  });
}

/**
 * Atualiza os marcadores do mapa
 */
window.updateMapMarkers = function() {
  renderOccurrenceMarkers();
}

/**
 * Função global para visualizar detalhes da ocorrência a partir do mapa
 * @param {string} id - ID da ocorrência
 */
window.viewOccurrenceDetails = function(id) {
  // Importar dinamicamente para evitar dependência circular
  import('./grid.js').then(({ viewItem }) => {
    viewItem('ocorrencia', id);
  });
};

/**
 * Redimensiona o mapa (útil quando o container muda de tamanho)
 */
window.resizeMap = function() {
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }
}

/**
 * Destrói o mapa
 */
window.destroyMap = function() {
  if (map) {
    map.remove();
    map = null;
    markers = [];
  }
}