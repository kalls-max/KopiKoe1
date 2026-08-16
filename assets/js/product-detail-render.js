document.addEventListener('DOMContentLoaded', () => {
  renderProductDetail();
  initTabSystem();
});

function getJsonPath() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

function renderProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'kopi-01';

  fetch(getJsonPath())
    .then(res => {
      if (!res.ok) throw new Error("Gagal mengambil data product.json");
      return res.json();
    })
    .then(products => {
      const product = products.find(p => p.id === productId) || products[0];
      if (!product) return;

      // Update Teks Dasar
      const pageTitle = document.getElementById('pageTitle');
      const nameElem = document.getElementById('productName');
      const eyebrowElem = document.getElementById('productEyebrow');
      const priceElem = document.getElementById('productPrice');
      const taglineElem = document.getElementById('productTagline');
      const descElem = document.getElementById('productDescription');
      const skuElem = document.getElementById('productSku');
      const catElem = document.getElementById('productCategory');
      const mainImgElem = document.getElementById('mainProductImage');

      if (pageTitle) pageTitle.textContent = `${product.name} | KopiKOE`;
      if (nameElem) nameElem.textContent = product.name;
      if (eyebrowElem) eyebrowElem.textContent = product.eyebrow || 'Specialty Coffee';
      if (priceElem) priceElem.textContent = product.priceRange || `Rp ${product.price.toLocaleString('id-ID')}`;
      if (taglineElem) taglineElem.textContent = product.tagline || '';
      if (descElem) descElem.textContent = product.description;
      if (skuElem) skuElem.textContent = product.sku || '-';
      if (catElem) catElem.textContent = product.category || '-';

      // Update Gambar Utama
      if (mainImgElem && product.images && product.images.length > 0) {
        mainImgElem.src = product.images[0];
        mainImgElem.alt = product.name;
      }

      // Render Thumbnail Gambar
      const thumbRow = document.getElementById('thumbnailRow');
      if (thumbRow && product.images) {
        thumbRow.innerHTML = product.images.map((imgSrc, index) => `
          <div class="thumb-frame ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${imgSrc}', this)">
            <img src="${imgSrc}" alt="Thumbnail ${index + 1}">
          </div>
        `).join('');
      }

      // Render Option Select Ukuran
      const sizeSelect = document.getElementById('ukuranSize');
      if (sizeSelect && product.sizes) {
        sizeSelect.innerHTML = '<option value="">Pilih ukuran</option>' + 
          product.sizes.map(size => `
            <option value="${size.price}" data-label="${size.label}">${size.label} - Rp ${size.price.toLocaleString('id-ID')}</option>
          `).join('');
      }

      // Render Spesifikasi
      const specsList = document.getElementById('productSpecs');
      if (specsList && product.specs) {
        specsList.innerHTML = `
          <li><span>Jenis:</span> ${product.specs.jenis || '-'}</li>
          <li><span>Origin:</span> ${product.specs.origin || '-'}</li>
          <li><span>Roast:</span> ${product.specs.roast || '-'}</li>
          <li><span>Proses:</span> ${product.specs.process || '-'}</li>
          <li><span>Flavor:</span> ${product.specs.flavor || '-'}</li>
        `;
      }

      // Render Produk Lainnya
      const relatedWrapper = document.getElementById('relatedProducts');
      if (relatedWrapper) {
        const related = products.filter(p => p.id !== product.id).slice(0, 3);
        relatedWrapper.innerHTML = related.map(rel => `
          <div class="related-card">
            <a href="deskripsi-produk.html?id=${rel.id}">
              <img src="${rel.images[0]}" alt="${rel.name}">
              <div class="related-body">
                <h4>${rel.name}</h4>
                <p class="related-price">${rel.priceRange}</p>
              </div>
            </a>
          </div>
        `).join('');
      }

      // Fungsionalitas Tombol Tambah ke Keranjang
      const addBtn = document.getElementById('addToCartBtn');
      if (addBtn) {
        addBtn.onclick = () => {
          const selectedSizeOption = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex] : null;
          const sizePrice = sizeSelect && sizeSelect.value ? parseInt(sizeSelect.value, 10) : product.price;
          const sizeLabel = selectedSizeOption && selectedSizeOption.getAttribute('data-label') ? ` (${selectedSizeOption.getAttribute('data-label')})` : '';
          
          const itemName = `${product.name}${sizeLabel}`;

          if (typeof addToCart === 'function') {
            addToCart(itemName, sizePrice, 1);
          } else {
            alert(`Berhasil menambahkan ${itemName} ke keranjang!`);
          }
        };
      }

      // Fungsionalitas Tombol Beli Sekarang
      const buyNowBtn = document.getElementById('buyNowBtn');
      if (buyNowBtn) {
        buyNowBtn.onclick = () => {
          const sizePrice = sizeSelect && sizeSelect.value ? parseInt(sizeSelect.value, 10) : product.price;
          const selectedSizeOption = sizeSelect ? sizeSelect.options[sizeSelect.selectedIndex] : null;
          const sizeLabel = selectedSizeOption && selectedSizeOption.getAttribute('data-label') ? ` (${selectedSizeOption.getAttribute('data-label')})` : '';
          const itemName = `${product.name}${sizeLabel}`;

          if (typeof addToCart === 'function') {
            addToCart(itemName, sizePrice, 1);
            window.location.href = 'payment.html';
          }
        };
      }

      // Share WhatsApp Button
      const shareWaBtn = document.getElementById('shareWaBtn');
      if (shareWaBtn) {
        const textShare = encodeURIComponent(`Cek kopi nikmat ${product.name} di KopiKOE! ${window.location.href}`);
        shareWaBtn.href = `https://wa.me/?text=${textShare}`;
      }
    })
    .catch(err => console.error("Gagal memuat detail produk:", err));
}

function changeMainImage(src, thumbElem) {
  const mainImg = document.getElementById('mainProductImage');
  if (mainImg) mainImg.src = src;

  document.querySelectorAll('.thumb-frame').forEach(t => t.classList.remove('active'));
  if (thumbElem) thumbElem.classList.add('active');
}

function initTabSystem() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
}