# Cómo integrar el manual original

1. Guarda el PDF original en esta carpeta, por ejemplo `manual/original.pdf`. No lo modifiques.
2. Si vas a usar imágenes del manual, recórtalas y guárdalas en `manual/img/`. Indica siempre la página de la que salen.
3. Edita `js/data/manual.js`:
   - Pon `loaded: true`.
   - Rellena `device` (fabricante, modelo, tipo, idioma, `file: "manual/original.pdf"`).
   - Añade bloques en cada sección de `sections`.

## Tipos de bloque

| type | Para qué | Campos |
|---|---|---|
| `original` | Texto tal como aparece | `page`, `text` |
| `traduccion` | Traducción fiel (mismos valores, unidades y advertencias) | `page`, `text` |
| `explicacion` | Explicación didáctica propia | `text` |
| `aviso` | Advertencia del fabricante, traducida fielmente | `page`, `text` |
| `dato` | Valor técnico copiado sin redondear | `label`, `value`, `page` |
| `duda` | Texto ilegible o ambiguo | `page`, `text` |
| `imagen` | Figura del manual | `src`, `caption`, `source` |

Ejemplo:

```js
{ id: "prueba", title: "Prueba", blocks: [
  { type: "original",    page: 4, text: "Press the test button for 3 seconds." },
  { type: "traduccion",  page: 4, text: "Pulse el botón de prueba durante 3 segundos." },
  { type: "explicacion", text: "Así se comprueba que suena el aviso. No uses humo ni fuego." }
] }
```

## Reglas

- No inventes nada que no esté en el manual. Si falta un dato, deja la sección vacía.
- No redondees valores ni cambies unidades en la traducción.
- Si algo no se lee o admite dos interpretaciones, usa un bloque `duda`.
- La explicación didáctica nunca sustituye a una instrucción del fabricante.
