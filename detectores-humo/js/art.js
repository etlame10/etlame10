/*
 * Ilustraciones SVG esquemáticas y widgets de medida reutilizables.
 * Todas son dibujos propios simplificados, no fotos de productos.
 */
(function () {
  "use strict";
  var s = APP.util.s, h = APP.util.h;

  /* ---------- Widgets ---------- */

  /* Barra de medida con umbral. invert: la alarma ocurre por debajo del umbral */
  function meter(label, unit) {
    var fill = h("div", { class: "meter-fill" });
    var thr = h("div", { class: "meter-thr" });
    var val = h("strong", { text: "0" });
    var el = h("div", { class: "meter" }, [
      h("div", { class: "meter-head" }, [h("span", { text: label }), val]),
      h("div", { class: "meter-bar", role: "meter", "aria-label": label, "aria-valuemin": "0", "aria-valuemax": "100" }, [fill, thr])
    ]);
    return {
      el: el,
      set: function (v, threshold, alarm) {
        fill.style.width = APP.util.clamp(v, 0, 100) + "%";
        fill.classList.toggle("alarm", !!alarm);
        thr.style.left = APP.util.clamp(threshold, 0, 100) + "%";
        val.textContent = Math.round(v) + (unit || "");
        el.querySelector(".meter-bar").setAttribute("aria-valuenow", String(Math.round(v)));
      }
    };
  }

  /* Gráfica temporal de la señal (osciloscopio sencillo) */
  function trace(n) {
    var W = 300, H = 90, N = n || 150;
    var svg = s("svg", { class: "trace", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": "Evolución de la señal en el tiempo" });
    [0.25, 0.5, 0.75].forEach(function (f) { svg.appendChild(s("line", { class: "grid-line", x1: 0, x2: W, y1: H * f, y2: H * f })); });
    var thr = s("line", { class: "thr", x1: 0, x2: W, y1: 0, y2: 0 });
    var line = s("polyline", { class: "sig", points: "" });
    var line2 = s("polyline", { class: "sig2", points: "" });
    svg.appendChild(thr); svg.appendChild(line); svg.appendChild(line2);
    var data = [], data2 = [];
    function pts(arr) {
      return arr.map(function (v, i) { return (i * W / (N - 1)).toFixed(1) + "," + (H - v / 100 * (H - 4) - 2).toFixed(1); }).join(" ");
    }
    return {
      el: svg,
      push: function (v, threshold, v2) {
        data.push(v); if (data.length > N) data.shift();
        if (v2 !== undefined) { data2.push(v2); if (data2.length > N) data2.shift(); }
        line.setAttribute("points", pts(data));
        line2.setAttribute("points", pts(data2));
        var y = H - threshold / 100 * (H - 4) - 2;
        thr.setAttribute("y1", y); thr.setAttribute("y2", y);
      },
      reset: function () { data = []; data2 = []; line.setAttribute("points", ""); line2.setAttribute("points", ""); }
    };
  }

  /* ---------- Ilustraciones de la galería (viewBox 240x150) ---------- */
  function frame(children, label) {
    return s("svg", { viewBox: "0 0 240 150", class: "stage", role: "img", "aria-label": label || "Ilustración esquemática" }, children);
  }
  function pointDetector(extra) {
    return [
      s("rect", { x: 0, y: 0, width: 240, height: 22, class: "fl" }),
      s("text", { x: 8, y: 15, class: "lbl", text: "techo" }),
      s("rect", { x: 70, y: 22, width: 100, height: 10, rx: 3, class: "fl" }),
      s("path", { d: "M60 32 h120 v18 q0 34 -60 34 q-60 0 -60 -34z", class: "fl" }),
      s("g", null, [0, 1, 2, 3, 4, 5, 6].map(function (i) { return s("rect", { x: 72 + i * 14, y: 52, width: 8, height: 6, rx: 1, class: "dk" }); })),
      s("circle", { cx: 150, cy: 68, r: 3.5, class: "bad-fill" })
    ].concat(extra || []);
  }
  var ART = {
    point: function () { return frame(pointDetector([s("text", { x: 120, y: 112, "text-anchor": "middle", class: "lbl", text: "ranuras de entrada de humo" })]), "Detector puntual óptico"); },
    ionic: function () {
      return frame(pointDetector([
        s("g", { transform: "translate(104 96)" }, [
          s("polygon", { points: "16,0 32,28 0,28", fill: "#f5c400", stroke: "#222", "stroke-width": 1.5 }),
          s("circle", { cx: 16, cy: 18, r: 3, fill: "#222" }),
          s("path", { d: "M16 18 l-6 -6 a8 8 0 0 1 12 0z M16 18 l8 2 a8 8 0 0 1 -6 6z M16 18 l-2 8 a8 8 0 0 1 -6 -6z", fill: "#222" })
        ]),
        s("text", { x: 150, y: 116, class: "lbl", text: "etiqueta" })
      ]), "Detector iónico con etiqueta de radiactividad");
    },
    beam: function () {
      return frame([
        s("rect", { x: 0, y: 0, width: 12, height: 150, class: "fl" }),
        s("rect", { x: 228, y: 0, width: 12, height: 150, class: "fl" }),
        s("rect", { x: 12, y: 30, width: 36, height: 28, rx: 4, class: "fl" }),
        s("circle", { cx: 44, cy: 44, r: 4, class: "glow" }),
        s("rect", { x: 212, y: 28, width: 16, height: 32, class: "dk" }),
        s("path", { d: "M214 32 l10 6 -10 6z M214 46 l10 6 -10 6z", fill: "var(--svg-stroke)" }),
        s("line", { x1: 48, y1: 44, x2: 212, y2: 44, class: "beam" }),
        s("text", { x: 14, y: 76, class: "lbl", text: "emisor/receptor" }),
        s("text", { x: 226, y: 76, "text-anchor": "end", class: "lbl", text: "reflector" }),
        s("rect", { x: 12, y: 130, width: 216, height: 20, class: "fl" })
      ], "Detector de haz con reflector");
    },
    asd: function () {
      return frame([
        s("rect", { x: 0, y: 0, width: 240, height: 18, class: "fl" }),
        s("path", { d: "M40 70 V30 H230", class: "pipe" }),
        s("g", null, [80, 120, 160, 200].map(function (x) { return s("circle", { cx: x, cy: 35, r: 2.5, fill: "var(--svg-dark)" }); })),
        s("rect", { x: 14, y: 70, width: 56, height: 64, rx: 5, class: "fl" }),
        s("rect", { x: 22, y: 80, width: 40, height: 14, rx: 2, class: "dk" }),
        s("circle", { cx: 30, cy: 110, r: 4, class: "ok-fill" }),
        s("circle", { cx: 44, cy: 110, r: 4, fill: "var(--led-off)" }),
        s("text", { x: 80, y: 104, class: "lbl", text: "unidad de aspiración" }),
        s("text", { x: 120, y: 52, class: "lbl", text: "tubo con orificios" })
      ], "Equipo de aspiración con tubería");
    },
    multi: function () {
      return frame(pointDetector([
        s("rect", { x: 112, y: 80, width: 16, height: 12, rx: 2, class: "dk" }),
        s("line", { x1: 120, y1: 92, x2: 120, y2: 104, class: "st" }),
        s("circle", { cx: 120, cy: 106, r: 4, fill: "var(--warn)" }),
        s("text", { x: 132, y: 112, class: "lbl", text: "termistor" })
      ]), "Detector multisensor");
    },
    heat: function () {
      return frame([
        s("rect", { x: 0, y: 0, width: 240, height: 22, class: "fl" }),
        s("rect", { x: 70, y: 22, width: 100, height: 10, rx: 3, class: "fl" }),
        s("path", { d: "M70 32 h100 v12 q0 24 -50 24 q-50 0 -50 -24z", class: "fl" }),
        s("path", { d: "M104 66 h32 l-6 18 h-20z", class: "fl" }),
        s("circle", { cx: 120, cy: 92, r: 6, fill: "var(--warn)" }),
        s("text", { x: 120, y: 122, "text-anchor": "middle", class: "lbl", text: "termistor expuesto, sin cámara de humo" })
      ], "Detector térmico");
    },
    duct: function () {
      return frame([
        s("rect", { x: 0, y: 80, width: 240, height: 50, class: "fl" }),
        s("text", { x: 8, y: 124, class: "lbl", text: "conducto → aire" }),
        s("rect", { x: 80, y: 30, width: 80, height: 44, rx: 4, class: "fl" }),
        s("circle", { cx: 120, cy: 50, r: 12, class: "fl" }),
        s("line", { x1: 92, y1: 74, x2: 92, y2: 112, class: "st", "stroke-width": 5 }),
        s("line", { x1: 148, y1: 74, x2: 148, y2: 96, class: "st", "stroke-width": 5 }),
        s("text", { x: 170, y: 52, class: "lbl", text: "carcasa" }),
        s("text", { x: 170, y: 68, class: "lbl", text: "tubos" })
      ], "Detector en carcasa de conducto");
    },
    wireless: function () {
      return frame(pointDetector([
        s("path", { d: "M186 46 a16 16 0 0 1 0 22 M194 40 a26 26 0 0 1 0 34 M202 34 a36 36 0 0 1 0 46", class: "st", "stroke-width": 2 }),
        s("text", { x: 182, y: 100, class: "lbl", text: "radio" })
      ]), "Detector inalámbrico");
    }
  };

  /* ---------- Iconos del glosario (viewBox 64x64) ---------- */
  var ICONS = {
    detector: '<path class="fl" d="M12 20h40v6q0 16-20 16t-20-16z"/><circle cx="40" cy="32" r="2.5" class="bad-fill"/>',
    panel: '<rect class="fl" x="12" y="12" width="40" height="40" rx="4"/><rect class="dk" x="18" y="18" width="28" height="10"/><circle cx="22" cy="38" r="3" class="bad-fill"/><circle cx="32" cy="38" r="3" class="ok-fill"/>',
    optic: '<circle class="fl" cx="32" cy="32" r="22"/><rect class="dk" x="12" y="28" width="8" height="8"/><line class="ray" x1="20" y1="32" x2="48" y2="32"/><circle cx="34" cy="30" r="3" fill="#888"/><line class="ray" x1="34" y1="30" x2="32" y2="50"/><rect class="dk" x="28" y="48" width="8" height="6"/>',
    ion: '<rect class="fl" x="14" y="14" width="36" height="6"/><rect class="fl" x="14" y="44" width="36" height="6"/><text x="22" y="36" class="lbl-strong">+</text><text x="38" y="36" class="lbl-strong">−</text>',
    chamber: '<circle class="fl" cx="32" cy="32" r="22"/><g class="dk">' + [0,1,2,3,4,5,6,7].map(function (i) { var a = i * Math.PI / 4; return '<rect x="' + (30 + Math.cos(a) * 17).toFixed(1) + '" y="' + (30 + Math.sin(a) * 17).toFixed(1) + '" width="5" height="5"/>'; }).join("") + '</g>',
    buzzer: '<circle class="fl" cx="26" cy="32" r="12"/><path class="st" d="M42 24a12 12 0 0 1 0 16M48 18a20 20 0 0 1 0 28"/>',
    meter: '<rect class="fl" x="8" y="28" width="48" height="10" rx="5"/><rect x="8" y="28" width="30" height="10" rx="5" fill="var(--accent)"/><line x1="44" y1="22" x2="44" y2="44" stroke="var(--bad)" stroke-width="2" stroke-dasharray="3 2"/>',
    warn: '<path class="fl" d="M32 10l24 42H8z"/><text x="29" y="46" class="lbl-strong" font-size="20">!</text>',
    tool: '<path class="st" d="M18 46l18-18M38 18a8 8 0 1 0 8 8l6-6-8-8z" stroke-width="4"/>',
    multi: '<path class="fl" d="M12 20h40v6q0 16-20 16t-20-16z"/><circle cx="32" cy="48" r="4" fill="var(--warn)"/>',
    heat: '<rect class="fl" x="28" y="10" width="8" height="34" rx="4"/><circle cx="32" cy="48" r="8" fill="var(--warn)"/>',
    layers: '<rect class="fl" x="8" y="8" width="48" height="48"/><rect x="8" y="26" width="48" height="10" fill="#9aa3ad" opacity=".7"/><line x1="8" y1="14" x2="56" y2="14" class="ray"/>'
  };
  function icon(name) {
    var svg = s("svg", { viewBox: "0 0 64 64", class: "stage", "aria-hidden": "true" });
    svg.innerHTML = ICONS[name] || ICONS.detector;
    return svg;
  }

  APP.widgets = { meter: meter, trace: trace };
  APP.art = { gallery: ART, icon: icon };
})();
