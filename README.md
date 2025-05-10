# Tesla Model Y Juniper Stok Takip Chrome Eklentisi

## Amaç
Bu eklenti, Tesla Türkiye'nin Model Y Juniper stoklarını otomatik olarak takip eder. Seçtiğiniz renk ve donanımda bir araç stokta göründüğünde size bildirim gönderir ve sipariş sayfasını otomatik olarak yeni bir sekmede açar.

## Özellikler
- Sadece Model Y Juniper (belirli VIN'ler) için çalışır.
- Araç ve renk seçimi popup arayüzünden kolayca yapılır.
- Kontrol aralığı (saniye cinsinden) ayarlanabilir.
- Araç bulunduğunda masaüstü bildirimi ve otomatik sipariş sekmesi açılır.
- Durum sekmesinde son kontrol zamanı ve sonuçları görüntülenir.
- Hiçbir kişisel veri dışarıya gönderilmez, tüm işlemler tarayıcıda gerçekleşir.

## Kurulum ve Kullanım
1. **Github'dan İndir:**
   - Sağ üstteki "Code" butonuna tıklayın, "Download ZIP" seçeneğiyle dosyaları indirin.
   - ZIP dosyasını bilgisayarınızda bir klasöre çıkarın.
2. **Chrome'da Geliştirici Modunu Açın:**
   - Chrome'da `chrome://extensions` adresine gidin.
   - Sağ üstte "Geliştirici modu"nu aktif edin.
3. **Eklentiyi Yükleyin:**
   - "Paketlenmemiş öğe yükle" butonuna tıklayın.
   - Az önce çıkardığınız klasörü seçin (içinde `manifest.json` olmalı).
4. **Eklentiyi Kullanın:**
   - Tarayıcı araç çubuğunda Tesla logosuna tıklayın.
   - "Hedef Araç" sekmesinden istediğiniz Model Y Juniper'ı seçin ve kaydedin.
   - "Genel Ayarlar"dan kontrol aralığını belirleyin ve kaydedin.
   - "İzlemeyi Başlat" butonuna tıklayın.
   - Araç stokta göründüğünde otomatik olarak bildirim alırsınız ve sipariş sayfası açılır.

## Sıkça Sorulan Sorular
- **Neden otomatik sipariş vermiyor?**
  - Güvenlik ve yasal nedenlerle eklenti sadece sizi bilgilendirir ve sipariş sayfasını açar. Siparişi tamamlamak için manuel işlem gerekir.
- **Neden sadece Model Y Juniper?**
  - VIN'ler sabit olduğu için sadece bu araçlar için güvenilir takip mümkündür.
- **Başka model/renk ekleyebilir miyim?**
  - Kodda ilgili bölüme yeni VIN ve renk ekleyerek genişletebilirsiniz.
- **Verilerim güvende mi?**
  - Evet, hiçbir veri dışarıya gönderilmez. Tüm işlemler tarayıcıda ve sizin bilgisayarınızda gerçekleşir.

## Teknik Gereksinimler
- Google Chrome (veya Chromium tabanlı tarayıcı)
- İnternet bağlantısı

## Geliştirici Notu
- `samples/` klasörü test ve örnek HTML için kullanılır, repoya dahil edilmez.
- Kodun tamamı açık kaynak ve özelleştirilebilir.

---

Her türlü öneri ve katkı için Github üzerinden issue veya pull request açabilirsiniz. 