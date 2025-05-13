console.log("Tesla Sipariş Otomasyon Betiği (order_page_automator.js) Yüklendi.");

(async () => {
  // Yardımcı Fonksiyonlar
  async function waitForElement(selector, timeout = 15000, byXPath = false) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = byXPath ? document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue : document.querySelector(selector);
      if (element) {
        console.log(`Element bulundu: ${selector}`);
        return element;
      }
      await new Promise(resolve => setTimeout(resolve, 250)); // Kısa aralıklarla kontrol et
    }
    console.error(`Element bulunamadı (timeout): ${selector}`);
    throw new Error(`Element bulunamadı (timeout): ${selector}`);
  }

  function setInputValue(element, value) {
    if (!element) return;
    element.value = value;
    // React veya Angular gibi frameworklerin değişikliği algılaması için event dispatch etmek gerekebilir
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Input değeri ayarlandı: ${element.id || element.name} = ${value}`);
  }
  
  function setSelectValue(element, value) {
    if (!element) return;
    if (element.querySelector(`option[value="${value}"]`)) {
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Select değeri ayarlandı: ${element.id || element.name} = ${value}`);
    } else {
        console.warn(`Select için değer bulunamadı: ${element.id || element.name}, değer: ${value}`);
    }
  }

  function setCheckboxValue(element, value) {
    if (!element) return;
    element.checked = Boolean(value);
    element.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Checkbox değeri ayarlandı: ${element.id || element.name} = ${Boolean(value)}`);
  }

  async function clickElement(selector, byXPath = false, description = "") {
    console.log(`${description} için element aranıyor: ${selector}`);
    const element = await waitForElement(selector, 15000, byXPath);
    if (element) {
      element.click();
      console.log(`${description} tıklandı: ${selector}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Tıklama sonrası sayfanın tepki vermesi için kısa bir bekleme
    } else {
      console.error(`${description} bulunamadı ve tıklanamadı: ${selector}`);
      throw new Error(`${description} bulunamadı ve tıklanamadı: ${selector}`);
    }
  }

  // Ana Otomasyon Mantığı
  try {
    console.log("Sipariş otomasyonu başlıyor...");

    // Adım 1: "Devam et" butonuna tıkla
    // XPath: /html/body/div[2]/div[2]/main/section/div[2]/div[1]/div[8]/div/div/div[2]/button
    // Daha sağlam seçici: [data-id="continue-to-payment-button"]
    await clickElement('[data-id="continue-to-payment-button"]', false, "Devam Et Butonu");

    // Adım 2: "Kart ile sipariş verin" butonuna tıkla
    // Önceki XPath: /html/body/div[2]/div[2]/main/section/div[2]/div[1]/div[10]/div/div/div/div[3]/div/div/div/div[1]/div/div[2]/div/div[1]/button
    // Daha sağlam seçici (class ve title ile):
    await clickElement('button.btn-creditcard[title="Kart ile sipariş verin"]', false, "Kart ile Sipariş Verin Butonu");
    console.log("Ödeme tipi seçimi için beklendi ve tıklandı (Kart ile sipariş verin).");

    // Adım 3: Kaydedilmiş form verilerini al
    const { orderFormData } = await chrome.storage.local.get('orderFormData');

    if (orderFormData) {
      console.log("Kaydedilmiş sipariş formu verileri alınıyor:", orderFormData);
      
      // Tesla sayfasındaki ID'ler ve popup.js'deki orderFormData key'leri eşleştirilecek.
      // Not: Tesla sayfasındaki gerçek ID'ler farklı olabilir, bu ID'ler kullanıcı tarafından sağlanan bilgilere dayanmaktadır.
      const fieldMappings = {
        privateVatId: 'privateVatId',
        firstName: 'FIRST_NAME',
        lastName: 'LAST_NAME',
        email: 'EMAIL',
        emailConfirm: 'EMAIL_CONFIRM',
        phoneNumber: 'PHONE_NUMBER',
        creditCardHolderName: '0e6e6299-4412-42d8-af2d-a60e16dbdc08', // name="/creditCardHolderName"
        creditCardNumber: '7197388e-2e68-4da7-a0db-f88224f8ab96',     // name="/creditCardNumber"
        creditCardExpiryMonth: '15ebc7ba-5e23-4f4c-aa2e-000b457ffa7b', // name="/creditCardExpiryMonth"
        creditCardExpiryYear: '7fa0bc8b-9ad7-40a3-99b0-b9427f36a120',    // name="/creditCardExpiryYear"
        creditCardCvv: 'a2f28b65-f239-4862-81b2-0586d61753cc',          // name="/creditCardCvv"
        billingEmail: '96b9afb8-9a0e-4b70-8a15-331b5c73f7d2',         // name="/creditCardEmail"
        billingAddress1: '6df16b6f-2f24-42c3-baa5-d4c2280fdca3',   // name="/billingAddress1"
        billingAddress2: '27a40fac-92ef-4ab0-954a-beddcd01cdd7',   // name="/billingAddress2"
        billingZipCode: 'b24f8c53-0eea-4832-b116-70dd7cf32621',    // name="/billingZipCode"
        billingCity: 'ea3866b3-8f43-428a-bc3d-8c4b6fc16530',       // name="/billingCity"
        billingState: '3d6dd406-c25b-411e-a82c-8221a305b126',      // name="/billingState"
        privacyConsent: 'PRIVACY_CONSENT' // Checkbox
      };

      console.log("Form alanları dolduruluyor...");
      for (const key in fieldMappings) {
        if (orderFormData.hasOwnProperty(key) && orderFormData[key] !== undefined && orderFormData[key] !== '') {
          const elementId = fieldMappings[key];
          const element = await waitForElement(`#${elementId}`, 5000); // Form elemanları için daha kısa timeout
          if (element) {
            if (key === 'privacyConsent') {
              setCheckboxValue(element, orderFormData[key]);
            } else if (element.tagName === 'SELECT') {
              setSelectValue(element, orderFormData[key]);
            } else {
              setInputValue(element, orderFormData[key]);
            }
          } else {
            console.warn(`Form elemanı bulunamadı: ID=${elementId} (key: ${key})`);
          }
        }
      }
      console.log("Form doldurma işlemi tamamlandı.");
    } else {
      console.warn("Kaydedilmiş sipariş formu verisi bulunamadı. Form doldurulamadı.");
    }

  } catch (error) {
    console.error("Sipariş otomasyonu sırasında bir hata oluştu:", error);
  }
})(); 