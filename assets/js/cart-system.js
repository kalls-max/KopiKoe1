document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  if (document.getElementById('cartTableBody')) {
    renderCartPage();
  }
});

function getCart() {
  return JSON.parse(localStorage.getItem('kopikoe_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('kopikoe_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0);

  badge.textContent = totalItems;
}

function renderCartPage() {
  const tbody = document.getElementById('cartTableBody');
  const totalElem = document.getElementById('cartTotalPrice');
  if (!tbody) return;

  const cart = getCart();
  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Keranjangmu masih kosong.</td></tr>`;
    if (totalElem) totalElem.textContent = 'Rp 0';
    return;
  }

  let grandTotal = 0;
  tbody.innerHTML = cart.map(item => {
    const qty = item.qty || item.quantity || 1;
    const subtotal = item.price * qty;
    grandTotal += subtotal;

    return `
      <tr>
        <td>${item.name}</td>
        <td>Rp ${item.price.toLocaleString('id-ID')}</td>
        <td>
          <button onclick="changeQty('${item.name}', -1)">-</button>
          <span style="margin: 0 8px;">${qty}</span>
          <button onclick="changeQty('${item.name}', 1)">+</button>
        </td>
        <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
        <td><button onclick="removeFromCart('${item.name}')">Hapus</button></td>
      </tr>
    `;
  }).join('');

  if (totalElem) totalElem.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
}

function changeQty(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
    saveCart(cart);
    renderCartPage();
  }
}

function removeFromCart(name) {
  let cart = getCart();
  cart = cart.filter(i => i.name !== name);
  saveCart(cart);
  renderCartPage();
}