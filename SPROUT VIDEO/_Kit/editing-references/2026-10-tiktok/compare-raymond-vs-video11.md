# Raymond Chin (raymond-1) vs Video 11

Tanggal: 2026-10-26
Sumber angka: `cue-raymond-1/cue-sheet.json` dan `../2026-10-nick-saraev/baseline-video-11/cue-sheet.json`, dibuat oleh `../cue_sheet.py`.
Sumber pengamatan: `events.jpg` dan `timeline.jpg` di kedua folder (1 frame per detik).

## Angka terukur

| Metrik | Raymond | Video 11 | Catatan |
|---|---|---|---|
| Durasi | 112,2 s | 58,8 s | |
| Cut per 10 s | 1,87 | 1,53 | Hampir sama |
| Median panjang shot | 3,80 s | 4,27 s | Hampir sama |
| Shot terpanjang | 15,3 s | 12,4 s | Raymond lebih panjang |
| Kata per detik | 3,40 | 4,03 | |
| Cutaway pertama | 3,07 s | 12,40 s | Selisih 9 detik |

**Kesimpulan dari angka: Raymond tidak lebih cepat memotong.** Jadi "tambah cut" bukan solusinya. Bedanya ada pada isi layar dan apa yang terjadi di dalam satu shot.

## Pembagian waktu layar (dihitung per detik dari timeline.jpg)

| | Raymond | Video 11 |
|---|---|---|
| Wajah penuh | ~28 dari 112 s (25%) | ~40 dari 58 s (69%) |
| Grafik/b-roll penuh | ~84 s (75%) | ~12 s (21%) |
| Split wajah + panel | 0 | ~6 s (10%) |

Raymond adalah explainer yang sesekali kembali ke wajah. Video 11 adalah talking head yang sesekali disisipi ilustrasi. Kalau referensinya Raymond, perbandingan rasio inilah perbedaan terbesar.

## Enam perbedaan yang terlihat

### 1. B-roll Raymond adalah bukti, b-roll kita adalah dekorasi
Isi cutaway Raymond: screenshot tweet (3-5 s), layar aplikasi saham (5,8 s), foto gedung BEI (8,7 s), headline berita (57 s), dokumen "Analyst Commentaries" (92-97 s), foto BlackRock (72 s), dan foto rapat regulator (98 s). Total ada 6 jenis sumber visual, dan setiap gambar membuktikan kalimat yang sedang diucapkan.
Video 11 hanya punya 1 jenis: objek clay di atas kertas krem. Objeknya mengilustrasikan topik ("sepatu", "tangga"), bukan membuktikan klaim.

### 2. Grafik Raymond menumpuk informasi, grafik kita diam
Pada 16-37 s, satu diagram hidup selama ~21 detik. Isinya berganti dari HP dengan chart, ke grid ikon yang terisi kuning, lalu toko dengan ikon orang yang bertambah setiap kalimat. Hampir setiap detik ada keadaan baru. Detektor menghitungnya sebagai "tidak ada event" karena tiap perubahan kecil, padahal di situlah energinya.
Di Video 11, figur tangga pada 12-16 s identik di 5 frame berturut-turut. Satu-satunya yang berubah adalah caption.

### 3. Hook: Raymond langsung visual, kita 12 detik wajah saja
Raymond pada 0-2 s: tiga frase besar ("kita cetak sejarah", "salah satu hari paling gelap", "pasar modal Indonesia"), dengan campuran sans tebal, serif italic, dan aksen kuning. Pada 3,07 s sudah masuk bukti pertama.
Video 11: 0-12 s hanya wajah dengan caption kecil. Kata kunci memang diberi italic, tapi ukurannya masih seukuran caption.

### 4. Frame Raymond selalu penuh, frame kita kosong
Raymond meletakkan gambar di pita tengah, lalu memakai salinan gambar yang sama, diperbesar dan di-blur, sebagai latar. Di belakangnya ada teks raksasa yang di-blur ("upaya ada", "publik yang tetap si owner", "tapi gak ada"). Tidak ada area mati.
Video 11: objek clay kecil di tengah, dan sekitar 70% layar berisi krem polos (lihat 12 s, 27 s, 47 s). Ini cocok dengan pola "objek kecil dengan ruang tanpa fungsi" yang kamu sebut slop.

### 5. Penekanan Raymond ada di dalam grafik, penekanan kita hanya di caption
Raymond memberi marker kuning pada kalimat dokumen (104-106 s), lingkaran merah (107 s), stempel "KANKER" miring (108 s), dan push-in ke teks dokumen yang dimiringkan. Penekanan menjadi kejadian visual.
Video 11: penekanan hanya berupa satu kata italic di baris caption.

### 6. Raymond konsisten gelap, kita bolak-balik gelap ke krem
Seluruh grafik Raymond memakai latar gelap yang menyatu dengan footage: hitam, merah, kuning, putih. Video 11 melompat dari footage studio hitam ke panel krem terang di setiap cutaway. Lompatan luminance ini membuat cutaway terasa seperti slide yang ditempel, bukan bagian dari dunia video.

## Batas perbandingan ini

- **Isi kontennya beda jenis.** Raymond membahas berita keuangan yang kaya bukti (dokumen, data, foto). Goggins adalah monolog emosional yang tidak punya "bukti" untuk ditampilkan. Poin 1 tidak bisa disalin mentah. Padanannya untuk Sprout adalah layar aplikasi Sprout asli, pesan orang tua, catatan sekolah, atau data nyata, bukan objek clay.
- **SFX belum dianalisis.** Detektor audio terbukti tidak andal di mix final (0/5 di Video 11). Untuk mengukurnya perlu Demucs.
- **Nick Saraev belum masuk.** Gaya Nick lebih dekat ke monolog satu orang, jadi kemungkinan lebih relevan untuk konten seperti Video 11.

## Yang bisa diadopsi tanpa melanggar brand Sprout

1. **Cutaway pertama paling lambat di detik 3**, dan hook memakai tipografi display besar, bukan caption.
2. **Satu diagram per gagasan yang bertambah setiap kalimat**, bukan gambar baru per kalimat. Contoh di Video 11 (27-38 s): satu jalur yang dibangun bertahap, yaitu sepatu, lalu langkah pertama, lalu jalur memanjang, lalu checklist courage/heart/dedication/mindset menempel di jalur yang sama.
3. **Frame penuh**: latar memakai versi blur dari visual utama atau tipografi raksasa, bukan krem polos.
4. **Penekanan di dalam grafik**: marker hijau Sprout di atas teks, lingkaran, dan stempel, dengan timing sesuai kata.
5. **Cutaway mengikuti luminance footage.** Di atas footage gelap, panel tidak melompat ke krem penuh.
