let cart = JSON.parse(localStorage.getItem('kopikoe_cart')) || [];

function saveCart() {
  localStorage.setItem('kopikoe_cart', JSON.stringify(cart));
  renderDrawerCart();
}

function addToCart(name, price, qty = 1, variant = '') {
  const existingIndex = cart.findIndex(item => item.name === name && item.variant === variant);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ name, price: parseInt(price, 10), qty, variant });
  }
  saveCart();
  openCartDrawer();
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
  navbarBadges.forEach(badge => { badge.innerText = totalQty; });
  if (drawerSubtotal) drawerSubtotal.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  if (!drawerItemsContainer) return;

  if (cart.length === 0) {
    drawerItemsContainer.innerHTML = '<p style="color:#777; text-align:center; margin-top:20px;">Keranjang masih kosong.</p>';
  } else {
    drawerItemsContainer.innerHTML = cart.map((item, index) => `
      <div class="drawer-item">
        <p class="drawer-item-name">${item.name}</p>
        <button class="drawer-item-remove" onclick="removeDrawerItem(${index})" aria-label="Hapus item">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z"/>
          </svg>
        </button>
        <p class="drawer-item-variant">${item.variant ? item.variant : 'Original'}</p>
        <span class="drawer-item-price">Rp ${item.price.toLocaleString('id-ID')}</span>
        <div class="drawer-item-qty">
          <button class="qty-btn qty-minus" onclick="decreaseQty(${index})" aria-label="Kurangi jumlah">&minus;</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn qty-plus" onclick="increaseQty(${index})" aria-label="Tambah jumlah">&plus;</button>
        </div>
      </div>
    `).join('');
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

// Fungsi deteksi jalur JSON otomatis untuk Ensi Kopidia
function getJsonPathScript() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
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
            titleElem.textContent = p.name;
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

document.addEventListener('DOMContentLoaded', () => {
  renderDrawerCart();
  initEnsiKopidia();
  initHeroSlider();

  const cartBtn = document.getElementById('cartBtn');
  const cartBtnTop = document.getElementById('cartBtnTop');
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  if (cartBtnTop) cartBtnTop.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);
});