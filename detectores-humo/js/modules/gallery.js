/* Módulo E · Identificación de detectores */
(function () {
  "use strict";
  var h = APP.util.h;

  function render(view) {
    var items = APP.data.gallery;
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo E" }),
      h("h1", { text: "Identificación de detectores" }),
      h("p", { text: "Aprende a reconocer cada tipo por su forma, su montaje y sus marcas. Filtra por tecnología, abre una ficha y prueba el reto de identificación." })
    ]));
    view.appendChild(h("div", { class: "notice", style: "margin-bottom:16px" }, [h("span", { text: "Las imágenes son ilustraciones esquemáticas propias, no fotos de productos. Las fotos reales se añadirán solo con fuente y permiso de uso verificables." })]));

    var filter = "all";
    var chips = h("div", { class: "row", role: "group", "aria-label": "Filtrar por tecnología", style: "margin-bottom:14px" });
    var techs = ["all"].concat(items.map(function (i) { return i.tech; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    techs.forEach(function (t) {
      chips.appendChild(h("button", { class: "chip", "data-f": t, "aria-pressed": t === filter ? "true" : "false", text: t === "all" ? "Todos" : APP.techById(t).name, onclick: function () { filter = t; paint(); } }));
    });
    var grid = h("div", { class: "gallery" });
    view.appendChild(chips);
    view.appendChild(grid);

    var dlg = h("dialog", { class: "modal", "aria-labelledby": "dlg-title" });
    view.appendChild(dlg);

    function art(it) {
      var box = h("div", { class: "g-art" });
      if (it.photo && it.photoCredit && it.photoLicense) {
        box.appendChild(h("img", { src: it.photo, alt: it.name, style: "width:100%;display:block" }));
        box.appendChild(h("span", { class: "tag tag-general art-label", text: "Foto: " + it.photoCredit }));
      } else {
        box.appendChild(APP.art.gallery[it.art]());
        box.appendChild(h("span", { class: "tag tag-didactic art-label", text: "Ilustración esquemática" }));
      }
      return box;
    }

    function paint() {
      chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === filter ? "true" : "false"); });
      APP.util.clear(grid);
      items.filter(function (i) { return filter === "all" || i.tech === filter; }).forEach(function (it) {
        grid.appendChild(h("article", { class: "g-card", "data-item": it.id }, [
          art(it),
          h("div", { class: "g-body" }, [
            h("h3", { text: it.name }),
            h("span", { class: "small muted", text: it.context }),
            h("ul", null, it.recognize.slice(0, 2).map(function (r) { return h("li", { text: r }); })),
            h("button", { class: "btn", text: "Ver ficha", onclick: function () { openCard(it); } })
          ])
        ]));
      });
    }

    function openCard(it) {
      var t = APP.techById(it.tech);
      APP.util.clear(dlg);
      dlg.appendChild(h("div", { class: "modal-head" }, [
        h("h2", { id: "dlg-title", style: "margin:0", text: it.name }),
        h("button", { class: "icon-btn", "aria-label": "Cerrar", text: "✕", onclick: function () { dlg.close(); } })
      ]));
      dlg.appendChild(h("div", { class: "modal-body" }, [
        h("div", { class: "split" }, [
          art(it),
          h("div", null, [
            h("p", null, [h("strong", { text: "Tecnología: " }), t.name]),
            h("p", null, [h("strong", { text: "Principio: " }), t.short]),
            h("p", null, [h("strong", { text: "Dónde se encuentra: " }), it.context])
          ])
        ]),
        h("div", { class: "facts", style: "margin-top:12px" }, [
          h("div", { class: "fact" }, [h("h4", { text: "Cómo reconocerlo" }), h("ul", null, it.recognize.map(function (r) { return h("li", { text: r }); }))]),
          h("div", { class: "fact" }, [h("h4", { text: "Características" }), h("ul", null, it.features.map(function (r) { return h("li", { text: r }); }))])
        ]),
        h("p", { class: "small", style: "margin-top:12px" }, [h("a", { href: "#tech", text: "Ver cómo funciona en el Módulo B →", onclick: function () { APP.store.set("tech:last", it.tech); dlg.close(); } })]),
        APP.sourcesBlock(it.refs, "Documentación de referencia")
      ]));
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    }
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

    paint();

    /* Reto: ¿qué detector es por su descripción visual? */
    var quizBox = h("div", { "aria-live": "polite" });
    var qScore = 0, qDone = 0, pool = [];
    function nextQ() {
      APP.util.clear(quizBox);
      if (!pool.length) pool = APP.util.shuffle(items);
      var it = pool.pop();
      var clue = APP.util.shuffle(it.recognize)[0];
      var opts = APP.util.shuffle([it].concat(APP.util.shuffle(items.filter(function (x) { return x.id !== it.id; })).slice(0, 3)));
      quizBox.appendChild(h("p", { class: "state-explain" }, [h("strong", { text: "Pista: " }), clue]));
      var row = h("div", { class: "options", style: "margin-top:10px" });
      opts.forEach(function (o) {
        row.appendChild(h("button", { class: "option", "data-gq": o.id === it.id ? "ok" : "no", text: o.name, onclick: function () {
          qDone++;
          if (o.id === it.id) qScore++;
          Array.prototype.forEach.call(row.children, function (b, j) { b.disabled = true; if (opts[j].id === it.id) b.classList.add("v-ok"); else if (opts[j].id === o.id) b.classList.add("v-bad"); });
          quizBox.appendChild(h("p", { class: "small", style: "margin-top:10px" }, [h("strong", { text: "Aciertos: " + qScore + " / " + qDone + ". " }), "Otra pista de este detector: " + it.recognize.filter(function (r) { return r !== clue; })[0]]));
          quizBox.appendChild(h("button", { class: "btn btn-primary", id: "gq-next", text: "Otra pista", onclick: nextQ }));
        } }));
      });
      quizBox.appendChild(row);
    }
    view.appendChild(h("div", { class: "panel", style: "margin-top:20px" }, [h("h2", { text: "Reto rápido: ¿qué detector es?" }), quizBox]));
    nextQ();
  }

  APP.register({ id: "galeria", title: "Identificación", render: render });
})();
