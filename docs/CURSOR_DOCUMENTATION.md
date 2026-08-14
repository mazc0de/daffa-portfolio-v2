# 🔴 Dokumentasi & Panduan Implementasi: Bauhaus Custom Cursor

Dokumentasi ini menjelaskan arsitektur, kode lengkap (HTML, CSS, JavaScript), serta cara mengintegrasikan sistem **Custom Bauhaus Cursor** ke dalam aplikasi web lain (Vanilla JS, React / Next.js, Vue, dsb.).

---

## 📌 Daftar Isi
1. [Konsep & Arsitektur](#-konsep--arsitektur)
2. [Fitur Utama & Keunggulan](#-fitur-utama--keunggulan)
3. [Implementasi Lengkap (Vanilla JS)](#-implementasi-lengkap-vanilla-js)
   - [HTML](#1-struktur-html)
   - [CSS](#2-styling-css)
   - [JavaScript](#3-logika-javascript)
4. [Versi Lebih Lanjut: Smooth Lerp / Trailing Ring](#-versi-lebih-lanjut-smooth-lerp--trailing-ring)
5. [Integrasi ke Framework](#-integrasi-ke-framework)
   - [React / Next.js](#a-react--nextjs-component)
   - [Vue 3 (Composition API)](#b-vue-3-component)
6. [Best Practices & Penanganan Edge Cases](#-best-practices--penanganan-edge-cases)

---

## 🎯 Konsep & Arsitektur

Cursor ini mengadopsi prinsip **Binary Modernism** dari Bauhaus:
1. **Titik Tengah (*Dot*)**: Lingkaran merah pekat (`#D02020`) dengan border hitam tajam (`#121212`) yang menempel presisi di koordinat kursor mouse.
2. **Cincin Luar (*Target Ring*)**: Cincin pembidik geometris (`32px` default) yang membesar (`48px`), berganti warna border (`#1040C0`), dan memancarkan aksen kuning transparan saat pengguna mengarahkan kursor ke elemen interaktif (*hover state*).
3. **Touch-Safe**: Hanya aktif pada perangkat dengan mouse presisi (`@media (pointer: fine)`), sehingga aman dan tidak merusak UX di perangkat layar sentuh (mobile/tablet).

```
                 ┌───────────────┐
                 │  Target Ring  │  (32px -> 48px on hover)
                 │   (9999px)    │
                 │      🔴       │  <- Center Dot (10px)
                 │  (Exact XY)   │
                 └───────────────┘
```

---

## ✨ Fitur Utama & Keunggulan

- **Zero-Lag & Hardware Accelerated**: Menggunakan `transform: translate3d(...)` dan `pointer-events: none` untuk mencegah layout reflow dan pemblokiran klik.
- **Deteksi Hover Otomatis**: Mendeteksi elemen interaktif (`<a>`, `<button>`, `input`, card, dsb.).
- **Safe Viewport Handling**: Kursor otomatis disembunyikan saat mouse meninggalkan jendela browser (*mouseleave*).
- **A11y & Touch Compliant**: Otomatis nonaktif pada perangkat sentuh (iOS, Android, touch screens).

---

## 💻 Implementasi Lengkap (Vanilla JS)

### 1. Struktur HTML
Letakkan elemen cursor di dalam tag `<body>`, idealnya tepat sebelum penutup `</body>` atau di bagian paling atas:

```html
<!-- Custom Bauhaus Cursor Element -->
<div class="bauhaus-cursor" id="bauhausCursor" aria-hidden="true">
  <div class="cursor-dot"></div>
  <div class="cursor-ring"></div>
</div>
```

---

### 2. Styling CSS

Tambahkan aturan CSS berikut ke file stylesheet Anda:

```css
/* ==========================================================================
   BAUHAUS CUSTOM CURSOR STYLES
   ========================================================================== */

/* Pastikan cursor hanya muncul pada perangkat pointer presisi (Mouse/Trackpad) */
@media (pointer: fine) {
  /* Opsional: Sembunyikan default cursor jika diinginkan */
  /* body { cursor: default; } */

  .bauhaus-cursor {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none; /* KRUSIAL: Agar klik tetap tembus ke elemen di bawahnya */
    z-index: 99999;       /* Pastikan berada di atas semua layer */
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.2s ease;
    will-change: transform, left, top;
  }

  /* Munculkan kursor saat JS aktif dan mouse bergerak */
  .bauhaus-cursor.active {
    opacity: 1;
  }

  /* Titik Pusat Kursor (Dot) */
  .cursor-dot {
    width: 10px;
    height: 10px;
    background-color: #D02020; /* Bauhaus Primary Red */
    border: 2px solid #121212;  /* Bauhaus Ink */
    border-radius: 9999px;      /* Strict Binary Radius */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease, background-color 0.15s ease;
  }

  /* Cincin Pembidik Luar (Ring) */
  .cursor-ring {
    width: 32px;
    height: 32px;
    border: 2px solid #121212;
    border-radius: 9999px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                height 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
                border-color 0.2s ease,
                background-color 0.2s ease;
  }

  /* ==========================================================================
     HOVER STATE (Ketika mengarahkan mouse ke elemen interaktif)
     ========================================================================== */
  .bauhaus-cursor.hovering .cursor-ring {
    width: 50px;
    height: 50px;
    border-color: #1040C0; /* Bauhaus Primary Blue */
    background-color: rgba(240, 192, 32, 0.25); /* Bauhaus Yellow Tint */
  }

  .bauhaus-cursor.hovering .cursor-dot {
    transform: translate(-50%, -50%) scale(1.3);
    background-color: #F0C020; /* Bauhaus Primary Yellow */
  }

  /* ==========================================================================
     ACTIVE / CLICK STATE (Efek tekan saat tombol mouse ditekan)
     ========================================================================== */
  .bauhaus-cursor.clicking .cursor-ring {
    transform: translate(-50%, -50%) scale(0.85);
  }

  .bauhaus-cursor.clicking .cursor-dot {
    transform: translate(-50%, -50%) scale(0.7);
  }
}
```

---

### 3. Logika JavaScript

Gunakan script ini untuk menangani pergerakan kursor, event delegasi untuk hover, dan status klik:

```javascript
/**
 * Bauhaus Custom Cursor Controller
 */
function initBauhausCursor() {
  const cursor = document.getElementById('bauhausCursor');
  
  // Periksa apakah perangkat memiliki pointer presisi (bukan touch screen murni)
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  let mouseX = 0;
  let mouseY = 0;

  // 1. Pelacakan Posisi Mouse
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    if (!cursor.classList.contains('active')) {
      cursor.classList.add('active');
    }
  }, { passive: true });

  // 2. Event Delegation untuk Elemen Interaktif (Hover)
  const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], [tabindex="0"], .interactive';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('hovering');
    }
  });

  // 3. Efek Klik / Mousedown
  window.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  window.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

  // 4. Sembunyikan jika kursor keluar dari jendela browser
  document.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  document.addEventListener('mouseenter', () => cursor.classList.add('active'));
}

// Jalankan saat DOM sudah siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBauhausCursor);
} else {
  initBauhausCursor();
}
```

---

## 🚀 Versi Lebih Lanjut: Smooth Lerp / Trailing Ring

Jika Anda menginginkan efek cincin luar yang **mengikuti secara mulus (smooth delayed trailing)** sedangkan titik tengah tetap terkunci presisi di ujung kursor mouse:

```javascript
/**
 * Advanced Lerp Trailing Bauhaus Cursor
 */
function initLerpBauhausCursor() {
  const cursor = document.getElementById('bauhausCursor');
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      ringX = mouseX;
      ringY = mouseY;
      cursor.classList.add('active');
    }

    // Dot langsung menempel presisi di posisi mouse
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  // Animasi Loop Lerp (Linear Interpolation) untuk Cincin Luar
  function animate() {
    if (isVisible) {
      // Faktor lerp 0.18 menghasilkan pergerakan fluida yang pas
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animate);
  }

  animate();

  // Hover detection menggunakan event delegation
  const interactiveQuery = 'a, button, input, select, textarea, [role="button"], label, .interactive-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveQuery)) cursor.classList.add('hovering');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveQuery)) cursor.classList.remove('hovering');
  });

  window.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  window.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
}
```

---

## ⚛️ Integrasi ke Framework

### A. React / Next.js Component

Buat file komponen `BauhausCursor.tsx` (atau `.jsx`):

```tsx
import React, { useEffect, useRef, useState } from 'react';

export const BauhausCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    setIsFinePointer(media.matches);

    if (!media.matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active');
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea, [role="button"]')) {
        cursor.classList.add('hovering');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea, [role="button"]')) {
        cursor.classList.remove('hovering');
      }
    };

    const handleMouseDown = () => cursor.classList.add('clicking');
    const handleMouseUp = () => cursor.classList.remove('clicking');
    const handleMouseLeave = () => cursor.classList.remove('active');
    const handleMouseEnter = () => cursor.classList.add('active');

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (!isFinePointer) return null;

  return (
    <div ref={cursorRef} className="bauhaus-cursor" aria-hidden="true">
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </div>
  );
};
```

---

### B. Vue 3 Component

`BauhausCursor.vue`:

```vue
<template>
  <div 
    v-if="isFinePointer" 
    ref="cursorEl" 
    class="bauhaus-cursor" 
    aria-hidden="true"
  >
    <div class="cursor-dot"></div>
    <div class="cursor-ring"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cursorEl = ref(null);
const isFinePointer = ref(false);

onMounted(() => {
  const media = window.matchMedia('(pointer: fine)');
  isFinePointer.value = media.matches;
  if (!media.matches) return;

  const cursor = cursorEl.value;

  const onMouseMove = (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.classList.add('active');
  };

  const onMouseOver = (e) => {
    if (e.target.closest('a, button, input, select, textarea, [role="button"]')) {
      cursor.classList.add('hovering');
    }
  };

  const onMouseOut = (e) => {
    if (e.target.closest('a, button, input, select, textarea, [role="button"]')) {
      cursor.classList.remove('hovering');
    }
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
  });
});
</script>
```

---

## 🛡️ Best Practices & Penanganan Edge Cases

1. **`pointer-events: none` Adalah Wajib**:
   Jangan pernah menghapus `pointer-events: none;` dari container kursor. Jika terhapus, elemen di bawah kursor tidak akan bisa diklik atau di-hover oleh pengguna.
2. **Gunakan Event Delegation (`mouseover` / `mouseout`)**:
   Alih-alih menambahkan event listener satu per satu ke setiap elemen (`querySelectorAll().forEach(...)`), gunakan `document.addEventListener('mouseover', ...)` dengan `e.target.closest()`. Cara ini otomatis mendukung elemen dinamis yang di-render setelah halaman dimuat (seperti data dari API / modal).
3. **Gunakan Media Query `(pointer: fine)`**:
   Memastikan kursor hanya aktif pada mouse/trackpad desktop, mencegah bug kursor tertinggal di layar sentuh HP.
4. **Optimasi Performa GPU**:
   Gunakan `will-change: transform` atau `transform: translate3d(...)` untuk memastikan browser menggunakan akselerasi GPU (Compositor Thread).
