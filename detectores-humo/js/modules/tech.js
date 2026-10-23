/* Módulo B · ¿Cómo detecta el humo? */
(function () {
  "use strict";
  var h = APP.util.h, s = APP.util.s, TYPES = APP.data.smokeTypes;

  function threshold(sens) { return 88 - sens * 7; }

  /* Experimentos guiados: se marcan solos cuando se cumple la condición */
  var TASKS = {
    optico: [
      { t: "Provoca una alarma con humo de fuego lento.", ok: function (x) { return x.alarm && x.ctl.type === "lenta"; }, tip: "El humo visible dispersa mucha luz hacia el fotodiodo." },
      { t: "Prueba con fuego con llama al 50 % de humo. ¿Da alarma con la sensibilidad media?", ok: function (x) { return x.ctl.type === "llama" && x.ctl.density >= 45 && x.ctl.density <= 60 && x.stable > 6 && x.ctl.sens === 5; }, tip: "Las partículas pequeñas dispersan menos luz: la señal sube menos." },
      { t: "Consigue una falsa alarma con vapor.", ok: function (x) { return x.alarm && x.ctl.type === "vapor"; }, tip: "El vapor también dispersa la luz: por eso no se pone junto al baño o la cocina." },
      { t: "Cambia a «oscurecimiento» y observa que la luz recibida BAJA con el humo.", ok: function (x) { return x.ctl.mode === "obsc" && x.value < 60; }, tip: "En la variante de luz transmitida se mide la pérdida de luz." }
    ],
    ionico: [
      { t: "Provoca una alarma con un fuego con llama.", ok: function (x) { return x.alarm && x.ctl.type === "llama"; }, tip: "Las partículas pequeñas capturan muchos iones: la corriente cae." },
      { t: "Con fuego lento, observa cómo baja la corriente por debajo del 70 %.", ok: function (x) { return x.ctl.type === "lenta" && x.value < 70; }, tip: "También responde, pero con el mismo humo la caída es menor." },
      { t: "Pon la sensibilidad al mínimo y comprueba que el vapor al 60 % ya no da alarma.", ok: function (x) { return x.ctl.type === "vapor" && x.ctl.density >= 60 && x.ctl.sens <= 1 && !x.alarm && x.stable > 6; }, tip: "Menos sensibilidad = menos falsas alarmas, pero también avisa más tarde ante un fuego real." }
    ],
    haz: [
      { t: "Provoca una alarma con humo que llegue al haz.", ok: function (x) { return x.alarm; }, tip: "La señal recibida baja poco a poco: eso es lo que interpreta como humo." },
      { t: "Activa la estratificación con humo al 70 % o más y espera: ¿llega la alarma?", ok: function (x) { return x.ctl.strat && x.ctl.density >= 70 && !x.alarm && x.stable > 7; }, tip: "El humo se queda por debajo del haz. En techos altos esto se tiene en cuenta en el proyecto." },
      { t: "Levanta el palé hasta cortar el haz.", ok: function (x) { return x.fault; }, tip: "Un corte total y brusco no se parece al humo: la simulación lo muestra como avería, como hacen muchos equipos." }
    ],
    aspiracion: [
      { t: "Sube el humo desde 0 y mide el retardo de transporte.", ok: function (x) { return x.measured !== null && x.measured !== undefined; }, tip: "El aire tarda en recorrer el tubo hasta la cámara." },
      { t: "Con la sensibilidad al máximo, detecta un humo de 25 % o menos.", ok: function (x) { return x.alarm && x.ctl.density <= 25 && x.ctl.sens === 10; }, tip: "Estos equipos pueden trabajar con niveles muy sensibles, según su clase y su diseño." },
      { t: "Provoca una alarma con fuego lento.", ok: function (x) { return x.alarm && x.ctl.type === "lenta"; }, tip: "La cámara detecta las partículas que llegan por el tubo." }
    ],
    multisensor: [
      { t: "Provoca una alarma con un fuego con llama (humo + calor).", ok: function (x) { return x.alarm && x.ctl.type === "llama"; }, tip: "Las dos señales coinciden: la lógica confirma la alarma." },
      { t: "Pon vapor al 70 % con la sensibilidad media y observa que espera sin dar alarma.", ok: function (x) { return x.ctl.type === "vapor" && x.ctl.density >= 70 && x.ctl.sens === 5 && !x.alarm && x.stable > 6; }, tip: "Humo sin calor: la lógica didáctica espera a una segunda confirmación." },
      { t: "Consigue una alarma solo por humo (fuego lento muy denso).", ok: function (x) { return x.alarm && x.ctl.type === "lenta" && x.heat < 25; }, tip: "Con mucho humo, la lógica también da alarma aunque no haya calor." }
    ],
    termico: [
      { t: "Provoca una alarma con un fuego con llama.", ok: function (x) { return x.alarm && x.ctl.type === "llama"; }, tip: "Responde al calor, no al humo." },
      { t: "Pon fuego lento al 100 % y espera: ¿da alarma?", ok: function (x) { return x.ctl.type === "lenta" && x.ctl.density === 100 && !x.alarm && x.stable > 8; }, tip: "Un fuego lento puede producir mucho humo y poco calor: por eso un térmico no sustituye a uno de humo donde se duerme." },
      { t: "Pon vapor al 100 % y comprueba que no hay falsa alarma.", ok: function (x) { return x.ctl.type === "vapor" && x.ctl.density === 100 && !x.alarm && x.stable > 6; }, tip: "Por eso a veces se usa en cocinas." }
    ]
  };

  var state = { tech: "optico", view: "sim" };
  var runner = null;

  function render(view) {
    state.tech = APP.store.get("tech:last", "optico");
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo B" }),
      h("h1", { text: "¿Cómo detecta el humo?" }),
      h("p", { text: "Elige una tecnología, cambia el tipo de humo y la sensibilidad, y observa qué ocurre dentro del detector. Completa los experimentos para descubrir sus puntos fuertes y sus límites." })
    ]));

    var tabs = h("div", { class: "tech-tabs", role: "tablist", "aria-label": "Tecnologías" });
    APP.data.technologies.forEach(function (t) {
      tabs.appendChild(h("button", { role: "tab", "data-tech": t.id, "aria-selected": "false", text: t.name, onclick: function () { state.view = "sim"; select(t.id); } }));
    });
    tabs.appendChild(h("button", { role: "tab", "data-tech": "compare", "aria-selected": "false", text: "⇄ Comparar", onclick: function () { state.view = "compare"; select("compare"); } }));
    view.appendChild(tabs);
    var body = h("div", { id: "tech-body" });
    view.appendChild(body);

    function select(id) {
      if (runner) { runner.stop(); runner = null; }
      APP.util.clear(body);
      tabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-tech") === id ? "true" : "false"); });
      if (id === "compare") { body.appendChild(compareView()); return; }
      state.tech = id;
      APP.store.set("tech:last", id);
      body.appendChild(techView(APP.techById(id)));
    }
    select(state.view === "compare" ? "compare" : state.tech);
  }

  /* ---------- Vista de una tecnología ---------- */
  function techView(tech) {
    var ctl = { type: "lenta", density: 0, sens: 5, mode: "disp", strat: false, blocked: false, paused: false };
    var svg = s("svg", { class: "stage", viewBox: "0 0 600 320", role: "img", "aria-label": "Simulación animada: " + tech.name });
    var scene = APP.scenes[tech.sim](svg, ctl);

    var status = h("span", { class: "status", "data-level": "ok", text: "Reposo" });
    var meter = APP.widgets.meter("Señal", "%");
    var heatMeter = tech.sim === "multisensor" ? APP.widgets.meter("Subida de temperatura (escala didáctica)", "") : null;
    var tr = APP.widgets.trace(180);
    var extra = h("p", { class: "small muted", "aria-live": "polite" });
    var logic = tech.sim === "multisensor" ? logicPanel() : null;

    /* Controles */
    var typeSeg = h("div", { class: "seg", role: "group", "aria-label": "Tipo de humo" });
    var typeHint = h("p", { class: "small muted" });
    Object.keys(TYPES).forEach(function (k) {
      typeSeg.appendChild(h("button", { "data-type": k, "aria-pressed": k === ctl.type ? "true" : "false", text: TYPES[k].label, onclick: function () { ctl.type = k; changed(); paintType(); } }));
    });
    function paintType() {
      typeSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-type") === ctl.type ? "true" : "false"); });
      typeHint.textContent = TYPES[ctl.type].hint;
    }
    paintType();

    var densOut = h("output", { text: "0 %" });
    var dens = h("input", { type: "range", min: 0, max: 100, step: 5, value: 0, id: "ctl-density", "aria-label": "Cantidad de humo" });
    dens.addEventListener("input", function () { ctl.density = +dens.value; densOut.textContent = dens.value + " %"; changed(); });
    var sensOut = h("output", { text: "5 / 10" });
    var sens = h("input", { type: "range", min: 1, max: 10, step: 1, value: 5, id: "ctl-sens", "aria-label": "Sensibilidad" });
    sens.addEventListener("input", function () { ctl.sens = +sens.value; sensOut.textContent = sens.value + " / 10"; changed(); });

    var specific = h("div", { class: "row", style: "margin-top:12px" });
    if (tech.sim === "optico") {
      var modeSeg = h("div", { class: "seg", role: "group", "aria-label": "Variante óptica" });
      [["disp", "Luz dispersa"], ["obsc", "Oscurecimiento (luz transmitida)"]].forEach(function (m) {
        modeSeg.appendChild(h("button", { "data-mode": m[0], "aria-pressed": m[0] === ctl.mode ? "true" : "false", text: m[1], onclick: function () {
          ctl.mode = m[0]; changed();
          modeSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === ctl.mode ? "true" : "false"); });
        } }));
      });
      specific.appendChild(modeSeg);
    }
    if (tech.sim === "haz") {
      var stratBtn = h("button", { class: "chip", id: "btn-strat", "aria-pressed": "false", text: "Estratificación", onclick: function () { ctl.strat = !ctl.strat; stratBtn.setAttribute("aria-pressed", String(ctl.strat)); changed(); } });
      var blockBtn = h("button", { class: "chip", id: "btn-block", "aria-pressed": "false", text: "Levantar palé en el haz", onclick: function () { ctl.blocked = !ctl.blocked; blockBtn.setAttribute("aria-pressed", String(ctl.blocked)); changed(); } });
      specific.appendChild(stratBtn); specific.appendChild(blockBtn);
    }

    var pauseBtn = h("button", { class: "btn", id: "btn-pause", text: "Pausa", onclick: function () {
      ctl.paused = !ctl.paused; pauseBtn.textContent = ctl.paused ? "Reanudar" : "Pausa";
    } });
    var resetBtn = h("button", { class: "btn btn-ghost", id: "btn-reset", text: "Reiniciar", onclick: function () {
      ctl.density = 0; dens.value = 0; densOut.textContent = "0 %";
      scene.reset(); tr.reset(); alarm = false; changed();
    } });

    /* Experimentos */
    var tasks = TASKS[tech.sim] || [];
    var doneKey = "tasks:" + tech.id;
    var done = APP.store.get(doneKey, {});
    var taskList = h("ol", { class: "tasks" });
    function paintTasks() {
      APP.util.clear(taskList);
      tasks.forEach(function (tk, i) {
        taskList.appendChild(h("li", { class: done[i] ? "done" : "", "data-task": i }, [
          h("span", null, [tk.t, done[i] ? h("span", { class: "tip", text: "✓ " + tk.tip }) : null])
        ]));
      });
    }
    paintTasks();
    var taskCount = h("span", { class: "small muted" });
    function paintCount() { taskCount.textContent = Object.keys(done).length + " / " + tasks.length; }
    paintCount();

    var simTime = 0, lastChange = 0, alarm = false;
    function changed() { lastChange = simTime; }

    runner = APP.util.loop(function (dt) {
      if (ctl.paused) return;
      simTime += dt;
      var r = scene.step(dt, simTime);
      var T = threshold(ctl.sens);
      var level, label, effT = T;
      if (tech.sim === "multisensor") {
        /* Lógica didáctica: el calor hace más sensible la parte de humo */
        var heatOk = r.heat >= 25;
        effT = heatOk ? T * 0.6 : T;
        var smokeOk = r.detect >= effT;
        var strong = r.detect >= Math.min(97, T + 30), hot = r.heat >= 70;
        alarm = (smokeOk && heatOk) || strong || hot;
        logic.set(smokeOk, heatOk, strong, hot, alarm);
        heatMeter.set(r.heat, 25, heatOk);
        if (alarm) { level = "alarm"; label = "Alarma"; }
        else if (smokeOk) { level = "rise"; label = "Humo sin calor: esperando"; }
        else if (r.detect > T * 0.5) { level = "rise"; label = "Señal aumentando"; }
        else { level = "ok"; label = "Reposo"; }
      } else {
        if (r.fault) alarm = false;
        else if (!alarm && r.detect >= T) alarm = true;
        else if (alarm && r.detect < T - 6) alarm = false;
        if (r.fault) { level = "fault"; label = "Avería: haz bloqueado"; }
        else if (alarm) { level = "alarm"; label = "Alarma"; }
        else if (r.detect > T * 0.5) { level = "rise"; label = "Señal aumentando"; }
        else { level = "ok"; label = "Reposo"; }
      }
      if (status.getAttribute("data-level") !== level || status.textContent !== label) {
        if (level === "alarm" && status.getAttribute("data-level") !== "alarm") APP.util.beep(3100, 200);
        status.setAttribute("data-level", level);
        status.textContent = label;
      }
      var thrShown = r.invert ? 100 - effT : effT;
      meter.el.querySelector(".meter-head span").textContent = r.label;
      meter.set(r.value, thrShown, alarm);
      tr.push(r.value, thrShown, r.heat);
      extra.textContent = r.extra || "";

      var snapshot = { ctl: ctl, detect: r.detect, value: r.value, alarm: alarm, fault: !!r.fault, heat: r.heat || 0, stable: simTime - lastChange, measured: r.measured };
      var changedTasks = false;
      tasks.forEach(function (tk, i) {
        if (!done[i] && tk.ok(snapshot)) { done[i] = true; changedTasks = true; APP.util.toast("Experimento completado: " + tk.t); }
      });
      if (changedTasks) { APP.store.set(doneKey, done); paintTasks(); paintCount(); }
    });

    var legend = h("div", { class: "legend" }, [
      h("span", null, [h("i", { style: "background:var(--smoke-lenta)" }), "fuego lento"]),
      h("span", null, [h("i", { style: "background:var(--smoke-llama)" }), "fuego con llama"]),
      h("span", null, [h("i", { style: "background:var(--smoke-vapor)" }), "vapor / polvo"]),
      h("span", null, [h("i", { style: "background:var(--light-ray)" }), "luz"]),
      tech.sim === "ionico" ? h("span", null, [h("i", { style: "background:var(--accent)" }), "iones + / ", h("i", { style: "background:var(--violet)" }), "iones − / ", h("i", { style: "background:var(--led-off)" }), "iones frenados"]) : null
    ]);

    var left = h("div", { class: "panel" }, [
      h("div", { class: "panel-title" }, [h("h2", { text: tech.name }), h("div", { class: "row" }, [APP.scopeTag("didactico"), status])]),
      svg,
      legend,
      h("p", { class: "caption", text: "Esquema simplificado. Las escalas, los retardos y las respuestas son de un modelo didáctico, no medidas de ningún equipo." }),
      h("div", { class: "sim-readout" }, [h("div", null, [meter.el]), heatMeter ? h("div", null, [heatMeter.el]) : null]),
      h("div", { style: "margin-top:10px" }, [tr.el]),
      h("p", { class: "caption", text: "Gráfica: azul = magnitud medida" + (heatMeter ? ", naranja = temperatura" : "") + ". Línea roja discontinua = umbral de alarma." }),
      extra,
      logic ? logic.el : null,
      h("div", { class: "control" }, [h("label", null, ["Tipo de humo"]), typeSeg, typeHint]),
      h("div", { class: "control" }, [h("label", { for: "ctl-density" }, ["Cantidad de humo", densOut]), dens]),
      h("div", { class: "control" }, [h("label", { for: "ctl-sens" }, ["Sensibilidad (menos ← → más)", sensOut]), sens]),
      specific,
      h("div", { class: "row", style: "margin-top:12px" }, [pauseBtn, resetBtn])
    ]);

    var right = h("div", { class: "stack" }, [
      h("div", { class: "panel" }, [
        h("div", { class: "panel-title" }, [h("h3", { text: "Experimentos" }), taskCount]),
        taskList,
        h("button", { class: "btn btn-ghost", style: "margin-top:10px", text: "Reiniciar experimentos", onclick: function () { done = {}; APP.store.set(doneKey, done); paintTasks(); paintCount(); } })
      ]),
      infoPanel(tech)
    ]);

    return h("div", { class: "split" }, [left, right]);
  }

  function logicPanel() {
    function ind(label) {
      var dot = h("span", { class: "status", "data-level": "ok", text: label });
      return dot;
    }
    var a = ind("Humo ≥ umbral"), b = ind("Calor detectado"), c = ind("Humo muy alto"), e = ind("Calor muy alto"), d = ind("Decisión: alarma");
    var el = h("div", { class: "panel", style: "margin-top:10px;padding:12px" }, [
      h("div", { class: "row" }, [h("strong", { class: "small", text: "Lógica de decisión (simplificada):" }), APP.scopeTag("didactico")]),
      h("p", { class: "small muted", text: "Alarma si (humo ≥ umbral Y calor) O humo muy alto O calor muy alto. Si hay calor, el umbral de humo baja. Cada fabricante usa su propio algoritmo." }),
      h("div", { class: "row" }, [a, b, c, e, d])
    ]);
    function lit(x, on, lvl) { x.setAttribute("data-level", on ? lvl : "ok"); }
    return { el: el, set: function (sm, ht, st, hot, al) { lit(a, sm, "rise"); lit(b, ht, "rise"); lit(c, st, "rise"); lit(e, hot, "rise"); lit(d, al, "alarm"); } };
  }

  function infoPanel(tech) {
    function list(items) { return h("ul", null, items.map(function (i) { return h("li", { text: i }); })); }
    return h("div", { class: "panel" }, [
      h("div", { class: "row", style: "justify-content:space-between" }, [h("h3", { text: "Cómo funciona", style: "margin:0" }), APP.scopeTag("general")]),
      h("p", { class: "small muted", style: "margin-top:4px", text: tech.scope }),
      h("p", { text: tech.principle }),
      h("div", { class: "notice info", style: "margin-bottom:12px" }, [h("span", null, [h("strong", { text: "Con humo: " }), tech.withSmoke])]),
      h("div", { class: "facts" }, [
        h("div", { class: "fact" }, [h("h4", { text: "Componentes" }), list(tech.components)]),
        h("div", { class: "fact" }, [h("h4", { text: "Aplicaciones típicas" }), list(tech.uses)]),
        h("div", { class: "fact pro" }, [h("h4", { text: "Ventajas" }), list(tech.pros)]),
        h("div", { class: "fact con" }, [h("h4", { text: "Limitaciones" }), list(tech.cons)])
      ]),
      tech.safety ? h("div", { class: "safety", style: "margin-top:12px" }, [h("strong", { text: "Seguridad de la fuente radiactiva. " }), tech.safety]) : null,
      h("h4", { text: "Caso práctico", style: "margin-top:14px" }),
      h("p", { class: "small", text: tech.scenario }),
      h("p", { class: "small" }, [h("strong", { text: "Norma de producto: " }), tech.standard]),
      APP.sourcesBlock(tech.sources)
    ]);
  }

  /* ---------- Comparador ---------- */
  function compareView() {
    var picked = APP.store.get("compare", ["optico", "ionico", "multisensor"]);
    var wrap = h("div", { class: "panel" });
    var chips = h("div", { class: "row", role: "group", "aria-label": "Tecnologías a comparar" });
    var tableBox = h("div", { class: "table-wrap" });
    var bars = h("div");

    APP.data.technologies.forEach(function (t) {
      chips.appendChild(h("button", { class: "chip", "data-cmp": t.id, "aria-pressed": picked.indexOf(t.id) >= 0 ? "true" : "false", text: t.name, onclick: function () {
        var i = picked.indexOf(t.id);
        if (i >= 0) { if (picked.length > 1) picked.splice(i, 1); else APP.util.toast("Deja al menos una tecnología"); }
        else if (picked.length >= 4) APP.util.toast("Compara hasta 4 a la vez");
        else picked.push(t.id);
        APP.store.set("compare", picked);
        paint();
      } }));
    });

    function paint() {
      chips.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", picked.indexOf(b.getAttribute("data-cmp")) >= 0 ? "true" : "false"); });
      var techs = picked.map(APP.techById);
      var rows = [
        ["Familia", function (t) { return t.family; }],
        ["Dónde se usa", function (t) { return t.scope; }],
        ["Qué mide", function (t) { return t.short; }],
        ["Con humo", function (t) { return t.withSmoke; }],
        ["Ventajas", function (t) { return t.pros.join(" · "); }],
        ["Limitaciones", function (t) { return t.cons.join(" · "); }],
        ["Usos típicos", function (t) { return t.uses.join(" · "); }],
        ["Norma de producto", function (t) { return t.standard; }]
      ];
      APP.util.clear(tableBox);
      tableBox.appendChild(h("table", { class: "compare-table" }, [
        h("thead", null, h("tr", null, [h("th", { text: "" })].concat(techs.map(function (t) { return h("th", { text: t.name }); })))),
        h("tbody", null, rows.map(function (r) {
          return h("tr", null, [h("th", { scope: "row", text: r[0] })].concat(techs.map(function (t) { return h("td", { text: r[1](t) }); })));
        }))
      ]));

      APP.util.clear(bars);
      bars.appendChild(h("div", { class: "row", style: "justify-content:space-between;margin-top:18px" }, [h("h3", { text: "Tendencia de respuesta por tipo de humo", style: "margin:0" }), APP.scopeTag("didactico")]));
      bars.appendChild(h("p", { class: "small muted", text: "Es el mismo factor cualitativo que usa la simulación. Refleja tendencias de las fuentes (p. ej. USFA), no valores medidos. En «vapor/polvo», una barra alta significa más riesgo de falsa alarma, no una ventaja." }));
      var grid = h("div", { class: "grid grid-3" });
      Object.keys(TYPES).forEach(function (k) {
        grid.appendChild(h("div", { class: "fact" }, [h("h4", { text: TYPES[k].label })].concat(techs.map(function (t) {
          var v = Math.round((t.factors[k] || 0) * 100);
          var m = APP.widgets.meter(t.name, "");
          m.set(v, -10, k === "vapor" && v > 60);
          m.el.querySelector(".meter-head strong").textContent = v > 75 ? "alta" : v > 45 ? "media" : "baja";
          return m.el;
        }))));
      });
      bars.appendChild(grid);
    }
    paint();

    wrap.appendChild(h("div", { class: "panel-title" }, [h("h2", { text: "Comparador de tecnologías" }), h("span", { class: "small muted", text: "Elige de 1 a 4" })]));
    wrap.appendChild(chips);
    wrap.appendChild(h("div", { class: "notice", style: "margin:12px 0" }, [h("span", { text: "No hay una tecnología mejor en todos los casos. La elección depende del tipo de fuego esperado, el ambiente, la normativa aplicable y las especificaciones del fabricante." })]));
    wrap.appendChild(tableBox);
    wrap.appendChild(bars);
    wrap.appendChild(APP.sourcesBlock(["usfa", "en54-7", "en54-12", "en54-20", "en54-29", "en14604"]));
    return wrap;
  }

  APP.register({
    id: "tech",
    title: "¿Cómo detecta el humo?",
    render: render,
    destroy: function () { if (runner) { runner.stop(); runner = null; } }
  });
})();
