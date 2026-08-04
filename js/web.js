/* ── web/js/web.js ── */
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

(() => {
  'use strict';

  // ─── Scroll-aware Navbar ──────────────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile Menu Toggle ───────────────────────────────────────
  const hamburger   = document.querySelector('.nav-hamburger');
  const mobileMenu  = document.querySelector('.nav-mobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile .nav-link, .nav-mobile .btn');

  if (hamburger && mobileMenu) {
    const toggle = (force) => {
      const open = force !== undefined ? force : !hamburger.classList.contains('open');
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggle());
    mobileLinks.forEach(link => link.addEventListener('click', () => toggle(false)));

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggle(false);
      }
    });
  }

  // ─── Active Nav Link ─────────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || href.endsWith(currentPage))) {
      link.classList.add('active');
    }
  });

  // ─── Scroll Reveal (Intersection Observer) ───────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ─── Counter Animation (for stats) ───────────────────────────
  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start   = performance.now();
    const suffix  = el.dataset.suffix || '';

    const tick = (now) => {
      const elapsed  = Math.min(now - start, duration);
      const progress = elapsed / duration;
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.round(ease * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => counterObs.observe(el));
  }

  // ─── Contact Form ─────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contactSubmitBtn');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
      
      const name = document.getElementById('c-name').value.trim();
      const phone = document.getElementById('c-phone').value.trim();
      const email = document.getElementById('c-email').value.trim();
      const subject = document.getElementById('c-subject').value;
      const message = document.getElementById('c-message').value.trim();
      
      if (!name || !email || !message) {
        showToast('Error', 'Please fill in all required fields.');
        return;
      }
      
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending...';
        }
        
        await addDoc(collection(db, 'contact_messages'), {
          name,
          phone,
          email,
          subject,
          message,
          status: 'unread',
          createdAt: serverTimestamp()
        });
        
        showToast('Message Sent!', "We'll get back to you within 24 hours.");
        contactForm.reset();
      } catch (err) {
        console.error("Error sending message: ", err);
        showToast('Error', 'Failed to send message. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // ─── Enrollment Form ─────────────────────────────────────────
  const enrollForm = document.getElementById('enrollForm');
  if (enrollForm) {
    enrollForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Enquiry Submitted!', 'Our team will contact you shortly.');
      enrollForm.reset();
    });
  }

  // ─── Toast Notification ───────────────────────────────────────
  function showToast(title, message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 600);
    }, 4000);
  }

  // ─── Smooth Scroll Anchors ────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
