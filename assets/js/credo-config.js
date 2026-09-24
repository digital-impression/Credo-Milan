/* ------------------------------------------------------------------
   Site configuration.

   formEndpoint: waar het aanvraag- en het nieuwsbriefformulier hun gegevens
   naartoe sturen. Staat hier niets, dan geven de formulieren de aanvraag door
   aan het mailprogramma van de bezoeker, zodat er nooit een aanvraag stil
   verdwijnt.

   Nu staat Formspree ingevuld. Wil je later naar een andere dienst of naar een
   eigen script op de server van one.com, dan is deze ene regel het enige wat
   wijzigt.
   ------------------------------------------------------------------ */
window.CREDO = { formEndpoint: 'https://formspree.io/f/xppwrnbr' };

/* Runs synchronously right after the Tailwind CDN script and before any
   markup is parsed: the config must exist before Tailwind scans the DOM, and
   imgFail must exist before the first <img> can fire an error. */
  // Guarded so a blocked/failed CDN degrades gracefully instead of throwing.
  if (typeof tailwind !== 'undefined') tailwind.config = {
    theme: {
      extend: {
        colors: {
          ink:    '#0D0D0D',
          ink2:   '#141414',
          bone:   '#F4F1EA',
          bone2:  '#E8E4DA',
          taupe:  '#7C7466',
          taupe2: '#9A9384',
          ash:    '#6E6E6E'
        },
        fontFamily: {
          display: ['Anton', 'Arial Narrow', 'Impact', 'sans-serif'],
          body:    ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
        },
        maxWidth: { measure: '62ch' }
      }
    }
  }

  function imgFail(el, label) {
    el.style.display = 'none';
    var p = el.closest('[data-imgwrap]') || el.parentElement;
    if (p) {
      p.classList.add('img-failed');
      p.setAttribute('data-fallback', label || '—');
    }
  }
