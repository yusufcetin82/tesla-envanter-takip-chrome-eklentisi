// Tesla Envanter Takip ve Sipariş Asistanı - background.js

// Eklenti ilk yüklendiğinde veya güncellendiğinde çalışır
chrome.runtime.onInstalled.addListener(() => {
  console.log("Tesla Envanter Takip Eklentisi kuruldu/güncellendi.");
  // Başlangıç ayarlarını veya alarmları burada oluşturabilirsiniz
  // Örneğin, varsayılan ayarları chrome.storage.local.set ile kaydedebilirsiniz.
  // PRD'ye göre başlangıçta bir alarm kurmayacağız, kullanıcı başlatacak.
});

// Popup veya içerik script'lerinden gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script mesaj aldı:", request);

  if (request.action === "startStopTracking") {
    if (request.isTracking) {
      console.log("İzleme BAŞLATILIYOR...");
      // İzlemeyi başlatma mantığı buraya gelecek (örn: alarm kur)
      // TODO: createAlarm();
      sendResponse({ status: "İzleme başlatıldı." });
    } else {
      console.log("İzleme DURDURULUYOR...");
      // İzlemeyi durdurma mantığı buraya gelecek (örn: alarmı temizle)
      // TODO: clearAlarm();
      sendResponse({ status: "İzleme durduruldu." });
    }
    return true; // Asenkron yanıt için
  }

  if (request.action === "checkTeslaAPI") {
    console.log("Tesla API kontrolü tetiklendi (manuel veya alarm ile)");
    // TODO: Tesla API'sini çağırma ve sonuçları işleme mantığı
    // fetchTeslaInventory().then(result => sendResponse(result));
    // return true; // Asenkron yanıt için
  }

  // Diğer eylemler buraya eklenebilir
});

// Alarmları dinle (periyodik API kontrolü için)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "teslaInventoryCheck") {
    console.log("Alarm tetiklendi: teslaInventoryCheck");
    // TODO: Tesla API'sini çağırma ve sonuçları işleme mantığı
    // fetchTeslaInventory();
  }
});

// --- Yardımcı Fonksiyonlar (TODO: Geliştirilecek) ---

// function createAlarm() { ... }
// function clearAlarm() { ... }
// async function fetchTeslaInventory() { ... }

console.log("Background script yüklendi."); 