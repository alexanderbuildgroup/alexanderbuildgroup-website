document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile menu toggle: opens/closes the nav and keeps aria-expanded in sync.
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  const supportsObserver = 'IntersectionObserver' in window;

  // 2. Jump-link highlight (Services page): whichever section sits in
  //    the middle of the screen gets its tab marked .is-active.
  const jumpLinks = document.querySelectorAll('.jump-links a[href^="#"]');
  if (jumpLinks.length && supportsObserver) {
    const byId = {};
    jumpLinks.forEach(link => { byId[link.getAttribute('href').slice(1)] = link; });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        jumpLinks.forEach(l => l.classList.remove('is-active'));
        const link = byId[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(id => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // 3. Contact form (Contact page): send to Formspree in the background
  //    and show the thank-you message here instead of leaving the site.
  const form = document.querySelector('form[data-ajax]');
  if (form && window.fetch) {
    const card = form.closest('.contact-form-card');
    const success = card && card.querySelector('.form-success');
    const error = form.querySelector('.form-error');
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (error) error.hidden = true;
      button.disabled = true;
      const label = button.textContent;
      button.textContent = 'Sending...';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Formspree returned ' + response.status);
        form.reset();
        form.hidden = true;
        if (success) success.hidden = false;
        // Count the inquiry as a lead in Google Analytics (if it's loaded)
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', { form_name: 'contact' });
        }
      } catch (err) {
        if (error) error.hidden = false;
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  }

  // 4. Scroll reveal: fade sections in once as they enter the screen.
  //    Skipped for visitors who ask their device for less motion.
  const items = document.querySelectorAll('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !supportsObserver) {
    items.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(el => io.observe(el));
  }
});