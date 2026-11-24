/* SigmaTau · type a slider value directly.
   Tap (or focus + Enter) the number next to any slider, type a value, press Enter.
   Accepts plain numbers and simple expressions: 1/3, -2.5, pi/2, 2pi, sqrt(2), e^2.
   Values outside the slider's range are clamped to its min/max. */
(function () {
  const css = `
.row output.editable{cursor:text;border-bottom:1px dashed var(--line,#D9DCE1);padding:2px 0;border-radius:2px;transition:background .15s}
.row output.editable:hover,.row output.editable:focus-visible{background:var(--tint,#FDECEE);outline:none;border-bottom-color:var(--red,#E63946)}
.row input.numentry{width:100%;box-sizing:border-box;font:inherit;font-size:14px;font-weight:500;text-align:right;padding:4px 5px;
  border:1.5px solid var(--red,#E63946);border-radius:6px;background:#fff;color:var(--ink,#111);outline:none;min-width:0}
.row input.numentry.bad{animation:ne-shake .25s;background:var(--tint,#FDECEE)}
@keyframes ne-shake{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
.ne-tip{position:fixed;z-index:50;background:var(--ink,#111);color:#fff;font-size:12px;padding:5px 8px;border-radius:6px;pointer-events:none;
  white-space:nowrap;transform:translate(-100%,-100%);opacity:0;transition:opacity .2s}
.ne-tip.on{opacity:1}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const tip = document.createElement("div"); tip.className = "ne-tip"; document.body.appendChild(tip);
  let tipTimer;
  function showTip(anchor, text) {
    const r = anchor.getBoundingClientRect();
    tip.textContent = text; tip.style.left = r.right + "px"; tip.style.top = (r.top - 6) + "px";
    tip.classList.add("on"); clearTimeout(tipTimer); tipTimer = setTimeout(() => tip.classList.remove("on"), 1800);
  }

  // Safe little evaluator: numbers, + − × ÷ ^ ( ), pi/π, e, sqrt, implicit 2pi.
  function evaluate(txt) {
    let s = String(txt).trim().toLowerCase()
      .replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/,/g, ".")
      .replace(/[°%]/g, "").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/\s+/g, "");
    if (!s) return NaN;
    if (/[^0-9.+\-*/^()a-z]/.test(s)) return NaN;
    const words = s.match(/[a-z]+/g) || [];
    if (words.some(w => !["pi", "e", "sqrt"].includes(w))) return NaN;
    s = s.replace(/(\d|\))(?=pi|e(?![0-9])|sqrt|\()/g, "$1*")       // 2pi → 2*pi, 2(…) → 2*(…)
         .replace(/(pi|\))(?=\d)/g, "$1*")
         .replace(/\^/g, "**").replace(/pi/g, "Math.PI").replace(/sqrt/g, "Math.sqrt")
         .replace(/\be\b/g, "Math.E");
    try { const v = Function('"use strict";return (' + s + ")")(); return typeof v === "number" && isFinite(v) ? v : NaN; }
    catch (_) { return NaN; }
  }

  const trim = x => String(+(+x).toFixed(6));

  function attach(slider, out) {
    if (out.dataset.ne) return; out.dataset.ne = "1";
    out.classList.add("editable"); out.tabIndex = 0;
    out.setAttribute("role", "button");
    out.title = "Tap to type a value";
    const label = slider.id && document.querySelector('label[for="' + slider.id + '"]');
    out.setAttribute("aria-label", "Type a value" + (label ? " for " + label.textContent.trim() : ""));

    function open() {
      if (out.hidden) return;
      const min = +slider.min, max = +slider.max;
      const inp = document.createElement("input");
      inp.className = "numentry"; inp.type = "text";
      inp.setAttribute("inputmode", min < 0 ? "text" : "decimal");   // iOS decimal pad has no minus key
      inp.setAttribute("enterkeyhint", "done"); inp.autocomplete = "off"; inp.spellcheck = false;
      inp.value = trim(slider.value);
      inp.setAttribute("aria-label", out.getAttribute("aria-label"));
      out.hidden = true; out.after(inp); inp.focus(); inp.select();
      let done = false;
      function close(commit) {          // "enter" | "blur" apply the value, "esc" cancels
        if (done) return;
        if (commit !== "esc") {
          const v = evaluate(inp.value);
          if (isNaN(v)) {
            if (commit === "enter") { inp.classList.remove("bad"); void inp.offsetWidth; inp.classList.add("bad"); showTip(inp, "Enter a number"); return; }
          } else {
            const lo = +slider.min, hi = +slider.max;           // read again: some maxima change (e.g. k ≤ n)
            const c = Math.min(hi, Math.max(lo, v));
            if (c !== v) showTip(out, "Range: " + trim(lo) + " to " + trim(hi));
            slider.value = c;
            slider.dispatchEvent(new Event("input", { bubbles: true }));
            slider.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
        done = true; inp.remove(); out.hidden = false;
        if (commit === "enter" || commit === "esc") out.focus({ preventScroll: true });
      }
      inp.addEventListener("keydown", e => {
        if (e.key === "Enter") { e.preventDefault(); close("enter"); }
        else if (e.key === "Escape") { e.preventDefault(); close("esc"); }
      });
      inp.addEventListener("blur", () => close("blur"));
    }
    out.addEventListener("click", open);
    out.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  }

  function scan(root) {
    root.querySelectorAll('input[type="range"]').forEach(s => {
      const o = s.nextElementSibling;
      if (o && o.tagName === "OUTPUT") attach(s, o);
    });
  }
  scan(document);
  new MutationObserver(() => scan(document)).observe(document.body, { childList: true, subtree: true });
})();
