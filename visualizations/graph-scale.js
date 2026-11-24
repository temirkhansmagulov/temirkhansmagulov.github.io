/* SigmaTau · axis scale controls for Cartesian graphs.
   Adds "x-axis scale" and "y-axis scale" sliders (×1 … ×10) to the controls card.
   ×1 is the standard view and is the smallest scale; ×2 shows twice the range on that axis, etc.
   Works by wrapping the page's shared grid() function: just before the grid is drawn,
   the current view V is stretched (about 0 if it is in view, else about the centre), so everything drawn after it
   (curves, points, dragging) uses the scaled view. Include after the page's own script. */
(function () {
  if (typeof grid !== "function" || typeof V === "undefined") return;
  const MAX = 10;
  let sx = 1, sy = 1;

  const close = (a, b) => Math.abs(a - b) < 1e-9 * (1 + Math.abs(a));
  function applyScale() {
    const v = V, m = v._gs;
    // Reuse the stored standard view if V still holds the values we produced last time;
    // otherwise the page has just set a fresh view, which becomes the new standard.
    const base = m && close(v.xmin, m.out[0]) && close(v.xmax, m.out[1]) && close(v.ymin, m.out[2]) && close(v.ymax, m.out[3])
      ? m.base : [v.xmin, v.xmax, v.ymin, v.ymax];
    if (sx === 1 && sy === 1 && !m) return;
    // Stretch about 0 when the standard view contains it (axes stay put), otherwise about the centre.
    const stretch = (lo, hi, k) => { const c = lo <= 0 && hi >= 0 ? 0 : (lo + hi) / 2; return [c + (lo - c) * k, c + (hi - c) * k]; };
    [v.xmin, v.xmax] = stretch(base[0], base[1], sx);
    [v.ymin, v.ymax] = stretch(base[2], base[3], sy);
    Object.defineProperty(v, "_gs", { value: { base, out: [v.xmin, v.xmax, v.ymin, v.ymax] }, configurable: true, writable: true, enumerable: false });
  }
  const orig = grid;
  grid = function () { applyScale(); return orig.apply(this, arguments); };

  // ----- controls -----
  const card = document.querySelector(".card.controls");
  if (!card) return;
  const st = document.createElement("style");
  st.textContent = `
.gs-head{display:flex;align-items:center;justify-content:space-between;margin:14px 0 2px;padding-top:12px;border-top:1px solid var(--line,#D9DCE1)}
.gs-head span{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--grey,#6B7280)}
.gs-reset{font:inherit;font-size:12px;color:var(--red,#E63946);background:none;border:0;padding:4px 2px;cursor:pointer;visibility:hidden}
.gs-reset.on{visibility:visible}`;
  document.head.appendChild(st);

  const head = document.createElement("div"); head.className = "gs-head";
  head.innerHTML = '<span>Axis scale</span><button type="button" class="gs-reset">Reset to standard</button>';
  card.appendChild(head);
  const reset = head.querySelector(".gs-reset");

  function row(id, text) {
    const r = document.createElement("div"); r.className = "row";
    r.innerHTML = `<label for="${id}">${text}</label><input type="range" id="${id}" min="1" max="${MAX}" step="0.1" value="1"><output id="${id}o">×1</output>`;
    card.appendChild(r);
    return r.querySelector("input");
  }
  const xs = row("gs-x", "x-axis · scale"), ys = row("gs-y", "y-axis · scale");

  const redraw = () => dispatchEvent(new Event("resize"));
  function update() {
    sx = +xs.value; sy = +ys.value;
    xs.nextElementSibling.textContent = "×" + String(+sx.toFixed(1));
    ys.nextElementSibling.textContent = "×" + String(+sy.toFixed(1));
    reset.classList.toggle("on", sx !== 1 || sy !== 1);
    redraw();
  }
  xs.addEventListener("input", update); ys.addEventListener("input", update);
  reset.addEventListener("click", () => { xs.value = 1; ys.value = 1; update(); });
})();
