/* =====================================================
   KINGFRESH — Site Integration Layer  (kf-site.js)
   Connects KFData to all front-end pages:
   • Updates WhatsApp links from admin settings
   • Dynamically renders products when admin has saved data
   • Saves contact form submissions to admin enquiries panel
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  if (typeof KFData === "undefined") return;

  const s = KFData.getSettings();

  /* ── 1. WhatsApp links ─────────────────────────────── */
  const waNum  = s.whatsapp   || "919876543210";
  const waMsg  = encodeURIComponent(s.whatsappMsg || "Hello KingFresh! I am interested in your products.");
  const waHref = `https://wa.me/${waNum}?text=${waMsg}`;

  // Floating WhatsApp button
  const floatBtn = document.getElementById("whatsapp-btn");
  if (floatBtn) floatBtn.href = waHref;

  // All other wa.me links on the page
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => { a.href = waHref; });

  /* ── 2. Render products if admin has saved custom data ── */
  const hasCustomProducts = !!localStorage.getItem("kf_products");

  if (hasCustomProducts) {
    // Index page — fills 3 tabbed grids (identified by IDs)
    const fruitsGrid = document.getElementById("kf-grid-fruits");
    const vegsGrid   = document.getElementById("kf-grid-vegetables");
    const exoticGrid = document.getElementById("kf-grid-exotic");

    if (fruitsGrid)  fillGrid(fruitsGrid,  KFData.getProducts("Fruits").slice(0, 6));
    if (vegsGrid)    fillGrid(vegsGrid,    KFData.getProducts("Vegetables").slice(0, 6));
    if (exoticGrid)  fillGrid(exoticGrid,  KFData.getProducts("Exotic").slice(0, 6));

    // Products catalog page — replaces entire catalog body
    const catalog = document.getElementById("kf-catalog");
    if (catalog) renderFullCatalog(catalog);
  }

  /* ── 3. CEO / Founder photo ────────────────────────── */
  const ceoAvatar = document.getElementById("ceo-avatar");
  if (ceoAvatar && s.ceoPhoto) {
    ceoAvatar.innerHTML = `<img src="${s.ceoPhoto}" alt="Mohan Lal Sharma" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid var(--clr-secondary);"/>`;
  }

  /* ── 4. Contact form → save enquiry in admin panel ─── */
  const form = document.getElementById("contact-form");
  if (form) wireEnquiryCapture(form);
});

/* ─────────────────────────────────────────────────────
   PRODUCT CARD BUILDER
   ───────────────────────────────────────────────────── */
const STAGGER = ["stagger-1","stagger-2","stagger-3","stagger-4","stagger-5","stagger-6"];

function buildCard(p, idx) {
  const badge  = p.badge ? `<span class="product-card-badge">${escHtml(p.badge)}</span>` : "";
  const tagArr = Array.isArray(p.tags)
    ? p.tags
    : String(p.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  const tags   = tagArr.slice(0, 3)
    .map(t => `<span class="product-tag">${escHtml(t)}</span>`).join("");

  // Show uploaded image if available, otherwise fall back to emoji
  const hasImg     = p.imgUrl && p.imgUrl.length > 10;
  const imgContent = hasImg
    ? `<img src="${p.imgUrl}" alt="${escHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;"/>`
    : (p.emoji || "🌿");
  const imgStyle   = hasImg ? ` style="padding:0;overflow:hidden;"` : "";

  return `
    <article class="product-card reveal ${STAGGER[idx % 6]}" role="listitem">
      <div class="product-card-img"${imgStyle}>${imgContent}${badge}</div>
      <div class="product-card-body">
        <h3 class="product-card-name">${escHtml(p.name)}</h3>
        <div class="product-card-origin">
          <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
          ${escHtml(p.origin || "")}
        </div>
        <div class="product-card-tags">${tags}
          ${p.availability ? `<span class="product-tag">${escHtml(p.availability)}</span>` : ""}
        </div>
        <a href="contact.html" class="product-card-action">Enquire Now →</a>
      </div>
    </article>`;
}

function fillGrid(gridEl, products) {
  if (!products.length) return;
  gridEl.innerHTML = products.map((p, i) => buildCard(p, i)).join("");
}

/* ─────────────────────────────────────────────────────
   FULL CATALOG (products.html)
   ───────────────────────────────────────────────────── */
const CAT_EMOJI = { Fruits: "🍎", Vegetables: "🥦", Exotic: "✨", Herbs: "🌿" };

function renderFullCatalog(container) {
  const all  = KFData.getProducts();
  const cats = [...new Set(all.map(p => p.category))].sort();

  container.innerHTML = cats.map(cat => {
    const items = all.filter(p => p.category === cat);
    const emoji = CAT_EMOJI[cat] || "🌿";
    const cards = items.map((p, i) => buildCard(p, i)).join("");
    return `
      <div data-group="${cat.toLowerCase()}" role="list">
        <h3 style="font-family:var(--font-heading);font-size:1.5rem;margin-bottom:1.5rem;
                   padding-bottom:.75rem;border-bottom:2px solid var(--clr-border);
                   color:var(--clr-text);">
          ${emoji} ${escHtml(cat)}
        </h3>
        <div class="products-grid">${cards}</div>
      </div>
      <div style="height:3rem;"></div>`;
  }).join("");
}

/* ─────────────────────────────────────────────────────
   CONTACT FORM → ENQUIRY CAPTURE
   Saves to admin panel enquiries (in addition to Formspree)
   ───────────────────────────────────────────────────── */
function wireEnquiryCapture(form) {
  form.addEventListener("submit", function () {
    const g = id => (form.querySelector("#" + id) || {}).value || "";
    const name    = g("name").trim();
    const email   = g("email").trim();
    const phone   = g("phone").trim();
    const company = g("company").trim();
    const country = g("country").trim();
    const product = g("product");
    const qty     = g("quantity").trim();
    const message = g("message").trim();

    if (!name || !email || !phone || !company || !message) return;

    try {
      KFData.addEnquiry({ name, email, phone, company, country, product, quantity: qty, message });
    } catch (_) { /* never break the form submission */ }
  });
}

/* ─────────────────────────────────────────────────────
   UTILITY
   ───────────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
