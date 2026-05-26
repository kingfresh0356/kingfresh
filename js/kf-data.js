/* =====================================================
   KINGFRESH — Data Layer
   Reads from localStorage (admin-managed).
   Falls back to DEFAULT_DATA if nothing saved yet.
   ===================================================== */

const KF_KEYS = {
  products:  "kf_products",
  settings:  "kf_settings",
  enquiries: "kf_enquiries",
  adminPass: "kf_admin_pass"
};

/* ── Default admin password (hashed for basic security) ─ */
/* Change via admin panel → Settings. SHA-256 of "kingfresh@2019" */
const DEFAULT_PASS_HASH = "a166304e5a1a278af0c4c892355c17c4576219d5f957baa21185f5a3770a407f";

/* ── Default site settings ─────────────────────────────── */
const DEFAULT_SETTINGS = {
  companyName:   "KingFresh Trading Company",
  tagline:       "From Farm to the World",
  yearFounded:   "2019",
  phone:         "+91 98765 43210",
  whatsapp:      "919876543210",            // digits only, no +
  whatsappMsg:   "Hello KingFresh! I am interested in your export products.",
  email:         "exports@kingfresh.com",
  address:       "KingFresh House, Plot 20, Hanuman Vatika, Gokulpura Kalwar Road, Jaipur – 302012, India",
  countries:     "50+",
  tonsYear:      "10,000+",
  clients:       "500+",
  yearsExp:      "6+",
  satisfaction:  "99%"
};

/* ── Default products ──────────────────────────────────── */
const DEFAULT_PRODUCTS = [
  { id:"p1",  name:"Alphonso Mango",    category:"Fruits",     emoji:"🥭", origin:"Ratnagiri, Maharashtra",  availability:"April – June",    badge:"Bestseller", tags:"GI Tagged, Export Grade A",  active:true, minOrder:"1 MT",   desc:"Premium GI-tagged Alphonso mangoes, handpicked at peak ripeness." },
  { id:"p2",  name:"Fresh Grapes",      category:"Fruits",     emoji:"🍇", origin:"Nashik, Maharashtra",     availability:"January – April", badge:"Premium",    tags:"Thompson Seedless, 17 Brix", active:true, minOrder:"1 MT",   desc:"Crisp, sweet Thompson Seedless grapes with high brix rating." },
  { id:"p3",  name:"Kashmiri Apple",    category:"Fruits",     emoji:"🍎", origin:"Kashmir Valley",          availability:"Sep – November",  badge:"",           tags:"Royal Delicious, Fresh",     active:true, minOrder:"1 MT",   desc:"Premium Kashmiri apples with natural colour and crunch." },
  { id:"p4",  name:"Nagpur Orange",     category:"Fruits",     emoji:"🍊", origin:"Nagpur, Maharashtra",     availability:"November – Jan",  badge:"",           tags:"GI Tagged, High Brix",       active:true, minOrder:"1 MT",   desc:"World-renowned GI-tagged Nagpur oranges, rich in juice." },
  { id:"p5",  name:"Pomegranate",       category:"Fruits",     emoji:"🍑", origin:"Solapur, Maharashtra",    availability:"Sep – February",  badge:"High Demand",tags:"Bhagwa, Arakta Variety",     active:true, minOrder:"1 MT",   desc:"Export-grade Bhagwa pomegranates, deep red arils." },
  { id:"p6",  name:"Cavendish Banana",  category:"Fruits",     emoji:"🍌", origin:"Jalgaon, Maharashtra",    availability:"Year Round",      badge:"",           tags:"Grade A, Export Grade",      active:true, minOrder:"5 MT",   desc:"Grade A Cavendish bananas, consistent ripening for export." },
  { id:"p7",  name:"Fresh Onion",       category:"Vegetables", emoji:"🧅", origin:"Nashik, Maharashtra",     availability:"Year Round",      badge:"Top Export", tags:"Red & White, 50-60mm",       active:true, minOrder:"10 MT",  desc:"Export-grade Indian onions, long shelf life, multiple grades." },
  { id:"p8",  name:"Fresh Garlic",      category:"Vegetables", emoji:"🧄", origin:"Madhya Pradesh",          availability:"Year Round",      badge:"",           tags:"High Pungency, Grade A",     active:true, minOrder:"2 MT",   desc:"Premium Indian garlic with high pungency and essential oils." },
  { id:"p9",  name:"Fresh Ginger",      category:"Vegetables", emoji:"🫚", origin:"Kerala & NE India",       availability:"Year Round",      badge:"",           tags:"High Oleoresin, Grade A",    active:true, minOrder:"2 MT",   desc:"Fresh ginger with high oleoresin content, export grade." },
  { id:"p10", name:"Red Chili",         category:"Vegetables", emoji:"🌶️", origin:"Andhra Pradesh",         availability:"Year Round",      badge:"Hot Seller", tags:"Teja, Byadgi, High Colour",  active:true, minOrder:"1 MT",   desc:"High-colour Teja and Byadgi chilies for global spice markets." },
  { id:"p11", name:"Bell Pepper",       category:"Vegetables", emoji:"🫑", origin:"Himachal Pradesh",        availability:"Year Round",      badge:"",           tags:"Red / Yellow / Green",       active:true, minOrder:"1 MT",   desc:"Premium coloured bell peppers, premium sizing for retail packs." },
  { id:"p12", name:"Dragon Fruit",      category:"Exotic",     emoji:"🐉", origin:"Tamil Nadu",              availability:"Year Round",      badge:"Exotic",     tags:"Red Flesh, Superfood",       active:true, minOrder:"500 kg", desc:"Vibrant red-flesh dragon fruit, growing demand in EU & Gulf." },
  { id:"p13", name:"King Coconut",      category:"Exotic",     emoji:"🥥", origin:"Kerala",                  availability:"Year Round",      badge:"",           tags:"Tender, Mature, Export",     active:true, minOrder:"1000 pcs",desc:"Tender and mature king coconuts, packed fresh for export." },
  { id:"p14", name:"Fresh Potato",      category:"Vegetables", emoji:"🥔", origin:"Agra, Uttar Pradesh",     availability:"Year Round",      badge:"",           tags:"Kufri Jyoti, Grade A",       active:true, minOrder:"10 MT",  desc:"Kufri Jyoti potatoes, stable shelf life, excellent for export." },
];

/* =====================================================
   DATA API
   ===================================================== */

const KFData = {
  /* SETTINGS */
  getSettings() {
    try {
      const s = localStorage.getItem(KF_KEYS.settings);
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : { ...DEFAULT_SETTINGS };
    } catch { return { ...DEFAULT_SETTINGS }; }
  },
  saveSettings(data) {
    localStorage.setItem(KF_KEYS.settings, JSON.stringify(data));
    document.dispatchEvent(new CustomEvent("kf:settingsChanged", { detail: data }));
  },

  /* PRODUCTS */
  getProducts(filterCategory) {
    try {
      const raw = localStorage.getItem(KF_KEYS.products);
      const all = raw ? JSON.parse(raw) : DEFAULT_PRODUCTS;
      const active = all.filter(p => p.active !== false);
      return filterCategory && filterCategory !== "all"
        ? active.filter(p => p.category === filterCategory)
        : active;
    } catch { return DEFAULT_PRODUCTS; }
  },
  getAllProducts() {
    try {
      const raw = localStorage.getItem(KF_KEYS.products);
      return raw ? JSON.parse(raw) : [...DEFAULT_PRODUCTS];
    } catch { return [...DEFAULT_PRODUCTS]; }
  },
  saveProducts(products) {
    localStorage.setItem(KF_KEYS.products, JSON.stringify(products));
    document.dispatchEvent(new CustomEvent("kf:productsChanged", { detail: products }));
  },
  addProduct(product) {
    const all = this.getAllProducts();
    product.id = "p" + Date.now();
    product.active = true;
    all.unshift(product);
    this.saveProducts(all);
    return product;
  },
  updateProduct(id, data) {
    const all = this.getAllProducts();
    const idx = all.findIndex(p => p.id === id);
    if (idx > -1) { all[idx] = { ...all[idx], ...data }; this.saveProducts(all); }
  },
  deleteProduct(id) {
    const all = this.getAllProducts().filter(p => p.id !== id);
    this.saveProducts(all);
  },

  /* ENQUIRIES (contact form submissions stored locally) */
  getEnquiries() {
    try {
      const raw = localStorage.getItem(KF_KEYS.enquiries);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  addEnquiry(data) {
    const all = this.getEnquiries();
    const enquiry = { ...data, id: "e" + Date.now(), date: new Date().toISOString(), read: false };
    all.unshift(enquiry);
    localStorage.setItem(KF_KEYS.enquiries, JSON.stringify(all));
    return enquiry;
  },
  markEnquiryRead(id) {
    const all = this.getEnquiries().map(e => e.id === id ? { ...e, read: true } : e);
    localStorage.setItem(KF_KEYS.enquiries, JSON.stringify(all));
  },
  deleteEnquiry(id) {
    const all = this.getEnquiries().filter(e => e.id !== id);
    localStorage.setItem(KF_KEYS.enquiries, JSON.stringify(all));
  },

  /* ADMIN AUTH */
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },
  async verifyPassword(input) {
    const hash = await this.hashPassword(input);
    const stored = localStorage.getItem(KF_KEYS.adminPass) || DEFAULT_PASS_HASH;
    return hash === stored;
  },
  async setPassword(newPassword) {
    const hash = await this.hashPassword(newPassword);
    localStorage.setItem(KF_KEYS.adminPass, hash);
  },

  /* EXPORT / IMPORT (for backup & cross-device sync) */
  exportData() {
    const data = {
      products: this.getAllProducts(),
      settings: this.getSettings(),
      enquiries: this.getEnquiries(),
      exported: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kingfresh-data-${new Date().toLocaleDateString("en-GB").replace(/\//g,"-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.products) this.saveProducts(data.products);
    if (data.settings) this.saveSettings(data.settings);
    if (data.enquiries) localStorage.setItem(KF_KEYS.enquiries, JSON.stringify(data.enquiries));
    return true;
  }
};

/* ── Make globally available ── */
window.KFData = KFData;
