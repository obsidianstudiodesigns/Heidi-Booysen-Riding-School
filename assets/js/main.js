/* Heidi Booysen Riding School: header, menu, reveals, booking and treat orders (sent via WhatsApp), gallery. */
(function () {
  'use strict';

  var WHATSAPP = '27637749148';
  var doc = document.documentElement;
  doc.classList.add('js');

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  function openWhatsApp(text) {
    var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
    var win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  }

  /* Header turns solid once the page leaves the very top */
  var header = document.querySelector('[data-header]');
  if (header && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:80px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-solid', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* Mobile menu */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* Arch photos open like a stable door when they scroll into view */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); ro.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Highlight the nav link for the section in view */
  var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var visible = {};
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      var active = Object.keys(byId).filter(function (id) { return visible[id]; }).pop();
      navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (active) byId[active].setAttribute('aria-current', 'true');
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* "Book a ride" buttons pre-select the service in the booking form */
  document.querySelectorAll('[data-preselect]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var radio = document.querySelector('.book-form input[data-key="' + btn.getAttribute('data-preselect') + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  });

  /* Booking form: validates, then writes a WhatsApp message */
  var bookForm = document.querySelector('[data-book-form]');
  if (bookForm) {
    var status = bookForm.querySelector('[data-form-status]');
    var serviceError = document.getElementById('service-error');

    function fieldOf(input) { return input.closest('.field'); }
    function setError(input, show) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.toggle('is-invalid', show);
      var err = field.querySelector('.field-error');
      if (err) err.hidden = !show;
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
    }
    function phoneOk(v) { return v.replace(/[^\d]/g, '').length >= 9; }

    bookForm.addEventListener('input', function (e) {
      var t = e.target;
      if (t.matches('input[required]') && fieldOf(t) && fieldOf(t).classList.contains('is-invalid')) {
        var ok = t.type === 'tel' ? phoneOk(t.value) : t.type === 'number' ? Number(t.value) >= 4 : t.value.trim() !== '';
        if (ok) setError(t, false);
      }
    });
    bookForm.addEventListener('change', function (e) {
      if (e.target.name === 'service') serviceError.hidden = true;
    });

    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = bookForm.elements;
      var firstBad = null;
      var service = bookForm.querySelector('input[name="service"]:checked');
      serviceError.hidden = !!service;
      if (!service) firstBad = bookForm.querySelector('input[name="service"]');

      [['rider', function (v) { return v.trim() !== ''; }],
       ['age', function (v) { return Number(v) >= 4 && Number(v) <= 99; }],
       ['contact', function (v) { return v.trim() !== ''; }],
       ['phone', phoneOk]].forEach(function (pair) {
        var input = f[pair[0]];
        var ok = pair[1](input.value);
        setError(input, !ok);
        if (!ok && !firstBad) firstBad = input;
      });

      if (firstBad) {
        status.textContent = 'Check the highlighted fields, then send again.';
        firstBad.focus();
        return;
      }

      var days = Array.prototype.map.call(bookForm.querySelectorAll('input[name="days"]:checked'), function (d) { return d.value; });
      var lines = [
        'Hi Heidi, I would like to book: ' + service.value,
        '',
        'Rider: ' + f.rider.value.trim() + ', age ' + f.age.value,
        'Experience: ' + f.experience.value,
        'Private or group: ' + f.type.value,
        'Days: ' + (days.length ? days.join(', ') : 'Any day'),
        'Time: ' + f.time.value
      ];
      if (f.notes.value.trim()) lines.push('Notes: ' + f.notes.value.trim());
      lines.push('', 'From: ' + f.contact.value.trim() + ', ' + f.phone.value.trim());
      status.textContent = 'Opening WhatsApp with your message. Press send there to reach Heidi.';
      openWhatsApp(lines.join('\n'));
    });
  }

  /* Horse treats order */
  var treatForm = document.querySelector('[data-treat-form]');
  if (treatForm) {
    var totalEl = treatForm.querySelector('[data-treat-total]');
    var emptyEl = treatForm.querySelector('[data-treat-empty]');
    var rows = treatForm.querySelectorAll('.treat-row');
    var nameInput = document.getElementById('treat-name');
    var nameError = document.getElementById('treat-name-error');

    function update() {
      var total = 0;
      rows.forEach(function (row) {
        var qty = Number(row.querySelector('output').value || row.querySelector('output').textContent);
        total += qty * Number(row.getAttribute('data-price'));
        row.classList.toggle('has-qty', qty > 0);
      });
      totalEl.textContent = 'R' + total;
      if (total > 0) emptyEl.hidden = true;
      return total;
    }
    rows.forEach(function (row) {
      var out = row.querySelector('output');
      row.querySelectorAll('[data-step]').forEach(function (b) {
        b.addEventListener('click', function () {
          var next = Math.max(0, Math.min(20, Number(out.textContent) + Number(b.getAttribute('data-step'))));
          out.textContent = next;
          out.value = next;
          update();
        });
      });
    });
    nameInput.addEventListener('input', function () { if (nameInput.value.trim()) { nameError.hidden = true; nameInput.closest('.field').classList.remove('is-invalid'); } });

    treatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var total = update();
      var hasName = nameInput.value.trim() !== '';
      emptyEl.hidden = total > 0;
      nameError.hidden = hasName;
      nameInput.closest('.field').classList.toggle('is-invalid', !hasName);
      if (!total) { treatForm.querySelector('[data-step="1"]').focus(); return; }
      if (!hasName) { nameInput.focus(); return; }
      var lines = ['Hi Heidi, I would like to order horse treats:', ''];
      rows.forEach(function (row) {
        var qty = Number(row.querySelector('output').textContent);
        if (qty) lines.push(qty + ' x ' + row.getAttribute('data-size') + ' (R' + qty * Number(row.getAttribute('data-price')) + ')');
      });
      lines.push('', 'Total: R' + total, 'Name: ' + nameInput.value.trim(), '', 'When can I collect?');
      openWhatsApp(lines.join('\n'));
    });
  }

  /* Gallery lightbox */
  var lightbox = document.querySelector('[data-lightbox]');
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-gallery] .shot'));
  if (lightbox && shots.length && typeof lightbox.showModal === 'function') {
    var lbImg = lightbox.querySelector('[data-lightbox-img]');
    var lbCap = lightbox.querySelector('[data-lightbox-caption]');
    var current = 0;
    function show(i) {
      current = (i + shots.length) % shots.length;
      var img = shots[current].querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
    }
    shots.forEach(function (shot, i) {
      shot.setAttribute('aria-label', 'View photo: ' + shot.querySelector('img').alt);
      shot.addEventListener('click', function () { show(i); lightbox.showModal(); });
    });
    lightbox.querySelector('[data-lightbox-close]').addEventListener('click', function () { lightbox.close(); });
    lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    lightbox.addEventListener('close', function () { shots[current].focus(); });
  }
})();
