# Práctica: comunicaciones half-duplex con walkies (Retevis RT-5R)

> BORRADOR. Los datos marcados con ⚠️ salen de webs de terceros y de conocimiento general de este tipo de radios. Hay que comprobarlos con el manual y con el equipo real antes de entregar. Los apartados marcados con 📷 necesitan trabajo físico en clase.

## 0. Half-duplex en una frase
Half-duplex: los dos extremos pueden transmitir y recibir, pero no a la vez. Al pulsar PTT (Push To Talk) el equipo transmite y no recibe. Al soltarlo, vuelve a recibir.

## 1. Manuales (añadir enlace)
- ⚠️ Manual en inglés: https://manuals.plus/asin/B00KDZLPA6
- ⚠️ Manual en español (PDF): https://device.report/m/a2ed103dc8d207d4280d29ba6e7f940f1675a335843a04d626db43232272df80.pdf
- Web oficial de Retevis (buscar "RT5R" en Support/Downloads): https://www.retevis.com
- TODO: comprobar que el PDF corresponde exactamente al modelo de clase (mirar la etiqueta trasera del equipo).

## 2. Especificaciones
| Parámetro | Valor | Estado |
|---|---|---|
| Modelo | Retevis RT-5R, dual band | |
| Bandas | VHF 136-174 MHz y UHF 400-520 MHz | ⚠️ Una tienda indica 144-148 y 420-450 MHz (versión radioaficionado). Verificar. |
| Receptor FM comercial | 65-108 MHz | ⚠️ |
| Canales de memoria | 128 | ⚠️ |
| Potencia de transmisión | 5 W (alta) / 1 W (baja) | ⚠️ 5 W según comparativas. El valor de baja potencia hay que confirmarlo. |
| Tonos de subaudio | CTCSS y DCS | ⚠️ |
| Batería | Li-ion 1400 mAh | ⚠️ |
| Modulación | FM (banda ancha / estrecha) | ⚠️ |
| Antena | Flexible, conector SMA | 📷 comprobar en el equipo |

## 3. Botones y potenciómetros 📷
Hay que hacer una foto del equipo (o descargarla del manual) y anotarla con un programa de dibujo (Paint, GIMP, Canva, draw.io), con una flecha y una etiqueta por elemento.

Lista previa, que debe confirmarse con el equipo real, porque la distribución cambia según el modelo:

| Elemento | Función |
|---|---|
| PTT | Pulsar para transmitir, soltar para recibir. |
| Tecla lateral (MONI) | Abre el squelch para escuchar señales débiles. Una pulsación larga puede encender la linterna. |
| Perilla de volumen / encendido | Enciende el equipo y regula el volumen del altavoz. |
| Perilla de canal (si la tiene) | Cambia de canal. |
| Teclado numérico | Introduce la frecuencia y los números de menú. |
| MENU / EXIT | Entra en el menú de parámetros / sale o retrocede. |
| ▲ ▼ | Navegan por menús, canales y frecuencias. |
| A/B | Cambia entre las dos líneas de pantalla (doble escucha). |
| VFO/MR | Alterna entre modo frecuencia y modo memoria (canales). |
| SCAN | Busca canales o frecuencias con actividad. |
| Antena y conector de accesorios | Antena SMA y conector para auricular y programación. |

## 4. Parámetros para comunicar entre 2 walkies
Los dos equipos deben tener exactamente los mismos valores. Rellenar la columna "Valor usado" en clase.

| Parámetro | Qué hace | Valor usado |
|---|---|---|
| Frecuencia RX/TX | Es la "habitación" donde se habla. Si difiere en un equipo, no se oyen. Usar una banda libre (por ejemplo PMR446: 446,00625-446,09375 MHz) o la autorizada en clase. | |
| Offset / dirección | Separa la frecuencia de TX de la de RX. Solo se usa con repetidores. Para comunicación directa (símplex) debe ir desactivado. | OFF |
| Ancho de banda (WN) | Banda ancha (25 kHz) o estrecha (12,5 kHz). Debe coincidir en ambos equipos. | |
| Potencia (TXP) | Alta o baja. A menor potencia, menos alcance y más autonomía. | |
| Squelch (SQL) | Umbral que silencia el ruido cuando no hay señal. Con un valor demasiado alto se pierden señales débiles. | |
| CTCSS/DCS (T-CTCS, R-CTCS, T-DCS, R-DCS) | Tono de subaudio: el equipo solo abre el audio si recibe su tono. Ver apartado 5. | |
| VOX | Transmite al detectar voz, sin pulsar PTT. Se ajusta su sensibilidad. | OFF |
| TOT | Temporizador que limita el tiempo de transmisión continua. | |
| Beep / tonos | Pitidos de teclas. No afectan a la comunicación. | |

## 5. Comunicación por grupos / privacidad
Esto no es cifrado: cualquiera con la misma frecuencia, aunque tenga otro tono, puede oír la conversación. El tono solo filtra lo que oye cada equipo.

1. Canal compartido: todos los equipos del grupo usan la misma frecuencia.
2. Tono CTCSS (38 tonos estándar, de 67,0 a 250,3 Hz) o código DCS. En el equipo: configurar T-CTCS (tono que se envía) y R-CTCS (tono que se exige para oír) con el mismo valor.
3. Cada grupo usa un tono distinto en la misma frecuencia y no oye a los demás.
4. Opcional: DTMF/ANI para llamadas selectivas, si el modelo lo soporta. ⚠️ Comprobar.

Implementación en clase 📷: documentar, para cada pareja, el tono elegido, los pasos de menú pulsados y una prueba de que con tonos distintos no se oyen. Hacer una foto de la pantalla.

## 6. Hoja de trabajo (para firma del profesor)
| Pareja | Frecuencia | Tono CTCSS/DCS | Potencia | Prueba de comunicación (OK / no) | Firma del profesor |
|---|---|---|---|---|---|
| | | | | | |

## 7. Entrega
- PDF con la plantilla de inicio de curso, subido al Moodle con la hoja de trabajo firmada.
- Cada punto sin explicar resta 1 punto. Cada día de retraso resta 0,5. Cierre: sábado 14/11/2026, 14:00.

## Pendiente
- [ ] Confirmar bandas, potencia baja y número de canales con el manual del equipo real.
- [ ] Foto del equipo con botones anotados.
- [ ] Probar los parámetros del apartado 4 y el grupo del apartado 5 con dos equipos.
- [ ] Hoja firmada y PDF final con la plantilla.
