document.addEventListener('DOMContentLoaded', () => {
  initShopModule();
});

let globalProductsData = [];

function getJsonPathShop() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

// Fungsi pembersih nama untuk mengambil bagian nama produk saja di shop
function getCleanShopName(fullName) {
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

  gridContainer.innerHTML = products.map(product => {
    let displayPrice = 'Rp 0';
    try {
      if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
        displayPrice = `Mulai Rp ${Number(product.sizes[0].price).toLocaleString('id-ID')}`;
      } else if (product.priceRange && typeof product.priceRange === 'string') {
        const parts = product.priceRange.split(/[-–]/);
        displayPrice = `Mulai ${parts[0].trim()}`;
      } else if (product.price !== undefined && product.price !== null) {
        displayPrice = `Rp ${Number(product.price).toLocaleString('id-ID')}`;
      }
    } catch (e) {
      displayPrice = product.priceRange || 'Cek Detail';
    }

    const productName = getCleanShopName(product.name);
    const productImage = product.images && product.images[0] ? product.images[0] : '';

    return `
      <a href="deskripsi-produk.html?id=${product.id}" class="shop-product-card">
        <div class="shop-product-img">
          <img src="${productImage}" alt="${productName}" loading="lazy">
        </div>
        <div class="shop-product-info">
          <h3>${productName}</h3>
          <p class="shop-product-price">${displayPrice}</p>
        </div>
      </a>
    `;
  }).join('');
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

  if (searchInput && searchDropdownGrid && searchOverlay) {
    // Tampilkan rekomendasi hanya saat input di-klik/fokus pertama kali
    searchInput.addEventListener('focus', () => {
      searchDropdownGrid.style.display = 'block';
      searchOverlay.classList.add('show');
    });

    // Sembunyikan kalau klik di luar area pencarian
    document.addEventListener('click', (e) => {
      const shopSearchContainer = document.querySelector('.shop-search');
      if (shopSearchContainer && !shopSearchContainer.contains(e.target)) {
        searchDropdownGrid.style.display = 'none';
        searchOverlay.classList.remove('show');
      }
    });
  }

  // Event untuk kotak rekomendasi yang di-klik
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

  // UBAHAN UTAMA: Ganti event 'input' menjadi 'keydown' khusus tombol Enter
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      // Cek apakah tombol yang ditekan adalah "Enter"
      if (e.key === 'Enter') {
        e.preventDefault(); // Mencegah form auto-submit bawaan browser
        
        const keyword = e.target.value.trim();
        filterAndRender(keyword); // Jalankan filter pencarian

        // Sembunyikan 4 kotak rekomendasi kopi
        if (searchDropdownGrid) {
          searchDropdownGrid.style.display = 'none';
        }
        if (searchOverlay) {
          searchOverlay.classList.remove('show');
        }
        
        // Hapus kursor dari input (supaya keyboard hp otomatis turun)
        searchInput.blur();
      }
    });
  }

  // Fungsi logik filter pencarian
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
        return jenis.includes('liberica') || jenis.includes('liberika');
      } else if (lowerKeyword === 'excelsa') {
        return jenis.includes('excelsa');
      } else {
        return name.includes(lowerKeyword) || jenis.includes(lowerKeyword) || category.includes(lowerKeyword) || tagline.includes(lowerKeyword);
      }
    });

    renderProductsGrid(filtered);
  }

  // Logik View Grid (Kotak vs Persegi Panjang)
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

  // Logik Hamburger Menu Mobile
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