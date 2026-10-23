/* Módulo F · Retos y minijuegos */
(function () {
  "use strict";
  var h = APP.util.h, shuffle = APP.util.shuffle;

  var GAMES = [
    { id: "quiz", label: "Cuestionario" },
    { id: "match", label: "Emparejar componentes" },
    { id: "identify", label: "¿Qué tecnología es?" },
    { id: "cases", label: "Casos prácticos" },
    { id: "final", label: "Reto final" }
  ];

  /* ---------- Preparación de preguntas ---------- */
  function fromQuiz(q) {
    var order = shuffle(q.o.map(function (_, i) { return i; }));
    return { prompt: q.q, options: order.map(function (i) { return q.o[i]; }), correct: order.indexOf(q.a), explain: q.e, kind: "Cuestionario" };
  }
  function fromCase(c) {
    var it = fromQuiz({ q: c.q, o: c.o, a: c.a, e: c.e });
    it.title = c.title; it.context = c.text; it.kind = "Caso práctico";
    return it;
  }
  function fromIdentify(c) {
    var techs = shuffle(APP.data.technologies);
    var t = APP.techById(c.a);
    return {
      prompt: "¿Qué tecnología se comporta así?", context: c.clue,
      options: techs.map(function (x) { return x.name; }), correct: techs.indexOf(t),
      explain: t.name + ": " + t.short, kind: "¿Qué tecnología es?", link: c.a
    };
  }
  function fromScenario(sc) {
    var st = sc.steps[0];
    var opts = shuffle(st.options);
    return {
      title: sc.title, context: sc.context, prompt: st.q,
      options: opts.map(function (o) { return o.label; }),
      grade: function (i) { return opts[i].verdict === "ok" ? 1 : opts[i].verdict === "cond" ? 0.5 : 0; },
      correct: opts.map(function (o) { return o.verdict; }).indexOf("ok"),
      explain: opts.map(function (o) { return o.label + ": " + o.why; }).join(" "),
      verdicts: opts.map(function (o) { return o.verdict; }),
      kind: "Escenario"
    };
  }

  /* ---------- Motor de preguntas ---------- */
  function runQuestions(box, items, key, title, onDone) {
    var idx = 0, score = 0, review = [];
    function show() {
      APP.util.clear(box);
      if (idx >= items.length) return finish();
      var it = items[idx];
      box.appendChild(h("div", { class: "q-head" }, [h("span", { text: title + " · " + it.kind }), h("span", { text: "Pregunta " + (idx + 1) + " / " + items.length + " · Puntos: " + fmt(score) })]));
      box.appendChild(h("div", { class: "progress-bar" }, [h("span", { style: "width:" + (idx / items.length * 100) + "%" })]));
      if (it.title) box.appendChild(h("h3", { text: it.title }));
      if (it.context) box.appendChild(h("p", { class: "state-explain", text: it.context }));
      box.appendChild(h("h3", { text: it.prompt, style: "margin-top:12px" }));
      var opts = h("div", { class: "options", role: "group", "aria-label": "Respuestas" });
      var fb = h("div", { "aria-live": "polite" });
      it.options.forEach(function (label, i) {
        opts.appendChild(h("button", { class: "option", "data-opt": i, text: label, onclick: function () { answer(i); } }));
      });
      box.appendChild(opts);
      box.appendChild(fb);
      function answer(i) {
        var pts = it.grade ? it.grade(i) : (i === it.correct ? 1 : 0);
        score += pts;
        review.push({ q: it.prompt, ok: pts === 1, half: pts === 0.5, chosen: it.options[i], right: it.options[it.correct] });
        Array.prototype.forEach.call(opts.children, function (b, j) {
          b.disabled = true;
          if (it.verdicts) b.classList.add("v-" + it.verdicts[j]);
          else if (j === it.correct) b.classList.add("v-ok");
          else if (j === i) b.classList.add("v-bad");
          if (j === i) b.classList.add("chosen");
        });
        fb.appendChild(h("div", { class: "feedback " + (pts > 0 ? "ok" : "bad") }, [
          h("strong", { text: pts === 1 ? "¡Correcto!" : pts === 0.5 ? "Aceptable, con condiciones" : "No es la mejor respuesta" }),
          h("span", { text: it.explain }),
          it.link ? h("div", { style: "margin-top:6px" }, [h("a", { href: "#tech", text: "Observar esta tecnología en el Módulo B", onclick: function () { APP.store.set("tech:last", it.link); } })]) : null
        ]));
        var next = h("button", { class: "btn btn-primary", id: "q-next", style: "margin-top:12px", text: idx < items.length - 1 ? "Siguiente" : "Ver resultado", onclick: function () { idx++; show(); } });
        fb.appendChild(next);
        next.focus();
      }
    }
    function finish() {
      var total = items.length;
      var record = APP.progress.saveBest(key, score, total);
      box.appendChild(h("h3", { text: "Resultado" }));
      box.appendChild(h("p", null, [h("span", { class: "result-big", id: "q-result", text: fmt(score) + " / " + total }), record ? h("span", { class: "tag tag-general", style: "margin-left:10px", text: "Nuevo récord" }) : null]));
      box.appendChild(h("p", { class: "muted", text: message(score / total) }));
      box.appendChild(h("h4", { text: "Revisión" }));
      box.appendChild(h("ul", { class: "review-list" }, review.map(function (r) {
        return h("li", null, [
          h("span", { class: r.ok ? "r-ok" : r.half ? "" : "r-bad", text: r.ok ? "✓ " : r.half ? "≈ " : "✗ " }),
          r.q, h("br"),
          h("span", { class: "small muted", text: "Tu respuesta: " + r.chosen + (r.ok ? "" : " · Mejor respuesta: " + r.right) })
        ]);
      })));
      box.appendChild(h("button", { class: "btn btn-primary", id: "q-retry", text: "Repetir (nuevo orden)", onclick: function () { onDone && onDone(); } }));
      paintBoard();
    }
    show();
  }

  function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","); }
  function message(r) {
    if (r >= 0.9) return "Dominas los conceptos. Prueba ahora el reto final o explícaselo a un compañero.";
    if (r >= 0.6) return "Buen nivel. Revisa las preguntas falladas y vuelve a los simuladores para comprobarlas.";
    return "Repasa los Módulos A y B experimentando con los simuladores y vuelve a intentarlo.";
  }

  /* ---------- Emparejar ---------- */
  function runMatch(box, onDone) {
    var pairs = APP.data.matching;
    var left = shuffle(pairs.map(function (p, i) { return { i: i, text: p.a }; }));
    var right = shuffle(pairs.map(function (p, i) { return { i: i, text: p.b }; }));
    var selL = null, selR = null, matched = 0, errors = 0;
    APP.util.clear(box);
    var head = h("div", { class: "q-head" });
    var info = h("p", { class: "small muted", text: "Pulsa un componente y después su función (o al revés). Funciona con ratón, teclado y pantalla táctil." });
    var colL = h("div", { class: "match-col", "aria-label": "Componentes" }), colR = h("div", { class: "match-col", "aria-label": "Funciones" });
    var fb = h("div", { "aria-live": "polite" });
    function paintHead() { head.textContent = "Parejas: " + matched + " / " + pairs.length + " · Errores: " + errors; }
    function mk(item, side) {
      var b = h("button", { class: "match-item", "data-side": side, "data-i": item.i, "aria-pressed": "false", text: item.text, onclick: function () { pick(side, item.i, b); } });
      return b;
    }
    left.forEach(function (it) { colL.appendChild(mk(it, "L")); });
    right.forEach(function (it) { colR.appendChild(mk(it, "R")); });
    function pick(side, i, b) {
      if (b.classList.contains("matched")) return;
      var col = side === "L" ? colL : colR;
      col.querySelectorAll(".match-item").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      if (side === "L") selL = { i: i, b: b }; else selR = { i: i, b: b };
      if (selL && selR) {
        var a = selL, c = selR;
        selL = selR = null;
        if (a.i === c.i) {
          matched++;
          [a.b, c.b].forEach(function (x) { x.classList.add("matched"); x.setAttribute("aria-pressed", "false"); x.disabled = true; x.insertBefore(h("span", { class: "pair-n", text: "✓ " + matched }), x.firstChild); });
        } else {
          errors++;
          [a.b, c.b].forEach(function (x) { x.classList.add("wrong"); x.setAttribute("aria-pressed", "false"); });
          setTimeout(function () { a.b.classList.remove("wrong"); c.b.classList.remove("wrong"); }, 450);
        }
        paintHead();
        if (matched === pairs.length) {
          var score = Math.max(0, pairs.length - errors);
          var rec = APP.progress.saveBest("match", score, pairs.length);
          fb.appendChild(h("div", { class: "feedback ok", id: "match-done" }, [
            h("strong", { text: "¡Completado! Puntuación: " + score + " / " + pairs.length }),
            h("span", { text: errors ? "Has cometido " + errors + " error(es). Cada error resta un punto." : "Sin errores." }),
            rec ? h("span", { class: "tag tag-general", style: "margin-left:8px", text: "Nuevo récord" }) : null
          ]));
          fb.appendChild(h("button", { class: "btn btn-primary", style: "margin-top:10px", text: "Jugar otra vez", onclick: function () { onDone(); } }));
          paintBoard();
        }
      }
    }
    paintHead();
    box.appendChild(head);
    box.appendChild(info);
    box.appendChild(h("div", { class: "match-grid" }, [colL, colR]));
    box.appendChild(fb);
  }

  /* ---------- Marcador ---------- */
  var board = null;
  function paintBoard() {
    if (!board) return;
    APP.util.clear(board);
    GAMES.forEach(function (g) {
      var b = APP.progress.best(g.id);
      board.appendChild(h("div", { class: "score-tile" }, [h("b", { text: b ? fmt(b.score) + "/" + b.total : "—" }), h("span", { text: "Mejor: " + g.label })]));
    });
  }

  function render(view) {
    view.appendChild(h("div", { class: "page-head" }, [
      h("div", { class: "kicker", text: "Módulo F" }),
      h("h1", { text: "Retos y minijuegos" }),
      h("p", { text: "Comprueba lo que has aprendido. Cada respuesta se corrige al momento y se explica. Puedes repetir los retos: el orden cambia cada vez." })
    ]));
    board = h("div", { class: "score-board", "aria-label": "Mejores puntuaciones" });
    view.appendChild(board);
    paintBoard();
    var tabs = h("div", { class: "game-tabs seg", role: "tablist" });
    var box = h("div", { class: "panel", id: "game-box" });
    view.appendChild(tabs);
    view.appendChild(box);
    /* Confirmación en dos pasos dentro de la página (sin confirm(), que algunos visores bloquean) */
    var armed = false;
    var resetBtn = h("button", { class: "btn btn-ghost btn-danger", id: "reset-progress", text: "Borrar puntuaciones y progreso", onclick: function () {
      if (!armed) {
        armed = true;
        resetBtn.textContent = "Pulsa otra vez para confirmar el borrado";
        setTimeout(function () { armed = false; resetBtn.textContent = "Borrar puntuaciones y progreso"; }, 4000);
        return;
      }
      armed = false;
      resetBtn.textContent = "Borrar puntuaciones y progreso";
      APP.progress.reset(); APP.store.remove("sim:results"); paintBoard(); APP.util.toast("Progreso borrado");
    } });
    view.appendChild(h("div", { class: "row", style: "margin-top:12px" }, [resetBtn]));

    function start(id) {
      APP.store.set("games:last", id);
      tabs.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-game") === id ? "true" : "false"); });
      APP.util.clear(box);
      var again = function () { start(id); };
      if (id === "quiz") runQuestions(box, shuffle(APP.data.quiz).slice(0, 10).map(fromQuiz), "quiz", "Cuestionario", again);
      if (id === "identify") runQuestions(box, shuffle(APP.data.identify).map(fromIdentify), "identify", "Identifica", again);
      if (id === "cases") runQuestions(box, shuffle(APP.data.cases).map(fromCase), "cases", "Casos", again);
      if (id === "match") runMatch(box, again);
      if (id === "final") {
        var items = []
          .concat(shuffle(APP.data.quiz).slice(0, 4).map(fromQuiz))
          .concat(shuffle(APP.data.identify).slice(0, 2).map(fromIdentify))
          .concat(shuffle(APP.data.cases).slice(0, 1).map(fromCase))
          .concat(shuffle(APP.data.scenarios).slice(0, 1).map(fromScenario));
        box.appendChild(h("p", { class: "small muted", text: "Reto final: 8 preguntas mezcladas de todos los módulos. En la pregunta de escenario, una opción «con condiciones» vale medio punto." }));
        var inner = h("div");
        box.appendChild(inner);
        runQuestions(inner, shuffle(items), "final", "Reto final", again);
      }
    }
    GAMES.forEach(function (g) {
      tabs.appendChild(h("button", { "data-game": g.id, "aria-pressed": "false", text: g.label, onclick: function () { start(g.id); } }));
    });
    start(APP.store.get("games:last", "quiz"));
  }

  APP.register({ id: "retos", title: "Retos", render: render, destroy: function () { board = null; } });
})();
