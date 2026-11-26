window.addEventListener('DOMContentLoaded', function() {
  var doc = document;
  var flower = doc.querySelector('.flower');
  var maxParts = 20;
  var maxPetals = 6;
  var partsFontStep = 25 / maxParts;

  function createBox(box, pos) {
    var fontSize = partsFontStep * (maxParts - pos) + 'vmin';
    var half = maxParts / 2;
    var bright = '50';

    if (pos < half + 1) {
      fontSize = partsFontStep * pos + 'vmin';
    } else {
      bright = 10 + (40 / half) * (maxParts - pos);
    }

    var baseHue = 320;
    var hueVariation = 30;
    var saturation = 70 + (20 * pos) / maxParts;
    var color =
      'hsl(' +
      (baseHue + (hueVariation * pos) / maxParts) +
      ', ' +
      saturation +
      '%, ' +
      bright +
      '%)';

    var newShape = doc.createElement('div');
    newShape.classList.add('shape');

    var newBox = doc.createElement('div');
    newBox.classList.add('box');
    newBox.setAttribute('style', 'color: ' + color + ';font-size: ' + fontSize);

    if (box) newBox.appendChild(box);
    newBox.appendChild(newShape);
    return newBox;
  }

  function createPetal() {
    var box = createBox(null, 0);
    var petal = doc.createElement('div');
    petal.classList.add('petal');
    for (var i = 1; i <= maxParts; i++) {
      box = createBox(box, i);
    }
    petal.appendChild(box);
    return petal;
  }

  function createFlower() {
    if (!flower) return;
    var angle = 360 / maxPetals;
    for (var i = 0; i < maxPetals; i++) {
      var petal = createPetal();
      var currAngle = angle * i + 'deg';
      var transform =
        'transform: rotateY(' +
        currAngle +
        ') rotateX(-30deg) translateZ(9vmin)';
      petal.setAttribute('style', transform);
      flower.appendChild(petal);
    }
  }

  createFlower();

  var mainContent = doc.getElementById('main-content');
  if (mainContent) mainContent.style.display = '';

  // Efecto typing en el botón al inicio
  var startBtn = doc.getElementById('start-btn');
  var btnText = 'Presioname';
  startBtn.textContent = '';
  startBtn.disabled = true;
  var iBtn = 0;

  function typeBtn() {
    if (iBtn < btnText.length) {
      startBtn.textContent += btnText.charAt(iBtn);
      iBtn++;
      setTimeout(typeBtn, 90);
    } else {
      startBtn.disabled = false;
    }
  }
  typeBtn();

  // Followers - Cambiar mensajes
  var messages = [
    'Esta flor es para ti',
    'Te quiero mucho',
    'Gracias por todo',
    '¡Eres especial!',
    '¡Gracias por acompañarme :D !'
  ];

  var container = doc.getElementById('start-btn-container');
  var wrapper = doc.querySelector('.wrapper');
  var msg = doc.querySelector('.flower-message');
  var msgText = doc.querySelector('.flower-message-text') || msg;
  var galaxyCanvas = doc.getElementById('galaxy-canvas');
  var music = doc.getElementById('bg-music');
  var musicToggle = doc.getElementById('music-toggle');

  function updateMusicToggleUI() {
    if (!musicToggle || !music) return;
    if (music.paused) {
      musicToggle.textContent = '🔇';
      musicToggle.classList.add('is-paused');
      musicToggle.setAttribute('aria-label', 'Reproducir música');
    } else {
      musicToggle.textContent = '🔊';
      musicToggle.classList.remove('is-paused');
      musicToggle.setAttribute('aria-label', 'Pausar música');
    }
  }

  function playMusicSafely() {
    if (!music) return;
    music.muted = false;
    music.volume = 1;
    try {
      if (music.readyState >= 1 && music.paused && music.ended) {
        music.currentTime = 0;
      }
    } catch (e) {}

    var playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise
        .then(function() {
          updateMusicToggleUI();
        })
        .catch(function(error) {
          console.warn('No se pudo reproducir la música automáticamente:', error);
          updateMusicToggleUI();
        });
    } else {
      updateMusicToggleUI();
    }
  }

  if (music) {
    music.addEventListener('play', updateMusicToggleUI);
    music.addEventListener('pause', updateMusicToggleUI);
    music.addEventListener('ended', updateMusicToggleUI);
  }

  if (musicToggle && music) {
    musicToggle.addEventListener('click', function() {
      if (music.paused) {
        playMusicSafely();
      } else {
        music.pause();
      }
    });
  }

  var dots = [];
  var activeFullMessage = '';
  var heartFormed = false;
  var galaxyStarted = false;

  // Ajusta dinámicamente el tamaño de fuente si un mensaje es muy largo para que nunca se corte
  function fitMessageText(fullText) {
    if (!msg || !msgText || !fullText) return;
    if (getComputedStyle(msg).display === 'none') return;

    var prevText = msgText.textContent;
    var prevVisibility = msgText.style.visibility;

    // Restablecer al tamaño base definido por CSS para el dispositivo actual
    msg.style.fontSize = '';
    msgText.style.visibility = 'hidden';
    msgText.textContent = fullText;

    var baseSize = parseFloat(getComputedStyle(msg).fontSize) || 24;
    var minSize = Math.max(13, Math.min(16, baseSize * 0.45));
    var currentSize = baseSize;

    // Reducir suavemente hasta que todo el texto quepa dentro del área visible
    var guard = 0;
    while (
      (msg.scrollHeight > msg.clientHeight + 2 || msg.scrollWidth > msg.clientWidth + 2) &&
      currentSize > minSize &&
      guard < 40
    ) {
      var ratio = msg.clientHeight / Math.max(1, msg.scrollHeight);
      var step = ratio < 0.85 ? Math.max(1, currentSize * (1 - Math.sqrt(ratio))) : 1;
      currentSize = Math.max(minSize, currentSize - step);
      msg.style.fontSize = currentSize + 'px';
      guard++;
    }

    msgText.textContent = prevText;
    msgText.style.visibility = prevVisibility;
    msg.scrollTop = 0;
  }

  function resizeGalaxy() {
    if (!galaxyCanvas || !galaxyStarted) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    galaxyCanvas.width = w;
    galaxyCanvas.height = h;
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].x > w) dots[i].x = Math.random() * w;
      if (dots[i].y > h) dots[i].y = Math.random() * h;
    }
  }

  var resizeTimer = null;
  function handleViewportChange() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      resizeGalaxy();
      if (activeFullMessage) {
        fitMessageText(activeFullMessage);
      }
    }, 80);
  }

  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);

  function animateHeart() {
    if (!galaxyCanvas || !dots.length) return;
    heartFormed = true;

    var w = galaxyCanvas.width;
    var h = galaxyCanvas.height;
    var heartCenterX = w / 2;
    var heartCenterY = h / 2;
    var heartSize = Math.min(w, h) / 56;
    var heartPositions = [];

    for (var i = 0; i < dots.length; i++) {
      var t = Math.PI * 2 * (i / dots.length);
      var x = heartCenterX + heartSize * 16 * Math.pow(Math.sin(t), 3);
      var y =
        heartCenterY -
        heartSize *
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t));
      heartPositions.push({ x: x, y: y });
    }

    var steps = 28;
    var step = 0;

    function moveDotsToHeart() {
      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var target = heartPositions[i];
        dot.x += (target.x - dot.x) / (steps - step + 1);
        dot.y += (target.y - dot.y) / (steps - step + 1);
      }
      step++;
      if (step < steps) {
        requestAnimationFrame(moveDotsToHeart);
      }
    }

    moveDotsToHeart();
  }

  startBtn.addEventListener('click', function() {
    var isCompact = window.innerWidth <= 768;

    container.style.display = 'none';
    wrapper.style.display = '';

    // Iniciar transición suave de la flor hacia su posición responsiva
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        wrapper.classList.add('is-positioned');
      });
    });

    // Reproducir música directamente en el gesto del usuario (compatible con file://, móvil y iOS)
    if (musicToggle) {
      musicToggle.style.display = 'flex';
    }
    if (music) {
      try {
        if (music.readyState >= 1) {
          music.currentTime = 0;
        }
      } catch (e) {}
      playMusicSafely();
    }

    // Mostrar el canvas de galaxia después de 2 segundos
    setTimeout(function() {
      if (!galaxyCanvas) return;
      galaxyStarted = true;
      galaxyCanvas.style.display = '';
      galaxyCanvas.width = window.innerWidth;
      galaxyCanvas.height = window.innerHeight;
      var ctx = galaxyCanvas.getContext('2d');

      var numDots = isCompact ? 36 : 60;
      dots = [];
      var dotsToAdd = 0;
      var minDotSize = isCompact ? 0.8 : 0.7;
      var maxDotSize = isCompact ? 1.6 : 1.7;

      function addDot() {
        if (dotsToAdd < numDots) {
          var angle = Math.random() * 2 * Math.PI;
          var maxRadius = Math.min(galaxyCanvas.width, galaxyCanvas.height) / 2.1;
          var radius = Math.random() * maxRadius;
          var x = galaxyCanvas.width / 2 + Math.cos(angle) * radius;
          var y = galaxyCanvas.height / 2 + Math.sin(angle) * radius;
          var speed = 0.2 + Math.random() * 0.7;
          var dir = Math.random() * 2 * Math.PI;
          var dotSize = minDotSize + Math.random() * (maxDotSize - minDotSize);
          dots.push({
            x: x,
            y: y,
            r: dotSize,
            dx: Math.cos(dir) * speed,
            dy: Math.sin(dir) * speed,
            alpha: 0.5 + Math.random() * 0.5
          });
          dotsToAdd++;
          setTimeout(addDot, 15);
        }
      }
      addDot();

      function animateGalaxy() {
        ctx.clearRect(0, 0, galaxyCanvas.width, galaxyCanvas.height);
        var hue = 55;
        var speedFactor = 1.15 + 0.35 * Math.sin(Date.now() * 0.003);

        for (var i = 0; i < dots.length; i++) {
          var dot = dots[i];
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
          ctx.fillStyle = 'hsla(' + hue + ', 80%, 70%, ' + dot.alpha + ')';
          ctx.shadowColor = 'hsla(' + hue + ', 80%, 70%, 0.5)';
          ctx.shadowBlur = 1;
          ctx.fill();

          if (!heartFormed) {
            dot.x += dot.dx * speedFactor;
            dot.y += dot.dy * speedFactor;
            if (dot.x < 0) dot.x = galaxyCanvas.width;
            if (dot.x > galaxyCanvas.width) dot.x = 0;
            if (dot.y < 0) dot.y = galaxyCanvas.height;
            if (dot.y > galaxyCanvas.height) dot.y = 0;
          }
        }
        requestAnimationFrame(animateGalaxy);
      }

      setTimeout(function() {
        galaxyCanvas.style.opacity = '1';
      }, 50);

      animateGalaxy();
    }, 2000);

    // Mostrar mensajes adaptados al dispositivo
    msg.style.display = '';
    msg.style.opacity = '0';

    var startDelay = isCompact ? 1100 : 400;

    setTimeout(function() {
      msg.style.opacity = '1';
      var current = 0;

      function typeText(text, cb) {
        activeFullMessage = text;
        msgText.textContent = '';
        fitMessageText(text);

        var charDelay = text.length > 80 ? 45 : text.length > 40 ? 65 : 85;
        var pauseAfter = Math.min(3500, Math.max(1100, text.length * 30));
        var i = 0;

        function type() {
          if (i < text.length) {
            msgText.textContent += text.charAt(i);
            i++;
            setTimeout(type, charDelay);
          } else if (cb) {
            setTimeout(cb, pauseAfter);
          }
        }
        type();
      }

      function showNext() {
        if (current < messages.length) {
          typeText(messages[current], function() {
            current++;
            showNext();
          });
        } else {
          animateHeart();
        }
      }

      showNext();
    }, startDelay);
  });
});
