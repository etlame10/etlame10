/* Retos (Módulo F). "a" es el índice de la respuesta correcta. */
APP.data.quiz = [
  {
    q: "En un detector óptico de luz dispersa, ¿por qué el fotodiodo NO está enfrente del LED?",
    o: ["Para ahorrar energía", "Para que solo le llegue luz cuando las partículas la desvían", "Porque el LED calienta el fotodiodo", "Para que lo vea el usuario"],
    a: 1,
    e: "Sin humo, la luz del LED no llega al fotodiodo. Las partículas la dispersan y parte de ella alcanza el receptor: eso es lo que se mide."
  },
  {
    q: "En un detector iónico, ¿qué ocurre con la corriente cuando entra humo?",
    o: ["Sube", "Baja", "No cambia", "Se invierte"],
    a: 1,
    e: "Los iones se adhieren a las partículas de humo y se mueven peor, así que la corriente entre las placas disminuye."
  },
  {
    q: "¿Cuál de estos NO es un detector de humo?",
    o: ["Óptico de haz", "Detector por aspiración", "Detector térmico", "Detector iónico"],
    a: 2,
    e: "El térmico mide temperatura. Los otros tres detectan partículas de humo, cada uno con un principio distinto."
  },
  {
    q: "Un detector de movimiento PIR de una alarma antirrobo…",
    o: ["Detecta humo por infrarrojos", "Detecta cambios de radiación infrarroja de cuerpos en movimiento", "Es un tipo de detector multisensor de incendios", "Sustituye a un detector de humo"],
    a: 1,
    e: "El PIR detecta personas en movimiento. Es un componente de intrusión y no detecta humo, aunque los dos usen la palabra «infrarrojo»."
  },
  {
    q: "¿Cuál es una limitación habitual del detector óptico de humo?",
    o: ["Contiene material radiactivo", "El vapor y el polvo pueden provocar falsas alarmas", "Solo funciona con central", "No necesita mantenimiento"],
    a: 1,
    e: "El vapor y el polvo también dispersan la luz. Por eso la ubicación importa: lejos de baños, cocinas o zonas con polvo, según el manual."
  },
  {
    q: "¿Qué afirmación sobre las tecnologías de detección es correcta?",
    o: ["El óptico es siempre mejor que el iónico", "El iónico es siempre mejor que el óptico", "Cada tecnología responde mejor a ciertos fuegos y ambientes", "Todas responden igual a todos los fuegos"],
    a: 2,
    e: "Ninguna es la mejor en todos los casos. La elección depende del tipo de fuego esperado, el ambiente, la normativa y el fabricante."
  },
  {
    q: "¿Qué hace un detector de haz si un objeto corta el haz de golpe y por completo?",
    o: ["Siempre da alarma de incendio", "Muchos equipos lo tratan como avería", "Se apaga para siempre", "Aumenta su sensibilidad"],
    a: 1,
    e: "El humo atenúa la señal poco a poco. Un corte total y brusco es distinto, y muchos equipos lo indican como avería. El comportamiento exacto depende del modelo."
  },
  {
    q: "¿Por qué un sistema por aspiración tiene un retardo de transporte?",
    o: ["Porque el láser tarda en encenderse", "Porque el aire tarda en recorrer los tubos hasta el detector", "Porque espera a que suba la temperatura", "Porque lo exige la central"],
    a: 1,
    e: "El aire entra por los orificios y recorre la tubería hasta la cámara. Lo puedes observar en la simulación del Módulo B."
  },
  {
    q: "La mejor forma de comprobar si un detector funciona es…",
    o: ["Acercar una vela encendida", "Seguir el procedimiento de prueba del manual del fabricante", "Echarle un poco de humo de un cigarro", "Mirar si el LED está encendido"],
    a: 1,
    e: "Nunca provoques humo o fuego para probarlo. Algunos fabricantes autorizan equipos de prueba concretos; el procedimiento válido es el de su manual."
  },
  {
    q: "¿Qué significa aumentar la sensibilidad de un detector?",
    o: ["Avisa con menos humo, pero hay más riesgo de falsas alarmas", "Avisa con más humo y nunca falla", "Consume menos batería", "Detecta gas"],
    a: 0,
    e: "Más sensibilidad = umbral más bajo. Avisa antes, pero cosas como el vapor o el polvo pueden superar ese umbral."
  },
  {
    q: "Un detector autónomo doméstico se diferencia de uno conectado a una central de incendios en que…",
    o: ["El autónomo tiene sensor, alimentación y zumbador propios", "El autónomo necesita cableado a la central", "El de central siempre lleva pilas", "No hay ninguna diferencia"],
    a: 0,
    e: "El autónomo funciona por sí solo. El de central envía la señal a la central, que indica la zona y activa las sirenas del edificio."
  },
  {
    q: "¿Qué hace un detector multisensor?",
    o: ["Detecta humo y movimiento", "Combina al menos un sensor de humo y uno de calor para decidir", "Mide varios gases tóxicos", "Tiene varias sirenas"],
    a: 1,
    e: "Combina señales (EN 54-29: humo + calor). Cómo se combinan depende del algoritmo de cada fabricante."
  },
  {
    q: "Un detector de monóxido de carbono (CO)…",
    o: ["Es lo mismo que un detector de humo", "Detecta un gas, no las partículas de humo", "Es un detector térmico", "Es un detector de haz"],
    a: 1,
    e: "El CO es un gas tóxico invisible. Su detector tiene otro sensor y otra finalidad. No sustituye a un detector de humo ni al revés."
  },
  {
    q: "¿Por qué la cámara óptica tiene un laberinto?",
    o: ["Para decorar", "Para dejar pasar el humo y bloquear la luz exterior", "Para que el humo salga más rápido", "Para ventilar la electrónica"],
    a: 1,
    e: "Si entrara luz del exterior, el fotodiodo la confundiría con luz dispersada por el humo."
  }
];

/* Emparejar componente con función */
APP.data.matching = [
  { a: "Cámara de detección", b: "Espacio oscuro donde se mide el humo" },
  { a: "Fotodiodo", b: "Convierte la luz recibida en señal eléctrica" },
  { a: "LED emisor", b: "Produce la luz que dispersará el humo" },
  { a: "Pulsador de prueba", b: "Comprueba el aviso según el procedimiento del fabricante" },
  { a: "Zumbador", b: "Genera el aviso acústico en un autónomo" },
  { a: "Base de montaje", b: "Fija el detector al techo y, en sistemas cableados, aloja los bornes" },
  { a: "LED indicador", b: "Muestra el estado del detector con un patrón de luz" },
  { a: "Malla antiinsectos", b: "Impide que entren insectos en la cámara" }
];

/* ¿Qué tecnología es? Se describe un comportamiento y se pide identificarla. */
APP.data.identify = [
  { clue: "La señal medida BAJA cuando entra humo, porque los iones se frenan al unirse a las partículas.", a: "ionico" },
  { clue: "Hay un ventilador, una red de tubos con orificios y la señal sube con algo de retraso respecto al humo.", a: "aspiracion" },
  { clue: "Un emisor en una pared y un reflector en la otra. La señal recibida disminuye cuando el humo cruza.", a: "haz" },
  { clue: "La señal sube cuando las partículas desvían la luz de un LED hacia un fotodiodo.", a: "optico" },
  { clue: "Ignora el vapor de la ducha y la tostada quemada, pero responde cuando el aire se calienta.", a: "termico" },
  { clue: "Con humo moderado y sin calor espera; si además sube la temperatura, confirma la alarma.", a: "multisensor" }
];

/* Casos prácticos con razonamiento */
APP.data.cases = [
  {
    title: "El detector que pita de madrugada",
    text: "Un cliente dice que su detector autónomo hace un pitido corto cada cierto tiempo, sin humo, y el LED parpadea de forma distinta a lo habitual.",
    q: "¿Qué es lo más probable y qué harías?",
    o: ["Hay un incendio oculto: llamar a bomberos", "Puede ser un aviso de batería baja o avería: consultar el manual del modelo para interpretar la señal", "El detector está roto: tirarlo a la basura", "Es normal: no hacer nada"],
    a: 1,
    e: "Muchos detectores indican batería baja o avería con pitidos cortos periódicos, pero el patrón exacto lo define cada fabricante. Hay que consultar el manual. Ante cualquier duda real de incendio, la prioridad es la seguridad de las personas."
  },
  {
    title: "Alarma en la central del instituto",
    text: "La central de incendios del instituto marca «Alarma zona 2». Se comprueba que no hay fuego, solo polvo de una obra.",
    q: "¿Qué aprendemos y qué habría que hacer?",
    o: ["Desconectar la zona 2 para siempre", "El polvo puede activar un detector de humo; durante las obras hay que actuar según el procedimiento del mantenedor y rearmar la central", "Cambiar el detector por un PIR", "Subir el volumen de las sirenas"],
    a: 1,
    e: "Las obras son una causa conocida de falsas alarmas. Lo correcto es seguir el procedimiento de la empresa mantenedora (por ejemplo, la protección temporal de los detectores) sin dejar el edificio desprotegido."
  },
  {
    title: "El detector viejo con un símbolo radiactivo",
    text: "Al reformar un local aparece un detector antiguo con el símbolo de radiactividad.",
    q: "¿Qué harías?",
    o: ["Abrirlo para ver la fuente", "Tirarlo al contenedor", "No abrirlo y gestionar su retirada según el fabricante o la normativa vigente (en España, consultar el CSN)", "Guardarlo en clase como recuerdo"],
    a: 2,
    e: "Es probablemente un detector iónico. La fuente está sellada y no se debe manipular. Su retirada tiene regulación específica."
  }
];
