(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const screenWelcome = $('#screen-welcome');
  const screenOrder = $('#screen-order');
  const btnStart = $('#btnStart');
  const btnBack = $('#btnBack');
  const options = $$('.option');
  const actionBar = $('#actionBar');
  const selectedCountEl = $('#selectedCount');
  const btnValidate = $('#btnValidate');

  const modal = $('#modalSummary');
  const summaryList = $('#summaryList');
  const btnSend = $('#btnSend');
  const toast = $('#toast');
  const titleWelcome = $('#title-welcome');

  // Nouveaux boutons d'aide
  const btnImpression = $('#btnImpression');
  const btnConception = $('#btnConception');
  const btnDeliveryClaim = $('#btnDeliveryClaim');

  // Navigation de base
  function showScreen(target) {
    for (const s of $$('.screen')) {
      s.classList.remove('active');
      s.setAttribute('hidden', '');
    }
    target.classList.add('active');
    target.removeAttribute('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnStart?.addEventListener('click', () => showScreen(screenOrder));
  btnBack?.addEventListener('click', () => showScreen(screenWelcome));

  // Sélection d'options
  const selected = new Set();
  function updateActionBar() {
    const count = selected.size;
    selectedCountEl.textContent = String(count);
    actionBar.classList.toggle('hidden', count === 0);
  }

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      const label = opt.dataset.item;
      const pressed = opt.getAttribute('aria-pressed') === 'true';
      if (pressed) {
        opt.setAttribute('aria-pressed', 'false');
        selected.delete(label);
      } else {
        opt.setAttribute('aria-pressed', 'true');
        selected.add(label);
      }
      updateActionBar();
    });
  });

  // Modale résumé
  function openModal() {
    if (selected.size === 0) return;
    summaryList.innerHTML = '';
    for (const item of selected) {
      const li = document.createElement('li');
      li.textContent = `• ${item}`;
      summaryList.appendChild(li);
    }
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
  }

  btnValidate?.addEventListener('click', openModal);
  modal?.addEventListener('click', (e) => {
    const target = e.target;
    if (target.matches('[data-close]')) closeModal();
    if (target.classList.contains('modal-backdrop')) closeModal();
  });

  // Envoi (simulation)
  btnSend?.addEventListener('click', async () => {
    // Simuler une requête réseau
    btnSend.disabled = true;
    btnSend.textContent = 'Envoi...';
    await new Promise(r => setTimeout(r, 900));
    btnSend.disabled = false;
    btnSend.textContent = 'Envoyer ma demande';
    closeModal();

    // Reset sélection
    selected.clear();
    options.forEach(o => o.setAttribute('aria-pressed', 'false'));
    updateActionBar();

    // Afficher toast
    toast.removeAttribute('hidden');
    setTimeout(() => toast.setAttribute('hidden', ''), 1800);
  });

  // Redirection Google Forms / Sheets
  function openExternalFromButton(btn) {
    const url = btn?.getAttribute('data-url');
    if (!url) {
      alert("Lien non configuré. Ajoutez l'attribut data-url sur le bouton.");
      return;
    }
    window.open(url, '_blank');
  }

  btnImpression?.addEventListener('click', () => openExternalFromButton(btnImpression));
  btnConception?.addEventListener('click', () => openExternalFromButton(btnConception));
  btnDeliveryClaim?.addEventListener('click', () => openExternalFromButton(btnDeliveryClaim));

  // Ads carousel (accueil)
  const adsTrack = $('#adsTrack');
  const dotsWrap = $('#adsDots');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('button')) : [];
  let currentAd = 0;
  const totalAds = dots.length || 0;
  let autoTimer;

  function goToAd(index) {
    if (!adsTrack) return;
    currentAd = (index + totalAds) % totalAds;
    adsTrack.style.transform = `translateX(-${currentAd * 100}%)`;
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === currentAd ? 'true' : 'false'));
  }

  function startAuto() {
    if (!totalAds) return;
    stopAuto();
    autoTimer = setInterval(() => {
      goToAd(currentAd + 1);
    }, 4000);
  }
  function stopAuto() { if (autoTimer) clearInterval(autoTimer); }

  dots.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index') || '0');
      goToAd(idx);
      startAuto();
    });
  });

  if (totalAds > 0) {
    goToAd(0);
    startAuto();
  }

  // Ads carousel (panneau images sous Impression/Conception)
  const orderAdsTrack = $('#orderAdsTrack');
  const orderDotsWrap = $('#orderAdsDots');
  const orderDots = orderDotsWrap ? Array.from(orderDotsWrap.querySelectorAll('button')) : [];
  let orderCurrent = 0;
  const orderTotal = orderDots.length || 0;
  let orderTimer;

  function goToOrderAd(index) {
    if (!orderAdsTrack) return;
    orderCurrent = (index + orderTotal) % orderTotal;
    orderAdsTrack.style.transform = `translateX(-${orderCurrent * 100}%)`;
    orderDots.forEach((d, i) => d.setAttribute('aria-selected', i === orderCurrent ? 'true' : 'false'));
  }

  function startOrderAuto() {
    if (!orderTotal) return;
    stopOrderAuto();
    orderTimer = setInterval(() => {
      goToOrderAd(orderCurrent + 1);
    }, 3800);
  }
  function stopOrderAuto() { if (orderTimer) clearInterval(orderTimer); }

  orderDots.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index') || '0');
      goToOrderAd(idx);
      startOrderAuto();
    });
  });

  if (orderTotal > 0) {
    goToOrderAd(0);
    startOrderAuto();
  }

  // --- Récupération du nom via Google Identity (One Tap) ---
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(jsonPayload);
    } catch { return null; }
  }
  function setWelcomeName(name) {
    if (!titleWelcome) return;
    if (name && typeof name === 'string' && name.trim()) {
      titleWelcome.textContent = `Mbote ${name.trim()}`;
    } else {
      titleWelcome.textContent = 'Mbote';
    }
  }
  function handleCredentialResponse(response) {
    const payload = parseJwt(response?.credential || '');
    const name = payload?.given_name || payload?.name || '';
    setWelcomeName(name);
  }

  window.addEventListener('load', () => {
    const meta = document.querySelector('meta[name="google-client-id"]');
    const clientId = meta?.getAttribute('content')?.trim();
    const gis = window.google && window.google.accounts && window.google.accounts.id;
    if (clientId && gis) {
      try {
        gis.initialize({ client_id: clientId, callback: handleCredentialResponse, auto_select: true, cancel_on_tap_outside: true });
        gis.prompt(); // Tente One Tap à l'arrivée
      } catch (e) {
        // En cas d'échec, garder l'accueil par défaut
      }
    } else {
      setWelcomeName('');
    }
  });
})();