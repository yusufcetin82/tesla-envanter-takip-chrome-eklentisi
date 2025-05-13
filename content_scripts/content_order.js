// Tesla Envanter Takip ve Sipariş Asistanı - content_scripts/content_order.js

console.log("Tesla Auto Fill: content_order.js loaded");

// PRD 5.4: Otomatik Form Doldurma
// PRD 5.5: Son Butona Odaklanma

const IFRAME_SELECTOR = 'iframe[src*="payment"]'; // iframe'i seçmek için daha spesifik bir selector gerekebilir
const ORDER_BUTTON_SELECTOR = '[data-id="order-button"]';
const PRIVACY_CONSENT_SELECTOR = '#PRIVACY_CONSENT';

async function fillOrderForm() {
  try {
    console.log(`Tesla Auto Fill: Attempting to fill form on URL: ${window.location.href}`);
    const result = await chrome.storage.local.get(["selectedProfile", "profiles"]);
    if (result.profiles && result.selectedProfile) {
      const formData = result.profiles[result.selectedProfile];
      if (formData) {
        console.log("Form data retrieved:", formData);

        // Ana sayfadaki form elemanlarını doldur
        fillMainPageFields(formData);

        // Iframe'i bul ve içindeki form elemanlarını doldur
        const iframeElement = await waitForElement(IFRAME_SELECTOR);
        if (iframeElement) {
          console.log("Payment iframe found");
          // iframe'in yüklenmesini beklemek için kısa bir gecikme eklenebilir veya 'load' event'i dinlenebilir
          await sleep(2000); // Basit bir bekleme, daha robust bir çözüm gerekebilir

          const iframeDocument = iframeElement.contentWindow.document;
          fillIframeFields(iframeDocument, formData);
          
          // Ana sayfadaki son kısım (Gizlilik Onayı)
          const privacyConsentCheckbox = document.querySelector(PRIVACY_CONSENT_SELECTOR);
          if (privacyConsentCheckbox) {
            privacyConsentCheckbox.checked = true;
            console.log("Privacy consent checked.");
            triggerChangeEvent(privacyConsentCheckbox);
          } else {
            console.warn("Privacy consent checkbox not found.");
          }

          // Sipariş butonuna odaklan ve kullanıcıyı uyar
          const orderButton = document.querySelector(ORDER_BUTTON_SELECTOR);
          if (orderButton) {
            orderButton.scrollIntoView();
            orderButton.focus();
            console.log("Order button focused.");
            // Kullanıcıya Captcha'yı çözmesi için bir uyarı göster
            displayCaptchaWarning();
          } else {
            console.warn("Order button not found.");
          }
          
        } else {
          console.error("Payment iframe not found.");
        }
      } else {
        console.error("Selected profile data not found.");
      }
    } else {
      console.error("No profiles or selected profile found in storage.");
    }
  } catch (error) {
    console.error("Tesla Auto Fill: Error in fillOrderForm:", error);
  }
}

function fillMainPageFields(formData) {
  console.log("Filling main page fields...");
  // Müşteri Tipi (Bireysel/Kurumsal)
  if (formData.customerType) {
    const privateRadio = document.querySelector('input[name="registrationType"][value="private"]');
    const businessRadio = document.querySelector('input[name="registrationType"][value="business"]');
    if (formData.customerType === "individual" && privateRadio) {
      privateRadio.checked = true;
      triggerChangeEvent(privateRadio);
    } else if (formData.customerType === "business" && businessRadio) {
      businessRadio.checked = true;
      triggerChangeEvent(businessRadio);
      // Kurumsal seçildiğinde TCKN alanı VKN olabilir, bu popup.js'de ayarlanmalı
      // ve burada doğru selector ile VKN alanı doldurulmalı.
      // Şimdilik TCKN/VKN için aynı alanı kullanıyoruz.
    }
  }

  // TCKN / VKN - name="privateVatId" (Bireysel), name="businessVatId" (Kurumsal) olabilir.
  // popup.js'de customerType'a göre doğru key ile kaydedilmeli.
  // Şimdilik popup'tan gelen 'identityNumber' TCKN/VKN için ortak kullanılıyor varsayalım.
  setInputValue('input[name="privateVatId"]', formData.identityNumber); // Bireysel TCKN
  // Kurumsal VKN için: setInputValue('input[name="businessVatId"]', formData.identityNumber);

  setInputValue('input[name="firstName"]', formData.firstName);
  setInputValue('input[name="lastName"]', formData.lastName);
  setInputValue('input[name="email"]', formData.email);
  setInputValue('input[name="emailConfirm"]', formData.email); // Genellikle email ile aynı
  setInputValue('input[name="phoneNumber"]', formData.phone); // Ülke kodu ayrı ele alınmalı
  console.log("Main page fields filled.");
}

function fillIframeFields(iframeDoc, formData) {
  console.log("Filling iframe fields...");
  // Kart Bilgileri
  setInputValue('input[name="/creditCardHolderName"]', formData.cardFullName, iframeDoc);
  setInputValue('input[name="/creditCardNumber"]', formData.cardNumber, iframeDoc);
  setSelectValue('select[name="/creditCardExpiryMonth"]', formData.cardExpiryMonth, iframeDoc);
  setSelectValue('select[name="/creditCardExpiryYear"]', formData.cardExpiryYear, iframeDoc);
  setInputValue('input[name="/creditCardCvv"]', formData.cardCvv, iframeDoc);
  setInputValue('input[name="/creditCardEmail"]', formData.email, iframeDoc); // Genellikle ana email ile aynı

  // Fatura Bilgileri
  setSelectValue('select[name="/countryCode"]', formData.billingCountry || "TR", iframeDoc); // Varsayılan TR
  setInputValue('input[name="/billingAddress1"]', formData.billingAddress1, iframeDoc);
  setInputValue('input[name="/billingAddress2"]', formData.billingAddress2, iframeDoc);
  setInputValue('input[name="/billingZipCode"]', formData.billingZipCode, iframeDoc);
  setInputValue('input[name="/billingCity"]', formData.billingCity, iframeDoc); // İlçe
  setInputValue('input[name="/billingState"]', formData.billingState, iframeDoc); // Vilayet/İl
  console.log("Iframe fields filled.");
}

function setInputValue(selector, value, parent = document) {
  const element = parent.querySelector(selector);
  if (element) {
    if (value !== undefined) {
      element.value = value;
      triggerChangeEvent(element);
      console.log(`Set value for ${selector}: '${value}'`);
    } else {
      // console.log(`Value is undefined for ${selector}, skipping.`);
    }
  } else {
    if (value !== undefined) {
        console.warn(`${selector} not found, cannot set value: '${value}'`);
    }
  }
}

function setSelectValue(selector, value, parent = document) {
  const element = parent.querySelector(selector);
  if (element) {
    if (value !== undefined) {
      element.value = value;
      triggerChangeEvent(element);
      console.log(`Set value for ${selector}: '${value}'`);
    } else {
      // console.log(`Value is undefined for ${selector}, skipping.`);
    }
  } else {
    if (value !== undefined) {
        console.warn(`${selector} not found, cannot set value: '${value}'`);
    }
  }
}

function triggerChangeEvent(element) {
  const event = new Event('change', { bubbles: true });
  element.dispatchEvent(event);
  const inputEvent = new Event('input', { bubbles: true }); // React gibi frameworkler için
  element.dispatchEvent(inputEvent);
}

function displayCaptchaWarning() {
  const warningDiv = document.createElement('div');
  warningDiv.id = "tesla-autofill-captcha-warning";
  warningDiv.style.position = 'fixed';
  warningDiv.style.top = '10px';
  warningDiv.style.left = '50%';
  warningDiv.style.transform = 'translateX(-50%)';
  warningDiv.style.padding = '15px';
  warningDiv.style.backgroundColor = 'orange';
  warningDiv.style.color = 'white';
  warningDiv.style.zIndex = '9999';
  warningDiv.style.borderRadius = '5px';
  warningDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  warningDiv.style.textAlign = 'center';
  warningDiv.innerHTML = '<b>Tesla Auto Fill:</b> Form bilgileri dolduruldu. Lütfen aşağıdaki <b>CAPTCHA</b>\'yı çözün ve ardından <b>"Sipariş Ver"</b> butonuna tıklayın.';
  document.body.appendChild(warningDiv);
  console.log("CAPTCHA warning displayed.");
}

function waitForElement(selector, timeout = 10000, interval = 500, doc = document) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const element = doc.querySelector(selector);
      if (element) {
        clearInterval(timer);
        resolve(element);
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(timer);
        console.warn(`waitForElement timed out for selector: ${selector}`);
        resolve(null); // Timeout durumunda null dön, reject yerine
      }
    }, interval);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Script yüklendiğinde formu doldurmaya başla
if (document.readyState === 'loading') { // Henüz yükleniyorsa
  document.addEventListener('DOMContentLoaded', fillOrderForm);
} else {  // Zaten yüklendiyse (document_idle durumunda bu blok çalışır)
  fillOrderForm();
}

// YENİ EKLENEN MESAJ DİNLEYİCİ
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content_order.js:", request);
  if (request.action === "triggerManualFormFill") {
    console.log("Manual form fill triggered by popup.");
    fillOrderForm(); // Form doldurma fonksiyonunu çağır
    sendResponse({ status: "Form fill process started in content script." });
    return true; // Asenkron yanıt için
  }
  return false; // Diğer mesaj türleri için senkron kalabilir veya başka işlemler yapılabilir
});

// Tesla'nın kullandığı iframe için doğru selector'ı bulmak önemli.
// Örnek: 'iframe[title="Secure payment frame"]' veya URL'sine göre
// `