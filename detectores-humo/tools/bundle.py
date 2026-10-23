"""Genera dist/detectores-humo.html: la app completa en un único archivo.

Inserta en línea la hoja de estilos y todos los scripts de index.html.
Uso: python3 tools/bundle.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

css = (ROOT / "css/styles.css").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="css/styles.css">', "<style>\n" + css + "\n</style>")


def inline(match):
    src = match.group(1)
    code = (ROOT / src).read_text(encoding="utf-8").replace("</script", "<\\/script")
    return "<script>/* " + src + " */\n" + code + "\n</script>"


html = re.sub(r'<script src="([^"]+)"></script>', inline, html)

out = ROOT / "dist" / "detectores-humo.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB")
