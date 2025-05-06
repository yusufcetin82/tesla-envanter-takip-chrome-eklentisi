# Ürün Gereksinimleri Dokümanı: Tesla Envanter Takip ve Sipariş Asistanı (Chrome Eklentisi)

## 1. Giriş

Bu doküman, Tesla Türkiye envanter web sitesindeki belirli kriterlere uygun araçları otomatik olarak takip eden, bulduğunda kullanıcıyı bilgilendiren, aracın sipariş sayfasına yönlendiren ve önceden tanımlanmış form bilgilerini doldurarak sipariş sürecini hızlandıran bir Chrome eklentisi için ürün gereksinimlerini tanımlamaktadır. Eklenti, kullanıcının belirlediği parametrelerle çalışacak ve kullanıcı tarafından başlatılıp durdurulabilecektir.

## 2. Amaçlar

- Kullanıcıların manuel olarak Tesla envanterini sürekli kontrol etme ihtiyacını ortadan kaldırmak.
- Belirlenen kriterlere (fiyat, renk, model vb.) uygun bir araç envantere eklendiğinde anında tespit sağlamak.
- Araç bulunduğunda, sipariş sayfasındaki form doldurma sürecini otomatikleştirerek kullanıcıya zaman kazandırmak.
- Sipariş sürecinde hata yapma olasılığını azaltmak ve son onay adımını kullanıcıya bırakarak kontrolü sağlamak.
- Kullanıcıya eklentinin çalışma durumu hakkında şeffaf bilgi sunmak.

## 3. Hedef Kitle

- Tesla'dan yeni bir araç satın almak isteyen ve belirli model/konfigürasyonları takip eden bireysel veya kurumsal kullanıcılar.
- Sınırlı sayıda veya anlık olarak envantere düşen araçları kaçırmak istemeyen, hızlı hareket etmesi gereken kullanıcılar.
- Tekrarlayan form doldurma işlemlerini otomatikleştirmek isteyen teknolojiye yatkın kullanıcılar.

## 4. Kullanıcı Hikayeleri

- **Bir kullanıcı olarak,** istediğim model, renk ve maksimum fiyat gibi araç kriterlerimi eklentiye kaydedebilmek istiyorum, böylece eklenti sadece benim için uygun araçları arar.
- **Bir kullanıcı olarak,** eklentinin Tesla envanterini ne sıklıkta kontrol edeceğini belirleyebilmek istiyorum.
- **Bir kullanıcı olarak,** eklentiyi istediğim zaman başlatıp durdurabilmek istiyorum.
- **Bir kullanıcı olarak,** eklentinin en son ne zaman kontrol yaptığını, kaç kontrol yaptığını ve bir araç bulup bulmadığını gösteren bir arayüz görmek istiyorum.
- **Bir kullanıcı olarak,** eklenti kriterlerime uygun bir araç bulduğunda, o aracın sipariş sayfasının otomatik olarak yeni bir sekmede açılmasını istiyorum.
- **Bir kullanıcı olarak,** sipariş sayfasındaki bireysel veya kurumsal müşteri tipime göre (TC Kimlik No, Vergi No, Adres vb.) kişisel bilgilerimin otomatik olarak doldurulmasını istiyorum, bu bilgileri önceden eklentiye kaydedebilmeliyim.
- **Bir kullanıcı olarak,** formlar doldurulduktan sonra eklentinin son "Sipariş Ver" (veya benzeri) butonuna odaklanmasını istiyorum, böylece son onayı ben verebilirim.
- **Bir kullanıcı olarak,** girdiğim tüm ayar ve form bilgilerinin tarayıcımda güvenli bir şekilde saklanmasını ve tarayıcıyı yeniden başlattığımda kaybolmamasını istiyorum.

## 5. Özellikler

### 5.1. Parametrik Ayarlar ve Kayıt
- Kullanıcının aşağıdaki bilgileri girebileceği ve kaydedebileceği bir ayarlar arayüzü (popup veya seçenekler sayfası):
    - **Araç Kriterleri:**
        - Model (örn: Model Y)
        - İstenen Renk(ler) (örn: "Quicksilver", "Pearl White")
        - Maksimum Fiyat (TRY)
        - İstenen Donanım/Trim (örn: "Performance", "Long Range") - *API yanıtında mevcutsa eklenebilir*
        - Diğer filtrelenebilir özellikler (API'ye göre)
    - **İzleme Ayarları:**
        - Kontrol Aralığı (saniye/dakika cinsinden parametrik, örn: 30 saniye, 1 dakika, 5 dakika)
        - Posta Kodu (`zip`) - *API isteği için gerekli*
        - Enlem (`lat`) ve Boylam (`lng`) (isteğe bağlı, posta koduna göre otomatik bulunabilir veya manuel girilebilir)
    - **Form Bilgileri (Bireysel):**
        - Ad
        - Soyad
        - TC Kimlik Numarası
        - E-posta Adresi
        - Telefon Numarası
        - Adres Bilgileri (İl, İlçe, Mahalle, Detay)
    - **Form Bilgileri (Kurumsal):**
        - Firma Adı
        - Vergi Dairesi
        - Vergi Numarası
        - E-posta Adresi
        - Telefon Numarası
        - Firma Adres Bilgileri
    - Müşteri Tipi Seçimi (Bireysel / Kurumsal) - *Bu seçime göre hangi form bilgilerinin kullanılacağı belirlenir.*
- Tüm bu ayarlar `chrome.storage.local` kullanılarak tarayıcıda saklanacaktır.

### 5.2. Envanter İzleme Motoru (API Tabanlı)
- Arka planda (background script) çalışır.
- Kullanıcının belirlediği aralıklarla Tesla envanter API'sine (`https://www.tesla.com/inventory/api/v4/inventory-results`) istek gönderir.
- API isteği, kullanıcının kaydettiği posta kodu, enlem/boylam ve diğer ilgili parametreleri içerir.
- Gelen JSON yanıtını işler ve kullanıcının belirlediği araç kriterlerine (fiyat, renk vb.) göre filtreler.

### 5.3. Bildirim ve Otomatik Yönlendirme
- Kriterlere uygun bir araç bulunduğunda:
    - Kullanıcıya görsel/sesli bir bildirimde bulunabilir (isteğe bağlı, Chrome notifications API).
    - Aracın sipariş sayfasını (`VIN` veya `Hash` kullanarak oluşturulan URL) otomatik olarak yeni bir sekmede açar.

### 5.4. Otomatik Form Doldurma
- Yeni açılan sipariş sayfasında içerik script'i (content script) çalışır.
- Kullanıcının `chrome.storage`'da kayıtlı müşteri tipi (bireysel/kurumsal) ve ilgili form bilgilerini okur.
- Sayfadaki ilgili form alanlarını (kullanıcı tarafından element seçicileri sağlanacak veya eklenti yaygın ID/name'leri hedefleyecek) otomatik olarak doldurur.
- Gerekirse sayfadaki ara onay butonlarına (örn: "Devam", "Bilgileri Onayla") tıklar.

### 5.5. Son Butona Odaklanma
- Tüm bilgiler doldurulduktan ve ara adımlar tamamlandıktan sonra, son sipariş onay butonuna (`#orderButton` veya benzeri) `focus()` metodu ile odaklanır.

### 5.6. Çalıştırma/Durdurma Kontrolü
- Kullanıcının eklentinin izleme motorunu istediği zaman başlatıp durdurabilmesi için bir anahtar (toggle switch) veya butonlar (Başlat/Durdur). Bu kontrol, eklentinin popup arayüzünde veya enjekte edilen panelde yer alabilir.
- "Durdur" seçildiğinde, arka plan API istekleri durdurulur. "Başlat" seçildiğinde yeniden başlar.

### 5.7. Enjekte Edilen Durum Paneli (Tesla Envanter Sayfasında)
- Tesla envanter sayfası (`https://www.tesla.com/tr_TR/inventory/new/my...`) görüntülendiğinde, sayfanın üst kısmına veya uygun bir köşesine eklenti tarafından bir UI paneli enjekte edilir.
- Bu panelde aşağıdaki bilgiler gösterilir:
    - Eklenti Durumu: (Çalışıyor / Durduruldu / Araç Aranıyor / Araç Bulundu / Hata)
    - Son Kontrol Zamanı
    - Yapılan Toplam Kontrol Sayısı
    - Bulunan Uygun Araç Sayısı (o anki veya toplam)
    - Başlat/Durdur butonu/anahtarı.

## 6. Tasarım ve Kullanıcı Arayüzü (Genel)

- **Popup Arayüzü:** Ayarların yapılandırılması ve temel kontroller için temiz, anlaşılır ve kullanıcı dostu bir arayüz.
- **Enjekte Edilen Panel:** Sayfanın mevcut tasarımını bozmayacak, dikkat dağıtmayan ancak gerekli bilgiyi net sunan minimal bir tasarım.

## 7. Teknik Hususlar

- Eklenti, Chrome Extension Manifest V3 kullanılarak geliştirilecektir.
- Arka plan işlemleri için Service Worker (`background.js`) kullanılacaktır.
- Sayfa etkileşimleri için Content Scripts kullanılacaktır.
- Ayarların saklanması için `chrome.storage.local` API'si kullanılacaktır.
- Tesla API'sine istekler `fetch` API'si ile yapılacaktır.
- API'den gelen `Cookie` ve diğer gerekli `headers` yönetimi dikkatlice ele alınmalıdır. Gerekirse `chrome.cookies` API'si kullanılabilir.
- Tesla web sitesi ve API'sindeki değişikliklere karşı eklentinin güncellenmesi gerekebilir. Element seçicileri (selectors) mümkün olduğunca esnek tutulmalıdır.
- Hata yönetimi (API'ye ulaşılamaması, beklenmedik yanıt formatları vb.) için `try...catch` blokları ve kullanıcıya bilgilendirme mekanizmaları içermelidir.

## 8. Başarı Metrikleri (İsteğe Bağlı)

- Kullanıcıların eklentiyi aktif olarak kullanma oranı.
- Eklenti sayesinde başarıyla bulunan ve sipariş sürecine geçilen araç sayısı (kullanıcı geri bildirimiyle ölçülebilir).
- Kullanıcıların ayarları sorunsuz bir şekilde yapılandırabilme oranı.

## 9. Gelecekteki Geliştirmeler (İsteğe Bağlı)

- Birden fazla araç kriter seti kaydedebilme.
- Daha gelişmiş bildirim seçenekleri (örn: e-posta, mobil bildirim entegrasyonu - harici servis gerektirir).
- CAPTCHA gibi bot korumalarıyla karşılaşıldığında kullanıcıyı bilgilendirme ve manuel müdahale isteme. 