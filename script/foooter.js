// Shared footer. Edit the SITE block below – every page that has
// <footer id="site-footer"></footer> and loads this file updates at once.
const SITE = {
  name: "Handset by Em Kimhong",
  tagline: "New smartphones, sealed in the box, with a 1-year warranty.",

  // ---- Contact (update later) ----
  phone: "012 345 678",
  email: "hello@handset.example",
  hours: "Mon–Sat, 8:00–18:00",

  // ---- Location (update later) ----
  address: ["123 Your Street", "Your City, Your Country"],
  mapEmbedUrl: "", // optional: paste the src="..." link from Google Maps → Share → Embed a map

  // ---- Social links (paste your page links later; leave "" to hide an icon) ----
  social: {
    tiktok: "#",   // e.g. "https://www.tiktok.com/@yourshop"
    facebook: "#", // e.g. "https://www.facebook.com/yourshop"
    telegram: "#", // e.g. "https://t.me/yourshop"
  },
};

const ICONS = {
  facebook: '<path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-1 .4-1.8 1.9-1.8h1.5V3.8c-.3 0-1.2-.2-2.3-.2-2.7 0-4.4 1.6-4.4 4.6v2.3H7.4v3.3h2.8V22h3.3z"/>',
  telegram: '<path d="M20.7 3.6 2.9 10.5c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 1.7 5.2c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.1 4.6 3.4c.8.5 1.5.2 1.7-.8l3-14.3c.3-1.2-.4-1.8-1.4-1.4zM9 13.4l8.5-5.4c.4-.2.8-.1.5.2l-7 6.3-.3 3.2z"/>',
  tiktok: '<path d="M16.6 2h-3.3v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .8.1V9.1a6.2 6.2 0 1 0 5.4 6.2V8.9a7.5 7.5 0 0 0 4.4 1.4V7a4.4 4.4 0 0 1-4.4-5z"/>',
};
const LABELS = { facebook: "Facebook", telegram: "Telegram", tiktok: "TikTok" };

(function buildFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const socials = Object.entries(SITE.social).filter(([, url]) => url).map(([net, url]) =>
    `<a class="soc" href="${url}" data-net="${net}" target="_blank" rel="noopener noreferrer" aria-label="${LABELS[net]}">
       <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">${ICONS[net]}</svg>
     </a>`).join("");

  const telHref = "tel:" + SITE.phone.replace(/[^\d+]/g, "");
  const mapsHref = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SITE.address.join(", "));

  mount.innerHTML = `
    <div class="sf">
      <div class="sf-brand">
        <a class="sf-logo" href="homePage.html">${SITE.name}</a>
        <p>${SITE.tagline}</p>
        <div class="socials">${socials}</div>
      </div>

      <nav aria-label="Shop links">
        <h2>Shop</h2>
        <ul>
          <li><a href="homePage.html#shop">All phones</a></li>
          <li><a href="checkoutPage.html">Your cart</a></li>
        </ul>
      </nav>

      <div>
        <h2>Contact us</h2>
        <dl class="sf-list">
          <div><dt>Phone</dt><dd><a href="${telHref}">${SITE.phone}</a></dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
          <div><dt>Open</dt><dd>${SITE.hours}</dd></div>
        </dl>
      </div>

      <div>
        <h2>Visit our shop</h2>
        <address>${SITE.address.join("<br>")}</address>
        <a class="sf-btn" href="${mapsHref}" target="_blank" rel="noopener noreferrer">Get directions</a>
        ${SITE.mapEmbedUrl ? `<iframe class="sf-map" src="${SITE.mapEmbedUrl}" title="Map to our shop" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : ""}
      </div>
    </div>

    <div class="sf-bottom">
      <span>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</span>
      <button type="button" id="toTop" class="sf-top">Back to top ↑</button>
    </div>`;

  // Social links still set to "#" do nothing yet (no jump to the top of the page)
  mount.querySelectorAll(".soc").forEach((a) =>
    a.addEventListener("click", (e) => { if (a.getAttribute("href") === "#") e.preventDefault(); }));

  document.getElementById("toTop").onclick = () =>
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
})();