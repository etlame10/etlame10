/* Módulo A · Laboratorio interactivo: detector genérico, componentes y estados */
(function () {
  "use strict";
  var h = APP.util.h, s = APP.util.s, rand = APP.util.rand;

  var TYPES = {
    autonomo: { label: "Autónomo a pilas", short: "Funciona solo: sensor, pila y zumbador en la misma carcasa." },
    radio: { label: "Inalámbrico (central por radio)", short: "Detector con radio que avisa a una central, como en los kits de alarma por radiofrecuencia." },
    central: { label: "Cableado a central de incendios", short: "Detector de un sistema de detección de incendios: la central indica la zona y activa las sirenas." }
  };

  /* scope por tipo: general | modelo | algunos | na  (na = no aplica) */
  var PARTS = [
    { id: "camara", n: 1, name: "Cámara de detección", x: 300, y: 104,
      scope: { autonomo: "general", radio: "general", central: "general" },
      what: "Cámara oscura con laberinto. Dentro están el LED emisor y el fotodiodo (en un detector óptico).",
      why: "Deja entrar el humo pero no la luz exterior. Es donde se «mide» el humo.",
      note: { all: "El polvo y los insectos en la cámara pueden alterar la medida: por eso hay que limpiarla y mantenerla según el manual." } },
    { id: "entradas", n: 2, name: "Entradas de humo y malla", x: 168, y: 138,
      scope: { autonomo: "general", radio: "general", central: "general" },
      what: "Ranuras en la carcasa y una malla fina alrededor de la cámara.",
      why: "Permiten que el aire con humo llegue a la cámara y frenan la entrada de insectos.",
      note: { all: "No se deben tapar ni pintar. Durante obras con polvo, se sigue el procedimiento del mantenedor." } },
    { id: "led", n: 3, name: "LED indicador", x: 372, y: 150,
      scope: { autonomo: "general", radio: "general", central: "general" },
      what: "Luz pequeña visible desde abajo.",
      why: "Muestra el estado del detector: funcionamiento normal, alarma o avería.",
      note: { all: "El patrón de parpadeo (color, frecuencia) lo define cada fabricante. El de esta simulación es solo ilustrativo." } },
    { id: "test", n: 4, name: "Pulsador de prueba", x: 334, y: 176,
      scope: { autonomo: "general", radio: "general", central: "algunos" },
      what: "Botón para comprobar el aviso.",
      why: "Permite comprobar que la electrónica y el aviso funcionan. Lo que comprueba exactamente depende del modelo.",
      note: { central: "En sistemas con central, la prueba suele hacerla la empresa mantenedora con su procedimiento y sus equipos.", all: "Haz la prueba como diga el manual. Nunca uses fuego ni humo de un cigarrillo." } },
    { id: "zumbador", n: 5, name: "Zumbador (sirena)", x: 196, y: 102,
      scope: { autonomo: "general", radio: "modelo", central: "algunos" },
      what: "Transductor piezoeléctrico que produce el pitido de alarma.",
      why: "En un autónomo es el único aviso: tiene que despertar a quien duerme.",
      note: { radio: "Muchos detectores por radio pitan y además avisan a la central; compruébalo en el manual.", central: "Normalmente no lleva: las sirenas del edificio las activa la central. Algunos modelos tienen una base con sirena." } },
    { id: "bateria", n: 6, name: "Pila o alimentación", x: 410, y: 92,
      scope: { autonomo: "general", radio: "general", central: "na" },
      what: "Pila o batería (en algunos modelos, de larga duración y no sustituible).",
      why: "Da energía al detector. Cuando se agota, el detector avisa de batería baja.",
      note: { all: "Tipo de pila, duración y aviso de batería baja: según el modelo.", central: "No lleva pila: se alimenta desde la central a través de la línea o el lazo." } },
    { id: "base", n: 7, name: "Base de montaje", x: 252, y: 40,
      scope: { autonomo: "general", radio: "general", central: "general" },
      what: "Pieza fija al techo donde encaja el detector.",
      why: "Permite desmontar el detector para mantenimiento sin desatornillar la base.",
      note: { central: "Aloja los bornes de conexión de la línea o el lazo.", all: "La forma de fijación (giro, clip, tornillos) depende del modelo." } },
    { id: "conexion", n: 8, name: "Elementos de conexión", x: 440, y: 58,
      scope: { autonomo: "algunos", radio: "modelo", central: "general" },
      what: "Según el tipo: bornes de la base, módulo de radio y antena, o conexión de interconexión.",
      why: "Comunican el detector con la central o con otros detectores.",
      note: { autonomo: "Algunos autónomos se interconectan entre sí por cable o por radio; muchos no tienen ninguna conexión.", radio: "Módulo de radio. La banda (p. ej. 433 MHz en el kit OWSOO) la indica el fabricante. Se empareja con la central.", central: "Bornes en la base: el detector se conecta a la línea (convencional) o al lazo (direccionable) de la central." } },
    { id: "pcb", n: 9, name: "Circuito electrónico", x: 330, y: 64,
      scope: { autonomo: "general", radio: "general", central: "general" },
      what: "Placa con el microcontrolador o el circuito de comparación.",
      why: "Lee la señal del fotodiodo, la compara con el umbral y decide alarma, avería o reposo.",
      note: { all: "El umbral y los algoritmos los fija el fabricante." } }
  ];

  var STATE_INFO = {
    normal: { level: "ok", label: "Reposo", text: "Sin humo. El detector vigila la señal de la cámara. El LED hace un destello breve de vez en cuando (patrón ilustrativo)." },
    humo: { level: "rise", label: "Humo presente", text: "El humo entra por las ranuras y llega a la cámara. La señal sube, pero todavía no supera el umbral de alarma." },
    alarma: { level: "alarm", label: "Alarma", text: "La señal ha superado el umbral." },
    prueba: { level: "test", label: "Prueba", text: "Se ha pulsado el botón de prueba. El detector simula una alarma durante unos segundos. Lo que comprueba exactamente depende del modelo." },
    bateria: { level: "fault", label: "Batería baja / avería", text: "" }
  };

  var loopH = null, timers = [];

  function render(view) {
    var st = {
      type: APP.store.get("lab:type", "autonomo"),
      state: "normal", smoke: 0, part: null, panelLatched: false, t: 0, ledT: 0, chirpT: 0, testT: 0
    };
    var THR = 60;

    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo A" }),
      h("h1", { text: "Laboratorio del detector" }),
      h("p", { text: "Explora un detector óptico genérico por dentro. Pulsa los números para ver cada componente, cambia el tipo de instalación y provoca los distintos estados." })
    ]));
    view.appendChild(h("div", { class: "notice", style: "margin-bottom:16px" }, [h("span", { text: "Representación educativa de un detector genérico, no de un modelo concreto. La simulación no sustituye la prueba real, que debe hacerse siempre según el procedimiento del fabricante." })]));

    /* --- selector de tipo --- */
    var typeSeg = h("div", { class: "seg", role: "group", "aria-label": "Tipo de instalación" });
    Object.keys(TYPES).forEach(function (k) {
      typeSeg.appendChild(h("button", { "data-dtype": k, "aria-pressed": "false", text: TYPES[k].label, onclick: function () { setType(k); } }));
    });
    var typeHint = h("p", { class: "small muted", style: "margin:6px 0 0" });

    /* --- SVG --- */
    var svg = s("svg", { class: "stage", viewBox: "0 0 600 340", role: "img", "aria-label": "Corte esquemático de un detector de humo óptico genérico" });
    buildDetector(svg);
    var smokeLayer = s("g"); svg.appendChild(smokeLayer);
    var smokeParts = [];
    var hsLayer = s("g"); svg.appendChild(hsLayer);
    var hsEls = {};
    PARTS.forEach(function (p) {
      var g = s("g", { class: "hotspot", tabindex: "0", role: "button", "aria-label": p.n + ". " + p.name, "data-part": p.id, transform: "translate(" + p.x + " " + p.y + ")" }, [
        s("circle", { class: "hs-ring", r: 10 }),
        s("circle", { class: "hs", r: 10 }),
        s("text", { x: 0, y: 4, "text-anchor": "middle", text: String(p.n) })
      ]);
      g.addEventListener("click", function (e) { e.stopPropagation(); selectPart(p.id); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPart(p.id); } });
      hsLayer.appendChild(g);
      hsEls[p.id] = g;
    });
    var hsToggle = h("button", { class: "chip", "aria-pressed": "true", text: "Mostrar números", onclick: function () {
      var on = hsToggle.getAttribute("aria-pressed") !== "true";
      hsToggle.setAttribute("aria-pressed", String(on));
      hsLayer.setAttribute("display", on ? "inline" : "none");
    } });

    /* --- lista de piezas e info --- */
    var partList = h("ul", { class: "part-list" });
    var partBtns = {};
    PARTS.forEach(function (p) {
      var b = h("button", { "data-part": p.id, "aria-pressed": "false", onclick: function () { selectPart(p.id); } }, [
        h("span", { class: "row", style: "gap:8px;flex-wrap:nowrap" }, [h("span", { class: "num", text: String(p.n) }), h("span", { text: p.name })]),
        h("span", { class: "pl-tag" })
      ]);
      partBtns[p.id] = b;
      partList.appendChild(h("li", null, b));
    });
    var partInfo = h("div", { class: "part-info", "aria-live": "polite" });

    /* --- estados --- */
    var status = h("span", { class: "status", "data-level": "ok", text: "Reposo" });
    var explain = h("div", { class: "state-explain", "data-level": "ok" });
    var smokeMeter = APP.widgets.meter("Señal de humo en la cámara (didáctica)", "%");
    var actions = h("div", { class: "row" });
    var log = h("ul", { class: "event-log", "aria-label": "Registro de eventos" });

    var btn = {
      humo: h("button", { class: "btn", id: "lab-smoke", text: "Introducir humo (simulado)", onclick: function () { go("humo"); } }),
      ventilar: h("button", { class: "btn", id: "lab-vent", text: "Ventilar", onclick: function () { st.venting = true; logEvent("Se ventila el local: el humo empieza a salir"); } }),
      prueba: h("button", { class: "btn", id: "lab-test", text: "Pulsar botón de prueba", onclick: function () { pressTest(); } }),
      bateria: h("button", { class: "btn", id: "lab-batt", text: "Simular batería baja / avería", onclick: function () { go("bateria"); } }),
      pila: h("button", { class: "btn btn-primary", id: "lab-fix", text: "Cambiar pila (simulado)", onclick: function () { logEvent("Pila sustituida"); go("normal"); } }),
      rearme: h("button", { class: "btn btn-primary", id: "lab-reset-panel", text: "Rearmar la central", onclick: function () {
        if (st.smoke > THR - 10) { APP.util.toast("Sigue habiendo humo: la central volvería a entrar en alarma"); return; }
        st.panelLatched = false; logEvent("Central rearmada"); go("normal");
      } }),
      reiniciar: h("button", { class: "btn btn-ghost", id: "lab-restart", text: "Reiniciar", onclick: function () { st.smoke = 0; st.venting = false; st.panelLatched = false; clearSmoke(); go("normal"); APP.util.clear(log); logEvent("Simulación reiniciada"); } })
    };

    var left = h("div", { class: "panel" }, [
      h("div", { class: "panel-title" }, [h("h2", { text: "Detector genérico (corte)" }), h("div", { class: "row" }, [APP.scopeTag("didactico"), status])]),
      h("div", { class: "control", style: "margin-top:0" }, [h("label", null, ["Tipo de instalación"]), typeSeg, typeHint]),
      h("div", { style: "margin-top:12px" }, [svg]),
      h("div", { class: "row", style: "margin-top:8px;justify-content:space-between" }, [hsToggle, h("span", { class: "small muted", text: "También puedes pulsar el botón de prueba (4) en el dibujo." })]),
      h("div", { style: "margin-top:12px" }, [smokeMeter.el]),
      h("div", { style: "margin-top:12px" }, [explain]),
      h("div", { style: "margin-top:12px" }, [actions])
    ]);
    var right = h("div", { class: "stack" }, [
      h("div", { class: "panel" }, [h("h3", { text: "Componentes" }), partList]),
      h("div", { class: "panel" }, [partInfo]),
      h("div", { class: "panel" }, [h("h3", { text: "Registro de eventos" }), log]),
      h("div", { class: "panel" }, [
        h("h3", { text: "No confundir" }),
        h("ul", { class: "small" }, [
          h("li", null, [h("strong", { text: "Detector de humo ≠ detector de gas o de CO: " }), "estos miden gases, no partículas de humo."]),
          h("li", null, [h("strong", { text: "Detector de humo ≠ térmico: " }), "el térmico mide temperatura."]),
          h("li", null, [h("strong", { text: "Detector de humo ≠ PIR: " }), "el PIR detecta personas en movimiento en una alarma antirrobo."]),
          h("li", null, [h("strong", { text: "Central de incendios ≠ central antirrobo: " }), "si un detector de humo se conecta a una central de alarma, hay que comprobar en su documentación para qué está diseñado y certificado el sistema."])
        ])
      ])
    ]);
    view.appendChild(h("div", { class: "split" }, [left, right]));

    svg.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-press='test']");
      if (t) pressTest();
    });

    /* ---------- lógica ---------- */
    function logEvent(msg) {
      var m = Math.floor(st.t / 60), sec = Math.floor(st.t % 60);
      var stamp = (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
      log.insertBefore(h("li", null, [h("b", { text: stamp }), " " + msg]), log.firstChild);
      while (log.children.length > 30) log.removeChild(log.lastChild);
    }

    function scopeOf(p) { return p.scope[st.type]; }

    function setType(k) {
      st.type = k;
      APP.store.set("lab:type", k);
      typeSeg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-dtype") === k ? "true" : "false"); });
      typeHint.textContent = TYPES[k].short;
      PARTS.forEach(function (p) {
        var sc = scopeOf(p);
        hsEls[p.id].classList.toggle("na", sc === "na");
        partBtns[p.id].classList.toggle("na", sc === "na");
        var tagBox = partBtns[p.id].querySelector(".pl-tag");
        APP.util.clear(tagBox);
        tagBox.appendChild(sc === "na" ? h("span", { class: "tag", style: "border-color:var(--line-2)", text: "No aplica" }) : APP.scopeTag(sc));
      });
      svg.querySelectorAll("[data-only]").forEach(function (el) {
        el.setAttribute("display", el.getAttribute("data-only").split(" ").indexOf(k) >= 0 ? "inline" : "none");
      });
      st.panelLatched = false;
      if (st.part) selectPart(st.part);
      logEvent("Tipo de instalación: " + TYPES[k].label);
      go(st.state === "bateria" ? "bateria" : "normal");
    }

    function selectPart(id) {
      st.part = id;
      var p = PARTS.filter(function (x) { return x.id === id; })[0];
      Object.keys(hsEls).forEach(function (k) { hsEls[k].classList.toggle("active", k === id); partBtns[k].setAttribute("aria-pressed", k === id ? "true" : "false"); });
      var sc = scopeOf(p);
      var note = p.note[st.type] || p.note.all;
      APP.util.clear(partInfo);
      partInfo.appendChild(h("div", { class: "row", style: "justify-content:space-between" }, [
        h("h3", { style: "margin:0", text: p.n + ". " + p.name }),
        sc === "na" ? h("span", { class: "tag", text: "No aplica a este tipo" }) : APP.scopeTag(sc)
      ]));
      partInfo.appendChild(h("p", { style: "margin-top:8px" }, [h("strong", { text: "Qué es: " }), p.what]));
      partInfo.appendChild(h("p", null, [h("strong", { text: "Para qué sirve: " }), p.why]));
      if (note) partInfo.appendChild(h("p", { class: "small muted" }, [h("strong", { text: TYPES[st.type].label + ": " }), note]));
      if (p.note.all && p.note[st.type] && p.note.all !== note) partInfo.appendChild(h("p", { class: "small muted", text: p.note.all }));
    }

    function pressTest() {
      if (st.state === "alarma") { APP.util.toast("Ya está en alarma"); return; }
      if (st.type === "central" && scopeOf(PARTS[3]) !== "general") {
        logEvent("Prueba solicitada (en sistemas con central, según el procedimiento del mantenedor)");
      }
      go("prueba");
    }

    function go(next) {
      if (next === "normal" && st.panelLatched) next = "alarma";
      var prev = st.state;
      st.state = next;
      if (next === "humo" && prev !== "humo") { st.venting = false; logEvent("Empieza a entrar humo (simulado)"); }
      if (next === "prueba") { st.testT = 0; logEvent("Botón de prueba pulsado"); }
      if (next === "bateria" && prev !== "bateria") logEvent(st.type === "central" ? "Avería detectada en el detector" : "Batería baja detectada");
      if (next === "alarma" && prev !== "alarma") {
        logEvent("ALARMA: la señal supera el umbral");
        if (st.type === "central") { st.panelLatched = true; logEvent("La central indica «Alarma zona 1» y activa sirenas"); }
        if (st.type === "radio") logEvent("Se envía el aviso por radio a la central");
      }
      paint();
    }

    function paint() {
      var info = STATE_INFO[st.state];
      status.setAttribute("data-level", info.level);
      status.textContent = info.label;
      explain.setAttribute("data-level", info.level);
      var txt = info.text;
      if (st.state === "alarma") {
        txt += st.type === "autonomo" ? " Suena el zumbador del propio detector. Cuando el humo desaparece, el detector vuelve a reposo por sí solo."
          : st.type === "radio" ? " Según el modelo, puede pitar y además envía una señal por radio a la central, que decide qué hacer (sirena, aviso al móvil…)."
          : " El detector avisa a la central. La central muestra la zona, activa las sirenas y mantiene la alarma memorizada hasta que alguien la rearma, aunque el humo desaparezca.";
      }
      if (st.state === "bateria") {
        txt = st.type === "central"
          ? "La central supervisa sus detectores y muestra una avería si uno falla o se desconecta. No hay pila que cambiar: lo revisa el mantenedor."
          : "Muchos detectores emiten un pitido corto periódico y cambian el patrón del LED cuando la pila se agota. El aviso exacto depende del modelo: hay que consultar el manual.";
      }
      APP.util.clear(explain);
      explain.appendChild(h("strong", { text: info.label + ". " }));
      explain.appendChild(document.createTextNode(txt));

      APP.util.clear(actions);
      var list = [];
      if (st.state === "normal") list = ["humo", "prueba", "bateria"];
      if (st.state === "humo") list = ["ventilar", "prueba"];
      if (st.state === "alarma") list = st.type === "central" ? ["ventilar", "rearme"] : ["ventilar"];
      if (st.state === "prueba") list = [];
      if (st.state === "bateria") list = st.type === "central" ? ["reiniciar"] : ["pila", "prueba"];
      list.push("reiniciar");
      list.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (k) { actions.appendChild(btn[k]); });

      var panelText = svg.querySelector("#panel-text");
      var radioAlarm = st.type === "radio" && (st.state === "alarma" || st.state === "prueba");
      if (panelText) {
        panelText.textContent = st.panelLatched ? "ALARMA ZONA 1"
          : radioAlarm ? (st.state === "prueba" ? "PRUEBA DETECTOR" : "AVISO DETECTOR HUMO")
          : st.state === "bateria" ? (st.type === "radio" ? "BATERÍA BAJA DET." : "AVERÍA ZONA 1") : "SISTEMA NORMAL";
      }
      var panelBox = svg.querySelector("#panel-screen");
      if (panelBox) panelBox.setAttribute("class", st.panelLatched || radioAlarm ? "bad-fill" : "dk");
    }

    function clearSmoke() { smokeParts.forEach(function (p) { p.el.remove(); }); smokeParts = []; }

    var led = svg.querySelector("#lab-led"), waves = svg.querySelector("#lab-waves"), radioWaves = svg.querySelector("#lab-radio");

    loopH = APP.util.loop(function (dt) {
      st.t += dt; st.ledT += dt; st.chirpT += dt;

      /* humo */
      if (st.venting) st.smoke = Math.max(0, st.smoke - 14 * dt);
      else if (st.state === "humo" || (st.state === "alarma" && st.smoke > 0 && !st.venting)) st.smoke = Math.min(100, st.smoke + 11 * dt);
      if (st.state === "humo" && st.smoke >= THR) go("alarma");
      if (st.state === "alarma" && st.venting && st.smoke < THR - 10) {
        if (st.type === "central") { if (st.smoke <= 0) { st.venting = false; } }
        else { st.venting = false; logEvent("El humo ha bajado del umbral: vuelve a reposo"); go("normal"); }
      }
      if (st.state === "humo" && st.venting && st.smoke <= 0) { st.venting = false; go("normal"); logEvent("Humo eliminado sin llegar al umbral"); }
      smokeMeter.set(st.smoke, THR, st.smoke >= THR);

      var rate = st.venting ? 0 : (st.state === "humo" || (st.state === "alarma" && st.smoke > 0)) ? 16 : 0;
      if (Math.random() < rate * dt && smokeParts.length < 90) {
        var el = s("circle", { r: rand(3, 6).toFixed(1), class: "smoke p-lenta", opacity: 0 });
        smokeLayer.appendChild(el);
        smokeParts.push({ x: rand(230, 370), y: 330, vy: rand(-50, -35), vx: rand(-8, 8), age: 0, el: el });
      }
      for (var i = smokeParts.length - 1; i >= 0; i--) {
        var p = smokeParts[i];
        p.age += dt;
        if (p.y < 178) { p.vy *= 0.9; p.vx += (p.x < 300 ? -1 : 1) * 30 * dt; }
        if (st.venting) p.vx += 60 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        var op = Math.min(0.7, p.age) * (p.age > 7 ? Math.max(0, 1 - (p.age - 7) / 2) : 1);
        if (op <= 0 || p.x > 620) { p.el.remove(); smokeParts.splice(i, 1); continue; }
        p.el.setAttribute("cx", p.x.toFixed(1)); p.el.setAttribute("cy", p.y.toFixed(1)); p.el.setAttribute("opacity", op.toFixed(2));
      }

      /* prueba */
      if (st.state === "prueba") {
        st.testT += dt;
        if (st.testT > 3) { logEvent("Fin de la prueba"); go(st.smoke >= THR ? "alarma" : "normal"); }
      }

      /* LED, zumbador y radio (patrones ilustrativos) */
      var ledOn = false, sounding = false;
      if (st.state === "normal" || st.state === "humo") ledOn = (st.ledT % 4) < 0.12;
      if (st.state === "alarma" || st.state === "prueba") { ledOn = (st.ledT % 0.5) < 0.25; sounding = true; }
      if (st.state === "bateria") ledOn = (st.ledT % 2) < 0.12;
      if (st.state === "alarma" && st.type === "central" && st.smoke < THR - 10) sounding = false;
      led.setAttribute("class", ledOn ? "bad-fill" : "");
      led.setAttribute("fill", ledOn ? "" : "var(--led-off)");
      var buzzerApplies = st.type !== "central";
      waves.setAttribute("opacity", sounding && buzzerApplies ? (0.4 + 0.6 * ((st.t * 4) % 1)).toFixed(2) : 0);
      if (sounding && buzzerApplies && (st.t % 0.5) < dt) APP.util.beep(3100, 180);
      if (st.state === "bateria" && buzzerApplies && st.chirpT > 6) { st.chirpT = 0; APP.util.beep(3400, 40); logEvent("Pitido corto de aviso (patrón ilustrativo)"); }
      radioWaves.setAttribute("opacity", st.type === "radio" && (st.state === "alarma" || st.state === "prueba" || st.state === "bateria") ? (0.3 + 0.7 * ((st.t * 2) % 1)).toFixed(2) : 0);
      svg.querySelector("#panel-wire").style.stroke = st.type === "central" && (st.state === "alarma" || st.panelLatched) ? "var(--bad)" : "";
    });

    setType(st.type);
    selectPart("camara");
    logEvent("Detector en reposo");
  }

  function buildDetector(svg) {
    var add = function (el) { svg.appendChild(el); return el; };
    add(s("rect", { x: 0, y: 0, width: 600, height: 30, class: "fl" }));
    add(s("text", { x: 10, y: 20, class: "lbl", text: "techo" }));
    /* base */
    add(s("rect", { x: 200, y: 30, width: 200, height: 18, rx: 3, class: "fl" }));
    add(s("g", { "data-only": "central" }, [
      s("rect", { x: 226, y: 34, width: 10, height: 10, class: "dk" }), s("rect", { x: 364, y: 34, width: 10, height: 10, class: "dk" }),
      s("text", { x: 408, y: 44, class: "lbl", text: "bornes" })
    ]));
    /* carcasa */
    add(s("path", { d: "M140 48 H460 V96 Q460 160 300 160 Q140 160 140 96 Z", class: "fl" }));
    /* PCB */
    add(s("rect", { x: 160, y: 58, width: 280, height: 9, rx: 2, fill: "#1f6b45", stroke: "var(--svg-stroke)", "stroke-width": 1 }));
    /* cámara */
    add(s("circle", { cx: 300, cy: 108, r: 38, class: "dk" }));
    for (var i = 0; i < 12; i++) {
      var a = i * 30;
      add(s("rect", { x: -3, y: -8, width: 6, height: 14, fill: "var(--svg-fill)", transform: "rotate(" + a + " 300 108) translate(300 76)" }));
    }
    add(s("rect", { x: 270, y: 103, width: 10, height: 10, fill: "var(--light-ray)" }));
    add(s("rect", { x: 296, y: 130, width: 10, height: 7, fill: "var(--svg-stroke)" }));
    /* ranuras */
    [150, 160, 440, 450].forEach(function (x) { add(s("rect", { x: x - 2, y: 100, width: 4, height: 22, rx: 2, class: "dk" })); });
    /* zumbador */
    add(s("circle", { cx: 196, cy: 104, r: 18, class: "fl" }));
    add(s("circle", { cx: 196, cy: 104, r: 8, class: "dk" }));
    var waves = add(s("g", { id: "lab-waves", opacity: 0 }));
    [16, 28, 40].forEach(function (r) { waves.appendChild(s("path", { d: "M" + (196 - r) + " 175 A " + r + " " + r + " 0 0 0 " + (196 + r) + " 175", class: "st", style: "stroke:var(--bad)" })); });
    /* pila */
    add(s("g", { "data-only": "autonomo radio" }, [
      s("rect", { x: 388, y: 80, width: 44, height: 24, rx: 4, fill: "var(--warn)", stroke: "var(--svg-stroke)", "stroke-width": 1.5 }),
      s("rect", { x: 432, y: 87, width: 4, height: 10, fill: "var(--svg-stroke)" })
    ]));
    /* antena de radio */
    add(s("g", { "data-only": "radio" }, [
      s("path", { d: "M440 66 V 52 h 10", class: "st" })
    ]));
    /* LED indicador */
    add(s("circle", { id: "lab-led", cx: 372, cy: 150, r: 5, fill: "var(--led-off)" }));
    /* pulsador */
    add(s("rect", { x: 284, y: 158, width: 32, height: 10, rx: 4, class: "fl", "data-press": "test", style: "cursor:pointer" }));

    /* aire y suelo de referencia */
    add(s("text", { x: 10, y: 330, class: "lbl", text: "local protegido" }));

    /* central o enlace */
    var radio = add(s("g", { id: "lab-radio", opacity: 0 }));
    [14, 26, 38].forEach(function (r) { radio.appendChild(s("path", { d: "M" + (470) + " " + (70 - r) + " A " + r + " " + r + " 0 0 1 " + 470 + " " + (70 + r), class: "st", style: "stroke:var(--accent)" })); });
    add(s("g", { "data-only": "radio central" }, [
      s("rect", { x: 490, y: 200, width: 96, height: 72, rx: 6, class: "fl" }),
      s("rect", { id: "panel-screen", x: 498, y: 208, width: 80, height: 22, rx: 2, class: "dk" }),
      s("text", { id: "panel-text", x: 538, y: 223, "text-anchor": "middle", fill: "#fff", style: "font:700 8.5px var(--mono)", text: "SISTEMA NORMAL" }),
      s("circle", { cx: 508, cy: 248, r: 4, class: "ok-fill" }),
      s("circle", { cx: 522, cy: 248, r: 4, fill: "var(--led-off)" }),
      s("text", { x: 538, y: 290, "text-anchor": "middle", class: "lbl", text: "central" })
    ]));
    add(s("path", { id: "panel-wire", "data-only": "central", d: "M374 44 H 538 V 200", class: "st", "stroke-dasharray": "0" }));
  }

  APP.register({
    id: "lab",
    title: "Laboratorio",
    render: render,
    destroy: function () { if (loopH) { loopH.stop(); loopH = null; } timers.forEach(clearTimeout); timers = []; }
  });
})();
