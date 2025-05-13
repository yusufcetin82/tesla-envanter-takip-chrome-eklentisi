// Tesla Envanter Takip ve Sipariş Asistanı - content_scripts/content_order.js
console.log("Tesla Asistanı - Sipariş Sayfası İçerik Scripti Yüklendi");

// Helper fonksiyonları
function waitForElement(selector, callback, timeout = 10000) {
  const startTime = Date.now();
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    } else if (Date.now() - startTime > timeout) {
      clearInterval(interval);
      console.warn(`Element ${selector} bulunamadı`);
    }
  }, 100);
}

function fillInput(selector, value) {
  waitForElement(selector, (element) => {
    element.value = value;
    // Değişiklik event'lerini tetikle
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
    console.log(`Doldurulan alan: ${selector}, Değer: ${value}`);
  });
}

function selectDropdown(selector, value) {
  waitForElement(selector, (element) => {
    element.value = value;
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
    console.log(`Seçilen dropdown: ${selector}, Değer: ${value}`);
  });
}

// Formatlama fonksiyonları
function formatPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}

function formatCreditCard(card) {
  if (!card) return '';
  const cleaned = card.replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
}

// Ana form doldurma fonksiyonu
async function fillOrderForm() {
  console.log("Form doldurma işlemi başlıyor...");
  
  const { formData } = await chrome.storage.local.get(['formData']);
  if (!formData) {
    console.warn("Kayıtlı form verisi bulunamadı");
    return;
  }

  console.log("Form verisi yüklendi:", formData);

  // 1. KİŞİSEL BİLGİLER
  fillInput("#privateVatId", formData.tc_kimlik);
  fillInput("#FIRST_NAME", formData.ad);
  fillInput("#LAST_NAME", formData.soyad);
  fillInput("#EMAIL", formData.email);
  fillInput("#confirm-email-textbox", formData.emailonay);
  fillInput("#PHONE_NUMBER", formatPhoneNumber(formData.telefon));

  // 2. ÖDEME BİLGİLERİ
  fillInput("input[aria-describedby='nameOnTheInstrument-error-input-feedback']", formData.kart_adsoyad);
  fillInput("input[aria-describedby='encryptedCardNumber-error-input-feedback']", formatCreditCard(formData.kart_numarasi));
  
  selectDropdown("select[aria-describedby='encryptedExpiryMonth-error-input-feedback']", formData.kart_ay);
  selectDropdown("select[aria-describedby='encryptedExpiryYear-error-input-feedback']", formData.kart_yil);
  fillInput("input[aria-describedby='email-error-input-feedback']", formData.eposta3);
  fillInput("input[aria-describedby='encryptedSecurityCode-error-input-feedback']", formData.kart_cvv);

  // 3. ADRES BİLGİLERİ
  selectDropdown("select[name='countryCode']", formData.ulke);
  fillInput("input[aria-describedby='street-error-input-feedback']", formData.adres);
  fillInput("input[aria-describedby='zipCode-error-input-feedback']", formData.posta_kodu);
  fillInput("input[aria-describedby='city-error-input-feedback']", formData.ilce);
  fillInput("input[aria-describedby='stateProvince-error-input-feedback']", formData.vilayet);

  // 4. ONAY KUTULARI (Varsa)
  waitForElement("#PRIVACY_CONSENT", (el) => {
    if (!el.checked) el.click();
    console.log("Gizlilik politikası onaylandı");
  });

  // 5. FOCUS İŞLEMLERİ (PRD 5.5)
  waitForElement("[data-id='order-button']", (el) => {
    el.style.border = "3px solid #00ff00";
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log("Sipariş butonuna odaklanıldı");
  });

  console.log("Form doldurma işlemi tamamlandı");
}

// Sayfa yüklendiğinde çalıştır
const init = () => {
  if (window.location.href.includes("/order/")) {
    // Dinamik yüklenme için MutationObserver
    const observer = new MutationObserver((mutations) => {
      if (document.querySelector("#FIRST_NAME")) {
        observer.disconnect();
        setTimeout(fillOrderForm, 1500); // 1.5 sn ekstra bekle
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Normal yükleme için
    setTimeout(fillOrderForm, 3000);
  }
};

// Sayfa hazır olduğunda başlat
if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
console.log(`Doldurulan alan: ${selector}, Değer: ${value}`);
