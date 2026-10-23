/* Inicio: presentación, mapa de módulos y distinciones clave */
(function () {
  "use strict";
  var h = APP.util.h;

  var MODS = [
    { id: "lab", k: "A", t: "Laboratorio del detector", d: "Explora sus componentes y provoca estados: reposo, humo, alarma, prueba y batería baja." },
    { id: "tech", k: "B", t: "¿Cómo detecta el humo?", d: "Seis simulaciones animadas: óptico, iónico, haz, aspiración, multisensor y térmico." },
    { id: "sim", k: "C", t: "Simulador de situaciones", d: "Cocina, dormitorio, nave, sala técnica y conducto: decide y razona." },
    { id: "manual", k: "D", t: "Manual del detector", d: "Visor preparado para integrar el manual real del fabricante." },
    { id: "galeria", k: "E", t: "Identificación", d: "Aprende a reconocer cada tipo de detector a simple vista." },
    { id: "retos", k: "F", t: "Retos y minijuegos", d: "Cuestionario, emparejar, identificar, casos y reto final." },
    { id: "glosario", k: "G", t: "Glosario técnico", d: "Términos clave con definición y ejemplo práctico." }
  ];

  var SENSORS = [
    { n: "Detector de humo", d: "Detecta partículas de combustión en el aire.", sys: "Detección de incendios", smoke: true },
    { n: "Detector térmico", d: "Detecta temperatura alta o una subida rápida de temperatura.", sys: "Detección de incendios", smoke: false },
    { n: "Detector de gas", d: "Detecta gases combustibles (p. ej. gas natural o butano).", sys: "Seguridad técnica", smoke: false },
    { n: "Detector de CO", d: "Detecta monóxido de carbono, un gas tóxico invisible.", sys: "Seguridad de personas", smoke: false },
    { n: "Detector PIR", d: "Detecta el movimiento de personas por su radiación infrarroja.", sys: "Intrusión (antirrobo)", smoke: false },
    { n: "Contacto magnético", d: "Detecta la apertura de una puerta o ventana.", sys: "Intrusión (antirrobo)", smoke: false }
  ];

  function render(view) {
    var visited = APP.progress.visited();
    var art = APP.art.gallery.point();
    art.setAttribute("aria-label", "Ilustración esquemática de un detector de humo");

    view.appendChild(h("section", { class: "hero" }, [
      h("div", null, [
        h("div", { class: "page-head", style: "margin:0" }, [h("div", { class: "kicker", text: "Proyecto 1 · Instalaciones de telecomunicaciones y seguridad" })]),
        h("h1", { text: "Detectores de humo: aprende experimentando" }),
        h("p", { text: "Una aplicación para entender cómo funciona un detector de humo, qué tecnologías existen, cuándo conviene cada una y cómo se instalan y mantienen. Cada concepto tiene algo que tocar, simular o resolver." }),
        h("div", { class: "row" }, [
          h("a", { class: "btn btn-primary", href: "#lab", text: "Empezar por el laboratorio" }),
          h("a", { class: "btn", href: "#tech", text: "Ver las tecnologías" })
        ])
      ]),
      h("div", null, [art, h("p", { class: "caption", text: "Ilustración esquemática, no un producto real." })])
    ]));

    view.appendChild(h("h2", { text: "Módulos", style: "margin-top:24px" }));
    view.appendChild(h("div", { class: "grid grid-3" }, MODS.map(function (m) {
      return h("a", { class: "mod-card", href: "#" + m.id }, [
        h("span", { class: "k", text: "Módulo " + m.k }),
        h("strong", { text: m.t }),
        h("p", { text: m.d }),
        visited[m.id] ? h("span", { class: "done", text: "✓ Visitado" }) : null
      ]);
    })));

    /* ¿Es un detector de humo? */
    var sortBox = h("div", { class: "grid grid-3" });
    var sortScore = h("p", { class: "small muted", "aria-live": "polite" });
    var answered = 0, correct = 0;
    APP.util.shuffle(SENSORS).forEach(function (sn) {
      var card = h("div", { class: "fact" });
      var res = h("div", { "aria-live": "polite" });
      function ans(yes) {
        answered++;
        var ok = yes === sn.smoke;
        if (ok) correct++;
        APP.util.clear(res);
        res.appendChild(h("div", { class: "feedback " + (ok ? "ok" : "bad") }, [h("strong", { text: (ok ? "Correcto. " : "No. ") + (sn.smoke ? "Sí detecta humo." : "No detecta humo.") }), h("span", { text: sn.d + " Sistema: " + sn.sys + "." })]));
        card.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
        sortScore.textContent = "Aciertos: " + correct + " / " + answered + (answered === SENSORS.length ? " · ¡Completado!" : "");
      }
      card.appendChild(h("h4", { text: sn.n }));
      card.appendChild(h("div", { class: "row" }, [
        h("button", { class: "btn", text: "Detecta humo", onclick: function () { ans(true); } }),
        h("button", { class: "btn", text: "No detecta humo", onclick: function () { ans(false); } })
      ]));
      card.appendChild(res);
      sortBox.appendChild(card);
    });
    view.appendChild(h("div", { class: "panel", style: "margin-top:24px" }, [
      h("div", { class: "panel-title" }, [h("h2", { text: "Calentamiento: ¿detecta humo o no?" }), sortScore]),
      h("p", { class: "muted", text: "En una instalación de seguridad hay muchos detectores distintos. Antes de empezar, clasifica estos." }),
      sortBox
    ]));

    /* Autónomo vs radio vs central */
    view.appendChild(h("div", { class: "panel" }, [
      h("h2", { text: "Tres formas de instalar un detector de humo" }),
      h("div", { class: "table-wrap" }, [h("table", { class: "compare-table" }, [
        h("thead", null, h("tr", null, ["", "Autónomo", "Inalámbrico a central de alarma", "Conectado a central de incendios"].map(function (x) { return h("th", { text: x }); }))),
        h("tbody", null, [
          ["Quién da el aviso", "Su propio zumbador", "Según el modelo, el detector y/o la central", "La central (sirenas del edificio)"],
          ["Alimentación", "Pila", "Pila", "Desde la central (línea o lazo)"],
          ["Ejemplo de uso", "Vivienda", "Vivienda o pequeño local con kit de alarma", "Colegio, oficina, nave, hospital"],
          ["Norma de producto (referencia)", "EN 14604", "Comprobar en su documentación", "EN 54 (p. ej. EN 54-7)"],
          ["Diseño e instalación en España", "Lo que indique el fabricante y la normativa aplicable", "Lo que indique el fabricante", "RIPCI y UNE 23007-14"]
        ].map(function (r) { return h("tr", null, [h("th", { scope: "row", text: r[0] })].concat(r.slice(1).map(function (c) { return h("td", { text: c }); }))); }))
      ])]),
      h("p", { class: "small muted", style: "margin-top:10px", text: "Un sistema antirrobo (intrusión) y un sistema de detección de incendios son sistemas distintos, aunque algunos kits integren detectores de humo." }),
      APP.sourcesBlock(["en14604", "en54-7", "ripci-apv"])
    ]));

    view.appendChild(h("div", { class: "notice", style: "margin-top:16px" }, [h("span", { text: "Seguridad: nunca provoques humo, fuego ni uses aerosoles para probar un detector, salvo con el procedimiento y los medios que autorice su fabricante. Esta aplicación es una representación educativa y no sustituye una prueba física." })]));
  }

  APP.register({ id: "inicio", title: "Inicio", render: render });
})();
