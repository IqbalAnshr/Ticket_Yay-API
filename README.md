

# API Ticket Booking System 

## Deskripsi Proyek

REST API untuk manajemen dan pembelian tiket event. Proyek ini dirancang untuk aplikasi web dan mobile, menawarkan berbagai fitur untuk memastikan kinerja yang tinggi, keamanan, dan skalabilitas.

### Dokumentasi API

- [Dokumentasi API](https://documenter.getpostman.com/view/32681373/2sAXjJ6CxP)

### Teknologi yang Digunakan

- **Node.js**: Platform runtime untuk menjalankan JavaScript di sisi server.
- **Express.js**: Framework untuk membangun aplikasi web dengan Node.js.
- **MongoDB**: Database NoSQL untuk penyimpanan data.
- **Redis**: Sistem caching untuk meningkatkan performa dengan mengurangi beban pada database saat trafik tinggi.

### Keamanan

- **Autentikasi dengan JWT**: Menjamin akses yang aman dengan token JWT untuk login dan otorisasi pengguna.
- **Token Refresh**: Menggunakan token refresh untuk memperpanjang sesi pengguna tanpa memerlukan login ulang.
- **Verifikasi Transaksi**: Integrasi dengan Midtrans Core API untuk memastikan keamanan dan validitas transaksi pembayaran.

### Performa

- **Caching dengan Redis**: Meningkatkan performa aplikasi dengan caching data untuk mengatasi lonjakan trafik pada event yang tinggi.
- **Atomic Operations**: Menghindari masalah race condition dengan implementasi operasi atomik, menjaga konsistensi data meskipun terjadi konflik pada akses bersamaan.


## Instalasi dan Konfigurasi

### Prasyarat

- Docker
- Docker Compose

### Langkah Instalasi

1. **Clone Repository**

   ```bash
   git clone [https://github.com/username/repository.git](https://github.com/IqbalAnshr/Ticket_Yay-API.git)
   cd repository
   ```

2. **Buat File Konfigurasi `.env`**

   **Contoh `.env`:**

   ```env
   PORT=3000
   NODE_ENV=development

   # MongoDB
   MONGO_URI=mongodb://user:pw@mongo_db:27017/ticket_yay?authSource=admin

   # Redis
   REDIS_URI=redis://redis:6379

   # Multer
   UPLOAD_DIRECTORY_PROFILE_IMAGE=./public/uploads/profile_images
   UPLOAD_DIRECTORY_EVENT_IMAGES=./public/uploads/event_images
   MAX_FILE_SIZE=5242880

   # JWT
   JWT_KEY=key123123123123
   JWT_ACCESS=access
   JWT_REFRESH=refresh
   JWT_ACCESS_TIME=1800
   JWT_REFRESH_TIME=86400
   JWT_AUDIENCE=API
   JWT_ISSUER=API

   # Midtrans
   MIDTRANS_CLIENT_KEY=your-client-key
   MIDTRANS_SERVER_KEY=your-server-key
   ```

3. **Jalankan Docker Compose**

   Pastikan Docker dan Docker Compose telah terinstall, kemudian jalankan:

   ```bash
   docker-compose up --build
   ```

   Perintah ini akan membangun image Docker dan menjalankan container sesuai dengan konfigurasi di `docker-compose.yml`.

### Penggunaan

1. **Start Server**

   Server akan berjalan pada port yang telah ditentukan dalam file `.env`, misalnya `3000`.

2. **API Endpoint**

   - **`/api/tickets/`**: Mendapatkan daftar tiket pengguna.
   - **`/api/tickets/:id`**: Mendapatkan detail tiket berdasarkan ID.
   - **`/api/events/o/`**: Mengelola event oleh pemilik.
   - **`/api/events/`**: Mengakses event yang tersedia untuk pembeli.


### Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan ajukan pull request atau hubungi email saya iqbalanshr@gmail.com.


