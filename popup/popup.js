// Tesla Envanter Takip ve Sipariş Asistanı - popup.js

document.addEventListener('DOMContentLoaded', () => {
  // Sekme yönetimi
  const tablinks = document.querySelectorAll('.tablink');
  tablinks.forEach(link => {
    link.addEventListener('click', (event) => openTab(event, event.target.textContent.toLowerCase().replace(' ', '')));
  });

  // Varsayılan olarak ilk sekmeyi aç (veya son kalınan sekmeyi storage'dan al)
  // Pratiklik açısından şimdilik ilk sekmeyi aktif edelim.
  if (tablinks.length > 0) {
    // Eğer PRD'deki gibi buton isimleri ("Ayarlar", "Araç Kriterleri") kullanılacaksa
    // openTab(new Event('click'), 'tabSettings'); // İlk butonun adına göre
    // Eğer doğrudan ID'ler varsa, aşağıdaki daha basit olabilir.
    document.getElementById('tabSettings').style.display = "block";
    // document.querySelector('.tablink').className += " active"; // Bu da çalışır ama isimle eşleştirmek daha iyi
  }

  // TODO: Kayıtlı ayarları chrome.storage.local.get ile yükle ve form alanlarını doldur
  loadSettings();

  // Ayarları Kaydet Butonları
  const saveSettingsButton = document.getElementById('saveSettings');
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', () => {
      const settings = {
        trackingInterval: document.getElementById('trackingInterval').value,
        zipCode: document.getElementById('zipCode').value
      };
      chrome.storage.local.set({ generalSettings: settings }, () => {
        console.log('Genel ayarlar kaydedildi:', settings);
        alert('Genel ayarlar kaydedildi!');
      });
    });
  }

  const saveCarCriteriaButton = document.getElementById('saveCarCriteria');
  if (saveCarCriteriaButton) {
    saveCarCriteriaButton.addEventListener('click', () => {
      const criteria = {
        model: document.getElementById('model').value,
        color: document.getElementById('color').value,
        maxPrice: document.getElementById('maxPrice').value
      };
      chrome.storage.local.set({ carCriteria: criteria }, () => {
        console.log('Araç kriterleri kaydedildi:', criteria);
        alert('Araç kriterleri kaydedildi!');
      });
    });
  }

  // TODO: Bireysel ve Kurumsal form kaydetme butonları için event listener'lar eklenecek

  // İzlemeyi Başlat/Durdur Butonu
  const toggleTrackingButton = document.getElementById('toggleTracking');
  if (toggleTrackingButton) {
    toggleTrackingButton.addEventListener('click', () => {
      const currentStatus = toggleTrackingButton.textContent;
      const newTrackingState = currentStatus.includes('Başlat');
      
      chrome.runtime.sendMessage({ action: "startStopTracking", isTracking: newTrackingState }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Mesaj gönderme hatası:", chrome.runtime.lastError.message);
          document.getElementById('trackingStatus').textContent = "Hata!";
          return;
        }
        console.log("Background'dan yanıt:", response);
        updateTrackingButton(!newTrackingState); // Buton durumunu tersine çevir
        document.getElementById('trackingStatus').textContent = newTrackingState ? "Çalışıyor" : "Durduruldu";
      });
    });
  }
  
  // Başlangıçta izleme durumunu kontrol et ve butonu güncelle
  chrome.storage.local.get(['isTrackingActive'], (result) => {
    updateTrackingButton(result.isTrackingActive || false);
    document.getElementById('trackingStatus').textContent = result.isTrackingActive ? "Çalışıyor" : "Durduruldu";
  });

});

function openTab(event, tabNameID) {
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  // HTML'deki onclick="openTab(event, 'tabSettings')" eşleşmesi için düzeltme:
  // Eğer tabNameID event ise, event.currentTarget.onclick attribute'undan ID'yi almayı dene
  // Ancak bu karmaşık. popup.html'deki onclick'leri sadece ID ile çağıracak şekilde değiştirmek daha iyi.
  // Şimdilik, ID'nin doğru geldiğini varsayıyoruz.
  const targetTab = document.getElementById(tabNameID);
  if (targetTab) {
    targetTab.style.display = "block";
  }
  if (event && event.currentTarget) { // event null olabilir (doğrudan çağrılırsa)
    event.currentTarget.className += " active";
  }
}

function loadSettings() {
  chrome.storage.local.get(['generalSettings', 'carCriteria', 'isTrackingActive' /* , Diğer form bilgileri */], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Ayarları yüklerken hata:", chrome.runtime.lastError.message);
      return;
    }

    if (result.generalSettings) {
      document.getElementById('trackingInterval').value = result.generalSettings.trackingInterval || 30;
      document.getElementById('zipCode').value = result.generalSettings.zipCode || '';
    }
    if (result.carCriteria) {
      document.getElementById('model').value = result.carCriteria.model || 'my';
      document.getElementById('color').value = result.carCriteria.color || '';
      document.getElementById('maxPrice').value = result.carCriteria.maxPrice || '';
    }
    // TODO: Diğer form alanlarını da yükle

    updateTrackingButton(result.isTrackingActive || false);
    document.getElementById('trackingStatus').textContent = result.isTrackingActive ? "Çalışıyor" : "Durduruldu";
  });
}

function updateTrackingButton(isTracking) {
  const toggleTrackingButton = document.getElementById('toggleTracking');
  if (toggleTrackingButton) {
    if (isTracking) {
      toggleTrackingButton.textContent = "İzlemeyi Durdur";
      // Belki bir class ekleyerek rengini değiştirebiliriz (örn: .tracking-active)
    } else {
      toggleTrackingButton.textContent = "İzlemeyi Başlat";
    }
    // Bu durumu chrome.storage'a da kaydetmeliyiz ki background.js haberdar olsun
    // veya background.js durumu kendi içinde tutsun ve popup açıldığında sorgulansın.
    // PRD'ye göre kontrol background'da olacak, popup sadece tetikleyecek ve durumu yansıtacak.
    // Background.js'in isTracking durumunu storage'da tutması daha mantıklı.
    chrome.storage.local.set({ isTrackingActive: isTracking }); 
  }
}

// popup.html'deki sekme butonlarının onclick eventlerini düzeltmek için:
// Buton text'inden ID oluşturmak yerine doğrudan ID'yi kullanalım.
// Örneğin: <button class="tablink" onclick="openTabDirect('tabSettings', this)">Ayarlar</button>
// function openTabDirect(tabNameID, elmnt) { ... }
// Ya da mevcut openTab fonksiyonunu event.target.getAttribute('data-tabid') gibi bir şeyle kullanmak.
// Şimdilik popup.html'deki openTab çağrılarını ID'ye göre güncellediğimizi varsayalım.
// Bu yüzden popup.html'deki onclick="openTab(event, 'tabSettings')" vb. doğru çalışmalı. 