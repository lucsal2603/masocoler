/* ═══════════════════════════════════════════════════════════════
   MASO COLER — regia leggera delle sottopagine
   Stessi ingredienti della home (Lenis + GSAP/ScrollTrigger),
   senza loader: menu che scende, titoli in maschera, sipari foto.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tocco = window.matchMedia("(hover: none)").matches;

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
        /* lo spazio deve restare largo dentro gli span inline-block */
        const visibile = ch === " " || ch === "\u00A0" ? "\u00A0" : ch;
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
    preparaRulli();
    const menu = document.getElementById("menu");
    if (menu) menu.style.transform = "none";
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

  /* ancore morbide (i link alle altre pagine passano oltre) */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const destinazione = document.querySelector(a.getAttribute("href"));
      if (!destinazione) return;
      e.preventDefault();
      lenis.scrollTo(destinazione, { duration: 1.6 });
    });
  });

  /* arrivo con àncora da un'altra pagina (es. contatti.html#disponibilita):
     si atterra già sulla sezione, senza sceneggiata */
  if (location.hash) {
    const meta = document.querySelector(location.hash);
    if (meta) {
      requestAnimationFrame(() => {
        lenis.scrollTo(meta, { immediate: true, offset: -20 });
        ScrollTrigger.refresh();
      });
    }
  }

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
    /* delega: vale anche per gli elementi nati dopo (es. i giorni del calendario) */
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, .bottone, button")) accendi();
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, .bottone, button")) spegni();
    });
  }

  /* ════════════ INGRESSO ════════════ */
  const menu = document.getElementById("menu");
  const chip = document.getElementById("chipOspite");
  const ingresso = gsap.timeline({ delay: 0.1 });
  ingresso
    .to(menu, { y: "0%", duration: 1, ease: "expo.out" })
    .to(chip, { opacity: 1, duration: 0.9, ease: "expo.out" }, "-=0.5");

  /* ════════════ TITOLI E RIGHE: reveal all'ingresso ════════════ */
  document.querySelectorAll("[data-titolo-maschera]").forEach((titolo) => {
    const parole = spezzaTitolo(titolo);
    gsap.set(parole, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: titolo,
      start: "top 88%",
      once: true,
      onEnter: () => gsap.to(parole, { yPercent: 0, duration: 1.15, stagger: 0.055, ease: "expo.out" }),
    });
  });

  document.querySelectorAll("[data-reveal-parole]").forEach((riga) => {
    const parole = spezzaParole(riga);
    gsap.set(parole, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: riga,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.to(parole, { yPercent: 0, duration: 0.8, stagger: 0.028, ease: "expo.out" }),
    });
  });

  /* ════════════ SIPARIO DIAGONALE SUI QUADRI ════════════ */
  document.querySelectorAll("[data-sipario]").forEach((slot) => {
    gsap.set(slot, {
      clipPath: "inset(100% 100% 0% 0%)",
      scale: 1.14,
      transformOrigin: "0% 100%",
    });
    ScrollTrigger.create({
      trigger: slot,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(slot, {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: 1.5,
        ease: "expo.out",
      }),
    });
  });

  /* ════════════ MARCHIO GIGANTE NEL FOOTER ════════════
     Resta inciso in filigrana e si riempie di crema mano a mano
     che si scende: pieno esattamente quando la pagina finisce. */
  (function marchio() {
    const pieno = document.getElementById("marchioPieno");
    if (!pieno) return;
    gsap.fromTo(pieno,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        ease: "none",
        scrollTrigger: {
          /* comincia appena prima che spunti e si completa poco sopra
             il fondo: chi non tocca l'ultimo pixel lo vede pieno lo stesso */
          trigger: document.getElementById("marchioGigante"),
          start: "top 104%",
          end: "bottom 96%",
          scrub: 0.7,
        },
      });
  })();

})();
