/* Podesi pre objave. */
const CONFIG = {
  // WhatsApp broj u međunarodnom formatu, samo cifre, npr. 381601234567.
  whatsappNumber: '381603031137',
  times: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
  bookableDays: 10,
  // Tačka iz loga raste u plavu pozadinu priče. false = staro tamnjenje u plavo.
  dotIntro: false,
};

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const carousels = {};
/* Koliko mesta naslov zauzima iznad scene (na računaru naslov stoji preko scene, pa je 0) */
const introSpace = () => {
  const intro = document.getElementById('showIntro');
  return intro && getComputedStyle(intro).position !== 'absolute' ? intro.offsetHeight : 0;
};

/* ---------- Animirani monitori ---------- */
function initMonitors() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;


  const cal = $('#cal');
  let step = 0;
  [...'s.m.o...m.o.o..s..o.ms.m.o..'].forEach((type) => {
    const cell = document.createElement('i');
    if (type !== '.') {
      cell.className = type;
      cell.dataset.at = String(400 + step * 420);
      step += 1;
    }
    cal.append(cell);
  });

  $$('[data-loop]').forEach((root) => {
    const items = $$('[data-at]', root);
    const loop = Number(root.dataset.loop);
    let timers = [];
    const stop = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const run = () => {
      stop();
      items.forEach((el) => el.classList.remove('lit'));
      items.forEach((el) => {
        timers.push(setTimeout(() => el.classList.add('lit'), Number(el.dataset.at)));
        if (el.dataset.off) timers.push(setTimeout(() => el.classList.remove('lit'), Number(el.dataset.off)));
      });
      timers.push(setTimeout(run, loop));
    };
    if (reduced) {
      items.filter((el) => !el.dataset.off).forEach((el) => el.classList.add('lit'));
      return;
    }
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) run();
      else stop();
    }, { threshold: 0.15 }).observe(root);
  });
}

/* ---------- Kartice i tekst dok monitor stoji na ekranu ---------- */
function initShow() {
  const show = $('#top');
  const intro = $('#showIntro');
  const gap = $('#showGap');
  const dim = $('#showDim');
  const pin = $('#showPin');
  const dot = $('#showWord i');
  const zoom = $('#dotZoom');
  const notes = $$('.note', show);
  const story = $('.show__story', show);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useDot = CONFIG.dotIntro && dot && zoom && !reduced;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let queued = false;

  const draw = () => {
    queued = false;
    const vh = innerHeight;
    const y = scrollY;
    const pinTop = show.offsetTop + introSpace();
    const hold = gap.offsetHeight;

    /* Na telefonu plava kreće čim se malo skroluje */
    /* Plava se pojavljuje postepeno, kako tekst ulazi u ekran */
    const fade = clamp((vh * 0.98 - story.getBoundingClientRect().top) / (vh * 0.45));

    if (useDot) {
      /* Tačka iz "bohel." raste dok ne preplavi ekran plavom */
      const grow = clamp((y - pinTop - vh * 0.14) / (vh * 0.28));
      const pr = pin.getBoundingClientRect();
      const dr = dot.getBoundingClientRect();
      const size = dr.width || 1;
      const cx = dr.left - pr.left + size / 2;
      const cy = dr.top - pr.top + size / 2;
      const far = Math.max(Math.hypot(cx, cy), Math.hypot(pr.width - cx, cy), Math.hypot(cx, pr.height - cy), Math.hypot(pr.width - cx, pr.height - cy));
      const max = (far * 2) / size + 2;
      const e = 1 - (1 - grow) ** 3;
      zoom.style.width = `${size}px`;
      zoom.style.height = `${size}px`;
      zoom.style.left = `${cx - size / 2}px`;
      zoom.style.top = `${cy - size / 2}px`;
      zoom.style.transform = `scale(${1 + (max - 1) * e})`;
      zoom.style.opacity = grow > 0 ? '1' : '0';
      dot.style.visibility = grow > 0 ? 'hidden' : '';
      dim.style.opacity = '0';
    } else {
      dim.style.opacity = String(fade * 0.9);
    }

    if (reduced) return;
    const pass = clamp((y - (pinTop - vh)) / (vh * 1.5 + hold));
    notes.forEach((note) => {
      note.style.transform = `translate3d(0, ${(0.5 - pass) * Number(note.dataset.speed)}px, 0)`;
      note.style.opacity = String(1 - fade);
    });
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(draw);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  draw();
}

/* ---------- Cena sajta ---------- */
function initPrice() {
  const value = $('#priceValue');
  const note = $('#priceNote');
  const PLANS = {
    once: ['800€', 'Jednokratna izrada sajta sa zakazivanjem.'],
    pack: ['Uključen', 'Potpiši saradnju na 6 meseci i sajt dobijaš u okviru paketa.'],
  };
  $$('input[name="plan"]').forEach((input) => input.addEventListener('change', () => {
    [value.textContent, note.textContent] = PLANS[input.value];
  }));
}

/* ---------- Kontakt: Zakaži poziv i paketi vode na WhatsApp ---------- */
function initContact() {
  $('#year').textContent = new Date().getFullYear();
  const number = CONFIG.whatsappNumber.replace(/\D/g, '');
  if (!number) return; // dok nema broja, dugmad vode na kraj strane
  const wa = (text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  const picked = new URLSearchParams(location.search).get('paket');
  $$('[data-wa]').forEach((a) => {
    a.href = wa(picked ? `Zdravo, zanima me paket ${picked}. Želim da zakažem poziv.` : 'Zdravo, želim da zakažem poziv.');
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/* ---------- Sajt: panel ispod menija ---------- */
function initSitePanel() {
  const btn = $('#siteBtn');
  const panel = $('#sitePanel');
  if (!btn || !panel) return;
  const toggle = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  };
  btn.addEventListener('click', () => toggle(panel.hidden));
  $('#siteClose').addEventListener('click', () => { toggle(false); btn.focus(); });
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
  document.addEventListener('click', (e) => { if (!panel.hidden && !e.target.closest('#sitePanel, #siteBtn')) toggle(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      toggle(false);
      btn.focus();
    }
  });
}

/* ---------- Svetlo: stalno toplo svetlo ---------- */
function initLight() {
  const light = $('#light');
  if (light) light.classList.add('is-on');
}

/* ---------- Klapa i svetlo odlete gore kad se skroluje dalje ---------- */
function initFly() {
  const items = [[$('#flyIcons'), 0, -7], [$('#slate'), 0.08, 9]];
  if (items.some(([el]) => !el) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const show = $('#top');
  const intro = $('#showIntro');
  const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
  let queued = false;
  const draw = () => {
    queued = false;
    const start = show.offsetTop + introSpace() + innerHeight * 0.17;
    const p = clamp01((scrollY - start) / (innerHeight * 0.45));
    items.forEach(([el, delay, turn]) => {
      const t = clamp01((p - delay) / (1 - delay));
      const e = t * t * (3 - 2 * t);
      el.style.transform = e ? `translate3d(0, ${-e * 110}vh, 0) rotate(${e * turn}deg)` : '';
    });
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(draw);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  draw();
}

/* ---------- Dashboard na ekranu laptopa (uglovi ekrana sa slike 1536x1024) ---------- */
function initShot() {
  const shot = $('#shot');
  const screen = $('#shotScreen');
  if (!shot || !screen) return;
  const CORNERS = [[148.1, 100.9], [810.7, 106.5], [925.4, 593.9], [264.2, 675.5]];
  const adj = (m) => [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]];
  const mul = (a, b) => {
    const c = [];
    for (let i = 0; i < 3; i += 1) for (let j = 0; j < 3; j += 1) c[3 * i + j] = a[3 * i] * b[j] + a[3 * i + 1] * b[3 + j] + a[3 * i + 2] * b[6 + j];
    return c;
  };
  const basis = (p) => {
    const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1];
    const a = adj(m);
    const v = [a[0] * p[3][0] + a[1] * p[3][1] + a[2], a[3] * p[3][0] + a[4] * p[3][1] + a[5], a[6] * p[3][0] + a[7] * p[3][1] + a[8]];
    return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
  };
  const fit = () => {
    const k = shot.clientWidth / 1536;
    const w = screen.offsetWidth;
    const h = screen.offsetHeight;
    const src = basis([[0, 0], [w, 0], [w, h], [0, h]]);
    const dst = basis(CORNERS.map(([x, y]) => [x * k, y * k]));
    const t = mul(dst, adj(src)).map((v, i, arr) => v / arr[8]);
    screen.style.transform = `matrix3d(${t[0]},${t[3]},0,${t[6]},${t[1]},${t[4]},0,${t[7]},0,0,1,0,${t[2]},${t[5]},0,${t[8]})`;
    screen.classList.add('is-ready');
  };
  new ResizeObserver(fit).observe(shot);
  fit();
}

/* ---------- Reč koja se menja u naslovu ---------- */
function initRotator() {
  const words = $$('.rot span');
  if (words.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    const current = words[i];
    i = (i + 1) % words.length;
    current.classList.remove('on');
    current.classList.add('out');
    words[i].classList.remove('out');
    words[i].classList.add('on');
    setTimeout(() => current.classList.remove('out'), 600);
  }, 2200);
}

/* ---------- Aktivna stavka u meniju ---------- */
function initSpy() {
  const links = $$('.nav__links a[href^="#"]');
  const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  const set = (id) => links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  let queued = false;
  const update = () => {
    queued = false;
    const line = innerHeight * 0.4;
    let active = null;
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.top <= line && r.bottom > line * 0.25) active = t;
    });
    set(active ? active.id : '');
  };
  links.forEach((a) => a.addEventListener('click', () => set(a.getAttribute('href').slice(1))));
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  update();
}

/* Današnji datum na klapi */
const clapDate = $('#clapDate');
if (clapDate) {
  const d = new Date();
  clapDate.textContent = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}`;
}

initRotator();
initSpy();
initMonitors();
initShow();
initSitePanel();
initLight();
initFly();
initShot();
initPrice();
initContact();
initDarkFaq();
initSolo();
initBook();
initPacks();
initMobileMenu();
initSheetSwipe();

/* ---------- Kod pitanja stranica postepeno pređe u tamno ---------- */
function initDarkFaq() {
  const faq = $('#pitanja');
  if (!faq) return;
  const root = document.documentElement;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let queued = false;
  const draw = () => {
    queued = false;
    const r = faq.getBoundingClientRect();
    const vh = innerHeight;
    const enter = clamp((vh * 1.05 - r.top) / (vh * 0.5));
    const leave = clamp((r.bottom - vh * 0.2) / (vh * 0.3));
    const d = Math.min(enter, leave);
    root.style.setProperty('--dark', d.toFixed(3));
    root.classList.toggle('is-dark', d > 0.5);
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(draw);
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  draw();
}

/* ---------- Traka rezultata: brzina i smer prate skrol, cifre se vrte kao na automatu ---------- */
function initTicker() {
  const ticker = $('.ticker');
  const track = $('.ticker__track');
  if (!ticker || !track) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nums = $$('.ticker__item b', ticker);

  nums.forEach((b) => {
    const text = b.textContent;
    b.textContent = '';
    b.classList.add('odo');
    [...text].forEach((ch) => {
      if (/\d/.test(ch)) {
        const col = document.createElement('span');
        col.className = 'odo__col';
        const strip = document.createElement('span');
        strip.className = 'odo__strip';
        strip.innerHTML = Array.from({ length: 30 }, (_, i) => `<span>${i % 10}</span>`).join('');
        strip.dataset.d = ch;
        col.appendChild(strip);
        b.appendChild(col);
      } else {
        const s = document.createElement('span');
        s.className = ch === '+' ? 'odo__plus' : 'odo__sep';
        s.textContent = ch;
        b.appendChild(s);
      }
    });
  });
  const strips = $$('.odo__strip', ticker);
  const setAll = (anim) => {
    strips.forEach((s, i) => {
      const d = Number(s.dataset.d);
      if (!anim) {
        s.style.transition = 'none';
        s.style.transform = `translate3d(0, ${-(Math.floor(Math.random() * 10)) * 1}em, 0)`;
        return;
      }
      s.style.transition = '';
      s.style.transitionDelay = `${(i % 8) * 70}ms`;
      s.style.transform = `translate3d(0, ${-(20 + d)}em, 0)`;
    });
  };
  const roll = () => {
    if (reduced) return;
    setAll(false);
    void track.offsetWidth;
    requestAnimationFrame(() => setAll(true));
  };
  if (reduced) {
    strips.forEach((s) => { s.style.transition = 'none'; s.style.transform = `translate3d(0, ${-(20 + Number(s.dataset.d))}em, 0)`; });
    return;
  }

  let visible = false;
  let rolled = false;
  let timer = 0;
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    clearInterval(timer);
    if (visible) {
      if (!rolled) { rolled = true; roll(); }
      tick.last = performance.now();
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.2 }).observe(ticker);

  const group = $('.ticker__group', ticker);
  let x = 0;
  let speed = 0;
  let dir = 1;
  let lastY = scrollY;
  let boost = 0;

  function tick(now) {
    if (!visible) return;
    const dt = Math.min(0.05, (now - tick.last) / 1000);
    tick.last = now;
    const base = innerWidth < 760 ? 32 : 48;
    const target = (base + boost) * dir;
    speed += (target - speed) * Math.min(1, dt * 4);
    boost *= Math.pow(0.04, dt);
    x -= speed * dt;
    const w = group.offsetWidth;
    if (x <= -w) x += w;
    if (x > 0) x -= w;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    requestAnimationFrame(tick);
  }
}

/* ---------- Brojevi rezultata odbrojavaju kad uđu u ekran ---------- */
function initCount() {
  const nums = $$('[data-count]');
  if (!nums.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const fmt = (n) => Math.round(n).toLocaleString('de-DE');
  const run = (el) => {
    const end = Number(el.dataset.count);
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1600);
      el.textContent = `${fmt(end * (1 - (1 - p) ** 4))}+`;
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0+';
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      run(en.target);
    });
  }, { threshold: 0.6 });
  nums.forEach((el) => io.observe(el));
}

/* ---------- Rezultati: jedan broj po jedan, smena na 3 sekunde, tačkice i prevlačenje ---------- */
function initSolo() {
  const items = $$('.solo__item');
  const dots = $$('.solo__dots button');
  const stage = $('.solo__stage');
  if (items.length < 2) return;
  let i = 0;
  let timer = 0;
  let visible = false;
  const show = (k) => {
    k = (k + items.length) % items.length;
    if (k === i) return;
    const cur = items[i];
    const nxt = items[k];
    i = k;
    cur.classList.remove('is-on');
    cur.classList.add('is-out');
    nxt.classList.remove('is-out');
    nxt.classList.add('is-on');
    dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
    setTimeout(() => cur.classList.remove('is-out'), 950);
  };
  const restart = () => {
    clearInterval(timer);
    if (visible) timer = setInterval(() => show(i + 1), 2600);
  };
  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restart(); }));

  let x0 = null;
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) < 40) return;
    show(dx < 0 ? i + 1 : i - 1);
    restart();
  });

  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    restart();
  }, { threshold: 0.3 }).observe($('.solo'));
}

/* ---------- Formular za Google Meet poziv ---------- */
function initBook() {
  const dlg = $('#book');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const form = $('.book__form', dlg);
  const done = $('.book__done', dlg);
  const err = $('.book__err', dlg);
  const send = $('button[type="submit"]', form);
  const root = document.documentElement;
  const open = (paket) => {
    if (paket && [...form.elements.paket.options].some((o) => o.value === paket)) form.elements.paket.value = paket;
    form.hidden = false;
    done.hidden = true;
    err.hidden = true;
    root.classList.add('is-locked');
    dlg.showModal();
    if (matchMedia('(hover: hover)').matches) form.elements.ime.focus();
  };
  $$('[data-book]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    open(a.dataset.package);
  }));
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => root.classList.remove('is-locked'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    err.hidden = true;
    send.disabled = true;
    send.textContent = 'Šaljem…';
    try {
      const r = await fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || String(data.success) === 'false') throw new Error(data.message || String(r.status));
      form.reset();
      form.hidden = true;
      done.hidden = false;
    } catch (_) {
      err.hidden = false;
    } finally {
      send.disabled = false;
      send.textContent = 'Pošalji zahtev';
    }
  });
  const picked = new URLSearchParams(location.search).get('paket');
  if (picked || location.hash === '#poziv') open(picked);
}

/* ---------- Tabovi + prevlačenje (paketi i Šta radimo na telefonu) ---------- */
function makeCarousel(grid, tabs, cards, start) {
  if (!grid || !tabs.length || tabs.length !== cards.length) return null;
  const mobile = matchMedia('(max-width: 760px)');
  const mark = (k) => tabs.forEach((t, n) => {
    t.classList.toggle('is-on', n === k);
    t.setAttribute('aria-selected', String(n === k));
  });
  const go = (k, smooth) => {
    const c = cards[k];
    grid.scrollTo({ left: c.offsetLeft - grid.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    mark(k);
  };
  tabs.forEach((t, k) => t.addEventListener('click', () => go(k, true)));
  let queued = false;
  grid.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const mid = grid.scrollLeft + grid.clientWidth / 2;
      const dist = (c) => Math.abs(c.offsetLeft - grid.offsetLeft + c.offsetWidth / 2 - mid);
      let best = 0;
      cards.forEach((c, k) => { if (dist(c) < dist(cards[best])) best = k; });
      mark(best);
    });
  }, { passive: true });
  const reset = () => { if (mobile.matches) go(start, false); };
  reset();
  mobile.addEventListener('change', reset);
  return { go };
}
function initPacks() {
  const grid = $('.packs__grid');
  carousels.packs = makeCarousel(grid, $$('.packs__tabs button'), $$('.pack', grid), 2);
  const bento = $('.bento');
  carousels.svc = makeCarousel(bento, $$('.svc__tabs button'), $$('.card--content, .card--leads, .card--m', bento), 0);
}

/* ---------- Meni na telefonu: klik na "bohel." ---------- */
function initMobileMenu() {
  const logo = $('.nav__logo');
  const menu = $('#mnav');
  if (!logo || !menu) return;
  const mobile = matchMedia('(max-width: 760px)');
  const set = (open) => {
    menu.hidden = !open;
    logo.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open);
  };
  logo.addEventListener('click', (e) => {
    if (!mobile.matches) return;
    e.preventDefault();
    set(menu.hidden);
  });
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    set(false);
    if (a.dataset.tab && carousels.svc) setTimeout(() => carousels.svc.go(Number(a.dataset.tab), false), 0);
  });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('#mnav, .nav__logo')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) set(false); });
  mobile.addEventListener('change', () => set(false));
}

/* ---------- Formular: povuci nadole da se zatvori (telefon) ---------- */
function initSheetSwipe() {
  const dlg = $('#book');
  if (!dlg) return;
  let y0 = null;
  let dy = 0;
  dlg.addEventListener('touchstart', (e) => {
    if (dlg.scrollTop > 0) { y0 = null; return; }
    y0 = e.touches[0].clientY;
    dy = 0;
  }, { passive: true });
  dlg.addEventListener('touchmove', (e) => {
    if (y0 === null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    dlg.style.transition = 'none';
    dlg.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  dlg.addEventListener('touchend', () => {
    if (y0 === null) return;
    y0 = null;
    dlg.style.transition = 'transform .3s cubic-bezier(.22, 1, .36, 1)';
    if (dy > 110) {
      dlg.style.transform = 'translateY(100%)';
      setTimeout(() => { dlg.close(); dlg.style.transform = ''; dlg.style.transition = ''; }, 280);
    } else {
      dlg.style.transform = '';
    }
  });
}

