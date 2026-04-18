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

});
