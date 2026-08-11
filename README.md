# Maso Coler — proposta di nuovo sito

Sito vetrina dimostrativo per **Maso Coler**, agriturismo reale in Val di Rabbi
(Trentino), nel Parco Nazionale dello Stelvio. Un'unica pagina, atmosfera di
notte alpina: nero caldo, crema, sabbia e ruggine, serif ad alto contrasto.
Derivato dall'impianto della demo Gelsaia, ricostruito sui contenuti e sulle
fotografie del sito attuale (masocoler.it).

**Demo:** https://lucsal2603.github.io/masocoler/

## Movimento
- Loader con marchio che sfoca e lascia il posto al titolo, lettera per lettera
- Manifesto appuntato: tre brani che si scambiano parola per parola con lo scroll
- Ruota della colazione: due cerchi ai bordi che girano con lo scorrimento (parole + foto vere)
- Slider delle tre camere a trascinamento infinito con parallasse e contatore
- Liste con velo che entra dal lato di ingresso del mouse (ospitalità + valle)
- Quadri fotografici con sipario diagonale al reveal
- Cursore quadrato con inseguimento morbido e modalità "trascina"
- Grana pellicola, strappi di carta tra le sezioni, rulli di lettere su link e bottoni

## Tecnica
HTML/CSS/JS puro + GSAP (ScrollTrigger) + Lenis, nessun passaggio di build.
Suddivisione testi in lettere/parole fatta a mano, senza plugin.
`prefers-reduced-motion` rispettato: la pagina diventa statica e leggibile.

Le fotografie provengono dal sito attuale dell'azienda (masocoler.it) e sono
usate solo a scopo dimostrativo. I dati assunti sono in `DA-VERIFICARE.md`.

## In locale
```bash
python3 -m http.server 8054
# → http://localhost:8054
```
