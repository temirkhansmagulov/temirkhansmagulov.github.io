/* SigmaTau · "← Back" button: goes one level UP the site's folder tree (not browser history).
   Include once, at the end of <body>, on every page except the home page:
     <script src="../back.js"></script>      (path to this file, relative to the page)

   How "up" is found, from the page's own address (query and #hash are ignored):
     /visualizations/calculus/tangent-line.html  → parent folder /visualizations/calculus/
     /visualizations/                            → /
     /tutoring/                                  → /
   If the parent folder has no page of its own (e.g. /visualizations/calculus/), Back goes one
   more level up and opens that folder's section there: /visualizations/#calculus.
   This is checked live, so new folders and pages need no settings.
   To send Back somewhere else (e.g. a language version in a subfolder), put in the page's <head>:
     <meta name="st-back" content="/">            (the address Back should open) */
(function () {
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

  // "/a/b/c.html" → "/a/b/",  "/a/b/" → "/a/",  "/a/b/index.html" → "/a/"
  function parentOf(path) {
    path = path.replace(/index\.html$/, "");
    if (path.endsWith("/")) path = path.slice(0, -1);
    return path.slice(0, path.lastIndexOf("/") + 1) || "/";
  }
  const nameOf = dir => decodeURIComponent(dir.replace(/\/$/, "").split("/").pop());

  const override = (document.querySelector('meta[name="st-back"]') || {}).content;
  const first = override || parentOf(location.pathname);
  const a = document.createElement("a");
  a.className = "st-back"; a.href = first;
  const ru = (document.documentElement.lang || "").startsWith("ru");
  a.innerHTML = '<span aria-hidden="true">←</span>' + (ru ? "Назад" : "Back");
  a.setAttribute("aria-label", ru ? "Назад на уровень выше" : "Back up one level");

  // Find the nearest folder above this page that has a page; remember which subfolder we came from.
  async function hasPage(dir) {
    try { const r = await fetch(dir, { method: "HEAD", cache: "no-cache" }); return r.ok; }
    catch (_) { return true; }               // offline / file:// — just trust the folder
  }
  const resolved = (async () => {
    if (override) return override;
    let dir = first, from = "";
    while (dir !== "/" && !(await hasPage(dir))) { from = nameOf(dir); dir = parentOf(dir); }
    return dir + (from ? "#" + encodeURIComponent(from) : "");
  })();
  resolved.then(url => { a.href = url; a.title = (url === "/" ? "Up to home" : "Up to " + url); });
  a.addEventListener("click", e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;   // let "open in new tab" work as usual
    e.preventDefault(); resolved.then(url => { location.href = url; });
  });

  // Put it on its own line at the very top, above the logo / header.
  const logo = document.querySelector(".logo");
  const anchor = logo ? (logo.closest("header") || logo) : document.body.firstElementChild;
  const wrap = document.createElement("div"); wrap.className = "st-back-wrap"; wrap.appendChild(a);
  if (anchor) anchor.before(wrap); else document.body.prepend(wrap);

  // Outlined style on dark backgrounds (e.g. the black hero on the menu and tutoring pages).
  for (let el = wrap.parentElement; el; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m || (m.length === 4 && +m[3] === 0)) continue;
    if (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2] < 110) a.classList.add("dark");
    break;
  }
})();
