/* Fuentes y referencias de la aplicación */
(function () {
  "use strict";
  var h = APP.util.h;

  function render(view) {
    var src = APP.data.sources;
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Referencias" }),
      h("h1", { text: "Fuentes y criterios" }),
      h("p", { text: "Todas las referencias que usa la aplicación, con lo que se ha podido consultar de cada una." })
    ]));
    view.appendChild(h("div", { class: "panel" }, [
      h("h2", { text: "Criterios de contenido" }),
      h("ul", null, [
        h("li", null, [APP.scopeTag("general"), " información válida para la mayoría de detectores de ese tipo."]),
        h("li", null, [APP.scopeTag("modelo"), " varía según el fabricante: hay que consultar el manual del modelo."]),
        h("li", null, [APP.scopeTag("algunos"), " no está presente en todos los detectores."]),
        h("li", null, [APP.scopeTag("didactico"), " simplificación para aprender. Las simulaciones no usan datos medidos."])
      ]),
      h("p", { class: "small muted", text: "Muchas normas (EN 54, EN 14604, UNE) son de pago: solo se ha consultado su ficha pública y no se citan sus valores técnicos. Las fuentes extranjeras se usan para explicar principios físicos, no como normativa española." })
    ]));
    var groups = {};
    Object.keys(src).forEach(function (k) { (groups[src[k].kind] = groups[src[k].kind] || []).push(src[k]); });
    Object.keys(groups).sort().forEach(function (g) {
      view.appendChild(h("div", { class: "panel" }, [
        h("h3", { text: g }),
        h("ul", { class: "review-list" }, groups[g].map(function (x) {
          return h("li", null, [h("a", { href: x.url, target: "_blank", rel: "noopener", text: x.title }), h("br"), h("span", { class: "small muted", text: x.publisher + ". " + x.access })]);
        }))
      ]));
    });
    view.appendChild(h("p", { class: "small muted", style: "margin-top:16px", text: "Los enlaces externos necesitan conexión a internet. El resto de la aplicación funciona sin conexión." }));
  }

  APP.register({ id: "fuentes", title: "Fuentes", render: render });
})();
