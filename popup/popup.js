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

  populateExpiryYears(); // Kredi kartı son kullanma yıllarını doldur
  loadAndDisplaySettings();

  // --- Ayarları Kaydetme Butonları ---
  document.getElementById('saveSettings')?.addEventListener('click', saveGeneralSettings);
  document.getElementById('saveTargetVehicle')?.addEventListener('click', saveTargetVehicleSettings);
  document.getElementById('saveOrderFormData')?.addEventListener('click', saveOrderFormData);
  document.getElementById('clearOrderFormData')?.addEventListener('click', clearOrderFormData);
  document.getElementById('manualTestFillButton')?.addEventListener('click', triggerManualFillOnActiveTab);

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
          // alert(`Hata: ${chrome.runtime.lastError.message}`); // Daha iyi bir UI ile değiştirilebilir
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
  const selectedVehicleRadio = document.querySelector('input[name="vehicle"]:checked');
  
  if (!selectedVehicleRadio) {
    alert('Lütfen bir araç seçin!');
    return;
  }

  const vehicleInfoContainer = selectedVehicleRadio.closest('.vehicle-option');
  const vehicleName = vehicleInfoContainer?.querySelector('.vehicle-name')?.textContent || "";
  const vehiclePrice = vehicleInfoContainer?.querySelector('.vehicle-price')?.textContent || "";

  const targetVehicle = {
    selectedVehicle: selectedVehicleRadio.value,
    vehicleName: vehicleName,
    vehiclePrice: vehiclePrice
  };
  
  chrome.storage.local.set({ targetVehicleSettings: targetVehicle }, () => {
    console.log('Hedef araç ayarları kaydedildi:', targetVehicle);
    alert('Hedef araç ayarları kaydedildi!');
  });
}

function saveOrderFormData() {
  const profileName = document.getElementById('formProfileName')?.value.trim();
  if (!profileName) {
    alert('Lütfen bu form bilgileri için bir profil adı girin.');
    document.getElementById('formProfileName')?.focus();
    return;
  }

  const customerTypeRadio = document.querySelector('input[name="customerType"]:checked');
  if (!customerTypeRadio) {
    alert('Lütfen müşteri tipini seçin (Bireysel/Kurumsal).');
    return;
  }
  const customerType = customerTypeRadio.value;

  const formData = {
    // General Info
    customerType: customerType,
    identityNumber: document.getElementById('identityNumber')?.value, // TCKN veya VKN
    firstName: document.getElementById('firstName')?.value,
    lastName: document.getElementById('lastName')?.value,
    email: document.getElementById('email')?.value,
    // emailConfirm: document.getElementById('emailConfirm')?.value, // Genellikle email ile aynı, content_script halledebilir
    phone: document.getElementById('phone')?.value,

    // Card Details
    cardFullName: document.getElementById('cardFullName')?.value,
    cardNumber: document.getElementById('cardNumber')?.value,
    cardExpiryMonth: document.getElementById('cardExpiryMonth')?.value,
    cardExpiryYear: document.getElementById('cardExpiryYear')?.value,
    cardCvv: document.getElementById('cardCvv')?.value,
    // creditCardEmail: document.getElementById('creditCardEmail')?.value, // Genellikle ana email ile aynı, content_script halledebilir

    // Billing Address
    billingAddress1: document.getElementById('billingAddress1')?.value,
    billingAddress2: document.getElementById('billingAddress2')?.value,
    billingZipCode: document.getElementById('billingZipCode')?.value,
    billingCity: document.getElementById('billingCity')?.value, // İlçe
    billingState: document.getElementById('billingState')?.value, // Vilayet/İl
    billingCountry: document.getElementById('billingCountry')?.value || "TR", // Varsayılan TR
  };

  chrome.storage.local.get(['profiles'], (result) => {
    let profiles = result.profiles || {};
    profiles[profileName] = formData;
    chrome.storage.local.set({ profiles: profiles, selectedProfile: profileName }, () => {
      console.log(`Sipariş bilgileri "${profileName}" profili için kaydedildi:`, formData);
      alert(`"${profileName}" profili için sipariş bilgileri kaydedildi!`);
      loadAndDisplaySettings(); // Profil listesini güncelle
    });
  });
}

function clearOrderFormData() {
  const currentProfileName = document.getElementById('formProfileName')?.value.trim();
  
  const formControlIds = [
    'identityNumber', 'firstName', 'lastName', 'email', 'phone',
    'cardFullName', 'cardNumber', 'cardExpiryMonth', 'cardExpiryYear', 'cardCvv',
    'billingAddress1', 'billingAddress2', 'billingZipCode', 'billingCity', 'billingState', 'billingCountry'
  ];
  formControlIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      if (element.tagName === 'SELECT') {
        element.value = (id === 'billingCountry') ? "TR" : ""; // Ülke için TR, diğerleri boş
         if (id === 'cardExpiryMonth') element.value = ""; // Ay için boş
         if (id === 'cardExpiryYear') element.value = ""; // Yıl için boş
      } else {
        element.value = "";
      }
    }
  });
  
  const individualRadio = document.getElementById('customerTypeIndividual');
  if(individualRadio) individualRadio.checked = true; // Varsayılana dön
  const corporateRadio = document.getElementById('customerTypeCorporate');
  if(corporateRadio) corporateRadio.checked = false;


  if (currentProfileName) {
    chrome.storage.local.get(['profiles', 'selectedProfile'], (result) => {
      let profiles = result.profiles || {};
      if (profiles[currentProfileName]) {
        delete profiles[currentProfileName];
        let newSelectedProfile = result.selectedProfile;
        if (result.selectedProfile === currentProfileName) {
            // Silinen profil seçili ise, varsa başka bir profili seç, yoksa seçimi kaldır
            const profileKeys = Object.keys(profiles);
            newSelectedProfile = profileKeys.length > 0 ? profileKeys[0] : null;
        }
        chrome.storage.local.set({ profiles: profiles, selectedProfile: newSelectedProfile }, () => {
          console.log(`"${currentProfileName}" profili ve bilgileri temizlendi.`);
          alert(`"${currentProfileName}" profili ve bilgileri temizlendi.`);
          document.getElementById('formProfileName').value = newSelectedProfile || '';
          loadAndDisplaySettings(); // UI'ı güncelle
        });
      } else {
        alert('Temizlenecek aktif bir profil bulunamadı veya zaten temiz.');
        loadAndDisplaySettings(); // UI'ı güncelle (boş form göstermek için)
      }
    });
  } else {
     // Profil adı yoksa sadece form alanlarını temizle, storage'a dokunma
     console.log('Aktif profil adı olmadan form alanları temizlendi.');
     alert('Form alanları temizlendi. Kayıtlı bir profil seçilmemişti.');
  }
}

function loadAndDisplaySettings() {
  chrome.storage.local.get([
    'generalSettings',
    'targetVehicleSettings',
    'profiles',
    'selectedProfile',
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

    // Sipariş Formu Profilleri ve Seçili Profil
    const profiles = result.profiles || {};
    const selectedProfileName = result.selectedProfile;
    const profileSelect = document.getElementById('formProfileSelect');
    const profileNameInput = document.getElementById('formProfileName');

    if (profileSelect) {
        profileSelect.innerHTML = '<option value="">Yeni Profil Oluştur...</option>'; // Varsayılan seçenek
        Object.keys(profiles).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === selectedProfileName) {
                option.selected = true;
            }
            profileSelect.appendChild(option);
        });

        profileSelect.addEventListener('change', (event) => {
            const newSelectedProfile = event.target.value;
            if (newSelectedProfile) {
                chrome.storage.local.set({ selectedProfile: newSelectedProfile }, () => {
                    loadAndDisplaySettings(); // Seçim değiştiğinde formu yeniden yükle
                });
            } else { // "Yeni Profil Oluştur" seçildi
                chrome.storage.local.remove('selectedProfile', () => {
                    loadAndDisplaySettings(); // Formu temizle ve yeni profil için hazırla
                });
            }
        });
    }
    
    // Seçili profile ait form verilerini yükle veya yeni profil için formu temizle
    const currentFormData = selectedProfileName && profiles[selectedProfileName] ? profiles[selectedProfileName] : {};
    
    if (profileNameInput) {
        profileNameInput.value = selectedProfileName || '';
    }

    // Müşteri Tipi
    const customerType = currentFormData.customerType || 'individual'; // Varsayılan bireysel
    if (document.getElementById('customerTypeIndividual')) {
        document.getElementById('customerTypeIndividual').checked = (customerType === 'individual');
    }
    if (document.getElementById('customerTypeCorporate')) {
        document.getElementById('customerTypeCorporate').checked = (customerType === 'business');
    }
    
    // Diğer form alanları
    document.getElementById('identityNumber').value = currentFormData.identityNumber || '';
    document.getElementById('firstName').value = currentFormData.firstName || '';
    document.getElementById('lastName').value = currentFormData.lastName || '';
    document.getElementById('email').value = currentFormData.email || '';
    // document.getElementById('emailConfirm').value = currentFormData.emailConfirm || '';
    document.getElementById('phone').value = currentFormData.phone || '';
    document.getElementById('cardFullName').value = currentFormData.cardFullName || '';
    document.getElementById('cardNumber').value = currentFormData.cardNumber || '';
    document.getElementById('cardExpiryMonth').value = currentFormData.cardExpiryMonth || '';
    document.getElementById('cardExpiryYear').value = currentFormData.cardExpiryYear || '';
    document.getElementById('cardCvv').value = currentFormData.cardCvv || '';
    // document.getElementById('creditCardEmail').value = currentFormData.creditCardEmail || '';
    document.getElementById('billingAddress1').value = currentFormData.billingAddress1 || '';
    document.getElementById('billingAddress2').value = currentFormData.billingAddress2 || '';
    document.getElementById('billingZipCode').value = currentFormData.billingZipCode || '';
    document.getElementById('billingCity').value = currentFormData.billingCity || '';
    document.getElementById('billingState').value = currentFormData.billingState || '';
    document.getElementById('billingCountry').value = currentFormData.billingCountry || 'TR';


    updateTrackingButtonUI(result.isTrackingActive || false);
    updateStatusTabUI(result.lastStatusData);
  });
}

function populateExpiryYears() {
  const yearSelect = document.getElementById('cardExpiryYear');
  if (!yearSelect) return;
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 20; i++) { // Önümüzdeki 20 yıl için
    const year = currentYear + i;
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
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

function triggerManualFillOnActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.warn("Aktif sekme bulunamadı.");
      alert("Form doldurma testi için aktif bir sekme bulunamadı.");
      return;
    }
    const activeTab = tabs[0];
    if (activeTab.id) {
      // Mesajı sadece Tesla sipariş sayfalarına göndermek daha güvenli olabilir, ama test için genel tuttuk.
      // if (activeTab.url && activeTab.url.includes("tesla.com/tr_TR/my/order/")) {
        chrome.tabs.sendMessage(activeTab.id, { action: "triggerManualFormFill" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Manuel form doldurma mesajı gönderilemedi:", chrome.runtime.lastError.message);
            alert(`Mesaj gönderilemedi: ${chrome.runtime.lastError.message}. Tesla sipariş sayfasında olduğunuzdan ve sayfanın tamamen yüklendiğinden emin olun.`);
          } else {
            console.log("Manuel form doldurma mesajı gönderildi, content script'ten yanıt:", response);
            if (response && response.status) {
              alert(`Form doldurma işlemi başlatıldı: ${response.status}`);
            } else {
              alert("Form doldurma işlemi için content script'ten beklenen yanıt alınamadı.");
            }
          }
        });
      // } else {
      //   alert("Manuel form doldurma sadece aktif Tesla sipariş sayfalarında çalışır.");
      // }
    } else {
      console.error("Aktif sekmenin ID'si yok.");
      alert("Aktif sekme ID'si alınamadı.");
    }
  });
} 