# KingFresh Trading Company — Website Setup & Management Guide
## Complete Guide for Agency / Developer Handover

---

## 🗂️ WHAT YOU CAN MANAGE (Client Capabilities)

| Task | How | Time Required |
|------|-----|--------------|
| View/receive quote enquiries | Email inbox (automatic) | Instant |
| Add or remove products | Admin Panel → Products | 2 minutes |
| Update contact details / phone | Admin Panel → Settings | 1 minute |
| Add a testimonial | Admin Panel → Testimonials | 2 minutes |
| Update certifications | Admin Panel → Certifications | 2 minutes |
| Add export regions | Admin Panel → Export Regions | 1 minute |

---

## ⚡ OPTION 1 — RECOMMENDED: Free Setup (Netlify + Formspree)

### STEP 1 — Deploy Website (10 minutes, free forever)

1. Go to **https://netlify.com** → click **"Sign up"** → use Google or email
2. Click **"Add new site"** → **"Deploy manually"**
3. Open the **kingfresh** folder on your computer
4. Drag and drop the **entire kingfresh folder** into the Netlify drop zone
5. Wait ~30 seconds → your site is live at a URL like `random-name-123.netlify.app`
6. To change the URL: Site settings → Domain management → Options → Edit site name → type `kingfreshtrading`
7. Site is now live at: **https://kingfreshtrading.netlify.app**

> **Custom domain (optional):** If client has `kingfreshtrading.com`, go to Domain settings → Add custom domain → follow DNS instructions.

---

### STEP 2 — Enable Form Submissions to Email (5 minutes, free)

**Option A — Formspree (Easiest, free 50/month):**
1. Go to **https://formspree.io** → Sign up free
2. Click **"+ New Form"** → Name: "KingFresh Enquiries" → Create
3. Copy the Form Endpoint URL (looks like `https://formspree.io/f/xrgjeabc`)
4. Open `contact.html` in Notepad
5. Find: `action="https://formspree.io/f/YOUR_FORM_ID"`
6. Replace `YOUR_FORM_ID` with your actual ID (e.g. `xrgjeabc`)
7. Save the file → re-deploy to Netlify (drag and drop again)
8. Go to Formspree dashboard → Settings → **add client email** for notifications

**Option B — Netlify Forms (Easier, free 100/month):**
1. Open `contact.html` in Notepad
2. Find: `<form id="contact-form" action="..."`
3. Change to: `<form id="contact-form" name="contact" netlify netlify-honeypot="bot-field"`
4. Add inside the form: `<input type="hidden" name="form-name" value="contact" />`
5. Re-deploy → Netlify automatically captures all form submissions
6. Go to Netlify → Forms tab → set up email notifications

✅ **Result:** Every time someone fills out the quote form → client gets an email with all details.

---

### STEP 3 — Enable Admin Panel for Content Editing (15 minutes)

This gives the client a visual dashboard at `yourdomain.com/admin`

1. In Netlify dashboard → **Identity** tab → **Enable Identity**
2. Under Registration: change to **"Invite only"** (important for security)
3. Go to **Git Gateway** section → Enable Git Gateway
4. Click **Invite users** → enter client's email → Send invite
5. Client clicks email link → sets password → now can log in at `/admin`

**What the client sees at `/admin`:**
```
📁 Site Settings     ← Edit phone, email, address, stats
📁 Products          ← Add / edit / delete products
📁 Testimonials      ← Add new client reviews
📁 Certifications    ← Update certificates
📁 Export Regions    ← Manage countries served
```

---

## 💰 OPTION 2 — Hostinger Hosting (~$2-3/month)

**Best if client already has Hostinger or wants their own hosting.**

### STEP 1 — Upload Files to Hostinger
1. Log in to Hostinger hPanel
2. Go to **File Manager** → `public_html` folder
3. Upload all files from the `kingfresh` folder
4. Make sure `index.html` is directly inside `public_html`

### STEP 2 — Form Submissions
Use **Formspree** (same as above, Step 2 Option A) — works with any hosting.

### STEP 3 — Content Editing on Hostinger
Since Hostinger doesn't have a built-in CMS, options are:

**A) Edit via hPanel File Manager** (basic):
- Client logs into Hostinger → File Manager → opens HTML files → edits text
- Not ideal for non-technical users

**B) Install WordPress via Hostinger** (recommended for long-term):
- Hostinger hPanel → Websites → Add Website → WordPress (1-click install)
- Rebuild site in WordPress for full CMS
- Client uses WP admin dashboard (`/wp-admin`) — very beginner-friendly
- Products become WP posts/pages

**C) Use Formspree + Google Sheets (no-code editing)**:
- See Option 3 below

---

## 📊 OPTION 3 — Google Sheets as Product Database (No-Code, Brilliant for Non-Tech Clients)

**How it works:**
- All products are stored in a Google Sheet
- The website reads from the sheet automatically
- Client edits products in Google Sheets — changes appear on site instantly
- No admin panel needed, no coding

### Setup Steps:

1. Create a Google Sheet with columns:
   ```
   | name | category | emoji | origin | availability | badge | tags | active |
   ```

2. File → Share → **"Anyone with link can view"**

3. Publish to web: File → Share → Publish to web → CSV format → Copy URL

4. Add this script to `js/main.js`:
   ```javascript
   // Fetch products from Google Sheets
   const SHEET_CSV_URL = 'YOUR_PUBLISHED_CSV_URL_HERE';
   
   async function loadProductsFromSheet() {
     const res = await fetch(SHEET_CSV_URL);
     const csv = await res.text();
     const rows = csv.split('\n').slice(1); // skip header
     // Parse and render products...
   }
   ```

5. Client simply opens the Google Sheet and edits — no login to website needed

> **Note:** This requires a small JavaScript enhancement to the existing site. About 1 hour of developer work.

---

## 📱 OPTION 4 — WhatsApp Business (Simplest Quote Management)

For a non-technical client, this might be the most practical for quotes:

1. Client creates **WhatsApp Business** account with their number
2. Set up **Auto-reply**: "Thank you for contacting KingFresh! We'll respond within 2 hours."
3. Set up **Catalog** in WhatsApp Business to showcase products
4. Update the WhatsApp link in the website to their Business number

**Update in all HTML files:**
```
href="https://wa.me/91XXXXXXXXXX?text=Hello%20KingFresh!"
```

---

## 🔒 SECURITY CHECKLIST (Already Done in Website)

- ✅ No exposed API keys or passwords in code
- ✅ Form uses honeypot spam protection (via Formspree)
- ✅ HTTPS enforced (automatic on Netlify)
- ✅ Security headers configured in `netlify.toml`
- ✅ Admin panel is invite-only (no public registration)
- ✅ GDPR cookie consent banner included
- ✅ No sensitive data stored in frontend code

---

## 📧 RECOMMENDED WORKFLOW FOR CLIENT

### Daily:
- Check email inbox for new quote notifications from Formspree
- Reply to enquiries within 2 hours (as promised on site)

### When products change seasonally:
- Log in to `/admin` → Products → Edit availability dates
- Or: Update Google Sheet if using Option 3

### When new testimonials arrive:
- Log in to `/admin` → Testimonials → Add New

### When certifications are renewed:
- Log in to `/admin` → Certifications → Update

---

## 📞 QUICK REFERENCE

| Thing to change | Where to change it |
|----------------|-------------------|
| Phone number   | Admin → Settings → Phone |
| Email address  | Admin → Settings → Email |
| Add a product  | Admin → Products → + New |
| Remove a product | Admin → Products → Edit → Set Active = OFF |
| New testimonial | Admin → Testimonials → + New |
| View all enquiries | Formspree dashboard OR email inbox |

---

## 🎓 VIDEO TUTORIALS (Share with client)

- Netlify deploy: https://www.youtube.com/watch?v=_ZGcCRO_KGs
- Formspree setup: https://formspree.io/blog/
- Decap CMS guide: https://decapcms.org/docs/intro/

---

*Website built by: [Your Agency Name] | Support: [Your Contact]*
*Last updated: May 2025*
