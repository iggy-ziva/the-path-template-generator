(function () {
  'use strict';

  /* =====================================================================
     Funnel Navigator — self-contained floating widget
     Injected on all pages. No external dependencies.
     ===================================================================== */

  var STEPS = [
    { label: 'Event Landing',     sub: 'The offer page',           path: '/' },
    { label: 'Checkout',          sub: 'Choose your price',         path: '/checkout' },
    { label: 'Upsell',            sub: 'One-time offer',            path: '/upsell' },
    { label: 'Thank You',         sub: 'Event confirmation',        path: '/thank-you' },
    { label: 'Replay',            sub: 'Event recordings',          path: '/replay' },
    { label: 'Program',           sub: 'The Presence Collective',   path: '/program' },
    { label: 'Program Checkout',  sub: 'Enrolment · dark canvas',   path: '/program-checkout' },
    { label: 'Program Thank You', sub: 'Celebration · what\'s next', path: '/program-thank-you' }
  ];

  /* ---- Active step detection ----------------------------------------- */
  function getActiveIndex() {
    var p = window.location.pathname.replace(/\/$/, '') || '/';
    for (var i = STEPS.length - 1; i >= 0; i--) {
      var sp = STEPS[i].path.replace(/\/$/, '') || '/';
      if (p === sp) return i;
    }
    return 0;
  }

  /* ---- Inject CSS ------------------------------------------------------- */
  var css = [
    /* Widget container — pointer-events:none so the invisible bounding box never
       intercepts taps on page content; re-enabled per child below */
    '#fn-wrap{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",sans-serif;pointer-events:none;}',

    /* Pill toggle button — re-enable pointer events on the pill itself */
    '#fn-pill{display:inline-flex;align-items:center;gap:9px;padding:11px 18px 11px 14px;background:#0a0a0a;color:#f2f2f2;border:1px solid rgba(255,255,255,0.12);border-radius:9999px;font-size:13px;font-weight:600;letter-spacing:0.01em;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.35);transform:translateY(80px);opacity:0;transition:box-shadow 200ms ease,border-color 200ms ease;will-change:transform,opacity;pointer-events:auto;}',
    '#fn-pill.fn-visible{animation:fn-bounce-in 600ms cubic-bezier(0.34,1.56,0.64,1) forwards;}',
    '#fn-pill:hover{box-shadow:0 6px 28px rgba(0,0,0,0.45);border-color:rgba(255,255,255,0.22);}',

    /* Pill dot — uses brand accent-light if available, else a neutral blue */
    '#fn-dot{width:8px;height:8px;border-radius:50%;background:var(--accent-light,#4f8ef7);flex-shrink:0;position:relative;}',
    '#fn-dot::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--accent-light,#4f8ef7) 50%,transparent);animation:fn-pulse 2.4s ease-in-out infinite;}',

    /* Pill label */
    '#fn-pill-label{white-space:nowrap;}',

    /* Card — pointer-events re-enabled only when open */
    '#fn-card{background:#0a0a0a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.04);width:260px;transform-origin:bottom right;transform:scale(0.88) translateY(12px);opacity:0;pointer-events:none;transition:transform 320ms cubic-bezier(0.34,1.56,0.64,1),opacity 240ms ease;will-change:transform,opacity;}',
    '#fn-card.fn-open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}',

    /* Card header */
    '#fn-card-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid rgba(255,255,255,0.08);}',
    '#fn-card-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45);}',
    '#fn-close{width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,0.06);border:none;color:rgba(255,255,255,0.5);display:grid;place-items:center;cursor:pointer;font-size:14px;line-height:1;transition:background 150ms ease,color 150ms ease;padding:0;}',
    '#fn-close:hover{background:rgba(255,255,255,0.12);color:#ffffff;}',

    /* Steps list */
    '#fn-steps{padding:6px 0 8px;}',

    /* Single step */
    '.fn-step{display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;text-decoration:none;border-left:2px solid transparent;transition:background 150ms ease,border-color 150ms ease,transform 180ms ease;position:relative;}',
    '.fn-step:hover{background:rgba(255,255,255,0.05);transform:translateX(-3px);}',
    '.fn-step:active{transform:scale(0.97) translateX(-3px);}',
    '.fn-step.fn-active{border-left-color:var(--accent-light,#4f8ef7);background:color-mix(in srgb,var(--accent-light,#4f8ef7) 8%,transparent);}',
    '.fn-step.fn-active:hover{transform:translateX(-3px);}',

    /* Step number */
    '.fn-step-num{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);display:grid;place-items:center;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);flex-shrink:0;transition:background 150ms ease,color 150ms ease,border-color 150ms ease;}',
    '.fn-step.fn-active .fn-step-num{background:color-mix(in srgb,var(--accent-light,#4f8ef7) 18%,transparent);border-color:color-mix(in srgb,var(--accent-light,#4f8ef7) 40%,transparent);color:var(--accent-light,#4f8ef7);}',
    '.fn-step:hover:not(.fn-active) .fn-step-num{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);}',

    /* Step text */
    '.fn-step-text{display:flex;flex-direction:column;gap:1px;min-width:0;}',
    '.fn-step-name{font-size:13px;font-weight:600;color:rgba(255,255,255,0.65);white-space:nowrap;transition:color 150ms ease;}',
    '.fn-step.fn-active .fn-step-name{color:#ffffff;}',
    '.fn-step:hover:not(.fn-active) .fn-step-name{color:rgba(255,255,255,0.85);}',
    '.fn-step-sub{font-size:11px;color:rgba(255,255,255,0.3);white-space:nowrap;transition:color 150ms ease;}',
    '.fn-step.fn-active .fn-step-sub{color:color-mix(in srgb,var(--accent-light,#4f8ef7) 65%,transparent);}',

    /* Active arrow */
    '.fn-step-arrow{margin-left:auto;color:color-mix(in srgb,var(--accent-light,#4f8ef7) 50%,transparent);font-size:12px;opacity:0;transition:opacity 150ms ease,transform 150ms ease;flex-shrink:0;}',
    '.fn-step.fn-active .fn-step-arrow{opacity:1;}',
    '.fn-step:hover .fn-step-arrow{opacity:0.6;transform:translateX(2px);}',

    /* Divider between steps */
    '.fn-divider{height:1px;background:rgba(255,255,255,0.05);margin:2px 16px;}',

    /* Keyframes */
    '@keyframes fn-bounce-in{0%{transform:translateY(80px);opacity:0;}60%{opacity:1;}100%{transform:translateY(0);opacity:1;}}',
    '@keyframes fn-pulse{0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.8;transform:scale(1.25);}}'
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---- Build HTML ------------------------------------------------------- */
  var activeIdx = getActiveIndex();

  /* Card steps HTML */
  var stepsHtml = STEPS.map(function (step, i) {
    var isActive = i === activeIdx;
    var cls = 'fn-step' + (isActive ? ' fn-active' : '');
    return [
      i > 0 ? '<div class="fn-divider"></div>' : '',
      '<a class="', cls, '" href="', step.path, '" data-fn-step>',
        '<div class="fn-step-num">', i + 1, '</div>',
        '<div class="fn-step-text">',
          '<span class="fn-step-name">', step.label, '</span>',
          '<span class="fn-step-sub">', step.sub, '</span>',
        '</div>',
        '<span class="fn-step-arrow">›</span>',
      '</a>'
    ].join('');
  }).join('');

  /* Widget HTML */
  var wrap = document.createElement('div');
  wrap.id = 'fn-wrap';
  wrap.innerHTML = [
    /* Card (rendered first in DOM, shows above pill) */
    '<div id="fn-card" role="dialog" aria-label="Funnel navigator" aria-hidden="true">',
      '<div id="fn-card-header">',
        '<span id="fn-card-title">Funnel preview</span>',
        '<button id="fn-close" aria-label="Close navigator">✕</button>',
      '</div>',
      '<nav id="fn-steps">', stepsHtml, '</nav>',
    '</div>',

    /* Pill toggle */
    '<button id="fn-pill" aria-expanded="false" aria-controls="fn-card" aria-label="Open funnel navigator">',
      '<span id="fn-dot"></span>',
      '<span id="fn-pill-label">Preview funnel</span>',
    '</button>'
  ].join('');

  document.body.appendChild(wrap);

  /* ---- Elements --------------------------------------------------------- */
  var pill    = document.getElementById('fn-pill');
  var card    = document.getElementById('fn-card');
  var closeBtn = document.getElementById('fn-close');

  /* ---- State ------------------------------------------------------------ */
  var isOpen = false;

  /* Pill entrance — bounce in after page settles */
  setTimeout(function () {
    pill.classList.add('fn-visible');
  }, 1200);

  /* ---- Toggle logic ----------------------------------------------------- */
  function open() {
    isOpen = true;
    card.classList.add('fn-open');
    card.setAttribute('aria-hidden', 'false');
    pill.setAttribute('aria-expanded', 'true');
  }

  function close() {
    isOpen = false;
    card.classList.remove('fn-open');
    card.setAttribute('aria-hidden', 'true');
    pill.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    isOpen ? close() : open();
  }

  /* ---- Event listeners -------------------------------------------------- */
  pill.addEventListener('click', toggle);
  closeBtn.addEventListener('click', close);

  /* Step click — scale press before navigation */
  document.querySelectorAll('[data-fn-step]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href');
      /* Don't navigate away from current page */
      if (el.classList.contains('fn-active')) {
        e.preventDefault();
        close();
        return;
      }
      e.preventDefault();
      el.style.transform = 'scale(0.96)';
      setTimeout(function () {
        window.location.href = href;
      }, 120);
    });
  });

  /* Escape key dismisses */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) close();
  });

  /* Click outside dismisses */
  document.addEventListener('click', function (e) {
    if (isOpen && !wrap.contains(e.target)) close();
  });

})();
