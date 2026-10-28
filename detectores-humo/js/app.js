/* Arranque: tema, sonido, menú móvil y enrutador */
(function () {
  "use strict";
  var root = document.documentElement;

  var theme = APP.store.get("theme", null);
  if (theme) root.setAttribute("data-theme", theme);
  document.getElementById("theme-btn").addEventListener("click", function () {
    var isDark = root.getAttribute("data-theme")
      ? root.getAttribute("data-theme") === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    APP.store.set("theme", next);
  });

  var soundBtn = document.getElementById("sound-btn");
  function paintSound() {
    var on = APP.store.get("sound", false);
    soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
    soundBtn.title = "Sonido de los simuladores (" + (on ? "activado" : "desactivado") + ")";
  }
  soundBtn.addEventListener("click", function () {
    APP.store.set("sound", !APP.store.get("sound", false));
    paintSound();
    APP.util.toast(APP.store.get("sound", false) ? "Sonido activado (volumen bajo)" : "Sonido desactivado");
    APP.util.beep(2400, 80);
  });
  paintSound();

  /* Modo presentación: letra grande, sin textos largos y pantalla completa si se puede */
  var presentBtn = document.getElementById("present-btn");
  function setPresent(on) {
    document.body.classList.toggle("present", on);
    presentBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  presentBtn.addEventListener("click", function () {
    var on = !document.body.classList.contains("present");
    setPresent(on);
    try {
      if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
      if (!on && document.fullscreenElement) document.exitFullscreen().catch(function () {});
    } catch (e) { /* pantalla completa no disponible */ }
  });
  document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement) setPresent(false); });

  APP.route();
})();
