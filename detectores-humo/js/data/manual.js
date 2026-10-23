/*
 * MANUAL DEL DETECTOR (Módulo D)
 * ------------------------------------------------------------
 * Este archivo está VACÍO a propósito: no hay todavía un manual real.
 * Cuando se disponga del PDF original, se rellena siguiendo el formato
 * descrito en manual/README.md. No se debe inventar contenido.
 *
 * Tipos de bloque admitidos en "blocks":
 *   { type: "original",    page: 3, text: "Texto tal como aparece" }
 *   { type: "traduccion",  page: 3, text: "Traducción fiel al español" }
 *   { type: "explicacion", text: "Explicación didáctica propia" }
 *   { type: "aviso",       page: 4, text: "Advertencia del fabricante (traducida fielmente)" }
 *   { type: "dato",        label: "Alimentación", value: "...", page: 2 }
 *   { type: "duda",        page: 5, text: "Texto ilegible o ambiguo: qué no se entiende" }
 *   { type: "imagen",      src: "manual/img/xxx.png", caption: "...", source: "Manual, pág. 2" }
 */
APP.data.manual = {
  loaded: false,
  device: {
    manufacturer: "",
    model: "",
    type: "",          // p. ej. "Autónomo a pilas", "Inalámbrico para central antirrobo", "Convencional para central de incendios"
    language: "",      // idioma del manual original
    file: "",          // p. ej. "manual/original.pdf"
    edition: ""        // versión o fecha del manual, si aparece
  },
  sections: [
    { id: "identificacion", title: "Identificación del equipo", blocks: [] },
    { id: "instalacion", title: "Instalación", blocks: [] },
    { id: "alimentacion", title: "Alimentación", blocks: [] },
    { id: "funcionamiento", title: "Funcionamiento", blocks: [] },
    { id: "prueba", title: "Prueba", blocks: [] },
    { id: "mantenimiento", title: "Mantenimiento", blocks: [] },
    { id: "senalizacion", title: "Señales LED y acústicas", blocks: [] },
    { id: "averias", title: "Solución de problemas", blocks: [] },
    { id: "advertencias", title: "Advertencias", blocks: [] }
  ]
};

/*
 * Ejemplo de FORMATO para comprobar el visor. No es contenido de ningún
 * manual y la aplicación lo muestra marcado como tal.
 */
APP.data.manualDemo = {
  loaded: true,
  demo: true,
  device: { manufacturer: "EJEMPLO", model: "FORMATO-000", type: "Demostración del visor", language: "Inglés (ficticio)", file: "", edition: "" },
  sections: [
    { id: "prueba", title: "Prueba", blocks: [
      { type: "original", page: 1, text: "[EJEMPLO] Press and hold the TEST button." },
      { type: "traduccion", page: 1, text: "[EJEMPLO] Mantenga pulsado el botón TEST." },
      { type: "explicacion", text: "[EJEMPLO] Así se verá una explicación didáctica separada de la traducción fiel." },
      { type: "aviso", page: 1, text: "[EJEMPLO] Así se verá una advertencia del fabricante." },
      { type: "duda", page: 1, text: "[EJEMPLO] Así se marcará un texto ilegible o ambiguo." }
    ] },
    { id: "alimentacion", title: "Alimentación", blocks: [
      { type: "dato", label: "[EJEMPLO] Alimentación", value: "[valor tal como figure en el manual]", page: 1 }
    ] }
  ]
};
