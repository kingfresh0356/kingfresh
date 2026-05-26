/* =====================================================
   KINGFRESH TRADING COMPANY — Main JavaScript
   ===================================================== */

'use strict';

/* ============================================
   PRELOADER
   ============================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 2200);
  }
  document.body.style.overflow = 'hidden';
});

/* ============================================
   PROGRESS BAR
   ============================================ */
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
  }, { passive: true });
}

/* ============================================
   NAVBAR
   ============================================ */
const navbar   = document.querySelector('.navbar');
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

function updateNavbar() {
  if (!navbar) return;
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  } else {
    navbar.classList.remove('scrolled');
    navbar.classList.add('transparent');
  }
}
updateNavbar();
window.addEventListener('scroll', updateNavbar, { passive: true });

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

// Active nav link based on scroll
const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.nav-link[href^="#"]');
function updateActiveLink() {
  const scrollY = window.scrollY;
  sections.forEach(section => {
    const top    = section.offsetTop - 120;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < bottom) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ============================================
   SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navH - 20,
        behavior: 'smooth'
      });
    }
  });
});

/* ============================================
   HERO CANVAS PARTICLE ANIMATION
   ============================================ */
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x      = Math.random() * canvas.width;
      this.y      = initial ? Math.random() * canvas.height : canvas.height + 20;
      this.size   = Math.random() * 5 + 1.5;
      this.speed  = Math.random() * 0.8 + 0.3;
      this.opac   = Math.random() * 0.45 + 0.05;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
      this.color  = Math.random() > 0.7 ? 'rgba(244,162,40,' : 'rgba(255,255,255,';
    }
    update() {
      this.y -= this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.4;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.opac + ')';
      ctx.fill();
    }
  }

  // Init particles
  for (let i = 0; i < 110; i++) particles.push(new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

/* ============================================
   TYPED / ROTATING WORDS
   ============================================ */
const typedEl = document.getElementById('typed-text');
if (typedEl) {
  const words   = ['Fresh Fruits', 'Premium Vegetables', 'Export Excellence', 'Global Quality'];
  let wIdx = 0, cIdx = 0, isDeleting = false;

  function typeWrite() {
    const word = words[wIdx];
    if (!isDeleting) {
      typedEl.textContent = word.slice(0, cIdx + 1);
      cIdx++;
      if (cIdx === word.length) {
        isDeleting = true;
        setTimeout(typeWrite, 1800);
        return;
      }
    } else {
      typedEl.textContent = word.slice(0, cIdx - 1);
      cIdx--;
      if (cIdx === 0) {
        isDeleting = false;
        wIdx = (wIdx + 1) % words.length;
      }
    }
    setTimeout(typeWrite, isDeleting ? 55 : 90);
  }
  setTimeout(typeWrite, 1000);
}

/* ============================================
   SCROLL REVEAL (Intersection Observer)
   ============================================ */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

/* ============================================
   COUNTER ANIMATIONS
   ============================================ */
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const cntObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        const target  = +entry.target.dataset.count;
        const suffix  = entry.target.dataset.suffix || '';
        const dur     = 2000;
        const step    = dur / 60;
        let current   = 0;
        const isFloat = (target % 1 !== 0);
        const increment = target / (dur / 16);

        const update = () => {
          current = Math.min(current + increment, target);
          entry.target.textContent = isFloat ? current.toFixed(1) + suffix
            : Math.floor(current) + suffix;
          if (current < target) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
        cntObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counters.forEach(c => cntObserver.observe(c));
}

/* ============================================
   PRODUCT TABS
   ============================================ */
const tabBtns = document.querySelectorAll('.tab-btn');
const productGroups = document.querySelectorAll('.product-group');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    productGroups.forEach(group => {
      if (group.dataset.group === target || target === 'all') {
        group.style.display = '';
        group.querySelectorAll('.product-card').forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity .4s ease, transform .4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 60);
        });
      } else {
        group.style.display = 'none';
      }
    });
  });
});

/* ============================================
   TESTIMONIALS SLIDER
   ============================================ */
const track       = document.querySelector('.testimonials-track');
const prevBtn     = document.querySelector('.testimonial-prev');
const nextBtn     = document.querySelector('.testimonial-next');
const dotsWrap    = document.querySelector('.testimonial-dots');
let currentSlide  = 0;

function getSlideCount() {
  if (!track) return 0;
  const cards = track.querySelectorAll('.testimonial-card');
  const w     = window.innerWidth;
  const perView = w <= 768 ? 1 : w <= 1024 ? 2 : 3;
  return Math.max(0, cards.length - perView);
}

function goToSlide(idx) {
  if (!track) return;
  const cards = track.querySelectorAll('.testimonial-card');
  if (!cards.length) return;
  const cardW = cards[0].offsetWidth + 32; // gap
  const maxSlide = getSlideCount();
  currentSlide = Math.max(0, Math.min(idx, maxSlide));
  track.style.transform = `translateX(-${currentSlide * cardW}px)`;

  // Dots
  if (dotsWrap) {
    dotsWrap.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }
}

if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));

// Build dots
if (dotsWrap && track) {
  const total = getSlideCount() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  }
}

// Auto-advance
let autoSlide = setInterval(() => goToSlide(currentSlide + 1 > getSlideCount() ? 0 : currentSlide + 1), 5000);
if (track) {
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.parentElement.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => goToSlide(currentSlide + 1 > getSlideCount() ? 0 : currentSlide + 1), 5000);
  });
}
window.addEventListener('resize', () => goToSlide(0), { passive: true });

/* ============================================
   TRUST BAR — DUPLICATE FOR INFINITE SCROLL
   ============================================ */
const trustTrack = document.querySelector('.trust-track');
if (trustTrack) {
  const items = trustTrack.innerHTML;
  trustTrack.innerHTML += items; // duplicate for seamless loop
}

/* ============================================
   BACK TO TOP
   ============================================ */
const btt = document.getElementById('back-to-top');
if (btt) {
  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================
   COOKIE CONSENT
   ============================================ */
const cookieBanner = document.getElementById('cookie-banner');
if (cookieBanner && !localStorage.getItem('kf_cookie_accepted')) {
  setTimeout(() => cookieBanner.classList.add('show'), 2500);
  const acceptBtn  = document.querySelector('.cookie-accept');
  const declineBtn = document.querySelector('.cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', () => {
    localStorage.setItem('kf_cookie_accepted', '1');
    cookieBanner.classList.remove('show');
  });
  if (declineBtn) declineBtn.addEventListener('click', () => {
    cookieBanner.classList.remove('show');
  });
}

/* ============================================
   CONTACT FORM — VALIDATION & SUBMIT
   ============================================ */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // Clear previous errors
    contactForm.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    contactForm.querySelectorAll('.form-input,.form-textarea,.form-select')
      .forEach(el => el.classList.remove('error'));

    // Validate fields
    const name    = contactForm.querySelector('[name="name"]');
    const email   = contactForm.querySelector('[name="email"]');
    const phone   = contactForm.querySelector('[name="phone"]');
    const company = contactForm.querySelector('[name="company"]');
    const product = contactForm.querySelector('[name="product"]');
    const message = contactForm.querySelector('[name="message"]');

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\+]?[\d\s\-\(\)]{7,18}$/;

    function setErr(field, errId, msg) {
      if (!field) return;
      field.classList.add('error');
      const errEl = document.getElementById(errId);
      if (errEl) errEl.textContent = msg;
      valid = false;
    }

    if (name  && !name.value.trim())             setErr(name,  'err-name',    'Please enter your full name.');
    if (email && !emailRe.test(email.value))      setErr(email, 'err-email',   'Please enter a valid email address.');
    if (phone && !phoneRe.test(phone.value))      setErr(phone, 'err-phone',   'Please enter a valid phone number.');
    if (company && !company.value.trim())         setErr(company,'err-company','Please enter your company name.');
    if (product && !product.value)                setErr(product,'err-product','Please select a product category.');
    if (message && message.value.trim().length < 10) setErr(message,'err-message','Please provide more details (min 10 chars).');

    if (valid) {
      const submitBtn = contactForm.querySelector('.form-submit');
      const original  = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Simulate submission (replace with real endpoint e.g. Formspree)
      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = original;
        submitBtn.disabled = false;
        const successEl = document.getElementById('form-success');
        if (successEl) { successEl.style.display = 'block'; }
        setTimeout(() => {
          if (successEl) successEl.style.display = 'none';
        }, 5000);
      }, 1800);
    }
  });
}

/* ============================================
   NEWSLETTER FORM
   ============================================ */
const newsletterForms = document.querySelectorAll('.footer-newsletter-form');
newsletterForms.forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      const btn = form.querySelector('button');
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#2d7a4f';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3000);
    }
  });
});

/* ============================================
   FAQ ACCORDION
   ============================================ */
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  if (question) {
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(o => o.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }
});

/* ============================================
   PRODUCTS SEARCH FILTER
   ============================================ */
const searchInput = document.querySelector('.filter-search input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.product-card').forEach(card => {
      const name = card.querySelector('.product-card-name')?.textContent.toLowerCase() || '';
      const tags = card.querySelector('.product-card-tags')?.textContent.toLowerCase() || '';
      card.style.display = (!q || name.includes(q) || tags.includes(q)) ? '' : 'none';
    });
  });
}

/* ============================================
   STAT CARD HOVER GLOW
   ============================================ */
document.querySelectorAll('.stat-card, .why-card, .product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

/* ============================================
   PAGE INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Set active nav link based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(path)) link.classList.add('active');
    if (path === 'index.html' && (href === '/' || href === 'index.html' || href === './')) link.classList.add('active');
  });
});
