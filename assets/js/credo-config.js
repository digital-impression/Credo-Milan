/* ------------------------------------------------------------------
   Site configuration.

   formEndpoint: where the aanvraag- and nieuwsbrief-formulieren POST their
   JSON. Leave it empty and the forms hand off to the visitor's mail client
   instead, so no lead is ever silently dropped. Fill it in with whatever the
   practice uses (eigen backend, Formspree, Basin, ...) and the forms switch
   over on their own — no other change needed.
   [TE BEVESTIGEN met de klant]
   ------------------------------------------------------------------ */
window.CREDO = { formEndpoint: '' };

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
