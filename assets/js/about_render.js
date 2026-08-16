document.addEventListener('DOMContentLoaded', () => {
  renderAboutProducts();
  renderAboutHero(); // Tambahkan pemanggilan fungsi ini
});

function getJsonPathAbout() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

// Fungsi untuk memasang foto hero dari JSON ke CSS
function renderAboutHero() {
  fetch(getJsonPathAbout())
    .then(res => res.json())
    .then(products => {
      const heroSection = document.querySelector('.about-hero-full');
      if (heroSection && products.length > 0) {
        // Mengambil foto dari produk pertama sebagai background hero
        heroSection.style.backgroundImage = `url('${products[0].images[0]}')`;
      }
    })
    .catch(err => console.error("Gagal memuat hero:", err));
}

function renderAboutProducts() {
  const container = document.getElementById('aboutProductList');
  if (!container) return;

  fetch(getJsonPathAbout())
    .then(res => res.json())
    .then(products => {
      const featured = products.slice(0, 3);
      container.innerHTML = featured.map(p => `
        <div class="related-card" style="background:#fff; border-radius:16px; overflow:hidden; border:1.5px solid rgba(111, 72, 58, 0.2); text-align:left;">
          <a href="deskripsi-produk.html?id=${p.id}" style="text-decoration:none; color:inherit;">
            <img src="${p.images[0]}" alt="${p.name}" style="width:100%; height:180px; object-fit:cover;">
            <div style="padding:15px;">
              <h4 style="margin:0 0 6px 0; font-family:'Paytone One', sans-serif; color:#33211B;">${p.name}</h4>
              <p style="margin:0; font-size:0.9rem; font-weight:600; color:#F7941D;">${p.priceRange}</p>
            </div>
          </a>
        </div>
      `).join('');
    })
    .catch(err => console.error("Gagal memuat produk di about:", err));
}