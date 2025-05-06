// Tesla Envanter Takip ve Sipariş Asistanı - content_scripts/content_inventory.js

console.log("Tesla Asistanı - Envanter Sayfası İçerik Scripti Yüklendi");

// PRD 5.7: Enjekte Edilen Durum Paneli
function injectStatusPanel() {
  const panelId = 'tesla-assist-status-panel';
  if (document.getElementById(panelId)) {
    return; // Panel zaten eklenmiş
  }

  const panel = document.createElement('div');
  panel.id = panelId;
  // Stil için style.css veya doğrudan stil eklenebilir.
  // panel.style.position = 'fixed'; ...
  panel.innerHTML = `
    <div class="tas-panel-header">Tesla Asistanı Durumu</div>
    <div class="tas-panel-content">
      <p>Eklenti Durumu: <span id="tas-plugin-status">Yükleniyor...</span></p>
      <p>Son Kontrol: <span id="tas-last-check">-</span></p>
      <p>Toplam Kontrol: <span id="tas-total-checks">-</span></p>
      <p>Bulunan Araç: <span id="tas-found-cars">-</span></p>
      <button id="tas-toggle-tracking-content">İzlemeyi Başlat</button>
    </div>
  `;
  document.body.appendChild(panel);
  console.log("Durum paneli enjekte edildi.");

  // TODO: Butona event listener ekle (popup'taki gibi background'a mesaj gönderecek)
  const toggleButton = document.getElementById('tas-toggle-tracking-content');
  if (toggleButton) {
    // toggleButton.addEventListener('click', () => { ... });
  }

  // TODO: chrome.runtime.onMessage ile background'dan gelen durum güncellemelerini dinle
  // ve paneldeki span'leri güncelle.
  // chrome.storage.onChanged ile storage değişikliklerini de dinleyebiliriz.
}

// Sayfa yüklendiğinde veya belirli bir element göründüğünde paneli enjekte et
if (document.readyState === "complete" || document.readyState === "interactive") {
  injectStatusPanel();
} else {
  document.addEventListener('DOMContentLoaded', injectStatusPanel);
}

// Background script'ten gelen mesajları dinleyerek paneli güncelle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStatusPanel") {
    console.log("Panel güncelleme mesajı alındı:", message.data);
    const data = message.data;
    if (document.getElementById('tas-plugin-status')) {
        document.getElementById('tas-plugin-status').textContent = data.pluginStatus || '-';
        document.getElementById('tas-last-check').textContent = data.lastCheck || '-';
        document.getElementById('tas-total-checks').textContent = data.totalChecks || '-';
        document.getElementById('tas-found-cars').textContent = data.foundCars || '-';
        
        const toggleButton = document.getElementById('tas-toggle-tracking-content');
        if(toggleButton) {
            toggleButton.textContent = data.isTracking ? "İzlemeyi Durdur" : "İzlemeyi Başlat";
        }
    }
    sendResponse({received: true});
  }
  return true;
});

// Başlangıçta durumu popup'taki gibi storage'dan okuyup butonu ayarlayabiliriz
chrome.storage.local.get(['isTrackingActive', 'lastStatusData'], (result) => {
    if (result.isTrackingActive !== undefined) {
        const toggleButton = document.getElementById('tas-toggle-tracking-content');
        if(toggleButton) {
            toggleButton.textContent = result.isTrackingActive ? "İzlemeyi Durdur" : "İzlemeyi Başlat";
        }
    }
    if (result.lastStatusData && document.getElementById('tas-plugin-status')) {
        document.getElementById('tas-plugin-status').textContent = result.lastStatusData.pluginStatus || (result.isTrackingActive ? 'Çalışıyor' : 'Durduruldu');
        document.getElementById('tas-last-check').textContent = result.lastStatusData.lastCheck || '-';
        document.getElementById('tas-total-checks').textContent = result.lastStatusData.totalChecks || '-';
        document.getElementById('tas-found-cars').textContent = result.lastStatusData.foundCars || '-';
    }
});


const toggleButtonContent = document.getElementById('tas-toggle-tracking-content');
if (toggleButtonContent) {
    toggleButtonContent.addEventListener('click', () => {
      const currentStatusText = toggleButtonContent.textContent;
      const newTrackingState = currentStatusText.includes('Başlat');
      
      chrome.runtime.sendMessage({ action: "startStopTracking", isTracking: newTrackingState }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("İçerik scriptinden mesaj gönderme hatası:", chrome.runtime.lastError.message);
          return;
        }
        console.log("İçerik scripti background'dan yanıt aldı:", response);
        // Durum storage'a yazıldığı için onchanged listener tetiklenip güncelleyecek
        // veya doğrudan burada da güncelleyebiliriz.
        toggleButtonContent.textContent = newTrackingState ? "İzlemeyi Durdur" : "İzlemeyi Başlat";
        if(document.getElementById('tas-plugin-status')){
            document.getElementById('tas-plugin-status').textContent = newTrackingState ? 'Çalışıyor' : 'Durduruldu';
        }
      });
    });
} 