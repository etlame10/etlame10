/*
 * Escenas animadas del Módulo B.
 *
 * MODELO DIDÁCTICO: la señal de cada detector se calcula con un modelo
 * sencillo (concentración × factor cualitativo, con retardo y suavizado).
 * Las partículas son la representación visual de ese modelo. Ni los
 * retardos ni las escalas son datos reales de ningún equipo.
 *
 * Cada escena recibe (svg, ctl) y devuelve { step(dt, t) } que devuelve:
 *   detect: 0-100  señal de detección (más alto = más humo percibido)
 *   value:  0-100  magnitud que se muestra en el medidor
 *   invert: true si la alarma ocurre cuando "value" BAJA
 *   label:  nombre de la magnitud del medidor
 *   fault:  true si hay avería
 *   heat:   0-100  (solo escenas con sensor térmico)
 */
(function () {
  "use strict";
  var s = APP.util.s, rand = APP.util.rand, clamp = APP.util.clamp;
  var TYPES = APP.data.smokeTypes;

  /* ---------- utilidades ---------- */
  function Smoke(layer, max) {
    this.layer = layer; this.list = []; this.acc = 0; this.max = max || 170;
  }
  Smoke.prototype.emit = function (rate, dt, make) {
    this.acc += rate * dt;
    while (this.acc >= 1) {
      this.acc -= 1;
      if (this.list.length >= this.max) continue;
      var p = make();
      p.age = 0;
      p.el = s("circle", { r: p.r.toFixed(1), class: "smoke p-" + p.kind, cx: p.x, cy: p.y, opacity: 0 });
      this.layer.appendChild(p.el);
      this.list.push(p);
    }
  };
  Smoke.prototype.update = function (dt, move) {
    for (var i = this.list.length - 1; i >= 0; i--) {
      var p = this.list[i];
      p.age += dt;
      var keep = move(p, dt) !== false && p.age < p.life && p.x > -20 && p.x < 640 && p.y > -20 && p.y < 360;
      if (!keep) {
        p.el.remove();
        this.list.splice(i, 1);
        continue;
      }
      var op = Math.min(1, p.age / 0.4, (p.life - p.age) / 1.2) * (p.alpha || 0.8);
      p.el.setAttribute("cx", p.x.toFixed(1));
      p.el.setAttribute("cy", p.y.toFixed(1));
      p.el.setAttribute("opacity", op.toFixed(2));
    }
  };
  Smoke.prototype.clear = function () {
    this.list.forEach(function (p) { p.el.remove(); });
    this.list = []; this.acc = 0;
  };

  function particle(ctl, x, y, vx, vy, life) {
    var t = TYPES[ctl.type];
    return { x: x, y: y, vx: vx, vy: vy, r: rand(t.size[0], t.size[1]), kind: ctl.type, life: life || 14 };
  }

  /* Línea de retardo: devuelve el valor que tenía la entrada hace "delay" segundos */
  function DelayLine() {
    var buf = [];
    return {
      push: function (t, v) {
        buf.push([t, v]);
        while (buf.length > 2 && buf[1][0] < t - 40) buf.shift();
      },
      get: function (t, delay) {
        var target = t - delay, out = 0;
        for (var i = 0; i < buf.length && buf[i][0] <= target; i++) out = buf[i][1];
        return out;
      },
      reset: function () { buf = []; }
    };
  }

  function ema(cur, target, dt, tau) { return cur + (target - cur) * (1 - Math.exp(-dt / tau)); }
  function noise(amp) { return (Math.random() - 0.5) * amp; }

  function text(x, y, str, cls, anchor) {
    return s("text", { x: x, y: y, class: cls || "lbl", "text-anchor": anchor || "start", text: str });
  }

  /* Icono de la fuente de humo; se actualiza al cambiar el tipo */
  function sourceIcon(g, x, y) {
    var last = null;
    return function (type, active) {
      var key = type + (active ? 1 : 0);
      if (key === last) return;
      last = key;
      while (g.firstChild) g.removeChild(g.firstChild);
      g.setAttribute("transform", "translate(" + x + " " + y + ")");
      g.setAttribute("opacity", active ? "1" : "0.35");
      if (type === "llama") {
        g.appendChild(s("path", { class: "flame", d: "M0 0 C-14 -10 -6 -24 0 -36 C4 -26 16 -18 10 -4 C8 0 4 2 0 0z" }));
        g.appendChild(s("path", { class: "flame-in", d: "M0 -2 C-6 -8 -2 -16 1 -22 C3 -16 8 -10 5 -3z" }));
      } else if (type === "lenta") {
        g.appendChild(s("rect", { x: -16, y: -8, width: 32, height: 10, rx: 3, fill: "#5a2a1a" }));
        g.appendChild(s("circle", { cx: -6, cy: -5, r: 2.5, fill: "#ff6a1a" }));
        g.appendChild(s("circle", { cx: 6, cy: -4, r: 2, fill: "#ff6a1a" }));
      } else {
        g.appendChild(s("rect", { x: -16, y: -14, width: 32, height: 16, rx: 3, class: "fl" }));
        g.appendChild(s("rect", { x: -20, y: -18, width: 40, height: 5, rx: 2, class: "fl" }));
      }
      g.appendChild(text(0, 18, TYPES[type].label.split(" (")[0], "lbl", "middle"));
    };
  }

  /* =========================================================
     1. ÓPTICO (luz dispersa / oscurecimiento)
     ========================================================= */
  function optical(svg, ctl, opts) {
    opts = opts || {};
    var C = { x: 380, y: 160 }, R = 120;
    var room = s("g");
    room.appendChild(text(16, 26, "Aire del local", "lbl-strong"));
    room.appendChild(s("path", { d: "M16 300 h70 m-10 -6 l10 6 -10 6", class: "st" }));
    room.appendChild(text(16, 290, "el humo entra con el aire"));
    svg.appendChild(room);

    svg.appendChild(s("circle", { cx: C.x, cy: C.y, r: R + 12, class: "st", "stroke-dasharray": "2 5" }));
    svg.appendChild(text(C.x, C.y - R - 18, "carcasa con malla antiinsectos", "lbl", "middle"));
    svg.appendChild(s("circle", { cx: C.x, cy: C.y, r: R, class: "fl" }));
    var teeth = s("g");
    for (var i = 0; i < 16; i++) {
      var a = i * 360 / 16 + 11;
      teeth.appendChild(s("rect", { class: "dk", x: -22, y: -3, width: 22, height: 6, rx: 1, transform: "rotate(" + a + " " + C.x + " " + C.y + ") translate(" + (C.x + R - 2) + " " + C.y + ") rotate(32)" }));
    }
    svg.appendChild(teeth);
    if (!opts.compact) svg.appendChild(text(C.x + R + 16, C.y - 70, "laberinto", "lbl"));

    var beam = s("line", { x1: 302, y1: C.y, x2: 452, y2: C.y, class: "beam" });
    svg.appendChild(beam);
    var rays = s("g");
    svg.appendChild(rays);
    var rayEls = [];
    for (var r = 0; r < 10; r++) { var l = s("line", { class: "ray", opacity: 0 }); rays.appendChild(l); rayEls.push(l); }

    var smokeLayer = s("g");
    svg.appendChild(smokeLayer);
    var smoke = new Smoke(smokeLayer, 150);

    svg.appendChild(s("rect", { x: 280, y: C.y - 9, width: 22, height: 18, rx: 3, class: "dk" }));
    svg.appendChild(s("circle", { cx: 300, cy: C.y, r: 4, class: "glow" }));
    svg.appendChild(text(272, C.y - 16, "LED emisor", "lbl-strong", "start"));

    var trap = s("g", null, [
      s("path", { d: "M452 " + (C.y - 16) + " L476 " + C.y + " L452 " + (C.y + 16) + "z", class: "dk" }),
      text(486, C.y + 4, "trampa", "lbl-strong", "start")
    ]);
    svg.appendChild(trap);

    var pd = s("g");
    var pdGlow = s("circle", { cx: 0, cy: 0, r: 0, class: "glow", opacity: 0.35 });
    pd.appendChild(pdGlow);
    pd.appendChild(s("rect", { x: -12, y: -8, width: 24, height: 16, rx: 3, class: "dk" }));
    var pdLabel = text(0, 30, "fotodiodo", "lbl-strong", "middle");
    pd.appendChild(pdLabel);
    svg.appendChild(pd);

    var conc = 0, delay = new DelayLine();
    var factorsKey = "factors";

    return {
      step: function (dt, t) {
        var obsc = ctl.mode === "obsc";
        var tech = APP.techById(opts.techId || "optico");
        var factors = obsc ? tech.obscFactors : tech.factors;
        var PD = obsc ? { x: 462, y: C.y } : { x: C.x, y: C.y + 92 };
        pd.setAttribute("transform", "translate(" + PD.x + " " + PD.y + ")");
        pdLabel.setAttribute("y", obsc ? -16 : 30);
        trap.setAttribute("display", obsc ? "none" : "inline");

        var rate = ctl.density / 100 * 16;
        smoke.emit(rate, dt, function () { return particle(ctl, rand(-5, 40), rand(40, 285), rand(50, 70), rand(-8, 8), 16); });
        smoke.update(dt, function (p, dt) {
          var dx = p.x - C.x, dy = p.y - C.y, inside = dx * dx + dy * dy < (R - 6) * (R - 6);
          if (inside) {
            p.vx = ema(p.vx, 30, dt, 0.6);
            p.vy += noise(80) * dt;
            p.vy = clamp(p.vy, -18, 18);
          }
          p.x += p.vx * dt; p.y += p.vy * dt;
        });

        delay.push(t, ctl.density * (factors[ctl.type] || 0));
        conc = ema(conc, delay.get(t, 3), dt, 1.4);
        var detect = clamp(conc + noise(1.2), 0, 100);

        var k = 0;
        if (!obsc) {
          for (var i = 0; i < smoke.list.length && k < rayEls.length; i++) {
            var p = smoke.list[i];
            if (Math.abs(p.y - C.y) < 14 && p.x > 305 && p.x < 450) {
              var el = rayEls[k++];
              el.setAttribute("x1", p.x.toFixed(1)); el.setAttribute("y1", p.y.toFixed(1));
              el.setAttribute("x2", PD.x); el.setAttribute("y2", PD.y - 8);
              el.setAttribute("opacity", "0.75");
            }
          }
        }
        for (; k < rayEls.length; k++) rayEls[k].setAttribute("opacity", 0);

        if (obsc) {
          beam.setAttribute("x2", 452);
          beam.setAttribute("opacity", (0.55 * (1 - detect / 120)).toFixed(2));
          pdGlow.setAttribute("r", (6 + 16 * (1 - detect / 100)).toFixed(1));
          return { detect: detect, value: 100 - detect, invert: true, label: "Luz que llega al receptor" };
        }
        beam.setAttribute("opacity", "0.5");
        pdGlow.setAttribute("r", (detect / 100 * 22).toFixed(1));
        return { detect: detect, value: detect, invert: false, label: "Luz dispersada que llega al fotodiodo" };
      },
      reset: function () { smoke.clear(); conc = 0; delay.reset(); }
    };
  }

  /* =========================================================
     2. IÓNICO
     ========================================================= */
  function ionic(svg, ctl) {
    var X0 = 240, X1 = 520, YT = 80, YB = 240;
    svg.appendChild(text(16, 26, "Aire del local", "lbl-strong"));
    svg.appendChild(s("rect", { x: X0 - 20, y: YT - 26, width: X1 - X0 + 40, height: YB - YT + 52, rx: 14, class: "st", "stroke-dasharray": "2 5" }));
    svg.appendChild(text(X0 - 20, YT - 34, "cámara de ionización (esquema)", "lbl"));
    svg.appendChild(s("rect", { x: X0, y: YT - 10, width: X1 - X0, height: 10, class: "fl" }));
    svg.appendChild(s("rect", { x: X0, y: YB, width: X1 - X0, height: 10, class: "fl" }));
    svg.appendChild(text(X1 - 6, YT + 16, "placa +", "lbl-strong", "end"));
    svg.appendChild(text(X1 - 6, YB - 8, "placa −", "lbl-strong", "end"));

    var src = s("g", { transform: "translate(" + (X0 + 10) + " " + (YB - 24) + ")" }, [
      s("rect", { x: 0, y: 0, width: 26, height: 20, rx: 3, class: "dk" }),
      s("polygon", { points: "13,3 22,17 4,17", fill: "#f5c400" })
    ]);
    svg.appendChild(src);
    svg.appendChild(text(X0 + 2, YB + 44, "fuente Am-241 sellada", "lbl"));
    var alpha = s("g");
    for (var a = 0; a < 6; a++) {
      alpha.appendChild(s("line", { class: "alpha", x1: X0 + 36, y1: YB - 14, x2: X0 + 36 + 60 * Math.cos(-a * 0.25), y2: YB - 14 + 60 * Math.sin(-a * 0.25) }));
    }
    svg.appendChild(alpha);

    /* Amperímetro */
    var M = { x: 120, y: 160 };
    svg.appendChild(s("path", { d: "M" + X1 + " " + (YT - 5) + " H 560 V 300 H " + M.x + " V " + (M.y + 34), class: "st" }));
        svg.appendChild(s("circle", { cx: M.x, cy: M.y, r: 34, class: "fl" }));
    svg.appendChild(s("path", { d: "M" + (M.x - 24) + " " + (M.y + 6) + " A 26 26 0 0 1 " + (M.x + 24) + " " + (M.y + 6), class: "st" }));
    var needle = s("line", { x1: M.x, y1: M.y + 10, x2: M.x, y2: M.y - 20, stroke: "var(--bad)", "stroke-width": 2.5 });
    svg.appendChild(needle);
    svg.appendChild(text(M.x, M.y + 26, "corriente", "lbl", "middle"));
    svg.appendChild(s("path", { d: "M" + (M.x + 34) + " " + M.y + " H 200 V " + (YB + 5) + " H " + X0, class: "st" }));

    var ionLayer = s("g"), smokeLayer = s("g");
    svg.appendChild(ionLayer); svg.appendChild(smokeLayer);
    var ions = [];
    for (var i = 0; i < 46; i++) {
      var pos = i % 2 === 0;
      var el = s("circle", { r: 3, class: pos ? "ion-pos" : "ion-neg" });
      ionLayer.appendChild(el);
      ions.push({ x: rand(X0 + 10, X1 - 10), y: rand(YT + 6, YB - 6), pos: pos, el: el, stuck: false });
    }
    var smoke = new Smoke(smokeLayer, 140);
    var conc = 0, delay = new DelayLine();

    return {
      step: function (dt, t) {
        smoke.emit(ctl.density / 100 * 14, dt, function () { return particle(ctl, rand(-5, 40), rand(70, 250), rand(50, 70), rand(-6, 6), 15); });
        smoke.update(dt, function (p, dt) {
          if (p.x > X0 && p.x < X1) { p.vx = ema(p.vx, 26, dt, 0.5); p.vy = clamp(p.vy + noise(60) * dt, -15, 15); }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < YT + 4) p.vy = Math.abs(p.vy);
          if (p.y > YB - 4 && p.x > X0 && p.x < X1) p.vy = -Math.abs(p.vy);
        });

        delay.push(t, ctl.density * (APP.techById("ionico").factors[ctl.type] || 0));
        conc = ema(conc, delay.get(t, 3), dt, 1.4);
        var detect = clamp(conc + noise(1.2), 0, 100);
        var current = 100 - detect;

        var stuckTarget = Math.round(ions.length * detect / 110);
        var stuckNow = ions.filter(function (o) { return o.stuck; }).length;
        ions.forEach(function (o) {
          if (stuckNow < stuckTarget && !o.stuck && Math.random() < 0.08) { o.stuck = true; stuckNow++; }
          else if (stuckNow > stuckTarget && o.stuck && Math.random() < 0.08) { o.stuck = false; stuckNow--; }
          if (o.stuck) {
            o.x += 12 * dt; o.y += noise(10) * dt;
            if (o.x > X1 - 6) o.x = X0 + 8;
            o.el.setAttribute("class", "ion-stuck");
          } else {
            o.y += (o.pos ? 70 : -70) * dt;
            if (o.y > YB - 4 || o.y < YT + 4) { o.y = rand(YT + 10, YB - 10); o.x = rand(X0 + 10, X1 - 10); }
            o.el.setAttribute("class", o.pos ? "ion-pos" : "ion-neg");
          }
          o.el.setAttribute("cx", o.x.toFixed(1)); o.el.setAttribute("cy", o.y.toFixed(1));
        });
        var ang = (-60 + current / 100 * 120) * Math.PI / 180;
        needle.setAttribute("x2", (M.x + 28 * Math.sin(ang)).toFixed(1));
        needle.setAttribute("y2", (M.y + 10 - 28 * Math.cos(ang)).toFixed(1));
        return { detect: detect, value: current, invert: true, label: "Corriente de ionización" };
      },
      reset: function () { smoke.clear(); conc = 0; delay.reset(); ions.forEach(function (o) { o.stuck = false; }); }
    };
  }

  /* =========================================================
     3. HAZ ÓPTICO (gran espacio)
     ========================================================= */
  function beamScene(svg, ctl) {
    var BY = 62, FX = 300, FY = 296;
    svg.appendChild(s("rect", { x: 0, y: 0, width: 600, height: 22, class: "fl" }));
    svg.appendChild(text(300, 15, "techo alto", "lbl", "middle"));
    svg.appendChild(s("rect", { x: 0, y: 22, width: 18, height: 298, class: "fl" }));
    svg.appendChild(s("rect", { x: 582, y: 22, width: 18, height: 298, class: "fl" }));
    svg.appendChild(s("line", { x1: 18, y1: 300, x2: 582, y2: 300, class: "st" }));
    svg.appendChild(s("rect", { x: 18, y: BY - 16, width: 42, height: 32, rx: 4, class: "fl" }));
    svg.appendChild(text(24, BY + 34, "emisor/receptor", "lbl"));
    svg.appendChild(s("rect", { x: 566, y: BY - 18, width: 16, height: 36, class: "dk" }));
    svg.appendChild(text(578, BY + 34, "reflector", "lbl", "end"));
    var beamOut = s("line", { x1: 60, y1: BY - 4, x2: 566, y2: BY - 4, class: "beam" });
    var beamBack = s("line", { x1: 566, y1: BY + 4, x2: 60, y2: BY + 4, class: "beam" });
    svg.appendChild(beamOut); svg.appendChild(beamBack);

    var stratLine = s("g", { display: "none" }, [
      s("line", { x1: 18, y1: 160, x2: 582, y2: 160, class: "strat" }),
      text(30, 152, "capa de estratificación (el humo se enfría y deja de subir)", "lbl")
    ]);
    svg.appendChild(stratLine);

    var smokeLayer = s("g");
    svg.appendChild(smokeLayer);
    var smoke = new Smoke(smokeLayer, 170);
    var src = s("g"); svg.appendChild(src);
    var drawSrc = sourceIcon(src, FX, FY);

    var block = s("g", { transform: "translate(420 300)" }, [
      s("rect", { x: -26, y: -40, width: 52, height: 40, rx: 2, fill: "#b07a3a", stroke: "var(--svg-stroke)", "stroke-width": 2 }),
      text(0, -46, "palé elevado", "lbl", "middle")
    ]);
    svg.appendChild(block);
    var blockY = 300;

    var conc = 0, delay = new DelayLine();
    return {
      step: function (dt, t) {
        var rate = ctl.density / 100 * 18;
        drawSrc(ctl.type, ctl.density > 0);
        smoke.emit(rate, dt, function () { return particle(ctl, FX + rand(-8, 8), FY - 30, rand(-6, 6), rand(-62, -48), 18); });
        smoke.update(dt, function (p, dt) {
          var ceiling = ctl.strat ? 160 : 34;
          if (p.y <= ceiling + 6) {
            p.vy = ema(p.vy, 0, dt, 0.4);
            if (Math.abs(p.vx) < 15) p.vx = (p.x < FX ? -1 : 1) * rand(25, 45);
          } else {
            p.vx += noise(30) * dt;
          }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < 22 || p.x > 578) p.vx = -p.vx;
          if (p.y < ceiling) p.y = ceiling;
        });
        var targetBlockY = ctl.blocked ? BY + 40 : 300;
        blockY = ema(blockY, targetBlockY, dt, 0.35);
        block.setAttribute("transform", "translate(420 " + blockY.toFixed(1) + ")");
        stratLine.setAttribute("display", ctl.strat ? "inline" : "none");

        var reach = ctl.strat ? 0.04 : 1;
        delay.push(t, ctl.density * (APP.techById("haz").factors[ctl.type] || 0) * reach);
        conc = ema(conc, delay.get(t, 4.5), dt, 1.8);
        var detect = clamp(conc + noise(1), 0, 100);
        var fullyBlocked = blockY < BY + 44;
        var received = fullyBlocked ? 2 : 100 - detect;
        var opBack = fullyBlocked ? 0 : 0.5 * received / 100;
        beamOut.setAttribute("x2", fullyBlocked ? 394 : 566);
        beamBack.setAttribute("opacity", opBack.toFixed(2));
        beamOut.setAttribute("opacity", (0.25 + 0.3 * received / 100).toFixed(2));
        return { detect: fullyBlocked ? 0 : detect, value: received, invert: true, fault: fullyBlocked, label: "Señal recibida del haz" };
      },
      reset: function () { smoke.clear(); conc = 0; delay.reset(); }
    };
  }

  /* =========================================================
     4. ASPIRACIÓN
     ========================================================= */
  function aspirating(svg, ctl) {
    var PY = 62, PX0 = 110, PX1 = 572, FX = 430, FY = 296;
    var holes = [200, 290, 380, 470, 560];
    svg.appendChild(s("rect", { x: 0, y: 0, width: 600, height: 30, class: "fl" }));
    svg.appendChild(text(300, 19, "techo de la sala protegida", "lbl", "middle"));
    svg.appendChild(s("line", { x1: 0, y1: 300, x2: 600, y2: 300, class: "st" }));
    svg.appendChild(s("path", { d: "M" + PX0 + " 150 V " + PY + " H " + PX1, class: "pipe" }));
    svg.appendChild(s("path", { d: "M" + PX0 + " 150 V " + PY + " H " + PX1, class: "pipe-in" }));
    holes.forEach(function (x) { svg.appendChild(s("circle", { cx: x, cy: PY + 5, r: 3, fill: "var(--svg-dark)" })); });
    svg.appendChild(text(240, PY + 26, "tubo de muestreo con orificios", "lbl"));

    /* Unidad */
    svg.appendChild(s("rect", { x: 40, y: 150, width: 140, height: 140, rx: 8, class: "fl" }));
    svg.appendChild(text(110, 314, "unidad de detección", "lbl", "middle"));
    svg.appendChild(s("rect", { x: 96, y: 160, width: 28, height: 10, class: "dk" }));
    svg.appendChild(text(130, 169, "filtro", "lbl"));
    var chamber = s("rect", { x: 70, y: 186, width: 80, height: 44, rx: 4, class: "dk" });
    svg.appendChild(chamber);
    var laser = s("line", { x1: 72, y1: 208, x2: 148, y2: 208, class: "ray", opacity: 0.8 });
    svg.appendChild(laser);
    svg.appendChild(text(110, 244, "cámara láser", "lbl", "middle"));
    var fan = s("g", { transform: "translate(110 266)" }, [
      s("circle", { r: 14, class: "st" }),
      s("path", { d: "M0 0 L0 -12 A12 12 0 0 1 10 -6z M0 0 L10 6 A12 12 0 0 1 -2 12z M0 0 L-10 6 A12 12 0 0 1 -10 -6z", fill: "var(--svg-stroke)" })
    ]);
    svg.appendChild(fan);
    svg.appendChild(text(132, 270, "aspirador", "lbl"));

    var flowLayer = s("g");
    svg.appendChild(flowLayer);
    var flows = [];
    for (var f = 0; f < 10; f++) { var fe = s("circle", { r: 2.2, class: "flow" }); flowLayer.appendChild(fe); flows.push({ d: f * 50, el: fe }); }

    var smokeLayer = s("g");
    svg.appendChild(smokeLayer);
    var smoke = new Smoke(smokeLayer, 170);
    var src = s("g"); svg.appendChild(src);
    var drawSrc = sourceIcon(src, FX, FY);

    /* Recorrido del tubo: H desde x hasta PX0 y bajada hasta la cámara */
    var LEN_V = 208 - PY;
    function pipePoint(d) {
      var lenH = PX1 - PX0;
      if (d < lenH) return { x: PX1 - d, y: PY };
      return { x: PX0, y: PY + Math.min(d - lenH, LEN_V) };
    }

    var conc = 0, delay = new DelayLine(), rot = 0;
    var started = null, measured = null, lastDensity = 0;
    var SPEED = 80;

    return {
      step: function (dt, t) {
        drawSrc(ctl.type, ctl.density > 0);
        smoke.emit(ctl.density / 100 * 16, dt, function () { return particle(ctl, FX + rand(-10, 10), FY - 28, rand(-6, 6), rand(-60, -48), 20); });
        smoke.update(dt, function (p, dt) {
          if (p.inPipe) {
            p.d += SPEED * dt;
            var q = pipePoint(p.d);
            p.x = q.x; p.y = q.y;
            if (p.d > (PX1 - PX0) + LEN_V) { p.life = Math.min(p.life, p.age + 0.6); }
            return true;
          }
          if (p.y < PY + 14) {
            for (var i = 0; i < holes.length; i++) {
              if (Math.abs(p.x - holes[i]) < 16 && Math.random() < 0.5) {
                p.inPipe = true; p.d = PX1 - holes[i]; p.alpha = 0.9; p.life = p.age + 12;
                return true;
              }
            }
            p.vy = ema(p.vy, 0, dt, 0.3);
            if (Math.abs(p.vx) < 12) p.vx = (Math.random() < 0.5 ? -1 : 1) * rand(18, 34);
          } else {
            p.vx += noise(24) * dt;
          }
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < PY + 8) p.y = PY + 8;
        });

        rot = (rot + 400 * dt) % 360;
        fan.setAttribute("transform", "translate(110 266) rotate(" + rot.toFixed(0) + ")");
        flows.forEach(function (o) {
          o.d = (o.d + SPEED * dt) % ((PX1 - PX0) + LEN_V);
          var q = pipePoint(o.d);
          o.el.setAttribute("cx", q.x); o.el.setAttribute("cy", q.y);
        });

        /* Retardo = subida del humo + recorrido del tubo hasta la cámara (modelo didáctico) */
        var transport = ((PX1 - FX) < 0 ? 0 : (PX1 - FX)) / SPEED + LEN_V / SPEED + (FY - PY) / 55;
        delay.push(t, ctl.density * (APP.techById("aspiracion").factors[ctl.type] || 0) * 1.35);
        conc = ema(conc, delay.get(t, transport), dt, 1);
        var detect = clamp(conc + noise(1), 0, 100);
        laser.setAttribute("stroke-width", (2 + detect / 25).toFixed(1));

        if (lastDensity === 0 && ctl.density > 0) { started = t; measured = null; }
        if (ctl.density === 0) started = null;
        if (started !== null && measured === null && detect > 6) measured = t - started;
        lastDensity = ctl.density;

        return {
          detect: detect, value: detect, invert: false, label: "Partículas en la cámara",
          extra: measured !== null ? "Retardo observado en esta simulación: " + measured.toFixed(1) + " s" : (started !== null ? "Midiendo el retardo de transporte…" : "Sube el humo desde 0 para medir el retardo"),
          measured: measured
        };
      },
      reset: function () { smoke.clear(); conc = 0; delay.reset(); started = null; measured = null; lastDensity = 0; }
    };
  }

  /* =========================================================
     5. MULTISENSOR
     ========================================================= */
  function multisensor(svg, ctl) {
    var inner = s("g");
    svg.appendChild(inner);
    var opt = optical(inner, ctl, { techId: "multisensor", compact: true });
    var TX = 540, TY = 150;
    svg.appendChild(s("rect", { x: TX - 9, y: TY - 70, width: 18, height: 110, rx: 9, class: "fl" }));
    var mercury = s("rect", { x: TX - 5, y: TY + 30, width: 10, height: 0, fill: "var(--warn)" });
    svg.appendChild(mercury);
    svg.appendChild(s("circle", { cx: TX, cy: TY + 46, r: 12, fill: "var(--warn)" }));
    svg.appendChild(text(TX, TY + 76, "termistor", "lbl-strong", "middle"));
    var waves = s("g", { opacity: 0 });
    [0, 1, 2].forEach(function (i) { waves.appendChild(s("path", { class: "heat-wave", d: "M" + (TX - 30 + i * 12) + " 300 q 6 -10 0 -20 q -6 -10 0 -20" })); });
    svg.appendChild(waves);
    var heat = 0, hDelay = new DelayLine();

    return {
      step: function (dt, t) {
        var o = opt.step(dt, t);
        hDelay.push(t, ctl.density * TYPES[ctl.type].heat);
        heat = ema(heat, hDelay.get(t, 2.5), dt, 3);
        var hv = clamp(heat, 0, 100);
        mercury.setAttribute("y", (TY + 30 - hv).toFixed(1));
        mercury.setAttribute("height", hv.toFixed(1));
        waves.setAttribute("opacity", (hv / 100).toFixed(2));
        return { detect: o.detect, value: o.detect, invert: false, label: "Señal de humo (cámara óptica)", heat: hv };
      },
      reset: function () { opt.reset(); heat = 0; hDelay.reset(); }
    };
  }

  /* =========================================================
     6. TÉRMICO (comparación)
     ========================================================= */
  function thermal(svg, ctl) {
    var FX = 300, FY = 296;
    svg.appendChild(s("rect", { x: 0, y: 0, width: 600, height: 26, class: "fl" }));
    svg.appendChild(s("line", { x1: 0, y1: 300, x2: 600, y2: 300, class: "st" }));
    svg.appendChild(s("path", { d: "M260 26 h80 v10 q0 22 -40 22 q-40 0 -40 -22z", class: "fl" }));
    var bulb = s("circle", { cx: 300, cy: 66, r: 8, fill: "var(--warn)" });
    svg.appendChild(bulb);
    svg.appendChild(text(352, 52, "termistor (no tiene cámara de humo)", "lbl"));
    var ignored = text(300, 120, "", "lbl-strong", "middle");
    svg.appendChild(ignored);
    var waves = s("g", { opacity: 0 });
    for (var i = 0; i < 5; i++) waves.appendChild(s("path", { class: "heat-wave", d: "M" + (270 + i * 15) + " 270 q 8 -14 0 -28 q -8 -14 0 -28 q 8 -14 0 -28" }));
    svg.appendChild(waves);
    var smokeLayer = s("g");
    svg.appendChild(smokeLayer);
    var smoke = new Smoke(smokeLayer, 150);
    var src = s("g"); svg.appendChild(src);
    var drawSrc = sourceIcon(src, FX, FY);
    var heat = 0, delay = new DelayLine(), wv = 0;

    return {
      step: function (dt, t) {
        drawSrc(ctl.type, ctl.density > 0);
        smoke.emit(ctl.density / 100 * 14, dt, function () { return particle(ctl, FX + rand(-8, 8), FY - 28, rand(-6, 6), rand(-55, -45), 14); });
        smoke.update(dt, function (p, dt) {
          if (p.y < 80) { p.vy = ema(p.vy, 0, dt, 0.4); if (Math.abs(p.vx) < 15) p.vx = (p.x < FX ? -1 : 1) * rand(25, 40); }
          else p.vx += noise(30) * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
        });
        delay.push(t, ctl.density * (APP.techById("termico").factors[ctl.type] || 0));
        heat = ema(heat, delay.get(t, 3), dt, 3.5);
        var hv = clamp(heat + noise(0.8), 0, 100);
        wv = (wv + dt * 30) % 28;
        waves.setAttribute("opacity", (hv / 100).toFixed(2));
        waves.setAttribute("transform", "translate(0 " + (-wv).toFixed(1) + ")");
        ignored.textContent = ctl.density > 20 && hv < 20 ? "Hay humo, pero el sensor solo mide temperatura" : "";
        bulb.setAttribute("r", (8 + hv / 25).toFixed(1));
        return { detect: hv, value: hv, invert: false, label: "Subida de temperatura (escala didáctica)" };
      },
      reset: function () { smoke.clear(); heat = 0; delay.reset(); }
    };
  }

  APP.scenes = { optico: optical, ionico: ionic, haz: beamScene, aspiracion: aspirating, multisensor: multisensor, termico: thermal };
})();
