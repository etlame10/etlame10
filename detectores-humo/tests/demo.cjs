/* Comprueba que cada paso de la demostración llega al estado que describe su texto.
 * node tests/demo.cjs  (tarda unos 3 minutos) */
const path = require("path");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const BASE = process.env.BASE_URL || "file://" + path.resolve(__dirname, "../index.html");
const EXPECT = {
  optico: ["ok", "alarm", "alarm", "alarm", "!alarm"],
  ionico: ["ok", "alarm", "alarm", "!alarm", "!alarm"],
  haz: ["ok", "alarm", "!alarm", "fault"],
  aspiracion: ["ok", "!fault", "alarm"],
  multisensor: ["ok", "rise", "alarm", "alarm"],
  termico: ["ok", "!alarm", "alarm", "!alarm"]
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(BASE); let fails = 0;
  for (const tech of (process.env.ONLY ? process.env.ONLY.split(",") : Object.keys(EXPECT))) {
    await p.click(`.tech-tabs [data-tech="${tech}"]`); await p.waitForTimeout(200);
    await p.click("#btn-demo"); await p.click("#demo-auto"); // sin avance automático
    for (let i = 0; i < EXPECT[tech].length; i++) {
      const exp = EXPECT[tech][i];
      let lvl, good;
      if (exp[0] === "!") {
        await p.waitForTimeout(8000);
        lvl = await p.getAttribute(".stage-head .status", "data-level"); good = lvl !== exp.slice(1);
      } else {
        // se espera hasta lo que dura el paso en la demo
        const limit = tech === "haz" && i === 1 ? 14500 : 8500;
        for (let w = 0; w < limit; w += 500) {
          await p.waitForTimeout(500);
          lvl = await p.getAttribute(".stage-head .status", "data-level");
          if (lvl === exp) break;
        }
        good = lvl === exp;
      }
      if (!good) fails++;
      console.log((good ? "OK   " : "FALLA ") + tech + " paso " + (i + 1) + ": " + lvl + " (esperado " + exp + ")");
      if (i < EXPECT[tech].length - 1) await p.click("#demo-next");
    }
    await p.click("#demo-close");
  }
  if (errs.length) { fails++; console.log("Errores JS:", errs); }
  await b.close(); console.log(fails ? fails + " fallos" : "Todo correcto"); process.exit(fails ? 1 : 0);
})();
