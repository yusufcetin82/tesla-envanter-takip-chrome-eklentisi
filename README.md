# ÖNEMLİ DUYURU: Bu Proje Artık Gerekli Değil!

**Tesla, envanter sistemini güncelleyerek "sonsuz envanter" benzeri bir yapıya geçtiği için bu eklentinin temel amacı ortadan kalkmıştır. Artık araç bulmak için bu tür bir araca ihtiyaç bulunmamaktadır.**

Bu repo, geliştirme sürecinin bir arşivi olarak tutulmaktadır ancak aktif olarak bakım yapılmayacak veya güncellenmeyecektir.

# Tesla Otomatik Sipariş Asistanı (Chrome Eklentisi)

## Amaç
Bu eklenti, belirlediğiniz bir Tesla aracının sipariş URL'sinin aktif olup olmadığını periyodik olarak kontrol eder. Eğer URL aktif hale gelirse (yani araç satın alınabilir duruma geçerse), size bildirim gönderir, araca ait sipariş sayfasını otomatik olarak yeni bir sekmede açar ve isteğe bağlı olarak önceden tanımladığınız form bilgilerini (Bireysel/Kurumsal) otomatik olarak doldurarak son "Sipariş Et" butonuna odaklanır.

**Not:** Otomatik form doldurma özelliği geliştirilmiş olup, henüz farklı senaryolarda ve Tesla web sitesindeki olası değişikliklere karşı kapsamlı olarak **test edilmemiştir**. Bu özelliği kullanırken dikkatli olunuz.

## Temel Özellikler
- **Spesifik URL Takibi:** Envanter listesi yerine doğrudan sizin belirlediğiniz bir aracın sipariş URL'sinin geçerliliğini takip eder.
- **Periyodik Kontrol:** Ayarladığınız saniye cinsinden aralıklarla hedef URL'yi kontrol eder.
- **Otomatik Yönlendirme ve Bildirim:** Araç satın alınabilir olduğunda masaüstü bildirimi gönderir ve sipariş sayfasını yeni sekmede açar.
- **Otomatik Form Doldurma (Test Aşamasında):**
    - "Müşteri Tipi" (Bireysel/Kurumsal) seçimine göre ilgili form alanlarını doldurur.
    - Önceden kaydedilmiş Ad, Soyad, TC Kimlik No/Vergi No, E-posta, Telefon vb. bilgileri kullanır.
    - Form doldurulduktan sonra sayfadaki son "Sipariş Et" (veya benzeri) butonuna odaklanır.
- **Kullanıcı Arayüzü:**
    - **Hedef Araç:** Takip edilecek aracın tam sipariş URL'si girilir.
    - **Form Bilgileri:** Bireysel ve Kurumsal müşteri tipleri için ayrı ayrı form bilgileri kaydedilebilir.
    - **Genel Ayarlar:** Kontrol sıklığı gibi eklenti davranışları ayarlanır.
    - **Durum:** Eklentinin o anki çalışma durumu, son kontrol zamanı ve sonuçları görüntülenir.
- **Gizlilik:** Tüm ayarlar ve form bilgileri sadece yerel olarak tarayıcınızda saklanır, dışarıya gönderilmez.

## Kurulum ve Kullanım
1.  **Github'dan İndir:**
    *   Sağ üstteki "Code" butonuna tıklayın, "Download ZIP" seçeneğiyle dosyaları indirin.
    *   ZIP dosyasını bilgisayarınızda bir klasöre çıkarın.
2.  **Chrome'da Geliştirici Modunu Açın:**
    *   Chrome'da `chrome://extensions` adresine gidin.
    *   Sağ üstte "Geliştirici modu"nu aktif edin.
3.  **Eklentiyi Yükleyin:**
    *   "Paketlenmemiş öğe yükle" butonuna tıklayın.
    *   Az önce çıkardığınız klasörü seçin (içinde `manifest.json` olmalı).
4.  **Eklentiyi Kullanın:**
    *   Tarayıcı araç çubuğunda Tesla logosuna tıklayarak eklenti popup'ını açın.
    *   **Hedef Araç Sekmesi:** Takip etmek istediğiniz aracın tam sipariş URL'sini (örneğin, `https://www.tesla.com/tr_tr/my/order/LRWY0000000TR000000000?titleStatus=new&redirect=no#payment` gibi) girin ve kaydedin.
    *   **Form Bilgileri Sekmesi:** Müşteri tipini (Bireysel/Kurumsal) seçin ve ilgili form alanlarını (Ad, Soyad, TC/Vergi No, E-posta, Telefon vb.) doldurup kaydedin. Bu adım isteğe bağlıdır ancak otomatik doldurma için gereklidir.
    *   **Genel Ayarlar Sekmesi:** URL kontrol sıklığını (saniye cinsinden) belirleyin ve kaydedin.
    *   Popup üzerindeki "İzlemeyi Başlat" butonuna tıklayın.
    *   Araç satın alınabilir olduğunda otomatik olarak bildirim alırsınız, sipariş sayfası açılır ve (eğer bilgiler girilmişse) form doldurulmaya çalışılır.

## Sıkça Sorulan Sorular
- **Otomatik sipariş veriyor mu?**
  - Hayır, eklenti siparişi sizin yerinize **vermez**. Sadece formu doldurur ve son onay butonuna odaklanır. Siparişi son bir kontrol yaparak sizin vermeniz gerekir. Bu, olası hatalı siparişlerin önüne geçmek için bir güvenlik önlemidir.
- **Form doldurma özelliği neden test edilmedi olarak belirtiliyor?**
  - Tesla'nın web sitesindeki form yapısı zamanla değişebilir. Otomatik doldurma mantığının her zaman doğru çalışacağının garantisi yoktur. Kullanmadan önce küçük miktarlı veya risksiz bir senaryoda test etmeniz önerilir. Yanlış veya eksik doldurma ihtimaline karşı sipariş öncesi bilgileri mutlaka kontrol edin.
- **Hangi URL'yi girmeliyim?**
  - Takip etmek istediğiniz, daha önce envanterde gördüğünüz bir aracın direkt sipariş sayfasının URL'sini girmelisiniz. Bu URL genellikle bir VIN veya benzersiz bir sipariş kimliği içerir.
- **Verilerim güvende mi?**
  - Evet, girdiğiniz tüm ayarlar ve form bilgileri Chrome'un yerel depolama alanında, sadece sizin bilgisayarınızda saklanır. Hiçbir veri dışarıya gönderilmez.

## Teknik Gereksinimler
- Google Chrome (veya Chromium tabanlı tarayıcı)
- İnternet bağlantısı

## Geliştirici Notları
- Eklenti, Tesla'nın resmi bir aracı değildir ve Tesla web sitesindeki değişikliklere bağlı olarak işlevselliğini yitirebilir.
- Otomatik form doldurma (`content_order.js`) script'i, sipariş sayfasının DOM yapısına oldukça bağımlıdır. Tesla'nın sayfa yapısını değiştirmesi durumunda bu özelliğin güncellenmesi gerekir.
- Kodun tamamı açık kaynak ve özelleştirilebilir.

---

## Yasal Uyarı / Legal Disclaimer

**Türkçe:**
Bu proje tamamen hobi amaçlı, açık kaynak bir yazılım geliştirme çalışmasıdır. Hiçbir şekilde Tesla, Inc. veya Tesla Türkiye ile resmi bir bağlantısı yoktur. Eklentinin kullanımı sonucunda doğabilecek her türlü risk, zarar, finansal kayıp veya hukuki sorumluluk tamamen kullanıcıya aittir. Geliştirici, yazılımın hatalı çalışması, eksik veya yanlış bilgi sunması, otomatik form doldurmadaki hatalar veya kullanımından doğabilecek doğrudan veya dolaylı hiçbir zarardan sorumlu tutulamaz. Lütfen bu yazılımı kullanmadan önce tüm riskleri anladığınızdan ve kendi sorumluluğunuzda hareket ettiğinizden emin olun. Otomatik işlemlere güvenmeden önce her zaman kritik bilgileri ve adımları manuel olarak doğrulayın.

**English:**
This project is a hobby, open-source software development effort and is not affiliated with Tesla, Inc. or Tesla Turkey in any way. Any risk, damage, financial loss, or legal responsibility arising from the use of this extension is solely the user's responsibility. The developer cannot be held liable for any direct or indirect damages resulting from software malfunctions, provision of incomplete or incorrect information, errors in automated form filling, or its general use. Please ensure you understand all risks and act on your own responsibility before using this software. Always manually verify critical information and steps before relying on automated processes.

Her türlü öneri ve katkı için Github üzerinden issue veya pull request açabilirsiniz. 