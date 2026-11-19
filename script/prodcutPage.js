// Opens as productPage.html?id=3 – finds that phone in PRODUCTS (products.js)
// and adds to the same localStorage "cart" that script.js and checkoutPage.js use.
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("en-US");

const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));
const product = PRODUCTS.find((p) => p.id === id);
let color = Number(params.get("c")) || 0; // colour chosen on the home page
let qty = 1;

let cart = [];
try { cart = JSON.parse(localStorage.getItem("cart")) || []; } catch (e) { cart = []; }

function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
  $("count").textContent = cart.reduce((n, l) => n + l.qty, 0);
}

let timer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(timer); timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function addToCart() {
  const line = cart.find((l) => l.id === product.id && l.c === color);
  line ? (line.qty += qty) : cart.push({ id: product.id, c: color, qty });
  saveCart();
}



function showColor() {
  const phone = $("phone");
  const selectedColor = product.colors[color];

  phone.style.setProperty("--c", selectedColor[1]);

  const image = selectedColor[2] || product.img;

  phone.innerHTML = image
    ? `<img
         src="${image}"
         alt="${product.name} - ${selectedColor[0]}"
         class="product-detail-image"
       >`
    : "";

  $("colorName").textContent = selectedColor[0];

  [...$("swatches").children].forEach((dot, i) => {
    dot.setAttribute("aria-pressed", i === color);
  });
}



function renderProduct() {
  if (color >= product.colors.length) color = 0;
  document.title = `${product.name} – Handset`;
  $("brand").textContent = product.brand;
  $("name").textContent = product.name;
  $("price").innerHTML = money(product.price) + (product.old ? `<s>${money(product.old)}</s>` : "");

  $("about").textContent = product.about || "Brand new and sealed, with a 1-year warranty.";
  $("highlights").innerHTML = (product.highlights || []).map((t) => `<li>${t}</li>`).join("");

  // swatches
  product.colors.forEach(([name, hex], i) => {
    const b = document.createElement("button");

    b.className = "dot";
    b.style.setProperty("--c", hex);
    b.setAttribute("aria-label", name);

    b.onclick = () => {
      color = i;
      showColor();
    };

    $("swatches").append(b);
  });
  showColor();

  // specs: the "specs" text is split on " · " (storage · display · highlight)
  const labels = ["Storage", "Display", "Highlight"];
  const rows = [["Brand", product.brand], ["Model", product.name],
    ...product.specs.split(" · ").map((s, i) => [labels[i] || "Feature", s])];
  rows.push(["Colours", product.colors.map((c) => c[0]).join(", ")]);
  $("specs").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  // quantity + buttons
  $("minus").onclick = () => { qty = Math.max(1, qty - 1); $("qty").textContent = qty; };
  $("plus").onclick = () => { qty = Math.min(10, qty + 1); $("qty").textContent = qty; };
  $("add").onclick = () => { addToCart(); toast(`${product.name} added to cart`); };
  $("buyNow").onclick = () => { addToCart(); location.href = "checkoutPage.html"; };

  // related phones: same brand first, then the rest
  const others = PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) => (b.brand === product.brand) - (a.brand === product.brand)).slice(0, 4);
  $("related").innerHTML = others.map((p) => `
  <article class="card">
    <a class="art" href="productPage.html?id=${p.id}&c=0" aria-label="View ${p.name}">${phoneArt(p, 0)}</a>
    <div class="brand">${p.brand}</div>
    <h3><a href="productPage.html?id=${p.id}&c=0">${p.name}</a></h3>
    <div class="price">${money(p.price)}</div>
  </article>`).join("");

  $("detail").hidden = false;
  $("relatedWrap").hidden = false;
}

saveCart();
product ? renderProduct() : ($("missing").hidden = false);