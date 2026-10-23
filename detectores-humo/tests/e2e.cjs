/*
 * Pruebas de extremo a extremo con Playwright (Chromium).
 * Uso:  node tests/e2e.cjs            (abre index.html con file://)
 *       BASE_URL=http://localhost:8000 node tests/e2e.cjs
 * Requiere el paquete "playwright" (global o local).
 */
const path = require("path");
let playwright;
try { playwright = require("playwright"); } catch (e) {
  playwright = require(path.join(process.execPath, "../../lib/node_modules/playwright"));
}
const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.BASE_URL || "file://" + ROOT + "/index.html";
const url = (hash) => (BASE.endsWith(".html") ? BASE : BASE.replace(/\/$/, "") + "/index.html") + "#" + hash;

let passed = 0, failed = 0;
const results = [];
async function test(name, fn) {
  try { await fn(); passed++; results.push("  ✓ " + name); }
  catch (e) { failed++; results.push("  ✗ " + name + "\n      " + (e && e.message ? e.message.split("\n").slice(0, process.env.VERBOSE ? 14 : 1).join("\n      ") : e)); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || "assert failed"); }
const status = (p) => p.textContent(".status[data-level]");

(async () => {
  const browser = await playwright.chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("dialog", (d) => d.accept());

  const ROUTES = ["inicio", "lab", "tech", "sim", "manual", "galeria", "retos", "glosario", "fuentes"];

  await test("Todas las rutas cargan su módulo", async () => {
    for (const r of ROUTES) {
      await page.goto(url(r));
      await page.waitForSelector("#view h1");
      const active = await page.getAttribute(`.nav a[href="#${r}"]`, "aria-current");
      assert(active === "page", "nav activo en " + r);
    }
  });

  await test("Navegación por el menú lateral", async () => {
    await page.goto(url("inicio"));
    for (const r of ROUTES.slice(1)) {
      await page.click(`.nav a[href="#${r}"]`);
      await page.waitForFunction((r) => location.hash === "#" + r, r);
      assert((await page.textContent("#view h1")).length > 3, "h1 en " + r);
    }
  });

  await test("Todos los enlaces internos apuntan a módulos existentes", async () => {
    for (const r of ROUTES) {
      await page.goto(url(r));
      await page.waitForTimeout(150);
      const bad = await page.evaluate(() => Array.from(document.querySelectorAll('a[href^="#"]'))
        .map((a) => a.getAttribute("href").slice(1).split("/")[0])
        .filter((id) => id && id !== "view" && !APP.modules[id]));
      assert(!bad.length, "enlaces rotos en " + r + ": " + bad.join(","));
    }
  });

  await test("Inicio: calentamiento ¿detecta humo?", async () => {
    await page.goto(url("inicio"));
    const cards = await page.$$(".fact .row");
    assert(cards.length === 6, "6 tarjetas");
    for (const c of cards) await (await c.$("button")).click();
    const txt = await page.textContent(".panel-title p");
    assert(/Aciertos: \d \/ 6/.test(txt) && txt.includes("Completado"), txt);
  });

  /* ---------- Módulo B ---------- */
  async function setDensity(v) {
    await page.fill("#ctl-density", String(v));
    await page.dispatchEvent("#ctl-density", "input");
  }
  async function setSens(v) {
    await page.fill("#ctl-sens", String(v));
    await page.dispatchEvent("#ctl-sens", "input");
  }
  async function waitStatus(re, ms) {
    await page.waitForFunction((src) => new RegExp(src, "i").test(document.querySelector("#tech-body .status").textContent), re.source, { timeout: ms || 15000 });
  }

  await test("B · Óptico: fuego lento provoca alarma y completa el experimento", async () => {
    await page.goto(url("tech"));
    await page.evaluate(() => { localStorage.clear(); });
    await page.goto(url("tech"));
    await page.click('[data-tech="optico"]');
    await setDensity(80);
    await waitStatus(/alarma/);
    await page.waitForSelector('.tasks li.done[data-task="0"]');
  });

  await test("B · Óptico: al ventilar (humo 0) vuelve a reposo", async () => {
    await setDensity(0);
    await waitStatus(/reposo/, 20000);
  });

  await test("B · Óptico: vapor provoca falsa alarma", async () => {
    await page.click('[data-type="vapor"]');
    await setDensity(100);
    await waitStatus(/alarma/);
    await page.waitForSelector('.tasks li.done[data-task="2"]');
  });

  await test("B · Óptico: modo oscurecimiento invierte la medida", async () => {
    await page.click('[data-mode="obsc"]');
    await page.waitForFunction(() => document.querySelector("#tech-body .meter-head span").textContent.includes("receptor"));
    await page.waitForSelector('.tasks li.done[data-task="3"]', { timeout: 15000 });
  });

  await test("B · Pausa detiene la simulación y Reiniciar pone el humo a 0", async () => {
    await page.click("#btn-pause");
    const a = await page.textContent("#tech-body .meter-head strong");
    await page.waitForTimeout(800);
    const b = await page.textContent("#tech-body .meter-head strong");
    assert(a === b, "la medida no cambia en pausa");
    assert((await page.textContent("#btn-pause")) === "Reanudar");
    await page.click("#btn-pause");
    await page.click("#btn-reset");
    assert((await page.inputValue("#ctl-density")) === "0");
  });

  await test("B · Iónico: llama provoca alarma; corriente baja", async () => {
    await page.click('[data-tech="ionico"]');
    await page.click('[data-type="llama"]');
    await setDensity(80);
    await waitStatus(/alarma/);
    const label = await page.textContent("#tech-body .meter-head span");
    assert(label.includes("Corriente"), label);
    const v = parseInt(await page.textContent("#tech-body .meter-head strong"), 10);
    assert(v < 50, "corriente < 50: " + v);
  });

  await test("B · Haz: palé en el haz da AVERÍA, no alarma", async () => {
    await page.click('[data-tech="haz"]');
    await page.click("#btn-block");
    await waitStatus(/aver/, 8000);
    await page.click("#btn-block");
    await waitStatus(/reposo/, 8000);
  });

  await test("B · Haz: con estratificación el humo no alcanza el haz", async () => {
    await page.click("#btn-strat");
    await setDensity(100);
    await page.waitForSelector('.tasks li.done[data-task="1"]', { timeout: 20000 });
    assert(!/alarma/i.test(await status(page)), "sin alarma");
    await page.click("#btn-strat");
    await waitStatus(/alarma/, 20000);
  });

  await test("B · Aspiración: mide el retardo de transporte", async () => {
    await page.click('[data-tech="aspiracion"]');
    await setDensity(60);
    await page.waitForFunction(() => /Retardo observado/.test(document.querySelector("#tech-body").textContent), null, { timeout: 25000 });
    await page.waitForSelector('.tasks li.done[data-task="0"]');
  });

  await test("B · Multisensor: vapor sin calor no da alarma; llama sí", async () => {
    await page.click('[data-tech="multisensor"]');
    await page.click('[data-type="vapor"]');
    await setDensity(70);
    await waitStatus(/esperando/, 15000);
    await page.waitForTimeout(1500);
    assert(!/^alarma$/i.test((await status(page)).trim()), "no alarma con vapor");
    await page.click('[data-type="llama"]');
    await waitStatus(/^alarma$/, 20000);
  });

  await test("B · Térmico: vapor al 100 % no da alarma; llama sí", async () => {
    await page.click('[data-tech="termico"]');
    await page.click('[data-type="vapor"]');
    await setDensity(100);
    await page.waitForTimeout(6000);
    assert(!/alarma/i.test(await status(page)), "sin alarma con vapor");
    await page.click('[data-type="llama"]');
    await waitStatus(/alarma/, 20000);
  });

  await test("B · Comparador: añadir/quitar tecnologías cambia la tabla", async () => {
    await page.click('[data-tech="compare"]');
    const cols = async () => (await page.$$(".compare-table thead th")).length;
    const before = await cols();
    await page.click('[data-cmp="haz"]');
    assert((await cols()) === before + 1, "añade columna");
    await page.click('[data-cmp="haz"]');
    assert((await cols()) === before, "quita columna");
  });

  /* ---------- Módulo A ---------- */
  await test("A · Componentes: los puntos actualizan la ficha", async () => {
    await page.goto(url("lab"));
    await page.click('[data-dtype="autonomo"]');
    await page.click('.hotspot[data-part="zumbador"]', { force: true }); // el anillo animado nunca está «quieto»
    assert((await page.textContent(".part-info h3")).includes("Zumbador"));
    await page.click('.part-list button[data-part="led"]');
    assert((await page.textContent(".part-info h3")).includes("LED"));
  });

  await test("A · Cableado a central: la pila «No aplica»", async () => {
    await page.click('[data-dtype="central"]');
    await page.click('.part-list button[data-part="bateria"]');
    assert((await page.textContent(".part-info")).includes("No aplica"));
    await page.click('[data-dtype="autonomo"]');
  });

  async function labStatus(re, ms) {
    await page.waitForFunction((src) => new RegExp(src, "i").test(document.querySelector(".split .status").textContent), re.source, { timeout: ms || 15000 });
  }

  await test("A · Autónomo: humo → alarma → ventilar → reposo", async () => {
    await page.click("#lab-restart");
    await page.click("#lab-smoke");
    await labStatus(/humo presente/, 2000);
    await labStatus(/alarma/, 12000);
    await page.click("#lab-vent");
    await labStatus(/reposo/, 15000);
  });

  await test("A · Botón de prueba (también desde el dibujo)", async () => {
    await page.click("#lab-test");
    await labStatus(/prueba/, 1500);
    await labStatus(/reposo/, 6000);
    await page.click('[data-press="test"]');
    await labStatus(/prueba/, 1500);
    await labStatus(/reposo/, 6000);
  });

  await test("A · Batería baja y cambio de pila", async () => {
    await page.click("#lab-batt");
    await labStatus(/bater/, 1500);
    await page.click("#lab-fix");
    await labStatus(/reposo/, 1500);
  });

  await test("A · Central: la alarma queda memorizada hasta rearmar", async () => {
    await page.click('[data-dtype="central"]');
    await page.click("#lab-smoke");
    await labStatus(/alarma/, 12000);
    assert((await page.textContent("#panel-text")) === "ALARMA ZONA 1");
    await page.click("#lab-vent");
    await page.waitForTimeout(7000);
    assert(/alarma/i.test(await page.textContent(".split .status")), "sigue en alarma tras ventilar");
    await page.click("#lab-reset-panel");
    await labStatus(/reposo/, 3000);
    assert((await page.textContent("#panel-text")) === "SISTEMA NORMAL");
  });

  await test("A · Radio: la central recibe el aviso", async () => {
    await page.click('[data-dtype="radio"]');
    await page.click("#lab-test");
    await page.waitForFunction(() => document.querySelector("#panel-text").textContent === "PRUEBA DETECTOR");
    await labStatus(/reposo/, 6000);
    assert((await page.$$(".event-log li")).length > 3, "registro de eventos");
  });

  /* ---------- Módulo C ---------- */
  await test("C · Resolver un escenario completo y guardar la puntuación", async () => {
    await page.goto(url("sim"));
    await page.click('[data-scn="dormitorio"]');
    await page.click('.option[data-opt="0"]');
    assert((await page.$$(".option.v-ok, .option.v-bad, .option.v-cond")).length === 4, "todas las opciones explicadas");
    await page.click("#scn-next");
    await page.click('.option[data-opt="0"]');
    await page.click("#scn-next");
    assert((await page.textContent(".result-big")).trim() === "4 / 4");
    await page.reload();
    await page.waitForSelector('[data-scn="dormitorio"] .done-mark');
  });

  await test("C · Todos los escenarios se pueden recorrer", async () => {
    for (const id of ["cocina", "nave", "cpd", "conducto"]) {
      await page.click(`[data-scn="${id}"]`);
      await page.click('.option[data-opt="1"]');
      await page.click("#scn-next");
      await page.click('.option[data-opt="0"]');
      await page.click("#scn-next");
      await page.waitForSelector(".result-big");
    }
  });

  /* ---------- Módulo F ---------- */
  async function answerAll(clickCorrect) {
    for (let i = 0; i < 20; i++) {
      if (await page.$("#q-result")) return;
      await page.click('.option[data-opt="0"]');
      await page.click("#q-next");
    }
  }
  await test("F · Cuestionario: 10 preguntas con corrección y resultado", async () => {
    await page.goto(url("retos"));
    await page.click('[data-game="quiz"]');
    await page.click('.option[data-opt="0"]');
    await page.waitForSelector(".feedback");
    await page.click("#q-next");
    await answerAll();
    const r = await page.textContent("#q-result");
    assert(/\/ 10$/.test(r), r);
    assert((await page.$$(".review-list li")).length === 10);
    await page.click("#q-retry");
    await page.waitForSelector('.option[data-opt="0"]');
  });

  await test("F · Emparejar: resolver todas las parejas", async () => {
    await page.click('[data-game="match"]');
    await page.click('.match-item[data-side="L"][data-i="0"]');
    await page.click('.match-item[data-side="R"][data-i="1"]');
    assert((await page.textContent(".q-head")).includes("Errores: 1"));
    for (let i = 0; i < 8; i++) {
      await page.click(`.match-item[data-side="L"][data-i="${i}"]`);
      await page.click(`.match-item[data-side="R"][data-i="${i}"]`);
    }
    const txt = await page.textContent("#match-done");
    assert(txt.includes("7 / 8"), txt);
  });

  await test("F · ¿Qué tecnología es?, casos y reto final", async () => {
    for (const g of ["identify", "cases", "final"]) {
      await page.click(`[data-game="${g}"]`);
      await answerAll();
      await page.waitForSelector("#q-result");
    }
    const tiles = await page.$$eval(".score-tile b", (els) => els.map((e) => e.textContent));
    assert(tiles.filter((t) => t !== "—").length === 5, "5 récords: " + tiles.join(","));
  });

  /* ---------- Módulos D, E, G ---------- */
  await test("D · Manual: estado vacío y demostración del formato", async () => {
    await page.goto(url("manual"));
    await page.waitForSelector("#manual-empty");
    await page.click("#manual-demo");
    await page.waitForSelector(".mblock.mb-traduccion");
    assert((await page.textContent("#view")).includes("EJEMPLO DE FORMATO"));
    await page.click('[data-filter="aviso"]');
    const n = await page.$$eval('[role="tabpanel"] .mblock', (els) => els.map((e) => e.getAttribute("data-btype")));
    assert(n.length === 1 && n[0] === "aviso", n.join(","));
    await page.click('[data-sec="alimentacion"]'); // con el filtro «aviso» queda vacía
    await page.waitForSelector('[role="tabpanel"] .empty-state');
  });

  await test("E · Galería: filtro, ficha y reto", async () => {
    await page.goto(url("galeria"));
    const all = (await page.$$(".g-card")).length;
    await page.click('[data-f="haz"]');
    assert((await page.$$(".g-card")).length === 1 && all === 8, "filtro");
    await page.click(".g-card .btn");
    await page.waitForSelector("dialog.modal[open]");
    await page.keyboard.press("Escape");
    await page.click('.option[data-gq="ok"]');
    await page.waitForSelector("#gq-next");
  });

  await test("G · Glosario: búsqueda y filtro por letra", async () => {
    await page.goto(url("glosario"));
    await page.fill("#gl-search", "sensibilidad");
    await page.waitForFunction(() => document.querySelectorAll(".gl-item").length >= 1 && document.querySelectorAll(".gl-item").length < 6);
    assert((await page.$$("mark")).length > 0, "resaltado");
    await page.fill("#gl-search", "");
    await page.dispatchEvent("#gl-search", "input");
    await page.click('[data-l="D"]');
    const terms = await page.$$eval(".gl-item h3", (e) => e.map((x) => x.textContent));
    assert(terms.length && terms.every((t) => t.startsWith("D")), terms.join(","));
  });

  /* ---------- General ---------- */
  await test("Tema claro/oscuro y sonido se recuerdan", async () => {
    await page.goto(url("inicio"));
    await page.click("#theme-btn");
    const t1 = await page.getAttribute("html", "data-theme");
    await page.reload();
    assert((await page.getAttribute("html", "data-theme")) === t1, "tema persistente");
    await page.click("#sound-btn");
    assert((await page.getAttribute("#sound-btn", "aria-pressed")) === "true");
    await page.click("#sound-btn");
  });

  await test("Móvil: menú desplegable y sin desbordamiento horizontal", async () => {
    const m = await (await browser.newContext({ viewport: { width: 375, height: 760 } })).newPage();
    m.on("pageerror", (e) => errors.push("móvil: " + e.message));
    for (const r of ROUTES) {
      await m.goto(url(r));
      await m.waitForTimeout(250);
      const [sw, iw] = await m.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      assert(sw <= iw, `desbordamiento en ${r}: ${sw} > ${iw}`);
    }
    await m.click("#menu-btn");
    assert(await m.evaluate(() => document.body.classList.contains("nav-open")), "menú abierto");
    await m.click('.nav a[href="#retos"]');
    await m.waitForFunction(() => location.hash === "#retos" && !document.body.classList.contains("nav-open"));
  });

  await test("Sin errores de JavaScript en toda la sesión", async () => {
    assert(!errors.length, errors.join(" | "));
  });

  await browser.close();
  console.log("\nPruebas (" + BASE + ")\n" + results.join("\n"));
  console.log(`\n${passed} correctas, ${failed} fallidas`);
  process.exit(failed ? 1 : 0);
})();
