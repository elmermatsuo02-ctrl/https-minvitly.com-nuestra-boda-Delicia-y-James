const body = document.body;
  const cover = document.getElementById('cover');
  const song = document.getElementById('bgSong');
  const toggle = document.getElementById('musicToggle');

  // Portada: al presionar se abre la invitación y suena la música
  function hasRealSong(){
    var src = song && song.querySelector('source') ? song.querySelector('source').getAttribute('src') : '';
    return !!src && src.indexOf('TU-CANCION') === -1;
  }
  function openInvitation(){
    document.documentElement.classList.remove('locked');
    body.classList.remove('locked');
    body.classList.add('opened');
    cover.classList.add('closed');
    if(hasRealSong()){
      playSong();
      toggle.classList.remove('paused');
      toggle.classList.add('playing');
      toggle.setAttribute('aria-label','Pausar canción');
      startNotes();
    }
    cover.removeEventListener('click', openInvitation);
    cover.removeEventListener('keydown', onCoverKey);
  }
  function onCoverKey(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openInvitation(); } }
  cover.addEventListener('click', openInvitation);
  cover.addEventListener('keydown', onCoverKey);

  // Música de fondo — toca/pausa la canción
  const MUSIC_START_SECONDS = 14; // segundo donde empieza a cantar (ajusta si tu versión difiere)
  let songStarted = false;
  function playSong(){
    if(!song) return;
    const start = function(){
      try{
        if(Math.abs(song.currentTime - MUSIC_START_SECONDS) > 2) song.currentTime = MUSIC_START_SECONDS;
      }catch(e){}
      song.play().catch(function(){});
    };
    if(!songStarted){
      songStarted = true;
      if(song.readyState >= 1){ start(); }
      else{ song.addEventListener('loadedmetadata', start, {once:true}); }
    }else{
      song.play().catch(function(){});
    }
  }
  function spawnNote(){
    const n = document.createElement('span');
    n.className = 'mnote';
    n.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3H9z"/></svg>';
    n.style.setProperty('--dx',(16+Math.random()*34)+'px');
    n.style.setProperty('--dy',(-52-Math.random()*46)+'px');
    n.style.setProperty('--rot',(-14+Math.random()*34)+'deg');
    document.body.appendChild(n);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ n.classList.add('rise'); }); });
    setTimeout(function(){ n.remove(); }, 1700);
  }
  let notesTimer = null;
  function startNotes(){ if(!notesTimer){ spawnNote(); notesTimer = setInterval(spawnNote, 650); } }
  function stopNotes(){ if(notesTimer){ clearInterval(notesTimer); notesTimer = null; } }
  toggle.addEventListener('click', ()=>{
    if(song.paused){
      playSong();
      toggle.classList.remove('paused');
      toggle.classList.add('playing');
      toggle.setAttribute('aria-label','Pausar canción');
      startNotes();
    }else{
      song.pause();
      toggle.classList.add('paused');
      toggle.classList.remove('playing');
      toggle.setAttribute('aria-label','Reproducir canción');
      stopNotes();
    }
  });

  // Aparición de secciones al hacer scroll
  const revealEls = document.querySelectorAll('.reveal, .icon-row');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in-view'); });
    }, {threshold:.08, rootMargin:'0px 0px -5% 0px'});
    revealEls.forEach(el=>io.observe(el));
  }else{
    revealEls.forEach(el=>el.classList.add('in-view'));
  }

  // Carga diferida de fondos de imagen (se cargan al acercarse a la vista)
  function setLazyBg(el){
    var src = el.getAttribute('data-bg');
    if(src) el.style.backgroundImage = "url('" + src + "')";
  }
  var lazyBgs = document.querySelectorAll('[data-bg]:not(.hero-slide)');
  if('IntersectionObserver' in window){
    var bgIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          setLazyBg(en.target);
          bgIO.unobserve(en.target);
        }
      });
    }, {rootMargin:'500px 0px'});
    lazyBgs.forEach(function(el){ bgIO.observe(el); });
  }else{
    lazyBgs.forEach(setLazyBg);
  }
  // Los slides 2 y 3 del hero se cargan después del render inicial
  var heroSlides = document.querySelectorAll('.hero-slide[data-bg]');
  function loadHeroSlides(){
    heroSlides.forEach(setLazyBg);
  }
  if('requestIdleCallback' in window){ requestIdleCallback(loadHeroSlides, {timeout:3500}); }
  else{ setTimeout(loadHeroSlides, 2500); }

  // Ajusta la portada para que todo quede dentro del marco (cualquier pantalla)
  function fitCover(){
    const content = document.querySelector('.cover-content');
    if(!content) return;
    const inset = window.innerWidth <= 480 ? 30 : 40;
    const availW = window.innerWidth - inset*2;
    const availH = window.innerHeight - inset*2;
    const rect = content.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    const scale = Math.min(1, availW/rect.width, availH/rect.height);
    content.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(4) + ')';
  }
  function fitCoverLater(){
    requestAnimationFrame(function(){ requestAnimationFrame(fitCover); });
  }
  fitCover();
  window.addEventListener('resize', fitCover);
  window.addEventListener('load', fitCoverLater);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitCover); }

  // Cuenta regresiva — fecha real de la boda
  const weddingDate = new Date('2026-09-26T14:30:00').getTime();
  function tick(){
    const now = Date.now();
    let diff = weddingDate - now;
    if(diff < 0) diff = 0;
    const d = Math.floor(diff/(1000*60*60*24));
    const h = Math.floor((diff/(1000*60*60))%24);
    const m = Math.floor((diff/(1000*60))%60);
    const s = Math.floor((diff/1000)%60);
    document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
    document.getElementById('cd-min').textContent = String(m).padStart(2,'0');
    document.getElementById('cd-sec').textContent = String(s).padStart(2,'0');
  }
  tick();
  setInterval(tick, 1000);

  // RSVP real: envía a Formspree (si configuras la URL) y/o abre WhatsApp con tu respuesta
  const FORMSPREE_URL = '';             // Ej.: 'https://formspree.io/f/xxxxxxxx' (opcional)
  const WHATSAPP_NUMBER = '51950110792';// WhatsApp de los novios (código 51 + número)

  document.getElementById('rsvpForm').addEventListener('submit', async function(e){
    e.preventDefault();
    const status = document.getElementById('rsvpStatus');
    const nombre = document.getElementById('nombre').value.trim();
    const asistencia = document.querySelector('input[name=asistencia]:checked').value;
    let acompanantes = parseInt(document.getElementById('acompanantes').value, 10) || 0;
    acompanantes = Math.max(0, Math.min(5, acompanantes));
    const mensaje = document.getElementById('mensaje').value.trim();

    if(!nombre){
      status.textContent = 'Por favor escribe tu nombre completo.';
      return;
    }

    const confirmText = asistencia === 'si'
      ? `¡Gracias, ${nombre}! Confirmaste tu asistencia${acompanantes > 0 ? ` con ${acompanantes} acompañante(s)` : ''}.`
      : `Gracias por avisar, ${nombre}. Sentimos que no puedas venir.`;
    status.textContent = confirmText;

    const data = { nombre, asistencia, acompanantes, mensaje };

    if(FORMSPREE_URL){
      try{
        const res = await fetch(FORMSPREE_URL, {
          method:'POST',
          headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify(data)
        });
        if(!res.ok) throw new Error('fallo');
        status.textContent = confirmText + ' Te confirmaremos por WhatsApp.';
      }catch(err){
        status.textContent = confirmText;
      }
    }

    if(WHATSAPP_NUMBER && asistencia === 'si'){
      let texto = `Hola, soy ${nombre}. Confirmo mi asistencia a la boda de James & Delicia.`;
      if(acompanantes > 0) texto += ` Vengo con ${acompanantes} acompañante(s).`;
      if(mensaje) texto += ` Mensaje: ${mensaje}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`, '_blank');
    }

    this.reset();
  });

  // Compartir invitación por WhatsApp (o el menú nativo del celular)
  const shareBtn = document.getElementById('shareBtn');
  shareBtn.addEventListener('click', async ()=>{
    const url = location.href;
    const texto = `James & Delicia · Nuestra Boda · 26/09/2026 · Ate, Lima, Perú. Te invitamos a nuestra invitación: ${url}`;
    if(navigator.share){
      try{
        await navigator.share({title:'James & Delicia · Nuestra Boda', text:texto, url});
        return;
      }catch(e){}
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
  });