# PRD: Tesla Model Y Juniper Stok Takip Chrome Eklentisi

## Amaç
Kullanıcıların, Tesla Türkiye Model Y Juniper stoklarını otomatik olarak takip edebilmesini sağlamak. Seçilen araç stokta göründüğünde kullanıcıya masaüstü bildirimi göndermek ve sipariş sayfasını otomatik olarak açmak.

## Temel Akış
1. Kullanıcı eklentiyi yükler ve popup arayüzünü açar.
2. "Hedef Araç" sekmesinden istediği Model Y Juniper'ı (renk/donanım) seçer.
3. "Genel Ayarlar" sekmesinden kontrol aralığını (saniye) belirler.
4. "İzlemeyi Başlat" butonuna tıklar.
5. Eklenti arka planda seçilen VIN için sipariş URL'sini periyodik olarak kontrol eder.
6. Araç stokta bulunursa:
   - Masaüstü bildirimi gösterilir.
   - Sipariş sayfası yeni sekmede açılır.
7. Kullanıcı isterse izlemeyi durdurabilir.

## Kısıtlar
- Sadece Model Y Juniper (sabit VIN listesi) için çalışır.
- Otomatik sipariş vermez, sadece bilgilendirir ve sipariş sayfasını açar.
- Hiçbir kişisel veri veya form bilgisi saklanmaz/gönderilmez.
- Sadece Chrome (ve Chromium tabanlı) tarayıcılarda çalışır.

## Kullanıcı Arayüzü
- **Genel Ayarlar:** Kontrol aralığı (saniye) ayarı, izlemeyi başlat/durdur butonu.
- **Hedef Araç:** Model Y Juniper VIN'leri ve renk/donanım bilgisiyle tekli seçim (radio button).
- **Durum:** Son kontrol zamanı, toplam kontrol sayısı, son URL durumu.

## Teknik Gereksinimler
- Google Chrome veya Chromium tabanlı tarayıcı
- İnternet bağlantısı
- Geliştirici modu ile yükleme

## Güvenlik ve Gizlilik
- Hiçbir veri dışarıya gönderilmez, tüm işlemler tarayıcıda ve bilgisayarda gerçekleşir.
- Sadece stok kontrolü ve bildirim için çalışır.

## Geliştirici Notu
- `samples/` klasörü test ve örnekler için kullanılır, `.gitignore` ile repoya dahil edilmez.
- Kod açık kaynak ve özelleştirilebilir. 