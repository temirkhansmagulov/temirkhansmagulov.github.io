/* SigmaTau · colors for JavaScript (canvas graphs, charts).
   The values come from /colors.css, so change colors there, not here.

   Use (after <link rel="stylesheet" href="/colors.css"> and <script src="/colors.js"></script>):
     ctx.strokeStyle = COLORS.red;
     ctx.strokeStyle = COLORS.viz[2];                 // viz-2 = blue (series 1..5)
     ctx.fillStyle   = COLORS.alpha(COLORS.red, .15); // transparent fill
*/
(function () {
  const css = getComputedStyle(document.documentElement);
  const get = (name, fallback) => (css.getPropertyValue("--" + name).trim() || fallback);

  const C = {
    ink: get("ink", "#111111"), red: get("red", "#E63946"), redHover: get("red-hover", "#CF2F3C"),
    redText: get("red-text", "#C62834"), tint: get("tint", "#FDECEE"),
    white: get("white", "#FFFFFF"), paper: get("paper", "#F2F3F5"), paper2: get("paper-2", "#FAFAFB"),
    line: get("line", "#D9DCE1"), soft: get("soft", "#9CA3AF"), grey: get("grey", "#6B7280"),
    charcoal: get("charcoal", "#3A3A3A"), onDark: get("on-dark", "#B8BCC4"),
    correct: get("correct", "#1F8A70"), info: get("info", "#2F6DB5"), warning: get("warning", "#C17A12"),
    axis: get("viz-axis", "#111111"), grid: get("viz-grid", "#D9DCE1"), label: get("viz-label", "#6B7280"),
  };
  // viz[1]..viz[5]; viz[0] is unused so the numbers match --viz-1 .. --viz-5
  C.viz = [null, get("viz-1", "#E63946"), get("viz-2", "#2F6DB5"), get("viz-3", "#1F8A70"),
           get("viz-4", "#C17A12"), get("viz-5", "#7B4FB8")];

  // "#E63946", 0.2  →  "rgba(230,57,70,0.2)"
  C.alpha = function (hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  window.COLORS = C;
})();
