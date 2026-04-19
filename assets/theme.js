/* Global Hair Direct Nigeria — Theme JS */

document.addEventListener('DOMContentLoaded', function () {

  // ── FAQ ACCORDION ──
  document.querySelectorAll('.faq-item__question').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── PRODUCT FILTERS ──
  document.querySelectorAll('.product-filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.product-filter').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filter = this.dataset.filter;
      document.querySelectorAll('.product-card').forEach(function (card) {
        if (filter === 'all' || card.dataset.type === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── ADD TO CART FEEDBACK ──
  document.querySelectorAll('.product-card__add').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var orig = this.innerHTML;
      this.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 8l4 4 8-8" stroke="#fff" stroke-width="2" fill="none"/></svg>';
      this.style.background = '#107E3E';
      var self = this;
      setTimeout(function () { self.innerHTML = orig; self.style.background = ''; }, 1800);
    });
  });

  // ── VARIANT SELECTOR ──
  document.querySelectorAll('.variant-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = this.closest('.product-page__variants');
      group.querySelectorAll('.variant-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ── QUANTITY BUTTONS ──
  var qtyInput = document.querySelector('.qty-input');
  if (qtyInput) {
    document.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = parseInt(qtyInput.value) || 1;
        if (this.dataset.action === 'minus') {
          qtyInput.value = Math.max(1, current - 1);
        } else {
          qtyInput.value = current + 1;
        }
      });
    });
  }

  // ── ACTIVE NAV LINK ──
  var currentPath = window.location.pathname;
  document.querySelectorAll('.site-header__nav-link').forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // ── STICKY HEADER SHADOW ──
  window.addEventListener('scroll', function () {
    var header = document.querySelector('.site-header');
    if (header) {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 1px 12px rgba(0,0,0,0.08)';
      } else {
        header.style.boxShadow = '';
      }
    }
  });

  // ── WELCOME POPUP (customer newsletter form) ──
  var STORAGE_KEY = 'ghd_welcome_popup_v1';

  function readPopupState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function writePopupState(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  document.querySelectorAll('[data-welcome-popup]').forEach(function (root) {
    var delayMs = parseInt(root.getAttribute('data-delay-ms'), 10);
    if (isNaN(delayMs)) delayMs = 4000;
    var dismissDays = parseInt(root.getAttribute('data-dismiss-days'), 10);
    if (isNaN(dismissDays)) dismissDays = 30;
    var forceOpen = root.getAttribute('data-force-open') === 'true';
    var successEl = root.querySelector('.welcome-popup__success');
    var timer;

    function openPopup() {
      root.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      var focusTarget = root.querySelector('.welcome-popup__close');
      if (focusTarget) focusTarget.focus();
    }

    function closePopup(markDismissed) {
      root.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (markDismissed && !root.querySelector('.welcome-popup__success')) {
        var state = readPopupState();
        state.dismissedAt = Date.now();
        writePopupState(state);
      }
    }

    function shouldSkip() {
      var state = readPopupState();
      if (state.completed) return true;
      if (!state.dismissedAt) return false;
      var ms = dismissDays * 24 * 60 * 60 * 1000;
      return Date.now() - state.dismissedAt < ms;
    }

    if (successEl) {
      var st = readPopupState();
      st.completed = true;
      writePopupState(st);
      openPopup();
    } else if (forceOpen) {
      openPopup();
    } else if (shouldSkip()) {
      return;
    } else {
      timer = window.setTimeout(function () {
        openPopup();
      }, delayMs);
    }

    root.querySelectorAll('[data-welcome-popup-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (timer) window.clearTimeout(timer);
        closePopup(true);
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !root.hasAttribute('hidden')) {
        if (timer) window.clearTimeout(timer);
        closePopup(true);
      }
    });

    var popupForm = root.querySelector('.welcome-popup__form');
    var phoneInput = root.querySelector('[data-welcome-popup-phone]');
    if (popupForm && phoneInput) {
      function welcomePopupPhoneDigits(value) {
        return String(value || '').replace(/\D/g, '');
      }

      function validateWelcomePhone() {
        var digits = welcomePopupPhoneDigits(phoneInput.value);
        if (digits.length < 8 || digits.length > 15) {
          phoneInput.setCustomValidity('Enter a valid phone number: 8–15 digits (digits only count; + and spaces are OK).');
          return false;
        }
        phoneInput.setCustomValidity('');
        return true;
      }

      phoneInput.addEventListener('input', function () {
        phoneInput.setCustomValidity('');
      });

      popupForm.addEventListener('submit', function (e) {
        if (!validateWelcomePhone()) {
          e.preventDefault();
          phoneInput.reportValidity();
          return;
        }
        var digits = welcomePopupPhoneDigits(phoneInput.value);
        var trimmed = phoneInput.value.trim();
        phoneInput.value = trimmed.charAt(0) === '+' ? '+' + digits : digits;
      });
    }
  });

  // ── AUTH MODALS (login + register) ──
  function closeAuthModals() {
    document.querySelectorAll('[data-register-modal], [data-login-modal]').forEach(function (el) {
      el.setAttribute('hidden', '');
    });
    document.body.style.overflow = '';
  }

  function openRegisterModal(e) {
    var modal = document.querySelector('[data-register-modal]');
    if (!modal) return false;
    if (e) e.preventDefault();
    var login = document.querySelector('[data-login-modal]');
    if (login) login.setAttribute('hidden', '');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    var focusTarget = modal.querySelector('[data-register-modal-close]');
    if (focusTarget) focusTarget.focus();
    return true;
  }

  function openLoginModal(e) {
    var modal = document.querySelector('[data-login-modal]');
    if (!modal) return false;
    if (e) e.preventDefault();
    var reg = document.querySelector('[data-register-modal]');
    if (reg) reg.setAttribute('hidden', '');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    var focusTarget = modal.querySelector('[data-login-modal-close]');
    if (focusTarget) focusTarget.focus();
    return true;
  }

  document.querySelectorAll('[data-register-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (!openRegisterModal(e)) return;
    });
  });

  document.querySelectorAll('[data-login-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (!openLoginModal(e)) return;
    });
  });

  document.querySelectorAll('[data-register-modal]').forEach(function (root) {
    root.querySelectorAll('[data-register-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        root.setAttribute('hidden', '');
        document.body.style.overflow = '';
      });
    });
  });

  document.querySelectorAll('[data-login-modal]').forEach(function (root) {
    root.querySelectorAll('[data-login-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        root.setAttribute('hidden', '');
        document.body.style.overflow = '';
      });
    });
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    var open = document.querySelector('[data-register-modal]:not([hidden]), [data-login-modal]:not([hidden])');
    if (open) closeAuthModals();
  });

});
