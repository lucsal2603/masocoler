/* ═══════════════════════════════════════════════════════════════
   MASO COLER — il banco delle date
   Ricerca disponibilità in stile: arrivo, partenza e ospiti scelti
   qui, con un calendario disegnato come il resto del sito (niente
   picker di sistema). Il controllo si apre sul portale Krossbooking
   del maso con gli stessi parametri del widget ufficiale.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const banco = document.getElementById("bancoDate");
  if (!banco) return;

  const inputArrivo = document.getElementById("arrivoInput");
  const inputPartenza = document.getElementById("partenzaInput");
  const bottone = document.getElementById("verificaDate");
  const numeroOspiti = document.getElementById("ospitiNumero");
  const campoArrivo = document.getElementById("campoArrivo");
  const campoPartenza = document.getElementById("campoPartenza");

  const GIORNO_MS = 24 * 60 * 60 * 1000;
  let ospiti = 2;

  const iso = (d) => {
    const z = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  };
  const daIso = (s) => {
    const [a, m, g] = s.split("-").map(Number);
    return new Date(a, m - 1, g);
  };

  const fmtMese = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });
  const fmtSettimana = new Intl.DateTimeFormat("it-IT", { weekday: "long" });
  const fmtLunga = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  function dipingi(prefisso, data) {
    document.getElementById(prefisso + "Giorno").textContent = data.getDate();
    document.getElementById(prefisso + "Mese").textContent = fmtMese.format(data).toUpperCase();
    document.getElementById(prefisso + "Settimana").textContent = fmtSettimana.format(data).toUpperCase();
  }

  function aggiorna() {
    const arrivo = daIso(inputArrivo.value);
    let partenza = daIso(inputPartenza.value);
    if (partenza <= arrivo) {
      partenza = new Date(arrivo.getTime() + GIORNO_MS);
      inputPartenza.value = iso(partenza);
    }
    dipingi("arrivo", arrivo);
    dipingi("partenza", partenza);
    numeroOspiti.textContent = ospiti;
    bottone.href = "https://masocoler.kross.travel/book/step1"
      + "?adults=" + ospiti + "&children=0&rooms=1"
      + "&guests=" + ospiti + "&n_guests=" + ospiti
      + "&guests_rooms=" + ospiti + ",0;"
      + "&kross_lang=it&from=" + inputArrivo.value + "&to=" + inputPartenza.value + "&";
  }

  /* date di partenza: fra una settimana, per due notti */
  const arrivoIniziale = new Date(oggi.getTime() + 7 * GIORNO_MS);
  inputArrivo.value = iso(arrivoIniziale);
  inputPartenza.value = iso(new Date(arrivoIniziale.getTime() + 2 * GIORNO_MS));
  aggiorna();

  /* ════════════ IL CALENDARIO DEL MASO ════════════
     Un pannello solo, riusato per arrivo e partenza. */

  const pannello = document.createElement("div");
  pannello.className = "calendario";
  pannello.setAttribute("role", "dialog");
  pannello.setAttribute("aria-label", "Scegliete il giorno");
  pannello.innerHTML =
    '<div class="slot-angoli angoli-terra" aria-hidden="true"></div>' +
    '<div class="calendario-testa">' +
    '  <button class="passo calendario-freccia" id="calPrima" type="button" aria-label="Il mese prima">‹</button>' +
    '  <span class="calendario-mese" id="calMese" aria-live="polite"></span>' +
    '  <button class="passo calendario-freccia" id="calDopo" type="button" aria-label="Il mese dopo">›</button>' +
    "</div>" +
    '<div class="calendario-settimana" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>G</span><span>V</span><span>S</span><span>D</span></div>' +
    '<div class="calendario-griglia" id="calGriglia"></div>' +
    '<p class="calendario-nota" id="calNota"></p>';
  banco.appendChild(pannello);

  const calMese = pannello.querySelector("#calMese");
  const calGriglia = pannello.querySelector("#calGriglia");
  const calNota = pannello.querySelector("#calNota");

  let aperto = null;            /* "arrivo" | "partenza" | null */
  let vista = new Date(arrivoIniziale.getFullYear(), arrivoIniziale.getMonth(), 1);

  function limiteMinimo() {
    if (aperto === "partenza") {
      return new Date(daIso(inputArrivo.value).getTime() + GIORNO_MS);
    }
    return oggi;
  }

  function disegna() {
    const arrivo = daIso(inputArrivo.value);
    const partenza = daIso(inputPartenza.value);
    const scelto = aperto === "arrivo" ? arrivo : partenza;
    const minimo = limiteMinimo();

    calMese.textContent = maiuscola(fmtMese.format(vista));
    calGriglia.textContent = "";

    /* lunedì come primo giorno della settimana */
    const primo = new Date(vista.getFullYear(), vista.getMonth(), 1);
    const vuoti = (primo.getDay() + 6) % 7;
    for (let i = 0; i < vuoti; i += 1) {
      calGriglia.appendChild(document.createElement("span"));
    }

    const nelMese = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
    for (let g = 1; g <= nelMese; g += 1) {
      const data = new Date(vista.getFullYear(), vista.getMonth(), g);
      const cella = document.createElement("button");
      cella.type = "button";
      cella.className = "giorno";
      cella.textContent = g;
      cella.setAttribute("aria-label", fmtLunga.format(data));
      if (data.getTime() === oggi.getTime()) cella.classList.add("oggi");
      if (data.getTime() === scelto.getTime()) cella.classList.add("scelto");
      if (data > arrivo && data < partenza) cella.classList.add("compreso");
      if (data.getTime() === arrivo.getTime() || data.getTime() === partenza.getTime()) cella.classList.add("estremo");
      if (data < minimo) {
        cella.disabled = true;
      } else {
        cella.addEventListener("click", () => scegli(data));
      }
      calGriglia.appendChild(cella);
    }

    calNota.textContent = aperto === "arrivo" ? "IL GIORNO IN CUI ARRIVATE" : "IL GIORNO IN CUI RIPARTITE";
  }

  function apri(quale) {
    aperto = quale;
    const campo = quale === "arrivo" ? campoArrivo : campoPartenza;
    const scelto = daIso((quale === "arrivo" ? inputArrivo : inputPartenza).value);
    vista = new Date(scelto.getFullYear(), scelto.getMonth(), 1);
    disegna();
    /* ancorato al campo cliccato, sotto il banco */
    const largo = Math.min(360, banco.clientWidth - 2);
    pannello.style.width = largo + "px";
    let sinistra = campo.offsetLeft;
    sinistra = Math.max(0, Math.min(sinistra, banco.clientWidth - largo));
    pannello.style.left = sinistra + "px";
    pannello.style.top = campo.offsetTop + campo.offsetHeight + 8 + "px";
    pannello.classList.add("aperto");
    campoArrivo.classList.toggle("in-scelta", quale === "arrivo");
    campoPartenza.classList.toggle("in-scelta", quale === "partenza");
  }

  function chiudi() {
    aperto = null;
    pannello.classList.remove("aperto");
    campoArrivo.classList.remove("in-scelta");
    campoPartenza.classList.remove("in-scelta");
  }

  function scegli(data) {
    if (aperto === "arrivo") {
      inputArrivo.value = iso(data);
      aggiorna();
      apri("partenza"); /* il passo dopo: quando si riparte? */
    } else {
      inputPartenza.value = iso(data);
      aggiorna();
      chiudi();
    }
  }

  pannello.querySelector("#calPrima").addEventListener("click", () => {
    vista = new Date(vista.getFullYear(), vista.getMonth() - 1, 1);
    disegna();
  });
  pannello.querySelector("#calDopo").addEventListener("click", () => {
    vista = new Date(vista.getFullYear(), vista.getMonth() + 1, 1);
    disegna();
  });

  campoArrivo.addEventListener("click", () => (aperto === "arrivo" ? chiudi() : apri("arrivo")));
  campoPartenza.addEventListener("click", () => (aperto === "partenza" ? chiudi() : apri("partenza")));

  document.addEventListener("click", (e) => {
    if (!aperto) return;
    /* un giorno appena scelto viene tolto dal DOM dal ridisegno:
       il suo click non deve passare per "click fuori" */
    if (!e.target.isConnected) return;
    if (pannello.contains(e.target) || campoArrivo.contains(e.target) || campoPartenza.contains(e.target)) return;
    chiudi();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") chiudi();
  });

  /* ════════════ OSPITI ════════════ */
  document.getElementById("ospitiMeno").addEventListener("click", () => {
    ospiti = Math.max(1, ospiti - 1);
    aggiorna();
  });
  document.getElementById("ospitiPiu").addEventListener("click", () => {
    ospiti = Math.min(9, ospiti + 1);
    aggiorna();
  });
})();
