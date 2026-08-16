let cart = JSON.parse(localStorage.getItem('kopikoe_cart')) || [];

function saveCart() {
  localStorage.setItem('kopikoe_cart', JSON.stringify(cart));
  renderDrawerCart();
}

function addToCart(name, price, qty = 1) {
  const existingIndex = cart.findIndex(item => item.name === name);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ name, price: parseInt(price, 10), qty });
  }
  saveCart();
  openCartDrawer();
}

function removeDrawerItem(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
}

function renderDrawerCart() {
  const drawerItemsContainer = document.getElementById('drawer-cart-items');
  const drawerCount = document.getElementById('drawer-cart-count');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const navbarBadge = document.getElementById('cartBadge');

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (drawerCount) drawerCount.innerText = totalQty;
  if (navbarBadge) navbarBadge.innerText = totalQty;
  if (drawerSubtotal) drawerSubtotal.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;

  if (!drawerItemsContainer) return;

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
  const overlay = document.getElementById('cart-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (overlay) overlay.addEventListener('click', closeCartDrawer);
});