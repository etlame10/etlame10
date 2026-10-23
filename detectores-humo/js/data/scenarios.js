/*
 * Escenarios del simulador (Módulo C).
 * No se dan tiempos ni distancias de detección: dependen de la norma de
 * diseño aplicable, del fabricante y del proyecto.
 * verdict: "ok" = adecuada, "cond" = posible con condiciones, "bad" = poco adecuada
 */
APP.data.scenarios = [
  {
    id: "cocina",
    title: "Cocina de una vivienda",
    scene: "cocina",
    context: "Piso familiar. Se cocina a diario: vapor de la olla, humo al dorar alimentos y, alguna vez, la tostada quemada.",
    factors: ["Vapor y humos de cocción frecuentes", "Riesgo real de incendio (aceite, fuegos)", "Espacio pequeño de techo normal", "Detector doméstico, sin central"],
    steps: [
      {
        q: "¿Qué tipo de detector pondrías dentro de la cocina?",
        options: [
          { tech: "optico", label: "Óptico de humo", verdict: "cond", why: "El vapor y los humos de cocción dispersan la luz igual que el humo, así que dentro de la cocina puede dar falsas alarmas frecuentes. Si se usa, la ubicación lejos de los fogones y lo que diga el fabricante son decisivos." },
          { tech: "ionico", label: "Iónico", verdict: "bad", why: "Tiende a reaccionar a las partículas finas de cocinar y contiene una fuente radiactiva regulada. En una cocina suele dar molestias y hoy no es la opción habitual." },
          { tech: "termico", label: "Térmico", verdict: "ok", why: "No le afectan el vapor ni el humo de cocinar y responde al calor de un fuego real. A cambio, avisa más tarde que uno de humo en muchos fuegos: es un compromiso razonado." },
          { tech: "aspiracion", label: "Aspiración", verdict: "bad", why: "Es un sistema profesional y caro, pensado para otros riesgos. Además el aire de una cocina tiene muchas partículas que no son de incendio." }
        ]
      },
      {
        q: "Alguien propone quitar la pila del detector porque «pita cuando cocinamos». ¿Qué harías?",
        options: [
          { label: "Quitar la pila mientras se cocina", verdict: "bad", why: "Se queda la cocina sin protección y es fácil olvidar volver a ponerla. El problema real es la elección o la ubicación del detector." },
          { label: "Revisar el tipo y la ubicación según el manual del fabricante", verdict: "ok", why: "Las falsas alarmas repetidas suelen indicar que el detector no es el adecuado o que está mal situado. El manual indica dónde no colocarlo." },
          { label: "Tapar el detector con cinta", verdict: "bad", why: "Impide que entre el humo: el detector deja de cumplir su función aunque parezca que funciona." }
        ]
      }
    ],
    realFactors: ["Distancia a fogones y campana según el manual del modelo", "Normativa o recomendación aplicable a viviendas", "Si el detector tiene modo silencio temporal (depende del modelo)"],
    takeaway: "En un lugar con vapor y humo normales, a veces conviene un detector que no sea de humo. Detectar antes no sirve si provoca que alguien lo desactive."
  },
  {
    id: "dormitorio",
    title: "Dormitorio o pasillo de una vivienda",
    scene: "dormitorio",
    context: "Pasillo junto a los dormitorios. De noche las personas duermen y no perciben el humo. Hay aparatos eléctricos cargando.",
    factors: ["Personas durmiendo", "Posible fuego lento (cable, colchón, aparato)", "Ambiente limpio, sin vapor habitual", "Detector doméstico"],
    steps: [
      {
        q: "¿Qué tecnología encaja mejor aquí?",
        options: [
          { tech: "optico", label: "Óptico de humo", verdict: "ok", why: "En un ambiente limpio y con riesgo de fuego lento, el óptico tiende a responder bien al humo visible y no tiene material radiactivo." },
          { tech: "multisensor", label: "Multisensor o doble sensor", verdict: "ok", why: "Combina sensores y responde a más tipos de fuego. La USFA recomienda en viviendas detectores de ambos tipos o de doble sensor porque no se puede prever el tipo de fuego." },
          { tech: "termico", label: "Térmico", verdict: "bad", why: "Un fuego lento puede generar mucho humo antes de calentar el ambiente. Para un lugar donde se duerme, avisar tarde es un problema serio." },
          { tech: "haz", label: "Haz lineal", verdict: "bad", why: "Está pensado para grandes espacios con central. En un pasillo doméstico no tiene sentido." }
        ]
      },
      {
        q: "¿Dónde debe ir normalmente un detector de humo de este tipo?",
        options: [
          { label: "En el techo o donde indique el manual, lejos de esquinas y salidas de aire", verdict: "ok", why: "El humo sube y se acumula bajo el techo. Las esquinas y las corrientes de aire pueden impedir que llegue. La posición exacta la indica el fabricante." },
          { label: "En el suelo, cerca del enchufe", verdict: "bad", why: "El humo caliente asciende: en el suelo llegaría muy tarde." },
          { label: "Pegado a la rejilla del aire acondicionado", verdict: "bad", why: "La corriente de aire puede alejar el humo del detector o ensuciar la cámara." }
        ]
      }
    ],
    realFactors: ["Número y posición de detectores según el manual y la normativa aplicable", "Si se pueden interconectar entre sí (depende del modelo)", "Prueba y sustitución periódica"],
    takeaway: "Donde se duerme, la prioridad es avisar pronto de un fuego lento. Un óptico o un doble sensor bien situados suelen tener sentido."
  },
  {
    id: "nave",
    title: "Nave industrial de techo alto",
    scene: "nave",
    context: "Almacén de palés con un techo muy alto. Circulan carretillas elevadoras. Hay una central de detección de incendios.",
    factors: ["Techo muy alto: mantenimiento difícil", "Posible estratificación del humo", "Objetos en movimiento (carretillas, palés)", "Sistema profesional con central"],
    steps: [
      {
        q: "¿Qué solución estudiarías primero?",
        options: [
          { tech: "haz", label: "Óptico de haz", verdict: "ok", why: "Cubre una línea larga con pocos equipos y se mantiene desde zonas más accesibles. Exige alineación, paredes estables y prever que nada interrumpa el haz." },
          { tech: "aspiracion", label: "Aspiración", verdict: "ok", why: "Puede tomar muestras a varias alturas y dejar el equipo a una altura accesible. Requiere diseñar la red de tubos con las herramientas del fabricante." },
          { tech: "optico", label: "Muchos ópticos puntuales en el techo", verdict: "cond", why: "Es posible, pero su mantenimiento a gran altura es costoso y el humo puede no llegar al techo por estratificación." },
          { tech: "termico", label: "Solo térmicos", verdict: "bad", why: "Con un techo muy alto el calor se diluye: el aviso podría llegar demasiado tarde." }
        ]
      },
      {
        q: "Con un detector de haz, una carretilla eleva un palé y corta el haz por completo de golpe. ¿Qué debería pasar?",
        options: [
          { label: "Lo normal es una señal de avería, no de incendio", verdict: "ok", why: "Un bloqueo total y brusco no se parece a la atenuación gradual del humo. Muchos equipos lo tratan como avería; el comportamiento exacto lo define el fabricante." },
          { label: "Alarma de incendio inmediata", verdict: "bad", why: "Si cualquier objeto provocara alarma, las falsas alarmas serían constantes. El equipo analiza cómo cambia la señal." },
          { label: "Nada, el detector no lo nota", verdict: "bad", why: "El equipo supervisa la señal recibida: dejar de recibirla es un problema que debe indicar." }
        ]
      }
    ],
    realFactors: ["Altura, geometría y ventilación del local", "Requisitos del proyecto según el RIPCI y la UNE 23007-14", "Especificaciones del fabricante (distancias, alineación, niveles)"],
    takeaway: "En grandes espacios importan la altura, el movimiento del aire y el acceso para el mantenimiento. No hay una respuesta única: el proyecto decide."
  },
  {
    id: "cpd",
    title: "Sala técnica o centro de datos",
    scene: "cpd",
    context: "Sala de servidores con climatización potente. Un fallo eléctrico en un equipo apenas produce humo al principio, y el aire lo diluye.",
    factors: ["Mucho flujo de aire: el humo se diluye", "Equipos de alto valor", "Interesa un aviso muy temprano", "Sistema profesional con central"],
    steps: [
      {
        q: "¿Qué tecnología encaja mejor para un aviso muy temprano?",
        options: [
          { tech: "aspiracion", label: "Aspiración", verdict: "ok", why: "Muestrea el aire de forma continua y puede detectar concentraciones muy bajas según su clase (EN 54-20 define las clases A, B y C). Puede tomar muestras en los retornos del aire." },
          { tech: "multisensor", label: "Multisensores puntuales", verdict: "cond", why: "Pueden formar parte de la protección, pero con mucho flujo de aire el humo diluido tarda en alcanzar un detector puntual." },
          { tech: "ionico", label: "Iónicos", verdict: "bad", why: "Las corrientes de aire afectan a su medida y contienen una fuente radiactiva regulada." },
          { tech: "termico", label: "Térmicos", verdict: "bad", why: "Un fallo incipiente apenas calienta la sala: llegarían tarde." }
        ]
      },
      {
        q: "El equipo de aspiración indica «fallo de flujo». ¿Qué significa probablemente?",
        options: [
          { label: "Que algún tubo puede estar obstruido o roto", verdict: "ok", why: "Estos equipos supervisan el caudal de aire. Si el caudal cambia, la muestra ya no es representativa, y el equipo lo avisa." },
          { label: "Que hay un incendio", verdict: "bad", why: "Un fallo de flujo es una avería del sistema de muestreo, no una alarma de incendio." },
          { label: "Que la sala está limpia", verdict: "bad", why: "No tiene relación con la limpieza de la sala." }
        ]
      }
    ],
    realFactors: ["Clase de sensibilidad requerida y diseño de tubos con el software del fabricante", "Ubicación de los puntos de muestreo según los flujos de aire", "Integración con la central y, en su caso, con la extinción"],
    takeaway: "Cuando el aire diluye el humo, muestrearlo activamente puede dar un aviso más temprano. El diseño concreto lo dicta el fabricante."
  },
  {
    id: "conducto",
    title: "Conducto de climatización",
    scene: "conducto",
    context: "Conducto principal de aire de un edificio de oficinas. Si se genera humo en una zona, la climatización podría repartirlo por todo el edificio.",
    factors: ["Aire a velocidad dentro del conducto", "Acceso limitado", "El humo puede propagarse por el edificio", "Sistema profesional con central"],
    steps: [
      {
        q: "¿Qué opción se usa habitualmente para vigilar el humo en un conducto?",
        options: [
          { tech: "optico", label: "Detector en carcasa de conducto (con tubo de muestreo)", verdict: "ok", why: "Una carcasa con tubos toma aire del conducto y lo hace pasar por un detector. Debe ser un conjunto aprobado por el fabricante para la velocidad de aire del conducto." },
          { tech: "aspiracion", label: "Aspiración", verdict: "cond", why: "Puede muestrear conductos si el fabricante lo contempla en su diseño, pero no es la solución más simple para un único conducto." },
          { tech: "haz", label: "Haz dentro del conducto", verdict: "bad", why: "Los haces están pensados para atravesar locales grandes, no el interior de un conducto." },
          { tech: "termico", label: "Térmico en el conducto", verdict: "bad", why: "El aire en movimiento enfría y diluye: el objetivo aquí es detectar el humo." }
        ]
      },
      {
        q: "¿Por qué importa detectar humo en el conducto?",
        options: [
          { label: "Para poder actuar sobre la climatización y evitar que reparta el humo", verdict: "ok", why: "La detección en conductos suele servir para generar maniobras (parar ventiladores, cerrar compuertas) según el proyecto. No sustituye a la detección en los locales." },
          { label: "Porque sustituye a todos los detectores de las salas", verdict: "bad", why: "El humo diluido en un conducto no permite localizar el fuego. Es una protección complementaria." },
          { label: "Solo para medir la calidad del aire", verdict: "bad", why: "La calidad del aire la vigilan otros sensores; aquí hablamos de detección de incendios." }
        ]
      }
    ],
    realFactors: ["Velocidad de aire admitida por el conjunto", "Maniobras definidas en el proyecto", "Accesibilidad para pruebas y limpieza"],
    takeaway: "La misma física (dispersión de la luz) se puede aplicar en sitios muy distintos si el montaje es el adecuado y está aprobado por el fabricante."
  }
];
