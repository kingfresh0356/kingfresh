/* =====================================================
   KINGFRESH — Firebase App Core
   Auth + Firestore real-time operations
   ===================================================== */

import { initializeApp }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged, updateProfile }
                                 from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
         collection, query, where, orderBy, limit, onSnapshot,
         serverTimestamp, getDocs, increment }
                                 from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL, DEFAULT_SETTINGS } from "./firebase-config.js";

/* ── Init ─────────────────────────────────────────── */
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* ── Current user state (reactive) ──────────────────  */
let currentUser = null;
let currentUserData = null;

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    const snap = await getDoc(doc(db, "users", user.uid));
    currentUserData = snap.exists() ? snap.data() : null;
  } else {
    currentUserData = null;
  }
  document.dispatchEvent(new CustomEvent("kf:authChange", {
    detail: { user, userData: currentUserData }
  }));
});

/* =====================================================
   AUTH HELPERS
   ===================================================== */

/** Register a new user */
async function registerUser({ name, email, phone, company, country, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const role = email === ADMIN_EMAIL ? "admin" : "customer";
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid, name, email, phone, company, country, role,
    createdAt: serverTimestamp()
  });
  return { user: cred.user, role };
}

/** Login */
async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  const userData = snap.exists() ? snap.data() : { role: "customer" };
  return { user: cred.user, role: userData.role };
}

/** Logout */
async function logoutUser() {
  await signOut(auth);
}

/** Get current user role */
async function getUserRole() {
  if (!currentUser) return null;
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  return snap.exists() ? snap.data().role : "customer";
}

/* =====================================================
   PRODUCTS
   ===================================================== */

/** Real-time product listener (returns unsubscribe fn) */
function listenProducts(category, callback) {
  let q;
  if (category && category !== "all") {
    q = query(collection(db, "products"),
      where("active", "==", true),
      where("category", "==", category),
      orderBy("createdAt", "desc"));
  } else {
    q = query(collection(db, "products"),
      where("active", "==", true),
      orderBy("createdAt", "desc"));
  }
  return onSnapshot(q, (snap) => {
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(products);
  });
}

/** Admin: listen ALL products (including inactive) */
function listenAllProducts(callback) {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Admin: add product */
async function addProduct(data) {
  return addDoc(collection(db, "products"), {
    ...data, active: true, createdAt: serverTimestamp(), orders: 0
  });
}

/** Admin: update product */
async function updateProduct(id, data) {
  return updateDoc(doc(db, "products", id), { ...data, updatedAt: serverTimestamp() });
}

/** Admin: delete product */
async function deleteProduct(id) {
  return deleteDoc(doc(db, "products", id));
}

/* =====================================================
   ORDERS
   ===================================================== */

const ORDER_STATUS = {
  new:        { label: "New",        color: "#c9a227", bg: "rgba(201,162,39,0.12)" },
  processing: { label: "Processing", color: "#0a5c36", bg: "rgba(10,92,54,0.10)"  },
  shipped:    { label: "Shipped",    color: "#1565c0", bg: "rgba(21,101,192,0.10)" },
  delivered:  { label: "Delivered",  color: "#2e7d32", bg: "rgba(46,125,50,0.10)"  },
  cancelled:  { label: "Cancelled",  color: "#c62828", bg: "rgba(198,40,40,0.10)"  }
};

/** Customer: place an order */
async function placeOrder(orderData) {
  if (!currentUser) throw new Error("Must be logged in to place an order.");
  const ref = await addDoc(collection(db, "orders"), {
    ...orderData,
    userId:       currentUser.uid,
    customerName: currentUserData?.name || orderData.name,
    customerEmail:currentUser.email,
    status:       "new",
    createdAt:    serverTimestamp()
  });
  // Increment product order counter
  if (orderData.productId) {
    await updateDoc(doc(db, "products", orderData.productId),
      { orders: increment(1) });
  }
  return ref.id;
}

/** Customer: listen to their own orders */
function listenMyOrders(callback) {
  if (!currentUser) return () => {};
  const q = query(collection(db, "orders"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Admin: listen ALL orders (real-time) */
function listenAllOrders(statusFilter, callback) {
  let q;
  if (statusFilter && statusFilter !== "all") {
    q = query(collection(db, "orders"),
      where("status", "==", statusFilter),
      orderBy("createdAt", "desc"));
  } else {
    q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
  }
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Admin: update order status */
async function updateOrderStatus(orderId, status) {
  return updateDoc(doc(db, "orders", orderId), {
    status, updatedAt: serverTimestamp()
  });
}

/* =====================================================
   REVIEWS
   ===================================================== */

/** Submit a review (customer) */
async function submitReview({ rating, review, orderId }) {
  if (!currentUser || !currentUserData) throw new Error("Must be logged in.");
  return addDoc(collection(db, "reviews"), {
    userId:    currentUser.uid,
    name:      currentUserData.name,
    company:   currentUserData.company || "",
    country:   currentUserData.country || "",
    email:     currentUser.email,
    orderId:   orderId || null,
    rating,
    review,
    approved:  false,  // admin must approve
    createdAt: serverTimestamp()
  });
}

/** Listen to approved reviews (public) */
function listenApprovedReviews(callback) {
  const q = query(collection(db, "reviews"),
    where("approved", "==", true),
    orderBy("createdAt", "desc"),
    limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Admin: listen all reviews (including unapproved) */
function listenAllReviews(callback) {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Admin: approve review */
async function approveReview(id) {
  return updateDoc(doc(db, "reviews", id), { approved: true });
}

/** Admin: delete review */
async function deleteReview(id) {
  return deleteDoc(doc(db, "reviews", id));
}

/* =====================================================
   SETTINGS
   ===================================================== */

/** Listen to site settings (real-time) */
function listenSettings(callback) {
  return onSnapshot(doc(db, "settings", "site"), (snap) => {
    callback(snap.exists() ? snap.data() : DEFAULT_SETTINGS);
  });
}

/** Admin: save settings */
async function saveSettings(data) {
  return setDoc(doc(db, "settings", "site"), data, { merge: true });
}

/* =====================================================
   ADMIN STATS (real-time dashboard summary)
   ===================================================== */
function listenAdminStats(callback) {
  // Listen to new orders count
  const newOrdersQ = query(collection(db, "orders"), where("status", "==", "new"));
  const pendingReviewsQ = query(collection(db, "reviews"), where("approved", "==", false));
  const productsQ = query(collection(db, "products"), where("active", "==", true));

  let stats = { newOrders: 0, pendingReviews: 0, activeProducts: 0 };

  const u1 = onSnapshot(newOrdersQ, s => {
    stats.newOrders = s.size;
    callback({ ...stats });
  });
  const u2 = onSnapshot(pendingReviewsQ, s => {
    stats.pendingReviews = s.size;
    callback({ ...stats });
  });
  const u3 = onSnapshot(productsQ, s => {
    stats.activeProducts = s.size;
    callback({ ...stats });
  });

  return () => { u1(); u2(); u3(); };
}

/* =====================================================
   SEED INITIAL DATA (run once to populate Firestore)
   Call from browser console: kf.seedData()
   ===================================================== */
async function seedData() {
  // Default settings
  await setDoc(doc(db, "settings", "site"), DEFAULT_SETTINGS, { merge: true });

  // Default products
  const products = [
    { name:"Alphonso Mango",   category:"Fruits",     emoji:"🥭", origin:"Ratnagiri, Maharashtra", availability:"April – June",    badge:"Bestseller",  tags:["GI Tagged","Export Grade A"],  active:true, minOrder:"1 MT",  orders:0 },
    { name:"Fresh Grapes",     category:"Fruits",     emoji:"🍇", origin:"Nashik, Maharashtra",    availability:"January – April", badge:"Premium",     tags:["Thompson Seedless","17 Brix"],  active:true, minOrder:"1 MT",  orders:0 },
    { name:"Kashmiri Apple",   category:"Fruits",     emoji:"🍎", origin:"Kashmir Valley",         availability:"September – Nov", badge:"",            tags:["Royal Delicious","Fresh"],      active:true, minOrder:"1 MT",  orders:0 },
    { name:"Nagpur Orange",    category:"Fruits",     emoji:"🍊", origin:"Nagpur, Maharashtra",    availability:"November – Jan",  badge:"",            tags:["GI Tagged","High Brix"],        active:true, minOrder:"1 MT",  orders:0 },
    { name:"Pomegranate",      category:"Fruits",     emoji:"🍑", origin:"Solapur, Maharashtra",   availability:"Sep – Feb",       badge:"High Demand", tags:["Bhagwa","Arakta"],             active:true, minOrder:"1 MT",  orders:0 },
    { name:"Cavendish Banana", category:"Fruits",     emoji:"🍌", origin:"Jalgaon, Maharashtra",   availability:"Year Round",      badge:"",            tags:["Grade A","Export Grade"],       active:true, minOrder:"5 MT",  orders:0 },
    { name:"Fresh Onion",      category:"Vegetables", emoji:"🧅", origin:"Nashik, Maharashtra",    availability:"Year Round",      badge:"Top Export",  tags:["Red & White","50-60mm"],        active:true, minOrder:"10 MT", orders:0 },
    { name:"Fresh Garlic",     category:"Vegetables", emoji:"🧄", origin:"Madhya Pradesh",         availability:"Year Round",      badge:"",            tags:["High Pungency","Export Grade"], active:true, minOrder:"2 MT",  orders:0 },
    { name:"Fresh Ginger",     category:"Vegetables", emoji:"🫚", origin:"Kerala & NE India",      availability:"Year Round",      badge:"",            tags:["High Oleoresin","Grade A"],     active:true, minOrder:"2 MT",  orders:0 },
    { name:"Red Chili",        category:"Vegetables", emoji:"🌶️", origin:"Andhra Pradesh",        availability:"Year Round",      badge:"Hot Seller",  tags:["Teja","Byadgi"],               active:true, minOrder:"1 MT",  orders:0 },
    { name:"Bell Pepper",      category:"Vegetables", emoji:"🫑", origin:"Himachal Pradesh",       availability:"Year Round",      badge:"",            tags:["Red / Yellow / Green"],         active:true, minOrder:"1 MT",  orders:0 },
    { name:"Dragon Fruit",     category:"Exotic",     emoji:"🐉", origin:"Tamil Nadu",             availability:"Year Round",      badge:"Exotic",      tags:["Red Flesh","Superfood"],        active:true, minOrder:"500 kg",orders:0 },
    { name:"King Coconut",     category:"Exotic",     emoji:"🥥", origin:"Kerala",                 availability:"Year Round",      badge:"",            tags:["Tender","Mature"],              active:true, minOrder:"1000 pcs",orders:0 },
  ];

  const batch = products.map(p => addDoc(collection(db, "products"), {
    ...p, createdAt: serverTimestamp()
  }));
  await Promise.all(batch);
  console.log("✅ Seed complete! Products and settings added.");
}

/* =====================================================
   UTILITY
   ===================================================== */
function formatDate(ts) {
  if (!ts) return "–";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}
function formatDateTime(ts) {
  if (!ts) return "–";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric",
    hour:"2-digit", minute:"2-digit" });
}

/* ── Public API ──────────────────────────────────── */
window.kf = {
  auth, db,
  registerUser, loginUser, logoutUser, getUserRole,
  listenProducts, listenAllProducts, addProduct, updateProduct, deleteProduct,
  placeOrder, listenMyOrders, listenAllOrders, updateOrderStatus, ORDER_STATUS,
  submitReview, listenApprovedReviews, listenAllReviews, approveReview, deleteReview,
  listenSettings, saveSettings,
  listenAdminStats,
  seedData, formatDate, formatDateTime,
  get currentUser() { return currentUser; },
  get currentUserData() { return currentUserData; }
};

export { auth, db, registerUser, loginUser, logoutUser, getUserRole,
  listenProducts, listenAllProducts, addProduct, updateProduct, deleteProduct,
  placeOrder, listenMyOrders, listenAllOrders, updateOrderStatus, ORDER_STATUS,
  submitReview, listenApprovedReviews, listenAllReviews, approveReview, deleteReview,
  listenSettings, saveSettings, listenAdminStats,
  seedData, formatDate, formatDateTime };
