/* Glosario técnico (Módulo G). "module" enlaza con el módulo donde se practica. */
APP.data.glossary = [
  {
    term: "Detector de humo",
    def: "Dispositivo que detecta partículas de combustión en el aire y genera una señal de alarma. Puede ser autónomo (con zumbador propio) o formar parte de un sistema con central.",
    example: "El detector del techo del pasillo de casa, que pita si detecta humo, es un detector autónomo.",
    module: "lab", icon: "detector"
  },
  {
    term: "Detector autónomo",
    def: "Detector de humo que incluye en la misma carcasa el sensor, la alimentación (normalmente pilas) y el zumbador. No necesita central. Su norma europea de producto es EN 14604.",
    example: "Un detector a pilas comprado para un dormitorio.",
    module: "lab", icon: "detector"
  },
  {
    term: "Central de detección de incendios",
    def: "Equipo que recibe las señales de los detectores y pulsadores de un edificio, indica la zona en alarma y activa sirenas u otras maniobras. Es distinto de una central de alarma antirrobo.",
    example: "El panel de un colegio que muestra «Alarma zona 3 — planta primera».",
    module: "lab", icon: "panel"
  },
  {
    term: "Sensor óptico",
    def: "Sensor que usa luz (un emisor y un receptor) para detectar la presencia de partículas de humo.",
    example: "Dentro de la cámara, un LED infrarrojo y un fotodiodo forman el sensor óptico.",
    module: "tech", icon: "optic"
  },
  {
    term: "Fotoelectricidad",
    def: "Fenómeno por el que la luz genera una señal eléctrica en un componente, como un fotodiodo. Los detectores ópticos lo usan para convertir la luz dispersada por el humo en una señal medible.",
    example: "Cuanta más luz desvía el humo hacia el fotodiodo, mayor es la señal eléctrica.",
    module: "tech", icon: "optic"
  },
  {
    term: "Dispersión de la luz",
    def: "Desvío de la luz en distintas direcciones al chocar con partículas. Es el principio del detector óptico de luz dispersa.",
    example: "El haz de una linterna se ve en una habitación con humo porque las partículas dispersan la luz.",
    module: "tech", icon: "optic"
  },
  {
    term: "Ionización",
    def: "Proceso que convierte moléculas neutras del aire en iones (con carga eléctrica). En un detector iónico lo provoca una pequeña fuente radiactiva, y los iones permiten una corriente débil entre dos placas.",
    example: "Cuando entra humo, los iones se pegan a las partículas y la corriente baja.",
    module: "tech", icon: "ion"
  },
  {
    term: "Cámara de detección",
    def: "Espacio interior del detector donde se mide el humo. En los ópticos es una cámara oscura con laberinto que deja pasar el humo pero no la luz exterior.",
    example: "Si la cámara se llena de polvo, el detector puede volverse más sensible o dar avería.",
    module: "lab", icon: "chamber"
  },
  {
    term: "Laberinto óptico",
    def: "Paredes con forma de dientes dentro de la cámara óptica. Bloquean la luz exterior y los reflejos, pero permiten la entrada del humo.",
    example: "Al abrir un detector óptico se ven las aletas negras alrededor del emisor y el receptor.",
    module: "lab", icon: "chamber"
  },
  {
    term: "Alarma acústica",
    def: "Señal sonora que avisa de un peligro. En un autónomo la produce su propio zumbador; en un sistema con central, las sirenas que gobierna la central.",
    example: "El pitido fuerte y repetido de un detector doméstico.",
    module: "lab", icon: "buzzer"
  },
  {
    term: "Sensibilidad",
    def: "Cantidad mínima de humo (o de cambio de señal) que hace que el detector entre en alarma. Más sensibilidad avisa antes, pero aumenta el riesgo de falsas alarmas.",
    example: "En el simulador del Módulo B puedes mover el umbral y ver cómo cambia la respuesta.",
    module: "tech", icon: "meter"
  },
  {
    term: "Umbral de alarma",
    def: "Valor de la señal a partir del cual el detector decide que hay alarma. Lo fija el fabricante; en algunos equipos profesionales se puede configurar.",
    example: "La línea roja discontinua de las gráficas del simulador.",
    module: "tech", icon: "meter"
  },
  {
    term: "Falsa alarma",
    def: "Alarma que se activa sin incendio real. Puede deberse a vapor, polvo, humos de cocina, insectos, suciedad o a una mala elección o ubicación del detector.",
    example: "Un detector óptico junto a la puerta del baño que salta al ducharse.",
    module: "sim", icon: "warn"
  },
  {
    term: "Mantenimiento preventivo",
    def: "Revisiones y pruebas periódicas para que el detector siga funcionando: prueba de funcionamiento, limpieza, comprobación de la alimentación y sustitución al final de su vida útil, siempre según el manual y la normativa.",
    example: "Pulsar el botón de prueba de un autónomo como indique su manual.",
    module: "manual", icon: "tool"
  },
  {
    term: "Detector multisensor",
    def: "Detector que combina al menos dos sensores (por ejemplo, humo y temperatura) y decide con ambas señales. Su norma de producto es EN 54-29.",
    example: "Un detector de hotel que vigila humo y calor para reducir las falsas alarmas por vapor.",
    module: "tech", icon: "multi"
  },
  {
    term: "Detector térmico",
    def: "Detector que reacciona a la temperatura, no al humo. No debe confundirse con un detector de humo.",
    example: "Se usa en cocinas porque el humo de cocinar no le afecta.",
    module: "tech", icon: "heat"
  },
  {
    term: "Estratificación",
    def: "Fenómeno por el que el humo, al enfriarse mientras sube, deja de ascender y se queda a una altura intermedia. Afecta a los locales de techo alto.",
    example: "En el simulador del haz puedes activarla y ver que el humo no alcanza el haz.",
    module: "tech", icon: "layers"
  }
];
