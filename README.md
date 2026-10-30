# SuhuDelhi - Peramalan Suhu Rata-Rata Harian Kota Delhi

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.x-black?style=flat-square&logo=flask)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=flat-square&logo=tensorflow)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E?style=flat-square&logo=scikit-learn)

Aplikasi web berbasis Flask untuk meramalkan **suhu rata-rata harian di Kota Delhi** 1 sampai 30 hari ke depan, menggunakan model **LSTM** (Long Short-Term Memory). Model membaca 30 hari suhu terakhir untuk menebak suhu hari berikutnya, lalu mengulanginya secara rekursif sampai jumlah hari yang dipilih. Proyek ini adalah Tugas Akhir 4 (TA-04) mata kuliah Pembelajaran Mesin.

---

## Fitur Aplikasi

- **Prakiraan 1-30 Hari** - pilih jumlah hari lewat slider atau tombol cepat, hasilnya tampil sebagai kartu berwarna sesuai suhu
- **Grafik Interaktif** - riwayat suhu dan prakiraan dalam bentuk garis atau batang, rentang riwayat bisa diatur, klik kartu untuk menyorot titiknya di grafik
- **Simulasi LSTM** - animasi jendela 30 hari yang bergeser setiap kali model menebak satu hari
- **Pola Musiman** - rata-rata suhu per bulan dari seluruh data historis
- **Performa Model** - RMSE, MAE, perbandingan dengan tebakan "sama dengan kemarin", grafik aktual vs prediksi, dan sebaran selisih
- **Toleransi Galat** - geser batas selisih untuk melihat persentase prediksi yang masih di dalam batas itu
- **Satuan dan Tema** - ganti satuan °C/°F, mode terang atau gelap, serta unduh hasil prakiraan sebagai CSV

---

## Teknologi

| Komponen | Teknologi |
|---|---|
| Backend | Flask 3, Gunicorn |
| Machine Learning | TensorFlow/Keras (LSTM), scikit-learn 1.6.1 (MinMaxScaler) |
| Data Processing | Pandas, NumPy |
| Visualisasi | Chart.js (aplikasi), Matplotlib (notebook) |
| Penyimpanan Model | HDF5 (`.h5`) dan Joblib |
| Frontend | HTML (Jinja2), CSS, JavaScript |

---

## Dataset

- **Sumber:** [Kaggle - Daily Weather Time Series Data, Delhi, India](https://www.kaggle.com/datasets/yug201/daily-climate-time-series-data-delhi-india)
- **Rentang waktu:** April 2013 sampai November 2024 (data harian)
- **Variabel yang dipakai:** suhu rata-rata harian (model univariat). Kolom tanggal dan kolom suhu dideteksi otomatis oleh notebook; jika hanya ada suhu maksimum dan minimum, rata-ratanya dihitung dari keduanya
- **Pembersihan:** file CSV di `data/` digabung, tanggal ganda dibuang, tanggal yang hilang dilengkapi, dan nilai kosong diisi dengan interpolasi berbasis waktu
- **Pembagian data (urut waktu):** 70% latih, 15% validasi, 15% uji. `MinMaxScaler` hanya di-*fit* pada data latih agar tidak terjadi kebocoran data

---

## Arsitektur Model

| Bagian | Pengaturan |
|---|---|
| Input | 30 hari terakhir (`TIMESTEPS = 30`), 1 fitur |
| Lapisan | LSTM(64) → Dropout(0,2) → LSTM(32) → Dropout(0,2) → Dense(16, ReLU) → Dense(1) |
| Optimizer / Loss | Adam / Mean Squared Error |
| Pelatihan | Maksimal 100 epoch, batch 32, `EarlyStopping` (patience 10) |
| Peramalan | Rekursif: tebakan satu hari dipakai lagi sebagai input hari berikutnya |

---

## Performa Model

Evaluasi pada data uji (15% terakhir dari data). Isi tabel ini dengan hasil dari sel evaluasi di notebook setelah training.

| Metrik | Nilai |
|---|---|
| RMSE data uji | ... °C |
| MAE data uji | ... °C |
| RMSE tebakan "sama dengan kemarin" | ... °C |

Tebakan "sama dengan kemarin" dipakai sebagai pembanding sederhana (baseline). Suhu harian sangat mirip dengan hari sebelumnya, sehingga baseline ini sulit dikalahkan. Galat peramalan jangka panjang juga menumpuk karena setiap prediksi dipakai lagi sebagai input, jadi anggap hasil di ujung rentang sebagai gambaran tren, bukan angka pasti.

---

## Instalasi Lokal

### 1. Clone repository

```bash
git clone https://github.com/Alnazh/ta04-delhi-lstm-forecasting.git
cd ta04-delhi-lstm-forecasting
```

### 2. Buat virtual environment

```bash
python -m venv .venv

# Windows (PowerShell, jika muncul error execution policy:
# Set-ExecutionPolicy -Scope Process Bypass)
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Jalankan aplikasi

```bash
python app.py
```

Buka browser di `http://127.0.0.1:5000`

Folder `model/` dan `data/delhi_climate_clean.csv` sudah ikut di repository, jadi tidak perlu training ulang. Jika ingin melatih ulang atau memakai data baru, lihat bagian **Training Model**.

---

## Struktur Project

```
ta04-delhi-lstm-forecasting/
├── app.py                        # Entry point Flask (halaman dan API)
├── notebook_training.ipynb       # EDA, pelatihan, evaluasi, penyimpanan model
├── requirements.txt              # Daftar dependensi Python
├── .python-version
├── .gitignore
│
├── data/
│   ├── (CSV dari Kaggle)         # Dataset mentah, tidak di-commit
│   └── delhi_climate_clean.csv   # Data bersih untuk aplikasi
│
├── model/
│   ├── lstm_model.h5             # Model LSTM tersimpan
│   ├── scaler.pkl                # MinMaxScaler tersimpan
│   ├── config.json               # Timesteps dan nama kolom target
│   └── metrics.json              # Metrik evaluasi dan hasil prediksi data uji
│
├── templates/
│   └── index.html                # Halaman web (HTML + Jinja2)
│
├── static/
│   ├── css/
│   │   └── style.css             # Gaya tampilan
│   └── js/
│       ├── theme.js              # Tema terang/gelap (dimuat paling awal)
│       └── app.js                # Grafik, interaksi, pemanggilan API
│
└── docs/
    └── screenshots/              # Tangkapan layar aplikasi
```

---

## Training Model

1. Unduh dataset dari Kaggle (tautan di bagian **Dataset**), ekstrak, lalu taruh file CSV-nya di folder `data/`.
2. Buka `notebook_training.ipynb` (Jupyter atau Google Colab). Di Colab, buat folder `data` dan upload file CSV ke sana.
3. Jalankan sel pertama untuk memasang `scikit-learn==1.6.1`, lalu **Run all**. Jika versi di sel terakhir bukan 1.6.1, restart runtime dan jalankan ulang.
4. Jika kolom tidak dikenali otomatis, isi `DATE_COL` atau `TEMP_COL` di sel pengaturan.
5. Unduh hasilnya dan taruh di proyek: folder `model/` dan file `data/delhi_climate_clean.csv`.

Gunakan versi library yang sama seperti di `requirements.txt` agar file model dan scaler kompatibel.

---

## Endpoint API

| Endpoint | Fungsi |
|---|---|
| `/` | Halaman web |
| `/api/history?last=180` | Data historis (N hari terakhir) |
| `/api/forecast?days=7` | Prediksi 1-30 hari ke depan |
| `/api/monthly` | Rata-rata suhu per bulan |
| `/api/info` | Info dataset dan pembagian data |
| `/api/evaluation` | RMSE, MAE, baseline, dan data aktual vs prediksi pada data uji |
| `/health` | Cek status server |

---

## Tampilan Aplikasi

> Taruh tangkapan layar asli di folder `docs/screenshots/` (nama file tetap sama).

### Beranda
![Beranda](docs/screenshots/01-beranda.png)

### Prediksi
![Prediksi](docs/screenshots/02-prediksi.png)

### Performa Model
![Performa Model](docs/screenshots/03-performa-model.png)

---

## Cara Penggunaan

1. Buka halaman utama, lalu pergi ke bagian **Prediksi**
2. Pilih jumlah hari ke depan (1-30) dengan slider atau tombol cepat
3. Atur rentang riwayat dan bentuk grafik (garis atau batang) sesuai kebutuhan
4. Klik salah satu kartu hari untuk menyorot titiknya di grafik, atau gunakan tombol **Unduh CSV** untuk menyimpan hasil
5. Buka bagian **Performa Model** untuk melihat seberapa akurat model pada data uji

---

## Deployment

TensorFlow berukuran besar (sekitar 500 MB), jadi pilih hosting yang memorinya cukup. Jalankan server dengan:

```bash
gunicorn app:app --workers 1 --threads 2 --timeout 180
```

Setelah deploy, cek `/health` untuk memastikan server hidup.
