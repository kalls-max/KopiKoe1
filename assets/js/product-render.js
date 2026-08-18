document.addEventListener('DOMContentLoaded', () => {
  renderKopinyaSection();
  renderShopSection();
});

// Fungsi untuk mendeteksi jalur file JSON yang benar secara otomatis
function getJsonPath() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

// Render 2 produk Best Seller di Beranda (index.html)
function renderKopinyaSection() {
  const container = document.getElementById('kopinyaContainer');
  if (!container) return;

  fetch(getJsonPath())
    .then(res => {
      if (!res.ok) throw new Error("Gagal mengambil data product.json");
      return res.json();
    })
    .then(products => {
      const featured = products.slice(0, 2);
      container.innerHTML = featured.map(product => `
        <div class="kopi-card">
          <a href="deskripsi-produk.html?id=${product.id}" class="product-link">
            <img src="${product.images[0]}" alt="${product.name}" class="card-img-real">
            <h3>${product.name}</h3>
          </a>
        </div>
      `).join('');
    })
    .catch(err => console.error("Gagal memuat produk beranda:", err));
}

// Render Katalog di Toko (shop.html)
function renderShopSection() {
  const gridContainer = document.getElementById('productGrid');
  if (!gridContainer) return;

  fetch(getJsonPath())
    .then(res => {
      if (!res.ok) throw new Error("Gagal mengambil data product.json");
      return res.json();
    })
    .then(products => {
      gridContainer.innerHTML = products.map(product => `
        <a href="deskripsi-produk.html?id=${product.id}" class="shop-product-card" data-name="${product.name.toLowerCase()}">
          <div class="shop-product-img">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
          </div>
          <div class="shop-product-info">
            <h3>${product.name}</h3>
            <p class="shop-product-price">Mulai dari Rp${product.price.toLocaleString('id-ID')}</p>
          </div>
        </a>
      `).join('');
    })
    .catch(err => console.error("Gagal memuat produk toko:", err));
}