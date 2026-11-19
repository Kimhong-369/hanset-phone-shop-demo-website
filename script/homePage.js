// PRODUCTS comes from products.js (loaded before this file)

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("en-US");
const state = { brand: "All", sort: "featured", q: "", pick: {} }; // pick = chosen colour per product
let cart = [];

try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {} };

// ---- Hero colour preview (real photos) ----
const heroProduct = PRODUCTS[1]; // change the number to feature a different phone

function showHero(i) {
  const [name, hex, img] = heroProduct.colors[i];
  const src = img || heroProduct.img;
  const phone = $("heroPhone");

  phone.style.setProperty("--c", hex);
  phone.classList.toggle("has-photo", !!src);
  phone.innerHTML = src
    ? `<img src="${src}" alt="${heroProduct.name} in ${name}">`
    : "";

  [...$("heroSwatches").children].forEach((d, k) =>
    d.setAttribute("aria-pressed", k === i)
  );
}

heroProduct.colors.forEach(([name, hex], i) => {
  const b = document.createElement("button");
  b.className = "dot";
  b.style.setProperty("--c", hex);
  b.setAttribute("aria-label", name);
  b.onclick = () => showHero(i);
  $("heroSwatches").append(b);
});

showHero(0);

// ---- Brand filter buttons ----
["All", ...new Set(PRODUCTS.map((p) => p.brand))].forEach((b) => {
  const btn = document.createElement("button");
  btn.textContent = b; btn.dataset.brand = b;
  btn.onclick = () => { state.brand = b; renderBrands(); renderGrid(); };
  $("brands").append(btn);
});
function renderBrands() {
  [...$("brands").children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.brand === state.brand));
}

// ---- Product grid ----
function renderGrid() {
  let list = PRODUCTS.filter((p) =>
    (state.brand === "All" || p.brand === state.brand) &&
    (p.name + " " + p.brand).toLowerCase().includes(state.q.toLowerCase())
  );
  if (state.sort === "low") list.sort((a, b) => a.price - b.price);
  if (state.sort === "high") list.sort((a, b) => b.price - a.price);

  $("empty").hidden = list.length > 0;
  $("grid").innerHTML = list.map((p) => {
    const c = state.pick[p.id] ?? 0;
    return `<article class="card" data-id="${p.id}">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      <a class="art" href="productPage.html?id=${p.id}&c=${c}" aria-label="View ${p.name}">${phoneArt(p, c)}</a>
      <div class="brand">${p.brand}</div>
      <h3><a href="productPage.html?id=${p.id}&c=${c}">${p.name}</a></h3>
      <div class="swatches">${p.colors.map((col, i) =>
        `<button class="dot" style="--c:${col[1]}" aria-label="${col[0]}" aria-pressed="${i === c}" data-id="${p.id}" data-i="${i}"></button>`).join("")}</div>
      <div class="specs">${p.specs}</div>
      <div class="price">${money(p.price)}${p.old ? `<s>${money(p.old)}</s>` : ""}</div>
      <button class="btn add" data-id="${p.id}">Add to cart</button>
    </article>`;
  }).join("");
}

$("grid").addEventListener("click", (e) => {
  const dot = e.target.closest(".dot");
  if (dot) { state.pick[dot.dataset.id] = +dot.dataset.i; renderGrid(); return; }
  const add = e.target.closest(".add");
  if (add) { addToCart(+add.dataset.id); return; }
  if (e.target.closest("a")) return; // normal links work by themselves
  const card = e.target.closest(".card"); // click anywhere else on the card
  if (card) location.href = `productPage.html?id=${card.dataset.id}&c=${state.pick[card.dataset.id] ?? 0}`;
});
$("search").oninput = (e) => { state.q = e.target.value; renderGrid(); };
$("sort").onchange = (e) => { state.sort = e.target.value; renderGrid(); };

// ---- Cart ----
function addToCart(id) {
  const c = state.pick[id] ?? 0;
  const line = cart.find((l) => l.id === id && l.c === c);
  line ? line.qty++ : cart.push({ id, c, qty: 1 });
  renderCart(); toast("Added to cart");
}
function renderCart() {
  saveCart();
  $("count").textContent = cart.reduce((n, l) => n + l.qty, 0);
  let total = 0;
  $("items").innerHTML = cart.length ? cart.map((l, i) => {
    const p = PRODUCTS.find((x) => x.id === l.id);
    total += p.price * l.qty;
    return `<div class="item">
      ${phoneArt(p, l.c)}
      <div><strong>${p.name}</strong><small>${p.colors[l.c][0]} · ${money(p.price)}</small>
        <div class="qty"><button data-a="minus" data-i="${i}" aria-label="Decrease">−</button>${l.qty}<button data-a="plus" data-i="${i}" aria-label="Increase">+</button></div></div>
      <button class="rm" data-a="rm" data-i="${i}">Remove</button>
    </div>`;
  }).join("") : `<p class="cart-empty">Your cart is empty. Add a phone to get started.</p>`;
  $("total").textContent = money(total);
  $("checkoutBtn").disabled = !cart.length;
}
$("items").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const l = cart[+b.dataset.i];
  if (b.dataset.a === "plus") l.qty++;
  if (b.dataset.a === "minus") l.qty--;
  if (b.dataset.a === "rm" || l.qty < 1) cart.splice(+b.dataset.i, 1);
  renderCart();
});

// ---- Drawer, checkout, toast ----
function openCart(open) {
  $("cart").classList.toggle("open", open);
  $("cart").setAttribute("aria-hidden", !open);
  $("overlay").hidden = !open;
}
$("cartBtn").onclick = () => openCart(true);
$("closeCart").onclick = $("overlay").onclick = () => openCart(false);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });

$("checkoutBtn").onclick = () => { location.href = "checkoutPage.html"; };

let timer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(timer); timer = setTimeout(() => t.classList.remove("show"), 2200);
}

renderBrands(); renderGrid(); renderCart();