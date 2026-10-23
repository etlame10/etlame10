/*
 * Galería (Módulo E).
 * Las imágenes son ILUSTRACIONES ESQUEMÁTICAS propias, no fotos de productos.
 * Para añadir una foto real: guardarla en assets/fotos/, rellenar "photo"
 * con la ruta, "photoCredit" con autor/fabricante y "photoLicense" con el
 * permiso de uso. Sin esos datos, la foto no se muestra.
 */
APP.data.gallery = [
  {
    id: "g-optico", name: "Detector óptico puntual", tech: "optico", art: "point",
    context: "Autónomo o conectado a central",
    recognize: ["Carcasa redonda de techo con ranuras o rejilla lateral", "LED indicador visible", "Sin símbolo de radiactividad"],
    features: ["Cámara oscura con laberinto", "LED emisor y fotodiodo", "Alimentación por pilas (autónomo) o por la central (cableado)"],
    refs: ["en54-7", "en14604"], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-ionico", name: "Detector iónico puntual", tech: "ionico", art: "ionic",
    context: "Instalaciones antiguas",
    recognize: ["Aspecto similar al óptico", "Etiqueta con el símbolo de radiactividad y el radionúclido (p. ej. Am-241)"],
    features: ["Cámara de ionización", "Fuente radiactiva sellada", "Retirada regulada"],
    refs: ["en54-7", "csn"], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-haz", name: "Detector de haz con reflector", tech: "haz", art: "beam",
    context: "Grandes espacios con central",
    recognize: ["Caja rectangular en una pared, a gran altura", "Reflector (placa de prismas) en la pared opuesta", "O bien emisor y receptor separados"],
    features: ["Haz infrarrojo", "Requiere alineación", "Supervisa la señal recibida"],
    refs: ["en54-12", "mi-lpb2"], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-asp", name: "Equipo de detección por aspiración", tech: "aspiracion", art: "asd",
    context: "Salas técnicas, CPD, almacenes",
    recognize: ["Caja en la pared con pantalla o indicadores", "Tubos (a menudo rojos) que salen de la caja", "Orificios pequeños a lo largo de los tubos"],
    features: ["Aspirador y filtro", "Cámara de alta sensibilidad", "Varios niveles de aviso configurables"],
    refs: ["en54-20", "xtralis", "vesda-vlp"], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-multi", name: "Detector multisensor", tech: "multisensor", art: "multi",
    context: "Sistemas con central",
    recognize: ["Parecido a un óptico", "Suele tener un termistor visible en el centro o protegido por una rejilla", "La referencia del fabricante lo indica"],
    features: ["Humo + temperatura", "Algoritmo del fabricante", "En algunos modelos, modos configurables"],
    refs: ["en54-29"], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-termico", name: "Detector térmico (comparación)", tech: "termico", art: "heat",
    context: "Cocinas, garajes, salas de calderas",
    recognize: ["Termistor expuesto en el centro", "Sin cámara con ranuras para el humo"],
    features: ["No detecta humo", "Temperatura fija o velocidad de subida"],
    refs: [], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-conducto", name: "Detector en carcasa de conducto", tech: "optico", art: "duct",
    context: "Conductos de climatización",
    recognize: ["Caja montada en el exterior del conducto", "Uno o dos tubos que entran en el conducto"],
    features: ["Detector puntual dentro de la carcasa", "Debe ser un conjunto aprobado para la velocidad del aire"],
    refs: [], photo: "", photoCredit: "", photoLicense: ""
  },
  {
    id: "g-inalambrico", name: "Detector de humo inalámbrico para central de alarma", tech: "optico", art: "wireless",
    context: "Kits de alarma por radio (p. ej. 433 MHz)",
    recognize: ["Aspecto de autónomo", "Se empareja con la central de alarma por radio", "El manual del kit indica la frecuencia"],
    features: ["Suele integrar un sensor óptico", "Puede tener zumbador propio y además avisar a la central", "Cumplimiento normativo: comprobar en su documentación"],
    refs: [], photo: "", photoCredit: "", photoLicense: ""
  }
];
