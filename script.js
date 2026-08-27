/*
 * ============================================================
 *  INVITACIÓN JAMES & DELICIA — Script principal
 *  Módulos: portada cinematográfica · audio · lluvia de flores
 *  (canvas) · countdown · carrusel infinito con lightbox ·
 *  aparición al scroll · RSVP · compartir
 * ============================================================
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------
    1. CONFIGURACIÓN GENERAL
  ------------------------------------------------------------ */
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WEDDING = {
    day: new Date(2026, 8, 26, 14, 30, 0), // 26 de setiembre de 2026, 2:30 p.m.
    title: 'James & Delicia · Nuestra Boda',
    location: 'Parroquia Cristo Salvador, Km 15 Carretera Central, Ate, Lima, Perú',
    details: 'Ceremonia religiosa 2:30 p.m. · Recepción Local "El Descanso", Urb. El Descanso Mz. H Lote 5, Entrada Huaycán, Ate.'
  };
  var FORMSPREE_URL = '';                // Ej.: 'https://formspree.io/f/xxxxxxxx' (opcional)
  var WHATSAPP_NUMBER = '51950110792';   // WhatsApp de los novios (código 51 + número)

  /* ------------------------------------------------------------
    2. PORTADA CINEMATOGRÁFICA — APERTURA
  ------------------------------------------------------------ */
  var cover = document.getElementById('cover');
  var openSeal = document.getElementById('openSeal');
  var bodyEl = document.body;
  var htmlEl = document.documentElement;
  var opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;
    cover.classList.add('closed');
    htmlEl.classList.remove('locked');
    bodyEl.classList.remove('locked');
    bodyEl.classList.add('opened');

    // Inicia la música y desliza suavemente hasta la primera sección
    if (hasRealSong()) {
      playSong();
      toggle.classList.remove('paused');
      toggle.classList.add('playing');
      toggle.setAttribute('aria-label', 'Pausar canción');
      toggle.setAttribute('aria-pressed', 'true');
      startNotes();
    }
    var inicio = document.getElementById('inicio');
    if (inicio) window.scrollTo({ top: inicio.offsetTop, behavior: 'smooth' });
  }

  // El botón circular abre la invitación (nativo: Enter/Space)
  openSeal.addEventListener('click', openInvitation);
  // Clic en cualquier parte de la portada (fondo) también abre
  cover.addEventListener('click', function (e) {
    if (opened) return;
    if (e.target.closest('.open-seal')) return;
    openInvitation();
  });

  /* ------------------------------------------------------------
    3. AUDIO / REPRODUCTOR FLOTANTE
  ------------------------------------------------------------ */
  var song = document.getElementById('bgSong');
  var toggle = document.getElementById('musicToggle');
  var MUSIC_START_SECONDS = 14; // segundo donde empieza a cantar
  var songStarted = false;

  function hasRealSong() {
    var src = (song && song.querySelector('source')) ? song.querySelector('source').getAttribute('src') : '';
    if (!src || src.indexOf('TU-CANCION') !== -1) return false;
    return /\.(mp3|wav|m4a|ogg)(\?.*)?$/i.test(src);
  }

  function playSong() {
    if (!song) return;
    var start = function () {
      try {
        if (Math.abs(song.currentTime - MUSIC_START_SECONDS) > 2) song.currentTime = MUSIC_START_SECONDS;
      } catch (err) { /* noop */ }
      song.play().catch(function () { /* autoplay denegado */ });
    };
    if (!songStarted) {
      songStarted = true;
      if (song.readyState >= 1) start();
      else song.addEventListener('loadedmetadata', start, { once: true });
    } else {
      song.play().catch(function () {});
    }
  }

  function spawnNote() {
    var n = document.createElement('span');
    n.className = 'mnote';
    n.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9z"/></svg>';
    n.style.setProperty('--dx', (16 + Math.random() * 34) + 'px');
    n.style.setProperty('--dy', (-52 - Math.random() * 46) + 'px');
    n.style.setProperty('--rot', (-14 + Math.random() * 34) + 'deg');
    document.body.appendChild(n);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { n.classList.add('rise'); });
    });
    setTimeout(function () { n.remove(); }, 1700);
  }
  var notesTimer = null;
  function startNotes() { if (!notesTimer) { spawnNote(); notesTimer = setInterval(spawnNote, 650); } }
  function stopNotes() { if (notesTimer) { clearInterval(notesTimer); notesTimer = null; } }

  toggle.addEventListener('click', function () {
    if (song.paused) {
      playSong();
      toggle.classList.remove('paused');
      toggle.classList.add('playing');
      toggle.setAttribute('aria-label', 'Pausar canción');
      toggle.setAttribute('aria-pressed', 'true');
      startNotes();
    } else {
      song.pause();
      toggle.classList.add('paused');
      toggle.classList.remove('playing');
      toggle.setAttribute('aria-label', 'Reproducir canción');
      toggle.setAttribute('aria-pressed', 'false');
      stopNotes();
    }
  });

  /* ------------------------------------------------------------
    4. LLUVIA DE FLORES (Canvas, 60fps y ligera)
  ------------------------------------------------------------ */
  function petalRain() {
    var canvas = document.getElementById('petalCanvas');
    if (!canvas || !canvas.getContext || REDUCED_MOTION) return;

    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1;
    var COLORS = ['#C3AED6', '#A280B9', '#D9CBE8', '#EAB6C9', '#D992AC', '#FFDAB9', '#F3B092'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    var rzPetal = null;
    window.addEventListener('resize', function () {
      if (rzPetal) return;
      rzPetal = requestAnimationFrame(function () {
        rzPetal = null;
        resize();
      });
    });

    // Genera una flor (5 o 6 pétalos) como sprite para rendimiento
    function makeFlower(color, size, petals) {
      var s = Math.ceil(size * dpr);
      var c = document.createElement('canvas');
      c.width = c.height = s;
      var g = c.getContext('2d');
      g.scale(dpr, dpr);
      g.translate(size / 2, size / 2);
      for (var i = 0; i < petals; i++) {
        g.save();
        g.rotate(i * Math.PI * 2 / petals + Math.PI / 2);
        g.beginPath();
        g.ellipse(0, size * 0.16, size * 0.16, size * 0.29, 0, 0, Math.PI * 2);
        g.fillStyle = color;
        g.globalAlpha = 0.9;
        g.fill();
        g.restore();
      }
      g.globalAlpha = 1;
      g.fillStyle = 'rgba(46,91,75,.9)';
      g.beginPath(); g.arc(0, 0, size * 0.05, 0, Math.PI * 2); g.fill();
      return c;
    }

    function spawn(top) {
      var depth = Math.random();                 // 0 = fondo lento, 1 = frente rápido
      var size = 11 + depth * 22;
      return {
        x: Math.random() * w,
        y: top ? -size * 2 - Math.random() * h * 0.4 : Math.random() * h,
        size: size,
        depth: depth,
        vy: (0.55 + depth * 1.15) * (0.8 + Math.random() * 0.45),
        vx: (Math.random() - 0.5) * 0.22,          // deriva horizontal ligera
        amp: 18 + Math.random() * 42,
        swaySpeed: 0.008 + Math.random() * 0.012,  // velocidad de mecedora lateral
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.028 - 0.014) * (depth + 0.45),
        pulse: Math.random() * Math.PI * 2,        // pulso de escala orgánico
        pulseSpeed: 0.02 + Math.random() * 0.03,
        sprite: makeFlower(COLORS[(Math.random() * COLORS.length) | 0], size, Math.random() < 0.5 ? 5 : 6),
        alpha: 0.22 + depth * 0.5
      };
    }

    var count = Math.max(14, Math.min(34, Math.floor(w / 38)));
    var flowers = [];
    for (var i = 0; i < count; i++) flowers.push(spawn(false));

    var rafId = null;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      var topIn = h * 0.12;
      var bottomFade = h * 0.16;
      for (var i = 0; i < flowers.length; i++) {
        var f = flowers[i];
        f.y += f.vy;
        f.x += f.vx;
        f.phase += f.swaySpeed;
        f.rot += f.rotSpeed;
        f.pulse += f.pulseSpeed;

        var x = f.x + Math.sin(f.phase) * f.amp;
        if (x < -f.size) x = w + f.size;
        else if (x > w + f.size) x = -f.size;

        if (f.y > h + f.size) { f.y = -f.size * 2; f.x = Math.random() * w; f.vx = (Math.random() - 0.5) * 0.22; f.phase = Math.random() * Math.PI * 2; }

        var a = f.alpha;
        if (f.y < topIn) a *= Math.max(0, f.y / topIn);
        if (f.y > h - bottomFade) a *= Math.max(0, (h - f.y) / bottomFade);
        if (a <= 0.01) continue;

        // Pulso de escala sutil para un aleteo más natural
        var sq = 1 + Math.sin(f.pulse) * 0.07;
        var sz = f.size * sq;

        ctx.globalAlpha = a;
        ctx.save();
        ctx.translate(x, f.y);
        ctx.rotate(f.rot);
        ctx.drawImage(f.sprite, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (rafId) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    // Pausa en pestañas ocultas para ahorrar batería
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!rafId) { rafId = requestAnimationFrame(frame); }
    });
  }
  petalRain();

  /* ------------------------------------------------------------
    5. CUENTA REGRESIVA
  ------------------------------------------------------------ */
  function tickCountdown() {
    var diff = Math.max(0, WEDDING.day.getTime() - Date.now());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff / 3600000) % 24);
    var m = Math.floor((diff / 60000) % 60);
    var s = Math.floor((diff / 1000) % 60);
    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-min').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-sec').textContent = String(s).padStart(2, '0');
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ------------------------------------------------------------
    6. GALERÍA — CARRUSEL INFINITO (AUTOPLAY) + LIGHTBOX
       Movimiento continuo y suave en bucle; se pausa al pasar el
       cursor o mantener presionado la pantalla; arrastre / swipe
       y flechas para navegar; clic en una foto abre el visor.
  ------------------------------------------------------------ */
  (function initCarousel() {
    var track = document.getElementById('galleryTrack');
    var viewport = document.getElementById('galleryViewport');
    var prevBtn = document.getElementById('galleryPrev');
    var nextBtn = document.getElementById('galleryNext');
    if (!track || !viewport) return;

    /* 1) Fotos declaradas en el HTML (#galleryTrack: <figure class="photo-card">).
          Se clonan una vez para lograr el bucle perfecto. */
    var originals = Array.prototype.slice.call(track.children);
    var total = originals.length;
    if (!total) return;
    for (var c = 0; c < originals.length; c++) {
      var clone = originals[c].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
    var imgs = track.querySelectorAll('img');
    for (var g = 0; g < imgs.length; g++) {
      imgs[g].draggable = false;
      imgs[g].addEventListener('dragstart', function (e) { e.preventDefault(); });
    }
    // Si falta alguna foto local, muestra un damero dorado elegante (sin roto)
    var B = 'http://www.w3.org/2000/svg';
    var PH = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
      '<svg xmlns="' + B + '" width="800" height="1000">' +
      '<rect width="800" height="1000" fill="#F3EFEA"/>' +
      '<g transform="translate(400 500)">' +
      '<rect width="18" height="18" x="-9" y="-9" transform="rotate(45)" fill="none" stroke="#9C7A2F" stroke-width="1.5"/>' +
      '</g></svg>');

    /* Carga en 3 pasos sin parpadeos ni roturas:
       1) fade-in suave cuando la foto termina de cargar,
       2) reintento único con cache-busting si la red falla,
       3) placeholder dorado como último recurso (nunca icono roto). */
    function markIn(cardImg) {
      if (cardImg && cardImg.tagName === 'IMG' && !cardImg.classList.contains('in')) {
        cardImg.classList.add('in');
      }
    }
    track.addEventListener('load', function (e) { markIn(e.target); }, true);
    track.addEventListener('error', function (e) {
      var bad = e.target;
      if (bad.tagName !== 'IMG' || bad.dataset.fb) return;
      var tries = parseInt(bad.dataset.tries || '0', 10);
      var base = (bad.getAttribute('src') || '').split('#')[0];
      if (tries < 1 && base && base !== PH) {
        bad.dataset.tries = '1';
        bad.src = base + '?t=' + Date.now();
        return;
      }
      bad.dataset.fb = '1';
      bad.src = PH;
      markIn(bad);
    }, true);
    var preIn = track.querySelectorAll('img');
    for (var pi = 0; pi < preIn.length; pi++) {
      if (preIn[pi].complete) markIn(preIn[pi]);
    }

    /* 2) Marquee infinito (requestAnimationFrame + translate3d) */
    var GAP = 22;
    var SPEED = 34; // px/segundo — movimiento constante y elegante
    var cardW = 0, setW = 0, x = 0;
    function step() { return cardW + GAP; }
    function wrapX() {
      if (setW <= 0) return;
      if (x <= -setW) x += setW;
      else if (x > 0) x -= setW;
    }
    function measure() {
      cardW = originals[0].getBoundingClientRect().width;
      setW = step() * total;
      wrapX();
    }
    function draw() { track.style.transform = 'translate3d(' + x + 'px,0,0)'; }

    var lastT = performance.now();
    var paused = false;
    var dragging = false;
    var freezeUntil = 0;
    var startX = 0, startPos = 0, moved = false, dragDist = 0;
    function loop(now) {
      var dt = (now - lastT) / 1000;
      lastT = now;
      if (!paused && !dragging && !REDUCED_MOTION && now > freezeUntil && !document.hidden) {
        x -= SPEED * dt;
        wrapX();
      }
      draw();
      requestAnimationFrame(loop);
    }
    measure();
    var rzCar = null;
    window.addEventListener('resize', function () {
      if (rzCar) return;
      rzCar = requestAnimationFrame(function () {
        rzCar = null;
        measure();
      });
    });
    requestAnimationFrame(loop);

    /* 3) Pausa al pasar el cursor (hover) o mantener presionado (press) */
    viewport.addEventListener('mouseenter', function () { if (!dragging) paused = true; });
    viewport.addEventListener('mouseleave', function () { if (!dragging) paused = false; });

    viewport.addEventListener('pointerdown', function (e) {
      paused = true;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startPos = x;
      viewport.classList.add('dragging');
      if (viewport.setPointerCapture) viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dragDist = e.clientX - startX;
      if (Math.abs(dragDist) > 8) moved = true;
      x = startPos + dragDist;
      draw();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      paused = false;
      viewport.classList.remove('dragging');
      x = Math.round(x / step()) * step(); // encaje a tarjeta completa
      wrapX();
      draw();
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    /* 4) Flechas (pausan el autoplay un instante) */
    function jump(delta) {
      dragging = false;
      paused = true;
      x += delta;
      wrapX();
      draw();
      freezeUntil = performance.now() + 460;
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { jump(+step()); });
    if (nextBtn) nextBtn.addEventListener('click', function () { jump(-step()); });

    /* 5) LIGHTBOX — visor a pantalla completa */
    var box = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var lbCount = document.getElementById('lbCount');
    var lbTotal = document.getElementById('lbTotal');
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');
    if (!box || !lbImg) return;
    var idx = -1;
    if (lbTotal) lbTotal.textContent = String(total);

    /* Fade-in del visor + placeholder si la foto falla */
    var lbReq = 0;
    lbImg.addEventListener('load', function () { lbImg.classList.add('in'); });
    lbImg.addEventListener('error', function () {
      if (lbImg.__req !== lbReq) return; // request antiguo descartado
      if (lbImg.dataset.fb) return;
      lbImg.dataset.fb = '1';
      if (lbImg.src !== PH) lbImg.src = PH;
      lbImg.classList.add('in');
    });

    function openAt(i) {
      idx = (i + total) % total;
      var card = originals[idx];
      var img = card.querySelector('img');
      if (lbImg.dataset.fb) lbImg.dataset.fb = '';
      lbReq++;
      lbImg.__req = lbReq;
      lbImg.classList.remove('in');
      lbImg.src = (img.currentSrc && img.currentSrc !== PH) ? img.currentSrc : img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = card.getAttribute('data-caption') || '';
      lbCount.textContent = String(idx + 1);
      box.classList.add('open');
      bodyEl.classList.add('lb-open');
      paused = true; // el carrusel descansa mientras el visor está abierto
    }
    function closeBox() {
      box.classList.remove('open');
      bodyEl.classList.remove('lb-open');
      idx = -1;
      paused = false;
    }
    function nextPhoto() { openAt(idx + 1); }
    function prevPhoto() { openAt(idx - 1); }

    // Delegación: cualquier tarjeta (original o clon) abre el visor
    track.addEventListener('click', function (e) {
      // Sólo se descarta un verdadero arrastre (≥12px); toques y micro-movimientos abren
      if (moved && Math.abs(dragDist) > 12) { moved = false; return; }
      moved = false;
      var card = e.target;
      while (card && card !== track && !(card.classList && card.classList.contains('photo-card'))) {
        card = card.parentNode;
      }
      if (!card || card === track) return;
      var pos = Array.prototype.indexOf.call(track.children, card);
      openAt(((pos % total) + total) % total);
    });

    lbClose.addEventListener('click', closeBox);
    lbPrev.addEventListener('click', function (e) { e.stopPropagation(); prevPhoto(); });
    lbNext.addEventListener('click', function (e) { e.stopPropagation(); nextPhoto(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') closeBox();
      else if (e.key === 'ArrowRight') nextPhoto();
      else if (e.key === 'ArrowLeft') prevPhoto();
    });

    /* 6) Swipe dentro del visor (móviles) */
    var sw = false, sx = 0, sy = 0;
    box.addEventListener('touchstart', function (e) {
      sw = true;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (!sw) return;
      sw = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) nextPhoto(); else prevPhoto();
      }
    }, { passive: true });

    /* Clic en el fondo oscuro cierra el visor */
    box.addEventListener('click', function (e) {
      if (e.target === box) closeBox();
    });
  })();

  /* ------------------------------------------------------------
    7. APARICIÓN AL HACER SCROLL
  ------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal, .carousel');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ------------------------------------------------------------
    8. RSVP — VALIDADOR + WHATSAPP + ESTADO DE CARGA
  ------------------------------------------------------------ */
  (function initRSVP() {
    var form = document.getElementById('rsvpForm');
    var status = document.getElementById('rsvpStatus');
    var btn = document.getElementById('rsvpBtn');
    var btnLabel = btn.querySelector('.btn-label');
    var fields = {
      nombre: document.getElementById('nombre'),
      pases: document.getElementById('pases')
    };
    var asistenciaInputs = document.querySelectorAll('input[name=asistencia]');

    function clearInvalid() {
      form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    }
    function markInvalid(group) {
      var fieldEl = form.querySelector('[data-validate="' + group + '"]');
      if (fieldEl) fieldEl.classList.add('invalid');
    }
    [fields.nombre].forEach(function (inp) {
      inp.addEventListener('input', clearInvalid);
    });
    asistenciaInputs.forEach(function (inp) {
      inp.addEventListener('change', clearInvalid);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearInvalid();

      var nombre = fields.nombre.value.trim();
      var asistencia = form.querySelector('input[name=asistencia]:checked');

      var ok = true;
      if (!nombre) { markInvalid('nombre'); ok = false; }
      if (!asistencia) { markInvalid('asistencia'); ok = false; }
      if (!ok) return;

      var pases = parseInt(fields.pases.value, 10) || 1;
      var data = { nombre: nombre, asistencia: asistencia.value, pases: pases };

      // Estado de carga
      btn.classList.add('loading');
      btnLabel.textContent = 'Enviando…';
      status.textContent = 'Enviando tu confirmación…';
      status.classList.add('show', 'err');
      status.classList.remove('err');

      var confirmText = asistencia.value === 'si'
        ? '¡Gracias, ' + nombre + '! Confirmaste tu asistencia' + (pases > 1 ? ' para ' + pases + ' personas' : '') + '.'
        : 'Gracias por avisar, ' + nombre + '. Sentimos que no puedas venir.';

      // Formspree (opcional)
      var request = FORMSPREE_URL
        ? fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
          }).then(function (r) { if (!r.ok) throw new Error('fail'); })
        : Promise.resolve();

      // Espera mínima para que el estado de carga sea visible
      Promise.all([request, new Promise(function (r) { setTimeout(r, 900); })])
        .then(function () {
          status.textContent = confirmText;
          status.classList.add('show');
          report();
        })
        .catch(function () {
          status.textContent = confirmText + ' (no pudimos guardar tu respuesta; avísanos por WhatsApp)';
          status.classList.add('show');
          report();
        });

      function report() {
        btn.classList.remove('loading');
        btnLabel.textContent = 'Enviar confirmación';
        form.reset();
      }

      // Abrir WhatsApp con el mensaje de confirmación
      if (asistencia.value === 'si' && WHATSAPP_NUMBER) {
        var texto = 'Hola, soy ' + nombre + '. Confirmo mi asistencia a la boda de James & Delicia.';
        if (pases > 1) texto += ' Vengo con ' + (pases - 1) + ' acompañante(s).';
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(texto), '_blank');
      }
    });
  })();

  /* ------------------------------------------------------------
    9. COMPARTIR INVITACIÓN
  ------------------------------------------------------------ */
  var shareBtn = document.getElementById('shareBtn');
  shareBtn.addEventListener('click', function () {
    var url = location.href;
    var texto = 'James & Delicia · Nuestra Boda · 26/09/2026 · Ate, Lima, Perú. Te invitamos a nuestra invitación: ' + url;
    if (navigator.share) {
      navigator.share({ title: 'James & Delicia · Nuestra Boda', text: texto, url: url }).catch(function () {});
      return;
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
  });

})();