/* Dipasang di <head> agar tema tersimpan langsung diterapkan sebelum halaman tampil. Default: terang. */
document.documentElement.classList.add('js');
try {
  if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
} catch (e) { /* localStorage bisa diblokir; abaikan */ }
