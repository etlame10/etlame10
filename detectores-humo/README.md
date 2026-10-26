# Simulador de detectores de humo

Página interactiva para ver **cómo detecta el humo cada tipo de detector**: óptico, iónico, de haz, por aspiración, multisensor y térmico (este último, para comparar).

Eliges un detector, cambias el tipo de humo, la cantidad y la sensibilidad, y ves qué pasa dentro: luz, iones, señal y alarma. Cada detector trae experimentos guiados que se marcan solos y una explicación plegable con ventajas, limitaciones y fuentes.

## Cómo ejecutarla

Sin instalar nada ni conexión: abre `index.html`, o `dist/detectores-humo.html` (todo en un archivo; se regenera con `python3 tools/bundle.py`).

Con servidor local: `python3 -m http.server 8000` y abre http://localhost:8000.

## Pruebas

`node tests/e2e.cjs` (necesita Playwright con Chromium).

## Aviso

Es una representación didáctica: las escalas y respuestas no son medidas de ningún equipo y no sustituyen la prueba real que indique el fabricante. Nunca se debe generar humo ni fuego para probar un detector.

## Estructura

`index.html` · `css/styles.css` · `js/core.js` · `js/art.js` (medidores) · `js/scenes.js` (animaciones) · `js/data/` (contenido y fuentes) · `js/modules/tech.js` (pantalla del simulador).
