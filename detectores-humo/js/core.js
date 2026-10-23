/*
 * Núcleo de la aplicación: espacio de nombres, utilidades DOM/SVG,
 * almacenamiento seguro, referencias y enrutador por hash.
 * Se usan scripts clásicos (no módulos ES) para que la app funcione
 * también abriendo index.html directamente, sin servidor.
 */
window.APP = window.APP || {};
APP.data = APP.data || {};
APP.modules = APP.modules || {};

(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";

  /* Crea un elemento HTML: h("div", {class: "x", onclick: fn}, [hijos]) */
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    applyAttrs(el, attrs);
    append(el, children);
    return el;
  }

  /* Igual que h() pero en el espacio de nombres SVG */
  function s(tag, attrs, children) {
    var el = document.createElementNS(SVGNS, tag);
    applyAttrs(el, attrs, true);
    append(el, children);
    return el;
  }

  function applyAttrs(el, attrs, isSvg) {
    if (!attrs) return;
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === undefined || v === null || v === false) return;
      if (k.indexOf("on") === 0 && typeof v === "function") {
        el.addEventListener(k.slice(2), v);
      } else if (k === "text") {
        el.textContent = v;
      } else if (k === "html") {
        el.innerHTML = v;
      } else if (k === "class" && !isSvg) {
        el.className = v;
      } else {
        el.setAttribute(k, v === true ? "" : v);
      }
    });
  }

  function append(el, children) {
    if (children === undefined || children === null) return;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* localStorage puede fallar (modo privado, file://): nunca debe romper la app */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem("dh:" + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem("dh:" + key, JSON.stringify(value)); } catch (e) { /* sin persistencia */ }
    },
    remove: function (key) {
      try { window.localStorage.removeItem("dh:" + key); } catch (e) { /* nada */ }
    }
  };

  /* Progreso: qué módulos se han visitado y mejores puntuaciones */
  var progress = {
    visit: function (id) {
      var v = store.get("visited", {});
      v[id] = true;
      store.set("visited", v);
    },
    visited: function () { return store.get("visited", {}); },
    best: function (game) { return store.get("best:" + game, null); },
    saveBest: function (game, score, total) {
      var prev = store.get("best:" + game, null);
      if (!prev || score / total > prev.score / prev.total) {
        store.set("best:" + game, { score: score, total: total });
        return true;
      }
      return false;
    },
    reset: function () {
      store.remove("visited");
      ["quiz", "match", "identify", "cases", "final", "sim"].forEach(function (g) { store.remove("best:" + g); });
    }
  };

  /* Bloque de referencias visibles para una lista de ids de fuentes */
  function sourcesBlock(ids, title) {
    var list = (ids || []).map(function (id) { return APP.data.sources[id]; }).filter(Boolean);
    if (!list.length) {
      return h("div", { class: "refs refs-empty" }, [
        h("span", { class: "refs-title", text: title || "Fuentes" }),
        h("span", { text: "Sin referencia verificada en esta versión: contenido de carácter general." })
      ]);
    }
    return h("details", { class: "refs" }, [
      h("summary", { class: "refs-title", text: (title || "Fuentes") + " (" + list.length + ")" }),
      h("ul", null, list.map(function (src) {
        return h("li", null, [
          h("a", { href: src.url, target: "_blank", rel: "noopener", text: src.title }),
          h("span", { class: "refs-meta", text: " — " + src.publisher + ". " + src.access })
        ]);
      }))
    ]);
  }

  /* Etiqueta de alcance de la información */
  var SCOPE = {
    general: { label: "General", cls: "tag-general", tip: "Válido para la mayoría de detectores de este tipo" },
    modelo: { label: "Según modelo", cls: "tag-model", tip: "Varía según el fabricante: consulta su manual" },
    algunos: { label: "Solo algunos tipos", cls: "tag-some", tip: "No está presente en todos los detectores" },
    didactico: { label: "Representación didáctica", cls: "tag-didactic", tip: "Simplificación para aprender, no un dato real" }
  };
  function scopeTag(kind) {
    var d = SCOPE[kind] || SCOPE.general;
    return h("span", { class: "tag " + d.cls, title: d.tip, text: d.label });
  }

  function techById(id) {
    return APP.data.technologies.filter(function (t) { return t.id === id; })[0];
  }

  /* Aviso breve en pantalla */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* -------- Enrutador --------
   * Cada módulo registra { id, title, render(container), destroy() }.
   * destroy() detiene animaciones y temporizadores al salir.
   */
  var current = null;
  function route() {
    var id = (location.hash || "#inicio").slice(1).split("/")[0] || "inicio";
    var mod = APP.modules[id] || APP.modules.inicio;
    var view = document.getElementById("view");
    if (current && current.destroy) {
      try { current.destroy(); } catch (e) { console.error(e); }
    }
    clear(view);
    current = mod;
    try {
      mod.render(view);
    } catch (e) {
      console.error(e);
      view.appendChild(h("div", { class: "panel error-panel" }, [
        h("h2", { text: "Algo ha fallado al cargar este módulo" }),
        h("p", { text: String(e && e.message ? e.message : e) }),
        h("a", { class: "btn", href: "#inicio", text: "Volver al inicio" })
      ]));
    }
    progress.visit(mod.id);
    document.title = mod.title + " · Detectores de humo";
    document.querySelectorAll(".nav a").forEach(function (a) {
      var active = a.getAttribute("href") === "#" + mod.id;
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.body.classList.remove("nav-open");
    var menuBtn = document.getElementById("menu-btn");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  /* Gestión de animaciones: un único bucle por vista */
  function loop(fn) {
    var running = true, last = performance.now(), raf = 0;
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      try { fn(dt, t); } catch (e) { running = false; console.error(e); return; }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return {
      stop: function () { running = false; cancelAnimationFrame(raf); },
      get running() { return running; }
    };
  }

  /* Pitido opcional con Web Audio (desactivado por defecto) */
  var audioCtx = null;
  function beep(freq, ms) {
    if (!store.get("sound", false)) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "square"; o.frequency.value = freq || 3100;
      g.gain.value = 0.03;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + (ms || 120) / 1000);
    } catch (e) { /* audio no disponible */ }
  }

  APP.util = { h: h, s: s, clear: clear, shuffle: shuffle, rand: rand, clamp: clamp, loop: loop, beep: beep, toast: toast };
  APP.store = store;
  APP.progress = progress;
  APP.sourcesBlock = sourcesBlock;
  APP.scopeTag = scopeTag;
  APP.techById = techById;
  APP.route = route;
  APP.register = function (mod) { APP.modules[mod.id] = mod; };
})();
