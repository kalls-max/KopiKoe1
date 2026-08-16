// --- DATA KERANJANG ---
let cart = JSON.parse(localStorage.getItem('kopikoe_cart')) || [];

function saveCart() {
  localStorage.setItem('kopikoe_cart', JSON.stringify(cart));
  renderDrawerCart();
}

// --- FUNGSI TAMBAH BARANG (Tambahin onclick ini di tombol produk lu) ---
function addToCart(name, price) {
  const existingIndex = cart.findIndex(item => item.name === name);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart();
  
  // Otomatis buka drawer pas barang ditambah
  document.getElementById('side-cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('show');
}

// --- FUNGSI HAPUS BARANG ---
function removeDrawerItem(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
}

// --- FUNGSI RENDER TAMPILAN DI DRAWER ---
function renderDrawerCart() {
  const drawerItemsContainer = document.getElementById('drawer-cart-items');
  const drawerCount = document.getElementById('drawer-cart-count');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const navbarBadge = document.getElementById('cartBadge'); // Badge di floating bar lu

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Update angka
  if (drawerCount) drawerCount.innerText = totalQty;
  if (navbarBadge) navbarBadge.innerText = totalQty;
  if (drawerSubtotal) drawerSubtotal.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  // Render HTML list barang
  if (cart.length === 0) {
    drawerItemsContainer.innerHTML = '<p style="color:#777; text-align:center; margin-top:20px;">Keranjang masih kosong.</p>';
  } else {
    drawerItemsContainer.innerHTML = cart.map(item => `
      <div class="drawer-item">
        <div class="drawer-item-info">
          <p class="drawer-item-name">${item.name}</p>
          <p class="drawer-item-meta">Qty: ${item.qty}</p>
          <p class="drawer-item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</p>
        </div>
        <div>
          <button class="drawer-item-remove" onclick="removeDrawerItem('${item.name}')">Remove</button>
        </div>
      </div>
    `).join('');
  }
}

// --- GALERI THUMBNAIL: klik thumbnail -> ganti gambar utama ---
function initProductGallery() {
  const mainImage = document.getElementById('mainProductImage');
  const thumbs = document.querySelectorAll('.thumb');
  if (!mainImage || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const newSrc = thumb.dataset.img;
      if (!newSrc) return;
      mainImage.style.opacity = 0;
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.opacity = 1;
      }, 120);
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

// --- PILIH UKURAN: update harga yang ditampilkan sesuai varian ---
function initSizeSelector() {
  const ukuranSelect = document.getElementById('ukuranSize');
  const priceDisplay = document.getElementById('productPrice');
  if (!ukuranSelect || !priceDisplay) return;

  const rangeText = priceDisplay.dataset.range || priceDisplay.textContent;

  ukuranSelect.addEventListener('change', () => {
    const option = ukuranSelect.options[ukuranSelect.selectedIndex];
    const price = option.dataset.price;
    if (price) {
      priceDisplay.textContent = `Rp${parseInt(price, 10).toLocaleString('id-ID')}`;
    } else {
      priceDisplay.textContent = rangeText;
    }
  });
}

// --- TABS: Deskripsi / Informasi Tambahan ---
function initProductTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = 'tab-' + btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
}

// --- Ambil nama + harga final berdasarkan pilihan Ukuran & Varian Giling ---
function getSelectedProductVariant(baseName) {
  const ukuranSelect = document.getElementById('ukuranSize');
  const grindSelect = document.getElementById('grindSize');

  const ukuranOption = ukuranSelect ? ukuranSelect.options[ukuranSelect.selectedIndex] : null;
  const price = ukuranOption && ukuranOption.dataset.price ? parseInt(ukuranOption.dataset.price, 10) : NaN;
  const ukuranLabel = ukuranOption && ukuranOption.dataset.price ? ukuranOption.textContent.split('—')[0].trim() : '';
  const grindLabel = grindSelect && grindSelect.value ? grindSelect.options[grindSelect.selectedIndex].text : '';

  const variantParts = [ukuranLabel, grindLabel].filter(Boolean);
  const fullName = variantParts.length ? `${baseName} (${variantParts.join(', ')})` : baseName;

  return { fullName, price };
}

// --- FUNGSI TOMBOL "TAMBAH KE KERANJANG" & "BELI SEKARANG" DI HALAMAN DETAIL PRODUK ---
// Cukup kasih atribut data-name di button#addToCartBtn / #buyNowBtn,
// lalu harga diambil dari opsi Ukuran yang dipilih (data-price di setiap <option>).
function initPurchaseButtons() {
  const addToCartBtn = document.getElementById('addToCartBtn');
  const buyNowBtn = document.getElementById('buyNowBtn');
  const ukuranSelect = document.getElementById('ukuranSize');

  function handlePurchase(btn, { redirect }) {
    const baseName = btn.dataset.name;
    if (!baseName) {
      console.warn('Tombol butuh atribut data-name.');
      return;
    }

    const { fullName, price } = getSelectedProductVariant(baseName);

    if (Number.isNaN(price)) {
      if (ukuranSelect) {
        ukuranSelect.reportValidity ? ukuranSelect.reportValidity() : null;
        ukuranSelect.focus();
      }
      alert('Pilih ukuran dulu, ya!');
      return;
    }

    addToCart(fullName, price);

    if (redirect) {
      window.location.href = 'payment.html';
      return;
    }

    btn.classList.add('just-added');
    setTimeout(() => btn.classList.remove('just-added'), 900);
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => handlePurchase(addToCartBtn, { redirect: false }));
  }
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => handlePurchase(buyNowBtn, { redirect: true }));
  }
}

// --- NAVBAR AUTO-HIDE SAAT SCROLL ---
// (class .hide sudah ada di CSS, sebelumnya belum pernah di-toggle oleh JS)
function initAutoHideNavbar() {
  const bottomBarWrapper = document.querySelector('.bottom-bar-wrapper');
  if (!bottomBarWrapper) return;

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;

    if (scrollingDown && currentScrollY > 80) {
      bottomBarWrapper.classList.add('hide');
    } else {
      bottomBarWrapper.classList.remove('hide');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

// --- EVENT LISTENER (LOGIKA KLIK BUKA/TUTUP) ---
document.addEventListener('DOMContentLoaded', () => {
  renderDrawerCart();
  initProductGallery();
  initSizeSelector();
  initProductTabs();
  initPurchaseButtons();
  initAutoHideNavbar();

  const cartBtn = document.getElementById('cartBtn'); // Ikon keranjang di floating bar lu
  const drawer = document.getElementById('side-cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  // 1. Klik ikon keranjang -> Buka Drawer
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      drawer.classList.add('open');
      overlay.classList.add('show');
    });
  }

  // 2. Klik tombol 'X' -> Tutup Drawer
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // 3. Klik area gelap di luar panel -> Tutup Drawer
  if (overlay) {
    overlay.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
});