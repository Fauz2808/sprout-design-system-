# Arsip — generasi pertama Room Parent

Diarsipkan 17 September 2026. Tidak dihapus karena file-file ini **untracked** di
git: kalau dibuang, hilang selamanya.

## `portal-v1/`

| File | Apa ini | Digantikan oleh |
|---|---|---|
| `room-parent-portal.html` | prototipe portal generasi pertama, 2 Sep, 3.225 baris | `room-parent-portal-redesign/index.html` |
| `room-parent-portal-dir/index.html` | salinan deploy dari file yang sama, 1 Sep — bedanya cuma satu blok preview iframe | idem |
| `roomparent-com-landing.html` | landing page pass pertama | `roomparent-com-landing-v2.html` |
| `CODEX-PROMPT-roomparent-landing.md` | prompt yang dipakai untuk membuat landing v1 | — (sudah terpakai) |

Prompt itu ikut ke sini karena dia satu paket dengan v1, dan karena isinya
menunjuk ke dua file di atas sebagai "the actual product". Mengedit isinya agar
menunjuk ke file baru akan memalsukan catatan: prompt ini dijalankan terhadap
versi lama, bukan versi sekarang.

## Kenapa generasi kedua tidak disebut "redesign flow"

Yang digambar ulang adalah layarnya, bukan alurnya. Sidebar 7 → 8 item, Users →
Parents, Sign-Ups masuk ke dalam Links, dua section baru (Consent Forms, Room
Parent To-Do), dashboard dibangun ulang dengan Quick actions dan kartu To-Do,
plus shell mobile yang di v1 tidak ada sama sekali. Layar sign-in sendiri praktis
tidak berubah — headline, sub, placeholder, dan tombolnya identik.
