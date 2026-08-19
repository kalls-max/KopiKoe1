function showToast(message, type = 'success') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  const icon = type === 'success' ? '✅' : '❌';

  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

//center popup
function showCenterPopup(title, message, type = 'warning') {
  const overlay = document.createElement('div');
  overlay.className = 'custom-popup-overlay';

  let icon = '⚠️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  overlay.innerHTML = `
    <div class="custom-popup-box">
      <div class="custom-popup-icon">${icon}</div>
      <h3 class="custom-popup-title">${title}</h3>
      <p class="custom-popup-message">${message}</p>
      <button class="custom-popup-btn" id="closeCustomPopup">Oke, Paham!</button>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('show');
  }, 10);

  const closeBtn = overlay.querySelector('#closeCustomPopup');
  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  });
}

// --------- batas aja

let cart = JSON.parse(localStorage.getItem('kopikoe_cart')) || [];

function getCleanProductName(fullName) {
  if (!fullName) return 'Produk Kopi';
  const separators = [' — ', ' – ', ' - ', '—', '–'];
  for (let sep of separators) {
    if (fullName.includes(sep)) {
      const parts = fullName.split(sep);
      if (parts[1] && parts[1].trim() !== '') {
        return parts[1].trim();
      }
    }
  }
  return fullName;
}

function saveCart() {
  localStorage.setItem('kopikoe_cart', JSON.stringify(cart));
  renderDrawerCart();
}

function addToCart(name, price, qty = 1, variant = '') {
  const cleanName = getCleanProductName(name);
  const existingIndex = cart.findIndex(item => item.name === cleanName && item.variant === variant);
  
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ name: cleanName, price: parseInt(price, 10), qty, variant });
  }
  saveCart();
  
  openCartDrawer();
  showToast('Sabi! Kopi berhasil masuk keranjang.', 'success');
}

function increaseQty(index) {
  const item = cart[index];
  if (item) item.qty += 1;
  saveCart();
}

function decreaseQty(index) {
  const item = cart[index];
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
}

function removeDrawerItem(index) {
  cart.splice(index, 1);
  saveCart();
}

function renderDrawerCart() {
  const drawerItemsContainer = document.getElementById('drawer-cart-items');
  const drawerCount = document.getElementById('drawer-cart-count');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const navbarBadges = document.querySelectorAll('.cart-badge');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (drawerCount) drawerCount.innerText = totalQty;
  if (drawerSubtotal) drawerSubtotal.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  navbarBadges.forEach(badge => {
    if (totalQty > 0) {
      badge.innerText = totalQty;
      badge.style.display = 'flex';
    } else {
      badge.innerText = '0';
      badge.style.display = 'none';
    }
  });

  if (!drawerItemsContainer) return;

  if (cart.length === 0) {
    drawerItemsContainer.innerHTML = '<p style="color:#777; text-align:center; margin-top:20px;">Keranjang masih kosong.</p>';
  } else {
    drawerItemsContainer.innerHTML = cart.map((item, index) => `
      <div class="drawer-item">
        <p class="drawer-item-name">${getCleanProductName(item.name)}</p>
        <button class="drawer-item-remove" onclick="removeDrawerItem(${index})" aria-label="Hapus item">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z"/>
          </svg>
        </button>

        <div class="drawer-item-variant-container">
          <button class="drawer-item-variant-btn" onclick="toggleVariantPopup(${index})">
            <span>Variasi: ${item.variant ? item.variant : 'Original'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>
          </button>

          <div class="variant-dropdown-popup" id="variantPopup-${index}">
            <div class="variant-popup-title">Pilih Ukuran / Varian:</div>
            <div class="variant-options-grid">
              <div class="variant-opt-chip ${item.variant && item.variant.includes('250g') ? 'active' : ''}" onclick="selectAndCloseVariant(${index}, '250g', 65000)">250g</div>
              <div class="variant-opt-chip ${item.variant && item.variant.includes('500g') ? 'active' : ''}" onclick="selectAndCloseVariant(${index}, '500g', 120000)">500g</div>
              <div class="variant-opt-chip ${item.variant && item.variant.includes('1kg') ? 'active' : ''}" onclick="selectAndCloseVariant(${index}, '1kg', 230000)">1Kg</div>
            </div>
          </div>
        </div>

        <div class="drawer-item-bottom">
          <span class="drawer-item-price">Rp ${item.price.toLocaleString('id-ID')}</span>
          <div class="drawer-item-qty">
            <button class="qty-btn qty-minus" onclick="decreaseQty(${index})" aria-label="Kurangi jumlah">&minus;</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn qty-plus" onclick="increaseQty(${index})" aria-label="Tambah jumlah">&plus;</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// buat dropdown di keranjang
function toggleVariantPopup(index) {
  const popup = document.getElementById(`variantPopup-${index}`);
  if (!popup) return;

  const isOpen = popup.classList.contains('show');
  
  document.querySelectorAll('.variant-dropdown-popup').forEach(p => p.classList.remove('show'));

  if (!isOpen) {
    popup.classList.add('show');
  }
}

function selectAndCloseVariant(index, sizeLabel, price) {
  const oldVariant = cart[index].variant || '';
  let grindPart = 'Biji Utuh';
  if (oldVariant.includes('·')) {
    grindPart = oldVariant.split('·')[1].trim();
  } else if (oldVariant) {
    grindPart = oldVariant;
  }

  cart[index].variant = `${sizeLabel} · ${grindPart}`;
  cart[index].price = price;
  saveCart();
  showToast('Variasi berhasil diubah!', 'success');
  
  const popup = document.getElementById(`variantPopup-${index}`);
  if (popup) {
    popup.classList.remove('show');
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('side-cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('side-cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  }
}

function getJsonPathScript() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

function initKopinya() {
  const container = document.getElementById('kopinyaContainer');
  if (!container) return;

  fetch(getJsonPathScript())
    .then(res => res.json())
    .then(products => {
      const bestSellers = products.filter(p => ['kopi-01', 'kopi-05', 'kopi-07'].includes(p.id));
      
      container.innerHTML = bestSellers.map(product => {
        const cleanName = getCleanProductName(product.name);
        return `
          <a href="deskripsi-produk.html?id=${product.id}" class="product-link">
            <div class="kopi-card">
              <img src="${product.images && product.images[0] ? product.images[0] : ''}" alt="${cleanName}" class="card-img-real">
              <h3>${cleanName}</h3>
              <p style="color: var(--coffee-brown); font-weight: 600; margin-top: 8px;">${product.priceRange ? product.priceRange.split(/[-–]/)[0].trim() : 'Rp ' + product.price.toLocaleString('id-ID')}</p>
            </div>
          </a>
        `;
      }).join('');
    })
    .catch(err => console.error("Gagal memuat produk best seller:", err));
}

function initEnsiKopidia() {
  const beanImgs = document.querySelectorAll('.bean-img');
  const titleElem = document.getElementById('ensiBeanTitle');
  const descElem = document.getElementById('ensiBeanDesc');
  const imgElem = document.getElementById('ensiBeanImg');
  const statElem = document.getElementById('ensiBeanStat');

  if (!beanImgs.length || !titleElem || !descElem) return;

  beanImgs.forEach(bean => {
    bean.addEventListener('click', () => {
      const productId = bean.getAttribute('data-id');
      if (!productId) return;

      fetch(getJsonPathScript())
        .then(res => res.json())
        .then(products => {
          const p = products.find(prod => prod.id === productId);
          if (p) {
            let jenisName = p.name;
            const separators = [' — ', ' – ', ' - ', '—', '–'];
            for (let sep of separators) {
              if (jenisName.includes(sep)) {
                jenisName = jenisName.split(sep)[0].trim();
                break;
              }
            }

            titleElem.textContent = jenisName;
            descElem.textContent = p.description;
            if (imgElem) imgElem.src = p.images[0];
            if (statElem) statElem.textContent = p.specs.flavor || p.eyebrow;
          }
        })
        .catch(err => console.error("Gagal memuat ensiklopedia:", err));

      beanImgs.forEach(b => b.classList.remove('active-bean'));
      bean.classList.add('active-bean');
    });
  });
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  if (!slides.length) return;

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));

  setInterval(() => showSlide(currentSlide + 1), 5000);
}

function initFloatingNavbarScroll() {
  const bottomBarWrapper = document.querySelector('.bottom-bar-wrapper');
  if (!bottomBarWrapper) return;

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      bottomBarWrapper.classList.add('hide');
    } else {
      bottomBarWrapper.classList.remove('hide');
    }

    lastScrollY = currentScrollY;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderDrawerCart();
  initKopinya();
  initEnsiKopidia();
  initHeroSlider();
  initFloatingNavbarScroll();

  const cartBtn = document.getElementById('cartBtn');
  const cartBtnTop = document.getElementById('cartBtnTop');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  if (cartBtnTop) cartBtnTop.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);

  const checkoutDrawerBtn = document.querySelector('.btn-checkout-drawer');
  if (checkoutDrawerBtn) {
    checkoutDrawerBtn.removeAttribute('onclick');

    checkoutDrawerBtn.addEventListener('click', (e) => {
      e.preventDefault();

      if (cart.length === 0) {
        showToast("Belanja dulu ga sih? Keranjang kamu masih kosong nih! ☕", "error");
        return;
      }

      localStorage.removeItem('is_direct_checkout');
      localStorage.removeItem('kopikoe_direct_checkout');
      window.location.href = 'payment.html';
    });
  }
});