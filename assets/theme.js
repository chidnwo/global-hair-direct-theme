/* Global Hair Direct Nigeria — Theme JS */

document.addEventListener('DOMContentLoaded', function () {

  // ── LIVE CATALOG SUMMARY (Shopify products JSON) ──
  document.querySelectorAll('[data-catalog-summary]').forEach(function (el) {
    var handle = el.getAttribute('data-collection');
    if (!handle) return;
    var comingSoon = el.getAttribute('data-coming-soon') === 'true';
    var routesRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    var base = routesRoot.replace(/\/?$/, '/');
    fetch(base + 'collections/' + encodeURIComponent(handle) + '/products.json?limit=250')
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.products) return;
        var inStock = 0;
        var pre = 0;
        var products = data.products.length;
        data.products.forEach(function (p) {
          var tags = p.tags || [];
          if (typeof tags === 'string') tags = tags.split(',').map(function (t) { return t.trim(); });
          var tagStr = tags.join(' ').toLowerCase();
          if (tagStr.indexOf('coming-soon') !== -1 || tagStr.indexOf('out-of-stock') !== -1) return;
          var hasAvail = false;
          (p.variants || []).forEach(function (v) {
            if (v.available) hasAvail = true;
          });
          if (tagStr.indexOf('pre-order') !== -1) pre += 1;
          else if (hasAvail) inStock += 1;
        });
        var text;
        if (comingSoon) {
          text = products + ' products in catalogue · Ordering opens soon';
        } else {
          text = inStock + ' in stock · ' + pre + ' pre-order · ' + products + ' products';
        }
        el.textContent = text;
      })
      .catch(function () {});
  });

  function revealOnScroll(section, visibleClass) {
    var reveal = function () {
      section.classList.add(visibleClass);
    };
    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    observer.observe(section);
  }

  function animateCountUp(el) {
    var raw = el.getAttribute('data-count-to');
    if (!raw) return;
    var target = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    if (isNaN(target)) return;
    var suffix = String(raw).replace(/[\d\s]/g, '');
    var duration = 900;
    var start = null;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = raw;
      return;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── HERO: live panel count-up ──
  document.querySelectorAll('[data-hero-section]').forEach(function (section) {
    section.querySelectorAll('[data-count-to]').forEach(animateCountUp);
  });

  // ── ABOUT US: scroll-reveal ──
  document.querySelectorAll('[data-about-section]').forEach(function (section) {
    revealOnScroll(section, 'about-us--visible');
  });

  // ── WHY US: scroll-reveal cards ──
  document.querySelectorAll('[data-why-us-section]').forEach(function (section) {
    revealOnScroll(section, 'why-us-pillars--visible');
  });

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

  // ── QUICK ADD TO CART (product cards) ──
  function ghdRoutesRoot() {
    return ((window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/').replace(/\/?$/, '/');
  }

  function ghdSetCartCount(count) {
    var cartLink = document.querySelector('.site-header__cart');
    if (!cartLink) return;
    var badge = cartLink.querySelector('.site-header__cart-count');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'site-header__cart-count';
        cartLink.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) {
      badge.parentNode.removeChild(badge);
    }
  }

  function ghdRefreshCartCount() {
    fetch(ghdRoutesRoot() + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cart) { if (cart) ghdSetCartCount(cart.item_count); })
      .catch(function () {});
  }

  // ── CART DRAWER ──
  var ghdCartDrawer = document.querySelector('[data-cart-drawer]');

  function ghdEscapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ghdFormatMoney(cents, format) {
    var formatString = format || '${{amount}}';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    function fmt(number, precision, thousands, decimal) {
      precision = precision == null ? 2 : precision;
      thousands = thousands == null ? ',' : thousands;
      decimal = decimal == null ? '.' : decimal;
      if (isNaN(number) || number == null) return '0';
      number = (number / 100).toFixed(precision);
      var parts = number.split('.');
      var whole = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var frac = parts[1] ? decimal + parts[1] : '';
      return whole + frac;
    }
    var match = formatString.match(placeholderRegex);
    if (!match) return formatString;
    var value;
    switch (match[1]) {
      case 'amount_no_decimals': value = fmt(cents, 0); break;
      case 'amount_with_comma_separator': value = fmt(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = fmt(cents, 0, '.', ','); break;
      case 'amount_with_space_separator': value = fmt(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = fmt(cents, 0, ' ', ''); break;
      default: value = fmt(cents, 2);
    }
    return formatString.replace(placeholderRegex, value);
  }

  function ghdRenderCartDrawer(cart) {
    if (!ghdCartDrawer) return;
    var body = ghdCartDrawer.querySelector('[data-cart-drawer-body]');
    var foot = ghdCartDrawer.querySelector('[data-cart-drawer-foot]');
    var money = ghdCartDrawer.getAttribute('data-money-format');
    var shopUrl = ghdCartDrawer.getAttribute('data-all-products-url') || '/collections/all';
    if (!body) return;

    ghdSetCartCount(cart.item_count);

    if (!cart.items || cart.items.length === 0) {
      body.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.<br>' +
        '<a class="btn btn--navy cart-drawer__empty-cta" href="' + ghdEscapeHtml(shopUrl) + '">Browse products</a></p>';
      if (foot) foot.setAttribute('hidden', '');
      return;
    }

    var html = '';
    cart.items.forEach(function (item, idx) {
      var line = idx + 1;
      var img = item.image || '';
      if (img) img = img + (img.indexOf('?') !== -1 ? '&' : '?') + 'width=120';
      var variant = (item.variant_title && item.variant_title !== 'Default Title') ? item.variant_title : '';
      html += '<div class="cart-drawer__item" data-line="' + line + '">';
      html += img
        ? '<a href="' + ghdEscapeHtml(item.url) + '"><img class="cart-drawer__item-img" src="' + ghdEscapeHtml(img) + '" alt="' + ghdEscapeHtml(item.product_title) + '" width="64" height="64" loading="lazy"></a>'
        : '<span class="cart-drawer__item-img"></span>';
      html += '<div>';
      html += '<div class="cart-drawer__item-name"><a href="' + ghdEscapeHtml(item.url) + '">' + ghdEscapeHtml(item.product_title) + '</a></div>';
      if (variant) html += '<div class="cart-drawer__item-variant">' + ghdEscapeHtml(variant) + '</div>';
      html += '<div class="cart-drawer__item-qty">' +
        '<button type="button" class="cart-drawer__qty-btn" data-cart-qty="dec" aria-label="Decrease quantity">\u2212</button>' +
        '<span class="cart-drawer__qty-value">' + item.quantity + '</span>' +
        '<button type="button" class="cart-drawer__qty-btn" data-cart-qty="inc" aria-label="Increase quantity">+</button>' +
        '</div>';
      html += '<button type="button" class="cart-drawer__item-remove" data-cart-remove>Remove</button>';
      html += '</div>';
      html += '<div class="cart-drawer__item-price">' + ghdFormatMoney(item.final_line_price, money) + '</div>';
      html += '</div>';
    });
    body.innerHTML = html;

    if (foot) {
      foot.removeAttribute('hidden');
      var sub = ghdCartDrawer.querySelector('[data-cart-drawer-subtotal]');
      var subtotal = cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.total_price;
      if (sub) sub.textContent = ghdFormatMoney(subtotal, money);
    }
  }

  function ghdLoadCartDrawer() {
    if (!ghdCartDrawer) return;
    var body = ghdCartDrawer.querySelector('[data-cart-drawer-body]');
    if (body && !body.querySelector('.cart-drawer__item')) {
      body.innerHTML = '<p class="cart-drawer__loading">Loading\u2026</p>';
    }
    return fetch(ghdRoutesRoot() + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cart) { if (cart) ghdRenderCartDrawer(cart); return cart; })
      .catch(function () {});
  }

  function ghdOpenCartDrawer() {
    if (!ghdCartDrawer) return;
    ghdCartDrawer.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    ghdLoadCartDrawer();
    var closeBtn = ghdCartDrawer.querySelector('[data-cart-drawer-close]');
    if (closeBtn && closeBtn.focus) closeBtn.focus();
  }

  function ghdCloseCartDrawer() {
    if (!ghdCartDrawer) return;
    ghdCartDrawer.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function ghdChangeCartLine(line, quantity) {
    if (!ghdCartDrawer) return;
    var body = ghdCartDrawer.querySelector('[data-cart-drawer-body]');
    if (body) body.classList.add('cart-drawer__busy');
    fetch(ghdRoutesRoot() + 'cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cart) { if (cart) ghdRenderCartDrawer(cart); })
      .catch(function () {})
      .then(function () { if (body) body.classList.remove('cart-drawer__busy'); });
  }

  if (ghdCartDrawer) {
    var ghdHeaderCart = document.querySelector('.site-header__cart');
    if (ghdHeaderCart) {
      ghdHeaderCart.addEventListener('click', function (e) {
        e.preventDefault();
        ghdOpenCartDrawer();
      });
    }

    ghdCartDrawer.querySelectorAll('[data-cart-drawer-close]').forEach(function (el) {
      el.addEventListener('click', ghdCloseCartDrawer);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !ghdCartDrawer.hasAttribute('hidden')) ghdCloseCartDrawer();
    });

    ghdCartDrawer.addEventListener('click', function (e) {
      var row = e.target.closest('.cart-drawer__item');
      if (!row) return;
      var line = parseInt(row.getAttribute('data-line'), 10);
      if (isNaN(line)) return;
      var valEl = row.querySelector('.cart-drawer__qty-value');
      var current = parseInt(valEl ? valEl.textContent : '1', 10) || 1;
      if (e.target.closest('[data-cart-remove]')) {
        ghdChangeCartLine(line, 0);
      } else if (e.target.closest('[data-cart-qty="inc"]')) {
        ghdChangeCartLine(line, current + 1);
      } else if (e.target.closest('[data-cart-qty="dec"]')) {
        ghdChangeCartLine(line, Math.max(0, current - 1));
      }
    });
  }

  var CHECK_SVG = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 8l4 4 8-8" stroke="#fff" stroke-width="2" fill="none"/></svg>';

  document.querySelectorAll('[data-quick-add]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      var variantCount = parseInt(this.getAttribute('data-variant-count'), 10) || 1;
      var variantId = this.getAttribute('data-variant-id');
      var productUrl = this.getAttribute('data-product-url');

      // Products with multiple variants (e.g. colour) → open the product page to choose.
      if (variantCount > 1 || !variantId) {
        if (productUrl) window.location.href = productUrl;
        return;
      }

      var self = this;
      if (self.getAttribute('data-busy') === 'true') return;
      self.setAttribute('data-busy', 'true');
      var orig = self.innerHTML;

      fetch(ghdRoutesRoot() + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('add failed');
          return res.json();
        })
        .then(function () {
          self.innerHTML = CHECK_SVG;
          self.style.background = '#107E3E';
          if (ghdCartDrawer) {
            ghdOpenCartDrawer();
          } else {
            ghdRefreshCartCount();
          }
          setTimeout(function () {
            self.innerHTML = orig;
            self.style.background = '';
            self.setAttribute('data-busy', 'false');
          }, 1600);
        })
        .catch(function () {
          self.style.background = '#B42318';
          setTimeout(function () {
            self.style.background = '';
            self.setAttribute('data-busy', 'false');
          }, 1600);
        });
    });
  });

  // ── PRODUCT PAGE: gallery + variant → image & cart id ──
  var productPage = document.querySelector('[data-product-page]');
  var variantsJsonEl = document.getElementById('product-variants-data');
  if (productPage && variantsJsonEl) {
    var variants;
    try {
      variants = JSON.parse(variantsJsonEl.textContent);
    } catch (e) {
      variants = [];
    }

    function normOpt(x) {
      if (x === undefined || x === null || x === '') return null;
      return String(x).trim();
    }

    function selectedOptionValues() {
      var groups = productPage.querySelectorAll('.product-page__variants');
      var out = [null, null, null];
      groups.forEach(function (group) {
        var active = group.querySelector('.variant-btn.active');
        if (!active) return;
        var idx = parseInt(active.getAttribute('data-option-index'), 10);
        if (isNaN(idx) || idx < 0 || idx > 2) return;
        out[idx] = active.getAttribute('data-value');
      });
      return out;
    }

    function findVariant() {
      var sel = selectedOptionValues();
      var o1 = normOpt(sel[0]);
      var o2 = normOpt(sel[1]);
      var o3 = normOpt(sel[2]);
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if (normOpt(v.option1) !== o1) continue;
        if (normOpt(v.option2) !== o2) continue;
        if (normOpt(v.option3) !== o3) continue;
        return v;
      }
      return variants[0] || null;
    }

    function setMainImage(src, alt) {
      var main = document.getElementById('product-main-image');
      if (!main || !src) return;
      main.src = src;
      if (alt !== undefined && alt !== null) main.alt = alt;
    }

    function syncThumbActiveByUrl(url) {
      if (!url) return;
      productPage.querySelectorAll('.product-page__thumb').forEach(function (thumb) {
        var full = thumb.getAttribute('data-full-src');
        thumb.classList.toggle('is-active', full === url);
      });
    }

    function setWhatsappEnquiryLink(variant) {
      var waLink = productPage.querySelector('[data-whatsapp-enquiry]');
      if (!waLink || !variant) return;
      var waBase = waLink.getAttribute('data-whatsapp-base');
      if (!waBase) return;
      if (waBase.indexOf('text=') !== -1) {
        waLink.href = waBase;
        return;
      }
      var shop = productPage.getAttribute('data-shop-secure-url') || '';
      var path = variant.url || '';
      var intro = "Hi, I'd like to enquire about " + (variant.title || '') + ' (' + shop + path + ')';
      var sep = waBase.indexOf('?') !== -1 ? '&' : '?';
      waLink.href = waBase + sep + 'text=' + encodeURIComponent(intro);
    }

    var storeComingSoon = productPage.getAttribute('data-store-coming-soon') === 'true';

    function applyVariant(variant) {
      if (!variant) return;
      var input = productPage.querySelector('[data-variant-input]');
      if (input) input.value = String(variant.id);
      var addBtn = productPage.querySelector('[data-add-to-cart]');
      if (addBtn) {
        var canSell = variant.available && !storeComingSoon;
        if (canSell) {
          addBtn.disabled = false;
          addBtn.removeAttribute('aria-disabled');
          addBtn.textContent = 'Add to Cart';
        } else {
          addBtn.disabled = true;
          addBtn.setAttribute('aria-disabled', 'true');
          addBtn.textContent = storeComingSoon ? 'Coming Soon' : 'Out of Stock';
        }
      }
      if (variant.image) {
        setMainImage(variant.image, '');
        syncThumbActiveByUrl(variant.image);
      }
      setWhatsappEnquiryLink(variant);
    }

    function mergeAvailabilityFromShopifyProduct(productData) {
      if (storeComingSoon) {
        for (var i = 0; i < variants.length; i++) {
          variants[i].available = false;
        }
        return;
      }
      if (!productData || !productData.variants) return;
      var byId = {};
      for (var j = 0; j < productData.variants.length; j++) {
        var pv = productData.variants[j];
        byId[pv.id] = pv.available;
      }
      for (var k = 0; k < variants.length; k++) {
        var vid = variants[k].id;
        if (Object.prototype.hasOwnProperty.call(byId, vid)) {
          // Liquid already computed broad sellability (continue selling, qty, untracked).
          // The Ajax product JSON only exposes strict `available` and can disagree with
          // storefront Liquid — do not downgrade sellability when merging.
          variants[k].available = Boolean(byId[vid] || variants[k].available);
        }
      }
    }

    var productHandle = productPage.getAttribute('data-product-handle');
    if (productHandle) {
      var routesRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var base = routesRoot.replace(/\/?$/, '/');
      fetch(base + 'products/' + encodeURIComponent(productHandle) + '.js')
        .then(function (res) {
          if (!res.ok) return null;
          return res.json();
        })
        .then(function (data) {
          if (!data) return;
          mergeAvailabilityFromShopifyProduct(data);
          applyVariant(findVariant());
        })
        .catch(function () {});
    }

    productPage.querySelectorAll('.variant-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = this.closest('.product-page__variants');
        group.querySelectorAll('.variant-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        applyVariant(findVariant());
      });
    });

    productPage.querySelectorAll('.product-page__thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = this.getAttribute('data-full-src');
        var alt = this.getAttribute('data-image-alt') || '';
        setMainImage(src, alt);
        productPage.querySelectorAll('.product-page__thumb').forEach(function (t) { t.classList.remove('is-active'); });
        this.classList.add('is-active');
      });
    });
  } else {
    document.querySelectorAll('.variant-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = this.closest('.product-page__variants');
        if (!group) return;
        group.querySelectorAll('.variant-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });
  }

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

  // ── MOBILE MENU ──
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (mobileMenu) {
    var menuToggle = document.querySelector('[data-mobile-menu-open]');

    function openMobileMenu() {
      mobileMenu.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
      var firstLink = mobileMenu.querySelector('.site-header__mobile-link');
      if (firstLink) firstLink.focus();
    }

    function closeMobileMenu() {
      mobileMenu.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', openMobileMenu);
    }

    mobileMenu.querySelectorAll('[data-mobile-menu-close]').forEach(function (el) {
      el.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !mobileMenu.hasAttribute('hidden')) {
        closeMobileMenu();
      }
    });
  }

});
