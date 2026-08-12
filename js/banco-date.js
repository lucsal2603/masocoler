/* ═══════════════════════════════════════════════════════════════
   MASO COLER — il banco delle date
   Ricerca disponibilità in stile: arrivo, partenza e ospiti scelti
   qui, il controllo si apre sul portale Krossbooking del maso con
   le date già impostate (stessi parametri del widget ufficiale).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const banco = document.getElementById("bancoDate");
  if (!banco) return;

  const inputArrivo = document.getElementById("arrivoInput");
  const inputPartenza = document.getElementById("partenzaInput");
  const bottone = document.getElementById("verificaDate");
  const numeroOspiti = document.getElementById("ospitiNumero");

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
    inputPartenza.min = iso(new Date(arrivo.getTime() + GIORNO_MS));
    dipingi("arrivo", arrivo);
    dipingi("partenza", partenza);
    numeroOspiti.textContent = ospiti;
    /* l'href resta sempre pronto: funziona anche aprendo in una scheda nuova col tasto centrale */
    bottone.href = "https://masocoler.kross.travel/book/step1"
      + "?adults=" + ospiti + "&children=0&rooms=1"
      + "&guests=" + ospiti + "&n_guests=" + ospiti
      + "&guests_rooms=" + ospiti + ",0;"
      + "&kross_lang=it&from=" + inputArrivo.value + "&to=" + inputPartenza.value + "&";
  }

  /* date di partenza: fra una settimana, per due notti */
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  const arrivoIniziale = new Date(oggi.getTime() + 7 * GIORNO_MS);
  inputArrivo.value = iso(arrivoIniziale);
  inputArrivo.min = iso(oggi);
  inputPartenza.value = iso(new Date(arrivoIniziale.getTime() + 2 * GIORNO_MS));
  aggiorna();

  /* i campi aprono il calendario di sistema */
  [["campoArrivo", inputArrivo], ["campoPartenza", inputPartenza]].forEach(([id, input]) => {
    document.getElementById(id).addEventListener("click", () => {
      if (typeof input.showPicker === "function") {
        try { input.showPicker(); } catch (e) { input.focus(); }
      } else {
        input.focus();
      }
    });
    input.addEventListener("change", aggiorna);
  });

  document.getElementById("ospitiMeno").addEventListener("click", () => {
    ospiti = Math.max(1, ospiti - 1);
    aggiorna();
  });
  document.getElementById("ospitiPiu").addEventListener("click", () => {
    ospiti = Math.min(9, ospiti + 1);
    aggiorna();
  });
})();
