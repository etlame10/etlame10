/* Módulo D · Manual del detector (preparado para el documento real) */
(function () {
  "use strict";
  var h = APP.util.h;

  var BLOCK = {
    original: { label: "Texto original", cls: "mb-original" },
    traduccion: { label: "Traducción fiel", cls: "mb-traduccion" },
    explicacion: { label: "Explicación didáctica", cls: "mb-explicacion" },
    aviso: { label: "Advertencia del fabricante", cls: "mb-aviso" },
    dato: { label: "Dato técnico", cls: "mb-dato" },
    duda: { label: "Ilegible o ambiguo", cls: "mb-duda" },
    imagen: { label: "Imagen del manual", cls: "mb-original" }
  };
  var FILTERS = [
    { id: "all", label: "Todo" },
    { id: "traduccion", label: "Traducción fiel" },
    { id: "explicacion", label: "Explicaciones" },
    { id: "aviso", label: "Advertencias" },
    { id: "duda", label: "Dudas" }
  ];

  function renderBlock(b) {
    var d = BLOCK[b.type] || BLOCK.explicacion;
    var head = h("div", { class: "mb-type" }, [h("span", { text: d.label }), b.page ? h("span", { class: "muted", text: "pág. " + b.page }) : h("span")]);
    var body;
    if (b.type === "dato") body = h("p", null, [h("strong", { text: b.label + ": " }), b.value]);
    else if (b.type === "imagen") body = h("figure", { style: "margin:0" }, [h("img", { src: b.src, alt: b.caption || "Imagen del manual", style: "max-width:100%;height:auto" }), h("figcaption", { class: "caption", text: (b.caption || "") + (b.source ? " — Fuente: " + b.source : "") })]);
    else body = h("p", { style: "margin:0", text: b.text });
    return h("div", { class: "mblock " + d.cls, "data-btype": b.type }, [head, body]);
  }

  function viewer(manual) {
    var wrap = h("div");
    if (manual.demo) {
      wrap.appendChild(h("div", { class: "notice", style: "margin-bottom:12px" }, [h("span", null, [h("strong", { text: "EJEMPLO DE FORMATO. " }), "Este contenido no procede de ningún manual: solo sirve para ver cómo se mostrará el manual real."])]));
    }
    var dv = manual.device;
    wrap.appendChild(h("div", { class: "facts" }, [
      h("div", { class: "fact" }, [h("h4", { text: "Fabricante y modelo" }), h("p", { style: "margin:0", text: (dv.manufacturer || "—") + " · " + (dv.model || "—") })]),
      h("div", { class: "fact" }, [h("h4", { text: "Tipo de detector" }), h("p", { style: "margin:0", text: dv.type || "—" })]),
      h("div", { class: "fact" }, [h("h4", { text: "Idioma del original" }), h("p", { style: "margin:0", text: dv.language || "—" })]),
      h("div", { class: "fact" }, [h("h4", { text: "Documento" }), dv.file ? h("a", { href: dv.file, target: "_blank", rel: "noopener", text: "Abrir el PDF original" }) : h("p", { style: "margin:0", text: "—" })])
    ]));

    var filter = "all";
    var filt = h("div", { class: "seg", style: "margin:14px 0", role: "group", "aria-label": "Filtrar por tipo de contenido" });
    FILTERS.forEach(function (f) {
      filt.appendChild(h("button", { "data-filter": f.id, "aria-pressed": f.id === filter ? "true" : "false", text: f.label, onclick: function () {
        filter = f.id;
        filt.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-filter") === filter ? "true" : "false"); });
        paintSection();
      } }));
    });
    wrap.appendChild(filt);

    var tabs = h("div", { class: "tabs", role: "tablist" });
    var panel = h("div", { role: "tabpanel" });
    var current = manual.sections[0].id;
    manual.sections.forEach(function (sec) {
      tabs.appendChild(h("button", { role: "tab", "data-sec": sec.id, "aria-selected": sec.id === current ? "true" : "false", onclick: function () {
        current = sec.id;
        tabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-sec") === current ? "true" : "false"); });
        paintSection();
      } }, [sec.title, h("span", { class: "count", text: "(" + sec.blocks.length + ")" })]));
    });
    function paintSection() {
      APP.util.clear(panel);
      var sec = manual.sections.filter(function (x) { return x.id === current; })[0];
      var blocks = sec.blocks.filter(function (b) { return filter === "all" || b.type === filter; });
      if (!blocks.length) {
        panel.appendChild(h("div", { class: "empty-state" }, [h("p", { style: "margin:0", text: sec.blocks.length ? "No hay contenido de este tipo en esta sección." : "Sección pendiente: se completará con el manual original." })]));
        return;
      }
      blocks.forEach(function (b) { panel.appendChild(renderBlock(b)); });
    }
    wrap.appendChild(tabs);
    wrap.appendChild(panel);
    paintSection();
    return wrap;
  }

  function render(view) {
    var manual = APP.data.manual;
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo D" }),
      h("h1", { text: "Manual del detector" }),
      h("p", { text: "Aquí se integrará el manual original del detector que se use en clase: identificado, explicado en lenguaje sencillo y con la traducción fiel separada de las explicaciones." })
    ]));

    var box = h("div", { class: "panel" });
    view.appendChild(box);

    if (manual.loaded) {
      box.appendChild(viewer(manual));
    } else {
      box.appendChild(h("div", { class: "empty-state", id: "manual-empty" }, [
        h("h2", { text: "Pendiente del manual original" }),
        h("p", { text: "Todavía no se ha aportado el manual del detector. Para no inventar contenido, esta sección está vacía hasta tenerlo." }),
        h("button", { class: "btn", id: "manual-demo", text: "Ver cómo se mostrará (ejemplo de formato)", onclick: function () {
          APP.util.clear(demoBox);
          demoBox.appendChild(viewer(APP.data.manualDemo));
          demoBox.scrollIntoView({ behavior: "smooth", block: "start" });
        } })
      ]));
      var demoBox = h("div", { style: "margin-top:16px" });
      box.appendChild(demoBox);
    }

    var checks = [
      "Fabricante, modelo y referencia exactos",
      "Tipo de detector y principio de detección",
      "Normas o certificaciones que declara (copiadas tal cual)",
      "Alimentación: tipo de pila o tensión, consumo y duración declarada",
      "Instalación: dónde colocarlo y dónde no",
      "Emparejamiento o conexión (radio, línea, lazo)",
      "Procedimiento de prueba autorizado",
      "Significado de cada señal del LED y del zumbador",
      "Mantenimiento: limpieza, frecuencia de prueba y vida útil",
      "Solución de problemas",
      "Advertencias de seguridad y eliminación del aparato"
    ];
    var filled = function (id) {
      var sec = manual.sections.filter(function (x) { return x.id === id; })[0];
      return sec && sec.blocks.length > 0;
    };
    var map = ["identificacion", "identificacion", "identificacion", "alimentacion", "instalacion", "instalacion", "prueba", "senalizacion", "mantenimiento", "averias", "advertencias"];

    view.appendChild(h("div", { class: "grid grid-2", style: "margin-top:16px" }, [
      h("div", { class: "panel" }, [
        h("h3", { text: "Qué se extraerá del manual" }),
        h("ul", { class: "checklist" }, checks.map(function (c, i) { return h("li", { class: filled(map[i]) ? "ok" : "", text: c }); }))
      ]),
      h("div", { class: "panel" }, [
        h("h3", { text: "Cómo se diferenciará cada contenido" }),
        h("div", null, ["original", "traduccion", "explicacion", "aviso", "dato", "duda"].map(function (k) {
          var ex = { original: "El texto tal como aparece, con su número de página.", traduccion: "Traducción al español que respeta valores, unidades y advertencias.", explicacion: "Explicación propia en lenguaje sencillo. No sustituye al manual.", aviso: "Advertencias de seguridad del fabricante, traducidas fielmente.", dato: "Valores técnicos copiados sin redondear ni interpretar.", duda: "Lo que no se lee bien o admite varias interpretaciones." }[k];
          return h("div", { class: "mblock " + BLOCK[k].cls }, [h("div", { class: "mb-type" }, [h("span", { text: BLOCK[k].label })]), h("p", { style: "margin:0", class: "small", text: ex })]);
        })),
        h("p", { class: "small muted", text: "Instrucciones técnicas para integrarlo: archivo manual/README.md del proyecto." })
      ])
    ]));
  }

  APP.register({ id: "manual", title: "Manual del detector", render: render });
})();
