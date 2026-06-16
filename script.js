// Force top of page on every load — three layers of defence
history.scrollRestoration = 'manual';
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

// ============================================================
// 1. PROFESSIONAL LOADER
// ============================================================
const createLoader = () => {
  const loader = document.createElement('div');
  loader.id = 'site-loader';
  loader.style.cssText = `
    position: fixed; inset: 0; background: #050505; z-index: 99999;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), visibility 0.9s ease;
  `;

  loader.innerHTML = `
    <style>
      #site-loader .loader-name {
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(2rem, 6vw, 3.5rem);
        font-weight: 700;
        letter-spacing: -0.04em;
        background: linear-gradient(135deg, #ffffff 0%, #3b9eff 40%, #9b59f5 70%, #00e5cc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        opacity: 0;
        transform: translateY(16px);
        animation: loaderNameIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s forwards;
      }
      #site-loader .loader-sub {
        font-family: 'Space Mono', monospace;
        font-size: 0.65rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: rgba(232,232,232,0.35);
        margin-top: 0.75rem;
        opacity: 0;
        animation: loaderSubIn 0.6s ease 0.35s forwards;
      }
      #site-loader .loader-bar-wrap {
        margin-top: 2.5rem;
        width: clamp(140px, 20vw, 200px);
        height: 1px;
        background: rgba(255,255,255,0.08);
        border-radius: 99px;
        overflow: hidden;
        opacity: 0;
        animation: loaderSubIn 0.6s ease 0.5s forwards;
      }
      #site-loader .loader-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #3b9eff, #9b59f5, #00e5cc);
        border-radius: 99px;
        animation: loaderFill 0.9s cubic-bezier(0.22,1,0.36,1) 0.5s forwards;
      }
      @keyframes loaderNameIn {
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes loaderSubIn {
        to { opacity: 1; }
      }
      @keyframes loaderFill {
        to { width: 100%; }
      }
    </style>
    <div class="loader-name">pssyho</div>
    <div class="loader-sub">front-end developer</div>
    <div class="loader-bar-wrap">
      <div class="loader-bar"></div>
    </div>
  `;

  document.body.appendChild(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 900);
    }, 600);
  });
};
createLoader();

// ============================================================
// 2. LENIS SMOOTH SCROLL INIT
// ============================================================
const lenis = new Lenis({
  duration: 1.6,
  smoothWheel: true,
  smoothTouch: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1.2,
  lerp: 0.08
});

// Make sure Lenis itself starts at 0 (not wherever the browser left off)
lenis.scrollTo(0, { immediate: true });

// Sync Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

// ============================================================
// 3. DYNAMIC SCROLL PROGRESS
// ============================================================
const progressBar = document.getElementById('scrollProgress');

lenis.on('scroll', ({ scroll, limit }) => {
  progressBar.style.width = `${(scroll / limit) * 100}%`;
});

// ============================================================
// 4. MOUSE SPOTLIGHT (GSAP QuickTo for performance)
// ============================================================
const spotlight = document.getElementById('cursorSpotlight');

// Set origin to center so x/y follow exactly
gsap.set(spotlight, { xPercent: -50, yPercent: -50 });

const xTo = gsap.quickTo(spotlight, "x", { duration: 0.4, ease: "power3" });
const yTo = gsap.quickTo(spotlight, "y", { duration: 0.4, ease: "power3" });

window.addEventListener("mousemove", (e) => {
  xTo(e.clientX);
  yTo(e.clientY);
});

// ============================================================
// 5. 3D HERO ROTATION
// ============================================================
const introContent = document.querySelector('.intro-content');
const heroSection = document.getElementById('intro');

if (heroSection && introContent) {
  // Set perspective once — on the parent so the child transform is clean
  gsap.set(heroSection, { perspective: 900 });
  // Initialise with zero rotation so GSAP owns the transform from the start
  gsap.set(introContent, { rotationX: 0, rotationY: 0, transformOrigin: "center center" });

  // quickTo avoids creating a new tween every mousemove — eliminates lag
  const rotYTo = gsap.quickTo(introContent, "rotationY", { duration: 0.6, ease: "power2.out" });
  const rotXTo = gsap.quickTo(introContent, "rotationX", { duration: 0.6, ease: "power2.out" });

  heroSection.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 16; // ±8 deg
    const y = (e.clientY / window.innerHeight - 0.5) * -16;
    rotYTo(x);
    rotXTo(y);
  });

  heroSection.addEventListener('mouseleave', () => {
    rotYTo(0);
    rotXTo(0);
  });
}

// ============================================================
// 6. GSAP SCROLL ANIMATIONS (Reveal Items)
// ============================================================
const revealElements = document.querySelectorAll('.reveal-item');

revealElements.forEach((el) => {
  // Read delay if present
  const delayMs = el.getAttribute('data-delay') || 0;
  const delaySec = delayMs / 1000;

  gsap.fromTo(el, 
    { y: 60, opacity: 0 }, 
    {
      y: 0,
      opacity: 1,
      duration: 1,
      delay: delaySec,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    }
  );
});

// ============================================================
// 7. CONTACT FORM — AJAX via FormSubmit (no redirect)
// ============================================================
const contactForm  = document.getElementById('contactForm');
const submitBtn    = document.getElementById('submitBtn');
const successEl    = document.getElementById('contactSuccess');

if (contactForm) {
  const fields = {
    name:    document.getElementById('cf-name'),
    email:   document.getElementById('cf-email'),
    subject: document.getElementById('cf-subject'),
    message: document.getElementById('cf-message'),
  };

  const validate = () => {
    let ok = true;

    Object.values(fields).forEach(f => f.classList.remove('error'));

    if (!fields.name.value.trim()) {
      fields.name.classList.add('error'); ok = false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(fields.email.value.trim())) {
      fields.email.classList.add('error'); ok = false;
    }
    if (!fields.subject.value.trim()) {
      fields.subject.classList.add('error'); ok = false;
    }
    if (fields.message.value.trim().length < 10) {
      fields.message.classList.add('error'); ok = false;
    }
    return ok;
  };

  // Clear error state on input
  Object.values(fields).forEach(f => {
    f.addEventListener('input', () => f.classList.remove('error'));
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn-spinner"></span><span class="btn-text" style="position:relative;z-index:1">Wysyłanie…</span>`;

    const data = new FormData();
    data.append('name',    fields.name.value.trim());
    data.append('email',   fields.email.value.trim());
    data.append('subject', fields.subject.value.trim());
    data.append('message', fields.message.value.trim());
    // FormSubmit AJAX mode — replace with your email
    data.append('_subject', `[portfolio] ${fields.subject.value.trim()}`);
    data.append('_captcha', 'false');
    data.append('_template', 'table');

    try {
      const res = await fetch('https://formsubmit.co/ajax/pssyho@proton.me', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
      });

      if (!res.ok) throw new Error('network');

      // Hide form, show success with GSAP
      gsap.to(contactForm, {
        opacity: 0, y: -16, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          contactForm.style.display = 'none';
          successEl.classList.add('visible');
          gsap.from(successEl.children, {
            opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power3.out'
          });
        }
      });

    } catch {
      // Re-enable on error, restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span class="btn-text">Wyślij wiadomość</span><span class="btn-arrow">↗</span>`;

      // Shake animation on the form
      gsap.fromTo(contactForm,
        { x: 0 },
        { x: [-8, 8, -6, 6, -3, 3, 0], duration: 0.5, ease: 'none',
          onComplete: () => {
            // Show inline error hint
            const existing = contactForm.querySelector('.form-error-hint');
            if (!existing) {
              const hint = document.createElement('p');
              hint.className = 'form-error-hint';
              hint.style.cssText = 'font-family:var(--font-mono);font-size:0.7rem;color:rgba(255,80,80,0.7);text-align:center;letter-spacing:0.08em;margin-top:0.25rem;';
              hint.textContent = 'Coś poszło nie tak. Spróbuj ponownie lub napisz bezpośrednio.';
              contactForm.appendChild(hint);
            }
          }
        }
      );
    }
  });
}

// ============================================================
// 8. BLOB PARALLAX
// ============================================================
const blobs = gsap.utils.toArray('.blob');

blobs.forEach((blob, i) => {
  // Speed multiplier based on element index
  const speed = (i + 1) * 0.15;
  
  gsap.to(blob, {
    y: () => window.innerHeight * speed,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });
});