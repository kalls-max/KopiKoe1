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
      if (taglineElem) taglineElem.textContent = product.tagline || '';
      if (descElem) descElem.textContent = product.description;
      if (skuElem) skuElem.textContent = product.sku || '-';
      if (catElem) catElem.textContent = product.category || '-';

      //harga awal
      if (priceElem) {
        priceElem.textContent = product.priceRange || `Rp ${product.price.toLocaleString('id-ID')}`;
      }

      // Update Gambar 
      if (mainImgElem && product.images && product.images.length > 0) {
        mainImgElem.src = product.images[0];
        mainImgElem.alt = product.name;
      }

      // Render gamabr tamnail
      const thumbRow = document.getElementById('thumbnailRow');
      if (thumbRow && product.images) {
        thumbRow.innerHTML = product.images.map((imgSrc, index) => `
          <div class="thumb-frame ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${imgSrc}', this)">
            <img src="${imgSrc}" alt="Thumbnail ${index + 1}">
          </div>
        `).join('');
      }

      // fitur favorit
      initWishlistFeature(product);

      //  render ganti harga
      const sizeSelect = document.getElementById('ukuranSize');
      if (sizeSelect && product.sizes) {
        sizeSelect.innerHTML = '<option value="">Pilih ukuran</option>' + 
          product.sizes.map(size => `
            <option value="${size.price}" data-label="${size.label}">${size.label}</option>
          `).join('');

        sizeSelect.addEventListener('change', (e) => {
          if (e.target.value) {
            const selectedPrice = parseInt(e.target.value, 10);
            priceElem.textContent = `Rp ${selectedPrice.toLocaleString('id-ID')}`;
          } else {
            priceElem.textContent = product.priceRange;
          }
        });
      }

      // buat spesifikasi
      const specsList = document.getElementById('productSpecs');
      if (specsList && product.specs) {
        specsList.innerHTML = `
          <li><span>Jenis:</span> ${product.specs.jenis || '-'}</li>
          <li><span>Origin:</span> ${product.specs.origin || '-'}</li>
          <li><span>Roast:</span> ${product.specs.roast || '-'}</li>
          <li><span>Proses:</span> ${product.specs.process || '-'}</li>
          <li><span>Flavor:</span> ${product.specs.flavor || '-'}</li>
          <li><span>Spesies:</span> ${product.encyclopedia ? product.encyclopedia.species : '-'}</li>
        `;
      }

      // Render sisisanya
      const relatedWrapper = document.getElementById('relatedProducts');
      if (relatedWrapper) {
        const related = products.filter(p => p.id !== product.id).slice(0, 4);
        relatedWrapper.innerHTML = related.map(rel => `
          <div class="related-card">
            <a href="deskripsi-produk.html?id=${rel.id}">
              <img src="${rel.images[0]}" alt="${rel.name}">
              <div class="related-body">
                <h4>${rel.name.split(' — ')[0]}</h4>
                <p class="related-price">Mulai Rp ${rel.price.toLocaleString('id-ID')}</p>
              </div>
            </a>
          </div>
        `).join('');
      }

      // namaabh tombol tambah
      const addBtn = document.getElementById('addToCartBtn');
      const grindSelect = document.getElementById('grindSize');
      
      if (addBtn) {
        addBtn.onclick = () => {
          if (!sizeSelect.value) {
            showCenterPopup("Ups, Tunggu Dulu!", "Harap pilih ukuran kopi terlebih dahulu sebelum memasukkan ke keranjang.", "warning");
            return;
          }

          const sizePrice = parseInt(sizeSelect.value, 10);
          const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
          const sizeLabel = selectedSizeOption.getAttribute('data-label');
          const grindLabel = grindSelect && grindSelect.value ? grindSelect.options[grindSelect.selectedIndex].textContent : 'Biji Utuh';
          const variant = `${sizeLabel} · ${grindLabel}`;

          if (typeof addToCart === 'function') {
            addToCart(product.name, sizePrice, 1, variant);
          }
        };
      }

      // buat tombol beli sekarang
      const buyNowBtn = document.getElementById('buyNowBtn');
      if (buyNowBtn) {
        buyNowBtn.onclick = () => {
          if (!sizeSelect.value) {
            showCenterPopup("Ups, Tunggu Dulu!", "Harap pilih ukuran kopi terlebih dahulu sebelum melakukan pembelian.", "warning");
            return;
          }

          const sizePrice = parseInt(sizeSelect.value, 10);
          const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
          const sizeLabel = selectedSizeOption.getAttribute('data-label');
          const grindLabel = grindSelect && grindSelect.value ? grindSelect.options[grindSelect.selectedIndex].textContent : 'Biji Utuh';
          const variant = `${sizeLabel} · ${grindLabel}`;

          const directCheckoutItem = [{
            name: product.name,
            price: sizePrice,
            qty: 1,
            variant: variant
          }];

          localStorage.setItem('kopikoe_direct_checkout', JSON.stringify(directCheckoutItem));
          localStorage.setItem('is_direct_checkout', 'true');

          window.location.href = 'payment.html';
        };
      }

      // buat wa
      const shareWaBtn = document.getElementById('shareWaBtn');
      if (shareWaBtn) {
        const textShare = encodeURIComponent(`Cek kopi nikmat ${product.name} di KopiKOE! ${window.location.href}`);
        shareWaBtn.href = `https://wa.me/?text=${textShare}`;
      }
    })
    .catch(err => console.error("Gagal memuat detail produk:", err));
}

// logika bintang fav
function initWishlistFeature(product) {
  const wishlistBtn = document.getElementById('wishlistBtn');
  if (!wishlistBtn) return;

  let wishlist = JSON.parse(localStorage.getItem('kopikoe_wishlist')) || [];
  
  const isWishlisted = wishlist.some(item => item.id === product.id);
  if (isWishlisted) {
    wishlistBtn.classList.add('active');
  }

  wishlistBtn.addEventListener('click', () => {
    let currentWishlist = JSON.parse(localStorage.getItem('kopikoe_wishlist')) || [];
    const index = currentWishlist.findIndex(item => item.id === product.id);

    if (index > -1) {
      currentWishlist.splice(index, 1);
      wishlistBtn.classList.remove('active');
      if (typeof showToast === 'function') {
        showToast('Dihapus dari daftar favorit.', 'error');
      }
    } else {
      currentWishlist.push({
        id: product.id,
        name: product.name,
        price: product.priceRange || product.price,
        image: product.images && product.images[0] ? product.images[0] : ''
      });
      wishlistBtn.classList.add('active');
      if (typeof showToast === 'function') {
        showToast('Berhasil! Ditambahkan ke favorit ⭐', 'success');
      }
    }

    localStorage.setItem('kopikoe_wishlist', JSON.stringify(currentWishlist));
  });
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