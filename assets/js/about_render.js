document.addEventListener('DOMContentLoaded', () => {
  renderAboutProducts();
});

function getJsonPathAbout() {
  return window.location.pathname.includes('/pages/') ? '../data/product.json' : 'data/product.json';
}

// render list produk
function renderAboutProducts() {
  const container = document.getElementById('aboutProductList');
  if (!container) return;

  fetch(getJsonPathAbout())
    .then(res => res.json())
    .then(products => {
      const featured = products.slice(0, 3); 
      container.innerHTML = featured.map(p => `
        <div class="related-card" style="background:var(--pastel-card); border-radius:16px; overflow:hidden; border:1.5px solid var(--pastel-border); text-align:left;">
          <a href="deskripsi-produk.html?id=${p.id}" style="text-decoration:none; color:inherit;">
            <img src="${p.images[0]}" alt="${p.name}" style="width:100%; height:180px; object-fit:cover; background:#EFEBE9;">
            <div style="padding:15px;">
              <h4 style="margin:0 0 6px 0; font-family:'Paytone One', sans-serif; color:var(--coffee-dark); font-size:1.05rem;">${p.name.split(' — ')[0]}</h4>
              <p style="margin:0; font-size:0.9rem; font-weight:600; color:var(--coffee-brown);">${p.priceRange}</p>
            </div>
          </a>
        </div>
      `).join('');
    })
    .catch(err => console.error("Gagal memuat produk di about:", err));
}