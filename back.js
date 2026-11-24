/* SigmaTau · "← Back" button for every page except the home page.
   Include once, at the end of <body>:  <script src="../back.js" data-up="../"></script>
   data-up = where Back goes when there is no in-site page to return to
   (e.g. a demo opened from a direct link). Otherwise it acts like the browser's Back. */
(function () {
  const me = document.currentScript;
  const up = (me && me.dataset.up) || "../";

  const st = document.createElement("style");
  st.textContent = `
.st-back{display:inline-flex;align-items:center;gap:6px;margin:0 0 14px;padding:7px 14px 7px 11px;border:1px solid var(--line,#D9DCE1);
  border-radius:999px;background:#fff;color:var(--ink,#111);font:500 13px/1.2 Poppins,system-ui,sans-serif;text-decoration:none;
  transition:color .15s,border-color .15s,background .15s;-webkit-tap-highlight-color:transparent}
.st-back:hover,.st-back:focus-visible{color:var(--red,#E63946);border-color:var(--red,#E63946);outline:none}
.st-back:active{background:var(--tint,#FDECEE)}
.st-back span{font-size:15px;line-height:1}
.st-back-wrap{display:block}
.st-back.dark{background:transparent;color:#fff;border-color:rgba(255,255,255,.28)}
.st-back.dark:hover,.st-back.dark:focus-visible{color:#fff;border-color:var(--red,#E63946);background:rgba(230,57,70,.18)}`;
  document.head.appendChild(st);

  const a = document.createElement("a");
  a.className = "st-back"; a.href = up;
  a.innerHTML = '<span aria-hidden="true">←</span>Back';
  a.setAttribute("aria-label", "Go back");

  a.addEventListener("click", e => {
    let sameSite = false;
    try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (_) {}
    if (sameSite && history.length > 1) { e.preventDefault(); history.back(); }
  });

  // Put it on its own line at the very top, above the logo / header.
  const logo = document.querySelector(".logo");
  const anchor = logo ? (logo.closest("header") || logo) : document.body.firstElementChild;
  const wrap = document.createElement("div"); wrap.className = "st-back-wrap"; wrap.appendChild(a);
  if (anchor) anchor.before(wrap); else document.body.prepend(wrap);

  // Outlined style on dark backgrounds (e.g. the black hero on the menu and tutoring pages).
  for (let el = wrap.parentElement; el; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m || (m.length === 4 && +m[3] === 0)) continue;              // transparent: look further up
    if (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2] < 110) a.classList.add("dark");
    break;
  }
})();
