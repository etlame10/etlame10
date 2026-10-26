/* Pruebas del simulador: node tests/e2e.cjs  (BASE_URL opcional) */
const path = require("path");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const BASE = process.env.BASE_URL || "file://" + path.resolve(__dirname, "../index.html");
const URL_ = /\.html$/.test(BASE) ? BASE : BASE.replace(/\/?$/, "/index.html");
let fails = 0;
function ok(c, m) { console.log((c ? "OK   " : "FALLA ") + m); if (!c) fails++; }
async function set(p, id, v) { await p.evaluate(([id, v]) => { const i = document.getElementById(id); i.value = v; i.dispatchEvent(new Event("input")); }, [id, v]); }
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type() === "error" && errs.push(m.text()));
  await p.goto(URL_); await p.waitForTimeout(300);
  const tabs = await p.$$(".tech-tabs button"); ok(tabs.length === 6, "6 tecnologías en las pestañas");
  for (let i = 0; i < 6; i++) {
    await (await p.$$(".tech-tabs button"))[i].click(); await p.waitForTimeout(200);
    ok(await p.$("svg.stage") !== null, "escena " + i + " dibujada");
    await set(p, "ctl-density", 80); await p.waitForTimeout(5500);
    const st = await p.getAttribute(".stage-head .status", "data-level");
    console.log("   estado con 80 % de humo:", st);
    await set(p, "ctl-density", 0);
  }
  await (await p.$$(".tech-tabs button"))[0].click(); await p.waitForTimeout(200);
  await set(p, "ctl-density", 70); await p.waitForTimeout(6000);
  ok(await p.getAttribute(".stage-head .status", "data-level") === "alarm", "óptico con fuego lento al 70 % da alarma");
  await p.click("#btn-reset"); await p.waitForTimeout(300);
  await set(p, "ctl-density", 0); await p.waitForTimeout(3000);
  ok(await p.getAttribute(".stage-head .status", "data-level") === "ok", "sin humo vuelve a reposo");
  await p.click("#btn-pause"); ok((await p.textContent("#btn-pause")) === "Reanudar", "pausa funciona");
  await p.reload(); await p.waitForTimeout(300);
  ok((await p.getAttribute('.tech-tabs button[aria-selected="true"]', "data-tech")) === "optico", "recuerda la última pestaña");
  await p.setViewportSize({ width: 375, height: 800 }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "sin desbordamiento horizontal en móvil");
  ok(errs.length === 0, "sin errores de JavaScript" + (errs.length ? ": " + errs[0] : ""));
  await b.close(); console.log(fails ? fails + " fallos" : "Todo correcto"); process.exit(fails ? 1 : 0);
})();
