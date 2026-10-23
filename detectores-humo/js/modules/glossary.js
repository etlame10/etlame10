/* Módulo G · Glosario técnico */
(function () {
  "use strict";
  var h = APP.util.h;
  var MOD_NAMES = { lab: "Laboratorio", tech: "¿Cómo detecta?", sim: "Simulador", manual: "Manual", retos: "Retos" };

  function norm(t) { return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  /* Resalta la búsqueda sin usar innerHTML */
  function highlight(text, q) {
    if (!q) return [text];
    var n = norm(text), i = n.indexOf(q);
    if (i < 0) return [text];
    return [text.slice(0, i), h("mark", { text: text.slice(i, i + q.length) }), text.slice(i + q.length)];
  }

  function render(view) {
    var terms = APP.data.glossary.slice().sort(function (a, b) { return a.term.localeCompare(b.term, "es"); });
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo G" }),
      h("h1", { text: "Glosario técnico" }),
      h("p", { text: "Busca un término o pulsa una letra. Cada término tiene un ejemplo práctico y un enlace al módulo donde se practica." })
    ]));
    var input = h("input", { class: "search", type: "search", id: "gl-search", placeholder: "Buscar (p. ej. «sensibilidad»)", "aria-label": "Buscar en el glosario" });
    var alpha = h("div", { class: "alpha" });
    var count = h("p", { class: "small muted", "aria-live": "polite" });
    var list = h("div", { class: "gl-list" });
    var letter = null;
    var letters = terms.map(function (t) { return norm(t.term)[0].toUpperCase(); }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    ["Todas"].concat(letters).forEach(function (L) {
      alpha.appendChild(h("button", { class: "chip", "data-l": L, "aria-pressed": L === "Todas" ? "true" : "false", text: L, onclick: function () {
        letter = L === "Todas" ? null : L;
        alpha.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-l") === L ? "true" : "false"); });
        paint();
      } }));
    });
    input.addEventListener("input", paint);
    view.appendChild(h("div", { class: "panel" }, [input, alpha, count, list]));

    function paint() {
      var q = norm(input.value.trim());
      APP.util.clear(list);
      var shown = terms.filter(function (t) {
        if (letter && norm(t.term)[0].toUpperCase() !== letter) return false;
        return !q || norm(t.term + " " + t.def + " " + t.example).indexOf(q) >= 0;
      });
      count.textContent = shown.length + " término(s)";
      if (!shown.length) list.appendChild(h("div", { class: "empty-state" }, [h("p", { style: "margin:0", text: "No hay resultados. Prueba con otra palabra." })]));
      shown.forEach(function (t) {
        list.appendChild(h("article", { class: "panel gl-item", "data-term": t.term }, [
          APP.art.icon(t.icon),
          h("div", null, [
            h("h3", null, highlight(t.term, q)),
            h("p", null, highlight(t.def, q)),
            h("p", { class: "ex" }, [h("strong", { text: "Ejemplo: " })].concat(highlight(t.example, q))),
            t.module ? h("a", { class: "small", href: "#" + t.module, text: "Practicar en: " + (MOD_NAMES[t.module] || t.module) + " →" }) : null
          ])
        ]));
      });
    }
    paint();
  }

  APP.register({ id: "glosario", title: "Glosario", render: render });
})();
