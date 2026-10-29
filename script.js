/**
 * ==========================================================================
 * SCRIPT: Un Mes Volviendo a Vivir | Sauroposacc & Miaumorcito
 * Canvas Estelar, Cometas con Frases Flotantes (Cosmic Whispers),
 * Sintetizador Armónico a 432 Hz, Lightbox del Mapa Estelar, Cartas de Navegación
 * y Clímax de Conjunción Cósmica.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar iconos de Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     1. COSMIC STARFIELD & SHOOTING STARS CANVAS
     ========================================================================== */
  const canvas = document.getElementById('cosmic-canvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  const STARS_COUNT = Math.floor(Math.min(window.innerWidth, 1200) * 0.18);
  let stars = [];
  let shootingStars = [];

  function initStars() {
    stars = [];
    for (let i = 0; i < STARS_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        color: Math.random() > 0.3 ? '#fff4d4' : '#c9b8ff'
      });
    }
  }
  initStars();

  // Crear estrella fugaz ocasional en el canvas
  function spawnShootingStar() {
    if (Math.random() < 0.015 && shootingStars.length < 3) {
      shootingStars.push({
        x: Math.random() * width * 0.9,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 80 + 50,
        speed: Math.random() * 7 + 4,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 1,
        fadeSpeed: 0.018
      });
    }
  }

  function renderCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.alpha += s.twinkleSpeed;
      if (s.alpha > 0.95 || s.alpha < 0.2) {
        s.twinkleSpeed = -s.twinkleSpeed;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, s.alpha));
      ctx.fill();
    }

    spawnShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 245, 210, ${ss.opacity})`);
      grad.addColorStop(1, 'rgba(255, 245, 210, 0)');

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= ss.fadeSpeed;

      if (ss.opacity <= 0 || ss.x > width || ss.y > height) {
        shootingStars.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(renderCanvas);
  }
  requestAnimationFrame(renderCanvas);

  /* ==========================================================================
     2. MÚSICA AMBIENTAL CELESTIAL GENERATIVA (Web Audio API)
     Frecuencias armónicas suaves a 432 Hz.
     ========================================================================== */
  const audioBtn = document.getElementById('ambientAudioBtn');
  const audioBtnText = document.getElementById('audioBtnText');
  let audioCtx = null;
  let isPlaying = false;
  let ambientNodes = [];

  function initCelestialAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(480, audioCtx.currentTime);

    const baseFreqs = [130.81, 164.81, 196.00, 246.94, 293.66, 392.00];

    baseFreqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.03, audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.02 + (idx < 2 ? 0.03 : 0.015), audioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(lowpass);
      osc.start();

      ambientNodes.push(osc, lfo);
    });

    lowpass.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    ambientNodes.push(masterGain, lowpass);
  }

  function toggleAudio() {
    if (!audioCtx) {
      initCelestialAudio();
      isPlaying = true;
      audioBtn.classList.add('audio-playing');
      audioBtnText.textContent = 'Sonando en calma';
      return;
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      isPlaying = true;
      audioBtn.classList.add('audio-playing');
      audioBtnText.textContent = 'Sonando en calma';
    } else if (isPlaying) {
      audioCtx.suspend();
      isPlaying = false;
      audioBtn.classList.remove('audio-playing');
      audioBtnText.textContent = 'Música pausada';
    } else {
      audioCtx.resume();
      isPlaying = true;
      audioBtn.classList.add('audio-playing');
      audioBtnText.textContent = 'Sonando en calma';
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

  function playCelestialChime(freq = 587.33) {
    if (!audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      } catch (e) {
        return;
      }
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  }

  /* ==========================================================================
     3. METEORITOS INTERACTIVOS (CRUZAN DE LADO A LADO SIN TEXTO)
     Al hacer clic / tocarlos, revelan sus frases en una tarjeta estelar.
     ========================================================================== */
  const cosmicMeteorites = [
    // ✍️ [EDITAR / AÑADIR FRASES DE METEORITOS AQUÍ]:
    {
      quote: "Dada la inmensidad del tiempo y la inmensidad del universo, es un inmenso placer para mí compartir un planeta y una época contigo.",
      author: "— Carl Sagan"
    },
    {
      quote: "El amor es la única cosa que podemos percibir y que trasciende dimensiones de tiempo y espacio.",
      author: "— Interstellar"
    },
    {
      quote: "En un universo de 93 mil millones de años luz, coincidir en la misma época y en el mismo abrazo contigo es mi milagro favorito, Miaumorcito.",
      author: "— Sauroposacc"
    },
    {
      quote: "Eres mi gravedad favorita: no me dejas caer al vacío, me mantienes a salvo en tu órbita, Mividita.",
      author: "— Sauroposacc"
    },
    {
      quote: "Entrelazamiento cuántico: dos almas que no necesitan palabras para sentir exactamente lo mismo al mismo instante.",
      author: "— Sauroposacc & Sushi"
    },
    {
      quote: "El universo se expande hacia el infinito, pero mi certeza absoluta se reduce a un solo punto sagrado: tú.",
      author: "— Sauroposacc"
    },
    {
      quote: "El día que tomé tu mano, supe que había llevado las manos vacías toda mi vida. Dime dónde te duele más, y haré que sea donde más te amen.",
      author: "— Sauroposacc para su Vale Fuuu"
    },
    {
      quote: "Muéstrame tus espinas, mi amor, que yo te mostraré unas manos dispuestas a sangrar por ti sin soltarte jamás.",
      author: "— Sauroposacc para Valentina"
    }
  ];

  const whispersLayer = document.getElementById('cosmic-whispers-layer');
  let meteoriteIndex = 0;

  function spawnInteractiveMeteorite() {
    if (!whispersLayer) return;

    const data = cosmicMeteorites[meteoriteIndex % cosmicMeteorites.length];
    meteoriteIndex++;

    const tracker = document.createElement('div');
    tracker.className = 'meteorite-tracker';

    // Altura aleatoria para que cruce en distintas zonas (entre 12% y 78% de la pantalla)
    const startY = Math.random() * (window.innerHeight * 0.66) + (window.innerHeight * 0.12);

    // Dirección: cruza de lado a lado (de izquierda a derecha)
    const startX = -160;
    const deltaX = window.innerWidth + 320;
    const deltaY = (Math.random() * 140 - 70); // Desviación angular suave
    const duration = Math.random() * 4 + 18; // 18 a 22 segundos de viaje suave

    tracker.style.top = `${startY}px`;
    tracker.style.left = `${startX}px`;
    tracker.style.setProperty('--deltaX', `${deltaX}px`);
    tracker.style.setProperty('--deltaY', `${deltaY}px`);
    tracker.style.setProperty('--duration', `${duration}s`);

    // El cuerpo del meteorito: solo destello luminoso y cola de plasma, SIN LETRAS
    tracker.innerHTML = `
      <div class="meteorite-body">
        <div class="meteorite-tail"></div>
        <div class="meteorite-head"></div>
        <span class="meteorite-hint">✦ Toca el meteorito ✦</span>
      </div>
    `;

    // Interacción: al apretar el meteorito, ¡se detiene y revela la frase!
    tracker.addEventListener('click', (e) => {
      e.stopPropagation();
      tracker.style.animationPlayState = 'paused';

      // Revelar tarjeta de estelar
      revealMeteoriteQuote(data);

      // Desvanecer el meteorito tras atrapar su mensaje
      setTimeout(() => {
        tracker.style.transition = 'opacity 0.6s ease';
        tracker.style.opacity = '0';
        setTimeout(() => tracker.remove(), 600);
      }, 500);
    });

    whispersLayer.appendChild(tracker);

    // Si nadie lo toca, se remueve al salir de la pantalla
    setTimeout(() => {
      if (tracker.parentNode) {
        tracker.remove();
      }
    }, duration * 1000 + 400);
  }

  // Desplegar la tarjeta estelar de la frase
  function revealMeteoriteQuote(data) {
    // Remover cualquier tarjeta previa si existiera
    const existingCard = document.querySelector('.meteorite-revealed-card');
    if (existingCard) existingCard.remove();

    const card = document.createElement('div');
    card.className = 'meteorite-revealed-card';
    card.innerHTML = `
      <div class="revealed-header">
        <span class="revealed-badge">✦ Destello del Cosmos ✦</span>
        <button class="revealed-close-btn" aria-label="Cerrar">✕</button>
      </div>
      <p class="revealed-quote">“${data.quote}”</p>
      <div class="revealed-author">${data.author}</div>
    `;

    // Acorde celestial armónico triple
    playCelestialChime(523.25); // Do
    setTimeout(() => playCelestialChime(659.25), 100); // Mi
    setTimeout(() => playCelestialChime(783.99), 200); // Sol

    // Cerrar al dar clic en la X
    const closeBtn = card.querySelector('.revealed-close-btn');
    closeBtn.addEventListener('click', () => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'translate(-50%, -46%) scale(0.92)';
      setTimeout(() => card.remove(), 300);
    });

    document.body.appendChild(card);
  }

  // Ritmo espaciado: primer meteorito a los 5 segundos, y luego cada 24 segundos
  setTimeout(spawnInteractiveMeteorite, 5000);
  setInterval(spawnInteractiveMeteorite, 24000);

  /* ==========================================================================
     4. LIGHTBOX DEL MAPA ESTELAR
     ========================================================================== */
  const mapFrame = document.getElementById('mapFrame');
  const zoomMapBtn = document.getElementById('zoomMapBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalActionBtn = document.getElementById('modalActionBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  function openStarMapModal() {
    if (!modalBackdrop) return;
    modalTitle.textContent = "El Firmamento que nos Guía";
    modalBody.innerHTML = `
      <img src="./assets/MapaEstelar.jpg" alt="Mapa Estelar en detalle" class="modal-map-preview">
      <p>
        <strong>El cielo exacto nuestro:</strong> Esta bóveda celeste fue testigo 
        del momento en que dos almas decidieron caminar al mismo compás. Un recordatorio perpetuo 
        de que, sin importar cuán oscuro sea el mar, tu luz me guía a casa.
      </p>
    `;
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    playCelestialChime(587.33); // Re
  }

  if (mapFrame) mapFrame.addEventListener('click', openStarMapModal);
  if (zoomMapBtn) zoomMapBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openStarMapModal();
  });

  /* ==========================================================================
     5. LAS CARTAS DE NAVEGACIÓN (LAS 4 ESTRELLAS GUÍA)
     ========================================================================== */
  const starCardsData = {
    orion: {
      title: "Orión — La Firmeza",
      coord: "RA 05h 35m / Dec -05° 23'",
      text: "Me enseñaste que se puede ser vulnerable sin perder la fuerza, y que el amor verdadero protege sin aplastar. A tu lado aprendí que desarmar el pecho no es rendirse, sino confiar plenamente en que la persona que tienes enfrente jamás usará tu ternura en tu contra, Miaumorcito.",
      note: 440 // La
    },
    sirio: {
      title: "Sirio — La Claridad",
      coord: "RA 06h 45m / Dec -16° 42'",
      text: "Tu forma de quererme tan directa y sincera me demostró que el amor sano no necesita rodeos ni adivinanzas. La luz más brillante del cielo nocturno se parece a tu honestidad: diáfana, sin pretensiones y con la paz de saber siempre dónde estamos parados, Mividita.",
      note: 493.88 // Si
    },
    pleyades: {
      title: "Las Pléyades — El Refugio",
      coord: "RA 03h 47m / Dec +24° 07'",
      text: "Tus detalles, desde las flores hasta el poema que guardaste meses para mí, me mostraron lo que se siente tener un hogar en alguien. Como este cúmulo estelar que abriga la noche, cada pequeño gesto tuyo es un techo donde mi corazón reposa a salvo.",
      note: 523.25 // Do
    },
    andromeda: {
      title: "Andrómeda — El Futuro",
      coord: "RA 00h 42m / Dec +41° 16'",
      text: "La certeza de que no quiero 'ver qué pasa', sino luchar por una vida entera, con salud y metas claras a tu lado. Una galaxia infinita de posibilidades que hoy tiene un rumbo concreto: construir un porvenir sólido, sano y próspero contigo, Sushi.",
      note: 587.33 // Re
    }
  };

  const navStarCards = document.querySelectorAll('.nav-star-card');
  navStarCards.forEach(card => {
    card.addEventListener('click', () => {
      const starKey = card.getAttribute('data-star');
      const data = starCardsData[starKey];
      if (data && modalBackdrop) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = `
          <div style="font-size:0.8rem; letter-spacing:0.12em; color:var(--gold-primary); text-transform:uppercase; margin-bottom:1rem;">
            ✦ Coordenada Celeste: ${data.coord}
          </div>
          <p>${data.text}</p>
        `;
        modalBackdrop.classList.add('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        playCelestialChime(data.note);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ==========================================================================
     6. SANTUARIO POÉTICO: REVELACIÓN DE SAUROPOSACC
     ========================================================================== */
  const toggleResponseBtn = document.getElementById('toggleResponseBtn');
  const leitoResponse = document.getElementById('leitoResponse');
  const btnRevealLabel = document.getElementById('btnRevealLabel');

  if (toggleResponseBtn && leitoResponse) {
    toggleResponseBtn.addEventListener('click', () => {
      const isHidden = leitoResponse.hasAttribute('hidden');

      if (isHidden) {
        leitoResponse.removeAttribute('hidden');
        toggleResponseBtn.setAttribute('aria-expanded', 'true');
        btnRevealLabel.textContent = 'Guardar estas palabras en el pecho';
        playCelestialChime(523.25);

        setTimeout(() => {
          leitoResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      } else {
        leitoResponse.setAttribute('hidden', '');
        toggleResponseBtn.setAttribute('aria-expanded', 'false');
        btnRevealLabel.textContent = 'Lo que sentí al leer tus versos, Mividita';
      }
    });
  }

  /* ==========================================================================
     7. MÓDULO DE CERTEZAS: MODAL DETALLADO CON REFLEXIÓN
     ========================================================================== */
  const certezasData = {
    0: {
      title: "No se parece a nada del pasado",
      text: "Cuando dos personas han vivido desencantos o heridas, es natural temer volver a abrir el pecho. Pero contigo, Miaumorcito, jamás hubo esa pesadez. Desde el primer día todo fluyó sin trampas, sin especulaciones y con una nobleza desarmante. Me hiciste entender que lo que antes llamé amor no era más que esfuerzo por encajar; en cambio, contigo el amor es tan natural y fresco como el aire limpio tras la lluvia."
    },
    1: {
      title: "Sincronía constante",
      text: "Es fascinante cómo a veces uno de los dos empieza una frase y el otro ya la estaba pensando, o cómo coincidimos en enviar una canción que describe con exactitud lo que el alma sentía en ese minuto. Esa conexión mental y sensorial entre Sauroposacc y Mividita no se fabrica ni se fuerza: es la confirmación constante de que nuestros corazones vibran en la misma frecuencia."
    },
    2: {
      title: "El refugio seguro",
      text: "La tranquilidad de no tener que medir cada palabra por miedo a un conflicto injusto, la calma de saber que cuando hay un silencio entre los dos no hay frialdad sino cobijo. Eres ese lugar donde el mundo exterior se apaga y solo queda la certidumbre de que nos tenemos, nos cuidamos y nos respetamos, Sushi."
    }
  };

  const certezaCards = document.querySelectorAll('.certeza-card');
  certezaCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const data = certezasData[index];
      if (data && modalBackdrop) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = `<p>${data.text}</p>`;
        modalBackdrop.classList.add('is-open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
        playCelestialChime(659.25);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ==========================================================================
     8. BOTÓN DE ESTRELLA INTERACTIVA (WISHING STAR)
     ========================================================================== */
  const addStarBtn = document.getElementById('addStarBtn');
  const starsCount = document.getElementById('starsCount');
  let currentStars = 30; // 30 días cósmicos de amor

  if (addStarBtn) {
    addStarBtn.addEventListener('click', (e) => {
      currentStars++;
      starsCount.textContent = `${currentStars} encendidas`;

      const rect = addStarBtn.getBoundingClientRect();
      const star = document.createElement('div');
      star.style.position = 'fixed';
      star.style.left = `${rect.left + rect.width / 2}px`;
      star.style.top = `${rect.top}px`;
      star.style.color = '#ffd700';
      star.style.fontSize = '1.4rem';
      star.style.pointerEvents = 'none';
      star.style.zIndex = '999';
      star.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      star.textContent = '✦';
      document.body.appendChild(star);

      requestAnimationFrame(() => {
        star.style.transform = `translate(${Math.random() * 80 - 40}px, -120px) scale(1.6)`;
        star.style.opacity = '0';
      });

      setTimeout(() => star.remove(), 1200);
      playCelestialChime(783.99 + (currentStars % 5) * 40);
    });
  }

  /* ==========================================================================
     9. CLÍMAX FINAL: CARTA Y CONJUNCIÓN CÓSMICA INFINITA
     ========================================================================== */
  const climaxBtn = document.getElementById('climaxBtn');
  const saturdayBanner = document.getElementById('saturdayBanner');
  const saturdayCountdown = document.getElementById('saturdayCountdown');

  function updateCosmicMetrics() {
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    if (saturdayCountdown) {
      saturdayCountdown.textContent = `30 días cósmicos, ${hours} horas y ${mins} minutos compartiendo luz y gravedad infinita ✦`;
    }
  }

  function launchStardustConfetti(originX, originY) {
    const colors = ['#e6c875', '#ffd700', '#ffffff', '#c5b4ff', '#8c6cf7', '#ffb6c1'];
    const particlesCount = 80;

    for (let i = 0; i < particlesCount; i++) {
      const p = document.createElement('div');
      p.className = 'stardust-particle';

      const size = Math.random() * 8 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.boxShadow = `0 0 10px ${p.style.backgroundColor}`;

      if (Math.random() > 0.4) {
        p.style.borderRadius = '2px';
        p.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      }

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 260 + 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 80;
      const rot = Math.random() * 720 - 360;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.setProperty('--rot', `${rot}deg`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
  }

  function playCelebrationChord() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playCelestialChime(freq);
      }, idx * 110);
    });
  }

  if (climaxBtn && saturdayBanner) {
    climaxBtn.addEventListener('click', (e) => {
      const rect = climaxBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      launchStardustConfetti(originX, originY);

      setTimeout(() => {
        launchStardustConfetti(originX, originY - 40);
      }, 300);

      playCelebrationChord();

      saturdayBanner.removeAttribute('hidden');
      updateCosmicMetrics();

      setTimeout(() => {
        saturdayBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    });
  }

  updateCosmicMetrics();

  /* ============================================================
     LA CAJA SAGRADA — Sacred Box Logic
     ============================================================ */

  const sacredBox = document.getElementById('sacredBox');
  const sacredWrapper = document.getElementById('sacredBoxWrapper');
  const starlightFlash = document.getElementById('starlightFlash');
  const boxParticles = document.getElementById('boxParticles');
  const letterRevealed = document.getElementById('letterRevealed');
  const loveAudio = document.getElementById('loveAudio');

  let boxOpened = false;

  /**
   * Genera un chime de caja abriéndose usando Web Audio API
   * (tintineo suave — la llave en la cerradura)
   */
  function playBoxOpenChime() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;

      // Notas del chime: Re, Fa#, La, Re (arpegio ascendente dorado)
      const notes = [293.66, 369.99, 440.00, 587.33];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.14);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.14);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.14 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 1.1);

        osc.start(ctx.currentTime + i * 0.14);
        osc.stop(ctx.currentTime + i * 0.14 + 1.2);
      });

      // Reverb pad debajo del chime
      const padOsc = ctx.createOscillator();
      const padGain = ctx.createGain();
      padOsc.connect(padGain);
      padGain.connect(ctx.destination);
      padOsc.type = 'sine';
      padOsc.frequency.value = 146.83; // Re2
      padGain.gain.setValueAtTime(0, ctx.currentTime);
      padGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
      padOsc.start(ctx.currentTime);
      padOsc.stop(ctx.currentTime + 2.6);

    } catch (err) {
      console.warn('Box chime error:', err);
    }
  }

  /**
   * Crea partículas de luz que explotan desde el centro de la caja
   */
  function spawnBoxParticles() {
    if (!boxParticles) return;
    const count = 38;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'box-particle';

      const angle = (360 / count) * i + Math.random() * 15;
      const radius = 80 + Math.random() * 90;
      const rad = (angle * Math.PI) / 180;
      const tx = Math.cos(rad) * radius;
      const ty = Math.sin(rad) * radius - 40; // tirar hacia arriba
      const size = 4 + Math.random() * 8;
      const dur = 0.9 + Math.random() * 0.7;
      const delay = Math.random() * 0.2;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.setProperty('--size', `${size}px`);
      p.style.setProperty('--dur', `${dur}s`);
      p.style.animationDelay = `${delay}s`;

      // Mezcla de colores: dorado y violeta
      const isGold = Math.random() > 0.5;
      p.style.background = isGold
        ? 'radial-gradient(circle, #e6c875, rgba(255,230,100,0.3))'
        : 'radial-gradient(circle, #c3b1f0, rgba(140,108,247,0.4))';

      boxParticles.appendChild(p);
      setTimeout(() => p.remove(), (dur + delay + 0.3) * 1000);
    }
  }

  /**
   * Dispara el flash de destello estelar (blanco/violeta)
   */
  function triggerStarlightFlash() {
    if (!starlightFlash) return;
    starlightFlash.classList.add('active');
    setTimeout(() => {
      starlightFlash.style.transition = 'opacity 0.55s ease-out';
      starlightFlash.style.opacity = '0';
      setTimeout(() => {
        starlightFlash.classList.remove('active');
        starlightFlash.style.transition = '';
        starlightFlash.style.opacity = '';
      }, 600);
    }, 90);
  }

  /* ============================================================
     AUDIO PLAYER BAR (Lil Peep - Big City Blues)
     ============================================================ */
  const audioPlayerBar  = document.getElementById('audioPlayerBar');
  const apbPlayBtn      = document.getElementById('apbPlayBtn');
  const apbStopBtn      = document.getElementById('apbStopBtn');
  const apbRestartBtn   = document.getElementById('apbRestartBtn');
  const apbProgressFill = document.getElementById('apbProgressFill');
  const apbProgressBar  = document.querySelector('.apb-progress-bar');
  const apbTime         = document.getElementById('apbTime');
  const apbVolume       = document.getElementById('apbVolume');

  function updateAudioPlayIcon(playing) {
    if (!apbPlayBtn) return;
    const iconPlay = apbPlayBtn.querySelector('.icon-play');
    const iconPause = apbPlayBtn.querySelector('.icon-pause');
    if (playing) {
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
      apbPlayBtn.setAttribute('aria-label', 'Pausar canción');
      apbPlayBtn.title = 'Pausar';
    } else {
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      apbPlayBtn.setAttribute('aria-label', 'Reproducir canción');
      apbPlayBtn.title = 'Reproducir';
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  if (loveAudio) {
    loveAudio.addEventListener('play', () => updateAudioPlayIcon(true));
    loveAudio.addEventListener('pause', () => updateAudioPlayIcon(false));
    loveAudio.addEventListener('timeupdate', () => {
      if (loveAudio.duration) {
        const pct = (loveAudio.currentTime / loveAudio.duration) * 100;
        if (apbProgressFill) apbProgressFill.style.width = `${pct}%`;
        if (apbTime) apbTime.textContent = formatTime(loveAudio.currentTime);
      }
    });

    if (apbPlayBtn) {
      apbPlayBtn.addEventListener('click', () => {
        if (loveAudio.paused) {
          loveAudio.play().catch(e => console.warn(e));
        } else {
          loveAudio.pause();
        }
      });
    }

    if (apbStopBtn) {
      apbStopBtn.addEventListener('click', () => {
        loveAudio.pause();
        loveAudio.currentTime = 0;
        if (apbProgressFill) apbProgressFill.style.width = '0%';
        if (apbTime) apbTime.textContent = '0:00';
        updateAudioPlayIcon(false);
      });
    }

    if (apbRestartBtn) {
      apbRestartBtn.addEventListener('click', () => {
        loveAudio.currentTime = 0;
        loveAudio.play().catch(e => console.warn(e));
      });
    }

    if (apbVolume) {
      loveAudio.volume = parseFloat(apbVolume.value) || 0.72;
      apbVolume.addEventListener('input', (e) => {
        loveAudio.volume = parseFloat(e.target.value);
      });
    }

    if (apbProgressBar) {
      apbProgressBar.style.cursor = 'pointer';
      apbProgressBar.addEventListener('click', (e) => {
        const rect = apbProgressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        if (width > 0 && loveAudio.duration) {
          loveAudio.currentTime = (clickX / width) * loveAudio.duration;
        }
      });
    }
  }

  function showAudioPlayerBar() {
    if (audioPlayerBar) {
      audioPlayerBar.classList.add('visible');
    }
  }

  /**
   * Inicia la canción de Lil Peep en loop suave con fade-in y muestra la barra
   */
  function startLoveSong() {
    if (!loveAudio) return;
    if (isPlaying && typeof toggleAudio === 'function') {
      toggleAudio(); // Pausar sintetizador si estaba sonando
    }
    showAudioPlayerBar();
    loveAudio.volume = 0;
    loveAudio.currentTime = 0;
    loveAudio.play().then(() => {
      updateAudioPlayIcon(true);
      let vol = 0;
      const targetVol = apbVolume ? parseFloat(apbVolume.value) : 0.72;
      const fadeInterval = setInterval(() => {
        vol = Math.min(vol + 0.025, targetVol);
        loveAudio.volume = vol;
        if (vol >= targetVol) clearInterval(fadeInterval);
      }, 120);
    }).catch(err => {
      console.warn('Autoplay blocked, audio will play on next interaction:', err);
      updateAudioPlayIcon(false);
    });
  }

  /**
   * Secuencia completa de apertura de la caja
   */
  function openSacredBox() {
    if (boxOpened) return;
    boxOpened = true;

    // 1. Animar llave + tapa abriendo
    sacredBox.classList.add('opening');
    playBoxOpenChime();

    // 2. Partículas de luz (después de 0.3s)
    setTimeout(spawnBoxParticles, 300);

    // 3. Flash estelar (después de 0.5s)
    setTimeout(triggerStarlightFlash, 500);

    // 4. La caja vuela hacia arriba y desaparece (después de 0.8s)
    setTimeout(() => {
      sacredBox.classList.add('open');
      sacredWrapper.classList.add('opened');

      // 5. Revelar la carta mientras la caja sale (después de 1.4s total)
      setTimeout(() => {
        if (letterRevealed) {
          letterRevealed.setAttribute('aria-hidden', 'false');
          letterRevealed.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // 6. Iniciar la canción en loop
        startLoveSong();
      }, 600);

    }, 800);
  }

  // Event listeners para la caja
  if (sacredBox) {
    sacredBox.addEventListener('click', openSacredBox);
    sacredBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openSacredBox();
      }
    });
  }

});

/* ============================================================
   LA DERIVA DEL COMETA — Canvas Game Engine v2 (Calmado)
   ============================================================ */

(function initCometGame() {

  const retryBtn     = document.getElementById('retryBtn');
  const gameWrapper  = document.getElementById('cometGameWrapper');
  const canvas       = document.getElementById('cometCanvas');
  const gameOverOv   = document.getElementById('gameOverOverlay');
  const cometVictory = document.getElementById('cometVictory');
  const victoryFlash = document.getElementById('victoryFlash');
  const hudHearts    = document.getElementById('hudHearts');
  const hudMessage   = document.getElementById('hudMessage');
  const instructions = document.getElementById('gameInstructions');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = 760, H = 440;
  canvas.width  = W;
  canvas.height = H;

  /* ── Estado ── */
  // Posición del cometa (inicio: izquierda centro)
  const COMET_START_X = 90;
  const COMET_START_Y = H / 2;

  let gameState = 'idle'; // 'idle' | 'playing' | 'over' | 'won'
  let lives = 3;
  let frameId = null;
  let hitCooldown = 0;   // frames de invulnerabilidad
  let gracePeriod = 140; // frames al inicio sin daño

  /* ── Cometa ── */
  const comet = { x: COMET_START_X, y: COMET_START_Y, r: 11, trail: [] };

  /* ── Target del ratón/táctil ── */
  // Inicia exactamente donde está el cometa para no saltar
  let targetX = COMET_START_X;
  let targetY = COMET_START_Y;
  let mouseInCanvas = false;

  /* ── Estrella (Valentina) ── */
  const star = { x: W - 75, y: H / 2, r: 24, pulse: 0 };

  /* ── Obstáculos ── */
  let voids = [];
  let spawnTimer = 0;

  function createVoid() {
    // Pasan por zonas superior O inferior — siempre hay un corredor central seguro
    const zone = Math.random() < 0.5 ? 'top' : 'bottom';
    const r = 22 + Math.random() * 18; // más pequeños: 22-40px
    const safeZone = H * 0.28; // corredor central libre
    let y;
    if (zone === 'top') {
      y = r + Math.random() * (H / 2 - safeZone - r);
    } else {
      y = H / 2 + safeZone + Math.random() * (H / 2 - safeZone - r);
    }
    return {
      x: W + r + 10,
      y,
      r,
      speed: 0.75 + Math.random() * 0.6, // muy lentos: 0.75-1.35 px/frame
      opacity: 0.5 + Math.random() * 0.25
    };
  }

  /* ── Fondo de estrellas ── */
  const bgStars = Array.from({ length: 90 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.4 + Math.random() * 1.3,
    alpha: 0.25 + Math.random() * 0.6,
    twinkle: Math.random() * Math.PI * 2
  }));

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function resetGame() {
    lives = 3;
    comet.x = COMET_START_X;
    comet.y = COMET_START_Y;
    comet.trail = [];
    targetX = COMET_START_X;
    targetY = COMET_START_Y;
    mouseInCanvas = false;
    voids = [];
    spawnTimer = 0;
    hitCooldown = 0;
    gracePeriod = 140;
    updateHearts();
    if (hudMessage) hudMessage.textContent = '¡Encuentra tu estrella!';
    if (gameOverOv) gameOverOv.classList.remove('visible');
  }

  function updateHearts() {
    if (!hudHearts) return;
    hudHearts.querySelectorAll('span').forEach((s, i) => {
      s.classList.toggle('lost', i >= lives);
    });
  }

  /* ════════════════════ RENDER ════════════════════ */

  function drawBg() {
    ctx.fillStyle = '#03020f';
    ctx.fillRect(0, 0, W, H);
    bgStars.forEach(s => {
      s.twinkle += 0.018;
      const a = s.alpha * (0.65 + 0.35 * Math.sin(s.twinkle));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawVoids() {
    voids.forEach(v => {
      const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, v.r);
      g.addColorStop(0, `rgba(6, 2, 22, ${v.opacity})`);
      g.addColorStop(0.55, `rgba(28, 10, 55, ${v.opacity * 0.65})`);
      g.addColorStop(1, `rgba(70, 35, 130, 0)`);
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = 'rgba(110, 65, 190, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawStar() {
    star.pulse = (star.pulse + 0.04) % (Math.PI * 2);
    const pr = star.r + Math.sin(star.pulse) * 5;
    // Halo exterior
    const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, pr * 2.8);
    g.addColorStop(0, 'rgba(230,200,117,0.55)');
    g.addColorStop(0.5, 'rgba(230,200,117,0.18)');
    g.addColorStop(1, 'rgba(230,200,117,0)');
    ctx.beginPath();
    ctx.arc(star.x, star.y, pr * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // Núcleo
    const c = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, pr);
    c.addColorStop(0, '#fffde7');
    c.addColorStop(0.45, '#e6c875');
    c.addColorStop(1, 'rgba(220,140,40,0.2)');
    ctx.beginPath();
    ctx.arc(star.x, star.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
    // Etiqueta
    ctx.save();
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(star.pulse * 1.2);
    ctx.fillStyle = '#e6c875';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ Valentina', star.x, star.y + pr + 15);
    ctx.restore();
  }

  function drawComet() {
    // Cola
    comet.trail.forEach((p, i) => {
      const t = i / comet.trail.length;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, t * comet.r * 0.9 + 1);
      g.addColorStop(0, `rgba(230,200,117,${t * 0.5})`);
      g.addColorStop(1, 'rgba(140,108,247,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, t * comet.r * 0.9 + 1, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
    // Núcleo
    const g = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.38, '#e6c875');
    g.addColorStop(1, 'rgba(140,108,247,0)');
    ctx.beginPath();
    ctx.arc(comet.x, comet.y, comet.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    // Halo invulnerabilidad
    if (hitCooldown > 0) {
      ctx.save();
      ctx.globalAlpha = (hitCooldown % 10 < 5) ? 0.55 : 0.08;
      ctx.strokeStyle = '#c3b1f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    // Etiqueta
    ctx.save();
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = 'rgba(200,185,255,1)';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('☄ Sauroposacc', comet.x + 14, comet.y - 7);
    ctx.restore();
  }

  /* Botón de Play dibujado en el canvas (pantalla idle) */
  function drawIdleScreen() {
    drawBg();
    drawStar();

    // Cometa estático en posición de inicio
    const g = ctx.createRadialGradient(COMET_START_X, COMET_START_Y, 0, COMET_START_X, COMET_START_Y, comet.r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.38, '#e6c875');
    g.addColorStop(1, 'rgba(140,108,247,0)');
    ctx.beginPath();
    ctx.arc(COMET_START_X, COMET_START_Y, comet.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // Botón de Play centrado sobre el cometa
    const bx = COMET_START_X, by = COMET_START_Y;
    const br = 32;
    // Círculo del botón
    ctx.save();
    ctx.globalAlpha = 0.88;
    const bg = ctx.createRadialGradient(bx, by - 5, 0, bx, by, br);
    bg.addColorStop(0, '#7c5cdb');
    bg.addColorStop(1, '#3d1e8f');
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(230,200,117,0.7)';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Triángulo de play
    ctx.fillStyle = '#e6c875';
    ctx.beginPath();
    ctx.moveTo(bx + 12, by);
    ctx.lineTo(bx - 7, by - 11);
    ctx.lineTo(bx - 7, by + 11);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Texto de ayuda
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(200,185,255,1)';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Haz clic aquí y luego mueve el cursor / dedo', W / 2, H - 20);
    ctx.restore();
  }

  /* ════════════════════ LOOP DEL JUEGO ════════════════════ */

  function gameLoop() {
    drawBg();
    drawVoids();
    drawStar();

    // Suavizado — en móvil sin mousemove, se queda en COMET_START
    if (mouseInCanvas) {
      comet.x += (targetX - comet.x) * 0.09;
      comet.y += (targetY - comet.y) * 0.09;
    }
    comet.x = Math.max(comet.r, Math.min(W - comet.r, comet.x));
    comet.y = Math.max(comet.r, Math.min(H - comet.r, comet.y));

    comet.trail.push({ x: comet.x, y: comet.y });
    if (comet.trail.length > 20) comet.trail.shift();

    drawComet();

    /* Gracia inicial */
    if (gracePeriod > 0) {
      gracePeriod--;
    }

    /* Spawn — empieza tardío y muy lento */
    spawnTimer++;
    const spawnRate = 200; // siempre 200 frames (~3.3s) entre obstáculos
    if (spawnTimer >= spawnRate) {
      voids.push(createVoid());
      spawnTimer = 0;
    }

    voids.forEach(v => { v.x -= v.speed; });
    voids = voids.filter(v => v.x + v.r > -10);

    /* Colisiones */
    if (hitCooldown > 0) {
      hitCooldown--;
    } else if (gracePeriod <= 0) {
      for (const v of voids) {
        // Hitbox muy generosa: solo el 38% del radio del void
        if (dist(comet, v) < comet.r * 0.7 + v.r * 0.38) {
          lives--;
          hitCooldown = 100;
          updateHearts();
          if (hudMessage) hudMessage.textContent = lives > 0 ? '¡Esquiva el vacío!' : '';
          canvas.style.transform = 'translateX(5px)';
          setTimeout(() => { canvas.style.transform = 'translateX(-5px)'; }, 80);
          setTimeout(() => { canvas.style.transform = ''; }, 160);
          if (lives <= 0) { handleGameOver(); return; }
          break;
        }
      }
    }

    /* Victoria */
    if (dist(comet, star) < comet.r + star.r * 0.9) {
      handleVictory(); return;
    }

    frameId = requestAnimationFrame(gameLoop);
  }

  /* ════════════════════ IDLE LOOP ════════════════════ */
  function idleLoop() {
    drawIdleScreen();
    frameId = requestAnimationFrame(idleLoop);
  }

  /* ════════════════════ HANDLERS ════════════════════ */

  function handleGameOver() {
    gameState = 'over';
    cancelAnimationFrame(frameId);
    if (gameOverOv) gameOverOv.classList.add('visible');
  }

  function handleVictory() {
    gameState = 'won';
    cancelAnimationFrame(frameId);
    if (victoryFlash) {
      victoryFlash.classList.add('active');
      setTimeout(() => {
        victoryFlash.style.transition = 'opacity 0.7s ease-out';
        victoryFlash.style.opacity = '0';
        setTimeout(() => {
          victoryFlash.classList.remove('active');
          victoryFlash.style.transition = '';
          victoryFlash.style.opacity = '';
        }, 750);
      }, 100);
    }
    if (cometVictory) {
      setTimeout(() => {
        cometVictory.removeAttribute('hidden');
        cometVictory.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
    setTimeout(() => {
      if (gameWrapper) gameWrapper.classList.remove('active');
    }, 600);
  }

  function startGame() {
    resetGame();
    gameState = 'playing';
    if (gameWrapper) gameWrapper.classList.add('active');
    if (instructions) instructions.style.display = 'none';
    if (cometVictory) cometVictory.setAttribute('hidden', '');
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(gameLoop);
  }

  /* ════════════════════ CONTROLES ════════════════════ */

  // Click en canvas: si estaba idle → iniciar; si jugando → nada
  canvas.addEventListener('click', (e) => {
    if (gameState === 'idle') {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) * (W / rect.width);
      const cy = (e.clientY - rect.top) * (H / rect.height);
      // Solo inicia si hizo click cerca del botón de play
      if (dist({ x: cx, y: cy }, { x: COMET_START_X, y: COMET_START_Y }) < 70) {
        startGame();
      }
    }
  });

  // Movimiento de ratón — sincroniza posición inicial del cursor
  canvas.addEventListener('mousemove', (e) => {
    if (gameState !== 'playing') return;
    mouseInCanvas = true;
    const rect = canvas.getBoundingClientRect();
    targetX = (e.clientX - rect.left) * (W / rect.width);
    targetY = (e.clientY - rect.top) * (H / rect.height);
  });

  canvas.addEventListener('mouseleave', () => { mouseInCanvas = false; });

  // Táctil
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'idle') { startGame(); return; }
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    targetX = (t.clientX - rect.left) * (W / rect.width);
    targetY = (t.clientY - rect.top) * (H / rect.height);
    mouseInCanvas = true;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    targetX = (t.clientX - rect.left) * (W / rect.width);
    targetY = (t.clientY - rect.top) * (H / rect.height);
    mouseInCanvas = true;
  }, { passive: false });

  canvas.addEventListener('touchend', () => { mouseInCanvas = false; });

  if (retryBtn) retryBtn.addEventListener('click', startGame);

  // Botón externo "Iniciar Viaje" (instrucciones)
  const startBtn = document.getElementById('cometStartBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (gameWrapper) gameWrapper.classList.add('active');
      if (instructions) instructions.style.display = 'none';
      if (cometVictory) cometVictory.setAttribute('hidden', '');
      gameState = 'idle';
      cancelAnimationFrame(frameId);
      // Mostrar la pantalla idle con el botón de play en canvas
      frameId = requestAnimationFrame(idleLoop);
    });
  }

  // Arrancar con la pantalla idle dibujada pero el wrapper visible
  // para que el botón "Iniciar Viaje" lo active
  // Si el wrapper ya está activo (reload), dibujar idle directamente
  if (gameWrapper && gameWrapper.classList.contains('active')) {
    gameState = 'idle';
    frameId = requestAnimationFrame(idleLoop);
  }

})();


