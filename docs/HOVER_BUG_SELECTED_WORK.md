# Technical Documentation: Hover Bug pada "Selected Work" Cards

## Deskripsi Masalah (Symptom)
Terdapat *bug* interaksi di mana *card* pada bagian "Selected Work" (terutama Card No 1 dan 2, seperti `tiketkapal.com` dan `kos ibu ami petarukan`) sering kali **tidak mendeteksi pointer/kursor (tidak bisa di-hover/klik)**, meskipun elemen tersebut terlihat secara visual berada di bagian paling depan. Masalah ini terkadang muncul-hilang tergantung pada posisi *scroll* pengguna.

## Penyebab Utama (Root Cause)
Akar masalahnya berasal dari interaksi *buggy* pada *browser engine* (khususnya WebKit di Safari dan Chromium di Chrome) saat kita menggabungkan **3D Transform (Perspective)** dengan **Stacking Context tambahan (Z-Index)**.

Secara teknis:
1. **Global 3D Perspective**: Aplikasi menggunakan animasi *parallax* 3D di `page.tsx`, di mana kontainer utama (`tilted-plane`) diberikan gaya `transform: rotateX(12deg) rotateY(-8deg) rotateZ(1deg)` (berubah berdasarkan posisi *scroll*).
2. **Titik Terjauh (Negative Z-Axis)**: Akibat dari rotasi X positif (`12deg`) dan Y negatif (`-8deg`), sudut **kiri atas** dari website (lokasi jatuhnya Card 1 dan Card 2 pada Grid) secara matematis terdorong paling jauh ke "dalam layar" (memiliki *negative Z depth* yang besar) pada ruang 3D.
3. **Konflik Stacking Context**: Sebelumnya, elemen `grid` pembungkus *cards* memiliki class **`relative z-50`**. Penambahan `z-index` ini memaksa *browser* untuk memisahkan *grid* ke dalam *stacking context* / *compositing layer* tersendiri.
4. **Hit-Testing Failure**: Ketika *browser* mencoba melakukan *hit-testing* (mengkalkulasi apakah kursor mouse sedang berada di atas elemen), *browser* mengalami miskalkulasi karena *compositing layer* dari `z-50` bersinggungan secara matematis dengan *layer* *background* atau *body* pada area *negative Z* yang dalam. Ini membuat area kursor seolah-olah "menembus" dan mengenai elemen di belakangnya, menyebabkan *pointer events* tidak terpanggil.

## Cara Penyelesaian (The Fix)
Jika *bug* ini kembali terjadi akibat perubahan *layout* atau penambahan *class* baru, langkah penyelesaian utamanya adalah **mencegah terbentuknya *stacking context* yang tidak perlu** di dalam elemen yang terkena rotasi 3D (`tilted-plane`).

### Langkah-langkah Perbaikan:
1. Buka file `src/app/page.tsx`.
2. Cari bagian grid container untuk "Selected Work" (berada di bawah judul *section*).
3. Pastikan container **TIDAK memiliki** class `z-index` tinggi yang berdiri sendiri, seperti `z-50`. 
4. Jika terdapat class `relative z-50`, hapus bagian tersebut agar komposisi bidang menyatu (*flat* / *inherit*) dengan *parent*-nya.

**Contoh Kode (Yang Salah):**
```tsx
{/* ❌ JANGAN gunakan 'relative z-50' pada grid ini jika berada di dalam tilted-plane */}
<div className='relative z-50 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
  {projectsData.map(...)}
</div>
```

**Contoh Kode (Yang Benar):**
```tsx
{/* ✅ Biarkan mengalir secara alami tanpa z-index */}
<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
  {projectsData.map(...)}
</div>
```

## Checklist Pencegahan di Masa Depan
Jika harus menambahkan fitur yang membutuhkan *overlapping* (seperti *dropdown* atau *modal*) di dalam ruang 3D:
- Selalu uji (*test*) dengan melakukan interaksi *hover* saat halaman di-scroll ke titik paling atas dan ke tengah.
- Jika elemen terpaksa membutuhkan `z-index` (seperti Modal), lebih baik letakkan elemen modal tersebut di **luar** dari kontainer `tilted-plane` atau di struktur terbawah (sejajar dengan level `<main>`), sehingga tidak terpengaruh oleh matriks rotasi 3D.
