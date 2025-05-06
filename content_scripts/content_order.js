// Tesla Envanter Takip ve Sipariş Asistanı - content_scripts/content_order.js

console.log("Tesla Asistanı - Sipariş Sayfası İçerik Scripti Yüklendi");

// PRD 5.4: Otomatik Form Doldurma
// PRD 5.5: Son Butona Odaklanma

async function fillOrderForm() {
  console.log("Sipariş formu doldurma işlemi başlıyor...");

  const storedData = await chrome.storage.local.get([
    'customerType', // 'individual' veya 'corporate'
    'formIndividual',
    'formCorporate'
  ]);

  if (chrome.runtime.lastError) {
    console.error("Storage'dan veri okuma hatası:", chrome.runtime.lastError.message);
    return;
  }

  const customerType = storedData.customerType;
  const formData = customerType === 'corporate' ? storedData.formCorporate : storedData.formIndividual;

  if (!formData) {
    console.warn("Doldurulacak form verisi bulunamadı. Lütfen eklenti ayarlarını kontrol edin.");
    return;
  }

  console.log(`Müşteri Tipi: ${customerType}, Form Verisi:`, formData);

  // --- Form Doldurma Mantığı ---
  // Bu kısım Tesla sipariş sayfasının HTML yapısına göre özelleştirilecek.
  // Kullanıcıdan alınacak element seçicileri (ID, name, class, XPath) burada kullanılacak.
  // Örnekler (gerçek seçiciler farklı olacaktır):

  // waitForElement('#firstName', (el) => { if(el && formData.firstName) el.value = formData.firstName; });
  // waitForElement('#lastName', (el) => { if(el && formData.lastName) el.value = formData.lastName; });
  // waitForElement('#email', (el) => { if(el && formData.email) el.value = formData.email; });

  // if (customerType === 'individual') {
  //   waitForElement('#tcKimlikNo', (el) => { if(el && formData.tcKimlik) el.value = formData.tcKimlik; });
  // } else {
  //   waitForElement('#vergiNo', (el) => { if(el && formData.vergiNo) el.value = formData.vergiNo; });
  // }
  
  // TODO: PRD'de belirtilen tüm bireysel ve kurumsal alanlar için doldurma mantığı eklenecek.
  // Ad, Soyad, TC/VergiNo, E-posta, Telefon, Adres (İl, İlçe, Mahalle, Detay)
  // Her bir alan için waitForElement kullanılabilir veya sayfa yapısı stabil ise doğrudan querySelector.

  console.log("Form alanları (deneme amaçlı) dolduruldu.");

  // TODO: PRD'ye göre gerekli ara tıklamalar (varsa) burada yapılacak.
  // waitForElement('#devamButonu', (el) => { if(el) el.click(); });

  // PRD 5.5: Son siparişi tamamlama butonuna fokuslanma
  // waitForElement('#finalOrderButton', (el) => { 
  //   if(el) { 
  //     el.focus(); 
  //     console.log("Son sipariş butonuna odaklanıldı.");
  //     // İsteğe bağlı: Butonun etrafına bir çerçeve ekleyerek vurgulayabiliriz.
  //     el.style.border = "3px solid red"; 
  //   }
  // });

  alert("Tesla Asistanı: Form doldurma tamamlandı (simülasyon). Gerçek sitede seçiciler ayarlanmalı!");
}

// Sipariş sayfası tam olarak yüklendiğinde veya belirli bir işaretçi element göründüğünde formu doldurmaya başla.
// Bu, sayfanın dinamik yüklenme durumlarına göre ayarlanmalı.
// Örn: waitForElement('#siparisFormuBaslangicElementi', fillOrderForm);
// Şimdilik DOMContentLoaded kullanalım, ancak bu yeterli olmayabilir.
if (document.readyState === "complete" || document.readyState === "interactive") {
  // Kısa bir gecikme ekleyerek sayfanın tam oturmasını bekleyebiliriz.
  setTimeout(fillOrderForm, 2000); // 2 saniye bekle (ayarlanabilir)
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fillOrderForm, 2000);
  });
} 