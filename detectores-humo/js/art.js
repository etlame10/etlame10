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
  APP.widgets = { meter: meter, trace: trace };
})();
