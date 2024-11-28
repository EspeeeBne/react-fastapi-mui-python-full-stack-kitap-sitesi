MyKitapList

MyKitapList, kitaplarınızı yönetmenize, arkadaşlar eklemenize ve kitap önerileri almanıza imkan tanıyan bir uygulamadır. Bu belge, projeyi nasıl kurup çalıştırabileceğinizi adım adım anlatmaktadır.

Kurulum

Projeyi çalıştırmak için aşağıdaki adımları izleyin:

1. Depoyu Klonlayın

Projeyi yerel ortamınıza klonlamak için aşağıdaki komutu kullanabilirsiniz:

$ git clone https://github.com/EspeeeBne/react-fastapi-mui-python-full-stack-kitap-sitesi.git
$ cd MyKitapList

2. Sanal Ortam (Virtual Environment) Oluşturun

Sistemdeki paketlerle karışıklık oluşmaması için bir sanal ortam oluşturun ve etkinleştirin:

$ python -m venv venv
# Linux/macOS için  source venv/bin/activate  
 ya da
 # Windows için  venv\Scripts\activate

3. Bağımlılıkları Kurun

Gerekli Python paketlerini kurmak için aşağıdaki komutu çalıştırın:

$ pip install -r requirements.txt

4. Çevresel Değişken Dosyasını Ayarlayın

.env.example dosyasını .env olarak yeniden adlandırın ve gerekli değişkenleri bu dosyada ayarlayın (8000 portu dışında açılırsa back-end):

$ cp .env.example .env

5. Veritabanı Dosyasını Oluşturun

Proje çalıştırılırken JSON tabanlı bir veritabanı kullanılıyor. Bu nedenle books_db.json dosyasına sakın ellemeyin.

1. Sunucuyu Başlatın

Uygulamayı başlatmak için aşağıdaki komutu kullanabilirsiniz:

$ uvicorn main:app --reload

Sunucu başlatıldıktan sonra uygulamaya http://localhost:8000 adresinden erişebilirsiniz.

Kullanım

Proje, kitaplar ekleyebileceğiniz, arkadaşlarınızla paylaşabileceğiniz ve öneriler alabileceğiniz bir kitap yönetim platformudur.

Arkadaşlar eklemek ve onlarla etkileşimde bulunmak için oturum açın.

Lisans

Bu proje MIT Lisansı altında sunulmaktadır.

