/*
 * Referencias usadas en la aplicación.
 * Regla: solo se añaden fuentes que existen y se han localizado.
 * "acceso" indica cómo se consultó: muchas normas son de pago y solo se ha
 * podido leer la ficha pública (alcance), no el texto completo.
 */
window.APP = window.APP || {};
APP.data = APP.data || {};

APP.data.sources = {
  "en54-7": {
    title: "EN 54-7:2018 — Detectores de humo puntuales (luz dispersa, luz transmitida o ionización)",
    publisher: "CEN / DIN (ficha del catálogo)",
    url: "https://din.de/en/wdc-beuth:din21:246430655",
    kind: "Norma",
    access: "Ficha pública con el alcance. Texto completo de pago, no consultado."
  },
  "en54-7-iteh": {
    title: "EN 54-7:2018 — ficha de catálogo (alcance, Anexo N multisensor)",
    publisher: "iTeh Standards",
    url: "https://iteh.es/catalog/standards/cen/16a85383-5a24-42e9-96e1-82508d72dd16/en-54-7-2018",
    kind: "Norma",
    access: "Ficha pública con el alcance."
  },
  "en54-12": {
    title: "EN 54-12 — Detectores de humo lineales que utilizan un haz óptico",
    publisher: "BSI Knowledge (ficha)",
    url: "https://knowledge.bsigroup.com/products/fire-detection-and-fire-alarm-systems-smoke-detectors-line-detectors-using-an-optical-light-beam",
    kind: "Norma",
    access: "Ficha pública con el alcance (atenuación del haz). Texto completo no consultado."
  },
  "en54-20": {
    title: "Explicación de las clases A, B y C de sensibilidad de EN 54-20 (detección por aspiración)",
    publisher: "Eurofyre (distribuidor)",
    url: "https://eurofyre.co.uk/news/understanding-en54-20-aspirating-smoke-detection-sensitivity-classes/",
    kind: "Divulgación técnica",
    access: "Artículo de un distribuidor; no es el texto de la norma."
  },
  "en54-29": {
    title: "EN 54-29:2015 — Detectores multisensor puntuales (humo + calor)",
    publisher: "iTeh Standards (ficha)",
    url: "https://iteh.es/catalog/standards/cen/a3fb9236-0f4c-44c5-84d3-abd175969559/en-54-29-2015",
    kind: "Norma",
    access: "Ficha pública con el alcance."
  },
  "en14604": {
    title: "EN 14604:2005 — Detectores autónomos de humo (uso doméstico)",
    publisher: "EVS (ficha del catálogo)",
    url: "https://www.evs.ee/en/evs-en-14604-2005",
    kind: "Norma",
    access: "Ficha pública con el alcance. No se ha confirmado si existe una edición posterior."
  },
  "kiwa": {
    title: "Detectores de humo obligatorios también en edificios existentes (Países Bajos)",
    publisher: "Kiwa",
    url: "https://www.kiwa.com/en/nl/markets/fire-safety-and-security/news/smoke-detectors-will-soon-also-be-mandatory-in-existing-buildings/",
    kind: "Organismo de certificación",
    access: "Noticia pública. Se cita solo para la referencia a EN 14604; la obligación es de Países Bajos, no de España."
  },
  "ripci-apv": {
    title: "Pliego técnico que aplica el RIPCI (RD 513/2017) y la UNE 23007-14",
    publisher: "Autoridad Portuaria de Vigo",
    url: "https://www.apvigo.es/en/licitaciones/descargar/1950/ANEXO21SES465.pdf",
    kind: "Documento técnico público",
    access: "Documento público que relaciona RIPCI y UNE 23007-14. Para citar artículos concretos hay que consultar el BOE."
  },
  "ripci-madrid": {
    title: "Acta del grupo de trabajo de protección contra incendios (RIPCI)",
    publisher: "Comunidad de Madrid",
    url: "https://comunidad.madrid/sites/default/files/acta_i_gtpi_i_05.07.23.pdf",
    kind: "Administración",
    access: "Documento público."
  },
  "boe-ionicos": {
    title: "Resolución que modifica la aprobación de tipo de detectores iónicos (eliminación de la obligación de devolución)",
    publisher: "BOE, 26/11/2002",
    url: "https://www.boe.es/boe/dias/2002/11/26/pdfs/A41629-41631.pdf",
    kind: "Normativa (España)",
    access: "Localizada mediante buscador; se cita solo para indicar que en España existe regulación específica de estos aparatos."
  },
  "csn": {
    title: "Consejo de Seguridad Nuclear (CSN) — organismo regulador en España",
    publisher: "CSN",
    url: "https://www.csn.es/",
    kind: "Organismo regulador",
    access: "Web oficial. Consultar aquí la normativa vigente sobre aparatos con fuentes radiactivas."
  },
  "arpansa": {
    title: "Eliminación de detectores de humo domésticos (declaración)",
    publisher: "ARPANSA (Australia)",
    url: "https://www.arpansa.gov.au/sites/default/files/rhc-statement-disposal-of-domestic-smoke-detectors.pdf",
    kind: "Organismo regulador (extranjero)",
    access: "Fuente australiana: sirve para el principio físico, no como normativa española."
  },
  "nrc": {
    title: "Documento de la NRC sobre detectores de humo con americio-241",
    publisher: "U.S. Nuclear Regulatory Commission",
    url: "https://www.nrc.gov/docs/ML1932/ML19320A508.pdf",
    kind: "Organismo regulador (extranjero)",
    access: "Fuente de EE. UU.: sirve para el principio físico, no como normativa española."
  },
  "usfa": {
    title: "Declaraciones de posición de la USFA (tipos de detectores domésticos)",
    publisher: "U.S. Fire Administration",
    url: "https://www.usfa.fema.gov/about/position-statements/",
    kind: "Organismo público (extranjero)",
    access: "Localizada mediante buscador. Recomienda en viviendas detectores de ambos tipos o de doble sensor porque no se puede prever el tipo de fuego."
  },
  "xtralis": {
    title: "Documentación técnica de detección por aspiración (VESDA)",
    publisher: "Xtralis",
    url: "https://www.xtralis.com/file/10448",
    kind: "Fabricante",
    access: "Documento de fabricante; describe un producto concreto."
  },
  "vesda-vlp": {
    title: "VESDA VLP — página del producto",
    publisher: "Honeywell",
    url: "https://buildings.honeywell.com/de/de/products/by-category/sensors/smoke-detectors/vesda-vlp-detector",
    kind: "Fabricante",
    access: "Ficha de un modelo concreto."
  },
  "mi-lpb2": {
    title: "MI-LPB2 — detector óptico de haz con reflector",
    publisher: "Honeywell",
    url: "https://buildings.honeywell.com/ca/en/products/by-category/sensors/smoke-detectors/mi-lpb2-optical-smoke-beam-detector",
    kind: "Fabricante",
    access: "Ficha de un modelo concreto (la página de EE. UU. lo marca como descatalogado)."
  }
};
