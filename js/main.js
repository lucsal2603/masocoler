/* ═══════════════════════════════════════════════════════════════
   MASO COLER — regia del movimento
   Lenis (scorrimento) + GSAP/ScrollTrigger (scena per scena).
   Tutte le suddivisioni in lettere/parole sono fatte a mano,
   nessun plugin a pagamento.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tocco = window.matchMedia("(hover: none)").matches;

  /* ── utilità: avvolgi ogni lettera in maschera + span ── */
  function spezzaLettere(el, classeMaschera) {
    const pezzi = [];
    const nodi = Array.from(el.childNodes);
    el.textContent = "";
    nodi.forEach((nodo) => {
      const testo = nodo.textContent;
      const corsivo = nodo.nodeType === 1 && nodo.tagName === "EM";
      for (const ch of testo) {
        if (ch === " " || ch === " ") {
          el.appendChild(document.createTextNode(" "));
          el._gruppoAperto = null;
          continue;
        }
        if (!el._gruppoAperto) {
          const gruppo = document.createElement("span");
          gruppo.className = "gruppo-lettere";
          el.appendChild(gruppo);
          el._gruppoAperto = gruppo;
        }
        const maschera = document.createElement("span");
        maschera.className = classeMaschera;
        const interno = document.createElement("span");
        interno.textContent = ch;
        if (corsivo) interno.classList.add("em-lettera");
        maschera.appendChild(interno);
        el._gruppoAperto.appendChild(maschera);
        pezzi.push(interno);
      }
    });
    delete el._gruppoAperto;
    return pezzi;
  }

  /* ── utilità: avvolgi ogni parola in .parola > span ── */
  function spezzaParole(el) {
    const parole = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    const interni = [];
    parole.forEach((p, i) => {
      const fuori = document.createElement("span");
      fuori.className = "parola";
      const dentro = document.createElement("span");
      dentro.textContent = p;
      fuori.appendChild(dentro);
      el.appendChild(fuori);
      if (i < parole.length - 1) el.appendChild(document.createTextNode(" "));
      interni.push(dentro);
    });
    return interni;
  }

  /* ── utilità: titoli con <br> ed <em> → parole in maschera ── */
  function spezzaTitolo(el) {
    const righe = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = "";
    const interni = [];
    righe.forEach((riga, iRiga) => {
      const sonda = document.createElement("div");
      sonda.innerHTML = riga;
      Array.from(sonda.childNodes).forEach((nodo) => {
        const corsivo = nodo.nodeType === 1 && nodo.tagName === "EM";
        nodo.textContent.split(/\s+/).filter(Boolean).forEach((parola) => {
          const maschera = document.createElement("span");
          maschera.className = "maschera-parola";
          const dentro = document.createElement("span");
          if (corsivo) {
            const em = document.createElement("em");
            em.textContent = parola;
            dentro.appendChild(em);
          } else {
            dentro.textContent = parola;
          }
          maschera.appendChild(dentro);
          el.appendChild(maschera);
          el.appendChild(document.createTextNode(" "));
          interni.push(dentro);
        });
      });
      if (iRiga < righe.length - 1) el.appendChild(document.createElement("br"));
    });
    return interni;
  }

  /* ── rullo lettere per [ LINK ] e bottoni ── */
  function preparaRulli() {
    document.querySelectorAll("[data-roll], [data-bottone-roll] .bottone-testo").forEach((el) => {
      const testo = el.textContent;
      el.textContent = "";
      let indice = 0;
      for (const ch of testo) {
        const rc = document.createElement("span");
        rc.className = "rc";
        const dentro = document.createElement("span");
        const visibile = ch === " " ? " " : ch;
        dentro.textContent = visibile;
        dentro.dataset.lettera = visibile;
        dentro.style.setProperty("--ritardo", (indice * 0.018).toFixed(3) + "s");
        rc.appendChild(dentro);
        el.appendChild(rc);
        indice += 1;
      }
    });
  }

  /* ════════════ MOVIMENTO RIDOTTO: solo l'essenziale ════════════ */
  if (riduci || typeof gsap === "undefined") {
    document.getElementById("loader").remove();
    preparaRulli();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ════════════ LENIS ════════════ */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ancore morbide */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const destinazione = document.querySelector(a.getAttribute("href"));
      if (!destinazione) return;
      e.preventDefault();
      lenis.scrollTo(destinazione, { duration: 1.6 });
    });
  });

  preparaRulli();

  /* ════════════ CURSORE QUADRATO ════════════ */
  if (!tocco) {
    const cursore = document.getElementById("cursore");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(() => {
      cx += (mx - cx) * 0.32;
      cy += (my - cy) * 0.32;
      cursore.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    });
    const accendi = () => cursore.classList.add("acceso");
    const spegni = () => cursore.classList.remove("acceso");
    document.querySelectorAll("a, .bottone, .lista-voce").forEach((el) => {
      el.addEventListener("mouseenter", accendi);
      el.addEventListener("mouseleave", spegni);
    });
    const scia = document.getElementById("scia");
    scia.addEventListener("mouseenter", () => cursore.classList.add("trascinamento"));
    scia.addEventListener("mouseleave", () => cursore.classList.remove("trascinamento"));
  }

  /* ════════════ LOADER → INGRESSO ════════════ */
  const marchioLoader = document.getElementById("loaderMark");
  const loader = document.getElementById("loader");
  const menu = document.getElementById("menu");
  const chip = document.getElementById("chipOspite");
  const lettereH1 = [];
  document.querySelectorAll(".hero-riga").forEach((riga) => {
    lettereH1.push(...spezzaLettere(riga, "lettera-maschera"));
  });
  const paroleHero = [];
  document.querySelectorAll(".hero-voce").forEach((voce) => {
    paroleHero.push(...spezzaParole(voce));
  });

  gsap.set(lettereH1, { yPercent: 112 });
  gsap.set(paroleHero, { yPercent: 112 });
  gsap.set(marchioLoader, { opacity: 0, filter: "blur(12px)", y: 10 });

  const ingresso = gsap.timeline({ delay: 0.15 });
  ingresso
    .to(marchioLoader, { opacity: 1, filter: "blur(0px)", y: 0, duration: 1.1, ease: "expo.out" })
    .to(marchioLoader, { opacity: 0, filter: "blur(9px)", y: -12, duration: 0.8, ease: "expo.in" }, "+=0.55")
    .to(loader, { autoAlpha: 0, duration: 0.45, ease: "power1.out" }, "-=0.15")
    .call(() => { loader.remove(); lenis.start(); })
    .to(menu, { y: "0%", duration: 1, ease: "expo.out" }, "-=0.25")
    .to(lettereH1, { yPercent: 0, duration: 1.3, stagger: 0.013, ease: "expo.out" }, "-=0.7")
    .to(paroleHero, { yPercent: 0, duration: 0.9, stagger: 0.012, ease: "expo.out" }, "-=0.9")
    .to(chip, { opacity: 1, duration: 0.9, ease: "expo.out" }, "-=0.6");

  /* ════════════ MANIFESTO: scambio di parole appuntato ════════════ */
  (function manifesto() {
    const altezza = document.getElementById("manifestoAltezza");
    const quadro = document.getElementById("manifestoQuadro");
    const brani = Array.from(document.querySelectorAll(".manifesto-brano"));
    const gruppi = brani.map((b) => spezzaParole(b));

    gruppi.forEach((parole, i) => {
      if (i > 0) gsap.set(parole, { yPercent: 112 });
    });

    ScrollTrigger.create({
      trigger: altezza,
      start: "top top",
      end: "bottom bottom",
      pin: quadro,
      pinSpacing: false,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: altezza,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    gruppi.forEach((parole, i) => {
      const prossime = gruppi[i + 1];
      if (!prossime) return;
      tl.to(parole, { yPercent: -112, stagger: 0.18, duration: 1, ease: "power3.in" });
      tl.to(prossime, { yPercent: 0, stagger: 0.18, duration: 1, delay: 2.6, ease: "power3.out" }, "<");
    });
    tl.to({}, { duration: 2 }); /* respiro finale prima dello sgancio */
  })();

  /* ════════════ TITOLI E RIGHE: reveal all'ingresso ════════════ */
  document.querySelectorAll("[data-titolo-maschera]").forEach((titolo) => {
    const parole = spezzaTitolo(titolo);
    gsap.set(parole, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: titolo,
      start: "top 82%",
      once: true,
      onEnter: () => gsap.to(parole, { yPercent: 0, duration: 1.15, stagger: 0.055, ease: "expo.out" }),
    });
  });

  document.querySelectorAll("[data-reveal-parole]").forEach((riga) => {
    const parole = spezzaParole(riga);
    gsap.set(parole, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: riga,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(parole, { yPercent: 0, duration: 0.8, stagger: 0.028, ease: "expo.out" }),
    });
  });

  /* ════════════ QUADRI FOTO: sipario diagonale ════════════
     (le carte dello slider non si ritagliano una a una: verrebbero
     clonate con il clip già inciso e resterebbero invisibili) */
  document.querySelectorAll(".slot-ritratto, .valle-figura").forEach((slot) => {
    gsap.set(slot, {
      clipPath: "inset(100% 100% 0% 0%)",
      scale: 1.14,
      transformOrigin: "0% 100%",
    });
    ScrollTrigger.create({
      trigger: slot,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(slot, {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
      }),
    });
  });

  /* lo slider sale intero, con un velo */
  (function ingressoScia() {
    const blocco = document.getElementById("scia");
    gsap.set(blocco, { y: 90, opacity: 0 });
    ScrollTrigger.create({
      trigger: blocco,
      start: "top 86%",
      once: true,
      onEnter: () => gsap.to(blocco, { y: 0, opacity: 1, duration: 1.3, ease: "expo.out" }),
    });
  })();

  /* ════════════ LISTA DIREZIONALE ════════════ */
  (function listaDirezionale() {
    if (tocco) return;
    const mappa = {
      alto: { y: "-101%", x: "0%" },
      basso: { y: "101%", x: "0%" },
      sinistra: { x: "-101%", y: "0%" },
      destra: { x: "101%", y: "0%" },
    };
    function latoIngresso(e, r) {
      const distanze = [
        { lato: "alto", d: Math.abs(e.clientY - r.top) },
        { lato: "basso", d: Math.abs(e.clientY - r.bottom) },
        { lato: "sinistra", d: Math.abs(e.clientX - r.left) },
        { lato: "destra", d: Math.abs(e.clientX - r.right) },
      ];
      distanze.sort((a, b) => a.d - b.d);
      return distanze[0].lato;
    }
    document.querySelectorAll("[data-voce-direzionale]").forEach((voce) => {
      const velo = voce.querySelector(".voce-velo");
      voce.addEventListener("mouseenter", (e) => {
        const lato = latoIngresso(e, voce.getBoundingClientRect());
        gsap.set(velo, mappa[lato]);
        gsap.to(velo, { x: "0%", y: "0%", duration: 0.5, ease: "power3.out", overwrite: true });
        voce.classList.add("accesa");
      });
      voce.addEventListener("mouseleave", (e) => {
        const lato = latoIngresso(e, voce.getBoundingClientRect());
        gsap.to(velo, { ...mappa[lato], duration: 0.5, ease: "power3.in", overwrite: true });
        voce.classList.remove("accesa");
      });
    });
  })();

  /* ════════════ RUOTA DELLA TERRA ════════════
     I cerchi sporgono per metà dai bordi: le voci sfilano davanti
     alla finestra visibile (ore 3 a sinistra, ore 9 a destra).
     Traslazione via xPercent/yPercent, mai in CSS: la rotazione
     in linea la spazzerebbe via. */
  (function ruota() {
    const altezza = document.getElementById("ruotaAltezza");
    const quadro = document.getElementById("ruotaQuadro");
    const sinistra = document.getElementById("ruotaSinistra");
    const destra = document.getElementById("ruotaDestra");
    const testa = quadro.querySelector(".ruota-testa");

    function prepara(cerchio, base, direzione, passo) {
      const raggi = cerchio.querySelectorAll(".ruota-raggio");
      raggi.forEach((raggio, i) => {
        gsap.set(raggio, { rotation: direzione * i * passo });
        gsap.set(raggio.firstElementChild, {
          yPercent: -50,
          rotation: -(base + direzione * i * passo),
        });
      });
      return raggi;
    }

    ScrollTrigger.create({
      trigger: altezza,
      start: "top top",
      end: "bottom bottom",
      pin: quadro,
      pinSpacing: false,
    });

    const scrub = () => ({
      trigger: altezza,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    });

    /* ── mobile: solo il cerchio delle parole, com'era ── */
    if (window.innerWidth <= 820) {
      const baseSin = 148, corsaSin = 245, passoSin = 13;
      gsap.set(sinistra, { xPercent: -62, yPercent: -50, rotation: baseSin });
      const raggiSin = prepara(sinistra, baseSin, 1, passoSin);
      gsap.to(sinistra, { rotation: baseSin - corsaSin, ease: "none", scrollTrigger: scrub() });
      raggiSin.forEach((raggio) => {
        gsap.to(raggio.firstElementChild, { rotation: "+=" + corsaSin, ease: "none", scrollTrigger: scrub() });
      });
      return;
    }

    /* ── desktop: coreografia in sei tempi ──
       1) si arriva e c'è solo il titolo, fermo (0–10% del pin);
       2) le due palle entrano da fuori schermo (10–36%) e si fermano
          in obliquo, in basso a sinistra e in alto a destra, con gli
          archi che quasi si toccano al centro (~60px);
       3) il titolo sparisce con un soffio (37–45%);
       4) qualche altro scroll con i soli archi vuoti;
       5) dal ~46–50% sfilano le scritte: su a sinistra, giù a destra
          (le corse sono tarate perché l'ultima parola passi entro l'82%);
       6) all'84% le palle se ne vanno per la stessa diagonale, la nota
          si spegne, e allo sgancio il sito riprende a scorrere pulito.
       Solo parole, niente foto. Le basi sono scelte così che durante
       l'ingresso ogni parola aspetti FUORI dall'arco visibile.
       Finestre di sfilata verso il centro: +59° (sinistra), −121° (destra). */
    const vw = window.innerWidth, vh = window.innerHeight;
    const D = sinistra.offsetWidth, r = D / 2;
    const lung = Math.hypot(vw / 2, vh / 2);
    const u = { x: (-vw / 2) / lung, y: (vh / 2) / lung }; /* verso l'angolo in basso a sinistra */
    const dist = r + 30; /* archi a ~60px al centro: quasi si toccano */

    const centroSin = { x: vw / 2 + u.x * dist, y: vh / 2 + u.y * dist };
    const centroDes = { x: vw / 2 - u.x * dist, y: vh / 2 - u.y * dist };

    const riposoSinX = centroSin.x - D / 2;
    const riposoDesX = centroDes.x - (vw - D / 2);
    const fuoriSinX = -(r + 60) - D / 2;
    const fuoriDesX = r + 60 + D / 2;

    const passoSin = 13, corsaSin = 360, baseSin = 248;
    const passoDes = 13, corsaDes = 340, baseDes = 66;

    gsap.set(sinistra, { x: fuoriSinX, y: centroSin.y - vh / 2, yPercent: -50, rotation: baseSin });
    gsap.set(destra, { x: fuoriDesX, y: centroDes.y - vh / 2, yPercent: -50, rotation: baseDes });
    const raggiSin = prepara(sinistra, baseSin, 1, passoSin);
    const raggiDes = prepara(destra, baseDes, 1, passoDes);

    const nota = quadro.querySelector(".ruota-nota");
    const coreografia = gsap.timeline({ scrollTrigger: scrub() });
    coreografia
      .to(sinistra, { x: riposoSinX, duration: 0.26, ease: "power2.out" }, 0.10)
      .to(destra, { x: riposoDesX, duration: 0.26, ease: "power2.out" }, 0.10)
      .to(testa, { y: -48, autoAlpha: 0, filter: "blur(8px)", duration: 0.08, ease: "power1.in" }, 0.37)
      /* congedo: finita la sfilata, le palle escono per la stessa diagonale */
      .to(sinistra, { x: fuoriSinX, duration: 0.12, ease: "power2.in" }, 0.84)
      .to(destra, { x: fuoriDesX, duration: 0.12, ease: "power2.in" }, 0.84)
      .to(nota, { autoAlpha: 0, duration: 0.06, ease: "power1.in" }, 0.87)
      .set(quadro, {}, 1); /* àncora: la scala del tempo resta 0–1 sul pin */

    gsap.to(sinistra, { rotation: baseSin - corsaSin, ease: "none", scrollTrigger: scrub() });
    raggiSin.forEach((raggio) => {
      gsap.to(raggio.firstElementChild, { rotation: "+=" + corsaSin, ease: "none", scrollTrigger: scrub() });
    });
    gsap.to(destra, { rotation: baseDes - corsaDes, ease: "none", scrollTrigger: scrub() });
    raggiDes.forEach((raggio) => {
      gsap.to(raggio.firstElementChild, { rotation: "+=" + corsaDes, ease: "none", scrollTrigger: scrub() });
    });
  })();

  /* ════════════ SCIA DELLE STANZE: trascinamento infinito ════════════ */
  (function scia() {
    const contenitore = document.getElementById("scia");
    const binario = document.getElementById("sciaBinario");
    const contatore = document.getElementById("contatoreAttuale");
    const originali = Array.from(binario.children);
    const nUnici = originali.length;

    /* tre copie per coprire il giro */
    for (let c = 0; c < 2; c += 1) {
      originali.forEach((carta) => binario.appendChild(carta.cloneNode(true)));
    }
    const carte = Array.from(binario.children);
    const parallassi = carte.map((c) => c.querySelector(".scia-parallasse"));

    let larghezzaSet = 0;
    let posizione = 0;
    let obiettivo = 0;
    let inPresa = false;
    let ultimaX = 0;
    let velocita = 0;

    function misura() {
      larghezzaSet = 0;
      const spazio = parseFloat(getComputedStyle(binario).columnGap || getComputedStyle(binario).gap) || 0;
      originali.forEach((carta) => { larghezzaSet += carta.offsetWidth + spazio; });
    }
    misura();
    addEventListener("resize", misura);

    obiettivo = -larghezzaSet; /* si parte dentro la copia centrale */
    posizione = obiettivo;

    contenitore.addEventListener("pointerdown", (e) => {
      inPresa = true;
      ultimaX = e.clientX;
      velocita = 0;
      contenitore.setPointerCapture(e.pointerId);
    });
    contenitore.addEventListener("pointermove", (e) => {
      if (!inPresa) return;
      const delta = e.clientX - ultimaX;
      ultimaX = e.clientX;
      obiettivo += delta;
      velocita = delta;
    });
    ["pointerup", "pointercancel"].forEach((evento) => {
      contenitore.addEventListener(evento, () => {
        if (!inPresa) return;
        inPresa = false;
        obiettivo += velocita * 16; /* inerzia al rilascio */
      });
    });

    /* trackpad e Magic Mouse: lo scorrimento orizzontale a due dita
       muove lo slider; quello verticale resta alla pagina */
    contenitore.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      obiettivo -= e.deltaX;
    }, { passive: false });

    /* il trascinamento non deve mai "prendere" l'immagine */
    contenitore.addEventListener("dragstart", (e) => e.preventDefault());

    const nomi = originali.map((c) => c.dataset.nome);

    gsap.ticker.add(() => {
      posizione += (obiettivo - posizione) * 0.11;

      /* riavvolgimento silenzioso dentro la fascia centrale */
      if (posizione > -larghezzaSet * 0.5) {
        posizione -= larghezzaSet;
        obiettivo -= larghezzaSet;
      } else if (posizione < -larghezzaSet * 1.5) {
        posizione += larghezzaSet;
        obiettivo += larghezzaSet;
      }

      binario.style.transform = `translate3d(${posizione}px, 0, 0)`;

      /* parallasse + contatore */
      const centro = innerWidth / 2;
      let vicina = 0;
      let distanzaMinima = Infinity;
      carte.forEach((carta, i) => {
        const r = carta.getBoundingClientRect();
        const centroCarta = r.left + r.width / 2;
        const scarto = (centroCarta - centro) / innerWidth;
        const dentro = Math.max(-10, Math.min(10, scarto * -14));
        parallassi[i].style.transform = `translate3d(${dentro}%, 0, 0)`;
        const d = Math.abs(centroCarta - centro);
        if (d < distanzaMinima) { distanzaMinima = d; vicina = i; }
      });
      const nome = nomi[vicina % nUnici];
      if (contatore.textContent !== nome) contatore.textContent = nome;
    });
  })();

  /* ════════════ LETTERE VERTICALI ════════════ */
  document.querySelectorAll("[data-verticale]").forEach((colonna) => {
    const testo = colonna.textContent;
    colonna.textContent = "";
    const lettere = [];
    for (const ch of testo) {
      const vl = document.createElement("span");
      vl.className = "vl";
      vl.textContent = ch;
      colonna.appendChild(vl);
      lettere.push(vl);
    }
    gsap.set(lettere, { opacity: 0.12 });
    gsap.to(lettere, {
      opacity: 1,
      stagger: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: colonna,
        start: "top 85%",
        end: "bottom 45%",
        scrub: true,
      },
    });
  });

  /* ════════════ MARCHIO GIGANTE NEL FOOTER ════════════ */
  (function marchio() {
    const gigante = document.getElementById("marchioGigante");
    const lettere = spezzaLettere(gigante, "lettera-maschera");
    gsap.set(lettere, { yPercent: 112 });
    gsap.to(lettere, {
      yPercent: 0,
      stagger: 0.045,
      ease: "expo.out",
      duration: 1.2,
      scrollTrigger: {
        trigger: gigante,
        start: "top 92%",
        once: true,
      },
    });
  })();

  /* nella banda scura e sul footer la chip si fa da parte:
     coprirebbe la ruota e il marchio gigante */
  const chipVia = () => gsap.to(chip, { autoAlpha: 0, duration: 0.4, overwrite: "auto" });
  const chipTorna = () => gsap.to(chip, { autoAlpha: 1, duration: 0.4, overwrite: "auto" });
  [".sezione-scura", ".sezione-footer"].forEach((zona) => {
    ScrollTrigger.create({
      trigger: zona,
      start: "top 75%",
      end: "bottom 55%",
      onEnter: chipVia,
      onLeave: chipTorna,
      onEnterBack: chipVia,
      onLeaveBack: chipTorna,
    });
  });

})();
