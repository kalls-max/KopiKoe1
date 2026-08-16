document.addEventListener('DOMContentLoaded', () => {
  initShopModule();
});

let globalProductsData = [];

function getJsonPathShop() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

function initShopModule() {
  const gridContainer = document.getElementById('productGrid');
  const noResultMsg = document.getElementById('shopNoResult');
  if (!gridContainer) return;

  fetch(getJsonPathShop())
    .then(res => {
      if (!res.ok) throw new Error("Gagal mengambil product.json");
      return res.json();
    })
    .then(products => {
      globalProductsData = products;
      renderProductsGrid(products);
      initShopControls();
    })
    .catch(err => {
      console.error("Error memuat produk shop:", err);
      if (noResultMsg) {
        noResultMsg.textContent = "Gagal memuat data produk. Periksa kembali struktur folder!";
        noResultMsg.style.display = 'block';
      }
    });
}

function renderProductsGrid(products) {
  const gridContainer = document.getElementById('productGrid');
  const noResultMsg = document.getElementById('shopNoResult');
  
  if (!gridContainer) return;

  if (!products || products.length === 0) {
    gridContainer.innerHTML = '';
    if (noResultMsg) noResultMsg.style.display = 'block';
    return;
  }

  if (noResultMsg) noResultMsg.style.display = 'none';

  gridContainer.innerHTML = products.map(product => `
    <a href="deskripsi-produk.html?id=${product.id}" class="shop-product-card">
      <div class="shop-product-img">
        <img src="${product.images && product.images[0] ? product.images[0] : ''}" alt="${product.name}" loading="lazy">
      </div>
      <div class="shop-product-info">
        <h3>${product.name}</h3>
        <p class="shop-product-price">${product.priceRange}</p>
      </div>
    </a>
  `).join('');
}

function initShopControls() {
  const searchInput = document.getElementById('shopSearchInput');
  const searchDropdownGrid = document.getElementById('searchDropdownGrid');
  const searchOverlay = document.getElementById('searchOverlay');
  const dropItems = document.querySelectorAll('.search-drop-item');
  const viewRectBtn = document.getElementById('viewRectBtn');
  const viewSquareBtn = document.getElementById('viewSquareBtn');
  const gridContainer = document.getElementById('productGrid');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const shopDropdown = document.getElementById('shopDropdown');

  // Munculkan / Sembunyikan Dropdown & Redupkan Belakangnya saat Search Focus
  if (searchInput && searchDropdownGrid && searchOverlay) {
    searchInput.addEventListener('focus', () => {
      searchDropdownGrid.style.display = 'block';
      searchOverlay.classList.add('show');
    });

    document.addEventListener('click', (e) => {
      const shopSearchContainer = document.querySelector('.shop-search');
      if (shopSearchContainer && !shopSearchContainer.contains(e.target)) {
        searchDropdownGrid.style.display = 'none';
        searchOverlay.classList.remove('show');
      }
    });
  }

  // Klik salah satu kategori di dropdown 4x1
  dropItems.forEach(item => {
    item.addEventListener('click', () => {
      const keyword = item.getAttribute('data-keyword');
      if (searchInput) {
        searchInput.value = keyword;
        filterAndRender(keyword);
      }
      if (searchDropdownGrid) {
        searchDropdownGrid.style.display = 'none';
      }
      if (searchOverlay) {
        searchOverlay.classList.remove('show');
      }
    });
  });

  // Pencarian manual via input text
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim();
      filterAndRender(keyword);
    });
  }

  function filterAndRender(keyword) {
    const lowerKeyword = keyword.toLowerCase();

    const filtered = globalProductsData.filter(product => {
      const name = (product.name || '').toLowerCase();
      const jenis = (product.specs && product.specs.jenis ? product.specs.jenis : '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const tagline = (product.tagline || '').toLowerCase();

      if (lowerKeyword === 'arabika') {
        return jenis.includes('arabika');
      } else if (lowerKeyword === 'robusta') {
        return jenis.includes('robusta');
      } else if (lowerKeyword === 'liberica') {
        return jenis.includes('liberica');
      } else if (lowerKeyword === 'excelsa') {
        return jenis.includes('excelsa');
      } else {
        return name.includes(lowerKeyword) || jenis.includes(lowerKeyword) || category.includes(lowerKeyword) || tagline.includes(lowerKeyword);
      }
    });

    renderProductsGrid(filtered);
  }

  // Toggle View Layout Grid (Rect / Square)
  if (viewRectBtn && viewSquareBtn && gridContainer) {
    viewRectBtn.addEventListener('click', () => {
      gridContainer.setAttribute('data-view', 'rect');
      viewRectBtn.classList.add('active');
      viewSquareBtn.classList.remove('active');
    });

    viewSquareBtn.addEventListener('click', () => {
      gridContainer.setAttribute('data-view', 'square');
      viewSquareBtn.classList.add('active');
      viewRectBtn.classList.remove('active');
    });
  }

  // Hamburger Menu Toggle
  if (hamburgerBtn && shopDropdown) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      shopDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!shopDropdown.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        shopDropdown.classList.remove('open');
      }
    });
  }
}