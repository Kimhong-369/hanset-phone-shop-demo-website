// Reads the cart saved by script.js / productPage.js
// and PRODUCTS from products.js.

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("en-US");

const FREE_DELIVERY_OVER = 300;
const DELIVERY_FEE = 5;
const MAX_QTY = 10;

// Load cart from Local Storage
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (e) {
  cart = [];
}

cart = cart.filter((l) => PRODUCTS.some((p) => p.id === l.id));

// Save cart
const save = () => {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save cart:", e);
  }
};

// Find product
const find = (l) => PRODUCTS.find((p) => p.id === l.id);


// Render cart and calculate totals
function render() {
  if (!cart.length) {
    $("lines").innerHTML = `
      <p class="cart-empty">
        Your cart is empty.
        <a href="homePage.html#shop">Choose a phone</a> to continue.
      </p>
    `;
  } else {
    $("lines").innerHTML = cart.map((l, i) => {
      const p = find(l);

      return `
        <div class="line">
          <div class="thumb">${phoneArt(p, l.c)}</div>

          <div class="line-body">
            <div class="line-top">
              <strong>${p.name}</strong>
              <span class="line-total">
                ${money(p.price * l.qty)}
              </span>
            </div>

            <small>
              ${p.colors[l.c][0]} · ${money(p.price)} each
            </small>

            <div class="line-actions">
              <div class="stepper" role="group"
                aria-label="Quantity for ${p.name}">

                <button
                  type="button"
                  data-a="minus"
                  data-i="${i}"
                  aria-label="Decrease quantity"
                  ${l.qty <= 1 ? "disabled" : ""}>
                  −
                </button>

                <output>${l.qty}</output>

                <button
                  type="button"
                  data-a="plus"
                  data-i="${i}"
                  aria-label="Increase quantity"
                  ${l.qty >= MAX_QTY ? "disabled" : ""}>
                  +
                </button>
              </div>

              <button
                type="button"
                class="rm"
                data-a="rm"
                data-i="${i}"
                aria-label="Remove ${p.name} from order">
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Calculate subtotal, delivery and total
  const sub = cart.reduce(
    (n, l) => n + find(l).price * l.qty,
    0
  );

  const ship =
    !cart.length || sub >= FREE_DELIVERY_OVER
      ? 0
      : DELIVERY_FEE;

  const total = sub + ship;

  $("sub").textContent = money(sub);
  $("ship").textContent = ship ? money(ship) : "Free";
  $("grand").textContent = money(total);

  // Free delivery progress
  $("free").hidden = !cart.length;

  const left = FREE_DELIVERY_OVER - sub;

  $("freeMsg").textContent =
    left > 0
      ? `Add ${money(left)} more for free delivery`
      : "You've got free delivery";

  $("freeFill").style.width =
    Math.min(100, (sub / FREE_DELIVERY_OVER) * 100) + "%";

  // Update checkout button
  $("submitBtn").disabled = !cart.length;

  $("submitBtn").textContent = cart.length
    ? `Continue to confirmation · ${money(total)}`
    : "Your cart is empty";

  return { sub, ship, total };
}

let totals = render();


// Quantity buttons and Remove button
$("lines").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-a]");

  if (!b) return;

  const i = Number(b.dataset.i);

  if (b.dataset.a === "plus") {
    cart[i].qty = Math.min(MAX_QTY, cart[i].qty + 1);
  }

  if (b.dataset.a === "minus") {
    cart[i].qty = Math.max(1, cart[i].qty - 1);
  }

  if (b.dataset.a === "rm") {
    cart.splice(i, 1);
  }

  save();
  totals = render();

  // Keep keyboard focus after re-render
  if (b.dataset.a !== "rm") {
    document
      .querySelector(`[data-a="${b.dataset.a}"][data-i="${i}"]`)
      ?.focus();
  }
});


// Phone validation
const phoneOk = (v) => /^[+\d][\d\s-]{6,}$/.test(v.trim());

$("phone").addEventListener("input", () => {
  $("phone").removeAttribute("aria-invalid");
  $("phoneErr").hidden = true;
});


// Pending order information
let pendingOrder = null;
let pendingMessage = "";

let confirmLabel = "Confirm order";

// Escape user input before putting it in HTML
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));

function renderReview(order, paymentMethod) {
  const c = order.customer;

  const row = (label, value, fallback = "Not provided") =>
    `<div><dt>${label}</dt><dd class="${value ? "" : "muted"}">${esc(value || fallback)}</dd></div>`;

  const items = order.items.map((item) => {
    const p = find(item);
    return `
      <li class="r-item">
        <div class="thumb">${phoneArt(p, item.c)}</div>
        <div class="r-item-info">
          <strong>${esc(p.name)}</strong>
          <small>${esc(p.colors[item.c][0])} · ${money(p.price)} × ${item.qty}</small>
        </div>
        <span class="r-item-total">${money(p.price * item.qty)}</span>
      </li>`;
  }).join("");

  const payNote = c.pay === "bank"
    ? "We'll send the bank account details after you confirm."
    : "Pay cash to the courier. Nothing to pay now.";

  $("reviewNo").textContent = order.number;

  $("confirmationDetails").innerHTML = `
    <section class="r-card">
      <div class="r-head"><h2>Contact</h2>
        <button type="button" class="r-edit" data-edit>Edit</button></div>
      <dl class="r-list">
        ${row("Name", c.name)}
        ${row("Phone", c.phone)}
        ${row("Email", c.email)}
      </dl>
    </section>

    <section class="r-card">
      <div class="r-head"><h2>Delivery</h2>
        <button type="button" class="r-edit" data-edit>Edit</button></div>
      <dl class="r-list">
        ${row("Address", c.address)}
        ${row("City / province", c.city)}
        ${row("Courier note", c.note, "None")}
      </dl>
    </section>

    <section class="r-card">
      <div class="r-head"><h2>Payment</h2>
        <button type="button" class="r-edit" data-edit>Edit</button></div>
      <div class="r-pay">
        <strong>${paymentMethod}</strong>
        <small>${payNote}</small>
      </div>
    </section>

    <section class="r-card">
      <div class="r-head"><h2>Items</h2>
        <a class="r-edit" href="homePage.html#shop">Add more</a></div>
      <ul class="r-items">${items}</ul>
      <dl class="r-totals">
        <div><dt>Subtotal</dt><dd>${money(order.sub)}</dd></div>
        <div><dt>Delivery</dt><dd>${order.ship === 0 ? "Free" : money(order.ship)}</dd></div>
        <div class="grand"><dt>Total</dt><dd>${money(order.total)}</dd></div>
      </dl>
    </section>
  `;

  confirmLabel = `Confirm order · ${money(order.total)}`;
  $("confirmOrderBtn").textContent = confirmLabel;
}

// Every "Edit" link goes back to the form
$("confirmationDetails").addEventListener("click", (e) => {
  if (e.target.closest("[data-edit]")) $("backToDetails").click();
});


// STEP 2: Your details → Confirmation
$("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(
    new FormData($("orderForm"))
  );

  // Validate phone number
  if (!phoneOk(data.phone)) {
    $("phone").setAttribute("aria-invalid", "true");

    $("phoneErr").textContent =
      "Enter a valid phone number, for example 012 345 678.";

    $("phoneErr").hidden = false;
    $("phone").focus();

    return;
  }

  // Check cart
  if (!cart.length) {
    render();
    return;
  }

  // Refresh totals
  totals = render();

  // Create order (not sent yet)
  pendingOrder = {
    number: "HS-" + Date.now().toString().slice(-6),
    customer: data,
    items: cart.map((item) => ({ ...item })),
    ...totals,
    createdAt: new Date().toISOString()
  };

  // Format order items
  const itemLines = pendingOrder.items.map((item) => {
    const product = find(item);
    const color = product.colors[item.c][0];

    return (
      `• ${product.name}\n` +
      `  Color: ${color}\n` +
      `  Price: ${money(product.price)} × ${item.qty}\n` +
      `  Subtotal: ${money(product.price * item.qty)}`
    );
  });

  const paymentMethod =
    data.pay === "bank"
      ? "Bank transfer"
      : "Cash on delivery";

  // Build Telegram message
  pendingMessage = [
    "🛒 NEW ORDER — HANDSET STORE",
    "",
    `Order number: ${pendingOrder.number}`,
    "",
    "👤 CUSTOMER DETAILS",
    `Name: ${data.name || "Not provided"}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || "Not provided"}`,
    `Address: ${data.address || "Not provided"}`,
    `City: ${data.city || "Not provided"}`,
    `Note: ${data.note || "None"}`,
    "",
    "📦 ORDER ITEMS",
    ...itemLines,
    "",
    `Subtotal: ${money(pendingOrder.sub)}`,
    `Delivery: ${pendingOrder.ship === 0 ? "Free" : money(pendingOrder.ship)}`,
    `TOTAL: ${money(pendingOrder.total)}`,
    "",
    `Payment: ${paymentMethod}`,
    "",
    "Please confirm this order with the customer."
  ].join("\n");

  renderReview(pendingOrder, paymentMethod);

  // Move to Confirmation
  $("orderForm").hidden = true;
  $("confirmation").hidden = false;

  $("summary").hidden = true;

  $("steps").children[0].className = "ok";
  $("steps").children[1].className = "ok";
  $("steps").children[2].className = "on";

  $("steps").children[1].removeAttribute("aria-current");
  $("steps").children[2].setAttribute("aria-current", "step");

  $("confirmationError").hidden = true;

  window.scrollTo(0, 0);
  $("reviewTitle").focus({ preventScroll: true });
});


// Back to Your details
$("backToDetails").addEventListener("click", () => {
  $("confirmation").hidden = true;
  $("orderForm").hidden = false;
  $("summary").hidden = false;

  $("steps").children[0].className = "ok";
  $("steps").children[1].className = "on";
  $("steps").children[2].className = "";

  $("steps").children[1].setAttribute("aria-current", "step");
  $("steps").children[2].removeAttribute("aria-current");

  window.scrollTo(0, 0);
});


// STEP 3: Confirmation → Send order to Telegram
$("confirmOrderBtn").addEventListener("click", async () => {
  if (!pendingOrder) return;

  const button = $("confirmOrderBtn");

  button.disabled = true;
  button.classList.add("is-loading");
  button.textContent = "Sending order…";

  $("confirmationError").hidden = true;

  try {
    // Send order to Node.js backend
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: pendingMessage
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "Order notification failed."
      );
    }

    // Save successful order locally
    try {
      localStorage.setItem(
        "lastOrder",
        JSON.stringify(pendingOrder)
      );
    } catch (err) {
      console.warn("Could not save order:", err);
    }

    // Keep a copy before clearing pending order
    const completedOrder = pendingOrder;

    // Clear shopping cart
    cart = [];
    save();

    totals = render();

    // Hide checkout sections
    $("confirmation").hidden = true;
    $("orderForm").hidden = true;
    $("summary").hidden = true;

    // Display successful order information
    $("doneName").textContent =
      completedOrder.customer.name;

    $("orderNo").textContent =
      completedOrder.number;

    $("donePhone").textContent =
      completedOrder.customer.phone;

    $("donePay").textContent =
      completedOrder.customer.pay === "bank"
        ? "Payment method: Bank transfer"
        : "Payment method: Cash on delivery";

    $("done").hidden = false;

    // Mark all steps completed
    [...$("steps").children].forEach((step) => {
      step.className = "ok";
      step.removeAttribute("aria-current");
    });

    // Clear pending order
    pendingOrder = null;
    pendingMessage = "";

    window.scrollTo(0, 0);

  } catch (error) {
    console.error("Order submission failed:", error);

    $("confirmationError").textContent =
      "We couldn't send your order. Please try again.";

    $("confirmationError").hidden = false;

  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.textContent = confirmLabel;
  }
});