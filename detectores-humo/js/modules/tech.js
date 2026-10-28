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


  /* Demostración guiada para explicar en clase. Cada paso fija los controles
   * y, si hace falta, sube el humo poco a poco hasta "density". */
  var DEMO = {
    optico: [
      { text: "En reposo, el LED emite luz, pero el laberinto impide que llegue al fotodiodo.", set: { type: "lenta", density: 0, sens: 5, mode: "disp" }, reset: true },
      { text: "Entra humo de un fuego lento. Las partículas desvían la luz hacia el fotodiodo y la señal sube.", set: { density: 70 } },
      { text: "Cuando la señal supera la línea roja (el umbral), el detector da la alarma.", set: {} },
      { text: "Ahora es vapor de la ducha. No es fuego, pero también desvía la luz: falsa alarma. Por eso no se pone junto al baño.", set: { type: "vapor", density: 75 }, reset: true },
      { text: "Si bajamos la sensibilidad hace falta más humo para que salte: menos falsas alarmas, pero ante un fuego real avisa más tarde.", set: { sens: 2 } }
    ],
    ionico: [
      { text: "La pequeña fuente radiactiva ioniza el aire entre las dos placas y circula una corriente muy pequeña.", set: { type: "llama", density: 0, sens: 5 }, reset: true },
      { text: "Entra humo de un fuego con llama. Las partículas atrapan iones y la corriente baja.", set: { density: 70 } },
      { text: "Cuando la corriente cae por debajo del umbral, da la alarma. Responde muy bien a las partículas pequeñas de las llamas.", set: {} },
      { text: "Con humo de fuego lento la corriente baja menos. Por eso cada tecnología va mejor con un tipo de fuego.", set: { type: "lenta", density: 70 }, reset: true },
      { text: "Importante: lleva material radiactivo. No se abre ni se tira a la basura normal; se sigue lo que diga el fabricante.", set: {} }
    ],
    haz: [
      { text: "Un emisor lanza un haz de luz hasta el receptor, de un lado a otro de la nave.", set: { type: "lenta", density: 0, sens: 5, strat: false, blocked: false }, reset: true },
      { text: "El humo tiene que subir hasta el haz, así que tarda un poco. Cuando lo cruza, al receptor le llega menos luz y, si baja lo suficiente: alarma.", set: { density: 90 }, dur: 15 },
      { text: "Estratificación: en techos altos el humo puede quedarse por debajo del haz y no llegar a él.", set: { strat: true, density: 70 }, reset: true },
      { text: "Si algo tapa el haz de golpe, como un palé levantado, no lo confunde con humo: indica avería.", set: { strat: false, blocked: true, density: 0 }, reset: true }
    ],
    aspiracion: [
      { text: "Un ventilador aspira el aire por un tubo con agujeros y lo lleva hasta una cámara de detección.", set: { type: "lenta", density: 0, sens: 8 }, reset: true },
      { text: "Aparece un poco de humo. Fíjate en que tarda en llegar a la cámara: es el retardo de transporte por el tubo.", set: { density: 35 } },
      { text: "Aunque el humo es poco denso, lo detecta. Por eso se usa en sitios críticos, como salas de ordenadores.", set: {} }
    ],
    multisensor: [
      { text: "Combina dos sensores: uno óptico de humo y otro de temperatura. Decide mirando los dos.", set: { type: "vapor", density: 0, sens: 5 }, reset: true },
      { text: "Vapor: la parte de humo lo nota, pero no hay calor. La lógica espera y no da alarma.", set: { density: 70 } },
      { text: "Fuego con llama: hay humo y además sube la temperatura. Las dos señales coinciden: alarma.", set: { type: "llama", density: 70 }, reset: true },
      { text: "Cada fabricante usa su propia lógica. Aquí se muestra una versión simplificada.", set: {} }
    ],
    termico: [
      { text: "Este NO detecta humo: mide la temperatura. Lo ponemos para comparar.", set: { type: "lenta", density: 0, sens: 5 }, reset: true },
      { text: "Fuego lento: mucho humo pero poco calor. No salta. Por eso no sustituye a un detector de humo en un dormitorio.", set: { density: 100 } },
      { text: "Fuego con llama: la temperatura sube y, al pasar el umbral, da la alarma.", set: { type: "llama", density: 100 }, reset: true },
      { text: "Con vapor no salta. Por eso a veces se usa en cocinas, donde uno de humo daría falsas alarmas.", set: { type: "vapor", density: 100 }, reset: true }
    ]
  };
  var DEMO_STEP_S = 9;

  var state = { tech: "optico", view: "sim" };
  var runner = null, keyHandler = null;
  document.addEventListener("keydown", function (e) { if (keyHandler) keyHandler(e); });

  function render(view) {
    state.tech = APP.store.get("tech:last", "optico");
    if (!APP.techById(state.tech)) state.tech = "optico";
    var tabs = h("div", { class: "tech-tabs", role: "tablist", "aria-label": "Tipo de detector" });
    APP.data.technologies.forEach(function (t) {
      tabs.appendChild(h("button", { role: "tab", "data-tech": t.id, "aria-selected": "false", text: t.name, onclick: function () { select(t.id); } }));
    });
    view.appendChild(h("div", { class: "tabs-bar" }, [tabs]));
    var body = h("div", { id: "tech-body", class: "wrap" });
    view.appendChild(body);
    view.appendChild(h("p", { class: "foot", text: "Representación didáctica: las animaciones explican la idea, no son medidas de ningún equipo ni sustituyen la prueba real que indique el fabricante. Nunca generes humo ni fuego para probar un detector." }));

    function select(id) {
      if (runner) { runner.stop(); runner = null; }
      keyHandler = null;
      APP.util.clear(body);
      tabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-tech") === id ? "true" : "false"); });
      state.tech = id;
      APP.store.set("tech:last", id);
      body.appendChild(techView(APP.techById(id)));
    }
    select(state.tech);
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

    /* Rampa de humo: sube o baja poco a poco hacia un objetivo */
    var ramp = null;
    function setDensity(v) {
      ctl.density = v; dens.value = Math.round(v / 5) * 5; densOut.textContent = Math.round(v) + " %";
    }
    function rampTo(v, speed) { ramp = { to: v, speed: speed || 30 }; changed(); }

    var densOut = h("output", { text: "0 %" });
    var dens = h("input", { type: "range", min: 0, max: 100, step: 5, value: 0, id: "ctl-density", "aria-label": "Cantidad de humo" });
    dens.addEventListener("input", function () { ramp = null; ctl.density = +dens.value; densOut.textContent = dens.value + " %"; changed(); });
    var sensOut = h("output", { text: "5 / 10" });
    var sens = h("input", { type: "range", min: 1, max: 10, step: 1, value: 5, id: "ctl-sens", "aria-label": "Sensibilidad" });
    sens.addEventListener("input", function () { ctl.sens = +sens.value; sensOut.textContent = sens.value + " / 10"; changed(); });

    var specific = h("div", { class: "row", style: "margin-top:12px" });
    var modeSeg = null, stratBtn = null, blockBtn = null;
    if (tech.sim === "optico") {
      modeSeg = h("div", { class: "seg", role: "group", "aria-label": "Variante óptica" });
      [["disp", "Luz dispersa"], ["obsc", "Oscurecimiento (luz transmitida)"]].forEach(function (m) {
        modeSeg.appendChild(h("button", { "data-mode": m[0], "aria-pressed": m[0] === ctl.mode ? "true" : "false", text: m[1], onclick: function () {
          ctl.mode = m[0]; changed();
          modeSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === ctl.mode ? "true" : "false"); });
        } }));
      });
      specific.appendChild(modeSeg);
    }
    if (tech.sim === "haz") {
      stratBtn = h("button", { class: "chip", id: "btn-strat", "aria-pressed": "false", text: "Estratificación", onclick: function () { ctl.strat = !ctl.strat; stratBtn.setAttribute("aria-pressed", String(ctl.strat)); changed(); } });
      blockBtn = h("button", { class: "chip", id: "btn-block", "aria-pressed": "false", text: "Levantar palé en el haz", onclick: function () { ctl.blocked = !ctl.blocked; blockBtn.setAttribute("aria-pressed", String(ctl.blocked)); changed(); } });
      specific.appendChild(stratBtn); specific.appendChild(blockBtn);
    }

    var pauseBtn = h("button", { class: "btn", id: "btn-pause", text: "Pausa", onclick: function () {
      ctl.paused = !ctl.paused; pauseBtn.textContent = ctl.paused ? "Reanudar" : "Pausa";
    } });
    function resetSim() {
      ramp = null; setDensity(0);
      scene.reset(); tr.reset(); alarm = false; changed();
    }
    var resetBtn = h("button", { class: "btn btn-ghost", id: "btn-reset", text: "Reiniciar", onclick: function () { stopDemo(); resetSim(); } });
    var growBtn = h("button", { class: "btn btn-fire", id: "btn-grow", text: "🔥 Fuego que crece", title: "El humo sube poco a poco desde cero", onclick: function () {
      stopDemo(); resetSim(); rampTo(100, 6);
    } });

    function syncControls() {
      paintType();
      sens.value = ctl.sens; sensOut.textContent = ctl.sens + " / 10";
      if (modeSeg) modeSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === ctl.mode ? "true" : "false"); });
      if (stratBtn) stratBtn.setAttribute("aria-pressed", String(ctl.strat));
      if (blockBtn) blockBtn.setAttribute("aria-pressed", String(ctl.blocked));
    }

    /* ---- Demostración guiada ---- */
    var steps = DEMO[tech.sim] || [];
    var demo = { on: false, i: 0, t: 0, auto: true };
    var demoText = h("p", { class: "demo-text", "aria-live": "polite" });
    var demoCount = h("span", { class: "demo-count" });
    var demoBar = h("i");
    var autoBtn = h("button", { class: "demo-btn", id: "demo-auto", title: "Avance automático", text: "❚❚", onclick: function () {
      demo.auto = !demo.auto; autoBtn.textContent = demo.auto ? "❚❚" : "▶"; demo.t = 0;
    } });
    var demoBox = h("div", { class: "demo-box", hidden: true }, [
      h("div", { class: "demo-top" }, [h("strong", { text: "Demostración" }), demoCount,
        h("span", { class: "demo-nav" }, [
          h("button", { class: "demo-btn", id: "demo-prev", title: "Paso anterior", text: "◀", onclick: function () { goStep(demo.i - 1); } }),
          autoBtn,
          h("button", { class: "demo-btn", id: "demo-next", title: "Paso siguiente", text: "▶▶", onclick: function () { goStep(demo.i + 1); } }),
          h("button", { class: "demo-btn", id: "demo-close", title: "Salir de la demostración", text: "✕", onclick: function () { stopDemo(); } })
        ])]),
      demoText,
      h("div", { class: "demo-progress" }, [demoBar])
    ]);
    var demoBtn = h("button", { class: "btn btn-primary", id: "btn-demo", text: "▶ Demostración", onclick: function () { startDemo(); } });

    function goStep(i) {
      if (i < 0) i = 0;
      if (i >= steps.length) { stopDemo(); APP.util.toast("Fin de la demostración"); return; }
      demo.i = i; demo.t = 0;
      var st = steps[i], set = st.set || {};
      if (st.reset) resetSim();
      ["type", "sens", "mode", "strat", "blocked"].forEach(function (k) { if (k in set) ctl[k] = set[k]; });
      if ("density" in set) { if (set.density < ctl.density) setDensity(set.density); rampTo(set.density, 25); }
      ctl.paused = false; pauseBtn.textContent = "Pausa";
      changed(); syncControls();
      demoText.textContent = st.text;
      demoCount.textContent = (i + 1) + " / " + steps.length;
    }
    function startDemo() {
      if (!steps.length) return;
      demo.on = true; demo.auto = true; autoBtn.textContent = "❚❚";
      demoBox.hidden = false; demoBtn.hidden = true;
      goStep(0);
    }
    function stopDemo() {
      if (!demo.on) return;
      demo.on = false; demoBox.hidden = true; demoBtn.hidden = false;
    }
    keyHandler = function (e) {
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!demo.on) { if (e.key === "d" || e.key === "D") { startDemo(); e.preventDefault(); } return; }
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { goStep(demo.i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { goStep(demo.i - 1); e.preventDefault(); }
      else if (e.key === "Escape") stopDemo();
    };

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

    var simTime = 0, lastChange = 0, alarm = false, simPanel = null;
    function changed() { lastChange = simTime; }

    runner = APP.util.loop(function (dt) {
      if (ctl.paused) return;
      simTime += dt;
      if (ramp) {
        var d = ramp.to - ctl.density, stepD = ramp.speed * dt;
        if (Math.abs(d) <= stepD) { setDensity(ramp.to); ramp = null; } else setDensity(ctl.density + (d > 0 ? stepD : -stepD));
        changed();
      }
      if (demo.on) {
        if (demo.auto) demo.t += dt;
        demoBar.style.width = Math.min(100, demo.t / (steps[demo.i].dur || DEMO_STEP_S) * 100) + "%";
        if (demo.auto && demo.t >= (steps[demo.i].dur || DEMO_STEP_S)) goStep(demo.i + 1);
      }
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
        simPanel.setAttribute("data-state", level);
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

    simPanel = h("section", { class: "panel stage-panel", "data-state": "ok" }, [
      h("div", { class: "stage-head" }, [h("h1", { text: tech.name }), h("div", { class: "row" }, [demoBtn, status])]),
      h("div", { class: "stage-wrap" }, [svg]),
      demoBox,
      legend,
      h("div", { class: "sim-readout" }, [h("div", null, [meter.el]), heatMeter ? h("div", null, [heatMeter.el]) : null]),
      tr.el,
      h("p", { class: "caption", text: "Gráfica: azul = magnitud medida" + (heatMeter ? ", naranja = temperatura" : "") + ". Línea roja discontinua = umbral de alarma." }),
      extra,
      logic ? logic.el : null
    ]);

    var ctlPanel = h("section", { class: "panel ctl-panel" }, [
      h("h2", { text: "Controles" }),
      h("div", { class: "control" }, [h("label", null, ["Tipo de humo"]), typeSeg, typeHint]),
      h("div", { class: "control" }, [h("label", { for: "ctl-density" }, ["Cantidad de humo", densOut]), dens]),
      h("div", { class: "control" }, [h("label", { for: "ctl-sens" }, ["Sensibilidad", sensOut]), sens]),
      specific.childNodes.length ? specific : null,
      h("div", { class: "row", style: "margin-top:14px" }, [growBtn, pauseBtn, resetBtn]),
      h("hr"),
      h("div", { class: "panel-title" }, [h("h3", { text: "Experimentos" }), taskCount]),
      taskList,
      h("button", { class: "btn btn-ghost btn-sm", id: "btn-reset-tasks", text: "Reiniciar experimentos", onclick: function () { done = {}; APP.store.set(doneKey, done); paintTasks(); paintCount(); } })
    ]);

    return h("div", null, [
      h("div", { class: "sim-grid" }, [simPanel, ctlPanel]),
      infoPanel(tech)
    ]);
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
    return h("details", { class: "panel info-panel", open: "" }, [
      h("summary", null, [h("h2", { text: "Cómo funciona" }), APP.scopeTag("general")]),
      h("p", { class: "small muted", style: "margin-top:8px", text: tech.scope }),
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

  APP.register({
    id: "tech",
    title: "¿Cómo detecta el humo?",
    render: render,
    destroy: function () { if (runner) { runner.stop(); runner = null; } }
  });
})();
