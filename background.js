// Tesla Envanter Takip ve Sipariş Asistanı - background.js (URL Kontrol Modu)

const URL_CHECK_ALARM_NAME = 'teslaUrlCheck';
const MIN_ALARM_PERIOD_MINUTES = 1; // Chrome alarmları için minimum periyot

let checkInterval = 60; // Varsayılan 60 saniye
let intervalId = null;

// Eklenti ilk yüklendiğinde veya güncellendiğinde çalışır
chrome.runtime.onInstalled.addListener(() => {
  console.log("Tesla URL Takip Eklentisi kuruldu/güncellendi.");
  chrome.storage.local.set({ 
    isTrackingActive: false, 
    lastStatusData: { pluginStatus: "Durduruldu", pageStatus: "Beklemede" } 
  });
});

async function startTracking() {
  const { generalSettings, targetVehicleSettings } = await chrome.storage.local.get(['generalSettings', 'targetVehicleSettings']);
  if (!generalSettings || !generalSettings.trackingInterval) {
    console.warn("İzleme başlatılamadı: Kontrol aralığı ayarlanmamış.");
    await updateStatusDisplay({ pluginStatus: "Hata: Genel Ayarlar eksik", isTracking: false });
    return false;
  }
  if (!targetVehicleSettings || !targetVehicleSettings.selectedVehicle) {
    console.warn("İzleme başlatılamadı: Hedef araç seçilmemiş.");
    await updateStatusDisplay({ pluginStatus: "Hata: Hedef araç seçilmemiş", isTracking: false });
    return false;
  }

  const rawIntervalString = generalSettings.trackingInterval;
  let trackingIntervalSeconds = parseFloat(rawIntervalString);

  // parseFloat başarısız olursa veya 0 ya da negatif bir değerse varsayılanı kullan
  if (isNaN(trackingIntervalSeconds) || trackingIntervalSeconds <= 0) {
    console.warn(`Alınan kontrol aralığı ('${rawIntervalString}') geçersiz veya çok küçük. Varsayılan 60 saniyeye ayarlanıyor.`);
    trackingIntervalSeconds = 60; // Varsayılan 60 saniye
  }

  // periodInMinutes hesapla, minimum MIN_ALARM_PERIOD_MINUTES (1 dakika) olmalı
  // trackingIntervalSeconds zaten saniye cinsinden.
  let periodInMinutes = Math.max(MIN_ALARM_PERIOD_MINUTES, trackingIntervalSeconds / 60.0);

  // Ekstra güvenlik: periodInMinutes'in de NaN olmadığından emin ol (yukarıdaki mantıkla olmamalı ama yine de)
  if (isNaN(periodInMinutes)) {
      console.error(`Hesaplanan periodInMinutes ('${periodInMinutes}') NaN oldu! Bu bir programlama hatası. Varsayılan olarak MIN_ALARM_PERIOD_MINUTES değerine dönülüyor.`);
      periodInMinutes = MIN_ALARM_PERIOD_MINUTES;
  }
  
  console.log(`Alarm periyodu hesaplanıyor: Kullanıcı ayarı (saniye): '${rawIntervalString}', Kullanılacak saniye: ${trackingIntervalSeconds}, Hesaplanan periyot (dakika): ${periodInMinutes}`);
  
  // Mevcut alarmı güncelle veya oluştur. Chrome aynı isimli alarmı günceller.
  chrome.alarms.create(URL_CHECK_ALARM_NAME, {
    periodInMinutes: periodInMinutes,
  });

  await chrome.storage.local.set({ isTrackingActive: true });
  console.log(`İzleme BAŞLATILDI (URL Modu). Kontrol periyodu: ${periodInMinutes} dakika (yaklaşık ${trackingIntervalSeconds} saniye). VIN/ID: ${targetVehicleSettings.selectedVehicle}`);
  await updateStatusDisplay({ pluginStatus: "Çalışıyor", isTracking: true, lastCheck: "Henüz yapılmadı", pageStatus: "Kontrol bekleniyor" });
  checkSpecificOrderUrl(); 
  return true;
}

async function stopTracking() {
  await chrome.alarms.clear(URL_CHECK_ALARM_NAME);
  await chrome.storage.local.set({ isTrackingActive: false });
  console.log("İzleme DURDURULDU (URL Modu).");
  await updateStatusDisplay({ pluginStatus: "Durduruldu", isTracking: false, pageStatus: "Beklemede" });
  return true;
}

// Popup veya içerik script'lerinden gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script mesaj aldı:", request);

  if (request.action === "startStopTracking") {
    if (request.isTracking) {
      startTracking().then(success => sendResponse({ status: success ? "İzleme başlatıldı." : "İzleme başlatılamadı."}));
    } else {
      stopTracking().then(success => sendResponse({ status: success ? "İzleme durduruldu." : "İzleme durdurulamadı." }));
    }
    return true; // Asenkron yanıt için
  }

  if (request.action === "checkTeslaAPI") {
    console.log("Tesla API kontrolü manuel olarak tetiklendi.");
    fetchTeslaInventory().then(result => sendResponse(result));
    return true; // Asenkron yanıt için
  }

  return false; // Diğer mesaj türleri için senkron kalabilir
});

// Alarmları dinle (periyodik API kontrolü için)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === URL_CHECK_ALARM_NAME) {
    console.log("Alarm tetiklendi (URL Modu): ", URL_CHECK_ALARM_NAME);
    checkSpecificOrderUrl();
  }
});

async function checkSpecificOrderUrl() {
  console.log("checkSpecificOrderUrl çağrıldı...");
  const { targetVehicleSettings, generalSettings } = await chrome.storage.local.get(['targetVehicleSettings', 'generalSettings']);

  if (!targetVehicleSettings || !targetVehicleSettings.selectedVehicle) {
    console.warn("URL kontrolü yapılamadı: Hedef araç seçilmemiş.");
    await updateStatusDisplay({ pageStatus: "Hata: Hedef araç seçilmemiş" });
    return;
  }

  const vin = targetVehicleSettings.selectedVehicle;
  const targetUrl = `https://www.tesla.com/tr_TR/my/order/${vin}?titleStatus=new&redirect=no#payment`;
  console.log("Kontrol edilecek URL:", targetUrl);
  
  let totalChecks = (await chrome.storage.local.get('totalChecks')).totalChecks || 0;
  totalChecks++;
  const lastCheckTime = new Date().toLocaleTimeString();
  await chrome.storage.local.set({ totalChecks: totalChecks });
  await updateStatusDisplay({ 
    pageStatus: "URL kontrol ediliyor...", 
    lastCheck: lastCheckTime,
    totalChecks: totalChecks
  });

  try {
    // Yönlendirmeleri manuel olarak takip etmek için redirect: 'manual' kullanıyoruz.
    // Bu, sayfanın gerçekten yönlenip yönlenmediğini anlamamıza yardımcı olur.
    const response = await fetch(targetUrl, { method: 'GET', redirect: 'manual' });
    
    console.log(`URL: ${targetUrl}, Durum: ${response.status}, Yönlendirme: ${response.redirected}, Yanıt URL: ${response.url}, Type: ${response.type}`);

    // response.type === 'opaqueredirect' genellikle bir cross-origin yönlendirme olduğunu gösterir.
    // response.url hedef URL ile aynı değilse veya ana sayfaya yönlenmişse araç yok demektir.
    // Tesla özelinde, #overview içeren bir URL'ye yönlenme genellikle aracın olmadığını gösterir.
    const isAvailable = response.ok && response.url.includes(targetUrl.split("#")[0]) && !response.url.includes("#overview");
    // VEYA: response.type !== 'opaqueredirect' && response.url.startsWith(targetUrl.split('#')[0])
    // Daha kesin bir kontrol için, yönlendirme sonrası URL'nin ana sayfa olup olmadığına bakılabilir.
    // Örneğin: if (response.redirected && response.url.startsWith("https://www.tesla.com/") && response.url.endsWith("#overview")) { isAvailable = false; }

    if (isAvailable) {
      console.log("ARAÇ MEVCUT! URL geçerli ve ana sayfaya yönlendirilmedi.");
      await updateStatusDisplay({ pageStatus: "Araç Mevcut!", foundCars: "Evet" });
      
      chrome.tabs.create({ url: targetUrl });
      chrome.notifications.create(`tesla-car-found-${Date.now()}`, {
        type: 'basic',
        iconUrl: 'images/128.png',
        title: 'Tesla Araç Bulundu!',
        message: `Hedeflediğiniz araç (${targetUrl.substring(0,50)}...) envanterde mevcut!`
      });
      // stopTracking(); // Araç bulununca izlemeyi durdur
    } else {
      console.log("Araç mevcut değil veya URL ana sayfaya yönlendirildi.");
      await updateStatusDisplay({ pageStatus: "Araç Mevcut Değil", foundCars: "Hayır" });
    }
  } catch (error) {
    console.error("URL kontrolü sırasında fetch hatası:", error);
    await updateStatusDisplay({ pageStatus: `Hata: ${error.message}` });
  }
}

// Durumları hem storage'a yazar hem de içerik scriptlerine mesaj gönderir
async function updateStatusDisplay(statusData) {
  const { lastStatusData: prevStatus, isTrackingActive } = await chrome.storage.local.get(['lastStatusData', 'isTrackingActive']);
  const currentPluginStatus = isTrackingActive ? "Çalışıyor" : "Durduruldu";
  
  let newStatus = { 
    ...(prevStatus || {}), 
    pluginStatus: currentPluginStatus, 
    isTracking: isTrackingActive 
  };

  // Gelen yeni verileri mevcut durumla birleştir
  newStatus = {...newStatus, ...statusData};

  // Eğer izleme aktif değilse, bazı durumları temizle
  if(!isTrackingActive){
      newStatus.pageStatus = statusData.pageStatus && statusData.pageStatus.startsWith("Hata:") ? statusData.pageStatus : "Beklemede";
      newStatus.foundCars = "-"; // Ya da son bilinen durumu koru?
      newStatus.lastCheck = prevStatus?.lastCheck || "-"; // Takip durunca son kontrolü sıfırlama
  } else {
    // Eğer izleme aktifse ve pageStatus özellikle güncellenmiyorsa, "Kontrol bekleniyor" olabilir
    if(newStatus.isTracking && !statusData.pageStatus && !newStatus.pageStatus?.includes("Hata")){
        newStatus.pageStatus = newStatus.lastCheck === "Henüz yapılmadı" ? "İlk kontrol bekleniyor" : "Sıradaki kontrol bekleniyor";
    }
  }

  await chrome.storage.local.set({ lastStatusData: newStatus });
  
  // content_inventory.js kaldırıldığı için artık ona mesaj göndermiyoruz.
  // Durum popup açıldığında storage'dan okunacak.
}

// Depolama değişikliklerini dinle (isteğe bağlı, zaten updateStatusDisplay her şeyi gönderiyor)
// chrome.storage.onChanged.addListener((changes, namespace) => {
//   if (namespace === 'local' && (changes.isTrackingActive || changes.lastStatusData)) {
//     console.log("Storage değişti, paneller güncelleniyor:", changes);
//     const newStatus = {};
//     if(changes.isTrackingActive) newStatus.isTracking = changes.isTrackingActive.newValue;
//     if(changes.lastStatusData) Object.assign(newStatus, changes.lastStatusData.newValue);
//     updateStatusDisplay(newStatus); // Zaten bu fonksiyon her şeyi yapar
//   }
// });

console.log("Background script yüklendi ve dinlemede (URL Kontrol Modu)."); 