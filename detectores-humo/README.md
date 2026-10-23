# Detectores de humo · Laboratorio interactivo

Aplicación web educativa para aprender cómo funcionan los detectores de humo **experimentando**: simulaciones animadas, decisiones razonadas y retos con corrección inmediata.

Proyecto 1 del ciclo de Instalaciones de Telecomunicaciones (CCTV / seguridad), 2.º curso.

## Cómo ejecutarla

No necesita instalar nada ni conexión a internet.

**Opción 1 — abrir directamente:** haz doble clic en `index.html`.

**Opción 2 — servidor local (recomendado en clase):**

```bash
cd detectores-humo
python3 -m http.server 8000
# abre http://localhost:8000
```

También vale `npx serve .` o `npm start` (usa Python).

Solo los enlaces a las fuentes externas necesitan internet.

## Módulos

| | Módulo | Qué se hace |
|---|---|---|
| A | Laboratorio | Detector genérico en corte con 9 componentes seleccionables. Tres tipos de instalación (autónomo, por radio, con central de incendios). Estados: reposo, humo, alarma, prueba y batería baja/avería. Registro de eventos. |
| B | ¿Cómo detecta el humo? | Seis simulaciones SVG animadas: óptico (luz dispersa y oscurecimiento), iónico, haz, aspiración, multisensor y térmico (para comparar). Tipo de humo, cantidad y sensibilidad ajustables, gráfica de la señal en el tiempo y experimentos guiados que se marcan solos. Comparador. |
| C | Simulador de situaciones | Cinco escenarios (cocina, dormitorio, nave, CPD, conducto) con dos decisiones cada uno. Todas las opciones se explican y la puntuación se guarda. |
| D | Manual del detector | Visor preparado para el manual real: pestañas por sección, y la traducción fiel separada de la explicación, las advertencias y las dudas. **Vacío hasta tener el manual** (ver `manual/README.md`). |
| E | Identificación | Fichas con ilustraciones esquemáticas, filtro, detalle y un reto de identificación. |
| F | Retos | Cuestionario, emparejar, «¿qué tecnología es?», casos prácticos y reto final, con marcador de récords. |
| G | Glosario | 17 términos con búsqueda, filtro por letra, ejemplo y enlace al módulo donde se practica. |

## Criterios de contenido

- Cada contenido lleva una etiqueta: **General**, **Según modelo**, **Solo algunos tipos** o **Representación didáctica**.
- Las simulaciones usan un modelo cualitativo: no muestran tiempos, distancias ni umbrales reales.
- Las fuentes se ven en cada módulo y en la página *Fuentes* (`js/data/sources.js`). Las normas de pago solo se citan por su alcance.
- No se usan fotos generadas como si fueran productos reales.

## Estructura

```
index.html            página única
css/styles.css        estilos (tema claro/oscuro)
js/core.js            utilidades, almacenamiento y enrutador
js/art.js             ilustraciones SVG y medidores
js/scenes.js          simulaciones animadas del Módulo B
js/data/*.js          contenido (textos, preguntas, fuentes, manual)
js/modules/*.js       un archivo por módulo
manual/               aquí va el manual original (ver README)
tests/e2e.cjs         pruebas automáticas con Playwright
```

Se usan scripts clásicos (no módulos ES) para que funcione también abriendo el archivo sin servidor. No hay dependencias externas.

## Pruebas

```bash
node tests/e2e.cjs                                   # con file://
BASE_URL=http://localhost:8000 node tests/e2e.cjs    # con servidor
```

Hay 34 comprobaciones: navegación, enlaces, cada simulación, estados del laboratorio, escenarios, juegos, manual, galería, glosario, tema, vista móvil y ausencia de errores de JavaScript. Necesitan el paquete `playwright` con Chromium.
