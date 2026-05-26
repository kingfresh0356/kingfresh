/* =====================================================
   KINGFRESH TRADING COMPANY — Firebase Configuration

   SETUP INSTRUCTIONS (one-time, takes ~10 minutes):
   =====================================================
   1. Go to https://console.firebase.google.com
   2. Click "Add project" → Name it "kingfresh-trading" → Continue
   3. Disable Google Analytics (optional) → Create project
   4. Click "Web" icon (</>)  → Register app as "kingfresh-web"
   5. Copy the firebaseConfig object and paste BELOW
   6. In Firebase console → Build → Authentication
      → Sign-in method → Enable "Email/Password"
   7. In Firebase console → Build → Firestore Database
      → Create database → Start in "production mode" → choose region
   8. In Firestore → Rules tab → paste the rules from firestore.rules file
   9. Done! Your site now has real-time data + auth.
   ===================================================== */

// ↓↓↓ PASTE YOUR FIREBASE CONFIG HERE ↓↓↓
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ↑↑↑ PASTE YOUR FIREBASE CONFIG HERE ↑↑↑

/* =====================================================
   Admin Email — the account with this email gets
   full admin access automatically when they register.
   Change this to the real admin email address.
   ===================================================== */
const ADMIN_EMAIL = "exports@kingfresh.com";

/* =====================================================
   Default Site Settings (used before Firebase loads)
   ===================================================== */
const DEFAULT_SETTINGS = {
  companyName:   "KingFresh Trading Company",
  phone:         "+91 98765 43210",
  whatsapp:      "+919876543210",
  email:         "exports@kingfresh.com",
  address:       "KingFresh House, Plot 47, Export Hub, Andheri East, Mumbai – 400 069, India",
  yearFounded:   "2019",
  countries:     50,
  tonsPerYear:   10000,
  happyClients:  500,
  tagline:       "From Farm to the World"
};

export { firebaseConfig, ADMIN_EMAIL, DEFAULT_SETTINGS };
