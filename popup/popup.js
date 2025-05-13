// Tesla Envanter Takip ve Sipariş Asistanı - popup.js

document.addEventListener('DOMContentLoaded', () => {
  // Sekme yönetimi
  const tablinks = document.querySelectorAll('.tablink');
  tablinks.forEach(link => {
    link.addEventListener('click', (event) => {
      openTab(event.currentTarget.dataset.tabid, event.currentTarget);
    });
  });

  // Varsayılan olarak ilk sekmeyi aç
  const defaultTabId = 'tabSettings';
  const defaultTabButton = document.querySelector(`.tablink[data-tabid='${defaultTabId}']`);
  if (document.getElementById(defaultTabId) && defaultTabButton) {
    document.getElementById(defaultTabId).style.display = "block";
    defaultTabButton.classList.add("active");
  }

  loadAndDisplaySettings();

  // --- Ayarları Kaydetme Butonları ---
  document.getElementById('saveSettings')?.addEventListener('click', saveGeneralSettings);
  document.getElementById('saveTargetVehicle')?.addEventListener('click', saveTargetVehicleSettings);

  // İzlemeyi Başlat/Durdur Butonu
  const toggleTrackingButton = document.getElementById('toggleTracking');
  if (toggleTrackingButton) {
    toggleTrackingButton.addEventListener('click', () => {
      const currentStatusText = toggleTrackingButton.textContent;
      const newTrackingState = currentStatusText.includes('Başlat');
      
      chrome.runtime.sendMessage({ action: "startStopTracking", isTracking: newTrackingState }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Mesaj gönderme hatası:", chrome.runtime.lastError.message);
          document.getElementById('trackingStatus').textContent = "Hata!";
          alert(`Hata: ${chrome.runtime.lastError.message}`);
          return;
        }
        console.log("Background'dan yanıt:", response);
        if (response && response.status) {
           chrome.storage.local.get(['isTrackingActive', 'lastStatusData'], (result) => {
            updateTrackingButtonUI(result.isTrackingActive || false);
            updateStatusTabUI(result.lastStatusData);
          });
        } else {
           document.getElementById('trackingStatus').textContent = "Durum belirsiz";
        }
      });
    });
  }
  
  // Başlangıçta durumu storage'dan oku ve UI'ı güncelle
  chrome.storage.local.get(['isTrackingActive', 'lastStatusData'], (result) => {
    updateTrackingButtonUI(result.isTrackingActive || false);
    updateStatusTabUI(result.lastStatusData);
  });
});

function openTab(tabId, clickedButton) {
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.style.display = "block";
  }
  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

function saveGeneralSettings() {
  const settings = {
    trackingInterval: document.getElementById('trackingInterval')?.value || "60"
  };
  chrome.storage.local.set({ generalSettings: settings }, () => {
    console.log('Genel ayarlar kaydedildi:', settings);
    alert('Genel ayarlar kaydedildi!');
  });
}

function saveTargetVehicleSettings() {
  const selectedVehicle = document.querySelector('input[name="vehicle"]:checked');
  
  if (!selectedVehicle) {
    alert('Lütfen bir araç seçin!');
    return;
  }

  const targetVehicle = {
    selectedVehicle: selectedVehicle.value,
    vehicleName: selectedVehicle.closest('.vehicle-option').querySelector('.vehicle-name').textContent,
    vehiclePrice: selectedVehicle.closest('.vehicle-option').querySelector('.vehicle-price').textContent
  };
  
  chrome.storage.local.set({ targetVehicleSettings: targetVehicle }, () => {
    console.log('Hedef araç ayarları kaydedildi:', targetVehicle);
    alert('Hedef araç ayarları kaydedildi!');
  });
}

function loadAndDisplaySettings() {
  chrome.storage.local.get([
    'generalSettings',
    'targetVehicleSettings',
    'isTrackingActive',
    'lastStatusData'
  ], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Ayarları yüklerken hata:", chrome.runtime.lastError.message);
      return;
    }

    // Genel Ayarlar
    if (result.generalSettings) {
      document.getElementById('trackingInterval').value = result.generalSettings.trackingInterval || 60;
    }

    // Hedef Araç
    if (result.targetVehicleSettings && result.targetVehicleSettings.selectedVehicle) {
      const radio = document.querySelector(`input[name="vehicle"][value="${result.targetVehicleSettings.selectedVehicle}"]`);
      if (radio) {
        radio.checked = true;
      }
    }

    updateTrackingButtonUI(result.isTrackingActive || false);
    updateStatusTabUI(result.lastStatusData);
  });
}

function updateTrackingButtonUI(isTracking) {
  const toggleTrackingButton = document.getElementById('toggleTracking');
  const trackingStatusSpan = document.getElementById('trackingStatus');
  if (toggleTrackingButton) {
    toggleTrackingButton.textContent = isTracking ? "İzlemeyi Durdur" : "İzlemeyi Başlat";
  }
  if(trackingStatusSpan){
    trackingStatusSpan.textContent = isTracking ? "Çalışıyor" : "Durduruldu";
  }
}

function updateStatusTabUI(lastStatusData) {
    if (!lastStatusData) return;
    document.getElementById('lastCheckTime').textContent = lastStatusData.lastCheck || '-';
    document.getElementById('totalChecks').textContent = lastStatusData.totalChecks || '0';
    document.getElementById('targetUrlStatus').textContent = lastStatusData.pageStatus || lastStatusData.apiStatus || '-';
} 

// Form sekmesi için yeni kodlar
document.querySelector('[data-tabid="tabFormInfo"]').addEventListener('click', function() {
  loadFormData();
});

document.getElementById('saveFormData').addEventListener('click', function() {
  const formData = {
    tc_kimlik: document.getElementById('tc_kimlik').value,
    ad: document.getElementById('ad').value,
    soyad: document.getElementById('soyad').value,
    email: document.getElementById('email').value,
    emailonay: document.getElementById('emailonay').value,
    telefon: document.getElementById('telefon').value,
    kart_adsoyad: document.getElementById('kart_adsoyad').value,
    kart_numarasi: document.getElementById('kart_numarasi').value,
    kart_ay: document.getElementById('kart_ay').value,
    kart_yil: document.getElementById('kart_yil').value,
    kart_cvv: document.getElementById('kart_cvv').value,
    ulke: document.getElementById('ulke').value,
    adres: document.getElementById('adres').value,
    posta_kodu: document.getElementById('posta_kodu').value,
    ilce: document.getElementById('ilce').value,
    vilayet: document.getElementById('vilayet').value
  };

  chrome.storage.local.set({ formData: formData }, function() {
    alert('Form bilgileri kaydedildi!');
  });
});

// Telefon numarası formatlama
document.getElementById('telefon').addEventListener('input', function(e) {
  let value = this.value.replace(/\D/g, '');
  if (value.length > 10) value = value.substring(0, 10);
  
  let formatted = '';
  for (let i = 0; i < value.length; i++) {
    if (i === 3) formatted += ' ';
    if (i === 6) formatted += ' ';
    if (i === 8) formatted += ' ';
    formatted += value[i];
  }
  this.value = formatted.trim();
});

// Kredi kartı formatlama
document.getElementById('kart_numarasi').addEventListener('input', function(e) {
  let value = this.value.replace(/\D/g, '');
  if (value.length > 16) value = value.substring(0, 16);
  
  let formatted = '';
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' ';
    formatted += value[i];
  }
  this.value = formatted.trim();
});

// Kayıt sırasında boşlukları kaldırma
document.getElementById('saveFormData').addEventListener('click', function() {
  const formData = {
    // ... diğer alanlar ...
    telefon: document.getElementById('telefon').value.replace(/\s/g, ''),
    kart_numarasi: document.getElementById('kart_numarasi').value.replace(/\s/g, ''),
    // ... diğer alanlar ...
  };
  
  chrome.storage.local.set({ formData: formData });
});

function loadFormData() {
  chrome.storage.local.get(['formData'], function(result) {
    if (result.formData) {
      const data = result.formData;
      document.getElementById('tc_kimlik').value = data.tc_kimlik || '';
      document.getElementById('ad').value = data.ad || '';
      document.getElementById('soyad').value = data.soyad || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('emailonay').value = data.emailonay || '';
      document.getElementById('telefon').value = data.telefon || '';
      document.getElementById('kart_adsoyad').value = data.kart_adsoyad || '';
      document.getElementById('kart_numarasi').value = data.kart_numarasi || '';
      document.getElementById('kart_ay').value = data.kart_ay || '';
      document.getElementById('kart_yil').value = data.kart_yil || '';
      document.getElementById('kart_cvv').value = data.kart_cvv || '';
      document.getElementById('ulke').value = data.ulke || 'TR';
      document.getElementById('adres').value = data.adres || '';
      document.getElementById('posta_kodu').value = data.posta_kodu || '';
      document.getElementById('ilce').value = data.ilce || '';
      document.getElementById('vilayet').value = data.vilayet || '';
    }
  });
}
