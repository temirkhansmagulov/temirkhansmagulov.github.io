/* SigmaTau · Share button + parameters in the link.
   Include last, after the page's own script:
     <script src="../share.js"></script>
     <script src="../share.js" data-state="pts" data-after="integrate()"></script>
   Saved automatically: every slider (incl. axis scale), every toggle, the selected chip in each chip group.
   data-state: extra page variables (numbers or arrays of numbers) to save, e.g. dragged points.
   data-after: code to run after restoring from a link (e.g. recompute a trajectory, stop an intro animation).
   Only values that differ from the page's defaults go into the link, e.g.
     …/tangent-line.html?f=sin&x0=0.8&h=0.05&gs-x=2
   The address bar keeps up with changes, so reloading or copying the URL also works. */
(function () {
  const me = document.currentScript;
  const stateVars = ((me && me.dataset.state) || "").split(",").map(s => s.trim()).filter(Boolean);
  const after = (me && me.dataset.after) || "";

  const ranges = () => [...document.querySelectorAll('input[type="range"][id]')];
  const checks = () => [...document.querySelectorAll('input[type="checkbox"][id]')];
  const groups = () => [...new Set([...document.querySelectorAll(".chip[data-g]")].map(c => c.dataset.g))];
  const getVar = n => { try { return Function("return " + n)(); } catch (_) { return undefined; } };
  const r4 = x => String(+(+x).toFixed(4));

  // page variables <-> text: numbers joined by "," and rows by ";", "-" for null
  const enc = v => v == null ? "-" : Array.isArray(v) ? v.map(x => Array.isArray(x) ? x.map(r4).join(",") : r4(x)).join(Array.isArray(v[0]) ? ";" : ",") : r4(v);
  function dec(txt, cur) {
    if (txt === "-") return null;
    if (Array.isArray(cur) && Array.isArray(cur[0]) || txt.includes(";")) return txt.split(";").map(r => r.split(",").map(Number));
    if (Array.isArray(cur) || txt.includes(",")) return txt.split(",").map(Number);
    return Number(txt);
  }
  function setVar(n, val) {
    const cur = getVar(n);
    if (Array.isArray(cur) && Array.isArray(val) && cur.length === val.length) {
      // change arrays in place: other code may hold a reference to them
      val.forEach((x, i) => {
        if (Array.isArray(cur[i]) && Array.isArray(x) && cur[i].length === x.length) x.forEach((y, j) => cur[i][j] = y);
        else cur[i] = x;
      });
    } else {
      try { Function("v", n + " = v")(val); } catch (_) {}
    }
  }
  const valid = v => v === null || (Array.isArray(v) ? v.flat().every(isFinite) : isFinite(v));

  function snapshot() {
    const s = {};
    groups().forEach(g => { const on = document.querySelector(`.chip.on[data-g="${g}"]`); if (on) s[g] = on.dataset.v; });
    checks().forEach(c => s[c.id] = c.checked ? "1" : "0");
    ranges().forEach(r => s[r.id] = r4(r.value));
    stateVars.forEach(n => { const v = getVar(n); if (v !== undefined) s[n] = enc(v); });
    return s;
  }
  const defaults = snapshot();

  // ----- restore from the link -----
  const q = new URLSearchParams(location.search);
  const fire = (el, ...types) => types.forEach(t => el.dispatchEvent(new Event(t, { bubbles: true })));
  if ([...q.keys()].length) {
    groups().forEach(g => {
      if (!q.has(g)) return;
      const chip = document.querySelector(`.chip[data-g="${g}"][data-v="${CSS.escape(q.get(g))}"]`);
      if (chip && !chip.classList.contains("on")) chip.click();
    });
    checks().forEach(c => {
      if (!q.has(c.id)) return;
      const want = q.get(c.id) === "1";
      if (c.checked !== want) { c.checked = want; fire(c, "input", "change"); }
    });
    for (let pass = 0; pass < 2; pass++)            // twice: some limits depend on other sliders (e.g. k ≤ n)
      ranges().forEach(r => {
        if (!q.has(r.id)) return;
        const v = Number(q.get(r.id));
        if (isFinite(v) && Number(r.value) !== v) { r.value = v; fire(r, "input", "change"); }
      });
    stateVars.forEach(n => {
      if (!q.has(n)) return;
      const val = dec(q.get(n), getVar(n));
      if (valid(val)) setVar(n, val);
    });
    if (after) { try { Function(after)(); } catch (_) {} }
    dispatchEvent(new Event("resize"));             // every page redraws on resize
    document.querySelectorAll(".row.active").forEach(r => r.classList.remove("active"));
  }

  // ----- link for the current state -----
  function link() {
    const now = snapshot(), p = new URLSearchParams();
    Object.keys(now).forEach(k => { if (now[k] !== defaults[k]) p.set(k, now[k]); });
    const qs = p.toString().replace(/%2C/g, ",").replace(/%3B/g, ";");
    return location.origin + location.pathname + (qs ? "?" + qs : "");
  }
  // Throttled (not debounced): animations that move a slider every frame must not starve it.
  let t = null;
  function syncAddress() {
    if (t) return;
    t = setTimeout(() => { t = null; try { history.replaceState(history.state, "", link()); } catch (_) {} }, 300);
  }
  ["input", "change", "click", "pointerup", "keyup"].forEach(ev => document.addEventListener(ev, syncAddress, true));

  // ----- button -----
  const st = document.createElement("style");
  st.textContent = `
.st-back-wrap.has-share{display:flex;align-items:center;justify-content:space-between;gap:10px}
.st-share{display:inline-flex;align-items:center;gap:7px;margin:0 0 14px;padding:7px 14px 7px 12px;border:1px solid var(--red,#E63946);
  border-radius:999px;background:var(--red,#E63946);color:#fff;font:500 13px/1.2 Poppins,system-ui,sans-serif;cursor:pointer;
  transition:filter .15s,transform .1s;-webkit-tap-highlight-color:transparent}
.st-share:hover,.st-share:focus-visible{filter:brightness(1.08);outline:none}
.st-share:active{transform:scale(.97)}
.st-share svg{width:15px;height:15px}
.st-toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);z-index:60;max-width:min(560px,calc(100vw - 24px));
  background:var(--ink,#111);color:#fff;border-radius:12px;padding:12px 14px;font:13px/1.4 Poppins,system-ui,sans-serif;
  box-shadow:0 8px 28px rgba(0,0,0,.25);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
.st-toast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.st-toast b{display:block;margin-bottom:6px;font-weight:600}
.st-toast input{width:100%;box-sizing:border-box;font:12px/1.3 ui-monospace,Menlo,monospace;padding:7px 8px;border-radius:7px;border:0;
  background:#2a2a2a;color:#fff}`;
  document.head.appendChild(st);

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "st-share";
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>Share';
  btn.title = "Share a link to this page with the current settings";

  let wrap = document.querySelector(".st-back-wrap");
  if (!wrap) {
    wrap = document.createElement("div"); wrap.className = "st-back-wrap";
    const logo = document.querySelector(".logo"), anchor = logo ? (logo.closest("header") || logo) : document.body.firstElementChild;
    anchor ? anchor.before(wrap) : document.body.prepend(wrap);
    if (!wrap.firstChild) wrap.appendChild(document.createElement("span"));
  }
  wrap.classList.add("has-share"); wrap.appendChild(btn);

  const toast = document.createElement("div"); toast.className = "st-toast"; toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  let tt;
  function showToast(title, url) {
    toast.innerHTML = "<b></b>"; toast.firstChild.textContent = title;
    if (url) { const i = document.createElement("input"); i.readOnly = true; i.value = url; toast.appendChild(i); setTimeout(() => { i.focus(); i.select(); }, 30); }
    toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), url ? 6000 : 2600);
  }

  btn.addEventListener("click", async () => {
    const url = link();
    try { history.replaceState(history.state, "", url); } catch (_) {}
    const phone = matchMedia("(pointer: coarse)").matches;
    if (phone && navigator.share) {
      try { await navigator.share({ title: document.title, url }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(url); showToast("Link copied: it opens this page with the same settings."); }
    catch (_) { showToast("Copy this link:", url); }
  });
})();
