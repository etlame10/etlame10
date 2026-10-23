/*
 * Tecnologías de detección (Módulo B).
 * "factors" son valores DIDÁCTICOS y cualitativos para la simulación:
 * no son mediciones ni proceden de ninguna norma. Sirven para visualizar
 * tendencias que describen las fuentes (p. ej. USFA: el iónico tiende a
 * responder antes a fuegos con llama y el óptico a fuegos lentos).
 */
APP.data.smokeTypes = {
  lenta: {
    label: "Fuego lento sin llama",
    hint: "Humo denso y visible, partículas relativamente grandes. Poco calor al principio.",
    color: "#9aa3ad", size: [3.2, 5.2], heat: 0.15, fire: true
  },
  llama: {
    label: "Fuego con llama",
    hint: "Combustión rápida: partículas muy pequeñas, menos visibles, y subida de temperatura.",
    color: "#55595f", size: [1.4, 2.4], heat: 1, fire: true
  },
  vapor: {
    label: "Vapor o polvo (no es fuego)",
    hint: "Partículas que no proceden de un incendio. Pueden provocar falsas alarmas.",
    color: "#d8e6f0", size: [2.6, 4.4], heat: 0.05, fire: false
  }
};

APP.data.technologies = [
  {
    id: "optico",
    name: "Óptico (fotoeléctrico)",
    short: "Mide la luz que las partículas de humo desvían dentro de una cámara oscura.",
    family: "Puntual",
    scope: "Detectores autónomos domésticos y detectores conectados a central.",
    principle: "Dentro de una cámara oscura con laberinto, un LED (normalmente infrarrojo) emite luz que no llega directamente al fotodiodo. Cuando entra humo, las partículas dispersan parte de esa luz y una fracción alcanza el fotodiodo. La electrónica compara esa señal con un umbral. Existe una variante por oscurecimiento (luz transmitida): el receptor está enfrente del emisor y lo que se mide es la pérdida de luz.",
    components: ["Cámara de detección con laberinto óptico", "Emisor LED (infrarrojo en muchos modelos)", "Fotodiodo receptor", "Trampa de luz", "Rejilla o malla antiinsectos", "Electrónica de comparación"],
    withSmoke: "Aumenta la luz dispersada que llega al fotodiodo → la señal sube → si supera el umbral, alarma.",
    pros: ["Tiende a responder bien al humo visible de fuegos lentos.", "No contiene material radiactivo.", "Muy extendido en viviendas y en sistemas con central."],
    cons: ["El vapor y el polvo también dispersan la luz y pueden causar falsas alarmas.", "Las partículas muy pequeñas y poco visibles se detectan peor.", "La suciedad en la cámara altera la sensibilidad: necesita mantenimiento."],
    uses: ["Dormitorios, pasillos y salones.", "Oficinas, aulas y zonas comunes conectadas a una central."],
    scenario: "En un pasillo de una vivienda, un cable que se calienta lentamente produce humo gris antes de que aparezca llama. Es el tipo de humo que este principio detecta con facilidad.",
    standard: "Puntuales para sistemas con central: EN 54-7. Autónomos domésticos: EN 14604.",
    sources: ["en54-7", "en14604", "usfa"],
    sim: "optico",
    factors: { lenta: 1.0, llama: 0.45, vapor: 0.85 },
    obscFactors: { lenta: 0.9, llama: 0.75, vapor: 0.7 }
  },
  {
    id: "ionico",
    name: "Iónico (ionización)",
    short: "Mide cómo el humo reduce una pequeña corriente eléctrica creada por una fuente radiactiva.",
    family: "Puntual",
    scope: "Existió en viviendas y en sistemas con central; su uso se ha reducido mucho.",
    principle: "Una pequeña fuente radiactiva (habitualmente americio-241) ioniza el aire entre dos placas con tensión. Los iones permiten circular una corriente muy débil y estable. Las partículas de humo se unen a los iones y los frenan, así que la corriente baja. Si baja más allá del umbral, se activa la alarma.",
    components: ["Cámara de ionización con dos electrodos", "Fuente radiactiva sellada (Am-241)", "Cámara de referencia (en muchos diseños)", "Electrónica de medida de corriente"],
    withSmoke: "Los iones se adhieren a las partículas → disminuye la corriente → si cae por debajo del umbral, alarma.",
    pros: ["Tiende a responder antes a fuegos con llama, de partículas pequeñas (USFA).", "Principio físico robusto y conocido durante décadas."],
    cons: ["Contiene una fuente radiactiva: su fabricación, venta y retirada están reguladas.", "Sensible a humos de cocina y corrientes de aire.", "Responde peor al humo visible de fuegos lentos."],
    uses: ["Instalaciones antiguas.", "Hoy se sustituye a menudo por ópticos o multisensor."],
    scenario: "En un almacén con papel, un fuego que pasa rápido a llama produce partículas muy pequeñas. Ahí este principio tiende a reaccionar pronto, aunque hoy se suele optar por otras tecnologías.",
    safety: "La fuente está sellada y no debe abrirse ni manipularse. No se tira a la basura sin más: en España estos aparatos tienen regulación específica (el regulador es el CSN) y la retirada debe hacerse por los cauces que indique el fabricante o la normativa vigente. Las fuentes extranjeras (NRC, ARPANSA) explican el principio, pero no son normativa española.",
    standard: "Puntuales para sistemas con central: EN 54-7 (incluye ionización).",
    sources: ["en54-7", "usfa", "csn", "boe-ionicos", "nrc", "arpansa"],
    sim: "ionico",
    factors: { lenta: 0.5, llama: 1.0, vapor: 0.45 }
  },
  {
    id: "haz",
    name: "Óptico de haz (lineal)",
    short: "Un haz de luz cruza el local; el humo que lo atraviesa lo atenúa.",
    family: "Lineal",
    scope: "Sistemas con central. No es un detector doméstico.",
    principle: "Un emisor envía un haz (normalmente infrarrojo) a través del local hacia un receptor o, en otros modelos, hacia un reflector que lo devuelve al mismo equipo. El equipo analiza la intensidad recibida. Si el humo atenúa el haz más allá del umbral, da alarma. Un corte brusco y total no se parece al humo y muchos equipos lo tratan como avería.",
    components: ["Emisor de haz", "Receptor o reflector", "Electrónica de análisis de la señal", "Herramientas de alineación"],
    withSmoke: "El humo absorbe y dispersa parte de la luz → llega menos señal al receptor → si la atenuación supera el umbral, alarma.",
    pros: ["Cubre una línea larga con pocos equipos.", "Útil en techos altos donde los puntuales son difíciles de mantener."],
    cons: ["Necesita una alineación precisa y paredes estables.", "Objetos, carretillas o andamios pueden interrumpir el haz.", "En techos altos el humo puede quedarse por debajo (estratificación) y no llegar al haz."],
    uses: ["Naves, almacenes, atrios, pabellones."],
    scenario: "En una nave de techo alto, colocar y revisar detectores puntuales en el techo es costoso. Un haz que cruza la nave cubre esa línea con un emisor y un reflector.",
    standard: "EN 54-12 (detectores lineales de haz óptico).",
    sources: ["en54-12", "mi-lpb2"],
    sim: "haz",
    factors: { lenta: 0.9, llama: 0.75, vapor: 0.6 }
  },
  {
    id: "aspiracion",
    name: "Aspiración",
    short: "Un ventilador aspira aire por una red de tubos y lo analiza en una cámara muy sensible.",
    family: "Por aspiración",
    scope: "Sistemas profesionales. No es un detector doméstico.",
    principle: "Un aspirador (ventilador) extrae aire de forma continua a través de tubos con orificios calibrados. El aire pasa por un filtro y llega a una cámara de detección, que en muchos equipos usa un láser o una fuente de luz intensa. El equipo mide la concentración de partículas y la compara con varios niveles de aviso que se configuran.",
    components: ["Red de tubos con orificios de muestreo", "Aspirador (ventilador)", "Filtro", "Cámara de detección (láser en muchos modelos)", "Supervisión del caudal de aire"],
    withSmoke: "El aire con humo entra por los orificios → recorre el tubo (con un retardo de transporte) → la cámara detecta las partículas → aviso o alarma según los niveles configurados.",
    pros: ["Puede detectar concentraciones muy bajas, según la clase y el diseño.", "El equipo puede quedar en una zona accesible y los tubos en la zona protegida.", "Supervisa el flujo de aire: detecta tubos obstruidos o rotos."],
    cons: ["Requiere diseño de la red de tubos con el software o las reglas del fabricante.", "El aire tarda en recorrer el tubo.", "Más caro y complejo de instalar y mantener."],
    uses: ["Centros de datos y salas técnicas.", "Celdas frigoríficas, salas limpias, espacios donde no conviene un detector visible."],
    scenario: "En una sala de servidores el aire circula mucho y diluye el humo. Un sistema por aspiración muestrea el aire de forma continua y puede dar un aviso temprano.",
    standard: "EN 54-20 (clases de sensibilidad A, B y C).",
    sources: ["en54-20", "xtralis", "vesda-vlp"],
    sim: "aspiracion",
    factors: { lenta: 1.0, llama: 0.6, vapor: 0.85 }
  },
  {
    id: "multisensor",
    name: "Multisensor",
    short: "Combina un sensor de humo con otro de temperatura (u otros) y decide con ambas señales.",
    family: "Puntual",
    scope: "Principalmente sistemas con central. También existen autónomos de doble sensor.",
    principle: "En una misma carcasa hay al menos un sensor de humo (óptico o iónico) y un sensor de calor. Un algoritmo combina las señales. Cada fabricante usa su propio algoritmo; la idea general es que dos fenómenos coincidentes dan una decisión más fiable que uno solo.",
    components: ["Cámara óptica (o iónica)", "Termistor (sensor de temperatura)", "Microprocesador con algoritmo de decisión"],
    withSmoke: "Si sube el humo y también la temperatura, la combinación refuerza la alarma. Si solo hay humo moderado sin calor, el algoritmo puede ser más prudente, según el modelo.",
    pros: ["Ayuda a reducir falsas alarmas en algunos ambientes.", "Responde a más tipos de fuego que un solo sensor."],
    cons: ["El comportamiento depende del algoritmo de cada fabricante.", "Más caro que un detector simple.", "Hay que configurar el modo adecuado al local si el modelo lo permite."],
    uses: ["Hoteles, oficinas, zonas con algo de polvo o vapor ocasional."],
    scenario: "En la habitación de un hotel, el vapor de la ducha puede engañar a un óptico simple. Un multisensor que también vigila la temperatura puede distinguir mejor, si su algoritmo lo contempla.",
    standard: "EN 54-29 (humo + calor). EN 54-7 incluye también el Anexo N.",
    sources: ["en54-29", "en54-7-iteh", "usfa"],
    sim: "multisensor",
    factors: { lenta: 1.0, llama: 0.5, vapor: 0.85 }
  },
  {
    id: "termico",
    name: "Térmico (para comparar)",
    short: "No detecta humo: reacciona a la temperatura o a su velocidad de subida.",
    family: "Puntual",
    scope: "Se incluye para no confundirlo con un detector de humo.",
    principle: "Un termistor mide la temperatura. Según el tipo, da alarma al superar una temperatura fija (térmico estático) o cuando la temperatura sube demasiado rápido (termovelocimétrico).",
    components: ["Termistor o elemento sensible al calor", "Electrónica de comparación"],
    withSmoke: "No reacciona al humo. Solo responde si la temperatura sube.",
    pros: ["Prácticamente inmune al vapor, el polvo y los humos de cocina.", "Útil donde un detector de humo daría falsas alarmas."],
    cons: ["Responde más tarde que un detector de humo en muchos fuegos.", "No detecta un fuego lento que apenas genere calor."],
    uses: ["Cocinas, garajes, salas de calderas (según el proyecto)."],
    scenario: "En la cocina de un restaurante, el humo de la plancha es normal. Un detector térmico no reacciona a ese humo y solo responde si hay calor anormal.",
    standard: "Es otra parte de la serie EN 54 (no incluida en la investigación de esta versión).",
    sources: [],
    sim: "termico",
    factors: { lenta: 0.1, llama: 1.0, vapor: 0.15 }
  }
];
