/* Módulo C · Simulador de situaciones: escenarios y decisiones razonadas */
(function () {
  "use strict";
  var h = APP.util.h, s = APP.util.s;
  var VERDICT = { ok: "Adecuada", cond: "Posible con condiciones", bad: "Poco adecuada" };
  var POINTS = { ok: 2, cond: 1, bad: 0 };

  /* Ilustraciones de cada escenario (viewBox 600x260) */
  function sceneArt(kind, chosenTech) {
    var svg = s("svg", { class: "stage", viewBox: "0 0 600 260", role: "img", "aria-label": "Ilustración del escenario" });
    var add = function (el) { svg.appendChild(el); return el; };
    add(s("rect", { x: 0, y: 0, width: 600, height: 20, class: "fl" }));
    add(s("line", { x1: 0, y1: 240, x2: 600, y2: 240, class: "st" }));
    var smokeX = 300, smokeY = 200, smokeKind = "lenta";
    if (kind === "cocina") {
      add(s("rect", { x: 220, y: 170, width: 180, height: 70, class: "fl" }));
      add(s("rect", { x: 240, y: 160, width: 50, height: 12, rx: 2, class: "dk" }));
      add(s("rect", { x: 320, y: 140, width: 56, height: 30, rx: 4, class: "fl" }));
      add(s("rect", { x: 230, y: 30, width: 160, height: 40, class: "fl" }));
      add(s("text", { x: 310, y: 55, "text-anchor": "middle", class: "lbl", text: "campana" }));
      add(s("text", { x: 310, y: 210, "text-anchor": "middle", class: "lbl", text: "fogones" }));
      smokeX = 348; smokeY = 135; smokeKind = "vapor";
    } else if (kind === "dormitorio") {
      add(s("rect", { x: 80, y: 180, width: 200, height: 40, rx: 6, class: "fl" }));
      add(s("rect", { x: 80, y: 160, width: 50, height: 22, rx: 6, class: "fl" }));
      add(s("rect", { x: 440, y: 40, width: 8, height: 200, class: "fl" }));
      add(s("text", { x: 180, y: 236, "text-anchor": "middle", class: "lbl", text: "dormitorio" }));
      add(s("text", { x: 520, y: 236, "text-anchor": "middle", class: "lbl", text: "pasillo" }));
      add(s("rect", { x: 340, y: 210, width: 30, height: 18, rx: 3, class: "dk" }));
      add(s("text", { x: 355, y: 204, "text-anchor": "middle", class: "lbl", text: "cargador" }));
      smokeX = 355; smokeY = 205;
    } else if (kind === "nave") {
      for (var i = 0; i < 4; i++) {
        add(s("rect", { x: 60 + i * 130, y: 60, width: 90, height: 180, class: "st" }));
        [100, 140, 180, 220].forEach(function (y) { add(s("line", { x1: 60 + i * 130, x2: 150 + i * 130, y1: y, y2: y, class: "st" })); });
      }
      add(s("text", { x: 300, y: 40, "text-anchor": "middle", class: "lbl", text: "techo muy alto" }));
      smokeX = 300; smokeY = 220;
    } else if (kind === "cpd") {
      for (var r = 0; r < 5; r++) {
        add(s("rect", { x: 60 + r * 100, y: 80, width: 60, height: 160, class: "dk" }));
        for (var k = 0; k < 7; k++) add(s("circle", { cx: 70 + r * 100, cy: 95 + k * 20, r: 2, class: k % 3 ? "ok-fill" : "bad-fill" }));
      }
      add(s("path", { d: "M20 50 h560", class: "st", "stroke-dasharray": "6 6" }));
      add(s("text", { x: 300, y: 44, "text-anchor": "middle", class: "lbl", text: "flujo de climatización →" }));
      smokeX = 290; smokeY = 150;
    } else if (kind === "conducto") {
      add(s("rect", { x: 0, y: 90, width: 600, height: 70, class: "fl" }));
      add(s("text", { x: 20, y: 130, class: "lbl", text: "conducto de aire →" }));
      add(s("rect", { x: 250, y: 40, width: 80, height: 46, rx: 4, class: "fl" }));
      add(s("line", { x1: 268, y1: 86, x2: 268, y2: 150, class: "st", "stroke-width": 5 }));
      add(s("line", { x1: 312, y1: 86, x2: 312, y2: 120, class: "st", "stroke-width": 5 }));
      smokeX = 100; smokeY = 125;
    }
    var g = add(s("g", { class: "scene-smoke " + (kind === "conducto" || kind === "cpd" ? "drift" : "") }));
    for (var j = 0; j < 9; j++) {
      g.appendChild(s("circle", { cx: smokeX + (j % 3 - 1) * 8, cy: smokeY, r: 5 + (j % 3), class: "p-" + smokeKind, style: "animation-delay:" + (j * 0.45).toFixed(2) + "s" }));
    }
    if (chosenTech) {
      var t = APP.techById(chosenTech);
      var gx = kind === "conducto" ? 290 : 470, gy = kind === "conducto" ? 30 : 22;
      add(s("g", { transform: "translate(" + gx + " " + gy + ")" }, [
        s("path", { d: "M-22 0 h44 v6 q0 12 -22 12 q-22 0 -22 -12z", class: "fl", style: "stroke:var(--accent);stroke-width:3" }),
        s("text", { x: 0, y: 34, "text-anchor": "middle", class: "lbl-strong", text: t ? t.name : "" })
      ]));
    }
    return svg;
  }

  function render(view) {
    var results = APP.store.get("sim:results", {});
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo C" }),
      h("h1", { text: "Simulador de situaciones" }),
      h("p", { text: "Elige un lugar, analiza sus condiciones y decide qué detector usarías. Cada opción se explica: lo importante es el razonamiento, no acertar a la primera." })
    ]));
    view.appendChild(h("div", { class: "notice", style: "margin-bottom:16px" }, [h("span", { text: "Aquí no se dan tiempos ni distancias de detección: dependen de la norma de diseño aplicable (en España, el RIPCI y la UNE 23007-14 para sistemas con central), del fabricante y del proyecto." })]));

    var picker = h("div", { class: "scenario-pick", role: "group", "aria-label": "Escenarios" });
    var stage = h("div");
    view.appendChild(picker);
    view.appendChild(stage);

    function paintPicker(activeId) {
      APP.util.clear(picker);
      APP.data.scenarios.forEach(function (sc) {
        var r = results[sc.id];
        picker.appendChild(h("button", { "data-scn": sc.id, "aria-pressed": sc.id === activeId ? "true" : "false", onclick: function () { open(sc.id); } }, [
          h("strong", { text: sc.title }),
          r ? h("span", { class: "done-mark", text: "✓ " + r.score + " / " + r.total + " puntos" }) : h("span", { class: "small muted", style: "display:block", text: "Sin resolver" })
        ]));
      });
    }

    function open(id) {
      var sc = APP.data.scenarios.filter(function (x) { return x.id === id; })[0];
      paintPicker(id);
      APP.store.set("sim:last", id);
      var stepIdx = 0, score = 0, chosenTech = null, answers = [];
      APP.util.clear(stage);
      var artBox = h("div");
      var qBox = h("div");
      var panel = h("div", { class: "split" }, [
        h("div", { class: "panel" }, [
          h("div", { class: "panel-title" }, [h("h2", { text: sc.title }), APP.scopeTag("didactico")]),
          artBox,
          h("p", { style: "margin-top:12px", text: sc.context }),
          h("h3", { text: "Condiciones del lugar" }),
          h("ul", { class: "factor-list" }, sc.factors.map(function (f) { return h("li", { text: f }); }))
        ]),
        h("div", { class: "panel" }, [qBox])
      ]);
      stage.appendChild(panel);
      artBox.appendChild(sceneArt(sc.scene, null));

      function step() {
        APP.util.clear(qBox);
        var st = sc.steps[stepIdx];
        var stepper = h("div", { class: "stepper" }, sc.steps.map(function (_, i) { return h("span", { class: i <= stepIdx ? "on" : "" }); }).concat([h("span", { class: "" })]));
        qBox.appendChild(stepper);
        qBox.appendChild(h("p", { class: "small muted", text: "Decisión " + (stepIdx + 1) + " de " + sc.steps.length }));
        qBox.appendChild(h("h3", { text: st.q }));
        var opts = h("div", { class: "options" });
        var nextBtn = h("button", { class: "btn btn-primary", id: "scn-next", disabled: true, text: stepIdx < sc.steps.length - 1 ? "Siguiente decisión" : "Ver resumen", onclick: function () {
          stepIdx++;
          if (stepIdx < sc.steps.length) step(); else summary();
        } });
        st.options.forEach(function (o, i) {
          var b = h("button", { class: "option", "data-opt": i, onclick: function () { choose(i); } }, [h("span", { text: o.label })]);
          opts.appendChild(b);
        });
        function choose(i) {
          var o = st.options[i];
          score += POINTS[o.verdict];
          answers.push({ q: st.q, label: o.label, verdict: o.verdict });
          if (o.tech && stepIdx === 0) { chosenTech = o.tech; APP.util.clear(artBox); artBox.appendChild(sceneArt(sc.scene, o.tech)); }
          Array.prototype.forEach.call(opts.children, function (b, j) {
            var oo = st.options[j];
            b.disabled = true;
            b.classList.add("v-" + oo.verdict);
            if (j === i) b.classList.add("chosen");
            APP.util.clear(b);
            b.appendChild(h("span", { class: "verdict", text: VERDICT[oo.verdict] + (j === i ? " · tu elección" : "") }));
            b.appendChild(h("strong", { text: oo.label }));
            b.appendChild(h("span", { class: "why", text: oo.why }));
          });
          if (o.tech && APP.techById(o.tech)) {
            qBox.appendChild(h("p", { class: "small", style: "margin-top:10px" }, [
              "¿Quieres verlo funcionar? ",
              h("a", { href: "#tech", text: "Prueba «" + APP.techById(o.tech).name + "» en el Módulo B", onclick: function () { APP.store.set("tech:last", o.tech); } })
            ]));
          }
          nextBtn.disabled = false;
          nextBtn.focus();
        }
        qBox.appendChild(opts);
        qBox.appendChild(h("div", { class: "row", style: "margin-top:14px" }, [nextBtn]));
      }

      function summary() {
        var total = sc.steps.length * 2;
        var prev = results[sc.id];
        if (!prev || score >= prev.score) { results[sc.id] = { score: score, total: total }; APP.store.set("sim:results", results); }
        paintPicker(sc.id);
        APP.util.clear(qBox);
        qBox.appendChild(h("h3", { text: "Resumen del escenario" }));
        qBox.appendChild(h("p", null, [h("span", { class: "result-big", text: score + " / " + total }), " puntos"]));
        qBox.appendChild(h("p", { class: "small muted", text: "Adecuada = 2 · Con condiciones = 1 · Poco adecuada = 0" }));
        qBox.appendChild(h("ul", { class: "review-list" }, answers.map(function (a) {
          return h("li", null, [h("span", { class: a.verdict === "ok" ? "r-ok" : a.verdict === "bad" ? "r-bad" : "", text: VERDICT[a.verdict] + ": " }), a.label]);
        })));
        qBox.appendChild(h("div", { class: "state-explain", style: "margin:12px 0" }, [h("strong", { text: "Idea clave. " }), sc.takeaway]));
        qBox.appendChild(h("h4", { text: "En una instalación real también decide:" }));
        qBox.appendChild(h("ul", { class: "small" }, sc.realFactors.map(function (f) { return h("li", { text: f }); })));
        var nextSc = APP.data.scenarios[(APP.data.scenarios.indexOf(sc) + 1) % APP.data.scenarios.length];
        qBox.appendChild(h("div", { class: "row" }, [
          h("button", { class: "btn", id: "scn-retry", text: "Repetir escenario", onclick: function () { open(sc.id); } }),
          h("button", { class: "btn btn-primary", id: "scn-other", text: "Siguiente: " + nextSc.title, onclick: function () { open(nextSc.id); } })
        ]));
        qBox.appendChild(APP.sourcesBlock(sc.id === "cpd" ? ["en54-20", "xtralis"] : sc.id === "nave" ? ["en54-12", "ripci-apv"] : sc.id === "dormitorio" ? ["usfa", "en14604"] : sc.id === "conducto" ? ["ripci-apv"] : [], "Fuentes relacionadas"));
      }
      step();
    }

    paintPicker(null);
    open(APP.store.get("sim:last", APP.data.scenarios[0].id));
  }

  APP.register({ id: "sim", title: "Simulador de situaciones", render: render });
})();
