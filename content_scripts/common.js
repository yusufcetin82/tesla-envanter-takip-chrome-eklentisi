// Tesla Envanter Takip ve Sipariş Asistanı - content_scripts/common.js

console.log("Tesla Asistanı - Common Content Script Yüklendi");

// Buraya hem content_inventory.js hem de content_order.js tarafından
// kullanılabilecek ortak fonksiyonlar eklenebilir.
// Örneğin, DOM elementlerini beklemek için bir yardımcı fonksiyon vb.

function waitForElement(selector, callback, timeout = 10000, interval = 100) {
  let elapsedTime = 0;
  const timer = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(timer);
      callback(element);
    } else {
      elapsedTime += interval;
      if (elapsedTime >= timeout) {
        clearInterval(timer);
        console.warn(`Element ${selector} ${timeout}ms içinde bulunamadı.`);
        callback(null); // Zaman aşımında null ile callback çağır
      }
    }
  }, interval);
} 