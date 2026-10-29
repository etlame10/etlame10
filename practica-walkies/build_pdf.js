// Genera practica-walkies-rt5r.pdf a partir de README.md.
// Uso: node build_pdf.js "Nombre Apellidos" "Curso"
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const dir = __dirname;
const alumno = process.argv[2] || '______________________________';
const curso = process.argv[3] || '______________';

let md = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
// Fuera del PDF: título (va en portada), nota de borrador y lista de pendientes.
md = md.replace(/^# .*\n/, '')
  .replace(/^> BORRADOR[^\n]*\n/m, '')
  .replace(/\n## Pendiente[\s\S]*$/, '\n');
// Hueco para la foto anotada en el apartado 3.
md = md.replace(/(## 3\. [^\n]*\n)/,
  '$1\n<div class="foto">Pegar aquí la foto del RT-5R con cada botón y potenciómetro señalado</div>\n');

const body = execFileSync('pandoc', ['-f', 'gfm', '-t', 'html'], { input: md }).toString();
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'img/cabecera.png')).toString('base64');
const hoy = new Date().toLocaleDateString('es-ES');

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: "DejaVu Sans", sans-serif; font-size: 10pt; color: #222; line-height: 1.4; }
  h2 { color: #c8102e; border-bottom: 2px solid #c8102e; padding-bottom: 2px; margin-top: 18px; font-size: 13pt; }
  h3 { color: #5b6770; font-size: 11pt; }
  h2, h3 { page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 8px 0; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #999; padding: 4px 6px; vertical-align: top; }
  th { background: #eef0f2; }
  blockquote { page-break-inside: avoid; border-left: 3px solid #5b6770; margin: 6px 0; padding: 2px 10px; color: #444; }
  a { color: #1a4e8a; word-break: break-all; }
  .portada { height: 900px; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
  .portada h1 { font-size: 22pt; color: #c8102e; margin-bottom: 4px; }
  .portada .sub { font-size: 13pt; color: #5b6770; margin-bottom: 60px; }
  .portada td { border: none; border-bottom: 1px solid #999; padding: 10px 6px; font-size: 11pt; }
  .foto { page-break-inside: avoid; border: 2px dashed #999; height: 260px; display: flex; align-items: center; justify-content: center; color: #888; margin: 10px 0; }
  h2 + table tr td:empty { height: 28px; }
  td:last-child:empty::after { content: "\\00a0"; }
</style></head><body>
<div class="portada">
  <h1>Comunicaciones half-duplex con walkies</h1>
  <div class="sub">Práctica con el Retevis RT-5R</div>
  <table>
    <tr><td><b>Alumno/a</b></td><td>${alumno}</td></tr>
    <tr><td><b>Curso</b></td><td>${curso}</td></tr>
    <tr><td><b>Módulo</b></td><td>Dpt. de Telecomunicaciones</td></tr>
    <tr><td><b>Fecha</b></td><td>${hoy}</td></tr>
  </table>
</div>
${body}
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({
    path: path.join(dir, 'practica-walkies-rt5r.pdf'),
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;padding:0 18mm;"><img src="${logo}" style="height:11mm;"></div>`,
    footerTemplate: `<div style="width:100%;font-size:8pt;color:#777;text-align:right;padding:0 18mm;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`,
    margin: { top: '28mm', bottom: '18mm', left: '18mm', right: '18mm' },
  });
  await browser.close();
})();
